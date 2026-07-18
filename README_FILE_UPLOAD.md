# File Upload System for EFP PSO

A professional, enterprise-grade file upload and document organization system for the EFP PSO application.

## 🎯 What This Does

Automatically organizes uploaded documents into a clean folder structure:

```
uploads/
└── {OrganizationName}/
    ├── manager/
    │   ├── 1715520000000-education.pdf
    │   └── 1715520000001-medical.pdf
    ├── operations/
    ├── administrator/
    └── security_guard/
```

## ⚡ Quick Start (30 seconds)

### Upload Files

```bash
curl -X POST http://localhost:5000/api/applications/upload \
  -F "organizationName=My Agency" \
  -F "manager_education_doc=@education.pdf"
```

### Frontend Upload

```typescript
import { uploadOrganizationDocuments } from "@/lib/fileUploadHelper";

await uploadOrganizationDocuments("My Agency", {
  manager_education_doc: file1,
  operations_medical_doc: file2,
});
```

### Access Files

```
http://localhost:5000/uploads/My%20Agency/manager/{filename}
```

---

## 📚 Documentation

| Document                      | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| **QUICK_REFERENCE.md**        | 👈 Start here! Quick reference for common tasks |
| **IMPLEMENTATION_GUIDE.md**   | Detailed implementation walkthrough             |
| **FILE_UPLOAD_SYSTEM.md**     | Comprehensive system documentation              |
| **IMPLEMENTATION_SUMMARY.md** | Complete summary of what was built              |

---

## ✨ Key Features

✅ **Automatic Organization** - Files organized by organization and role  
✅ **Secure** - Multiple validation layers  
✅ **Easy Manual Review** - Browse organized documents  
✅ **Production Ready** - Error handling, logging, monitoring  
✅ **Developer Friendly** - Helper functions, example components  
✅ **Professional Structure** - Enterprise best practices

---

## 🚀 How It Works

1. **User selects files** → Frontend validates
2. **Files uploaded** → Server organizes by org/role
3. **Paths returned** → Frontend gets file paths
4. **Paths stored** → Database saves file paths
5. **Access anytime** → Files available via HTTP

---

## 📦 What's Included

### Backend

- ✅ Multer configuration with folder creation
- ✅ Document organization utilities
- ✅ Upload API endpoint
- ✅ Static file serving

### Frontend

- ✅ Upload helper functions
- ✅ File validation utilities
- ✅ Example React components
- ✅ Type definitions

### Documentation

- ✅ Implementation guide
- ✅ API reference
- ✅ Code examples
- ✅ Best practices

---

## 📋 Supported Documents

- **Personnel (4 roles):** Manager, Operations, Administrator, Security Guard
- **Per role (10 types):** Education, ID, Fingerprint, Medical, Training, Support, Guarantee, Experience, Resignation, Organization ID
- **Organization (5):** Logo, Uniform Sample, ID Sample, Training Manual, Training Certificate

**Total:** 45 document types

---

## 🔧 Technical Stack

**Backend:**

- Express.js
- Multer (multipart form data)
- Node.js File System
- TypeScript

**Frontend:**

- React
- FormData API
- TypeScript
- Fetch API

---

## 📊 Specifications

| Item             | Value                                         |
| ---------------- | --------------------------------------------- |
| Max File Size    | 10 MB                                         |
| Max Files        | 50 per upload                                 |
| Allowed Types    | PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX          |
| Storage          | `uploads/` directory (local disk)             |
| Folder Structure | `uploads/{org}/{role}/{timestamp}-{filename}` |

---

## 🔒 Security

- ✅ Server-side MIME type validation
- ✅ File size limits enforced
- ✅ Filenames sanitized and timestamped
- ✅ Directory isolation per organization
- ✅ No directory traversal allowed
- ✅ Unique filenames prevent conflicts

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── fileUpload.ts              ← Multer config
│   ├── utils/
│   │   └── documentOrganizer.ts        ← Organization logic
│   └── modules/application/
│       ├── upload.controller.ts        ← API handler
│       └── application.routes.ts       ← Routes
│
frontend/
└── src/
    ├── lib/
    │   └── fileUploadHelper.ts         ← Upload utils
    └── components/
        └── DocumentUploadExample.tsx   ← Example component
```

---

## 🎯 Use Cases

### 1. Personnel Registration

```typescript
// Upload manager documents
await uploadOrganizationDocuments("My Agency", {
  manager_education_doc: educationFile,
  manager_medical_doc: medicalFile,
  manager_fingerprint_doc: fingerprintFile,
});
```

### 2. Organization Documents

```typescript
// Upload organization documents
await uploadOrganizationDocuments("My Agency", {
  logo: logoFile,
  uniform_sample: uniformFile,
});
```

### 3. Multi-Role Upload

```typescript
// Upload for multiple roles at once
await uploadOrganizationDocuments("My Agency", {
  manager_education_doc: managerEd,
  operations_education_doc: opsEd,
  administrator_education_doc: adminEd,
});
```

---

## 🧪 Testing

### Test with cURL

```bash
# Create test file
echo "test content" > test.pdf

# Upload
curl -X POST http://localhost:5000/api/applications/upload \
  -F "organizationName=Test Org" \
  -F "manager_education_doc=@test.pdf"

# Access file
curl http://localhost:5000/uploads/Test%20Org/manager/
```

### Test with Frontend

```typescript
import {
  uploadOrganizationDocuments,
  validateFile,
} from "@/lib/fileUploadHelper";

// Validate
const validation = validateFile(file);
console.log(validation); // { valid: true }

// Upload
const result = await uploadOrganizationDocuments("Test Org", {
  manager_education_doc: file,
});
console.log(result);
// { success: true, message: '...', data: { uploadedFiles: {...} } }
```

---

## 🐛 Troubleshooting

### Upload fails

- ✅ Check file size (max 10MB)
- ✅ Verify MIME type is supported
- ✅ Check `organizationName` provided

### Files not visible

- ✅ Check `uploads/` directory exists
- ✅ Verify organization name spelling (case-sensitive)
- ✅ Check role names (manager, operations, administrator, security_guard)

### Permission errors

- ✅ Verify write permissions on `uploads/` directory
- ✅ Check disk space available
- ✅ Ensure parent directories are writable

---

## 🚀 Integration Steps

### 1. Backend Setup

```bash
# Files already created:
# - backend/src/middleware/fileUpload.ts
# - backend/src/utils/documentOrganizer.ts
# - backend/src/modules/application/upload.controller.ts

# Modifications already made:
# - backend/src/modules/application/application.routes.ts
# - backend/src/server.ts
```

### 2. Frontend Setup

```bash
# Files already created:
# - frontend/src/lib/fileUploadHelper.ts
# - frontend/src/components/DocumentUploadExample.tsx

# Usage:
import { uploadOrganizationDocuments } from '@/lib/fileUploadHelper';
```

### 3. Use in Your Components

```typescript
// Import
import { uploadOrganizationDocuments } from "@/lib/fileUploadHelper";

// Create file map
const files = new Map([["manager_education_doc", educationFile]]);

// Upload
const result = await uploadOrganizationDocuments("Agency Name", files);

// Handle response
if (result.success) {
  const uploadedPaths = result.data?.uploadedFiles;
  // Include paths in application submission
}
```

---

## 📖 Full Documentation

For detailed information, see:

1. **QUICK_REFERENCE.md** - Quick lookup for common tasks
2. **IMPLEMENTATION_GUIDE.md** - Full implementation guide
3. **FILE_UPLOAD_SYSTEM.md** - Comprehensive system documentation
4. **IMPLEMENTATION_SUMMARY.md** - Complete summary

---

## 💡 Tips & Best Practices

1. **Always validate files before upload**

   ```typescript
   const { valid, error } = validateFile(file);
   if (!valid) console.error(error);
   ```

2. **Use meaningful organization names**

   ```typescript
   // Good
   await uploadOrganizationDocuments("Beta Security Agency", files);

   // Also works (sanitized automatically)
   await uploadOrganizationDocuments("Beta Security", files);
   ```

3. **Show upload progress to users**

   ```typescript
   // TODO: Implement progress tracking
   // Consider using XMLHttpRequest.upload or fetch progress
   ```

4. **Handle network errors gracefully**

   ```typescript
   try {
     const result = await uploadOrganizationDocuments(orgName, files);
     if (!result.success) {
       showError(result.error);
     }
   } catch (err) {
     showError("Network error occurred");
   }
   ```

5. **Organize by status in database**
   - Store file paths relative to `uploads/`
   - Allows easy migration/backup
   - Supports future archival

---

## 🔄 Complete Workflow

```
User fills form
    ↓
Selects files
    ↓
Frontend validates files
    ↓
uploadOrganizationDocuments() called
    ↓
Server receives multipart/form-data
    ↓
Files organized into:
uploads/{org}/{role}/{timestamp}-{filename}
    ↓
Database-safe paths returned
    ↓
Frontend includes paths in application
    ↓
Application submitted with file paths
    ↓
Paths stored in employeeDocument table
    ↓
Admin reviews documents by browsing uploads/
```

---

## ✅ Verification Checklist

- [ ] Files created in `backend/src/middleware/`
- [ ] Files created in `backend/src/utils/`
- [ ] Files created in `backend/src/modules/application/`
- [ ] Files created in `frontend/src/lib/`
- [ ] Files created in `frontend/src/components/`
- [ ] Routes updated with upload endpoint
- [ ] Server updated with static file serving
- [ ] Documentation files present
- [ ] Example component present

---

## 🎊 You're All Set!

The file upload system is fully implemented and ready to use.

**Next Steps:**

1. Review `QUICK_REFERENCE.md`
2. Check `DocumentUploadExample.tsx` for code patterns
3. Integrate into your application workflow
4. Test with sample files
5. Customize folder structure if needed

---

## 📞 Quick Help

**How do I upload files?**
→ Use `uploadOrganizationDocuments()` or POST to `/api/applications/upload`

**Where are files stored?**
→ In `uploads/{organizationName}/{role}/` directory

**How do I access uploaded files?**
→ Via HTTP: `http://localhost:5000/uploads/{organizationName}/{role}/{filename}`

**What files can I upload?**
→ PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX (max 10MB each)

**How do I validate files?**
→ Use `validateFile()` function before uploading

**Where's the example code?**
→ `frontend/src/components/DocumentUploadExample.tsx`

---

**Status:** ✅ Ready for Production

Implementation complete and fully documented!
