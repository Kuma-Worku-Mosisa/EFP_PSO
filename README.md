# EFP PSO – Enterprise File Platform Personnel Security Operations

A full-stack enterprise resource planning system for managing personnel security operations, document uploads, organizational management, and address change requests. Built with **React**, **Express.js**, **TypeScript**, **Prisma ORM**, and **Tailwind CSS**.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [File Upload System](#file-upload-system)
- [Language Support](#language-support)
- [Clear Text Message Guide](#-clear-text-message-guide)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality

- **Personnel Management** – Create, update, and manage employee records
- **Organization Management** – Handle organizational structure and metadata
- **Document Upload System** – Professional file organization by role and organization
- **Address Change Requests** – Submit and approve location change requests
- **Multilingual Support** – English and Amharic interface
- **Ethiopian Calendar Integration** – Display dates in Ethiopian calendar format
- **Role-Based Access Control** – Admin, super Admin,System Admin, Hr org manager, field reviewer,  and License authority roles
- **Audit Logging** – Track all system changes
- **Notifications** – Bilingual email and in-app alerts

### Advanced Features

- Personnel transfers and position changes
- Certification and renewal management
- Incident and inspection reporting
- Formal request submissions
- Criminal record checks
- Regular and periodic reporting
- License stamping and verification

---

## 🛠 Tech Stack

### Frontend

| Technology          | Purpose                    |
| ------------------- | -------------------------- |
| **React 19**        | UI framework               |
| **TypeScript**      | Type-safe development      |
| **Tailwind CSS v4** | Styling and utilities      |
| **Framer Motion**   | Animations and transitions |
| **React Router v7** | Client-side routing        |
| **React Hook Form** | Form state management      |
| **Zod**             | Schema validation          |
| **Vite**            | Build tool and dev server  |

### Backend

| Technology               | Purpose                        |
| ------------------------ | ------------------------------ |
| **Node.js / Express.js** | Server framework               |
| **TypeScript**           | Type-safe backend code         |
| **Prisma ORM**           | Database abstraction layer     |
| **SQL Server**           | Primary database               |
| **Multer**               | File upload handling           |
| **JWT**                  | Authentication & authorization |
| **CORS**                 | Cross-origin resource sharing  |

### DevTools

- ESLint & TypeScript compiler for code quality
- npm/pnpm for package management
- Vite for frontend bundling
- tsx for backend TypeScript execution

---

## 📁 Project Structure

```
EFP_PSO/
├── backend/                          # Express.js server
│   ├── src/
│   │   ├── server.ts                 # Main server entry
│   │   ├── config/                   # Configuration files
│   │   ├── lib/                      # Shared utilities
│   │   ├── middleware/               # Auth, file upload, role-based
│   │   ├── modules/                  # Feature modules
│   │   │   ├── admin/                # Admin operations
│   │   │   ├── application/          # Application management
│   │   │   ├── employee/             # Employee records
│   │   │   ├── organization/         # Organization & address changes
│   │   │   ├── user/                 # User management
│   │   │   ├── notification/         # Notifications
│   │   │   └── ...                   # Other modules
│   │   ├── types/                    # TypeScript type definitions
│   │   └── utils/                    # Utilities & helpers
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── uploads/                      # Document storage
│   ├── package.json
│   ├── tsconfig.json
│   └── README_FILE_UPLOAD.md         # Upload system docs
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── main.tsx                  # Entry point
│   │   ├── App.tsx                   # Root component
│   │   ├── components/               # Reusable components
│   │   ├── pages/                    # Page components
│   │   ├── context/                  # Context (language, auth)
│   │   ├── lib/                      # Utilities (API, calendar)
│   │   ├── index.css                 # Global styles
│   │   └── vite-env.d.ts             # Vite type definitions
│   ├── package.json
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json
│   └── index.html
│
├── scripts/                          # Utility scripts
│   └── add_template.py               # Template generation
│
├── IMPLEMENTATION_SUMMARY.md         # Implementation details
├── FILE_UPLOAD_SYSTEM.md             # File upload documentation
└── README.md                         # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v8+ or **pnpm** v7+
- **SQL Server** 2016+ (local or remote)
- **Git** (for version control)

### Verify Installation

```bash
node --version      # Check Node.js version
npm --version       # Check npm version
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/my-org/efp-pso.git
cd efp-pso
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Return to Project Root

```bash
cd ..
```

---

## ⚙️ Configuration

### Backend Environment Setup

1. **Create `.env` file in `backend/` directory:**

```bash
cd backend
cp .env.example .env  # If template exists, or create manually
```

2. **Add the following environment variables to `.env`:**

```env
# Database
DATABASE_URL="sqlserver://user:password@localhost:1433/efp_pso?encrypt=true&trustServerCertificate=false&connectionTimeout=30000"

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760  # 10 MB in bytes
UPLOAD_DIR=./uploads

# External APIs
GEMINI_API_KEY=your_gemini_api_key
TELEBIRR_API_KEY=your_telebirr_api_key
```

### Frontend Environment Setup

1. **Create `.env.local` file in `frontend/` directory:**

```bash
cd frontend
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
```

### Database Setup (SQL Server)

1. **Create Database:**

```sql
CREATE DATABASE efp_pso;
USE efp_pso;
```

2. **Run Prisma Migrations:**

```bash
cd backend
npx prisma migrate deploy
```

3. **Seed Initial Data (optional):**

```bash
npx prisma db seed
```

---

## 🏃 Running the Application

### Development Mode

#### Terminal 1 – Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 – Frontend Dev Server

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Production Build

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
# Serves optimized build on http://localhost:5000
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/login`    | User login        |
| POST   | `/api/auth/register` | User registration |
| POST   | `/api/auth/logout`   | User logout       |
| GET    | `/api/users/me`      | Get current user  |

### Organizations

| Method | Endpoint                                     | Description              |
| ------ | -------------------------------------------- | ------------------------ |
| GET    | `/api/organizations`                         | List organizations       |
| POST   | `/api/organizations`                         | Create organization      |
| GET    | `/api/organizations/:id`                     | Get organization details |
| PATCH  | `/api/organizations/:id`                     | Update organization      |
| POST   | `/api/organizations/address-change-requests` | Submit address change    |
| GET    | `/api/organizations/address-change-requests` | List address changes     |

### Employees

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/api/employees`     | List employees       |
| POST   | `/api/employees`     | Create employee      |
| GET    | `/api/employees/:id` | Get employee details |
| PATCH  | `/api/employees/:id` | Update employee      |

### File Upload

| Method | Endpoint                           | Description      |
| ------ | ---------------------------------- | ---------------- |
| POST   | `/api/applications/upload`         | Upload documents |
| GET    | `/api/organizations/:id/documents` | List documents   |

### Location

| Method | Endpoint                            | Description            |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/api/location/regions`             | List regions           |
| GET    | `/api/location/regions/:id/zones`   | List zones by region   |
| GET    | `/api/location/zones/:id/woredas`   | List woredas by zone   |
| GET    | `/api/location/woredas/:id/kebeles` | List kebeles by woreda |

---

## 🗄️ Database Setup

### Schema Overview

Key tables:

- `Users` – System users with roles
- `Organizations` – Client organizations
- `Employees` – Personnel records
- `Addresses` – Location data
- `Applications` – Application workflows
- `OrganizationAddressChangeRequest` – Address change requests
- `Certifications` – Professional certifications
- `Notifications` – System notifications
- `AuditLogs` – Change tracking

### Reset Database (Development)

```bash
cd backend
npx prisma migrate reset
# ⚠️ WARNING: This deletes all data. Use only in development!
```

---

## 📤 File Upload System

The system automatically organizes uploaded documents by organization and personnel role.

### Folder Structure

```
uploads/
├── Organization A/
│   ├── manager/
│   │   ├── 1715520000000-education.pdf
│   │   └── 1715520001000-passport.pdf
│   ├── operations/
│   └── administrator/
└── Organization B/
    ├── manager/
    └── security_guard/
```

### Supported File Types

- **Documents:** PDF, DOC, DOCX, XLS, XLSX
- **Images:** JPG, JPEG, PNG, GIF, BMP
- **Size Limit:** 10 MB per file

### Upload via API

```bash
curl -X POST http://localhost:5000/api/applications/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "manager_education_doc=@education.pdf" \
  -F "operations_training_doc=@training.pdf"
```

For detailed documentation, see [FILE_UPLOAD_SYSTEM.md](./FILE_UPLOAD_SYSTEM.md).

---

## 🌍 Language Support

The application supports **English** and **Amharic** (Ethiopian) interfaces.

### Language Features

- **Dynamic UI Translation** – All labels, buttons, messages in both languages
- **Ethiopian Calendar** – Dates displayed in Ethiopian calendar when in Amharic mode
- **Gregorian Calendar** – Standard calendar for English mode
- **RTL Support** – Proper right-to-left layout for Amharic text

### Switching Language

Users can toggle language via the language selector in the UI. The selection is persisted in `localStorage`.

### Adding New Translations

1. Update `useLanguage()` context in `frontend/src/context/LanguageContext.tsx`
2. Use conditional rendering: `{language === "am" ? "አማርኛ ጽሑፍ" : "English Text"}`

---

## � Clear Text Message Guide

Before pushing your code to GitHub, follow these steps to ensure clean commits and secure code:

### 1. **Review Uncommitted Changes**

```bash
git status
git diff
```

Check what you're about to commit in plain, readable format.

### 2. **Verify Sensitive Data is NOT Included**

- ❌ Remove `.env` files (add to `.gitignore`)
- ❌ Remove `node_modules/` directories
- ❌ Remove build output folders (`dist/`, `build/`)
- ❌ Remove database credentials or API keys
- ❌ Remove temporary files and logs
- ❌ Remove large `uploads/` directory

Check with:

```bash
git check-ignore --verbose -r .
```

### 3. **Use Clear, Descriptive Commit Messages**

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```bash
# Good commits
git commit -m "feat(auth): add JWT token validation middleware"
git commit -m "fix(employee): resolve gender distribution chart rendering issue"
git commit -m "docs(readme): update installation instructions with clear text message guide"
git commit -m "refactor(dashboard): remove unused Filter import and fix TypeScript errors"

# Bad commits (avoid these)
git commit -m "update"
git commit -m "fixes"
git commit -m "as requested"
git commit -m "changes"
```

### 4. **Clean Your Working Directory**

```bash
# Remove untracked files (review first)
git clean -fd

# Stage only intended changes
git add .

# Verify staged changes
git diff --cached
```

### 5. **Create Meaningful Commits**

One commit per logical change:

```bash
git commit -m "feat(hr-dashboard): add employee status overview chart

- Add status distribution pie chart
- Implement real-time metrics calculation
- Fix TypeScript type safety issues with percent calculation

Closes #42"
```

### 6. **Push to GitHub**

```bash
# Verify your branch
git branch -v

# Push changes
git push origin main

# Or create a pull request for code review
git push origin feature-branch
```

### 7. **Pre-Push Checklist**

Before pushing, verify:

- [ ] All TypeScript errors resolved (`npm run lint`)
- [ ] No console.log or debugging code left
- [ ] `.env` files in `.gitignore`
- [ ] `.env.local` files in `.gitignore`
- [ ] `node_modules/` in `.gitignore`
- [ ] `dist/` and `build/` in `.gitignore`
- [ ] `uploads/` in `.gitignore` (or set proper rules)
- [ ] No hardcoded credentials or sensitive data
- [ ] Clear commit message written
- [ ] Changes tested locally
- [ ] Code follows project conventions
- [ ] Removed any debug imports or unused code

### 8. **Verify After Push**

```bash
# Confirm push was successful
git log --oneline -5

# Check GitHub to ensure files appear correctly
# Verify no sensitive data is visible in files
```

## 🔐 Git Ignore Essentials

Ensure your `.gitignore` contains:

```
# Environment files
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json
pnpm-lock.yaml

# Build outputs
dist/
build/
.next/
*.tsbuildinfo

# Uploads and temp files
uploads/
.tmp/

# IDE & OS
.vscode/settings.json
.DS_Store
*.log
npm-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Database
*.db
*.sqlite
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `P1001 – Cannot reach database`

**Solution:**

- Verify SQL Server is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

```bash
# Test connection
npx prisma db push
```

### Frontend Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Use a different port
npm run dev -- --port 3001
```

### Module Not Found Errors

**Error:** `Cannot find module '@/...'`

**Solution:**

- Ensure `tsconfig.json` has correct path mappings
- Reinstall dependencies: `rm -rf node_modules && npm install`

### TypeScript Errors After Changes

**Error:** `'xyz' is declared but its value is never read`

**Solution:**

- Remove unused imports or variables
- Use Pylance refactoring: `source.unusedImports`

---

## 📚 Documentation

- [File Upload System](./FILE_UPLOAD_SYSTEM.md) – Detailed upload mechanics
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) – Feature implementation details
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) – Overview of completed work

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes with clear messages: `git commit -am 'feat(module): add descriptive message'`
4. Push branch: `git push origin feature/your-feature`
5. Open a Pull Request with detailed description

### Coding Standards

- Use TypeScript for all new code
- Follow Prettier formatting: `npm run lint`
- Write meaningful commit messages (use the format above)
- Test changes before submitting PR
- Keep imports clean and remove unused ones
- Ensure all TypeScript type errors are resolved

### Before Submitting a Pull Request

Follow the **Clear Text Message Guide** above to ensure your code is ready for merge.

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

## 👥 Support

For issues, questions, or feature requests:

- **Email:** support@example.com
- **Issues:** [GitHub Issues](https://github.com/your-org/efp-pso/issues)
- **Documentation:** See `/docs` folder

---

## 🔐 Security Notice

⚠️ **IMPORTANT:** Before pushing to production or public repositories:

1. **Never commit `.env` files** – Add to `.gitignore`
2. **Change all secrets** – Use strong, unique values in production
3. **Enable HTTPS** – Use TLS/SSL certificates
4. **Rotate JWT keys** – Generate new secrets for production
5. **Database Backups** – Set up automated backups
6. **Rate Limiting** – Implement API rate limiting
7. **Input Validation** – Sanitize all user inputs

---

**Last Updated:** July 9, 2026  
**Version:** 1.0.0  
**Maintainer:** EFP PSO Team
