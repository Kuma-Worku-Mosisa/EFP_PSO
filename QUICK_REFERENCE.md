# File Upload System - Quick Reference

## 🚀 Quick Start

### Backend API

```bash
# Upload files
curl -X POST http://localhost:5000/api/applications/upload \
  -F "organizationName=My Agency" \
  -F "manager_education_doc=@education.pdf" \
  -F "operations_medical_doc=@medical.pdf"
```

### Frontend Upload

```typescript
import { uploadOrganizationDocuments } from "@/lib/fileUploadHelper";

const result = await uploadOrganizationDocuments("My Agency", {
  manager_education_doc: file1,
  operations_medical_doc: file2,
});
```

---

## 📁 Folder Structure

```
uploads/{OrganizationName}/{role}/{timestamp}-{filename}
```

**Roles:** manager | operations | administrator | security_guard

---

## 📋 Document Field Names

### Manager Documents

- `manager_education_doc`
- `manager_id_passport_or_kabele_doc`
- `manager_fingerprint_doc`
- `manager_medical_doc`
- `manager_training_doc`
- `manager_support_doc`
- `manager_collateral_doc`
- `manager_experience_doc`
- `manager_resignation_letter_doc`
- `manager_organization_Id_doc`

### Operations Documents

Replace `manager_` with `operations_` for operations role
(Same document types)

### Administrator Documents

Replace `manager_` with `administrator_` for administrator role
(Same document types)

### Security Guard Documents

Replace `manager_` with `security_guard_` for security guard role
(Same document types)

### Organization Documents

- `logo`
- `uniform_sample`
- `id_sample`
- `training_manual`
- `training_cert`

---

## 🔧 Backend Files

| File                                                    | Purpose                                      |
| ------------------------------------------------------- | -------------------------------------------- |
| `backend/src/middleware/fileUpload.ts`                  | Multer configuration & folder creation       |
| `backend/src/utils/documentOrganizer.ts`                | Document organization utilities              |
| `backend/src/modules/application/upload.controller.ts`  | Upload API handler                           |
| `backend/src/modules/application/application.routes.ts` | Upload route (POST /api/applications/upload) |

---

## 🎨 Frontend Files

| File                                                | Purpose                       |
| --------------------------------------------------- | ----------------------------- |
| `frontend/src/lib/fileUploadHelper.ts`              | Upload utilities & validation |
| `frontend/src/components/DocumentUploadExample.tsx` | Example React component       |

---

## 🔗 Key Functions

### Backend

```typescript
// Create folder structure
ensureOrganizationFolders("My Agency");

// Parse field name
parseFieldName("manager_education_doc");
// Returns: { role: 'manager', documentType: 'education_doc' }

// Organize uploaded files
organizeUploadedFiles("My Agency", multerFiles);
// Returns: { 'manager_education_doc': 'uploads/My Agency/manager/...' }
```

### Frontend

```typescript
// Upload files
uploadOrganizationDocuments("My Agency", filesMap);
// Returns: { success, message, data, error }

// Validate file
validateFile(file);
// Returns: { valid, error? }

// Format file size
formatFileSize(1024); // Returns: "1 KB"

// Get document name
getDocumentTypeName("manager_education_doc"); // Returns: "Education Certificate"
```

---

## 📊 Constraints

| Item               | Limit                                |
| ------------------ | ------------------------------------ |
| Max File Size      | 10 MB                                |
| Max Files          | 50 per upload                        |
| Allowed MIME Types | PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX |

---

## ✅ Validation Checklist

- [ ] File size < 10 MB
- [ ] File type is supported
- [ ] Organization name provided
- [ ] Field names follow convention: `{role}_{documentType}`
- [ ] Roles are valid: manager, operations, administrator, security_guard

---

## 🔗 API Response Example

**Request:**

```bash
POST /api/applications/upload
-F "organizationName=Beta Security"
-F "manager_education_doc=@cert.pdf"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Files uploaded and organized successfully",
  "data": {
    "uploadedFiles": {
      "manager_education_doc": "uploads/Beta Security/manager/1715520000000-cert.pdf"
    },
    "totalFiles": 1
  }
}
```

---

## 📂 Access Uploaded Files

Files are automatically served at:

```
http://localhost:5000/uploads/{organizationName}/{role}/{filename}
```

Example:

```
http://localhost:5000/uploads/Beta%20Security/manager/1715520000000-education.pdf
```

---

## 🐛 Common Issues

| Issue              | Solution                                        |
| ------------------ | ----------------------------------------------- |
| Files not found    | Check folder structure under `uploads/`         |
| Upload fails       | Verify file size, type, and organizationName    |
| 404 on file access | Check exact folder/file names                   |
| Permission denied  | Check write permissions on `uploads/` directory |

---

## 📝 Integration Steps

1. Import helper function

   ```typescript
   import { uploadOrganizationDocuments } from "@/lib/fileUploadHelper";
   ```

2. Collect files

   ```typescript
   const filesMap = new Map<string, File>();
   filesMap.set("manager_education_doc", educationFile);
   ```

3. Upload

   ```typescript
   const result = await uploadOrganizationDocuments("Agency Name", filesMap);
   ```

4. Handle response
   ```typescript
   if (result.success) {
     // Include uploadedFiles in application submission
     const uploadedPaths = result.data?.uploadedFiles;
   }
   ```

---

## 🔐 Security Notes

- Files are validated on server (MIME types, size)
- Filenames are sanitized and timestamped
- Each organization gets isolated folder
- No directory traversal allowed

---

## 📖 Full Documentation

- **Detailed Guide:** `FILE_UPLOAD_SYSTEM.md`
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Code Example:** `frontend/src/components/DocumentUploadExample.tsx`

---

**Version:** 1.0  
**Status:** Ready for Production
