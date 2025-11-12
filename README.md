# Campus Haiti 🎓

A comprehensive university application platform for Haiti, built with Next.js 14, Firebase, and modern web technologies.

## 🚀 Features

- **Multi-step Application Flow**: Profile → Documents → Programs → Payment → Review/Submit
- **Firebase Authentication**: Email link + WebAuthn/Passkeys support
- **Cloud Firestore**: Real-time database with RBAC security rules
- **Firebase Storage**: Secure document uploads with validation
- **Payment Integration**: Stripe Checkout + MonCash provider
- **Internationalization**: English, French, and Haitian Creole (next-intl)
- **Role-Based Access Control**: APPLICANT, REVIEWER, and ADMIN roles
- **Email Notifications**: Transactional emails with Resend
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Type-Safe**: Full TypeScript coverage
- **Testing**: Unit tests (Vitest) + E2E tests (Playwright)
- **CI/CD**: GitHub Actions workflow

## 📁 Project Structure

```
campus-haiti/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── apply/         # Multi-step application flow
│   │   ├── dashboard/     # User dashboard
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin panel
│   │   ├── partners/      # Partner universities
│   │   └── help/          # Help & FAQ
│   └── api/               # API routes
│       ├── auth/          # Session & passkey endpoints
│       └── payments/      # Stripe & MonCash integrations
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth components
│   └── apply/             # Application step components
├── lib/
│   ├── firebase/          # Firebase client & admin
│   ├── auth/              # Server auth helpers
│   ├── types/             # TypeScript types
│   ├── email/             # Email templates
│   └── payments/          # Payment providers
├── messages/              # i18n dictionaries (en, fr, ht)
├── __tests__/             # Unit tests
├── e2e/                   # E2E tests
├── firestore.rules        # Firestore security rules
└── storage.rules          # Storage security rules
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Firebase Auth (Email Link + Passkeys)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Payments**: Stripe, MonCash
- **Email**: Resend
- **i18n**: next-intl
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase, Stripe, Resend, and MonCash credentials.

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run typecheck     # Type checking
npm run lint          # Linting
```

## 🚀 Deployment

Deploy to Vercel:

```bash
vercel
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run E2E tests

## 📄 License

This project is private and proprietary.

---

Built with ❤️ for Haiti's students
