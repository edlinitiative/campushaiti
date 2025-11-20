#!/bin/bash

# Replace adminAuth imports with getAdminAuth
find app/api -name "*.ts" -type f -exec sed -i 's/import { adminAuth }/import { getAdminAuth }/g' {} \;

# Replace adminAuth usage with getAdminAuth() calls
find app/api -name "*.ts" -type f -exec sed -i 's/\badminAuth\./getAdminAuth()./g' {} \;
find app/api -name "*.ts" -type f -exec sed -i 's/\badminAuth,/getAdminAuth,/g' {} \;

echo "Fixed admin imports in API routes"
