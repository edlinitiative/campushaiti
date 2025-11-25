/**
 * Setup script to create fictional schools and programs for testing
 * Run with: npm run setup-demo-schools <admin-email>
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getAdminAuth, getAdminDb } from '../lib/firebase/admin';

const db = getAdminDb();
const auth = getAdminAuth();

// Get the admin user email from command line
const adminEmail = process.argv[2] || 'info@edlight.org';

const schools = [
  {
    name: "Université d'État d'Haïti (UEH)",
    slug: "ueh",
    description: "The premier public university of Haiti, offering comprehensive programs in science, medicine, engineering, and humanities. Founded in 1944, UEH is committed to excellence in education and research.",
    city: "Port-au-Prince",
    department: "Ouest",
    country: "Haiti",
    website: "https://ueh.edu.ht",
    contactEmail: "info@ueh.edu.ht",
    phoneNumber: "+509 2222 1234",
    address: {
      street: "Rue Mgr Guilloux",
      city: "Port-au-Prince",
      department: "Ouest",
      country: "Haiti",
      postalCode: "HT6110"
    },
    programs: [
      {
        name: "Bachelor of Medicine (MD)",
        degree: "Bachelor",
        field: "Medicine",
        description: "Comprehensive medical education program leading to Doctor of Medicine degree. Includes clinical rotations and research opportunities.",
        duration: "6 years",
        tuitionCents: 300000000, // 3000 HTG = ~$30,000 USD equivalent
        applicationFeeCents: 500000, // 50 HTG = ~$5 USD
        startDate: "September 2025",
        deadline: "July 15, 2025",
        requirements: ["Baccalauréat II", "Physics", "Chemistry", "Biology"],
      },
      {
        name: "Bachelor of Engineering - Civil",
        degree: "Bachelor",
        field: "Engineering",
        description: "Four-year program in civil engineering covering structural design, construction management, and sustainable infrastructure.",
        duration: "4 years",
        tuitionCents: 250000000,
        applicationFeeCents: 500000,
        startDate: "September 2025",
        deadline: "August 1, 2025",
        requirements: ["Baccalauréat II", "Mathematics", "Physics"],
      },
      {
        name: "Bachelor of Business Administration",
        degree: "Bachelor",
        field: "Business",
        description: "Comprehensive business education covering management, finance, marketing, and entrepreneurship.",
        duration: "4 years",
        tuitionCents: 200000000,
        applicationFeeCents: 500000,
        startDate: "September 2025",
        deadline: "August 15, 2025",
        requirements: ["Baccalauréat II"],
      }
    ]
  },
  {
    name: "Université Quisqueya (UNIQ)",
    slug: "uniq",
    description: "Leading private university in Haiti known for excellence in science, technology, and professional studies. Established in 1988 with a commitment to innovation and academic rigor.",
    city: "Port-au-Prince",
    department: "Ouest",
    country: "Haiti",
    website: "https://uniq.edu.ht",
    contactEmail: "info@uniq.edu.ht",
    phoneNumber: "+509 2940 2222",
    address: {
      street: "218 Avenue Jean-Paul II",
      city: "Port-au-Prince",
      department: "Ouest",
      country: "Haiti",
      postalCode: "HT6140"
    },
    programs: [
      {
        name: "Bachelor of Computer Science",
        degree: "Bachelor",
        field: "Computer Science",
        description: "Modern computer science curriculum covering software engineering, AI, databases, and web development.",
        duration: "4 years",
        tuitionCents: 280000000,
        applicationFeeCents: 600000,
        startDate: "September 2025",
        deadline: "July 30, 2025",
        requirements: ["Baccalauréat II", "Mathematics"],
      },
      {
        name: "Master of Business Administration (MBA)",
        degree: "Master",
        field: "Business",
        description: "Advanced business degree for working professionals and recent graduates seeking leadership roles.",
        duration: "2 years",
        tuitionCents: 400000000,
        applicationFeeCents: 1000000,
        startDate: "September 2025",
        deadline: "June 30, 2025",
        requirements: ["Bachelor's Degree", "3 years work experience (preferred)"],
      },
      {
        name: "Bachelor of Architecture",
        degree: "Bachelor",
        field: "Architecture",
        description: "Professional architecture program combining design, technology, and sustainability principles.",
        duration: "5 years",
        tuitionCents: 320000000,
        applicationFeeCents: 600000,
        startDate: "September 2025",
        deadline: "July 20, 2025",
        requirements: ["Baccalauréat II", "Art/Design portfolio"],
      }
    ]
  },
  {
    name: "Université Caraïbes (UC)",
    slug: "uc",
    description: "Dynamic private institution focusing on health sciences, education, and social sciences. Known for community engagement and practical training programs.",
    city: "Port-au-Prince",
    department: "Ouest",
    country: "Haiti",
    website: "https://unicaraibes.edu.ht",
    contactEmail: "admissions@unicaraibes.edu.ht",
    phoneNumber: "+509 2813 0000",
    address: {
      street: "Boulevard du 15 Octobre",
      city: "Port-au-Prince",
      department: "Ouest",
      country: "Haiti",
      postalCode: "HT6120"
    },
    programs: [
      {
        name: "Bachelor of Nursing",
        degree: "Bachelor",
        field: "Nursing",
        description: "Professional nursing program with extensive clinical training in hospitals and community health centers.",
        duration: "4 years",
        tuitionCents: 220000000,
        applicationFeeCents: 500000,
        startDate: "September 2025",
        deadline: "August 10, 2025",
        requirements: ["Baccalauréat II", "Biology", "Chemistry"],
      },
      {
        name: "Bachelor of Education - Primary",
        degree: "Bachelor",
        field: "Education",
        description: "Teacher training program for primary education with focus on pedagogy and child development.",
        duration: "3 years",
        tuitionCents: 180000000,
        applicationFeeCents: 400000,
        startDate: "September 2025",
        deadline: "August 5, 2025",
        requirements: ["Baccalauréat II"],
      },
      {
        name: "Bachelor of Psychology",
        degree: "Bachelor",
        field: "Psychology",
        description: "Comprehensive psychology program covering clinical, developmental, and social psychology.",
        duration: "4 years",
        tuitionCents: 210000000,
        applicationFeeCents: 500000,
        startDate: "September 2025",
        deadline: "July 25, 2025",
        requirements: ["Baccalauréat II"],
      }
    ]
  },
  {
    name: "Université Épiscopale d'Haïti (UNEPH)",
    slug: "uneph",
    description: "Private Episcopal university offering quality education in liberal arts, theology, and professional studies since 1995.",
    city: "Port-au-Prince",
    department: "Ouest",
    country: "Haiti",
    website: "https://uneph.edu.ht",
    contactEmail: "contact@uneph.edu.ht",
    phoneNumber: "+509 2245 6789",
    address: {
      street: "Avenue Christophe",
      city: "Port-au-Prince",
      department: "Ouest",
      country: "Haiti",
      postalCode: "HT6130"
    },
    programs: [
      {
        name: "Bachelor of Law (LL.B)",
        degree: "Bachelor",
        field: "Law",
        description: "Comprehensive legal education covering Haitian law, international law, and legal practice.",
        duration: "4 years",
        tuitionCents: 260000000,
        applicationFeeCents: 600000,
        startDate: "September 2025",
        deadline: "July 31, 2025",
        requirements: ["Baccalauréat II"],
      },
      {
        name: "Bachelor of Accounting",
        degree: "Bachelor",
        field: "Accounting",
        description: "Professional accounting program preparing students for CPA certification and financial management careers.",
        duration: "4 years",
        tuitionCents: 230000000,
        applicationFeeCents: 500000,
        startDate: "September 2025",
        deadline: "August 12, 2025",
        requirements: ["Baccalauréat II", "Mathematics"],
      },
      {
        name: "Bachelor of Agricultural Sciences",
        degree: "Bachelor",
        field: "Agriculture",
        description: "Agricultural science program focusing on sustainable farming, agribusiness, and rural development.",
        duration: "4 years",
        tuitionCents: 200000000,
        applicationFeeCents: 500000,
        startDate: "September 2025",
        deadline: "August 20, 2025",
        requirements: ["Baccalauréat II", "Biology", "Chemistry"],
      }
    ]
  }
];

async function setupDemoSchools() {
  try {
    console.log('🚀 Starting demo schools setup...\n');
    
    // Find the admin user
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(adminEmail);
      console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.uid})\n`);
    } catch (error) {
      console.error(`❌ Admin user not found: ${adminEmail}`);
      console.error('Please provide a valid email as argument or set ADMIN_EMAIL environment variable');
      process.exit(1);
    }

    for (const school of schools) {
      console.log(`📚 Creating school: ${school.name}...`);
      
      // Create school document
      const schoolRef = db.collection('schools').doc();
      const schoolData = {
        name: school.name,
        slug: school.slug,
        description: school.description,
        city: school.city,
        department: school.department,
        country: school.country,
        website: school.website,
        contactEmail: school.contactEmail,
        phoneNumber: school.phoneNumber,
        address: school.address,
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: new Date(),
        uid: schoolRef.id,
      };
      
      await schoolRef.set(schoolData);
      console.log(`  ✓ School created with ID: ${schoolRef.id}`);
      
      // Create programs for this school
      console.log(`  📖 Creating ${school.programs.length} programs...`);
      for (const program of school.programs) {
        const programRef = db.collection('programs').doc();
        const programData = {
          ...program,
          schoolId: schoolRef.id,
          schoolName: school.name,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await programRef.set(programData);
        console.log(`    ✓ ${program.name}`);
      }
      
      // Add admin user to school team
      const teamMemberRef = db.collection('schools').doc(schoolRef.id)
        .collection('team').doc(adminUser.uid);
      
      await teamMemberRef.set({
        uid: adminUser.uid,
        email: adminUser.email,
        role: 'OWNER',
        permissions: ['ALL'],
        addedAt: new Date(),
        addedBy: 'SYSTEM',
      });
      console.log(`  ✓ Added ${adminUser.email} as OWNER\n`);
    }
    
    console.log('✨ Setup complete!\n');
    console.log('Summary:');
    console.log(`  • ${schools.length} schools created`);
    console.log(`  • ${schools.reduce((sum, s) => sum + s.programs.length, 0)} programs created`);
    console.log(`  • ${adminUser.email} added as admin to all schools\n`);
    console.log('You can now:');
    console.log('  1. Visit the schools dashboard to manage programs');
    console.log('  2. Customize application questions');
    console.log('  3. Review applications');
    console.log('  4. Test the full application flow\n');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupDemoSchools();
