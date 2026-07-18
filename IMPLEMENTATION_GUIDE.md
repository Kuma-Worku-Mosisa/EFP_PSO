# File Upload System Implementation Guide

## 🎯 Overview

A professional file upload and organization system has been implemented for the EFP PSO application. Documents are automatically organized by organization name and personnel role, making them easy to manage and review manually.

## 📁 Folder Structure

```
uploads/
└── {OrganizationName}/
    ├── manager/
    ├── operations/
    ├── administrator/
    └── security_guard/
```

Each file is stored as: `{timestamp}-{sanitized-filename}.{ext}`

---

## 🔧 Backend Implementation

### 1. **File Upload Middleware** (`backend/src/middleware/fileUpload.ts`)

Handles Multer configuration with:

- Automatic folder structure creation
- File validation (MIME types, size limits)
- Unique filename generation using timestamps
- Support for 4 personnel roles

**Key Functions:**

- `ensureOrganizationFolders()` - Creates folder structure
- `createOrgDocumentUploader()` - Creates Multer instance
- `createMulterStorage()` - Configures disk storage

### 2. **Document Organizer Utility** (`backend/src/utils/documentOrganizer.ts`)

Manages document organization with:

- Field name parsing (`manager_education_doc` → role + type)
- File organization by role
- Document listing and archival
- File deletion support

**Key Functions:**

- `parseFieldName()` - Extract role from field name
- `organizeUploadedFiles()` - Organize files on disk
- `getDocumentUrl()` - Generate document URLs
- `archiveOrganizationDocuments()` - Archive approved docs

### 3. **Upload Controller** (`backend/src/modules/application/upload.controller.ts`)

API endpoint handler:

- Validates organization name
- Checks for uploaded files
- Organizes files into proper structure
- Returns file paths for database storage

### 4. **Updated Application Routes** (`backend/src/modules/application/application.routes.ts`)

New endpoint:

```
POST /api/applications/upload
```

Accepts:

- `organizationName` - Organization name (form field)
- Files with field names: `{role}_{documentType}`

### 5. **Updated Application Service** (`backend/src/modules/application/application.service.ts`)

Enhanced to:

- Ensure folder structure before processing
- Helper method to organize files by role
- Integration with file storage system

### 6. **Updated Server** (`backend/src/server.ts`)

Added static file serving:

```javascript
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
```

Files accessible at: `http://localhost:5000/uploads/{organizationName}/{role}/{filename}`

---

## 🎨 Frontend Implementation

### 1. **File Upload Helper** (`frontend/src/lib/fileUploadHelper.ts`)

Utility functions for file operations:

- `uploadOrganizationDocuments()` - Upload files to server
- `validateFile()` - Validate before upload
- `formatFileSize()` - Display file size
- `getDocumentTypeName()` - Get display name for document types

**Example Usage:**

```typescript
import {
  uploadOrganizationDocuments,
  validateFile,
} from "@/lib/fileUploadHelper";

const filesMap = new Map<string, File>();
filesMap.set("manager_education_doc", educationFile);

const result = await uploadOrganizationDocuments("My Agency", filesMap);
if (result.success) {
  console.log("Uploaded files:", result.data?.uploadedFiles);
}
```

### 2. **Document Upload Example Component** (`frontend/src/components/DocumentUploadExample.tsx`)

Reference implementation showing:

- `PersonnelDocumentUploader` - Single role document upload
- `ApplicationDocumentUploadForm` - Multi-role document upload
- File validation
- Error handling
- Progress feedback

---

## 📋 Supported Document Types

### Personnel Documents (for each role)

- `education_doc` - Education Certificate
- `id_passport_or_kabele_doc` - National ID/Passport/Kebele
- `fingerprint_doc` - Fingerprint
- `medical_doc` - Medical Certificate
- `training_doc` - Training Certificate
- `support_doc` - Supporting Document
- `guarantee_doc` - guarantee Document
- `experience_doc` - Experience Certificate
- `resignation_letter_doc` - Resignation Letter
- `organization_Id_doc` - Organization ID Document

### Organization Documents

- `logo` - Organization Logo
- `uniform_sample` - Uniform Sample
- `id_sample` - ID Card Sample
- `training_manual` - Training Manual
- `training_cert` - Training Certificate

---

## 🚀 Quick Start

### 1. **Upload Files via API**

```bash
curl -X POST http://localhost:5000/api/applications/upload \
  -F "organizationName=My Agency" \
  -F "manager_education_doc=@education.pdf" \
  -F "operations_medical_doc=@medical.pdf"
```

### 2. **Upload Files via Frontend**

```typescript
import { uploadOrganizationDocuments } from "@/lib/fileUploadHelper";

const files = new Map([
  ["manager_education_doc", file1],
  ["operations_medical_doc", file2],
]);

const result = await uploadOrganizationDocuments("My Agency", files);
```

### 3. **Access Uploaded Files**

Files are automatically accessible at:

```
http://localhost:5000/uploads/{organizationName}/{role}/{filename}
```

Example:

```
http://localhost:5000/uploads/My%20Agency/manager/1715520000000-education.pdf
```

---

## 🔐 Security Features

- ✅ File type validation (MIME types)
- ✅ File size limits (10MB max)
- ✅ Filename sanitization
- ✅ Directory isolation (no traversal attacks)
- ✅ Automatic folder structure isolation
- ✅ Timestamp-based unique filenames

---

## 📊 File Constraints

| Constraint           | Value                                |
| -------------------- | ------------------------------------ |
| Max File Size        | 10 MB                                |
| Max Files per Upload | 50                                   |
| Allowed Types        | PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX |
| Storage Location     | `uploads/` directory                 |

---

## 🗂️ File Organization Examples

```
uploads/
├── Beta Security/
│   ├── manager/
│   │   ├── 1715520000000-education-certificate.pdf
│   │   ├── 1715520001000-medical-report.pdf
│   │   └── 1715520002000-national-id.pdf
│   ├── operations/
│   │   ├── 1715520010000-training-certificate.pdf
│   │   └── 1715520011000-experience-letter.pdf
│   ├── administrator/
│   │   └── 1715520020000-resignation-letter.pdf
│   └── security_guard/
│       └── 1715520030000-fingerprint-scan.png
│
└── Alpha Services/
    ├── manager/
    │   └── 1715520040000-education.pdf
    └── operations/
        └── 1715520050000-medical.pdf
```

---

## 🔄 Workflow Integration

1. **User Selects Files**
   - Frontend provides file input components
   - Files validated before upload

2. **Files Uploaded to Server**

   ```
   POST /api/applications/upload
   ```

   - Multer middleware processes files
   - Files saved to disk
   - Folder structure auto-created

3. **Server Returns File Paths**

   ```json
   {
     "uploadedFiles": {
       "manager_education_doc": "uploads/My Agency/manager/1715520000000-education.pdf",
       "operations_medical_doc": "uploads/My Agency/operations/1715520000000-medical.pdf"
     }
   }
   ```

4. **Paths Stored in Database**
   - Relative paths saved to `employeeDocument` table
   - Links preserved for future access

5. **Manual Review**
   - Admins navigate to `uploads/` directory
   - Find documents by organization name
   - Filter by role (manager, operations, etc.)

---

## 💾 Database Integration

The file paths are stored in the database as:

```typescript
{
  employeeId: number;
  documentType: string; // e.g., "Education Certificate"
  fileUrl: string; // e.g., "uploads/My Agency/manager/1715520000000-education.pdf"
  uploadedAt: Date;
}
```

Files remain on disk even after application approval/rejection, allowing long-term document management.

---

## 🛠️ API Endpoints

### Upload Documents

```
POST /api/applications/upload
Content-Type: multipart/form-data

Body:
- organizationName: string
- {role}_{documentType}: File
- {role}_{documentType}: File
...

Response (200 OK):
{
  "success": true,
  "message": "Files uploaded and organized successfully",
  "data": {
    "uploadedFiles": { ... },
    "totalFiles": 2
  }
}
```

### Get Uploaded Files

```
GET /uploads/{organizationName}/{role}/{filename}

Response: File content (PDF, image, etc.)
```

---

## 🐛 Troubleshooting

### Problem: Files not appearing in folder

**Solution:**

1. Check organization name spelling (case-sensitive)
2. Verify role names: manager, operations, administrator, security_guard
3. Check write permissions on `uploads/` directory

### Problem: Upload fails

**Solution:**

1. Verify file size < 10MB
2. Confirm file type is supported
3. Check browser console for errors
4. Check server logs for detailed error messages

### Problem: Folder structure not created

**Solution:**

1. Check disk space availability
2. Verify application has write permissions
3. Ensure `uploads/` directory exists and is writable

---

## 📝 Files Created/Modified

### New Files Created:

- ✅ `backend/src/middleware/fileUpload.ts` - Multer configuration
- ✅ `backend/src/utils/documentOrganizer.ts` - Document organization utilities
- ✅ `backend/src/modules/application/upload.controller.ts` - Upload API handler
- ✅ `frontend/src/lib/fileUploadHelper.ts` - Frontend upload utilities
- ✅ `frontend/src/components/DocumentUploadExample.tsx` - Example React component
- ✅ `FILE_UPLOAD_SYSTEM.md` - Detailed documentation
- ✅ `IMPLEMENTATION_GUIDE.md` - This file

### Modified Files:

- ✅ `backend/src/modules/application/application.routes.ts` - Added upload route
- ✅ `backend/src/modules/application/application.service.ts` - Enhanced file handling
- ✅ `backend/src/modules/application/application.controller.ts` - Added file conversion utilities
- ✅ `backend/src/server.ts` - Added static file serving

---

## 🎓 Next Steps

1. **Test the Upload Endpoint**

   ```bash
   curl -X POST http://localhost:5000/api/applications/upload \
     -F "organizationName=Test Organization" \
     -F "manager_education_doc=@test.pdf"
   ```

2. **Integrate with Application Submission**
   - Use `uploadOrganizationDocuments()` before submitting form
   - Include returned file paths in application data

3. **Implement Manual Review Interface**
   - Create admin page to browse organized documents
   - Show folder structure by organization and role

4. **Add Document Management Features**
   - Download documents
   - Delete documents
   - Archive approved applications
   - Search documents by metadata

5. **Implement Access Control**
   - Add authentication to file endpoints
   - Restrict access by organization/role
   - Audit log file access

---

## 📞 Support

For issues or questions about the file upload system, refer to:

1. `FILE_UPLOAD_SYSTEM.md` - Comprehensive documentation
2. `frontend/src/components/DocumentUploadExample.tsx` - Code examples
3. Server logs for detailed error messages
4. Browser console for client-side errors

---

**Status:** ✅ Implementation Complete

All components are ready for integration with the application submission workflow.
