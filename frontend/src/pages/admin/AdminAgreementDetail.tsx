import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AgreementView } from "../../components/AgreementView";
import { apiRequest } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

interface AgreementSnapshot {
  agencyName?: string;
  email?: string;
  phone?: string;
  fax?: string;
  managerName?: string;
  signedByFullName?: string;
  signedByPhone?: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  location?: string;
  number?: string;
  numberOfOffices?: number;
  numberOfVehicles?: number;
  numberOfComputers?: number;
}

interface AgreementDetailResponse {
  agreement_id: number;
  agreement_number: string;
  agreement_status: string;
  snapshot_data: AgreementSnapshot;
  recruitment_deadline: string | null;
}

export default function AdminAgreementDetail() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { agreementId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AgreementDetailResponse | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!agreementId) {
        setError("Agreement ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest<any>(`/agreements/${agreementId}`);
        if (!result?.success) {
          throw new Error(result?.message || "Failed to load agreement.");
        }
        setDetail(result.data as AgreementDetailResponse);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to load agreement.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [agreementId]);

  const snapshot = detail?.snapshot_data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 print:hidden">
          <button
            onClick={() => navigate("/admin/agreements")}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Back to Agreements
          </button>
        </div>

        <AgreementView
          language={language}
          loading={loading}
          error={error}
          org={{
            name: snapshot?.agencyName,
            email: snapshot?.email,
            phone: snapshot?.phone,
            faxNumber: snapshot?.fax,
            numberOfOffices: snapshot?.numberOfOffices,
            numberOfComputers: snapshot?.numberOfComputers,
            numberOfVehicles: snapshot?.numberOfVehicles,
          }}
          application={{
            user: {
              fullName: snapshot?.signedByFullName,
              phone: snapshot?.signedByPhone,
            },
          }}
          agreement={{ agreementNumber: detail?.agreement_number }}
          effectiveDeadline={detail?.recruitment_deadline ?? undefined}
          regionName={snapshot?.region}
          zoneName={snapshot?.zone}
          woredaName={snapshot?.woreda}
          kebeleName={snapshot?.kebele}
          address={{
            specialLocation: snapshot?.location,
            houseNumber: snapshot?.number,
          }}
        />
      </div>
    </div>
  );
}
