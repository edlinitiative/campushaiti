"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
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
        // Fetch user profile and application profile data from API
        const response = await fetch(`/api/user/profile?userId=${user.uid}`);
        if (!response.ok) {
          console.warn("Could not fetch profile:", response.statusText);
          return;
        }

        const data = await response.json();
        const userProfile = data.user || {};
        const appProfile = data.profile || {};

        // Split fullName into firstName and lastName if available
        const fullName = userProfile.fullName || user.displayName || "";
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Convert birthDate timestamp to ISO string if exists
        let birthDateStr = "";
        if (appProfile.birthDate) {
          try {
            const birthDate = new Date(appProfile.birthDate);
            birthDateStr = birthDate.toISOString().split("T")[0];
          } catch (err) {
            console.warn("Could not parse birthDate:", err);
          }
        }

        setFormData({
          // Personal Information - pre-fill from user profile where available
          firstName: appProfile.firstName || firstName,
          lastName: appProfile.lastName || lastName,
          gender: appProfile.gender || "",
          phone: appProfile.phone || userProfile.phoneNumber || "",
          whatsapp: appProfile.whatsapp || userProfile.phoneNumber || "",
          email: appProfile.email || userProfile.email || user.email || "",
          nationality: appProfile.nationality || "Haitian",
          birthDate: birthDateStr,
          birthPlace: appProfile.birthPlace || "",
          idNumber: appProfile.idNumber || "",
          
          // Address
          address: appProfile.address || "",
          city: appProfile.city || "",
          department: appProfile.department || "",
          country: appProfile.country || "Haiti",
          
          // Parents/Guardian
          fatherName: appProfile.fatherName || "",
          fatherPhone: appProfile.fatherPhone || "",
          fatherOccupation: appProfile.fatherOccupation || "",
          motherName: appProfile.motherName || "",
          motherPhone: appProfile.motherPhone || "",
          motherOccupation: appProfile.motherOccupation || "",
          guardianName: appProfile.guardianName || "",
          guardianPhone: appProfile.guardianPhone || "",
          guardianRelationship: appProfile.guardianRelationship || "",
          
          // Emergency
          emergencyName: appProfile.emergencyName || "",
          emergencyPhone: appProfile.emergencyPhone || "",
          emergencyRelationship: appProfile.emergencyRelationship || "",
          
          // Education
          lastSchoolName: appProfile.education?.schoolName || "",
          lastSchoolCity: appProfile.education?.city || "",
          graduationYear: appProfile.education?.graduationYear || "",
          diplomaType: appProfile.education?.diplomaType || "",
          fieldOfStudy: appProfile.education?.fieldOfStudy || "",
          gpa: appProfile.education?.gpa || "",
          hasBaccalaureat: appProfile.education?.hasBaccalaureat || "",
          baccalaureatSeries: appProfile.education?.baccalaureatSeries || "",
          
          // Essays
          personalStatement: appProfile.essays?.personalStatement || "",
          careerGoals: appProfile.essays?.careerGoals || "",
          whyThisUniversity: appProfile.essays?.whyThisUniversity || "",
        });
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
      // Prepare profile data for API
      const profileData = {
        uid: user.uid,
        // Personal
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: user.email,
        nationality: formData.nationality,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
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
        
        // User data for users collection
        name: `${formData.firstName} ${formData.lastName}`.trim() || user.email,
        role: "APPLICANT",
      };

      // Save profile using API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile");
      }

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
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">{t("tabPersonal")}</TabsTrigger>
              <TabsTrigger value="address">{t("tabAddress")}</TabsTrigger>
              <TabsTrigger value="family">{t("tabFamily")}</TabsTrigger>
              <TabsTrigger value="education">{t("tabEducation")}</TabsTrigger>
              <TabsTrigger value="essays">{t("tabEssays")}</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("firstName")} *
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
                    {t("lastName")} *
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
                    {t("gender")} *
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("male")}</SelectItem>
                      <SelectItem value="female">{t("female")}</SelectItem>
                      <SelectItem value="other">{t("other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("dateOfBirth")} *
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
                    {t("placeOfBirth")} *
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
                    {t("idNumber")}
                  </label>
                  <Input
                    value={formData.idNumber}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                    placeholder={t("idNumberPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("phoneNumber")} *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder={t("phoneNumberPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("whatsappNumber")}
                  </label>
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder={t("phoneNumberPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("email")} *
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
                    {t("nationality")} *
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
                  {t("country")} *
                </label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCountry")} />
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
                  {t("streetAddress")} *
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
                    {t("city")} *
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
                    {formData.country === "Haiti" ? t("department") + " *" : t("stateProvinceRegion") + " *"}
                  </label>
                  {formData.country === "Haiti" ? (
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectDepartment")} />
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
                <h3 className="font-semibold mb-3">{t("fatherInfo")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("fullName")}
                    </label>
                    <Input
                      value={formData.fatherName}
                      onChange={(e) => handleChange("fatherName", e.target.value)}
                      placeholder={t("fullNamePlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("phoneNumber")}
                      </label>
                      <Input
                        type="tel"
                        value={formData.fatherPhone}
                        onChange={(e) => handleChange("fatherPhone", e.target.value)}
                        placeholder={t("phoneNumberPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("occupation")}
                      </label>
                      <Input
                        value={formData.fatherOccupation}
                        onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                        placeholder={t("occupationPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">{t("motherInfo")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("fullName")}
                    </label>
                    <Input
                      value={formData.motherName}
                      onChange={(e) => handleChange("motherName", e.target.value)}
                      placeholder={t("fullNamePlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("phoneNumber")}
                      </label>
                      <Input
                        type="tel"
                        value={formData.motherPhone}
                        onChange={(e) => handleChange("motherPhone", e.target.value)}
                        placeholder={t("phoneNumberPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("occupation")}
                      </label>
                      <Input
                        value={formData.motherOccupation}
                        onChange={(e) => handleChange("motherOccupation", e.target.value)}
                        placeholder={t("occupationPlaceholderMother")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">{t("guardianInfo")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("fullName")}
                    </label>
                    <Input
                      value={formData.guardianName}
                      onChange={(e) => handleChange("guardianName", e.target.value)}
                      placeholder={t("fullNamePlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("phoneNumber")}
                      </label>
                      <Input
                        type="tel"
                        value={formData.guardianPhone}
                        onChange={(e) => handleChange("guardianPhone", e.target.value)}
                        placeholder={t("phoneNumberPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("relationship")}
                      </label>
                      <Input
                        value={formData.guardianRelationship}
                        onChange={(e) => handleChange("guardianRelationship", e.target.value)}
                        placeholder={t("relationshipPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("emergencyContact")} *</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("contactName")} *
                    </label>
                    <Input
                      required
                      value={formData.emergencyName}
                      onChange={(e) => handleChange("emergencyName", e.target.value)}
                      placeholder={t("fullNamePlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("phoneNumber")} *
                      </label>
                      <Input
                        type="tel"
                        required
                        value={formData.emergencyPhone}
                        onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                        placeholder={t("phoneNumberPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("relationship")} *
                      </label>
                      <Input
                        required
                        value={formData.emergencyRelationship}
                        onChange={(e) => handleChange("emergencyRelationship", e.target.value)}
                        placeholder={t("relationshipPlaceholderEmergency")}
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
                    {t("lastSchoolName")} *
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
                    {t("schoolCity")} *
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
                    {t("graduationYear")} *
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
                    {t("diplomaType")} *
                  </label>
                  <Select
                    value={formData.diplomaType}
                    onValueChange={(value) => handleChange("diplomaType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectDiploma")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bacc1">{t("bacc1")}</SelectItem>
                      <SelectItem value="bacc2">{t("bacc2")}</SelectItem>
                      <SelectItem value="philo">{t("philo")}</SelectItem>
                      <SelectItem value="rheto">{t("rheto")}</SelectItem>
                      <SelectItem value="other">{t("otherDiploma")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("fieldOfStudy")} *
                  </label>
                  <Input
                    required
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                    placeholder={t("fieldOfStudyPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("gpaAverage")}
                  </label>
                  <Input
                    value={formData.gpa}
                    onChange={(e) => handleChange("gpa", e.target.value)}
                    placeholder={t("gpaPlaceholder")}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-3">{t("baccInfo")}</h3>
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
                      {t("hasBacc")}
                    </label>
                  </div>

                  {formData.hasBaccalaureat === "yes" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("baccSeries")} *
                      </label>
                      <Select
                        value={formData.baccalaureatSeries}
                        onValueChange={(value) =>
                          handleChange("baccalaureatSeries", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectSeries")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">{t("seriesA")}</SelectItem>
                          <SelectItem value="B">{t("seriesB")}</SelectItem>
                          <SelectItem value="C">{t("seriesC")}</SelectItem>
                          <SelectItem value="D">{t("seriesD")}</SelectItem>
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
                  {t("personalStatement")} *
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("personalStatementDesc")}
                </p>
                <Textarea
                  required
                  value={formData.personalStatement}
                  onChange={(e) => handleChange("personalStatement", e.target.value)}
                  rows={6}
                  placeholder={t("personalStatementPlaceholder")}
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
                    {getWordCount(formData.personalStatement)} / 300-500 {t("words")}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("careerGoals")} *
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("careerGoalsDesc")}
                </p>
                <Textarea
                  required
                  value={formData.careerGoals}
                  onChange={(e) => handleChange("careerGoals", e.target.value)}
                  rows={5}
                  placeholder={t("careerGoalsPlaceholder")}
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
                    {getWordCount(formData.careerGoals)} / 200-300 {t("words")}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("whyThisUniversity")} *
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("whyThisUniversityDesc")}
                </p>
                <Textarea
                  required
                  value={formData.whyThisUniversity}
                  onChange={(e) => handleChange("whyThisUniversity", e.target.value)}
                  rows={5}
                  placeholder={t("whyThisUniversityPlaceholder")}
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
                    {getWordCount(formData.whyThisUniversity)} / 200-300 {t("words")}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {Object.keys(errors).length > 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                {t("correctErrors")}
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
                {t("previous")}
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
                {t("next")}
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? t("saving") : t("saveContinue")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
