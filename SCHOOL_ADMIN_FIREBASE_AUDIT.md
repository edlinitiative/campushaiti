# School Admin Section - Firebase Connection Audit

**Audit Date:** November 23, 2025  
**Scope:** All school admin dashboard pages and their Firebase/Firestore connectivity  
**Status:** ⚠️ CRITICAL ISSUES FOUND - 3 pages not connected to Firebase

---

## 🎯 Executive Summary

**Overall Status: 40% Connected**

- ✅ **2 sections fully connected** to Firestore
- ⚠️ **1 section partially connected** (half working)
- ❌ **3 sections NOT connected** (demo mode only)

**Critical Finding:** Most school admin forms are not saving to Firebase. School administrators think they're managing their data, but changes are lost on page refresh.

---

## 📊 Detailed Findings

### ✅ 1. Dashboard Statistics (`/schools/dashboard/page.tsx`)

**Status:** FULLY CONNECTED ✅

**API Endpoint:** `GET /api/schools/stats`  
**Database Collections Used:**
- `universities` - Filtered by `adminUids`
- `programs` - Filtered by `universityId`
- `applicationItems` - Filtered by `universityId`

**Data Flow:**
```typescript
Frontend: /schools/dashboard/page.tsx
  → fetch('/api/schools/stats')
    → Backend: /api/schools/stats/route.ts
      → Firestore: universities, programs, applicationItems collections
        → Returns: { applications, newApplications, accepted, rejected, pending, programs }
```

**Fallback:** Falls back to demo data if user not authenticated (expected behavior)

**Issues:** None ✅

---

### ✅ 2. Applications Management (`/schools/dashboard/applications/page.tsx`)

**Status:** FULLY CONNECTED ✅

**API Endpoints:**
- `GET /api/schools/applications` - List applications
- `GET /api/schools/applications/[id]` - Get single application
- `PUT /api/schools/applications/[id]` - Update application status

**Database Collection:** `applicationItems`

**Data Flow:**
```typescript
// List applications
Frontend: loadApplications()
  → fetch('/api/schools/applications?status=SUBMITTED')
    → Backend: /api/schools/applications/route.ts
      → Firestore: applicationItems.where("universityId", "in", universityIds)
        → Returns transformed applications

// Update status
Frontend: handleBulkStatusUpdate()
  → fetch(`/api/schools/applications/${id}`, { method: 'PUT', body: { status } })
    → Backend: /api/schools/applications/[id]/route.ts
      → Firestore: applicationItems.doc(id).update({ status })
```

**Features Working:**
- ✅ Load applications by status
- ✅ Filter by program/date
- ✅ Search by name/email
- ✅ Bulk status updates
- ✅ Individual status changes
- ✅ View application details

**Issues:** None ✅

---

### ⚠️ 3. Programs Management (`/schools/dashboard/programs/`)

**Status:** PARTIALLY CONNECTED ⚠️

**What Works:**
- ✅ Create new program (`/programs/new/page.tsx`)
  - Uses `POST /api/schools/programs`
  - Saves to Firestore `programs` collection
  - Properly associates with university

**What Doesn't Work:**
- ❌ **Main programs page** (`/programs/page.tsx`) - **NOT CONNECTED**
  - Shows hardcoded demo data only
  - NO API calls to load programs
  - Edit/delete buttons don't work
  - Changes not saved to database

**Code Evidence:**
```typescript
// File: app/[locale]/schools/dashboard/programs/page.tsx
const loadPrograms = async () => {
  try {
    // TODO: Fetch programs from API
    // For now, using comprehensive demo data
    setDemoMode(true); // ❌ Always in demo mode
    const demoPrograms = getAllDemoPrograms();
    setPrograms(demoPrograms.map(p => ({ ... })));
  }
}
```

**Required Fix:**
```typescript
const loadPrograms = async () => {
  try {
    const response = await fetch('/api/schools/programs');
    if (response.ok) {
      const data = await response.json();
      setPrograms(data.programs);
      setDemoMode(false);
    } else {
      // Fallback to demo
      setDemoMode(true);
      setPrograms(getAllDemoPrograms());
    }
  } catch (err) {
    console.error(err);
    setDemoMode(true);
  }
}
```

**Missing API Routes:**
- ❌ `GET /api/schools/programs` - List programs for school
- ❌ `PUT /api/schools/programs/[id]` - Update program
- ❌ `DELETE /api/schools/programs/[id]` - Delete program

---

### ❌ 4. Settings Page (`/schools/dashboard/settings/page.tsx`)

**Status:** NOT CONNECTED ❌

**Critical Issue:** Settings page has NO Firebase integration despite API endpoint existing.

**API Endpoint Available:** `PUT /api/schools/settings` (exists but unused)  
**Database Collection:** `universities`

**Current Code (Broken):**
```typescript
// File: app/[locale]/schools/dashboard/settings/page.tsx
const [demoMode] = useState(true); // ❌ Permanent demo mode

const handleSaveUniversity = async () => {
  setSaving(true);
  try {
    // ❌ Mock save - does nothing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess("University information updated successfully");
  } finally {
    setSaving(false);
  }
};

const handleSaveBankAccount = async () => {
  setSaving(true);
  try {
    // ❌ Mock save - does nothing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess("Bank account information saved");
  } finally {
    setSaving(false);
  }
};
```

**What's Missing:**
1. ❌ Load university data from Firestore on page load
2. ❌ Save university info to Firestore
3. ❌ Save bank account to Firestore
4. ❌ Connect to existing `/api/schools/settings` endpoint

**Required Implementation:**
```typescript
// Load university data
useEffect(() => {
  const loadUniversity = async () => {
    try {
      const response = await fetch('/api/schools/university');
      if (response.ok) {
        const data = await response.json();
        setUniversityInfo(data.university);
        setBankAccount(data.university.bankAccount || {});
        setDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setDemoMode(true);
    }
  };
  loadUniversity();
}, []);

// Save university data
const handleSaveUniversity = async () => {
  setSaving(true);
  try {
    const response = await fetch('/api/schools/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        universityId: university.id,
        ...universityInfo
      })
    });
    
    if (response.ok) {
      setSuccess("Settings saved successfully");
    } else {
      throw new Error("Failed to save");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to save settings");
  } finally {
    setSaving(false);
  }
};
```

**Missing API Routes:**
- ❌ `GET /api/schools/university` - Get school's university data

---

### ❌ 5. Custom Questions (`/schools/dashboard/questions/page.tsx`)

**Status:** NOT CONNECTED ❌

**Critical Issue:** Questions page stores everything in local state only. No persistence.

**API Endpoint Available:** 
- `GET /api/schools/questions/[programId]` (exists but unused)
- `POST /api/schools/questions/[programId]` (exists but unused)

**Database Storage:** `programs.customQuestions` field

**Current Code (Broken):**
```typescript
// File: app/[locale]/schools/dashboard/questions/page.tsx
const [demoMode] = useState(true); // ❌ Permanent demo mode
const [questions, setQuestions] = useState<CustomQuestion[]>([
  // ❌ Hardcoded demo questions
  { id: "1", question: "Why do you want to study...", ... },
  { id: "2", question: "Do you have previous work...", ... },
]);

const handleSaveQuestion = () => {
  // ❌ Only updates local state
  if (editingQuestion) {
    setQuestions(questions.map(q => q.id === editingQuestion.id ? newQuestion : q));
  } else {
    setQuestions([...questions, newQuestion]);
  }
  setShowDialog(false);
  // ❌ NO API call - changes lost on refresh
};
```

**Required Implementation:**
```typescript
// Load questions for program
useEffect(() => {
  const loadQuestions = async () => {
    if (!selectedProgramId) return;
    
    try {
      const response = await fetch(`/api/schools/questions/${selectedProgramId}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setDemoMode(true);
    }
  };
  loadQuestions();
}, [selectedProgramId]);

// Save questions
const handleSaveQuestion = async () => {
  try {
    const response = await fetch(`/api/schools/questions/${selectedProgramId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions: editingQuestion 
          ? questions.map(q => q.id === editingQuestion.id ? newQuestion : q)
          : [...questions, newQuestion]
      })
    });
    
    if (response.ok) {
      loadQuestions(); // Reload from server
    }
  } catch (err) {
    console.error(err);
    alert("Failed to save question");
  }
};
```

**Additional Issues:**
- ❌ No program selector - unclear which program questions belong to
- ❌ No way to associate questions with programs
- ❌ UI shows questions but doesn't load them from API

---

### ❌ 6. Team Management (`/schools/dashboard/team/page.tsx`)

**Status:** NOT CONNECTED ❌

**Quick Check:**
```bash
grep -n "fetch" app/[locale]/schools/dashboard/team/page.tsx
```
Result: No API calls found

**Status:** Demo mode only, no Firebase integration.

---

## 🔧 Required Fixes - Priority Order

### 🔴 CRITICAL (Must Fix Immediately)

#### 1. Fix Settings Page
**Impact:** HIGH - School admins can't update their profile  
**Effort:** MEDIUM

**Files to Modify:**
- `app/[locale]/schools/dashboard/settings/page.tsx`

**Required Changes:**
1. Create `GET /api/schools/university` endpoint to load data
2. Implement `loadUniversity()` function on page load
3. Connect `handleSaveUniversity()` to `PUT /api/schools/settings`
4. Connect `handleSaveBankAccount()` to `PUT /api/schools/settings`
5. Remove hardcoded demo mode

**API Routes Needed:**
```typescript
// GET /api/schools/university
export async function GET(request: NextRequest) {
  // Get university where user is admin
  // Return university data including bankAccount
}
```

---

#### 2. Fix Custom Questions Page
**Impact:** HIGH - Schools can't customize application forms  
**Effort:** MEDIUM

**Files to Modify:**
- `app/[locale]/schools/dashboard/questions/page.tsx`

**Required Changes:**
1. Add program selector dropdown
2. Load questions on program selection
3. Connect to existing API endpoints
4. Implement proper save/update/delete

---

#### 3. Complete Programs Management
**Impact:** MEDIUM - Schools can't edit/delete programs  
**Effort:** MEDIUM

**Files to Modify:**
- `app/[locale]/schools/dashboard/programs/page.tsx`

**Required Changes:**
1. Implement `loadPrograms()` with API call
2. Create missing API routes:
   - `GET /api/schools/programs` - List programs
   - `PUT /api/schools/programs/[id]` - Update program
   - `DELETE /api/schools/programs/[id]` - Delete program
3. Connect edit/delete functionality

**API Routes Needed:**
```typescript
// GET /api/schools/programs
export async function GET(request: NextRequest) {
  // Get programs for user's university
  // Return array of programs
}

// PUT /api/schools/programs/[id]
export async function PUT(request: NextRequest, { params }) {
  // Update program
  // Return success
}

// DELETE /api/schools/programs/[id]
export async function DELETE(request: NextRequest, { params }) {
  // Delete program (soft delete recommended)
  // Return success
}
```

---

### 🟡 MEDIUM PRIORITY

#### 4. Team Management Integration
**Impact:** LOW - Feature not heavily used yet  
**Effort:** HIGH (requires user management system)

**Defer until user demand increases**

---

## 📋 Testing Checklist

After fixes are implemented, verify:

### Settings Page:
- [ ] Page loads university data from Firestore
- [ ] University name changes are saved
- [ ] Contact information updates persist
- [ ] Bank account information saves correctly
- [ ] Changes visible after page refresh
- [ ] Error handling for failed saves

### Custom Questions:
- [ ] Program selector shows all programs
- [ ] Questions load when program selected
- [ ] New questions save to database
- [ ] Questions persist after refresh
- [ ] Edit existing questions works
- [ ] Delete questions works
- [ ] Question order can be changed

### Programs Management:
- [ ] Programs list loads from database
- [ ] Shows only this school's programs
- [ ] Edit program updates in database
- [ ] Delete program works (soft delete)
- [ ] Changes persist after refresh
- [ ] Can filter/search programs

---

## 🗂️ Files Requiring Changes

### Frontend Files (3):
1. `app/[locale]/schools/dashboard/settings/page.tsx` - Add Firebase integration
2. `app/[locale]/schools/dashboard/questions/page.tsx` - Add Firebase integration  
3. `app/[locale]/schools/dashboard/programs/page.tsx` - Add API calls

### Backend Files (4 new routes needed):
1. `app/api/schools/university/route.ts` - GET university for school admin (NEW)
2. `app/api/schools/programs/route.ts` - Add GET method (modify existing)
3. `app/api/schools/programs/[id]/route.ts` - PUT and DELETE methods (NEW)
4. Review `app/api/schools/settings/route.ts` - Verify it handles all fields

---

## 📊 Statistics

**Total Pages Audited:** 6  
**Fully Connected:** 2 (33%)  
**Partially Connected:** 1 (17%)  
**Not Connected:** 3 (50%)

**Total API Routes:**
- Existing & Working: 5
- Existing but Unused: 2
- Missing: 4

**Lines of Code to Fix:** ~300-400 lines estimated

---

## 🎯 Recommendation

**Immediate Action Required:** Fix items 1-3 in CRITICAL priority.

School administrators currently cannot:
- Update their university profile ❌
- Manage custom application questions ❌
- Edit or delete programs ❌

This severely limits the platform's usability for school admins. These features should be implemented before onboarding any real schools.

**Estimated Time to Fix All Critical Issues:** 6-8 hours

---

## ✅ What's Working Well

- Dashboard statistics loading correctly
- Applications management fully functional
- Proper authentication and authorization
- Good error handling and fallbacks to demo mode
- Create new programs works perfectly
- All API endpoints use proper Firebase Admin SDK
- Security rules properly implemented
