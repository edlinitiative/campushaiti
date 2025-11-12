/**
 * Seed Database Script
 * 
 * Seeds the Firestore database with sample universities and programs
 * 
 * Usage: npx ts-node scripts/seed-db.ts
 */

import { adminDb } from "../lib/firebase/admin";

const universities = [
  {
    name: "Université d'État d'Haïti (UEH)",
    slug: "ueh",
    city: "Port-au-Prince",
    country: "Haiti",
    contactEmail: "admissions@ueh.edu.ht",
  },
  {
    name: "Université Notre Dame d'Haïti (UNDH)",
    slug: "undh",
    city: "Port-au-Prince",
    country: "Haiti",
    contactEmail: "admissions@undh.edu.ht",
  },
  {
    name: "Université Quisqueya (UniQ)",
    slug: "uniq",
    city: "Port-au-Prince",
    country: "Haiti",
    contactEmail: "admissions@uniq.edu.ht",
  },
];

const programs = [
  // UEH Programs
  {
    universitySlug: "ueh",
    name: "Licence en Informatique",
    degree: "Licence",
    description: "Programme de trois ans en informatique et sciences informatiques",
    requirements: "Baccalauréat en sciences",
    feeCents: 50000, // $500 USD
    currency: "USD",
    deadlineMonths: 6, // 6 months from now
  },
  {
    universitySlug: "ueh",
    name: "Licence en Administration des Affaires",
    degree: "Licence",
    description: "Formation en gestion d'entreprise et administration",
    requirements: "Baccalauréat",
    feeCents: 45000,
    currency: "USD",
    deadlineMonths: 6,
  },
  // UNDH Programs
  {
    universitySlug: "undh",
    name: "Licence en Génie Civil",
    degree: "Licence",
    description: "Programme d'ingénierie civile",
    requirements: "Baccalauréat en sciences ou mathématiques",
    feeCents: 60000,
    currency: "USD",
    deadlineMonths: 5,
  },
  {
    universitySlug: "undh",
    name: "Licence en Sciences Infirmières",
    degree: "Licence",
    description: "Formation professionnelle en soins infirmiers",
    requirements: "Baccalauréat",
    feeCents: 55000,
    currency: "USD",
    deadlineMonths: 5,
  },
  // UniQ Programs
  {
    universitySlug: "uniq",
    name: "Master en Gestion de Projet",
    degree: "Master",
    description: "Programme avancé de gestion de projet",
    requirements: "Licence dans un domaine connexe",
    feeCents: 80000,
    currency: "USD",
    deadlineMonths: 4,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...\n");

    // Create universities
    const universityMap: Record<string, string> = {};
    
    for (const uni of universities) {
      const uniRef = await adminDb.collection("universities").add({
        ...uni,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      universityMap[uni.slug] = uniRef.id;
      console.log(`✅ Created university: ${uni.name}`);
    }

    console.log("");

    // Create programs
    for (const prog of programs) {
      const universityId = universityMap[prog.universitySlug];
      if (!universityId) {
        console.warn(`⚠️  Skipping program ${prog.name} - university not found`);
        continue;
      }

      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + prog.deadlineMonths);

      await adminDb.collection("programs").add({
        universityId,
        name: prog.name,
        degree: prog.degree,
        description: prog.description,
        requirements: prog.requirements,
        feeCents: prog.feeCents,
        currency: prog.currency,
        deadline,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created program: ${prog.name} (${prog.degree})`);
    }

    console.log("\n🎉 Database seeded successfully!");
  } catch (error: any) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase().then(() => process.exit(0));
