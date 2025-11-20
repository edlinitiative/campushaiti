const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all route.ts files
const files = execSync('find app/api -name "route.ts" -type f', { encoding: 'utf-8' })
  .trim()
  .split('\n');

let count = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Check if already has dynamic export
  if (content.includes('export const dynamic')) {
    return;
  }
  
  // Find where to insert (after all imports)
  const lines = content.split('\n');
  let insertIndex = 0;
  let inMultilineImport = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're in a multiline import
    if (line.startsWith('import') && !line.includes(';') && !line.includes('from')) {
      inMultilineImport = true;
    }
    
    if (inMultilineImport) {
      if (line.includes(';')) {
        inMultilineImport = false;
        insertIndex = i + 1;
      }
      continue;
    }
    
    // Single line import
    if (line.startsWith('import')) {
      insertIndex = i + 1;
    } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
      // Found first non-import, non-comment line
      break;
    }
  }
  
  // Insert the dynamic export
  lines.splice(insertIndex, 0, '', 'export const dynamic = "force-dynamic";');
  
  fs.writeFileSync(file, lines.join('\n'));
  console.log(`Added to ${file}`);
  count++;
});

console.log(`\nAdded dynamic export to ${count} files`);
