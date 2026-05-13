# File Upload System Documentation

## Overview

The EFP PSO system now includes a professional file organization system that automatically organizes documents into a folder structure based on organization and role.

## Folder Structure

Documents are organized as follows:

```
uploads/
├── {OrganizationName}/
│   ├── manager/
│   │   └── {timestamp}-{document_name}.{ext}
│   ├── operations/
│   │   └── {timestamp}-{document_name}.{ext}
│   ├── administrator/
│   │   └── {timestamp}-{document_name}.{ext}
│   └── security_guard/
│       └── {timestamp}-{document_name}.{ext}
```

Each organization gets its own root folder, with subfolders for each role.

## File Naming Convention

Files are automatically renamed to prevent conflicts:

- Format: `{timestamp}-{sanitized-filename}`
- Example: `1715520000000-education-certificate.pdf`

## Supported Document Types

### By Role

#### Manager Documents

- `manager_education_doc` - Education Certificate
- `manager_id_passport_or_kabele_doc` - National ID/Passport/Kebele
- `manager_fingerprint_doc` - Fingerprint
- `manager_medical_doc` - Medical Certificate
- `manager_training_doc` - Training Certificate
- `manager_support_doc` - Supporting Document
- `manager_collateral_doc` - Collateral Document
- `manager_experience_doc` - Experience Certificate
- `manager_resignation_letter_doc` - Resignation Letter
- `manager_organization_Id_doc` - Organization ID Document

#### Operations Documents

- `operations_education_doc` - Education Certificate
- `operations_id_passport_or_kabele_doc` - National ID/Passport/Kebele
- `operations_fingerprint_doc` - Fingerprint
- `operations_medical_doc` - Medical Certificate
- `operations_training_doc` - Training Certificate
- `operations_support_doc` - Supporting Document
- `operations_collateral_doc` - Collateral Document
- `operations_experience_doc` - Experience Certificate
- `operations_resignation_letter_doc` - Resignation Letter
- `operations_organization_Id_doc` - Organization ID Document

#### Administrator Documents

- `administrator_education_doc` - Education Certificate
- `administrator_id_passport_or_kabele_doc` - National ID/Passport/Kebele
- `administrator_fingerprint_doc` - Fingerprint
- `administrator_medical_doc` - Medical Certificate
- `administrator_training_doc` - Training Certificate
- `administrator_support_doc` - Supporting Document
- `administrator_collateral_doc` - Collateral Document
- `administrator_experience_doc` - Experience Certificate
- `administrator_resignation_letter_doc` - Resignation Letter
- `administrator_organization_Id_doc` - Organization ID Document

#### Security Guard Documents

- `security_guard_education_doc` - Education Certificate
- `security_guard_id_passport_or_kabele_doc` - National ID/Passport/Kebele
- `security_guard_fingerprint_doc` - Fingerprint
- `security_guard_medical_doc` - Medical Certificate
- `security_guard_training_doc` - Training Certificate
- `security_guard_support_doc` - Supporting Document
- `security_guard_collateral_doc` - Collateral Document
- `security_guard_experience_doc` - Experience Certificate
- `security_guard_resignation_letter_doc` - Resignation Letter
- `security_guard_organization_Id_doc` - Organization ID Document

#### Organization Documents

- `logo` - Organization Logo
- `uniform_sample` - Uniform Sample
- `id_sample` - ID Card Sample
- `training_manual` - Training Manual
- `training_cert` - Training Certificate

## File Constraints

- **Maximum File Size**: 10 MB per file
- **Maximum Files**: 50 files per upload
- **Allowed MIME Types**:
  - PDF: `application/pdf`
  - Images: `image/jpeg`, `image/png`, `image/jpg`
  - Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## API Endpoints

### Upload Documents

**POST** `/api/applications/upload`

#### Request

- Content-Type: `multipart/form-data`
- Fields:
  - `organizationName` (string, required) - The organization name
  - File fields with appropriate names (e.g., `manager_education_doc`)

#### Response

```json
{
  "success": true,
  "message": "Files uploaded and organized successfully",
  "data": {
    "uploadedFiles": {
      "manager_education_doc": "uploads/My Agency/manager/1715520000000-education-certificate.pdf",
      "manager_medical_doc": "uploads/My Agency/manager/1715520000000-medical-certificate.pdf"
    },
    "totalFiles": 2
  }
}
```

## Frontend Implementation

### Using the File Upload Helper

```typescript
import {
  uploadOrganizationDocuments,
  validateFile,
} from "@/lib/fileUploadHelper";

// Create file map
const filesMap = new Map<string, File>();

// Add files
if (managerEducationFile) {
  const validation = validateFile(managerEducationFile);
  if (validation.valid) {
    filesMap.set("manager_education_doc", managerEducationFile);
  }
}

// Upload
const result = await uploadOrganizationDocuments("My Agency", filesMap);
if (result.success) {
  console.log("Files uploaded:", result.data?.uploadedFiles);
} else {
  console.error("Upload failed:", result.error);
}
```

### FormData Approach

```typescript
const formData = new FormData();
formData.append("organizationName", "My Agency");
formData.append("manager_education_doc", managerEducationFile);
formData.append("operations_medical_doc", opsmedicalFile);

const response = await fetch("/api/applications/upload", {
  method: "POST",
  body: formData,
  // Do NOT set Content-Type - browser will handle it
});

const result = await response.json();
```

## Database Storage

File paths are stored in the database as relative paths:

```
uploads/{organizationName}/{role}/{timestamp}-{filename}
```

These paths can be served directly via the `/uploads` static route.

## Manual Review Process

1. Files are stored on disk immediately upon upload
2. Administrators can navigate to the `uploads/` directory
3. Folder structure by organization makes it easy to find documents
4. Role subfolders allow quick filtering by personnel type

### Example Directory Navigation

```
uploads/
└── Beta Security/
    ├── manager/
    │   ├── 1715520000000-education.pdf
    │   ├── 1715520001000-medical.pdf
    │   └── 1715520002000-passport.pdf
    ├── operations/
    │   ├── 1715520010000-training.pdf
    │   └── 1715520011000-experience.pdf
    └── administrator/
        └── 1715520020000-resignation.pdf
```

## Error Handling

### Common Errors

1. **Invalid File Type**

   ```json
   {
     "error": "Invalid file type: text/plain. Allowed: PDF, images, Word, Excel"
   }
   ```

2. **File Too Large**

   ```json
   {
     "error": "File exceeds maximum size of 10MB"
   }
   ```

3. **Missing Organization Name**

   ```json
   {
     "error": "Organization name is required"
   }
   ```

4. **No Files Uploaded**
   ```json
   {
     "error": "No files were uploaded"
   }
   ```

## Troubleshooting

### Files Not Appearing

1. Check that the organization name matches exactly (case-sensitive)
2. Verify role names are correct (manager, operations, administrator, security_guard)
3. Check file permissions in the `uploads/` directory

### Upload Failures

1. Verify file size is under 10MB
2. Confirm file type is supported
3. Check network connectivity
4. Review browser console for detailed error messages

### Missing Directories

The system automatically creates all necessary directories. If they don't exist, check:

1. Write permissions for the application directory
2. Disk space availability
3. Application error logs

## Integration with Application Submission

The file upload system integrates seamlessly with the application submission process:

1. User uploads files via the file upload endpoint
2. Files are organized by organization and role
3. Upload returns file paths (relative paths)
4. Frontend includes file paths in application form data
5. Application submission stores file paths in database
6. Documents remain organized on disk for manual review

## Best Practices

1. **Always Validate Files First**

   ```typescript
   const validation = validateFile(file);
   if (!validation.valid) {
     showError(validation.error);
     return;
   }
   ```

2. **Show Upload Progress**
   - Implement progress tracking for large files
   - Display file size information to users

3. **Handle Network Errors**
   - Implement retry logic for failed uploads
   - Show user-friendly error messages

4. **Organize by Status**
   - Consider archiving approved applications
   - Move rejected application documents to a separate folder

5. **Regular Maintenance**
   - Periodically archive old documents
   - Monitor disk space usage
   - Implement backup strategy

## Security Considerations

1. **File Validation**
   - MIME type validation on server and client
   - File extension validation
   - Maximum file size enforcement

2. **Access Control**
   - Implement proper authentication for file access
   - Add authorization checks before serving files
   - Consider encryption for sensitive documents

3. **File Isolation**
   - Each organization's documents are in separate folders
   - Prevent directory traversal attacks
   - Sanitize file names

## Future Enhancements

1. **Document Versioning** - Track document changes
2. **Digital Signatures** - Add signature capability
3. **Document Archival** - Automatic archiving after approval
4. **Search Functionality** - Search documents by metadata
5. **Access Audit Logs** - Track who accessed which documents
6. **Encryption** - Encrypt sensitive documents at rest
