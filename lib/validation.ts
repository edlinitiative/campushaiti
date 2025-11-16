/**
 * Validation utilities for Haiti-specific application forms
 */

// Haiti phone number validation (+509 XXXX XXXX)
export const validateHaitianPhone = (phone: string): { valid: boolean; message?: string } => {
  if (!phone) return { valid: false, message: "Phone number is required" };
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it starts with +509 or just the number
  const haitiPattern = /^(\+509)?[2-4]\d{7}$/;
  
  if (!haitiPattern.test(cleaned)) {
    return { 
      valid: false, 
      message: "Please enter a valid Haitian phone number (e.g., +509 1234 5678)" 
    };
  }
  
  return { valid: true };
};

// Email validation
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) return { valid: false, message: "Email is required" };
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }
  
  return { valid: true };
};

// Age validation (must be at least 16 years old for university)
export const validateAge = (birthDate: string): { valid: boolean; message?: string } => {
  if (!birthDate) return { valid: false, message: "Birth date is required" };
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < 16) {
    return { valid: false, message: "You must be at least 16 years old to apply" };
  }
  
  if (age > 100) {
    return { valid: false, message: "Please enter a valid birth date" };
  }
  
  return { valid: true };
};

// GPA validation
export const validateGPA = (gpa: string): { valid: boolean; message?: string } => {
  if (!gpa) return { valid: true }; // GPA is optional
  
  // Support both percentage (0-100) and 4.0 scale
  const numGPA = parseFloat(gpa.replace('%', ''));
  
  if (isNaN(numGPA)) {
    return { valid: false, message: "GPA must be a number" };
  }
  
  // If it looks like a percentage (> 4.0)
  if (numGPA > 4.0) {
    if (numGPA > 100) {
      return { valid: false, message: "GPA percentage cannot exceed 100%" };
    }
  } else {
    // 4.0 scale
    if (numGPA > 4.0) {
      return { valid: false, message: "GPA on 4.0 scale cannot exceed 4.0" };
    }
  }
  
  if (numGPA < 0) {
    return { valid: false, message: "GPA cannot be negative" };
  }
  
  return { valid: true };
};

// Word count validation for essays
export const validateWordCount = (
  text: string, 
  min: number, 
  max: number
): { valid: boolean; message?: string; wordCount: number } => {
  if (!text) {
    return { 
      valid: false, 
      message: `Essay is required (${min}-${max} words)`,
      wordCount: 0 
    };
  }
  
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  if (wordCount < min) {
    return { 
      valid: false, 
      message: `Essay must be at least ${min} words (currently ${wordCount})`,
      wordCount 
    };
  }
  
  if (wordCount > max) {
    return { 
      valid: false, 
      message: `Essay must not exceed ${max} words (currently ${wordCount})`,
      wordCount 
    };
  }
  
  return { valid: true, wordCount };
};

// Graduation year validation
export const validateGraduationYear = (year: string): { valid: boolean; message?: string } => {
  if (!year) return { valid: false, message: "Graduation year is required" };
  
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum)) {
    return { valid: false, message: "Please enter a valid year" };
  }
  
  if (yearNum < 1950) {
    return { valid: false, message: "Graduation year seems too far in the past" };
  }
  
  if (yearNum > currentYear + 5) {
    return { valid: false, message: "Graduation year cannot be more than 5 years in the future" };
  }
  
  return { valid: true };
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): { valid: boolean; message?: string } => {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

// Name validation (no numbers or special characters except hyphens and apostrophes)
export const validateName = (name: string, fieldName: string = "Name"): { valid: boolean; message?: string } => {
  if (!name) return { valid: false, message: `${fieldName} is required` };
  
  // Allow letters, spaces, hyphens, and apostrophes (for Haitian names like Jean-Pierre, O'Brien)
  const namePattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  
  if (!namePattern.test(name)) {
    return { 
      valid: false, 
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }
  
  if (name.length < 2) {
    return { valid: false, message: `${fieldName} must be at least 2 characters long` };
  }
  
  if (name.length > 50) {
    return { valid: false, message: `${fieldName} must not exceed 50 characters` };
  }
  
  return { valid: true };
};

// Validate entire profile form
export const validateProfileForm = (formData: any) => {
  const errors: Record<string, string> = {};
  
  // Personal Info
  const firstName = validateName(formData.firstName, "First name");
  if (!firstName.valid) errors.firstName = firstName.message!;
  
  const lastName = validateName(formData.lastName, "Last name");
  if (!lastName.valid) errors.lastName = lastName.message!;
  
  if (!formData.gender) errors.gender = "Gender is required";
  
  const birthDate = validateAge(formData.birthDate);
  if (!birthDate.valid) errors.birthDate = birthDate.message!;
  
  const birthPlace = validateRequired(formData.birthPlace, "Place of birth");
  if (!birthPlace.valid) errors.birthPlace = birthPlace.message!;
  
  const phone = validateHaitianPhone(formData.phone);
  if (!phone.valid) errors.phone = phone.message!;
  
  if (formData.whatsapp) {
    const whatsapp = validateHaitianPhone(formData.whatsapp);
    if (!whatsapp.valid) errors.whatsapp = whatsapp.message!;
  }
  
  const email = validateEmail(formData.email);
  if (!email.valid) errors.email = email.message!;
  
  const nationality = validateRequired(formData.nationality, "Nationality");
  if (!nationality.valid) errors.nationality = nationality.message!;
  
  // Address
  const address = validateRequired(formData.address, "Street address");
  if (!address.valid) errors.address = address.message!;
  
  const city = validateRequired(formData.city, "City");
  if (!city.valid) errors.city = city.message!;
  
  if (!formData.department) errors.department = "Department is required";
  
  const country = validateRequired(formData.country, "Country");
  if (!country.valid) errors.country = country.message!;
  
  // Emergency Contact
  const emergencyName = validateName(formData.emergencyName, "Emergency contact name");
  if (!emergencyName.valid) errors.emergencyName = emergencyName.message!;
  
  const emergencyPhone = validateHaitianPhone(formData.emergencyPhone);
  if (!emergencyPhone.valid) errors.emergencyPhone = emergencyPhone.message!;
  
  const emergencyRelationship = validateRequired(formData.emergencyRelationship, "Emergency contact relationship");
  if (!emergencyRelationship.valid) errors.emergencyRelationship = emergencyRelationship.message!;
  
  // Education
  const schoolName = validateRequired(formData.lastSchoolName, "Last school name");
  if (!schoolName.valid) errors.lastSchoolName = schoolName.message!;
  
  const schoolCity = validateRequired(formData.lastSchoolCity, "School city");
  if (!schoolCity.valid) errors.lastSchoolCity = schoolCity.message!;
  
  const gradYear = validateGraduationYear(formData.graduationYear);
  if (!gradYear.valid) errors.graduationYear = gradYear.message!;
  
  if (!formData.diplomaType) errors.diplomaType = "Diploma type is required";
  
  const fieldOfStudy = validateRequired(formData.fieldOfStudy, "Field of study");
  if (!fieldOfStudy.valid) errors.fieldOfStudy = fieldOfStudy.message!;
  
  if (formData.gpa) {
    const gpa = validateGPA(formData.gpa);
    if (!gpa.valid) errors.gpa = gpa.message!;
  }
  
  if (formData.hasBaccalaureat === "yes" && !formData.baccalaureatSeries) {
    errors.baccalaureatSeries = "Please select your Baccalauréat series";
  }
  
  // Essays
  const personalStatement = validateWordCount(formData.personalStatement, 300, 500);
  if (!personalStatement.valid) errors.personalStatement = personalStatement.message!;
  
  const careerGoals = validateWordCount(formData.careerGoals, 200, 300);
  if (!careerGoals.valid) errors.careerGoals = careerGoals.message!;
  
  const whyUniversity = validateWordCount(formData.whyThisUniversity, 200, 300);
  if (!whyUniversity.valid) errors.whyThisUniversity = whyUniversity.message!;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper to get word count for display
export const getWordCount = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};
