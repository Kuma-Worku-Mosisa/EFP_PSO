# Contributing to EFP PSO

Thank you for your interest in contributing! This document provides guidelines for participating in the EFP PSO project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 🤝 Code of Conduct

This project adheres to a [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

**Expected Behavior:**
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy to community members

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Visit https://github.com/your-org/efp-pso
# Click "Fork" button in top-right corner
```

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/efp-pso.git
cd efp-pso
git remote add upstream https://github.com/your-org/efp-pso.git
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 4. Follow Setup Guide

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

---

## 💻 Development Process

### Local Development

```bash
# Ensure both servers are running
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2
```

### Code Quality Checks

```bash
# Backend
cd backend
npm run lint              # Run linter
npm run type-check        # TypeScript type checking

# Frontend
cd frontend
npm run lint              # Run linter
npm run type-check        # TypeScript type checking
```

### Testing (if tests exist)

```bash
cd backend
npm test                  # Run unit tests

cd ../frontend
npm test                  # Run component tests
```

---

## 📝 Coding Standards

### TypeScript

- **Always use TypeScript** – No JavaScript files in production code
- **Define explicit types** – Avoid `any` type
- **Use interfaces** for objects with known structure
- **Export types** – Make reusable types available to other modules

**Example:**
```typescript
interface User {
  id: number;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

export const getUser = async (id: number): Promise<User | null> => {
  // Implementation
};
```

### React Components

- **Use functional components** – No class components
- **Hooks first** – `useState`, `useEffect`, `useContext`
- **Prop types** – Define `interface Props` for component props
- **Memoization** – Use `React.memo` for performance-critical components

**Example:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx       # One component per file
│   ├── Modal.tsx
│   └── index.ts         # Export all components
│
├── pages/              # Page components (route-level)
│   ├── Dashboard.tsx
│   └── Settings.tsx
│
├── lib/                # Utilities & helpers
│   ├── api.ts          # API request helpers
│   ├── utils.ts        # General utilities
│   └── calendar.ts     # Calendar functions
│
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
│
└── types/              # TypeScript type definitions
    └── index.ts
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Functions | camelCase | `getUserData()` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Interfaces | PascalCase with `I` prefix (optional) | `IUser` or `User` |
| Files | kebab-case (preferred) or camelCase | `user-profile.ts` |
| CSS Classes | kebab-case | `user-profile-card` |

### Styling

- **Use Tailwind CSS** for styling
- **Avoid inline styles** – Use utility classes
- **Responsive design** – Always consider mobile screens
- **Color consistency** – Use CSS variables for brand colors

**Example:**
```typescript
<div className="flex items-center justify-between gap-4 px-4 py-2 bg-blue-50 rounded-lg">
  <span className="text-sm font-semibold text-gray-700">Status</span>
  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Active</span>
</div>
```

### Comments & Documentation

- **Avoid obvious comments** – Code should be self-documenting
- **Document complex logic** – Explain "why", not "what"
- **Use JSDoc for exported functions** – Helps with IDE autocomplete

**Example:**
```typescript
/**
 * Converts a Gregorian date to Ethiopian calendar format.
 * Falls back to manual calculation if Intl.DateTimeFormat doesn't support ethiopic calendar.
 *
 * @param date - The Gregorian date to convert
 * @param options - Formatting options (includeTime: boolean)
 * @returns Formatted Ethiopian date string
 */
export const convertToEthiopianDate = (date: Date, options?: { includeTime?: boolean }): string => {
  // Implementation
};
```

---

## 📌 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` – A new feature
- `fix` – A bug fix
- `docs` – Documentation only changes
- `style` – Changes that don't affect code meaning (formatting, semicolons, etc.)
- `refactor` – Code change that neither fixes bugs nor adds features
- `perf` – Code change that improves performance
- `test` – Adding or updating tests
- `chore` – Changes to build process, dependencies, etc.

### Examples

```bash
# Feature commit
git commit -m "feat(auth): add two-factor authentication support"

# Bug fix commit
git commit -m "fix(upload): prevent duplicate file names in same organization"

# Documentation commit
git commit -m "docs: update installation instructions"

# Refactoring commit
git commit -m "refactor(api): simplify address change request logic"
```

### Commit Guidelines

- **One logical change per commit** – Keep commits focused
- **Use present tense** – "Add feature" not "Added feature"
- **Reference issues** – "Closes #123" in commit body
- **Keep it concise** – First line max 50 characters
- **Detailed body** – Explain the "why", not just the "what"

---

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch** with latest upstream changes
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run code checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

3. **Test thoroughly** – Verify no console errors

4. **Update documentation** – If changes affect API or setup

### Creating the PR

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Visit repository and click "Compare & pull request"

3. **Fill PR template** with:
   - **Description** – What does this PR do?
   - **Type** – Bug fix / Feature / Documentation / Refactor
   - **Related Issues** – "Closes #123"
   - **Testing** – How to test these changes
   - **Screenshots** – If UI changes (before/after)

### PR Title Format

```
[Type] Short description

# Examples:
[Feature] Add address change request system
[Fix] Resolve date formatting bug in Ethiopian calendar
[Docs] Update database setup instructions
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Related Issue
Closes #<issue_number>

## How to Test
Steps to test this feature:
1. ...
2. ...

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] TypeScript types are correct
- [ ] Comments are added for complex logic
- [ ] Documentation is updated
- [ ] No new warnings in console
- [ ] Tests pass (if applicable)
```

### Review Process

- Maintainers will review your PR within 5 business days
- Address feedback promptly
- Rebase and force-push if needed: `git push -f origin branch-name`
- PR will be merged once approved

---

## 🐛 Reporting Bugs

### Before Creating an Issue

1. **Search existing issues** – Your bug may already be reported
2. **Check documentation** – Solution might be in docs
3. **Try recent version** – Bug might be already fixed

### Bug Report Template

```markdown
## Description
Clear, concise description of the bug.

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- **OS:** Windows / macOS / Linux
- **Node.js Version:** 18.x / 19.x
- **Browser:** Chrome / Firefox / Safari
- **Branch:** main / develop

## Screenshots
[Add screenshots showing the bug]

## Additional Context
Any other relevant information.
```

---

## ✨ Suggesting Features

### Before Suggesting

1. **Search existing feature requests**
2. **Check ROADMAP** if available
3. **Verify it aligns** with project goals

### Feature Request Template

```markdown
## Description
Clear description of the feature you'd like.

## Problem Statement
What problem does this solve?

## Proposed Solution
How would you like it to work?

## Alternative Solutions
Other ways to solve this problem?

## Examples
Real-world use cases.

## Additional Context
Any other information.
```

---

## 📚 Resources

- **[Setup Guide](./SETUP.md)** – Getting your environment ready
- **[README](./README.md)** – Project overview and documentation
- **[TypeScript Docs](https://www.typescriptlang.org/docs/)** – TypeScript reference
- **[React Docs](https://react.dev/)** – React documentation
- **[Tailwind CSS](https://tailwindcss.com/docs)** – Tailwind utilities

---

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

For questions, reach out to the maintainers or open a discussion.

---

**Last Updated:** July 9, 2026  
**Version:** 1.0.0
