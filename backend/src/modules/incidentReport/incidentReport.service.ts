// filepath: backend/src/modules/incidentReport/incidentReport.service.ts
import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";

export class IncidentReportService {
  async findByFileNumber(fileNumber: string) {
    return prisma.incidentReport.findUnique({
      where: { fileNumber },
    });
  }

  async createReport(
    organizationId: number,
    userId: number | null,
    data: any,
    suspectsData: any[],
  ) {
    return prisma.$transaction(async (tx) => {
      return await tx.incidentReport.create({
        data: {
          fileNumber: data.fileNumber,
          reportDate: new Date(data.reportDate),
          organizationId: organizationId,
          userId: userId, // Binds the authenticated system User account profile
          serviceReceiverName: data.serviceReceiverName,
          crimeType: data.crimeType,
          crimeInCapitalAmount: data.crimeInCapitalAmount
            ? new Prisma.Decimal(data.crimeInCapitalAmount)
            : null,
          incidentStartTimestamp: new Date(data.incidentStartTimestamp),
          crimeCount: data.crimeCount ? parseInt(data.crimeCount) : 1,
          damageDescription: data.damageDescription,
          securityPersonnelCount: data.securityPersonnelCount
            ? parseInt(data.securityPersonnelCount)
            : 0,
          customerPersonnelCount: data.customerPersonnelCount
            ? parseInt(data.customerPersonnelCount)
            : 0,
          otherPartiesCount: data.otherPartiesCount
            ? parseInt(data.otherPartiesCount)
            : 0,
          hasCollusion: !!data.hasCollusion,
          collusionDetails: data.hasCollusion ? data.collusionDetails : null,
          actionStatus: data.actionStatus || "Submitted",
          explanation: data.explanation,
          acceptedLegalResponsibility: !!data.acceptedLegalResponsibility,
          reporterName: data.reporterName,
          reporterTitle: data.reporterTitle,
          reporterJobResp: data.reporterJobResp,
          reporterSignatureUrl: data.reporterSignatureUrl,
          // Nested target configuration cleanly mapping array parameters
          suspects:
            suspectsData && suspectsData.length > 0
              ? {
                  create: suspectsData.map((s: any) => ({
                    suspectName: s.suspectName,
                    relationToAgency: s.relationToAgency,
                    employeeId: s.employeeId ? parseInt(s.employeeId) : null,
                  })),
                }
              : undefined,
        },
        include: {
          suspects: {
            include: {
              employee: {
                select: {
                  id: true,
                  employmentStatus: true,
                  isBlacklisted: true,
                },
              },
            },
          },
          organization: {
            select: { nameEnglish: true, nameAmharic: true },
          },
        },
      });
    });
  }

  async getPaginatedReports(
    filters: { orgId?: number; search?: string },
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (filters.orgId) {
      whereClause.organizationId = filters.orgId;
    }

    if (filters.search) {
      whereClause.OR = [
        { fileNumber: { contains: filters.search } },
        { crimeType: { contains: filters.search } },
        { serviceReceiverName: { contains: filters.search } },
      ];
    }

    const [reports, totalCount] = await prisma.$transaction([
      prisma.incidentReport.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          suspects: {
            include: {
              employee: { select: { id: true, employmentStatus: true } },
            },
          },
          organization: { select: { nameEnglish: true, nameAmharic: true } },
        },
      }),
      prisma.incidentReport.count({ where: whereClause }),
    ]);

    return { reports, totalCount };
  }

  async updateEfpSignOff(id: number, officerData: any) {
    return prisma.incidentReport.update({
      where: { id },
      data: {
        efpOfficerName: officerData.efpOfficerName,
        efpOfficerTitle: officerData.efpOfficerTitle,
        efpOfficerJobResp: officerData.efpOfficerJobResp,
        efpOfficerSignatureUrl: officerData.efpOfficerSignatureUrl,
        efpSignDate: new Date(),
        actionStatus: "Verified by EFP Intake Desk",
      },
    });
  }

  async updateSuperiorDirective(id: number, superiorData: any) {
    return prisma.incidentReport.update({
      where: { id },
      data: {
        superiorName: superiorData.superiorName,
        superiorTitle: superiorData.superiorTitle,
        superiorJobResp: superiorData.superiorJobResp,
        superiorFeedback: superiorData.superiorFeedback,
        superiorSignatureUrl: superiorData.superiorSignatureUrl,
        superiorSignDate: new Date(),
        actionStatus: "Closed / Sent to Criminal Investigation Directorate",
      },
    });
  }
}
