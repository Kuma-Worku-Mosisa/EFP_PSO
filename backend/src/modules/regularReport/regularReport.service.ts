import prisma from "../../lib/prisma";

export class RegularReportService {
  async createReport(input: any) {
    const reportDate = input.reportDate
      ? new Date(input.reportDate)
      : new Date();
    const reportFileUrl = input.reportFileUrl || null;
    const reporterSignatureUrl = input.reporterSignatureUrl || null;

    return prisma.regularPeriodReport.create({
      data: {
        reportTitle: input.reportTitle || "Institution Report",
        reportDate,
        reportingPeriod:
          input.reportingPeriod ||
          input.reportPeriod ||
          input.period ||
          "monthly",
        reportFileUrl: reportFileUrl || "",
        organizationId: Number(input.organizationId),
        userId: input.userId ? Number(input.userId) : null,
        reporterName:
          input.reporterName ||
          [
            input.reporterFirstName,
            input.reporterMiddleName,
            input.reporterLastName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim(),
        reporterTitle: input.reporterTitle || "",
        reporterJobResp:
          input.reporterJobResp ||
          input.reporterJobResponsibility ||
          input.reporterJobResp ||
          "",
        reporterSignatureUrl: reporterSignatureUrl || "",
        efpOfficerName: input.efpOfficerName || null,
        efpOfficerTitle: input.efpOfficerTitle || null,
        efpOfficerJobResp: input.efpOfficerJobResp || null,
        efpOfficerSignatureUrl: input.efpOfficerSignatureUrl || null,
        superiorId: input.superiorId ? Number(input.superiorId) : null,
        superiorName: input.superiorName || null,
        superiorTitle: input.superiorTitle || null,
        superiorSignatureUrl: input.superiorSignatureUrl || null,
        superiorFeedbackText: input.superiorFeedbackText || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateReview(reportId: number, reviewType: string, input: any) {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (reviewType === "officer") {
      updateData.efpOfficerName = input.efpOfficerName ?? null;
      updateData.efpOfficerTitle = input.efpOfficerTitle ?? null;
      updateData.efpOfficerSignatureUrl = input.efpOfficerSignatureUrl ?? null;
      updateData.efpSignDate =
        input.signDate || input.efpSignDate
          ? new Date(input.signDate || input.efpSignDate)
          : new Date();
    } else if (reviewType === "superior") {
      updateData.superiorName = input.superiorName ?? null;
      updateData.superiorTitle = input.superiorTitle ?? null;
      updateData.superiorSignatureUrl = input.superiorSignatureUrl ?? null;
      updateData.superiorFeedbackText =
        input.feedbackText ?? input.superiorFeedbackText ?? null;
      updateData.superiorSignDate =
        input.signDate || input.superiorSignDate
          ? new Date(input.signDate || input.superiorSignDate)
          : new Date();
      if (input.superiorId) {
        updateData.superiorId = Number(input.superiorId);
      }
    }

    return prisma.regularPeriodReport.update({
      where: { id: reportId },
      data: updateData,
    });
  }

  async listReports(organizationId?: number) {
    return prisma.regularPeriodReport.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: { id: true, nameEnglish: true, nameAmharic: true },
        },
        user: { select: { id: true, fullName: true, email: true } },
        superior: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}
