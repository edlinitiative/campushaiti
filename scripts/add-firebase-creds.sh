#!/bin/bash

echo "=============================================="
echo "Firebase Credentials Setup for Migration"
echo "=============================================="
echo ""
echo "Get your credentials from:"
echo "https://vercel.com/edlinitiative/campushaiti/settings/environment-variables"
echo ""
echo "You need to copy 3 values from Vercel."
echo ""

# Read PROJECT_ID
echo -n "Paste FIREBASE_PROJECT_ID: "
read PROJECT_ID

# Read CLIENT_EMAIL
echo -n "Paste FIREBASE_CLIENT_EMAIL: "
read CLIENT_EMAIL

# Read PRIVATE_KEY
echo "Paste FIREBASE_PRIVATE_KEY (including quotes and \\n characters):"
echo "(It should start with \"-----BEGIN PRIVATE KEY-----)"
read -r PRIVATE_KEY

# Append to .env.local
echo "" >> .env.local
echo "# Firebase Admin Credentials (for migration only)" >> .env.local
echo "FIREBASE_PROJECT_ID=$PROJECT_ID" >> .env.local
echo "FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL" >> .env.local
echo "FIREBASE_PRIVATE_KEY=$PRIVATE_KEY" >> .env.local

echo ""
echo "✅ Credentials added to .env.local"
echo ""
echo "Now run: node scripts/migrate-firestore-data.js"
