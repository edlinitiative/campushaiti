import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

const DEMO_PROGRAMS = [
  {
    id: "demo-cs-bachelor",
    name: "Bachelor of Science in Computer Science",
    description: "Comprehensive program covering software development, algorithms, and modern computing technologies.",
    degree: "BACHELOR",
    universityId: "demo-ueh",
    universityName: "Université d'État d'Haïti",
    feeCents: 50000,
    currency: "HTG",
    deadline: new Date("2025-08-01").toISOString(),
    additionalQuestions: [
      {
        id: "q1",
        question: "Why are you interested in Computer Science?",
        required: true,
        type: "textarea"
      },
      {
        id: "q2",
        question: "Do you have any programming experience?",
        required: true,
        type: "textarea"
      }
    ]
  },
  {
    id: "demo-mba",
    name: "Master of Business Administration",
    description: "Advanced business degree focusing on leadership, strategy, and management.",
    degree: "MASTER",
    universityId: "demo-ueh",
    universityName: "Université d'État d'Haïti",
    feeCents: 75000,
    currency: "HTG",
    deadline: new Date("2025-07-15").toISOString(),
    additionalQuestions: [
      {
        id: "q1",
        question: "Describe your professional experience and career goals.",
        required: true,
        type: "textarea"
      }
    ]
  },
  {
    id: "demo-engineering",
    name: "Bachelor of Engineering",
    description: "Engineering program with focus on practical applications and innovative solutions.",
    degree: "BACHELOR",
    universityId: "demo-uniq",
    universityName: "Université Quisqueya",
    feeCents: 45000,
    currency: "HTG",
    deadline: new Date("2025-08-15").toISOString(),
    additionalQuestions: []
  },
  {
    id: "demo-nursing",
    name: "Bachelor of Science in Nursing",
    description: "Comprehensive nursing program preparing students for healthcare careers.",
    degree: "BACHELOR",
    universityId: "demo-uniq",
    universityName: "Université Quisqueya",
    feeCents: 55000,
    currency: "HTG",
    deadline: new Date("2025-07-30").toISOString(),
    additionalQuestions: [
      {
        id: "q1",
        question: "Why do you want to pursue a career in nursing?",
        required: true,
        type: "textarea"
      },
      {
        id: "q2",
        question: "Have you completed any healthcare-related volunteer work or internships?",
        required: false,
        type: "textarea"
      }
    ]
  }
];

export async function GET() {
  try {
    const db = getAdminDb();
    
    const snapshot = await db
      .collection("programs")
      .orderBy("name")
      .limit(100)
      .get();

    let programs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If no programs exist, return demo programs
    if (programs.length === 0) {
      programs = DEMO_PROGRAMS;
    }

    return NextResponse.json(programs);
  } catch (error: any) {
    console.error("Error fetching programs:", error);
    // Return demo programs on error
    return NextResponse.json(DEMO_PROGRAMS);
  }
}
