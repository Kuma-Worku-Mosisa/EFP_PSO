// filepath: backend/src/modules/settings/system-settings.service.ts
import prisma from "../../lib/prisma";

const BASE_HOST =
  process.env.CERT_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://pso.efp.gov.et"
    : "http://localhost:5000");

export class SystemSettingsService {
  private static instance: any = null;
  private static isStale: boolean = true;

  static async getConfiguration() {
    if (!this.isStale && this.instance) {
      return this.instance;
    }

    // Use upsert here too, so GET requests never crash even if the DB is freshly wiped
    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: {}, // If found, do nothing, just return it
      create: {
        id: 1,
        governmentName: "Ethiopian Federal Police",
        efpLogoUrl: `${BASE_HOST}/assets/official-logo.png`,
        issuingAuthority: "Private Security Agency Management Directorate",
      },
    });

    this.instance = settings;
    this.isStale = false;
    return this.instance;
  }

  /**
   * FIX: Changed .update() to .upsert() to automatically create row if missing
   */
  static async updateConfiguration(payload: {
    governmentName?: string;
    efpLogoUrl?: string;
    issuingAuthority?: string;
  }) {
    const updated = await prisma.systemSettings.upsert({
      where: { id: 1 },
      // If row 1 exists, dynamically apply the incoming updates
      update: payload,
      // If row 1 is missing, create it using defaults merged with the new updates
      create: {
        id: 1,
        governmentName: payload.governmentName || "Ethiopian Federal Police",
        efpLogoUrl:
          payload.efpLogoUrl || `${BASE_HOST}/assets/official-logo.png`,
        issuingAuthority:
          payload.issuingAuthority ||
          "Private Security Agency Management Directorate",
      },
    });

    // Invalidate memory cache immediately
    this.isStale = true;
    this.instance = updated;

    return this.instance;
  }
}
