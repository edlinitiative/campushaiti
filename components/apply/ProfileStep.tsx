"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getWordCount } from "@/lib/validation";

interface ProfileStepProps {
  onNext: () => void;
}

export default function ProfileStep({ onNext }: ProfileStepProps) {
  const t = useTranslations("apply.profile");
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("personal");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    whatsapp: "",
    email: "",
    nationality: "Haitian",
    birthDate: "",
    birthPlace: "",
    idNumber: "",
    
    // Address Information
    address: "",
    city: "",
    department: "",
    country: "Haiti",
    
    // Parent/Guardian Information
    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelationship: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    
    // Education Background
    lastSchoolName: "",
    lastSchoolCity: "",
    graduationYear: "",
    diplomaType: "",
    fieldOfStudy: "",
    gpa: "",
    hasBaccalaureat: "",
    baccalaureatSeries: "",
    
    // Personal Statement
    personalStatement: "",
    careerGoals: "",
    whyThisUniversity: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setFormData({
            // Personal Information
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            gender: data.gender || "",
            phone: data.phone || "",
            whatsapp: data.whatsapp || "",
            email: user.email || "",
            nationality: data.nationality || "Haitian",
            birthDate: data.birthDate?.toDate?.()?.toISOString().split("T")[0] || "",
            birthPlace: data.birthPlace || "",
            idNumber: data.idNumber || "",
            
            // Address
            address: data.address || "",
            city: data.city || "",
            department: data.department || "",
            country: data.country || "Haiti",
            
            // Parents/Guardian
            fatherName: data.fatherName || "",
            fatherPhone: data.fatherPhone || "",
            fatherOccupation: data.fatherOccupation || "",
            motherName: data.motherName || "",
            motherPhone: data.motherPhone || "",
            motherOccupation: data.motherOccupation || "",
            guardianName: data.guardianName || "",
            guardianPhone: data.guardianPhone || "",
            guardianRelationship: data.guardianRelationship || "",
            
            // Emergency
            emergencyName: data.emergencyName || "",
            emergencyPhone: data.emergencyPhone || "",
            emergencyRelationship: data.emergencyRelationship || "",
            
            // Education
            lastSchoolName: data.education?.schoolName || "",
            lastSchoolCity: data.education?.city || "",
            graduationYear: data.education?.graduationYear || "",
            diplomaType: data.education?.diplomaType || "",
            fieldOfStudy: data.education?.fieldOfStudy || "",
            gpa: data.education?.gpa || "",
            hasBaccalaureat: data.education?.hasBaccalaureat || "",
            baccalaureatSeries: data.education?.baccalaureatSeries || "",
            
            // Essays
            personalStatement: data.essays?.personalStatement || "",
            careerGoals: data.essays?.careerGoals || "",
            whyThisUniversity: data.essays?.whyThisUniversity || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Validate all fields before submission
    const validation = await import("@/lib/validation");
    const result = validation.validateProfileForm(formData);
    
    if (!result.valid) {
      setErrors(result.errors);
      // Scroll to first error or switch to tab with errors
      const errorTabs = {
        firstName: "personal",
        lastName: "personal",
        gender: "personal",
        birthDate: "personal",
        birthPlace: "personal",
        phone: "personal",
        whatsapp: "personal",
        email: "personal",
        nationality: "personal",
        address: "address",
        city: "address",
        department: "address",
        country: "address",
        emergencyName: "family",
        emergencyPhone: "family",
        emergencyRelationship: "family",
        lastSchoolName: "education",
        lastSchoolCity: "education",
        graduationYear: "education",
        diplomaType: "education",
        fieldOfStudy: "education",
        gpa: "education",
        baccalaureatSeries: "education",
        personalStatement: "essays",
        careerGoals: "essays",
        whyThisUniversity: "essays",
      };
      
      // Switch to first tab with errors
      const firstError = Object.keys(result.errors)[0];
      if (firstError && errorTabs[firstError as keyof typeof errorTabs]) {
        setCurrentTab(errorTabs[firstError as keyof typeof errorTabs]);
      }
      
      alert("Please correct the errors in the form before submitting.");
      return;
    }
    
    // Clear any previous errors
    setErrors({});

    setLoading(true);
    try {
      // Save comprehensive profile
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          uid: user.uid,
          // Personal
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          nationality: formData.nationality,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
          birthPlace: formData.birthPlace,
          idNumber: formData.idNumber,
          
          // Address
          address: formData.address,
          city: formData.city,
          department: formData.department,
          country: formData.country,
          
          // Parents/Guardian
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          fatherOccupation: formData.fatherOccupation,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          motherOccupation: formData.motherOccupation,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianRelationship: formData.guardianRelationship,
          
          // Emergency
          emergencyName: formData.emergencyName,
          emergencyPhone: formData.emergencyPhone,
          emergencyRelationship: formData.emergencyRelationship,
          
          // Education
          education: {
            schoolName: formData.lastSchoolName,
            city: formData.lastSchoolCity,
            graduationYear: formData.graduationYear,
            diplomaType: formData.diplomaType,
            fieldOfStudy: formData.fieldOfStudy,
            gpa: formData.gpa,
            hasBaccalaureat: formData.hasBaccalaureat,
            baccalaureatSeries: formData.baccalaureatSeries,
          },
          
          // Essays
          essays: {
            personalStatement: formData.personalStatement,
            careerGoals: formData.careerGoals,
            whyThisUniversity: formData.whyThisUniversity,
          },
          
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Update user name
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          name: `${formData.firstName} ${formData.lastName}`.trim() || user.email,
          role: "APPLICANT",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const haitianDepartments = [
    "Artibonite", "Centre", "Grand'Anse", "Nippes", "Nord", 
    "Nord-Est", "Nord-Ouest", "Ouest", "Sud", "Sud-Est"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
        <CardDescription>
          Complete your profile information. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="essays">Essays</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Baptiste"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender *
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Place of Birth *
                  </label>
                  <Input
                    required
                    value={formData.birthPlace}
                    onChange={(e) => handleChange("birthPlace", e.target.value)}
                    placeholder="Port-au-Prince"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Number
                  </label>
                  <Input
                    value={formData.idNumber}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                    placeholder="National ID or Passport"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+509 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    WhatsApp Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="+509 1234 5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="student@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nationality *
                  </label>
                  <Input
                    required
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    placeholder="Haitian"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Address Information Tab */}
            <TabsContent value="address" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country *
                </label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haiti">Haiti</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Street Address *
                </label>
                <Input
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Rue de la République"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City *
                  </label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Port-au-Prince"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.country === "Haiti" ? "Department *" : "State/Province/Region *"}
                  </label>
                  {formData.country === "Haiti" ? (
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {haitianDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      required
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      placeholder={
                        formData.country === "United States" ? "e.g., New York" :
                        formData.country === "Canada" ? "e.g., Ontario" :
                        formData.country === "France" ? "e.g., Île-de-France" :
                        "Enter state/province/region"
                      }
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Family Information Tab */}
            <TabsContent value="family" className="space-y-4 mt-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Father Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Father&apos;s Full Name
                    </label>
                    <Input
                      value={formData.fatherName}
                      onChange={(e) => handleChange("fatherName", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.fatherPhone}
                        onChange={(e) => handleChange("fatherPhone", e.target.value)}
                        placeholder="+509 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Occupation
                      </label>
                      <Input
                        value={formData.fatherOccupation}
                        onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                        placeholder="Engineer, Teacher, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Mother Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mother&apos;s Full Name
                    </label>
                    <Input
                      value={formData.motherName}
                      onChange={(e) => handleChange("motherName", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.motherPhone}
                        onChange={(e) => handleChange("motherPhone", e.target.value)}
                        placeholder="+509 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Occupation
                      </label>
                      <Input
                        value={formData.motherOccupation}
                        onChange={(e) => handleChange("motherOccupation", e.target.value)}
                        placeholder="Nurse, Accountant, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Guardian Information (if applicable)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Guardian&apos;s Full Name
                    </label>
                    <Input
                      value={formData.guardianName}
                      onChange={(e) => handleChange("guardianName", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.guardianPhone}
                        onChange={(e) => handleChange("guardianPhone", e.target.value)}
                        placeholder="+509 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Relationship
                      </label>
                      <Input
                        value={formData.guardianRelationship}
                        onChange={(e) => handleChange("guardianRelationship", e.target.value)}
                        placeholder="Uncle, Aunt, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Emergency Contact *</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contact Name *
                    </label>
                    <Input
                      required
                      value={formData.emergencyName}
                      onChange={(e) => handleChange("emergencyName", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        required
                        value={formData.emergencyPhone}
                        onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                        placeholder="+509 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Relationship *
                      </label>
                      <Input
                        required
                        value={formData.emergencyRelationship}
                        onChange={(e) => handleChange("emergencyRelationship", e.target.value)}
                        placeholder="Parent, Sibling, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Education Background Tab */}
            <TabsContent value="education" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last School Name *
                  </label>
                  <Input
                    required
                    value={formData.lastSchoolName}
                    onChange={(e) => handleChange("lastSchoolName", e.target.value)}
                    placeholder="Lycée Alexandre Pétion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    School City *
                  </label>
                  <Input
                    required
                    value={formData.lastSchoolCity}
                    onChange={(e) => handleChange("lastSchoolCity", e.target.value)}
                    placeholder="Port-au-Prince"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Graduation Year *
                  </label>
                  <Input
                    required
                    value={formData.graduationYear}
                    onChange={(e) => handleChange("graduationYear", e.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Diploma Type *
                  </label>
                  <Select
                    value={formData.diplomaType}
                    onValueChange={(value) => handleChange("diplomaType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diploma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bacc1">Baccalauréat I</SelectItem>
                      <SelectItem value="bacc2">Baccalauréat II</SelectItem>
                      <SelectItem value="philo">Philo</SelectItem>
                      <SelectItem value="rheto">Rhéto</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Field of Study *
                  </label>
                  <Input
                    required
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                    placeholder="Sciences, Letters, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    GPA / Average
                  </label>
                  <Input
                    value={formData.gpa}
                    onChange={(e) => handleChange("gpa", e.target.value)}
                    placeholder="85%, 3.5, etc."
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-3">Baccalauréat Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasBacc"
                      checked={formData.hasBaccalaureat === "yes"}
                      onChange={(e) =>
                        handleChange("hasBaccalaureat", e.target.checked ? "yes" : "no")
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="hasBacc" className="text-sm font-medium">
                      I have obtained my Baccalauréat
                    </label>
                  </div>

                  {formData.hasBaccalaureat === "yes" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Baccalauréat Series *
                      </label>
                      <Select
                        value={formData.baccalaureatSeries}
                        onValueChange={(value) =>
                          handleChange("baccalaureatSeries", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select series" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Series A (Letters)</SelectItem>
                          <SelectItem value="B">Series B (Economics)</SelectItem>
                          <SelectItem value="C">Series C (Sciences)</SelectItem>
                          <SelectItem value="D">Series D (Applied Sciences)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Personal Essays Tab */}
            <TabsContent value="essays" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Personal Statement *
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  Tell us about yourself, your background, and what makes you unique. (300-500 words)
                </p>
                <Textarea
                  required
                  value={formData.personalStatement}
                  onChange={(e) => handleChange("personalStatement", e.target.value)}
                  rows={6}
                  placeholder="Share your story, experiences, and what has shaped who you are today..."
                  className={errors.personalStatement ? "border-red-500" : ""}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.personalStatement && (
                    <p className="text-sm text-red-500">{errors.personalStatement}</p>
                  )}
                  <p className={`text-sm ml-auto ${
                    getWordCount(formData.personalStatement) < 300 || getWordCount(formData.personalStatement) > 500
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}>
                    {getWordCount(formData.personalStatement)} / 300-500 words
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Career Goals *
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  Describe your career aspirations and how this university education will help you achieve them. (200-300 words)
                </p>
                <Textarea
                  required
                  value={formData.careerGoals}
                  onChange={(e) => handleChange("careerGoals", e.target.value)}
                  rows={5}
                  placeholder="What are your professional goals? How will this degree help you achieve them?"
                  className={errors.careerGoals ? "border-red-500" : ""}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.careerGoals && (
                    <p className="text-sm text-red-500">{errors.careerGoals}</p>
                  )}
                  <p className={`text-sm ml-auto ${
                    getWordCount(formData.careerGoals) < 200 || getWordCount(formData.careerGoals) > 300
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}>
                    {getWordCount(formData.careerGoals)} / 200-300 words
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Why This University? *
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  Explain why you chose this university and how it aligns with your academic and career objectives. (200-300 words)
                </p>
                <Textarea
                  required
                  value={formData.whyThisUniversity}
                  onChange={(e) => handleChange("whyThisUniversity", e.target.value)}
                  rows={5}
                  placeholder="What attracted you to this university? What specific programs, opportunities, or values align with your goals?"
                  className={errors.whyThisUniversity ? "border-red-500" : ""}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.whyThisUniversity && (
                    <p className="text-sm text-red-500">{errors.whyThisUniversity}</p>
                  )}
                  <p className={`text-sm ml-auto ${
                    getWordCount(formData.whyThisUniversity) < 200 || getWordCount(formData.whyThisUniversity) > 300
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}>
                    {getWordCount(formData.whyThisUniversity)} / 200-300 words
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {Object.keys(errors).length > 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                Please correct the errors above before continuing. Check all required fields and essay word counts.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between mt-6">
            {currentTab !== "personal" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["personal", "address", "family", "education", "essays"];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
            {currentTab === "personal" && <div />}
            
            {currentTab !== "essays" ? (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ["personal", "address", "family", "education", "essays"];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save & Continue"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
