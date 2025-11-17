import jsPDF from "jspdf";

interface SchoolInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

interface StudentInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface ProgramInfo {
  name: string;
  degree: string;
  startDate?: string;
}

interface PaymentInfo {
  amount: number;
  currency: string;
  transactionId: string;
  date: string;
  method?: string;
}

/**
 * Generate Acceptance Letter PDF
 */
export function generateAcceptanceLetter(
  school: SchoolInfo,
  student: StudentInfo,
  program: ProgramInfo,
  applicationId: string
): jsPDF {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // School Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(school.name, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  if (school.address) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(school.address, pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
  }

  if (school.email || school.phone) {
    const contact = [school.email, school.phone].filter(Boolean).join(" | ");
    pdf.text(contact, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("LETTER OF ACCEPTANCE", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Date
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(today, 20, yPos);
  yPos += 15;

  // Student Address
  pdf.text(student.name, 20, yPos);
  yPos += 6;
  if (student.address) {
    pdf.text(student.address, 20, yPos);
    yPos += 6;
  }
  if (student.email) {
    pdf.text(student.email, 20, yPos);
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Salutation
  pdf.text(`Dear ${student.name},`, 20, yPos);
  yPos += 10;

  // Body
  pdf.setFontSize(11);
  const bodyText = [
    `We are pleased to inform you that you have been accepted to the ${program.name} program`,
    `at ${school.name}. Your application has been carefully reviewed and we are impressed`,
    `with your academic achievements and potential.`,
    ``,
    `Program Details:`,
    `  • Program: ${program.name}`,
    `  • Degree: ${program.degree}`,
    program.startDate ? `  • Expected Start Date: ${program.startDate}` : null,
    `  • Application ID: ${applicationId}`,
    ``,
    `Next Steps:`,
    `  1. Review and accept your admission offer through your student portal`,
    `  2. Complete any required enrollment documentation`,
    `  3. Submit payment for tuition and fees (if not already completed)`,
    `  4. Attend orientation sessions (dates will be communicated separately)`,
    ``,
    `Please confirm your acceptance within 14 days of receiving this letter. If you have any`,
    `questions, please do not hesitate to contact our admissions office.`,
    ``,
    `We look forward to welcoming you to our academic community.`,
  ].filter(Boolean) as string[];

  bodyText.forEach((line) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.text(line, 20, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Signature
  pdf.text("Sincerely,", 20, yPos);
  yPos += 15;
  pdf.setFont("helvetica", "bold");
  pdf.text("Admissions Office", 20, yPos);
  pdf.setFont("helvetica", "normal");
  yPos += 6;
  pdf.text(school.name, 20, yPos);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    "This is an official document from " + school.name,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return pdf;
}

/**
 * Generate Rejection Letter PDF
 */
export function generateRejectionLetter(
  school: SchoolInfo,
  student: StudentInfo,
  program: ProgramInfo,
  applicationId: string
): jsPDF {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // School Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(school.name, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  if (school.address) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(school.address, pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
  }

  if (school.email || school.phone) {
    const contact = [school.email, school.phone].filter(Boolean).join(" | ");
    pdf.text(contact, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("ADMISSIONS DECISION", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Date
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(today, 20, yPos);
  yPos += 15;

  // Student Address
  pdf.text(student.name, 20, yPos);
  yPos += 6;
  if (student.email) {
    pdf.text(student.email, 20, yPos);
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Salutation
  pdf.text(`Dear ${student.name},`, 20, yPos);
  yPos += 10;

  // Body
  pdf.setFontSize(11);
  const bodyText = [
    `Thank you for your application to the ${program.name} program at ${school.name}.`,
    `We appreciate the time and effort you invested in your application.`,
    ``,
    `After careful consideration of all applications, we regret to inform you that we are`,
    `unable to offer you admission at this time. This decision was very difficult, as we`,
    `received many qualified applications for a limited number of spaces.`,
    ``,
    `Application Details:`,
    `  • Program: ${program.name}`,
    `  • Degree: ${program.degree}`,
    `  • Application ID: ${applicationId}`,
    ``,
    `We encourage you to:`,
    `  • Consider applying to other programs that may align with your interests`,
    `  • Strengthen your academic profile and consider reapplying in the future`,
    `  • Contact our admissions office if you would like feedback on your application`,
    ``,
    `We wish you the very best in your educational pursuits and future endeavors.`,
  ];

  bodyText.forEach((line) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.text(line, 20, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Signature
  pdf.text("Sincerely,", 20, yPos);
  yPos += 15;
  pdf.setFont("helvetica", "bold");
  pdf.text("Admissions Office", 20, yPos);
  pdf.setFont("helvetica", "normal");
  yPos += 6;
  pdf.text(school.name, 20, yPos);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    "This is an official document from " + school.name,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return pdf;
}

/**
 * Generate Payment Receipt PDF
 */
export function generatePaymentReceipt(
  school: SchoolInfo,
  student: StudentInfo,
  program: ProgramInfo,
  payment: PaymentInfo
): jsPDF {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // School Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(school.name, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  if (school.address) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(school.address, pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
  }

  if (school.email || school.phone) {
    const contact = [school.email, school.phone].filter(Boolean).join(" | ");
    pdf.text(contact, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("PAYMENT RECEIPT", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Receipt Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, yPos, pageWidth - 30, 80, "FD");

  yPos += 10;

  // Receipt Details
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Receipt Information", 20, yPos);
  yPos += 8;

  pdf.setFont("helvetica", "normal");
  const receiptDetails = [
    [`Transaction ID:`, payment.transactionId],
    [`Date:`, payment.date],
    [`Payment Method:`, payment.method || "Online Payment"],
    [`Amount Paid:`, `${payment.amount.toFixed(2)} ${payment.currency}`],
  ];

  receiptDetails.forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(label, 20, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(value, 80, yPos);
    yPos += 7;
  });

  yPos += 8;

  pdf.setFont("helvetica", "bold");
  pdf.text("Student Information", 20, yPos);
  yPos += 8;

  pdf.setFont("helvetica", "normal");
  const studentDetails = [
    [`Name:`, student.name],
    [`Email:`, student.email],
    [`Program:`, program.name],
    [`Degree:`, program.degree],
  ];

  studentDetails.forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(label, 20, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(value, 80, yPos);
    yPos += 7;
  });

  yPos += 15;

  // Amount Summary Box
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, yPos, pageWidth - 30, 20, "F");

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Total Amount Paid:", 20, yPos + 12);
  pdf.text(
    `${payment.amount.toFixed(2)} ${payment.currency}`,
    pageWidth - 20,
    yPos + 12,
    { align: "right" }
  );

  yPos += 35;

  // Notes
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Important Notes:", 20, yPos);
  yPos += 7;

  const notes = [
    "• Please keep this receipt for your records",
    "• Payment is non-refundable as per university policy",
    "• Contact admissions office for any payment inquiries",
    "• This receipt serves as proof of payment",
  ];

  notes.forEach((note) => {
    pdf.text(note, 20, yPos);
    yPos += 6;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Official receipt from ${school.name} • Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return pdf;
}

/**
 * Generate Invoice PDF
 */
export function generateInvoice(
  school: SchoolInfo,
  student: StudentInfo,
  program: ProgramInfo,
  invoiceNumber: string,
  amount: number,
  currency: string,
  dueDate: string
): jsPDF {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // School Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(school.name, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  if (school.address) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(school.address, pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
  }

  if (school.email || school.phone) {
    const contact = [school.email, school.phone].filter(Boolean).join(" | ");
    pdf.text(contact, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Invoice Details
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Invoice #: ${invoiceNumber}`, 20, yPos);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPos, {
    align: "right",
  });
  yPos += 7;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Due Date: ${dueDate}`, pageWidth - 20, yPos, { align: "right" });
  yPos += 15;

  // Bill To Section
  pdf.setFont("helvetica", "bold");
  pdf.text("Bill To:", 20, yPos);
  yPos += 7;
  pdf.setFont("helvetica", "normal");
  pdf.text(student.name, 20, yPos);
  yPos += 6;
  if (student.email) {
    pdf.text(student.email, 20, yPos);
    yPos += 6;
  }
  if (student.address) {
    pdf.text(student.address, 20, yPos);
    yPos += 10;
  } else {
    yPos += 5;
  }

  yPos += 10;

  // Item Table Header
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, yPos, pageWidth - 30, 10, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 20, yPos + 7);
  pdf.text("Amount", pageWidth - 20, yPos + 7, { align: "right" });

  yPos += 10;

  // Item Row
  pdf.setFont("helvetica", "normal");
  pdf.rect(15, yPos, pageWidth - 30, 15, "S");
  yPos += 7;
  pdf.text(`Application Fee - ${program.name}`, 20, yPos);
  pdf.text(`${amount.toFixed(2)} ${currency}`, pageWidth - 20, yPos, {
    align: "right",
  });
  yPos += 8;

  yPos += 5;

  // Total
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, yPos, pageWidth - 30, 12, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Total Amount Due:", 20, yPos + 8);
  pdf.text(`${amount.toFixed(2)} ${currency}`, pageWidth - 20, yPos + 8, {
    align: "right",
  });

  yPos += 25;

  // Payment Instructions
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Instructions:", 20, yPos);
  yPos += 7;

  pdf.setFont("helvetica", "normal");
  const instructions = [
    "• Payment can be made online through your student portal",
    "• Credit cards, debit cards, and mobile payments accepted",
    "• Please reference your invoice number when making payment",
    `• Payment is due by ${dueDate}`,
  ];

  instructions.forEach((instruction) => {
    pdf.text(instruction, 20, yPos);
    yPos += 6;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Thank you for choosing ${school.name}`,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return pdf;
}
