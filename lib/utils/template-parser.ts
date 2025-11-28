/**
 * Template Parser Utilities
 * Parse and replace variables in message templates
 */

import { TemplateVariables } from "@/lib/types/uni";

/**
 * Extract variable names from template string
 * Looks for {{variableName}} patterns
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Replace variables in template with actual values
 */
export function parseTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let parsed = template;

  // Replace each variable
  Object.keys(variables).forEach((key) => {
    const value = variables[key];
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");

    if (value !== undefined && value !== null) {
      // Handle arrays (like missing documents)
      if (Array.isArray(value)) {
        parsed = parsed.replace(regex, formatArray(value));
      } else {
        parsed = parsed.replace(regex, String(value));
      }
    }
  });

  return parsed;
}

/**
 * Format array values for display in templates
 */
function formatArray(arr: any[]): string {
  if (arr.length === 0) return "";
  if (arr.length === 1) return String(arr[0]);
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;

  const lastItem = arr[arr.length - 1];
  const otherItems = arr.slice(0, -1).join(", ");
  return `${otherItems}, and ${lastItem}`;
}

/**
 * Validate that all required variables are provided
 */
export function validateVariables(
  template: string,
  variables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const requiredVariables = extractVariables(template);
  const missing = requiredVariables.filter(
    (varName) => variables[varName] === undefined || variables[varName] === null
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get default templates for different message types
 */
export function getDefaultTemplate(type: string): {
  subject: string;
  body: string;
  variables: string[];
} {
  switch (type) {
    case "missing_documents":
      return {
        subject: "Missing Documents - {{programName}} Application",
        body: `Dear {{studentName}},

Thank you for your application to {{programName}} at {{universityName}}.

We have reviewed your application and noticed that the following documents are missing:

{{missingDocuments}}

Please upload these documents at your earliest convenience to complete your application. You can upload them by logging into your account at https://campushaiti.org/dashboard.

If you have any questions, please don't hesitate to contact us.

Best regards,
{{universityName}} Admissions Team`,
        variables: [
          "studentName",
          "programName",
          "universityName",
          "missingDocuments",
        ],
      };

    case "interview_invitation":
      return {
        subject: "Interview Invitation - {{programName}}",
        body: `Dear {{studentName}},

Congratulations! We are pleased to invite you for an interview as part of the admissions process for {{programName}} at {{universityName}}.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Location: {{interviewLocation}}

Please confirm your attendance by replying to this email.

We look forward to meeting you!

Best regards,
{{universityName}} Admissions Team`,
        variables: [
          "studentName",
          "programName",
          "universityName",
          "interviewDate",
          "interviewTime",
          "interviewLocation",
        ],
      };

    case "acceptance_letter":
      return {
        subject: "Congratulations - Accepted to {{programName}}",
        body: `Dear {{studentName}},

Congratulations! We are delighted to inform you that you have been accepted to {{programName}} at {{universityName}}.

Next Steps:
1. Review the attached enrollment information
2. Complete your enrollment by {{deadline}}
3. Pay the required fees

We are excited to welcome you to our university community!

Best regards,
{{universityName}} Admissions Team`,
        variables: ["studentName", "programName", "universityName", "deadline"],
      };

    case "rejection_notice":
      return {
        subject: "Application Update - {{programName}}",
        body: `Dear {{studentName}},

Thank you for your interest in {{programName}} at {{universityName}} and for taking the time to submit your application.

After careful consideration, we regret to inform you that we are unable to offer you admission at this time. This decision was difficult as we received many qualified applications for a limited number of spaces.

We encourage you to explore other programs at our university or consider reapplying in the future.

We wish you all the best in your academic pursuits.

Best regards,
{{universityName}} Admissions Team`,
        variables: ["studentName", "programName", "universityName"],
      };

    case "general":
      return {
        subject: "Message from {{universityName}}",
        body: `Dear {{studentName}},

[Your message here]

Best regards,
{{universityName}}`,
        variables: ["studentName", "universityName"],
      };

    default:
      return {
        subject: "",
        body: "",
        variables: [],
      };
  }
}

/**
 * Preview template with sample data
 */
export function previewTemplate(
  template: string,
  type?: string
): string {
  const sampleVariables: TemplateVariables = {
    studentName: "John Doe",
    studentEmail: "john.doe@example.com",
    programName: "Bachelor of Computer Science",
    universityName: "Sample University",
    reviewerName: "Dr. Jane Smith",
    deadline: "January 15, 2026",
    interviewDate: "December 10, 2025",
    interviewTime: "10:00 AM",
    interviewLocation: "Room 301, Admin Building",
    missingDocuments: ["High School Transcript", "Passport Copy"],
  };

  return parseTemplate(template, sampleVariables);
}
