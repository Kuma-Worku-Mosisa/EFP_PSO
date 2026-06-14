import React from "react";

type RenewalReviewContentProps = {
  selectedApp: any;
  ReviewItem: React.ComponentType<any>;
  renderPersonnelInfoSection: (props: any) => React.ReactNode;
  getEmployeeDisplayName: (employee: any) => string;
  getEmployeeAddressDetails: (employee: any) => any;
  getEmployeeEmploymentDetails: (employee: any) => any;
  findOrganizationDocument: (application: any, terms: string[]) => any;
  findEmployeeDoc: (
    employee: any,
    terms: string[],
    excludeTerms?: string[],
  ) => any;
  getEmployeeDocumentTarget: (
    employee: any,
    terms: string[],
    excludeTerms?: string[],
  ) => any;
  getEmployeeOnlyDocumentTarget: (
    employee: any,
    terms: string[],
    excludeTerms?: string[],
  ) => any;
  getEmployeeOnlyDocumentCard: (
    employee: any,
    terms: string[],
    excludeTerms?: string[],
  ) => any;
  getFileName: (fileUrl?: string) => string;
  buildDocumentCards: (
    docs: Array<{
      id?: number | string;
      documentType?: string;
      fileUrl?: string;
      isVerified?: boolean;
      verifiedAt?: string | null;
    }>,
    prefix: string,
  ) => Array<{
    id: string;
    documentId?: number | string;
    label: string;
    fileUrl: string;
    fileName: string;
    isVerified: boolean;
    verifiedAt?: string | null;
  }>;
};

export const RenewalReviewContent = ({
  selectedApp,
  ReviewItem,
  findOrganizationDocument,
  getFileName,
  buildDocumentCards,
}: RenewalReviewContentProps) => {
  const formatContractAddress = (address: any) => {
    if (!address) return "-";

    const region =
      address?.kebele?.woreda?.zone?.region?.name ||
      address?.kebele?.woreda?.zone?.region?.nameEnglish ||
      address?.kebele?.woreda?.zone?.region?.nameAmharic ||
      null;

    const zone =
      address?.kebele?.woreda?.zone?.name ||
      address?.kebele?.woreda?.zone?.nameEnglish ||
      address?.kebele?.woreda?.zone?.nameAmharic ||
      null;

    const woreda =
      address?.kebele?.woreda?.name ||
      address?.kebele?.woreda?.nameEnglish ||
      address?.kebele?.woreda?.nameAmharic ||
      null;

    const kebele =
      address?.kebele?.name ||
      address?.kebele?.nameEnglish ||
      address?.kebele?.nameAmharic ||
      null;

    const parts: string[] = [];
    if (region) parts.push(String(region));
    if (zone) parts.push(String(zone));
    if (woreda) parts.push(String(woreda));
    if (kebele) parts.push(String(kebele));
    if (address?.specialLocation) parts.push(String(address.specialLocation));
    if (address?.houseNumber) parts.push(String(address.houseNumber));

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  type ServiceContractCard = {
    id: string;
    contractId?: number | string;
    serviceUserName: string;
    contractUrl: string;
    fileName: string;
    assignedPersonnelCount?: number | null;
    address?: any;
  };

  const getServiceContractCards = (application?: any): ServiceContractCard[] =>
    (application?.organization?.serviceContracts || []).map(
      (
        contract: {
          id?: number | string;
          serviceUserName?: string;
          contractUrl?: string;
          assignedPersonnelCount?: number | null;
          address?: any;
        },
        index: number,
      ) => ({
        id: "service-contract_" + index,
        contractId: contract?.id,
        serviceUserName: contract?.serviceUserName || "Service Contract",
        contractUrl: contract?.contractUrl || "",
        fileName: getFileName(contract?.contractUrl),
        assignedPersonnelCount: contract?.assignedPersonnelCount,
        address: contract?.address,
      }),
    );

  type EducationRow = {
    label: string;
    male: number;
    female: number;
  };

  const educationStats =
    selectedApp.organization?.educationStats ??
    selectedApp.guardEducationStat ??
    {};

  const eduStatRows: EducationRow[] = [
    {
      label: "Grade 3-9",
      male: educationStats.grade_3_9_male ?? 0,
      female: educationStats.grade_3_9_female ?? 0,
    },
    {
      label: "Grade 10-12",
      male: educationStats.grade_10_12_male ?? 0,
      female: educationStats.grade_10_12_female ?? 0,
    },
    {
      label: "Certificate",
      male: educationStats.certificate_male ?? 0,
      female: educationStats.certificate_female ?? 0,
    },
    {
      label: "Diploma",
      male: educationStats.diploma_male ?? 0,
      female: educationStats.diploma_female ?? 0,
    },
    {
      label: "Degree",
      male: educationStats.degree_male ?? 0,
      female: educationStats.degree_female ?? 0,
    },
    {
      label: "Second Degree",
      male: educationStats.second_degree_male ?? 0,
      female: educationStats.second_degree_female ?? 0,
    },
  ];

  const educationTotals = eduStatRows.reduce(
    (totals, row) => ({
      male: totals.male + row.male,
      female: totals.female + row.female,
    }),
    { male: 0, female: 0 },
  );

  return (
    <div className="space-y-10 pb-24">
      {/* Basic Agency Info */}
      <section className="space-y-10 py-6">
        {/* SECTION 1: ORGANIZATION INFORMATION */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
            <div className="w-1 h-5 bg-[#DCC380] rounded-full" />
            <h4 className="text-sm font-black text-[#0C2A4C] uppercase tracking-[0.2em]">
              Organization Information
            </h4>
          </div>

          <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-wrap gap-y-4 text-sm leading-relaxed">
              <div className="flex items-center mr-6">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Organization Name (Amharic):
                </span>
                <span className="font-bold text-gray-700">
                  {selectedApp.organization?.nameAmharic ||
                    selectedApp.agency ||
                    "—"}
                </span>
                <span className="mx-4 text-[#DCC380] font-light">|</span>
              </div>

              <div className="flex items-center mr-6">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Organization Name (English):
                </span>
                <span className="font-bold text-gray-700">
                  {selectedApp.organization?.nameEnglish || "—"}
                </span>
                <span className="mx-4 text-[#DCC380] font-light">|</span>
              </div>

              <div className="flex items-center mr-6">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Trade Name:
                </span>
                <span className="font-bold text-gray-700">
                  {selectedApp.organization?.tradeName || "—"}
                </span>
                <span className="mx-4 text-[#DCC380] font-light">|</span>
              </div>

              <div className="flex items-center">
                <span className="font-black text-[#0C2A4C] mr-2">
                  TIN Number:
                </span>
                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                  {selectedApp.organization?.tinNumber || "—"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Number of Computers:
                </span>
                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                  {selectedApp.organization?.numberOfComputers || "—"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Number of Vehicles:
                </span>
                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                  {selectedApp.organization?.numberOfVehicles || "—"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Number of Offices:
                </span>
                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                  {selectedApp.organization?.numberOfOffices || "—"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-black text-[#0C2A4C] mr-2">
                  Has Store House:
                </span>
                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                  {selectedApp.organization?.hasStoreHouse ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT AND ADDRESS */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
            <div className="w-1 h-5 bg-[#DCC380] rounded-full" />
            <h4 className="text-sm font-black text-[#0C2A4C] uppercase tracking-[0.2em]">
              Contact and Address
            </h4>
          </div>

          <div className="bg-[#0C2A4C] rounded-[32px] p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
            {/* Decorative Brand Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#DCC380] opacity-5 -mr-16 -mt-16 rounded-full" />

            <div className="space-y-6 text-sm">
              {/* Address Row */}
              <div className="flex flex-wrap items-center gap-y-3 text-white/90">
                <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                  Region:
                </span>
                <span className="font-bold mr-4">
                  {selectedApp.organization?.address?.kebele?.woreda?.zone
                    ?.region?.name || "—"}
                </span>

                <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                  Zone:
                </span>
                <span className="font-bold mr-4">
                  {selectedApp.organization?.address?.kebele?.woreda?.zone
                    ?.name || "—"}
                </span>

                <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                  Woreda:
                </span>
                <span className="font-bold mr-4">
                  {selectedApp.organization?.address?.kebele?.woreda?.name ||
                    "—"}
                </span>

                <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                  Kebele:
                </span>
                <span className="font-bold mr-4">
                  {selectedApp.organization?.address?.kebele?.name || "—"}
                </span>

                <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                  Special Location:
                </span>
                <span className="font-bold mr-4">
                  {selectedApp.organization?.address?.specialLocation || "—"}
                </span>

                <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                  House No:
                </span>
                <span className="font-bold">
                  {selectedApp.organization?.address?.houseNumber || "—"}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 w-full" />

              {/* Contact Row */}
              <div className="flex flex-wrap items-center gap-y-3 text-white/90">
                <div className="flex items-center mr-8">
                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Email Address:
                  </span>
                  <span className="font-bold italic">
                    {selectedApp.organization?.email || "—"}
                  </span>
                </div>

                <div className="flex items-center mr-8">
                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Fax:
                  </span>
                  <span className="font-bold">
                    {selectedApp.organization?.faxNumber || "—"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Permanent Telephone:
                  </span>
                  <span className="font-bold underline decoration-[#DCC380] underline-offset-4">
                    {selectedApp.organization?.phone || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal & Compliance */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
          <h4 className="text-base font-black text-primary uppercase tracking-tight">
            Legal & Compliance
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <ReviewItem
            label="Trade Pre-registration"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, [
                  "trade",
                  "pre",
                  "registration",
                ])?.fileUrl,
              ) || "-"
            }
            id="ren_pre_reg"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, [
                "trade",
                "pre",
                "registration",
              ])?.fileUrl
            }
          />
          <ReviewItem
            label="Renewed License"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, [
                  "renewed",
                  "trade",
                  "license",
                ])?.fileUrl,
              ) || "-"
            }
            id="ren_license"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, [
                "renewed",
                "trade",
                "license",
              ])?.fileUrl
            }
          />
          <ReviewItem
            label="Labor & Skills Bureau"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, [
                  "labor",
                  "skill",
                  "bureau",
                ])?.fileUrl,
              ) || "-"
            }
            id="ren_labor"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, [
                "labor",
                "skill",
                "bureau",
              ])?.fileUrl
            }
          />
          <ReviewItem
            label="Taxpayer Clearance"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["tax", "clearance"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_tax"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["tax", "clearance"])
                ?.fileUrl
            }
          />
          <ReviewItem
            label="Insurance Coverage"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["insurance", "coverage"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_insurance"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["insurance", "coverage"])
                ?.fileUrl
            }
          />
          <ReviewItem
            label="List of Tech Used"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["tech", "list", "used"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_tech"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["tech", "list", "used"])
                ?.fileUrl
            }
          />
          <ReviewItem
            label="Capital (Level)"
            value={
              selectedApp.organization?.capitalAmount !== undefined &&
              selectedApp.organization?.capitalAmount !== null
                ? String(selectedApp.organization.capitalAmount + " ETB")
                : "-"
            }
            id="ren_capital"
          />
        </div>
      </section>

      {/* All Renewal Documents */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
          <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
          <h4 className="text-base font-black text-primary uppercase tracking-tight">
            All Renewal Documents
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {buildDocumentCards(
            selectedApp.organization?.documents || [],
            "ren_all_docs",
          ).map((doc) => (
            <ReviewItem
              key={doc.id}
              label={doc.label}
              value={doc.fileName}
              id={doc.id}
              isFile
              fileUrl={doc.fileUrl}
              documentTarget={
                doc.documentId
                  ? {
                      scope: "organization",
                      id: Number(doc.documentId),
                      isVerified: doc.isVerified,
                      verifiedAt: doc.verifiedAt ?? null,
                    }
                  : null
              }
              verificationKey={
                doc.documentId ? `organization:${doc.documentId}` : doc.id
              }
              initialVerified={doc.isVerified}
            />
          ))}
        </div>
      </section>

      {/* Training & Logistics */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
          <h4 className="text-base font-black text-primary uppercase tracking-tight">
            Training & Logistics
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <ReviewItem
            label="Training Place"
            value={selectedApp.training?.trainingAddress || "-"}
            id="ren_train_place"
          />
          <ReviewItem
            label="Training Provider"
            value={selectedApp.training?.trainingBodyName || "-"}
            id="ren_train_provider"
          />
          <ReviewItem
            label="Days of Training"
            value={
              selectedApp.training?.trainingDurationDays !== undefined &&
              selectedApp.training?.trainingDurationDays !== null
                ? `${selectedApp.training.trainingDurationDays} Days`
                : "-"
            }
            id="ren_train_days"
          />
          <ReviewItem
            label="People (M/F/Total)"
            value={`${selectedApp.training?.totalTraineesMale ?? 0}/${selectedApp.training?.totalTraineesFemale ?? 0}/${(selectedApp.training?.totalTraineesMale ?? 0) + (selectedApp.training?.totalTraineesFemale ?? 0)}`}
            id="ren_train_people"
          />
          <ReviewItem
            label="Training Cert"
            value={
              getFileName(selectedApp.training?.trainingCertificateUrl) || "-"
            }
            id="ren_train_cert"
            isFile
            fileUrl={selectedApp.training?.trainingCertificateUrl}
          />

          <ReviewItem
            label="Has Store House"
            value={
              selectedApp.organization?.hasStoreHouse === undefined ||
              selectedApp.organization?.hasStoreHouse === null
                ? "-"
                : selectedApp.organization.hasStoreHouse
                  ? "Yes"
                  : "No"
            }
            id="ren_storehouse"
          />
          <ReviewItem
            label="No. of Computers"
            value={
              selectedApp.organization?.numberOfComputers !== undefined &&
              selectedApp.organization?.numberOfComputers !== null
                ? String(selectedApp.organization.numberOfComputers)
                : "-"
            }
            id="ren_computers_count"
          />
          <ReviewItem
            label="No. of Vehicles"
            value={
              selectedApp.organization?.numberOfVehicles !== undefined &&
              selectedApp.organization?.numberOfVehicles !== null
                ? String(selectedApp.organization.numberOfVehicles)
                : "-"
            }
            id="ren_vehicles_count"
          />
        </div>
      </section>

      {/* Employee & Operations Docs */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
          <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
          <h4 className="text-base font-black text-primary uppercase tracking-tight">
            Employee & Operations Documents
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <ReviewItem
            label="List of Employees"
            value={
              selectedApp.organization?.serviceContracts?.length !== undefined
                ? `${selectedApp.organization?.serviceContracts?.length || 0} service contract(s)`
                : "-"
            }
            id="ren_employee_list"
          />
          <ReviewItem
            label="Guard Insurance Type"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["insurance", "coverage"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_guard_ins"
          />
          <ReviewItem
            label="Job Classification"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["job", "classification"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_job_class"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["job", "classification"])
                ?.fileUrl
            }
          />
          <ReviewItem
            label="Guard Training Cert"
            value={
              getFileName(selectedApp.training?.trainingCertificateUrl) || "-"
            }
            id="ren_guard_train"
            isFile
            fileUrl={selectedApp.training?.trainingCertificateUrl}
          />
          <ReviewItem
            label="Payroll (Pay Slips)"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["payroll", "pay slip"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_payroll"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["payroll", "pay slip"])
                ?.fileUrl
            }
          />
          <ReviewItem
            label="Social Security Slips"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["social", "security"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_social_sec"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["social", "security"])
                ?.fileUrl
            }
          />
        </div>
      </section>

      {/* Service Contracts */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
          <div className="w-1.5 h-6 bg-emerald-700 rounded-full" />
          <h4 className="text-base font-black text-primary uppercase tracking-tight">
            Service Contracts
          </h4>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
            {selectedApp.organization?.serviceContracts?.length || 0} service
            contract(s)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {getServiceContractCards(selectedApp).length > 0 ? (
            getServiceContractCards(selectedApp).map(
              (contract: ServiceContractCard) => (
                <div key={contract.id} className="flex flex-col">
                  <ReviewItem
                    label={contract.serviceUserName || "Service Contract"}
                    value={contract.fileName || "-"}
                    id={contract.id}
                    isFile
                    fileUrl={contract.contractUrl}
                    documentTarget={
                      contract.contractId
                        ? {
                            scope: "organization",
                            id: Number(contract.contractId),
                            isVerified: false,
                            verifiedAt: null,
                          }
                        : null
                    }
                    verificationKey={
                      contract.contractId
                        ? `organization:${contract.contractId}`
                        : contract.id
                    }
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-black">Service User: </span>
                      <span>{contract.serviceUserName || "-"}</span>
                    </div>
                    <div>
                      <span className="font-black">Assigned Personnel: </span>
                      <span>{contract.assignedPersonnelCount ?? "-"}</span>
                    </div>
                    <div className="truncate">
                      <span className="font-black">Address: </span>
                      <span>{formatContractAddress(contract.address)}</span>
                    </div>
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-6 text-sm text-gray-500">
              No service contracts found for this renewal application.
            </div>
          )}
        </div>
      </section>

      {/* Agreements & Leases */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
          <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
          <h4 className="text-base font-black text-primary uppercase tracking-tight">
            Agreements & Leases
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <ReviewItem
            label="Office Lease (1yr left)"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["office", "lease"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_office_lease"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["office", "lease"])
                ?.fileUrl
            }
          />
          <ReviewItem
            label="Vehicle Lease Docs"
            value={
              getFileName(
                findOrganizationDocument(selectedApp, ["vehicle", "lease"])
                  ?.fileUrl,
              ) || "-"
            }
            id="ren_vehicle_lease"
            isFile
            fileUrl={
              findOrganizationDocument(selectedApp, ["vehicle", "lease"])
                ?.fileUrl
            }
          />
        </div>
      </section>
      <div>
        {/* Education Breakdown */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-1">
            <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
            <h4 className="text-lg font-black uppercase tracking-tighter text-[#1A304A]">
              Security Guards Education Level Breakdown
            </h4>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#002952] border-b border-gray-200 text-white font-semibold text-xxs uppercase tracking-wider">
                  {" "}
                  <th className="p-4">Education LEVEl</th>
                  <th className="p-4 text-center">Number of Males</th>
                  <th className="p-4 text-center">Number of Females</th>
                  <th className="p-4 text-right">Sub-Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {eduStatRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {row.label}
                    </td>
                    <td className="p-4 text-center text-blue-600 font-medium">
                      {row.male}
                    </td>
                    <td className="p-4 text-center text-pink-600 font-medium">
                      {row.female}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      {row.male + row.female}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 text-gray-900 font-semibold">
                  <td className="p-4">Total</td>
                  <td className="p-4 text-center text-blue-700">
                    {educationTotals.male}
                  </td>
                  <td className="p-4 text-center text-pink-700">
                    {educationTotals.female}
                  </td>
                  <td className="p-4 text-right text-gray-900">
                    {educationTotals.male + educationTotals.female}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
