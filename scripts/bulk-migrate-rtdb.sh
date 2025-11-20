#!/bin/bash

# Firebase Realtime Database Migration Script
# Migrates Firestore code to Realtime Database across all API files

echo "Starting bulk migration to Firebase Realtime Database..."

# Find all TypeScript files in app/api that contain adminDb
FILES=$(find app/api -name "*.ts" -type f -exec grep -l "adminDb" {} \;)

echo "Found $(echo "$FILES" | wc -l) files to migrate"
echo ""

for file in $FILES; do
    echo "Processing: $file"
    
    # 1. Update imports - replace adminDb with collection helper
    sed -i 's/import { adminAuth, adminDb } from "@\/lib\/firebase\/admin";/import { adminAuth } from "@\/lib\/firebase\/admin";\nimport { collection } from "@\/lib\/firebase\/database-helpers";/g' "$file"
    
    sed -i 's/import { adminDb } from "@\/lib\/firebase\/admin";/import { collection } from "@\/lib\/firebase\/database-helpers";/g' "$file"
    
    # 2. Replace collection() calls
    sed -i 's/adminDb\.collection(/collection(/g' "$file"
    
    # 3. Replace new Date() with Date.now() for timestamps
    sed -i 's/createdAt: new Date()/createdAt: Date.now()/g' "$file"
    sed -i 's/updatedAt: new Date()/updatedAt: Date.now()/g' "$file"
    sed -i 's/sentAt: new Date()/sentAt: Date.now()/g' "$file"
    sed -i 's/completedAt: new Date()/completedAt: Date.now()/g' "$file"
    sed -i 's/timestamp: new Date()/timestamp: Date.now()/g' "$file"
    
    # 4. Comment batch operations (they need manual migration)
    sed -i 's/const batch = adminDb\.batch();/\/\/ TODO: Batch operations need manual migration to RTDB sequential operations/g' "$file"
    sed -i 's/batch\.delete(/\/\/ batch.delete(/g' "$file"
    sed -i 's/await batch\.commit();/\/\/ await batch.commit();/g' "$file"
    
    echo "  ✓ Migrated"
done

echo ""
echo "✓ Bulk migration complete!"
echo ""
echo "IMPORTANT: Please review and manually handle:"
echo "  - Batch operations (commented out)"
echo "  - Complex queries with multiple where clauses"
echo "  - Transaction operations"
echo "  - .add() operations that rely on .id property"
echo ""
