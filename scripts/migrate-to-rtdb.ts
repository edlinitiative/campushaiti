/**
 * Script to migrate Firestore code to Realtime Database
 * This script performs find-and-replace operations across API files
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Replacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const replacements: Replacement[] = [
  // Import replacements
  {
    pattern: /import\s+{([^}]*adminDb[^}]*)}\s+from\s+["']@\/lib\/firebase\/admin["'];/g,
    replacement: (match: string) => {
      const imports = match.match(/\{([^}]+)\}/)?.[1] || '';
      const hasAdminAuth = imports.includes('adminAuth');
      const hasAdminStorage = imports.includes('adminStorage');
      
      let newImports = [];
      if (hasAdminAuth) newImports.push('adminAuth');
      if (hasAdminStorage) newImports.push('adminStorage');
      
      const adminImport = newImports.length > 0
        ? `import { ${newImports.join(', ')} } from "@/lib/firebase/admin";\n`
        : '';
      
      return `${adminImport}import { collection } from "@/lib/firebase/database-helpers";`;
    },
    description: 'Replace admin imports to include database helpers'
  },
  
  // Collection operations
  {
    pattern: /adminDb\.collection\(["']([^"']+)["']\)/g,
    replacement: 'collection("$1")',
    description: 'Replace adminDb.collection() with collection()'
  },
  
  // Date replacements
  {
    pattern: /new Date\(\)/g,
    replacement: 'Date.now()',
    description: 'Replace new Date() with Date.now() for timestamps'
  },
  
  // Batch operations (need manual handling as RTDB doesn't have batches)
  {
    pattern: /const batch = adminDb\.batch\(\);/g,
    replacement: '// Batch operations replaced with sequential operations',
    description: 'Mark batch operations for manual migration'
  },
  
  // Document reference IDs
  {
    pattern: /\.id(?=\s*[,;)\]])/g,
    replacement: '.path.split(\'/\').pop()',
    description: 'Replace .id with path parsing for document references'
  },
];

async function migrateFile(filePath: string): Promise<void> {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const { pattern, replacement, description } of replacements) {
    if (pattern.test(content)) {
      console.log(`  - ${description}`);
      content = content.replace(pattern, replacement as any);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Migrated: ${filePath}`);
  }
}

async function main() {
  console.log('Starting Firestore to Realtime Database migration...\n');

  // Find all API route files
  const files = glob.sync('app/api/**/*.ts', {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(`Found ${files.length} API files to process\n`);

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`\nProcessing: ${relativePath}`);
    
    try {
      await migrateFile(file);
    } catch (error) {
      console.error(`✗ Error migrating ${relativePath}:`, error);
    }
  }

  console.log('\n✓ Migration complete!');
  console.log('\nNOTE: Please review the changes and manually handle:');
  console.log('  - Batch operations (no direct equivalent in RTDB)');
  console.log('  - Complex queries (may need restructuring)');
  console.log('  - Transaction operations');
  console.log('  - Document reference IDs (check .id usage)');
}

main().catch(console.error);
