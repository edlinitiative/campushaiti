# Universities Admin Page Audit Report
**Date:** November 24, 2025  
**Page URL:** https://campushaiti.vercel.app/admin/universities  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## 🔴 CRITICAL ISSUES

### 1. Missing API Routes for Edit/Delete Operations
**Severity:** HIGH  
**Impact:** Edit and Delete buttons are non-functional

**Problem:**
- UI calls `PUT /api/admin/universities/${id}` for editing
- UI calls `DELETE /api/admin/universities/${id}` for deleting
- These routes DO NOT EXIST in the codebase
- Comments in `/app/api/admin/universities/route.ts` indicate they should be in a separate `[id]/route.ts` file
- The `[id]/route.ts` file was never created

**Evidence:**
```typescript
// In page.tsx lines 201-211
const response = await fetch(`/api/admin/universities/${selectedUniversity.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});

// In route.ts lines 142-148
/**
 * PUT /api/admin/universities/:id
 * Update university (handled in separate [id]/route.ts if needed)
 */

/**
 * DELETE /api/admin/universities/:id
 * Delete university (handled in separate [id]/route.ts if needed)
 */
```

**Required Fix:**
Create `/app/api/admin/universities/[id]/route.ts` with PUT and DELETE handlers

---

### 2. Field Name Mismatches Between UI and Database
**Severity:** MEDIUM-HIGH  
**Impact:** Data not saved/displayed correctly

**Mismatches Found:**

| UI Form Field | Database Field | TypeScript Interface | Status |
|---------------|----------------|---------------------|--------|
| `contactEmail` | `email` | `contactEmail` | ❌ MISMATCH |
| `contactPhone` | `phone` | `contactPhone` | ❌ MISMATCH |
| `websiteUrl` | `website` | `websiteUrl` | ❌ MISMATCH |

**Evidence:**
```typescript
// POST route.ts line 111-121 - Database saves as:
await universityRef.set({
  email: contactEmail,      // ❌ Should be contactEmail
  phone: contactPhone,      // ❌ Should be contactPhone
  website: websiteUrl,      // ❌ Should be websiteUrl
});

// TypeScript interface (firestore.ts lines 76-91):
export interface University {
  contactEmail: string;     // ✅ Expects contactEmail
  contactPhone?: string;    // ✅ Expects contactPhone
  websiteUrl?: string;      // ✅ Expects websiteUrl
}

// UI displays (page.tsx lines 512-527):
<p>{university.contactEmail}</p>  // ❌ Will be undefined
<p>{university.contactPhone}</p>  // ❌ Will be undefined
<a href={university.websiteUrl}>  // ❌ Will be undefined
```

**Impact:**
- Contact email, phone, and website URL not displayed in UI after creation
- Editing will fail because fields won't be populated correctly
- Data exists in database but under wrong field names

---

### 3. Registration Approval Creates Universities with Wrong Field Names
**Severity:** HIGH  
**Impact:** Approved registrations create universities with incorrect schema

**Evidence:**
In `/app/api/admin/registrations/[id]/approve/route.ts` line 72:
```typescript
const universityRef = await db.collection("universities").add(universityData);
```

The `universityData` likely uses the registration's field names, which may not match the University schema.

---

## ⚠️ MODERATE ISSUES

### 4. Missing Firestore Index
**Severity:** MEDIUM  
**Impact:** Query will fail in production with large datasets

**Problem:**
```typescript
// route.ts line 37
const snapshot = await query.orderBy("createdAt", "desc").get();
```

If filtering by status is applied, this becomes a compound query requiring an index:
```typescript
query.where("status", "==", status).orderBy("createdAt", "desc")
```

**Required Index:**
```json
{
  "collectionGroup": "universities",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

---

### 5. Mock Data Still in Use
**Severity:** LOW-MEDIUM  
**Impact:** Confusing fallback behavior

**Evidence:**
```typescript
// page.tsx lines 44-72
const mockRegistrations = [
  { id: "1", name: "Université Quisqueya", ... },
  { id: "2", name: "Université Notre Dame d'Haïti", ... }
];

// page.tsx lines 105-109
} catch (err) {
  console.error("Error loading registrations:", err);
  setRegistrations(mockRegistrations);  // ❌ Falls back to mock data
}
```

**Issue:** If API fails, UI shows fake data without indicating it's mock data.

---

### 6. Inconsistent Required Field Validation
**Severity:** LOW-MEDIUM  
**Impact:** Can create universities with incomplete data

**UI Form Says Required:**
- University Name *
- URL Slug *
- Contact Email *

**API Validation (route.ts line 88):**
```typescript
if (!name || !slug || !city || !country || !contactEmail) {
```
- Also requires `city` and `country` (not marked as required in UI)

**TypeScript Interface:**
```typescript
export interface University {
  city: string;           // Required (not optional)
  country: string;        // Required (not optional)
  contactEmail: string;   // Required (not optional)
}
```

**Issue:** UI should mark `city` and `country` as required to match API validation.

---

## ℹ️ MINOR ISSUES

### 7. Translation Keys Not All Used
**Severity:** LOW  
**Impact:** Some text still hardcoded in English

**Hardcoded Text Found:**
- Line 208: "Please fill in all required fields"
- Line 219: "University updated successfully!"
- Line 222: "Failed to update university:"
- Line 227: "An error occurred while updating the university"
- Line 231: `Are you sure you want to delete ${university.name}?`
- Line 239: "University deleted successfully!"
- Line 242: "Failed to delete university:"
- Line 247: "An error occurred while deleting the university"
- Line 268: "Please select at least one registration to approve"
- Line 277: `${selectedForBulk.size} registration(s) approved successfully!`
- Line 281: "An error occurred during bulk approval"
- Line 570: "Update university information"
- Line 685: "Cancel"
- Line 688: "Update University"
- Line 554: "Approved universities appear in the "All Universities" tab"
- Line 562: "No rejected registrations"

---

### 8. Date Type Inconsistency
**Severity:** LOW  
**Impact:** Potential runtime errors

**TypeScript expects:**
```typescript
createdAt: Date;
updatedAt: Date;
approvedAt?: Date;
```

**API saves as:**
```typescript
createdAt: Date.now(),  // ❌ Returns number, not Date
updatedAt: Date.now(),  // ❌ Returns number, not Date
approvedAt: Date.now(), // ❌ Returns number, not Date
```

**Should be:**
```typescript
createdAt: new Date(),
updatedAt: new Date(),
approvedAt: new Date(),
```

Or update TypeScript interface to use `number` for timestamps.

---

### 9. Slug Auto-Generation Missing
**Severity:** LOW  
**Impact:** Users must manually create URL-safe slugs

**Current:** User must type slug manually (error-prone)

**Best Practice:** Auto-generate slug from university name:
```typescript
const generateSlug = (name: string) => 
  name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
```

---

## ✅ WORKING CORRECTLY

### 1. Authentication & Authorization
- ✅ Properly checks for ADMIN role
- ✅ Uses `getServerUser()` for verification
- ✅ Returns 401 for unauthorized access

### 2. Create University (POST)
- ✅ API route exists and works
- ✅ Validates required fields
- ✅ Checks for duplicate slugs
- ✅ Sets status to "APPROVED" automatically
- ❌ BUT: Field names don't match TypeScript interface

### 3. List Universities (GET)
- ✅ Fetches all universities
- ✅ Supports status filtering
- ✅ Supports search (client-side)
- ✅ Ordered by creation date

### 4. UI Components
- ✅ Tabs for different views work
- ✅ Create dialog form functional
- ✅ Edit dialog form functional (but API missing)
- ✅ Bulk selection works
- ✅ Responsive grid layout

---

## 📋 REQUIRED FIXES (Priority Order)

### CRITICAL - Do Immediately

1. **Create Missing API Routes**
   - File: `/app/api/admin/universities/[id]/route.ts`
   - Implement: PUT (update) and DELETE handlers
   - Ensure field name consistency

2. **Fix Field Name Mismatches**
   - Option A: Update API to use TypeScript interface field names
   - Option B: Update TypeScript interface to match database field names
   - **Recommendation:** Option A (use `contactEmail`, `contactPhone`, `websiteUrl`)

### HIGH - Do This Week

3. **Fix Registration Approval**
   - Audit `/app/api/admin/registrations/[id]/approve/route.ts`
   - Ensure it creates universities with correct field names

4. **Add Firestore Index**
   - Add compound index for `universities` collection
   - Fields: status (ASC) + createdAt (DESC)

### MEDIUM - Do Soon

5. **Remove or Properly Handle Mock Data**
   - Remove fallback to mock data
   - Show error state instead

6. **Mark Required Fields in UI**
   - Add asterisks to City and Country fields
   - Or make them optional in API validation

7. **Fix Date Type Consistency**
   - Use `new Date()` instead of `Date.now()`
   - Or change TypeScript interface to use `number`

### LOW - Nice to Have

8. **Add Missing Translations**
   - Extract all hardcoded English text
   - Add to `messages/en.json`

9. **Add Slug Auto-Generation**
   - Generate slug from university name
   - Allow manual override

10. **Add Form Validation**
    - Email format validation
    - URL format validation
    - Slug format validation (lowercase, no spaces)

---

## 🔧 CODE FIXES NEEDED

### Fix 1: Create `/app/api/admin/universities/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/universities/:id
 * Update an existing university
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, slug, city, country, contactEmail, contactPhone, websiteUrl, description } = body;

    // Validate required fields
    if (!name || !slug || !city || !country || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current university)
    const existingUniversity = await db.collection("universities")
      .where("slug", "==", slug)
      .limit(2)
      .get();

    const duplicateSlug = existingUniversity.docs.find(doc => doc.id !== id);
    if (duplicateSlug) {
      return NextResponse.json(
        { error: "A university with this slug already exists" },
        { status: 400 }
      );
    }

    // Update university document
    await db.collection("universities").doc(id).update({
      name,
      slug,
      city,
      country,
      contactEmail,      // ✅ Fixed field name
      contactPhone: contactPhone || "",  // ✅ Fixed field name
      websiteUrl: websiteUrl || "",      // ✅ Fixed field name
      description: description || "",
      updatedAt: new Date(),  // ✅ Fixed to use Date object
    });

    return NextResponse.json({
      success: true,
      message: "University updated successfully",
    });
  } catch (error) {
    console.error("Error updating university:", error);
    return NextResponse.json(
      { error: "Failed to update university" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/universities/:id
 * Delete a university
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if university has programs
    const programsSnapshot = await db.collection("programs")
      .where("universityId", "==", id)
      .limit(1)
      .get();

    if (!programsSnapshot.empty) {
      return NextResponse.json(
        { error: "Cannot delete university with existing programs. Delete programs first." },
        { status: 400 }
      );
    }

    // Delete university
    await db.collection("universities").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "University deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting university:", error);
    return NextResponse.json(
      { error: "Failed to delete university" },
      { status: 500 }
    );
  }
}
```

### Fix 2: Update POST Route Field Names

In `/app/api/admin/universities/route.ts` line 110-125:

```typescript
await universityRef.set({
  name,
  slug,
  city,
  country,
  contactEmail,              // ✅ Changed from email
  contactPhone: contactPhone || "",  // ✅ Changed from phone
  websiteUrl: websiteUrl || "",      // ✅ Changed from website
  description: description || "",
  status: "APPROVED",
  adminUids: [],
  createdAt: new Date(),     // ✅ Changed from Date.now()
  updatedAt: new Date(),     // ✅ Changed from Date.now()
  approvedAt: new Date(),    // ✅ Changed from Date.now()
  approvedBy: user.uid,
});
```

### Fix 3: Add Firestore Index

In `/firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "universities",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

### Fix 4: Update UI Required Field Markers

In `/app/[locale]/admin/universities/page.tsx` lines 607-618:

```tsx
<div className="space-y-2">
  <Label htmlFor="city">{t("city")} *</Label>  {/* ✅ Add asterisk */}
  <Input
    id="city"
    value={formData.city}
    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
    placeholder={t("cityPlaceholder")}
  />
</div>
<div className="space-y-2">
  <Label htmlFor="country">{t("country")} *</Label>  {/* ✅ Add asterisk */}
  <Input
    id="country"
    value={formData.country}
    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
    placeholder="Haiti"
  />
</div>
```

---

## 📊 SUMMARY

| Category | Count |
|----------|-------|
| Critical Issues | 3 |
| Moderate Issues | 3 |
| Minor Issues | 3 |
| Working Correctly | 4 |
| **Total Issues** | **9** |

**Overall Status:** ⚠️ **NOT PRODUCTION READY**

**Blocking Issues:**
1. Edit and Delete functionality completely broken (missing API routes)
2. Data saved to database with wrong field names
3. UI cannot display contact information correctly

**Recommended Action:**
1. Implement the missing API routes IMMEDIATELY
2. Fix field name mismatches in all APIs
3. Test full create → edit → delete flow
4. Deploy Firestore index
5. Remove mock data fallback

**Estimated Fix Time:** 2-3 hours for critical issues
