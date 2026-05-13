/**
 * File Upload Integration Example
 * Shows how to integrate the new file upload system with React components
 */

import React, { useState } from "react";
import {
  uploadOrganizationDocuments,
  validateFile,
  formatFileSize,
  getDocumentTypeName,
} from "@/lib/fileUploadHelper";

interface FileUploadState {
  files: Map<string, File>;
  uploading: boolean;
  uploadedUrls: Record<string, string>;
  error?: string;
  success: boolean;
}

/**
 * Example: Upload documents for personnel
 * This shows the recommended pattern for handling file uploads
 */
export const PersonnelDocumentUploader: React.FC<{
  organizationName: string;
  role: "manager" | "operations" | "administrator" | "security_guard";
  onSuccess: (uploadedFiles: Record<string, string>) => void;
}> = ({ organizationName, role, onSuccess }) => {
  const [state, setState] = useState<FileUploadState>({
    files: new Map(),
    uploading: false,
    uploadedUrls: {},
    success: false,
  });

  // Define required documents for this role
  const requiredDocuments = [
    "education_doc",
    "id_passport_or_kabele_doc",
    "medical_doc",
    "fingerprint_doc",
  ];

  const handleFileSelect = (documentType: string, file: File | null) => {
    if (!file) {
      // Remove file if null
      const newFiles = new Map(state.files);
      newFiles.delete(`${role}_${documentType}`);
      setState((prev) => ({ ...prev, files: newFiles }));
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        error: validation.error,
        success: false,
      }));
      return;
    }

    // Add to files map
    const newFiles = new Map(state.files);
    newFiles.set(`${role}_${documentType}`, file);

    setState((prev) => ({
      ...prev,
      files: newFiles,
      error: undefined,
      success: false,
    }));
  };

  const handleUpload = async () => {
    if (state.files.size === 0) {
      setState((prev) => ({
        ...prev,
        error: "Please select at least one file",
        success: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, error: undefined }));

    try {
      const result = await uploadOrganizationDocuments(
        organizationName,
        state.files,
      );

      if (result.success && result.data?.uploadedFiles) {
        setState((prev) => ({
          ...prev,
          uploadedUrls: result.data!.uploadedFiles,
          uploading: false,
          success: true,
        }));

        // Notify parent component
        onSuccess(result.data.uploadedFiles);

        // Clear after 3 seconds
        setTimeout(() => {
          setState((prev) => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || "Upload failed",
          uploading: false,
          success: false,
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Upload failed",
        uploading: false,
        success: false,
      }));
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">
        {role.charAt(0).toUpperCase() + role.slice(1)} Documents
      </h3>

      {/* File Input Section */}
      <div className="space-y-3">
        {requiredDocuments.map((docType) => {
          const fieldName = `${role}_${docType}`;
          const selectedFile = state.files.get(fieldName);

          return (
            <div key={fieldName} className="border p-3 rounded">
              <label className="block text-sm font-medium mb-2">
                {getDocumentTypeName(docType)}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleFileSelect(docType, e.target.files?.[0] || null)
                }
                className="w-full"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{state.error}</div>
      )}

      {/* Success Message */}
      {state.success && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          ✓ Files uploaded successfully!
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={state.uploading || state.files.size === 0}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {state.uploading
          ? "Uploading..."
          : `Upload ${state.files.size} File(s)`}
      </button>

      {/* Uploaded Files Summary */}
      {Object.keys(state.uploadedUrls).length > 0 && (
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-sm font-medium mb-2">Uploaded Files:</p>
          <ul className="text-sm space-y-1">
            {Object.entries(state.uploadedUrls).map(([key, path]) => (
              <li key={key} className="text-blue-600">
                • {getDocumentTypeName(key)}: {path}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Multi-role document upload
 * Shows how to upload for multiple roles
 */
export const ApplicationDocumentUploadForm: React.FC<{
  organizationName: string;
  onComplete: (allFiles: Record<string, string>) => void;
}> = ({ organizationName, onComplete }) => {
  const [allUploadedFiles, setAllUploadedFiles] = useState<
    Record<string, Record<string, string>>
  >({
    manager: {},
    operations: {},
    administrator: {},
    security_guard: {},
  });

  const handleRoleUploadSuccess = (
    role: string,
    uploadedFiles: Record<string, string>,
  ) => {
    setAllUploadedFiles((prev) => ({
      ...prev,
      [role]: uploadedFiles,
    }));
  };

  const allFilesUploaded = Object.values(allUploadedFiles).every(
    (files) => Object.keys(files).length > 0,
  );

  const handleComplete = () => {
    // Flatten all files
    const flattened = Object.entries(allUploadedFiles).reduce(
      (acc, [role, files]) => ({ ...acc, ...files }),
      {},
    );
    onComplete(flattened);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upload Personnel Documents</h2>

      {/* Manager Section */}
      <PersonnelDocumentUploader
        organizationName={organizationName}
        role="manager"
        onSuccess={(files) => handleRoleUploadSuccess("manager", files)}
      />

      {/* Operations Section */}
      <PersonnelDocumentUploader
        organizationName={organizationName}
        role="operations"
        onSuccess={(files) => handleRoleUploadSuccess("operations", files)}
      />

      {/* Administrator Section */}
      <PersonnelDocumentUploader
        organizationName={organizationName}
        role="administrator"
        onSuccess={(files) => handleRoleUploadSuccess("administrator", files)}
      />

      {/* Security Guard Section */}
      <PersonnelDocumentUploader
        organizationName={organizationName}
        role="security_guard"
        onSuccess={(files) => handleRoleUploadSuccess("security_guard", files)}
      />

      {/* Complete Button */}
      {allFilesUploaded && (
        <button
          onClick={handleComplete}
          className="w-full py-3 px-4 bg-green-500 text-white rounded font-semibold"
        >
          Complete Document Upload
        </button>
      )}
    </div>
  );
};

export default ApplicationDocumentUploadForm;
