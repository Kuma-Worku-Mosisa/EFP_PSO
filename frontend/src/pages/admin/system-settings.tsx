// filepath: frontend/src/pages/admin/system-settings.tsx
import React, { useState, useEffect } from "react";

export default function SystemSettings() {
  // State Management
  const [formData, setFormData] = useState({
    governmentName: "",
    issuingAuthority: "",
    efpLogoUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Fetch initial data on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/system-settings",
        );
        const result = await response.json();

        if (result.success) {
          setFormData({
            governmentName: result.data.governmentName,
            issuingAuthority: result.data.issuingAuthority,
            efpLogoUrl: result.data.efpLogoUrl,
          });
        }
      } catch (error) {
        setNotification({
          type: "error",
          text: "Failed to connect to the server.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Handle input changes dynamically
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2b. Handle file upload for EFP logo (staged)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary saving state in preview
    setIsSaving(true);

    try {
      const fd = new FormData();
      fd.append("efp_logo", file);

      const resp = await fetch(
        "http://localhost:5000/api/system-settings/upload",
        {
          method: "POST",
          body: fd,
        },
      );

      const j = await resp.json();
      if (j.success && j.url) {
        // j.url will be like "/uploads/_tmp/efp/organization/xxx"
        setFormData((prev) => ({ ...prev, efpLogoUrl: j.url }));
        setNotification({
          type: "success",
          text: "Logo uploaded (staged). Save to persist.",
        });
      } else {
        setNotification({ type: "error", text: j.message || "Upload failed." });
      }
    } catch (err) {
      setNotification({ type: "error", text: "Upload network error." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, efpLogoUrl: "" }));
    setNotification({ type: "success", text: "Staged logo cleared." });
    setTimeout(() => setNotification(null), 2000);
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/system-settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const result = await response.json();

      if (result.success) {
        setNotification({
          type: "success",
          text: "System settings updated successfully.",
        });
        // Update local form with the saved values (server returns absolute url)
        if (result.data) {
          setFormData((prev) => ({
            ...prev,
            governmentName: result.data.governmentName || prev.governmentName,
            issuingAuthority:
              result.data.issuingAuthority || prev.issuingAuthority,
            efpLogoUrl: result.data.efpLogoUrl || prev.efpLogoUrl,
          }));
        }
      } else {
        setNotification({
          type: "error",
          text: result.message || "Update failed.",
        });
      }
    } catch (error) {
      setNotification({ type: "error", text: "A network error occurred." });
    } finally {
      setIsSaving(false);

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading Configuration Engine...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          System Configurations
        </h1>
        <p className="text-gray-500 mt-1">
          Manage global identity variables for the Federal Police dashboard.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-lg font-medium ${notification.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}
        >
          {notification.type === "success" ? "✅ " : "❌ "} {notification.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: The Input Form */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6 border-b pb-2">
            Identity Matrix
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Government Branch Name
              </label>
              <input
                type="text"
                name="governmentName"
                value={formData.governmentName}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Authority / Directorate
              </label>
              <input
                type="text"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official EFP Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                  <img
                    src={
                      formData.efpLogoUrl ||
                      "https://via.placeholder.com/112?text=LOGO"
                    }
                    alt="EFP Logo"
                    className="w-full h-full object-contain"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://via.placeholder.com/112?text=LOGO")
                    }
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center px-4 py-2 bg-white border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.efpLogoUrl ? (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-4 py-2 bg-red-50 text-red-600 border rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No logo staged
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Recommended formats: PNG, JPG, SVG. Keep logo square for
                    best results. Upload stages the file; click "Save
                    Configuration" to persist.
                  </p>

                  {isSaving && (
                    <p className="text-xs text-gray-500 mt-2">Uploading...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isSaving ? "Synchronizing Servers..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="bg-gray-50 p-6 rounded-xl border shadow-inner">
          <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
            👁️ Live Certificate Preview
          </h2>

          {/* Mock Certificate Header */}
          <div className="bg-white border-2 border-green-700 p-6 rounded-lg shadow-md mt-4">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
              {/* Fallback image handling if URL is broken while typing */}
              <img
                src={formData.efpLogoUrl}
                alt="EFP Logo"
                className="w-20 h-20 object-contain bg-gray-100 rounded-full"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/80?text=LOGO")
                }
              />

              <div className="text-right">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  {formData.governmentName || "Federal Police"}
                </h3>
                <p className="text-sm font-bold text-blue-800 mt-1">
                  {formData.issuingAuthority || "Directorate Name"}
                </p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                  Official Security Agency Certificate
                </p>
              </div>
            </div>

            <div className="py-8 text-center text-gray-300 font-mono text-sm">
              [ Certificate Body Content Renders Here ]
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            This preview shows exactly how the header will generate on the
            public verification portal and printed PDFs.
          </p>
        </div>
      </div>
    </div>
  );
}
