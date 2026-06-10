import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

export const LicenseStampQueue = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const params = useParams();
  const [pendingCerts, setPendingCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCertificateId = params?.certificateId
    ? String(params.certificateId)
    : undefined;

  useEffect(() => {
    let active = true;
    const fetchPendingStamps = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiRequest("/certifications/pending-stamps");
        const list = resp && (resp as any).data ? (resp as any).data : resp;
        if (!active) return;
        setPendingCerts(Array.isArray(list) ? list : []);
      } catch (err: any) {
        if (!active) return;
        setError(
          (err && err.message) ||
            (language === "am"
              ? "የማስፈረሚ ማረጋገጫ ዝርዝር ለማየት አልተቻለም።"
              : "Unable to load pending stamp certificates."),
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPendingStamps();
    return () => {
      active = false;
    };
  }, [language]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === "am"
                  ? "በማስፈረም ላይ ያሉ ማረጋገጫዎች"
                  : "Certificates Waiting for Stamp"}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {language === "am"
                  ? "እባክዎ በኋላ የሚሳስቡትን ማረጋገጫ በዚህ ዝርዝር ይይዙ።"
                  : "Select a pending certificate to review and stamp."}
              </p>
            </div>
            <div className="rounded-2xl bg-[#00305F] px-3 py-2 text-xs font-semibold text-white">
              {pendingCerts.length} {language === "am" ? "ካርዶች" : "items"}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">
              {language === "am" ? "በመጫን ላይ..." : "Loading pending stamps..."}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : pendingCerts.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              {language === "am"
                ? "አሁን ለማስፈረም ማረጋገጫ የለም።"
                : "There are no certificates waiting for stamp."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Serial</th>
                    <th className="px-4 py-3">
                      {language === "am" ? "ድርጅት" : "Organization"}
                    </th>
                    <th className="px-4 py-3">
                      {language === "am" ? "የሚገባው ቀን" : "Issue Date"}
                    </th>
                    <th className="px-4 py-3">
                      {language === "am" ? "የፈረመ" : "Signed By"}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {language === "am" ? "ተግባር" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pendingCerts.map((certificate) => {
                    const certificateId = String(certificate.id);
                    const active = certificateId === selectedCertificateId;
                    return (
                      <tr
                        key={certificateId}
                        className={
                          active ? "bg-[#EFF8FF]" : "hover:bg-slate-50"
                        }
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                          {certificate.certificateSerialNumber ||
                            `#${certificate.id}`}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {certificate.organizationName ||
                            certificate.organization?.nameEnglish ||
                            certificate.organization?.nameAmharic ||
                            (language === "am"
                              ? "ድርጅት ስም የለም"
                              : "No organization name")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                          {certificate.issueDate
                            ? new Date(
                                certificate.issueDate,
                              ).toLocaleDateString(
                                language === "am" ? "am-ET" : "en-US",
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {certificate.signedByOfficial?.fullName ||
                            certificate.signedByOfficial?.fullNameAm ||
                            "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/licensing-authority/license/${certificateId}`,
                              )
                            }
                            className="rounded-full bg-[#00305F] px-3 py-2 text-[11px] font-bold uppercase text-white shadow-sm transition hover:bg-[#00284d]"
                          >
                            {language === "am" ? "ለማስፈረም" : "To Stamp"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
