# Setup Guide – EFP PSO

Quick start guide to get the project running on your local machine.

## ✅ Step-by-Step Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/efp-pso.git
cd efp-pso
```

### Step 2: Verify Prerequisites

Ensure you have the following installed on your system:

```bash
# Check Node.js version (should be v18 or higher)
node --version

# Check npm version (should be v8 or higher)
npm --version

# Check SQL Server is running
# Verify you can connect to your SQL Server instance
```

If any are missing, install them before proceeding.

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```
### Step 3: Create Environment File

Create a `.env` file in the `backend/` directory:

```bash
# Create from template (if exists)
cp .env.example .env

# Or create new file
touch .env
```

### Step 4: Configure Environment Variables

Edit `backend/.env` and add these values:

```env
# Database Connection
DATABASE_URL="sqlserver://YourUsername:YourPassword@localhost:1433/efp_pso?encrypt=true&trustServerCertificate=false&connectionTimeout=30000"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_key_here_minimum_32_characters

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: External APIs
GEMINI_API_KEY=your_gemini_api_key_here
TELEBIRR_API_KEY=your_telebirr_api_key_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**⚠️ Important:** Replace placeholders with your actual credentials.

### Step 5: Setup Database

#### Option A: SQL Server Local (Windows)

```bash
# Ensure SQL Server is running
# Create database using SQL Server Management Studio or sqlcmd:

sqlcmd -S localhost -U SA -P 'YourPassword'
# Then run:
CREATE DATABASE efp_pso;
GO
exit
```

#### Option B: SQL Server Docker

```bash
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourPassword123!' \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:latest
```

### Step 6: Run Database Migrations

```bash
cd backend

# Create tables and schema
npx prisma migrate deploy

# Or if migrations don't exist:
npx prisma db push
```

### Step 7: (Optional) Seed Initial Data

```bash
# If a seed file exists:
npx prisma db seed
```

### Step 8: Start Backend Server

```bash
npm run dev
```

✅ **Success!** Backend should now run on **http://localhost:5000**

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Create .env.local
touch .env.local
```

### Step 4: Configure Environment Variables

Add to `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 5: Start Development Server

```bash
npm run dev
```

✅ **Success!** Frontend should now run on **http://localhost:3000**

---

## 🚀 Running Both Servers Together

**Option 1: Two Terminal Windows**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Using npm-run-all (Single Terminal)**

First, install globally:
```bash
npm install -g npm-run-all
```

Then from project root:
```bash
npm-run-all --parallel backend:dev frontend:dev
```

**Add this to root `package.json`:**
```json
{
  "scripts": {
    "dev": "npm-run-all --parallel backend:dev frontend:dev",
    "backend:dev": "cd backend && npm run dev",
    "frontend:dev": "cd frontend && npm run dev"
  }
}
```

---

## ✨ First-Time Access

### Default Test Credentials

Check with your team lead for test user credentials, or create a new user via the registration endpoint.

### Login

1. Open **http://localhost:3000** in your browser
2. Enter credentials
3. You should see the dashboard

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed

**Error Message:**
```
P1001 – Cannot reach the database server
```

**Solutions:**
```bash
# 1. Verify SQL Server is running
# Windows: Check SQL Server Configuration Manager

# 2. Test connection string
sqlcmd -S localhost -U SA -P 'YourPassword'

# 3. Check DATABASE_URL format
# Should match: sqlserver://user:password@host:port/database

# 4. Rebuild migrations
cd backend
npx prisma migrate reset
npx prisma migrate deploy
```

### Issue: Port Already in Use

**Error:**
```
Port 3000 is already in use
Port 5000 is already in use
```

**Solutions:**
```bash
# Frontend on different port
cd frontend
npm run dev -- --port 3001

# Backend on different port
cd backend
PORT=5001 npm run dev

# Kill process on specific port (Linux/Mac)
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

### Issue: CORS Errors

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Ensure backend is running on `http://localhost:5000`
2. Check `frontend/.env.local` has correct `VITE_API_BASE_URL`
3. Verify backend CORS configuration in `backend/src/server.ts`

### Issue: Module Not Found

**Error:**
```
Cannot find module '@/...'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check tsconfig.json paths configuration
# Verify @/ maps to ./src
```

### Issue: Environment Variables Not Loading

**Error:**
```
undefined value for process.env.DATABASE_URL
```

**Solution:**
```bash
# 1. Verify .env file exists and has correct values
ls -la backend/.env

# 2. Check you're in correct directory
pwd  # Should be in backend/ folder

# 3. Restart dev server
npm run dev
```

---

## 📦 Build for Production

### Build Backend

```bash
cd backend
npm run build
npm start
```

### Build Frontend

```bash
cd frontend
npm run build
npm run preview
```

Output will be in `frontend/dist/` directory.

---

## 🗑️ Clean Reinstall

If you want to start fresh:

```bash
# Remove node_modules and lock files
cd backend
rm -rf node_modules package-lock.json
cd ../frontend
rm -rf node_modules package-lock.json
cd ..

# Delete database (CAREFUL!)
# Use SQL Server Management Studio or:
sqlcmd -S localhost -U SA -P 'YourPassword'
# DROP DATABASE efp_pso;
# GO

# Reinstall everything
cd backend && npm install
cd ../frontend && npm install

# Recreate database
cd backend
npx prisma migrate deploy
```

---

## ✅ Verification Checklist

Before pushing to GitHub:

- [ ] Backend `.env` configured with real database credentials
- [ ] Frontend `.env.local` has correct API URL
- [ ] Both servers start without errors
- [ ] Can log in to the application
- [ ] File uploads work
- [ ] Database is properly seeded
- [ ] No console errors in browser dev tools
- [ ] No sensitive files in `.gitignore`

---

## 🆘 Need Help?

1. **Check Documentation:** See [README.md](./README.md)
2. **Review Logs:** Check terminal output for errors
3. **GitHub Issues:** Search existing issues or create new one
4. **Contact Team:** Reach out to project maintainer

---

**Last Updated:** July 9, 2026  
**Version:** 1.0.0
