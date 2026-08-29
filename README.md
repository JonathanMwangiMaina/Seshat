# **RetailPass**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.9-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://vercel.com)

A modern authentication platform built with Next.js 15 that provides secure user registration, login, and profile management with intelligent password strength analysis. RetailPass delivers real-time password security feedback using algorithmic validation, helping users create stronger credentials.

## **Key Features**

- **Smart Password Analysis** — Real-time password strength assessment with actionable security recommendations based on length, character variety, and common pattern detection
- **Secure Authentication System** — Complete user authentication flow with session management, persistent login state, and client-side credential handling
- **Profile Management** — Full-featured user profile interface supporting account updates, password changes, and secure session control
- **Modern UI/UX** — Built with shadcn/ui, Radix UI primitives, and Tailwind CSS for a responsive, accessible, and visually polished experience

## **Architecture / System Design**

RetailPass follows a modern Next.js Pages Router architecture with a full-stack backend:

1. **Authentication Backend**: Production-ready authentication system with PostgreSQL/Supabase database, Prisma ORM, JWT tokens in HTTP-only cookies, and bcrypt password hashing. All authentication state managed server-side with secure session handling.

2. **Database Layer**: Prisma ORM 7 with PostgreSQL adapter connecting to Supabase managed database. Connection pooling for optimal performance. User data persisted with proper migrations and type-safe queries.

3. **API Routes**: Six RESTful authentication endpoints (`/api/auth/*`) handling signup, login, logout, profile management, password changes, and session validation. JWT middleware protects authenticated routes.

4. **Password Security**: Dual-layer validation with real-time algorithmic strength analysis (`/api/analyze-password`) and server-side bcrypt hashing (10 rounds) for stored credentials.

5. **Frontend Architecture**: React Context (`AuthContext`) manages client-side authentication state by communicating with backend API. All credentials handled via secure HTTP-only cookies, eliminating XSS vulnerabilities.

6. **Component Hierarchy**: Atomic design with shadcn/ui primitives, composed into authentication forms (`SignupForm`, `LoginForm`, `ProfileForm`), orchestrated by Next.js Pages Router.

## **Prerequisites**

- **Node.js** `20.x` or higher
- **npm** `9.x` or higher
- **Supabase Account** (free tier available at https://supabase.com)

## **Installation & Setup**

### 1. Clone the repository

```bash
git clone https://github.com/JonathanMwangiMaina/retailpass.git
cd retailpass
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase Database

1. Create a free Supabase account at https://supabase.com
2. Create a new project (choose a region close to you)
3. Get your database connection string:
   - Go to **Project Settings** → **Database**
   - Under **Connection string**, select **URI** mode
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# JWT Secret (generate a secure random string)
JWT_SECRET="your-secure-random-jwt-secret-here"

# Supabase PostgreSQL Database
SUPABASE_DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres"
```

**Generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev
```

This creates the User table and other necessary database schema in your Supabase PostgreSQL database.

### 6. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:9002` (or `http://localhost:3000` if port 9002 is unavailable).

## **Usage**

### **Running the Application**

Start the development server with Turbopack (Next.js 15's optimized bundler):

```bash
npm run dev
```

### **Building for Production**

Create an optimized production build:

```bash
npm run build
npm start
```

### **Running Type Checks**

Validate TypeScript types across the codebase:

```bash
npm run typecheck
```

### **Linting**

Run ESLint to check code quality:

```bash
npm run lint
```

## **Project Structure**

```
retailpass/
├── pages/                     # Next.js Pages Router
│   ├── api/                   # API routes (backend)
│   │   ├── auth/              # Authentication API endpoints
│   │   │   ├── signup.ts      # User registration
│   │   │   ├── login.ts       # User login
│   │   │   ├── logout.ts      # User logout
│   │   │   ├── me.ts          # Get current user
│   │   │   ├── profile.ts     # Update user profile
│   │   │   └── password.ts    # Change password
│   │   └── analyze-password.ts # Password strength API
│   ├── _app.tsx              # App wrapper with providers
│   ├── _document.tsx         # HTML document structure
│   ├── index.tsx             # Home page (redirects)
│   ├── login.tsx             # Login page
│   ├── signup.tsx            # Signup page
│   └── profile.tsx           # User profile page
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma         # Prisma schema (User model)
│   ├── migrations/           # Database migration history
│   └── prisma.config.ts      # Prisma configuration
├── src/
│   ├── components/           # React components
│   │   ├── auth/             # Authentication components
│   │   ├── profile/          # Profile management components
│   │   ├── layout/           # Layout components (header, etc.)
│   ├── lib/                   # Backend utilities
│   │   ├── prisma.ts         # Prisma client with PostgreSQL adapter
│   │   ├── auth.ts           # JWT token utilities
│   │   ├── password.ts       # Password hashing (bcrypt)
│   │   └── middleware.ts     # Authentication middleware
│   ├── types/                 # TypeScript type definitions
│   │   └── api.ts            # API request/response types
│   │   ├── shared/           # Shared/common components
│   │   └── ui/               # shadcn/ui base components
│   ├── contexts/             # React Context providers
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   └── password-validator.ts  # Password strength algorithm
│   └── types/                # TypeScript type definitions
├── styles/                   # Global styles
│   └── globals.css          # Tailwind CSS styles
├── public/                   # Static assets
├── package.json              # Project dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## **Tech Stack**

| Category                | Technology                                                      |
| ----------------------- | --------------------------------------------------------------- |
| **Framework**           | Next.js 15.3.9 (React 18, Pages Router, Turbopack)              |
| **Language**            | TypeScript 5.8.2                                                |
| **Password Validation** | Local algorithmic analysis (length, variety, pattern detection) |
| **UI Library**          | shadcn/ui, Radix UI primitives                                  |
| **Styling**             | Tailwind CSS 3.4, tailwindcss-animate                           |
| **Form Management**     | React Hook Form 7.54 with Zod validation                        |
| **State Management**    | React Context API                                               |
| **Icons**               | Lucide React                                                    |
| **Deployment**          | Vercel                                                          |

## **Key Design Patterns**

- **API Routes** — Password analysis runs through Next.js API routes for consistent server-side validation
- **Pages Router Architecture** — Uses proven Next.js Pages Router for reliable SSR and static generation
- **Atomic Design** — UI components are structured from base primitives (shadcn/ui) to composed authentication forms
- **Type Safety** — Full TypeScript coverage with Zod schema validation for runtime type safety and form validation
- **Client-Side Routing** — Fast navigation with window.location for authentication flows

## **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by Jonathan Maina**
