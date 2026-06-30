import prisma from "../../lib/prisma";

type DashboardRecord = {
  id: number;
  status?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  applicationDate?: Date | null;
  issueDate?: Date | null;
  expiryDate?: Date | null;
};

type DashboardActivityItem = {
  title: string;
  status?: string;
  time: string;
};

export class DashboardService {
  private static normalizeStatus(status: unknown): string {
    return String(status ?? "").trim();
  }

  private static deriveApplicationProgress(status?: string | null): number {
    const normalized = DashboardService.normalizeStatus(status).toLowerCase();
    if (!normalized) return 0;
    if (normalized.includes("approved") || normalized.includes("active"))
      return 100;
    if (normalized.includes("rejected")) return 0;
    if (normalized.includes("correction")) return 40;
    if (normalized.includes("review")) return 60;
    if (normalized.includes("pending")) return 30;
    return 50;
  }

  private static countPendingTasks(
    application: DashboardRecord | null,
    agreement: DashboardRecord | null,
    formalRequest: DashboardRecord | null,
    certificate: DashboardRecord | null,
  ): number {
    let count = 0;

    const appStatus = DashboardService.normalizeStatus(
      application?.status,
    ).toLowerCase();
    if (application && !/(approved|rejected|active)/.test(appStatus)) {
      count += 1;
    }

    const agreementStatus = DashboardService.normalizeStatus(
      agreement?.status,
    ).toLowerCase();
    if (!agreement || !agreementStatus || agreementStatus !== "active") {
      count += 1;
    }

    const requestStatus = DashboardService.normalizeStatus(
      formalRequest?.status,
    ).toLowerCase();
    if (formalRequest && requestStatus === "pending") {
      count += 1;
    }

    const certStatus = DashboardService.normalizeStatus(
      certificate?.status,
    ).toLowerCase();
    if (certificate && certStatus === "expired") {
      count += 1;
    }

    return count;
  }

  private static toUtcIsoString(value: unknown): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  private static buildRecentActivity(
    application: DashboardRecord | null,
    agreement: DashboardRecord | null,
    formalRequest: DashboardRecord | null,
    certificate: DashboardRecord | null,
  ): DashboardActivityItem[] {
    const items: DashboardActivityItem[] = [];

    if (application) {
      const time =
        application.applicationDate ??
        application.updatedAt ??
        application.createdAt;
      const isoTime = DashboardService.toUtcIsoString(time);
      if (isoTime) {
        items.push({
          title: `Application ${DashboardService.normalizeStatus(application.status)}`,
          status: DashboardService.normalizeStatus(application.status),
          time: isoTime,
        });
      }
    }

    if (agreement) {
      const time = agreement.updatedAt ?? agreement.createdAt;
      const isoTime = DashboardService.toUtcIsoString(time);
      if (isoTime) {
        items.push({
          title: `Agreement ${DashboardService.normalizeStatus(agreement.status)}`,
          status: DashboardService.normalizeStatus(agreement.status),
          time: isoTime,
        });
      }
    }

    if (formalRequest) {
      const time = formalRequest.updatedAt ?? formalRequest.createdAt;
      const isoTime = DashboardService.toUtcIsoString(time);
      if (isoTime) {
        items.push({
          title: `Formal request ${DashboardService.normalizeStatus(formalRequest.status)}`,
          status: DashboardService.normalizeStatus(formalRequest.status),
          time: isoTime,
        });
      }
    }

    if (certificate) {
      const time =
        certificate.issueDate ?? certificate.updatedAt ?? certificate.createdAt;
      const isoTime = DashboardService.toUtcIsoString(time);
      if (isoTime) {
        items.push({
          title: `License ${DashboardService.normalizeStatus(certificate.status)}`,
          status: DashboardService.normalizeStatus(certificate.status),
          time: isoTime,
        });
      }
    }

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 4);
  }

  static async getAgencyDashboardSummary(userId: number) {
    const [application, agreement, certificate, formalRequest] =
      await Promise.all([
        prisma.application.findFirst({
          where: { userId },
          orderBy: { applicationDate: "desc" },
          select: {
            id: true,
            status: true,
            applicationDate: true,
            organization: {
              select: {
                id: true,
                status: true,
                nameEnglish: true,
              },
            },
          },
        }),
        prisma.agreement.findFirst({
          where: { application: { userId } },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            recruitmentDeadline: true,
          },
        }),
        prisma.certification.findFirst({
          where: { application: { userId } },
          orderBy: { issueDate: "desc" },
          select: {
            id: true,
            status: true,
            issueDate: true,
            expiryDate: true,
            certificateSerialNumber: true,
          },
        }),
        prisma.formalRequest.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

    return {
      licenseStatus: certificate
        ? DashboardService.normalizeStatus(certificate.status || "Active")
        : "No License",
      expiryDate: certificate?.expiryDate ?? null,
      organizationStatus: application?.organization
        ? DashboardService.normalizeStatus(
            application.organization.status || "Pending",
          )
        : "No Organization",
      organizationName: application?.organization?.nameEnglish ?? "N/A",
      pendingTasks: DashboardService.countPendingTasks(
        application,
        agreement,
        formalRequest,
        certificate,
      ),
      applicationProgress: DashboardService.deriveApplicationProgress(
        application?.status,
      ),
      activity: DashboardService.buildRecentActivity(
        application,
        agreement,
        formalRequest,
        certificate,
      ),
    };
  }

  static async getSystemDashboardSummary() {
    try {
      // Return quick counts for system-wide dashboard plus charts data
      const [addressCount, userCount, newsCount, faqCount] = await Promise.all([
        prisma.address.count(),
        prisma.user.count(),
        prisma.newsArticle.count(),
        prisma.faq.count(),
      ]);

      // Monthly news: last 6 months (including current)
      const now = new Date();
      const months: { key: string; label: string; start: Date }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("en-US", { month: "short" });
        months.push({ key, label, start: d });
      }

      const earliest = months[0].start;

      const recentNews = await prisma.newsArticle.findMany({
        where: { publishedAt: { gte: earliest } },
        select: { publishedAt: true },
      });

      const monthCounts: Record<string, number> = {};
      months.forEach((m) => (monthCounts[m.key] = 0));

      recentNews.forEach((n) => {
        if (!n.publishedAt) return;
        const k = `${n.publishedAt.getFullYear()}-${String(
          n.publishedAt.getMonth() + 1,
        ).padStart(2, "0")}`;
        if (monthCounts[k] !== undefined) monthCounts[k] += 1;
      });

      const monthlyNews = months.map((m) => ({
        month: m.label,
        news: monthCounts[m.key] || 0,
      }));

      // FAQ by category
      const faqs = await prisma.faq.findMany({
        select: { categoryType: true },
      });
      const faqMap: Record<string, number> = {};
      faqs.forEach((f) => {
        const key = (f.categoryType || "General").toString();
        faqMap[key] = (faqMap[key] || 0) + 1;
      });
      const faqByCategory = Object.keys(faqMap).map((k) => ({
        name: k,
        value: faqMap[k],
      }));

      return {
        totalAddresses: addressCount,
        totalUsers: userCount,
        totalNews: newsCount,
        totalFaqs: faqCount,
        monthlyNews,
        faqByCategory,
      };
    } catch (err) {
      console.error("System dashboard error:", err?.message || err);
      // Return safe defaults so the dashboard can still render when DB is unreachable
      return {
        totalAddresses: 0,
        totalUsers: 0,
        totalNews: 0,
        totalFaqs: 0,
        monthlyNews: [],
        faqByCategory: [],
      };
    }
  }
}
