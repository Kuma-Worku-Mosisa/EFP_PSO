import React from "react";

type RenewalReviewContentProps = {
  selectedApp: any;
  ReviewItem: React.ComponentType<any>;
  renderPersonnelInfoSection: (props: any) => React.ReactNode;
  getEmployeeDisplayName: (employee: any) => string;
  getEmployeeAddressDetails: (employee: any) => any;
  getEmployeeEmploymentDetails: (employee: any) => any;
  findOrganizationDocument: (application: any, terms: string[]) => any;
  findEmployeeDoc: (employee: any, terms: string[], excludeTerms?: string[]) => any;
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
  isApplicationReadyForApproval: (application: any) => boolean;
};

export const RenewalReviewContent = ({
  selectedApp,
  ReviewItem,
  renderPersonnelInfoSection,
  getEmployeeDisplayName,
  getEmployeeAddressDetails,
  getEmployeeEmploymentDetails,
  findOrganizationDocument,
  findEmployeeDoc,
  getEmployeeDocumentTarget,
  getEmployeeOnlyDocumentTarget,
  getEmployeeOnlyDocumentCard,
  getFileName,
  buildDocumentCards,
  isApplicationReadyForApproval,
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

  const getServiceContractCards = (
    application?: any,
  ): ServiceContractCard[] =>
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

  const currentApplicationReadyForApproval = selectedApp
    ? isApplicationReadyForApproval(selectedApp)
    : false;

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
                  findOrganizationDocument(selectedApp, [
                    "insurance",
                    "coverage",
                  ])?.fileUrl,
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
                  findOrganizationDocument(selectedApp, [
                    "tech",
                    "list",
                    "used",
                  ])?.fileUrl,
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
              label="No. of Offices"
              value={
                selectedApp.organization?.numberOfOffices !== undefined &&
                selectedApp.organization?.numberOfOffices !== null
                  ? String(selectedApp.organization.numberOfOffices)
                  : "-"
              }
              id="ren_offices_count"
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
                  findOrganizationDocument(selectedApp, [
                    "insurance",
                    "coverage",
                  ])?.fileUrl,
                ) || "-"
              }
              id="ren_guard_ins"
            />
            <ReviewItem
              label="Job Classification"
              value={
                getFileName(
                  findOrganizationDocument(selectedApp, [
                    "job",
                    "classification",
                  ])?.fileUrl,
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
              label="House Lease Agreement"
              value={
                getFileName(
                  findOrganizationDocument(selectedApp, ["house", "lease"])
                    ?.fileUrl,
                ) || "-"
              }
              id="ren_house_lease"
              isFile
              fileUrl={
                findOrganizationDocument(selectedApp, ["house", "lease"])
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

        {/* Statistical Records */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              V. Verification & Statistical Records
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem
              label="Fingerprint (M/F/T)"
              value={`${selectedApp.guardEducationStat?.grade_3_9_male ?? 0}/${selectedApp.guardEducationStat?.grade_3_9_female ?? 0}/${(selectedApp.guardEducationStat?.grade_3_9_male ?? 0) + (selectedApp.guardEducationStat?.grade_3_9_female ?? 0)}`}
              id="ren_stat_finger"
            />
            <ReviewItem
              label="Medical Certs (M/F/T)"
              value={`${selectedApp.guardEducationStat?.grade_10_12_male ?? 0}/${selectedApp.guardEducationStat?.grade_10_12_female ?? 0}/${(selectedApp.guardEducationStat?.grade_10_12_male ?? 0) + (selectedApp.guardEducationStat?.grade_10_12_female ?? 0)}`}
              id="ren_stat_med"
            />
            <ReviewItem
              label="Guarantee Proof (M/F/T)"
              value={`${selectedApp.guardEducationStat?.certificate_male ?? 0}/${selectedApp.guardEducationStat?.certificate_female ?? 0}/${(selectedApp.guardEducationStat?.certificate_male ?? 0) + (selectedApp.guardEducationStat?.certificate_female ?? 0)}`}
              id="ren_stat_guarantee"
            />
            <ReviewItem
              label="Kebele Support (M/F/T)"
              value={`${selectedApp.guardEducationStat?.diploma_male ?? 0}/${selectedApp.guardEducationStat?.diploma_female ?? 0}/${(selectedApp.guardEducationStat?.diploma_male ?? 0) + (selectedApp.guardEducationStat?.diploma_female ?? 0)}`}
              id="ren_stat_kebele"
            />
            <ReviewItem
              label="Training History (M/F/T)"
              value={`${selectedApp.training?.totalTraineesMale ?? 0}/${selectedApp.training?.totalTraineesFemale ?? 0}/${(selectedApp.training?.totalTraineesMale ?? 0) + (selectedApp.training?.totalTraineesFemale ?? 0)}`}
              id="ren_stat_trained"
            />
            <ReviewItem
              label="Applicant Address List"
              value={
                getFileName(
                  selectedApp.organization?.serviceContracts?.[0]?.contractUrl,
                ) || "-"
              }
              id="ren_address_list"
              isFile
              fileUrl={
                selectedApp.organization?.serviceContracts?.[0]?.contractUrl
              }
            />
          </div>
        </section>

        {/* Operational Status */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-gray-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              Operational & Change Status
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <ReviewItem
              label="Manager Changed?"
              value={selectedApp.manager ? "No" : "-"}
              id="ren_man_changed"
            />
            <ReviewItem
              label="Ops Head Changed?"
              value={selectedApp.operationsHead ? "No" : "-"}
              id="ren_ops_changed"
            />
            <ReviewItem
              label="Admin Head Changed?"
              value={selectedApp.adminHead ? "No" : "-"}
              id="ren_adm_changed"
            />
            <ReviewItem
              label="Employees Dismissed"
              value={"-"}
              id="ren_dismissed"
            />
            <ReviewItem label="New Hires" value={"-"} id="ren_new_hires" />
            <ReviewItem
              label="Qualification Level"
              value={selectedApp.type || "-"}
              id="ren_qual_level"
            />
            <ReviewItem label="Written Warning?" value={"-"} id="ren_warning" />
            <ReviewItem
              label="Renewal Criteria Met?"
              value={currentApplicationReadyForApproval ? "Yes" : "No"}
              id="ren_met_criteria"
            />
          </div>
        </section>

        {/* Personnel Requirements Grid */}
        <div className="space-y-12 mt-16 pt-16 border-t border-gray-200">
          {/* Manager & Key Personnel Audit */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h4 className="text-lg font-black text-primary uppercase tracking-tighter">
                I. Organization Manager Requirements
              </h4>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-widest">
                Audit Terminal
              </span>
            </div>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              {renderPersonnelInfoSection({
                accentClass: "bg-amber-500",
                title: "Personal Information",
                name: getEmployeeDisplayName(selectedApp.manager),
                gender: selectedApp.manager?.gender || "-",
                citizenship: selectedApp.manager?.citizenship || "-",
                phoneLabel: "Phone",
                phoneValue:
                  selectedApp.manager?.user?.phone ||
                  selectedApp.manager?.phone ||
                  "-",
                emailLabel: "Email",
                emailValue:
                  selectedApp.manager?.user?.email ||
                  selectedApp.manager?.email ||
                  "-",
                addressTitle: "Address",
                regionLabel: "Region",
                regionValue: getEmployeeAddressDetails(selectedApp.manager)
                  .region,
                zoneLabel: "Zone",
                zoneValue: getEmployeeAddressDetails(selectedApp.manager).zone,
                woredaLabel: "Woreda",
                woredaValue: getEmployeeAddressDetails(selectedApp.manager)
                  .woreda,
                kebeleLabel: "Kebele",
                kebeleValue: getEmployeeAddressDetails(selectedApp.manager)
                  .kebele,
                specialLocationLabel: "Special Location",
                specialLocationValue: getEmployeeAddressDetails(
                  selectedApp.manager,
                ).specialLocation,
                houseNumberLabel: "House Number",
                houseNumberValue: getEmployeeAddressDetails(selectedApp.manager)
                  .houseNumber,
                educationLevelLabel: "Education Level",
                educationLevelValue: getEmployeeEmploymentDetails(
                  selectedApp.manager,
                ).educationLevel,
                workExpYearsLabel: "Work Exp. Years",
                workExpYearsValue: getEmployeeEmploymentDetails(
                  selectedApp.manager,
                ).workExpYears,
                totalExpYearsLabel: "Total Exp. Years",
                totalExpYearsValue: getEmployeeEmploymentDetails(
                  selectedApp.manager,
                ).totalExpYears,
                isBlacklistedLabel: "Blacklisted",
                isBlacklistedValue: getEmployeeEmploymentDetails(
                  selectedApp.manager,
                ).isBlacklisted,
              })}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem
                  label="Fingerprint from police"
                  id="ren_mgr_finger"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["fingerprint"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["fingerprint"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Medical result"
                  id="ren_mgr_med"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["medical"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["medical"])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Training certificate"
                  id="ren_mgr_train"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["training"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["training"])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Support letter (Kebele)"
                  id="ren_mgr_kebele"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, [
                        "support",
                        "kebele",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["support", "kebele"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Proof of collateral"
                  id="ren_mgr_coll"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["collateral"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["collateral"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Exp (Police/Def/Mgr Min 2yr)"
                  id="ren_mgr_exp"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["experience"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["experience"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Resignation record"
                  id="ren_mgr_resign"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["resignation"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["resignation"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Edu (Degree Min)"
                  id="ren_mgr_edu"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["education"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["education"])?.fileUrl
                  }
                />
                <ReviewItem
                  label="National Id"
                  id="ren_mgr_nid"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, ["national id doc"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, ["national id doc"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Renewed ID/Passport"
                  id="ren_mgr_kid"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, [
                        "renewed",
                        "passport",
                        "kebele",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, [
                      "renewed",
                      "passport",
                      "kebele",
                    ])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Org identification"
                  id="ren_mgr_oid"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.manager, [
                        "organization id",
                        "organization identification",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.manager, [
                      "organization id",
                      "organization identification",
                    ])?.fileUrl
                  }
                />
              </div>
            </div>
          </section>

          {/* Ops Head Audit */}
          <section className="space-y-6">
            <h4 className="px-4 text-lg font-black text-primary uppercase tracking-tighter">
              II. Operations Head Requirements
            </h4>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              {renderPersonnelInfoSection({
                accentClass: "bg-blue-700",
                title: "Personal Information",
                name: getEmployeeDisplayName(selectedApp.operationsHead),
                gender: selectedApp.operationsHead?.gender || "-",
                citizenship: selectedApp.operationsHead?.citizenship || "-",
                phoneLabel: "Phone",
                phoneValue:
                  selectedApp.operationsHead?.user?.phone ||
                  selectedApp.operationsHead?.phone ||
                  "-",
                emailLabel: "Email",
                emailValue:
                  selectedApp.operationsHead?.user?.email ||
                  selectedApp.operationsHead?.email ||
                  "-",
                addressTitle: "Address",
                regionLabel: "Region",
                regionValue: getEmployeeAddressDetails(
                  selectedApp.operationsHead,
                ).region,
                zoneLabel: "Zone",
                zoneValue: getEmployeeAddressDetails(selectedApp.operationsHead)
                  .zone,
                woredaLabel: "Woreda",
                woredaValue: getEmployeeAddressDetails(
                  selectedApp.operationsHead,
                ).woreda,
                kebeleLabel: "Kebele",
                kebeleValue: getEmployeeAddressDetails(
                  selectedApp.operationsHead,
                ).kebele,
                specialLocationLabel: "Special Location",
                specialLocationValue: getEmployeeAddressDetails(
                  selectedApp.operationsHead,
                ).specialLocation,
                houseNumberLabel: "House Number",
                houseNumberValue: getEmployeeAddressDetails(
                  selectedApp.operationsHead,
                ).houseNumber,
                educationLevelLabel: "Education Level",
                educationLevelValue: getEmployeeEmploymentDetails(
                  selectedApp.operationsHead,
                ).educationLevel,
                workExpYearsLabel: "Work Exp. Years",
                workExpYearsValue: getEmployeeEmploymentDetails(
                  selectedApp.operationsHead,
                ).workExpYears,
                totalExpYearsLabel: "Total Exp. Years",
                totalExpYearsValue: getEmployeeEmploymentDetails(
                  selectedApp.operationsHead,
                ).totalExpYears,
                isBlacklistedLabel: "Blacklisted",
                isBlacklistedValue: getEmployeeEmploymentDetails(
                  selectedApp.operationsHead,
                ).isBlacklisted,
              })}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem
                  label="Fingerprint from police"
                  id="ren_ops_finger"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "fingerprint",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["fingerprint"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Medical result"
                  id="ren_ops_med"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, ["medical"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["medical"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Training certificate"
                  id="ren_ops_train"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, ["training"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["training"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Support letter (Kebele)"
                  id="ren_ops_kebele"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "support",
                        "kebele",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, [
                      "support",
                      "kebele",
                    ])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Proof of collateral"
                  id="ren_ops_coll"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "collateral",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["collateral"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Exp (Def/Police/Sec Law 2yr)"
                  id="ren_ops_exp"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "experience",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["experience"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Resignation record"
                  id="ren_ops_resign"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "resignation",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["resignation"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Edu (Degree Min)"
                  id="ren_ops_edu"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, ["education"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, ["education"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="National Id"
                  id="ren_ops_nid"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "national id doc",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, [
                      "national id doc",
                    ])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Renewed ID/Passport"
                  id="ren_ops_kid"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "renewed",
                        "passport",
                        "kebele",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, [
                      "renewed",
                      "passport",
                      "kebele",
                    ])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Org identification"
                  id="ren_ops_oid"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.operationsHead, [
                        "organization id",
                        "organization identification",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.operationsHead, [
                      "organization id",
                      "organization identification",
                    ])?.fileUrl
                  }
                />
              </div>
            </div>
          </section>

          {/* Admin Head Audit */}
          <section className="space-y-6">
            <h4 className="px-4 text-lg font-black text-primary uppercase tracking-tighter">
              III. Administration Head Requirements
            </h4>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              {renderPersonnelInfoSection({
                accentClass: "bg-purple-700",
                title: "Personal Information",
                name: "Dawit Haile",
                gender: "Male",
                citizenship: "Ethiopian",
                phoneLabel: "Phone",
                phoneValue: "+251 933",
                emailLabel: "Email",
                emailValue: "dawit@lion.com",
                addressTitle: "Address",
                regionLabel: "Region",
                regionValue: "Addis",
                zoneLabel: "Zone",
                zoneValue: "Arada",
                woredaLabel: "Woreda",
                woredaValue: "01",
                kebeleLabel: "Kebele",
                kebeleValue: "15",
                specialLocationLabel: "Special Location",
                specialLocationValue: "Church",
                houseNumberLabel: "House Number",
                houseNumberValue: "401",
                educationLevelLabel: "Education Level",
                educationLevelValue: "Degree",
                workExpYearsLabel: "Work Exp. Years",
                workExpYearsValue: "6",
                totalExpYearsLabel: "Total Exp. Years",
                totalExpYearsValue: "10",
                isBlacklistedLabel: "Blacklisted",
                isBlacklistedValue: "No",
              })}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem
                  label="Fingerprint from police"
                  id="new_admin_finger"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, ["fingerprint"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, ["fingerprint"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Medical result"
                  id="new_admin_med"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, ["medical"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, ["medical"])?.fileUrl
                  }
                />
                <ReviewItem
                  label="training certificate"
                  id="new_admin_train"
                  value={
                    getFileName(
                      getEmployeeOnlyDocumentCard(selectedApp.adminHead, [
                        "training certificate",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    getEmployeeOnlyDocumentCard(selectedApp.adminHead, [
                      "training certificate",
                    ])?.fileUrl
                  }
                  documentTarget={getEmployeeOnlyDocumentCard(
                    selectedApp.adminHead,
                    ["training certificate"],
                  )}
                  verificationKey={
                    getEmployeeOnlyDocumentCard(selectedApp.adminHead, [
                      "training certificate",
                    ])?.id
                      ? `admin:${
                          getEmployeeOnlyDocumentCard(selectedApp.adminHead, [
                            "training certificate",
                          ])?.id
                        }`
                      : "admin:training-certificate"
                  }
                  initialVerified={Boolean(
                    getEmployeeOnlyDocumentCard(selectedApp.adminHead, [
                      "training certificate",
                    ])?.isVerified,
                  )}
                />
                <ReviewItem
                  label="support letter from kebele"
                  id="new_admin_kebele"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, [
                        "support",
                        "kebele",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, [
                      "support",
                      "kebele",
                    ])?.fileUrl
                  }
                />
                <ReviewItem
                  label="proof of collateral"
                  id="new_admin_collateral"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, ["collateral"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, ["collateral"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Work experience (Admin 2+ Years / Degree)"
                  id="new_admin_exp"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, ["experience"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, ["experience"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Dismissal / resignation record"
                  id="new_admin_resign"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, ["resignation"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, ["resignation"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Educational certificate"
                  id="new_admin_edu"
                  value={
                    getFileName(
                      findEmployeeDoc(selectedApp.adminHead, ["education"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(selectedApp.adminHead, ["education"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="National Id"
                  id="new_admin_id"
                  value={
                    getFileName(
                      findEmployeeDoc(
                        selectedApp.adminHead,
                        ["national id doc"],
                        [
                          "organization id",
                          "organization identification",
                          "passport",
                          "kebele",
                        ],
                      )?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(
                      selectedApp.adminHead,
                      ["national id doc"],
                      [
                        "organization id",
                        "organization identification",
                        "passport",
                        "kebele",
                      ],
                    )?.fileUrl
                  }
                  documentTarget={getEmployeeDocumentTarget(
                    selectedApp.adminHead,
                    ["national id doc"],
                    [
                      "organization id",
                      "organization identification",
                      "passport",
                      "kebele",
                    ],
                  )}
                />
                <ReviewItem
                  label="Renewed Kebele ID / passport"
                  id="new_admin_kid"
                  value={
                    getFileName(
                      findEmployeeDoc(
                        selectedApp.adminHead,
                        ["renewed", "passport", "kebele"],
                        [
                          "organization id",
                          "organization identification",
                          "national id doc",
                        ],
                      )?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(
                      selectedApp.adminHead,
                      ["renewed", "passport", "kebele"],
                      [
                        "organization id",
                        "organization identification",
                        "national id doc",
                      ],
                    )?.fileUrl
                  }
                />
                <ReviewItem
                  label="Organization identification"
                  id="new_admin_oid"
                  value={
                    getFileName(
                      findEmployeeDoc(
                        selectedApp.adminHead,
                        ["organization id", "organization identification"],
                        ["passport", "kebele", "national id doc"],
                      )?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findEmployeeDoc(
                      selectedApp.adminHead,
                      ["organization id", "organization identification"],
                      ["passport", "kebele", "national id doc"],
                    )?.fileUrl
                  }
                />
              </div>
            </div>
          </section>

          {/* Security Guard Personnel Requirements */}
          <section className="space-y-6">
            <h4 className="px-4 text-lg font-black text-primary uppercase tracking-tighter">
              IV. Security Guard Personnel Requirements (General)
            </h4>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem
                  label="Full name"
                  value={
                    selectedApp.applicantFullName ||
                    selectedApp.user?.fullName ||
                    "-"
                  }
                  id="ren_grd_name"
                />
                <ReviewItem
                  label="Gender"
                  value={selectedApp.manager?.gender || "-"}
                  id="ren_grd_gender"
                />
                <ReviewItem
                  label="Citizenship"
                  value={selectedApp.manager?.citizenship || "-"}
                  id="ren_grd_citizen"
                />
                <ReviewItem
                  label="Phone / Email"
                  value={`${selectedApp.organization?.phone || "-"} / ${selectedApp.organization?.email || "-"}`}
                  id="ren_grd_contact"
                />
                <ReviewItem
                  label="Address (R/Z/W/K/Loc/H)"
                  value={`${selectedApp.organization?.address?.kebele?.woreda?.zone?.region?.name || "-"}, ${selectedApp.organization?.address?.kebele?.woreda?.zone?.name || "-"}, ${selectedApp.organization?.address?.kebele?.woreda?.name || "-"}, ${selectedApp.organization?.address?.kebele?.name || "-"}, ${selectedApp.organization?.address?.specialLocation || "-"}, ${selectedApp.organization?.address?.houseNumber || "-"}`}
                  id="ren_grd_addr"
                />
                <ReviewItem
                  label="Fingerprint from police"
                  id="ren_grd_finger"
                  value={
                    getFileName(
                      findOrganizationDocument(selectedApp, ["fingerprint"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findOrganizationDocument(selectedApp, ["fingerprint"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Medical result"
                  id="ren_grd_med"
                  value={
                    getFileName(
                      findOrganizationDocument(selectedApp, ["medical"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findOrganizationDocument(selectedApp, ["medical"])?.fileUrl
                  }
                />
                <ReviewItem
                  label="Training certificate"
                  id="ren_grd_train"
                  value={
                    getFileName(selectedApp.training?.trainingCertificateUrl) ||
                    "-"
                  }
                  isFile
                  fileUrl={selectedApp.training?.trainingCertificateUrl}
                />
                <ReviewItem
                  label="Support letter (Kebele)"
                  id="ren_grd_kebele"
                  value={
                    getFileName(
                      findOrganizationDocument(selectedApp, [
                        "support",
                        "kebele",
                      ])?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findOrganizationDocument(selectedApp, ["support", "kebele"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Proof of collateral"
                  id="ren_grd_coll"
                  value={
                    getFileName(
                      findOrganizationDocument(selectedApp, ["collateral"])
                        ?.fileUrl,
                    ) || "-"
                  }
                  isFile
                  fileUrl={
                    findOrganizationDocument(selectedApp, ["collateral"])
                      ?.fileUrl
                  }
                />
                <ReviewItem
                  label="Exp (Admin 2+ yr / Degree)"
                  id="ren_grd_exp"
                  value={"-"}
                  isFile
                />
                <ReviewItem
                  label="Resignation record"
                  id="ren_grd_resign"
                  value={"-"}
                  isFile
                />
                <ReviewItem
                  label="Educational certificate"
                  id="ren_grd_edu"
                  value={"-"}
                  isFile
                />
                <ReviewItem
                  label="National Id"
                  id="ren_grd_nid"
                  value={"-"}
                  isFile
                />
                <ReviewItem
                  label="Renewed ID/Passport"
                  id="ren_grd_kid"
                  value={"-"}
                  isFile
                />
                <ReviewItem
                  label="Org identification"
                  id="ren_grd_oid"
                  value={"-"}
                  isFile
                />
              </div>
            </div>
          </section>

          {/* Recruitment Details */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 px-4">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              <h4 className="text-lg font-black text-primary uppercase tracking-tighter">
                Recruitment & Defense History
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem
                label="Kebele ID / Passport Renewed"
                value={
                  getFileName(
                    findOrganizationDocument(selectedApp, [
                      "renewed",
                      "passport",
                      "kebele",
                    ])?.fileUrl,
                  )
                    ? "Yes"
                    : "-"
                }
                id="ren_rec_id"
              />
              <ReviewItem
                label="Fingerprint (Stat)"
                value={
                  getFileName(
                    findOrganizationDocument(selectedApp, ["fingerprint"])
                      ?.fileUrl,
                  )
                    ? "Provided"
                    : "-"
                }
                id="ren_rec_finger"
              />
              <ReviewItem
                label="Guarantor Proof"
                value={
                  getFileName(
                    findOrganizationDocument(selectedApp, ["collateral"])
                      ?.fileUrl,
                  )
                    ? "Provided"
                    : "-"
                }
                id="ren_rec_guarantee"
              />
              <ReviewItem
                label="Kebele Support Submited?"
                value={
                  getFileName(
                    findOrganizationDocument(selectedApp, ["support", "kebele"])
                      ?.fileUrl,
                  )
                    ? "Yes"
                    : "-"
                }
                id="ren_rec_kebele"
              />
              <ReviewItem
                label="Employment Letter"
                value={
                  getFileName(
                    findOrganizationDocument(selectedApp, [
                      "employment",
                      "letter",
                    ])?.fileUrl,
                  ) || "-"
                }
                id="ren_rec_letter"
                isFile
                fileUrl={
                  findOrganizationDocument(selectedApp, [
                    "employment",
                    "letter",
                  ])?.fileUrl
                }
              />
              <ReviewItem
                label="Defense History (Years/Role)"
                value={"-"}
                id="ren_rec_defense"
              />
              <ReviewItem
                label="Police History (Years/Role)"
                value={"-"}
                id="ren_rec_police"
              />
              <ReviewItem
                label="Total Law Enforcement Years"
                value={"-"}
                id="ren_rec_total_yrs"
              />
              <ReviewItem
                label="National Digital ID"
                value={selectedApp.user?.faydaId || "-"}
                id="ren_rec_digid"
              />
              <ReviewItem
                label="Candidate Age"
                value={
                  selectedApp.manager?.age
                    ? String(selectedApp.manager.age)
                    : "-"
                }
                id="ren_rec_age"
              />
            </div>
          </section>

          {/* Education Breakdown */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 px-1">
              <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
              <h4 className="text-lg font-black uppercase tracking-tighter text-[#1A304A]">
                Security Guards Education Level Breakdown
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[
                {
                  educationLevelLabel: "3rd to 9th Grade",
                  maleCount:
                    selectedApp.guardEducationStat?.grade_3_9_male ?? 0,
                  femaleCount:
                    selectedApp.guardEducationStat?.grade_3_9_female ?? 0,
                },
                {
                  educationLevelLabel: "10th to 12th Grade",
                  maleCount:
                    selectedApp.guardEducationStat?.grade_10_12_male ?? 0,
                  femaleCount:
                    selectedApp.guardEducationStat?.grade_10_12_female ?? 0,
                },
                {
                  educationLevelLabel: "Vocational Certificate",
                  maleCount:
                    selectedApp.guardEducationStat?.certificate_male ?? 0,
                  femaleCount:
                    selectedApp.guardEducationStat?.certificate_female ?? 0,
                },
                {
                  educationLevelLabel: "Diploma",
                  maleCount: selectedApp.guardEducationStat?.diploma_male ?? 0,
                  femaleCount:
                    selectedApp.guardEducationStat?.diploma_female ?? 0,
                },
                {
                  educationLevelLabel: "Degree",
                  maleCount: selectedApp.guardEducationStat?.degree_male ?? 0,
                  femaleCount:
                    selectedApp.guardEducationStat?.degree_female ?? 0,
                },
                {
                  educationLevelLabel: "Second Degree",
                  maleCount:
                    selectedApp.guardEducationStat?.second_degree_male ?? 0,
                  femaleCount:
                    selectedApp.guardEducationStat?.second_degree_female ?? 0,
                },
              ].map((educationItem, index) => {
                const totalCount =
                  educationItem.maleCount + educationItem.femaleCount;
                return (
                  <div
                    key={index}
                    className="border border-slate-200/60 dark:border-zinc-800/80 rounded-xl p-4 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Category Header */}
                    <div className="text-sm font-bold tracking-tight mb-4 text-[#1A304A]">
                      {educationItem.educationLevelLabel}
                    </div>

                    {/* Demographics Split Grid */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/60">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Male
                        </span>
                        <span className="text-sm font-extrabold text-[#1A304A]">
                          {educationItem.maleCount}
                        </span>
                      </div>

                      <div className="w-px h-7 bg-slate-100 dark:bg-zinc-800" />

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Female
                        </span>
                        <span className="text-sm font-extrabold text-[#1A304A]">
                          {educationItem.femaleCount}
                        </span>
                      </div>

                      <div className="w-px h-7 bg-slate-100 dark:bg-zinc-800" />

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider">
                          Total
                        </span>
                        <span className="text-base font-black text-[#1A304A]">
                          {totalCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
  );
};
