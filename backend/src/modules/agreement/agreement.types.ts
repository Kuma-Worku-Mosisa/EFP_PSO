// src/modules/agreement/agreement.types.ts

export interface AgreementSnapshot {
  agencyName: string;
  email: string;
  phone: string;
  fax: string;
  managerName: string;
  signedByFullName: string;
  signedByPhone: string;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  location: string;
  number: string;
  numberOfOffices: number;
  hasOneYearRentContract: boolean;
  numberOfVehicles: number;
  numberOfComputers: number;
  signedAtDate: string;
  date: string;
}

export interface CreateAgreementDTO {
  applicationId: number;
  recruitmentDeadline: string;
}

export interface UpdateAgreementStatusDTO {
  status: "Pending" | "Active" | "Superseded" | "Expired" | "Revoked";
}

export interface AgreementFiltersDTO {
  applicationId?: number;
  organizationId?: number;
  status?: string;
  year?: number;
}
