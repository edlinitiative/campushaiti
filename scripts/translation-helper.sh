#!/bin/bash

# Translation Integration Helper Script
# This script helps systematically add useTranslations to remaining pages

echo "🌍 Campus Haiti - Translation Integration Helper"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Translation Status:${NC}"
echo "✅ Privacy Page (app/[locale]/dashboard/privacy/page.tsx) - 100%"
echo "✅ Dashboard Page (app/[locale]/dashboard/page.tsx) - 80%"
echo "🟡 Security Dashboard (app/[locale]/admin/security/page.tsx) - Hook added"
echo ""

echo -e "${YELLOW}Remaining Pages to Integrate:${NC}"
echo ""

echo -e "${GREEN}High Priority (User-Facing):${NC}"
echo "1. DocumentsStep.tsx - Upload validation and preview"
echo "   - Translation namespace: 'documents'"
echo "   - Keys: upload, preview, replace, validationError, etc."
echo ""

echo "2. School Applications Bulk Actions"
echo "   - Files: app/[locale]/schools/dashboard/applications/page.tsx"
echo "   - Translation namespace: 'admin.applications'"
echo "   - Keys: bulkActions, selectAll, updateStatus, sendEmail, exportCSV"
echo ""

echo -e "${BLUE}Medium Priority (Admin):${NC}"
echo "3. Admin Analytics (app/[locale]/admin/analytics/page.tsx)"
echo "   - Translation namespace: 'admin.analytics'"
echo "   - Keys: title, revenue, applications, users, exportReport"
echo ""

echo "4. Admin Universities (app/[locale]/admin/universities/page.tsx)"
echo "   - Translation namespace: 'admin.universities'"
echo "   - Keys: title, createUniversity, bulkApprove, etc."
echo ""

echo "5. Admin Programs (app/[locale]/admin/programs/page.tsx)"
echo "   - Translation namespace: 'admin.programs'"
echo "   - Keys: title, createProgram, isActive, etc."
echo ""

echo "6. School Analytics (app/[locale]/schools/dashboard/analytics/page.tsx)"
echo "   - Translation namespace: 'schools.analytics'"
echo "   - Keys: title, trends, conversionFunnel, etc."
echo ""

echo ""
echo -e "${GREEN}Quick Integration Steps:${NC}"
echo "1. Import useTranslations: import { useTranslations } from 'next-intl';"
echo "2. Initialize hook: const t = useTranslations('namespace');"
echo "3. Replace strings: 'Hardcoded Text' → {t('key')}"
echo "4. Test with language switcher"
echo ""

echo -e "${BLUE}Test Translation:${NC}"
echo "npm run dev"
echo "# Navigate to page and switch languages (EN/FR/HT)"
echo ""

echo -e "${YELLOW}All translation keys are already defined in:${NC}"
echo "- messages/en.json"
echo "- messages/fr.json"  
echo "- messages/ht.json"
echo ""

echo "Happy translating! 🚀"
