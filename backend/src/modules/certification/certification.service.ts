// filepath: backend/src/modules/certification/certification.service.ts
import prisma from "../../lib/prisma";
import crypto from "crypto";
import { NotificationService } from "../notification/notification.service";

const BASE_HOST =
  process.env.CERT_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://pso.efp.gov.et"
    : "http://localhost:5000");

export class CertificationService {
  /** Normalize SQL @db.Date values to local calendar days without timezone drift. */
  static toCertCalendarDate(value: Date | string) {
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime())) {
      throw new Error("Invalid certificate date.");
    }

    return CertificationService.startOfCalendarDay(
      new Date(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate(),
      ),
    );
  }

  static startOfCalendarDay(date: Date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /** True only after the expiry calendar day has fully passed. */
  static isPastExpiryDay(expiryDate: Date | string) {
    const expiry = CertificationService.toCertCalendarDate(expiryDate);
    const today = CertificationService.startOfCalendarDay(new Date());
    return expiry.getTime() < today.getTime();
  }

  static addOneCalendarYear(value: Date | string) {
    const base = CertificationService.toCertCalendarDate(value);
    return new Date(base.getFullYear() + 1, base.getMonth(), base.getDate());
  }

  private static getDerivedStatus(cert: {
    status?: string | null;
    issueDate?: Date | string | null;
    expiryDate?: Date | string | null;
  }) {
    const status = String(cert.status || "").trim();
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "revoked" || normalizedStatus === "suspended") {
      return status || null;
    }

    if (!cert.expiryDate) {
      return status || "Active";
    }

    try {
      if (CertificationService.isPastExpiryDay(cert.expiryDate)) {
        return "EXPIRED";
      }
    } catch {
      return status || "Active";
    }

    if (normalizedStatus === "expired") {
      return "Active";
    }

    return status || "Active";
  }

  static async syncExpiryStatus(cert: any, db: any = prisma) {
    const derivedStatus = CertificationService.getDerivedStatus(cert);

    if (derivedStatus && derivedStatus !== cert.status) {
      await db.certification.update({
        where: { id: cert.id },
        data: { status: derivedStatus },
      });

      return { ...cert, status: derivedStatus };
    }

    return { ...cert, status: derivedStatus ?? cert.status ?? null };
  }

  private static getOrganizationLogoUrl(organization: any) {
    const logoDoc = (organization?.documents || []).find((doc: any) => {
      const type = String(doc?.documentType || "").toLowerCase();
      return type.includes("organization logo");
    });

    return logoDoc?.fileUrl || null;
  }

  private static getOrganizationDisplayName(organization: any) {
    return (
      organization?.nameEnglish ||
      organization?.nameAmharic ||
      organization?.name ||
      null
    );
  }

  private static normalizeOrganization(organization: any) {
    if (!organization) return organization;

    return {
      ...organization,
      name: CertificationService.getOrganizationDisplayName(organization),
      logoUrl: CertificationService.getOrganizationLogoUrl(organization),
    };
  }

  /**
   * CREATE: Issue a new 1-year certificate
   */
  static async issueCertificate(
    data: {
      applicationId: number;
      organizationId: number;
      level: number;
    },
    db: any = prisma,
  ) {
    const existingCertificate = await db.certification.findFirst({
      where: { applicationId: data.applicationId },
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    const issueDate = CertificationService.toCertCalendarDate(new Date());
    const expiryDate = CertificationService.addOneCalendarYear(issueDate);

    const serial = `EFP-PSO-${issueDate.getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    return await db.certification.create({
      data: {
        applicationId: data.applicationId,
        organizationId: data.organizationId,
        certificateSerialNumber: serial,
        issueDate,
        expiryDate,
        qrCodeValue: `${BASE_HOST}/api/certifications/verify/${serial}`,
        status: "Active",
        level: data.level,
      },
    });
  }

  static async getCurrentOfficial(userId: number) {
    const official = await prisma.official.findUnique({
      where: { userId },
      include: {
        position: true,
        user: { select: { fullName: true } },
      },
    });

    if (!official) {
      throw new Error(
        "The current user is not registered as a Federal Police official.",
      );
    }

    return {
      id: official.id,
      userId: official.userId,
      fullName: official.user?.fullName || null,
      fullNameAm: official.fullNameAm,
      efpPositionId: official.efpPositionId,
      positionEnglish: official.position?.nameEnglish || null,
      positionAmharic: official.position?.nameAmharic || null,
      signatureUrl: official.signatureUrl,
      createdAt: official.createdAt,
      updatedAt: official.updatedAt,
    };
  }

  static async signCertificate(id: number, userId: number) {
    const official = await CertificationService.getCurrentOfficial(userId);
    const certificate = await prisma.certification.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!certificate) {
      throw new Error("Certificate not found");
    }

    await prisma.certification.update({
      where: { id },
      data: {
        signedByOfficialId: official.id,
        signedAt: new Date(),
      },
    });

    // Notify licensing authority users if the signer is an admin/super_admin
    try {
      await NotificationService.notifyLicensingAuthoritiesForSignedCertificate(
        id,
      );
    } catch (err) {
      console.error("Failed to notify licensing authorities after sign:", err);
    }

    return await CertificationService.getFullDetails(id);
  }

  static async getPendingStampCertificates() {
    const certs = await prisma.certification.findMany({
      where: {
        signedByOfficialId: { not: null },
        stampedAt: null,
      },
      include: {
        organization: {
          select: {
            nameEnglish: true,
            nameAmharic: true,
            documents: true,
            address: {
              select: {
                id: true,
                houseNumber: true,
                specialLocation: true,
                kebeleId: true,
                kebele: {
                  select: {
                    id: true,
                    nameEnglish: true,
                    nameAmharic: true,
                    woreda: {
                      select: {
                        id: true,
                        nameEnglish: true,
                        nameAmharic: true,
                        zone: {
                          select: {
                            id: true,
                            nameEnglish: true,
                            nameAmharic: true,
                            region: {
                              select: {
                                id: true,
                                nameEnglish: true,
                                nameAmharic: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        application: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
            type: true,
            manager: {
              select: {
                user: {
                  select: { photoUrl: true, fullName: true },
                },
              },
            },
            operationsHead: {
              select: {
                user: {
                  select: { photoUrl: true, fullName: true },
                },
              },
            },
            adminHead: {
              select: {
                user: {
                  select: { photoUrl: true, fullName: true },
                },
              },
            },
          },
        },
        signedByOfficial: {
          include: {
            position: true,
            user: {
              select: {
                fullName: true,
                user_roles: {
                  include: {
                    roles: { select: { role_name: true } },
                  },
                },
              },
            },
          },
        },
        stampedByUser: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    const synced = await Promise.all(
      certs.map((cert) => CertificationService.syncExpiryStatus(cert)),
    );

    return synced.map((cert) => ({
      ...cert,
      organization: CertificationService.normalizeOrganization(
        cert.organization,
      ),
      applicantPhotoUrl:
        cert.application?.manager?.user?.photoUrl ||
        cert.application?.operationsHead?.user?.photoUrl ||
        cert.application?.adminHead?.user?.photoUrl ||
        null,
      applicantName:
        cert.application?.manager?.user?.fullName ||
        cert.application?.operationsHead?.user?.fullName ||
        cert.application?.adminHead?.user?.fullName ||
        cert.application?.user?.fullName ||
        null,
      signedByOfficial: cert.signedByOfficial
        ? {
            id: cert.signedByOfficial.id,
            fullName: cert.signedByOfficial.user?.fullName || null,
            fullNameAm: cert.signedByOfficial.fullNameAm,
            positionEnglish:
              cert.signedByOfficial.position?.nameEnglish || null,
            positionAmharic:
              cert.signedByOfficial.position?.nameAmharic || null,
            signatureUrl: cert.signedByOfficial.signatureUrl || null,
            stampUrl: cert.signedByOfficial.stampUrl || null,
            signedAt: cert.signedAt || null,
            userRoles:
              cert.signedByOfficial.user?.user_roles?.map(
                (ur) => ur.roles.role_name,
              ) || [],
          }
        : null,
      stampedByUser: cert.stampedByUser
        ? {
            id: cert.stampedByUser.id,
            fullName: cert.stampedByUser.fullName || null,
          }
        : null,
      stampedAt: cert.stampedAt || null,
    }));
  }

  static async getStampedCertificates() {
    const certs = await prisma.certification.findMany({
      where: {
        stampedByUserId: { not: null },
      },
      include: {
        organization: {
          select: {
            nameEnglish: true,
            nameAmharic: true,
            documents: true,
            address: {
              select: {
                id: true,
                houseNumber: true,
                specialLocation: true,
                kebeleId: true,
                kebele: {
                  select: {
                    id: true,
                    nameEnglish: true,
                    nameAmharic: true,
                    woreda: {
                      select: {
                        id: true,
                        nameEnglish: true,
                        nameAmharic: true,
                        zone: {
                          select: {
                            id: true,
                            nameEnglish: true,
                            nameAmharic: true,
                            region: {
                              select: {
                                id: true,
                                nameEnglish: true,
                                nameAmharic: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        application: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
            type: true,
            manager: {
              select: {
                user: {
                  select: { photoUrl: true, fullName: true },
                },
              },
            },
            operationsHead: {
              select: {
                user: {
                  select: { photoUrl: true, fullName: true },
                },
              },
            },
            adminHead: {
              select: {
                user: {
                  select: { photoUrl: true, fullName: true },
                },
              },
            },
          },
        },
        signedByOfficial: {
          include: {
            position: true,
            user: {
              select: {
                fullName: true,
                user_roles: {
                  include: {
                    roles: { select: { role_name: true } },
                  },
                },
              },
            },
          },
        },
        stampedByUser: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    const synced = await Promise.all(
      certs.map((cert) => CertificationService.syncExpiryStatus(cert)),
    );

    return synced.map((cert) => ({
      ...cert,
      organization: CertificationService.normalizeOrganization(
        cert.organization,
      ),
      applicantPhotoUrl:
        cert.application?.manager?.user?.photoUrl ||
        cert.application?.operationsHead?.user?.photoUrl ||
        cert.application?.adminHead?.user?.photoUrl ||
        null,
      applicantName:
        cert.application?.manager?.user?.fullName ||
        cert.application?.operationsHead?.user?.fullName ||
        cert.application?.adminHead?.user?.fullName ||
        cert.application?.user?.fullName ||
        null,
      signedByOfficial: cert.signedByOfficial
        ? {
            id: cert.signedByOfficial.id,
            fullName: cert.signedByOfficial.user?.fullName || null,
            fullNameAm: cert.signedByOfficial.fullNameAm,
            positionEnglish:
              cert.signedByOfficial.position?.nameEnglish || null,
            positionAmharic:
              cert.signedByOfficial.position?.nameAmharic || null,
            signatureUrl: cert.signedByOfficial.signatureUrl || null,
            stampUrl: cert.signedByOfficial.stampUrl || null,
            signedAt: cert.signedAt || null,
            userRoles:
              cert.signedByOfficial.user?.user_roles?.map(
                (ur) => ur.roles.role_name,
              ) || [],
          }
        : null,
      stampedByUser: cert.stampedByUser
        ? {
            id: cert.stampedByUser.id,
            fullName: cert.stampedByUser.fullName || null,
          }
        : null,
      stampedAt: cert.stampedAt || null,
    }));
  }

  static async stampCertificate(
    id: number,
    userId: number,
    stampPath: string | null = null,
  ) {
    const certificate = await prisma.certification.findUnique({
      where: { id },
      select: {
        id: true,
        signedByOfficialId: true,
        stampedAt: true,
      },
    });

    if (!certificate) {
      throw new Error("Certificate not found");
    }

    if (!certificate.signedByOfficialId) {
      throw new Error("Certificate must be signed before stamping.");
    }

    if (certificate.stampedAt) {
      throw new Error("Certificate is already stamped.");
    }

    // Use a transaction to update certification and optionally the official's stampUrl
    await prisma.$transaction(async (tx) => {
      await tx.certification.update({
        where: { id },
        data: {
          stampedByUserId: userId,
          stampedAt: new Date(),
        },
      });

      if (certificate.signedByOfficialId) {
        const official = await tx.official.findUnique({
          where: { id: certificate.signedByOfficialId },
        });

        if (official) {
          const updateData: any = { isStamped: true };
          if (stampPath && !official.stampUrl) {
            updateData.stampUrl = stampPath;
          }

          await tx.official.update({
            where: { id: official.id },
            data: updateData,
          });
        }
      }
    });

    return await CertificationService.getFullDetails(id);
  }

  /**
   * READ: Fetch full certificate details including BOTH logos and Applicant Photo
   */
  static async getFullDetails(id: number) {
    const system = await prisma.systemSettings.findFirst();
    const cert = await prisma.certification.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            nameEnglish: true,
            nameAmharic: true,
            documents: true,
            address: {
              select: {
                id: true,
                houseNumber: true,
                specialLocation: true,
                kebeleId: true,
                kebele: {
                  select: {
                    id: true,
                    nameEnglish: true,
                    nameAmharic: true,
                    woreda: {
                      select: {
                        id: true,
                        nameEnglish: true,
                        nameAmharic: true,
                        zone: {
                          select: {
                            id: true,
                            nameEnglish: true,
                            nameAmharic: true,
                            region: {
                              select: {
                                id: true,
                                nameEnglish: true,
                                nameAmharic: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        application: {
          include: {
            manager: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    photoUrl: true,
                    faydaId: true,
                  },
                },
              },
            },
            operationsHead: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    photoUrl: true,
                    faydaId: true,
                  },
                },
              },
            },
            adminHead: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    photoUrl: true,
                    faydaId: true,
                  },
                },
              },
            },
          },
        },
        signedByOfficial: {
          include: {
            position: true,
            user: {
              select: {
                fullName: true,
                user_roles: {
                  include: {
                    roles: { select: { role_name: true } },
                  },
                },
              },
            },
          },
        },
        stampedByUser: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!cert) throw new Error("Certificate not found");

    const syncedCert = await CertificationService.syncExpiryStatus(cert);

    return {
      ...syncedCert,
      organization: CertificationService.normalizeOrganization(
        syncedCert.organization,
      ),
      applicantPhotoUrl:
        syncedCert.application?.manager?.user?.photoUrl ||
        syncedCert.application?.operationsHead?.user?.photoUrl ||
        syncedCert.application?.adminHead?.user?.photoUrl ||
        null,
      applicantName:
        syncedCert.application?.manager?.user?.fullName ||
        syncedCert.application?.operationsHead?.user?.fullName ||
        syncedCert.application?.adminHead?.user?.fullName ||
        syncedCert.application?.user?.fullName ||
        null,
      efpLogo: system?.efpLogoUrl,
      issuingAuthority: system?.issuingAuthority,
      signedByOfficial: syncedCert.signedByOfficial
        ? {
            id: syncedCert.signedByOfficial.id,
            fullName: syncedCert.signedByOfficial.user?.fullName || null,
            fullNameAm: syncedCert.signedByOfficial.fullNameAm,
            positionEnglish:
              syncedCert.signedByOfficial.position?.nameEnglish || null,
            positionAmharic:
              syncedCert.signedByOfficial.position?.nameAmharic || null,
            signatureUrl: syncedCert.signedByOfficial.signatureUrl || null,
            stampUrl: syncedCert.signedByOfficial.stampUrl || null,
            signedAt: syncedCert.signedAt || null,
            userRoles:
              syncedCert.signedByOfficial.user?.user_roles?.map(
                (ur) => ur.roles.role_name,
              ) || [],
          }
        : null,
      stampedByUser: syncedCert.stampedByUser
        ? {
            id: syncedCert.stampedByUser.id,
            fullName: syncedCert.stampedByUser.fullName || null,
          }
        : null,
      stampedAt: syncedCert.stampedAt || null,
    };
  }

  /**
   * READ: List all certificates for Admin
   */
  static async getAll() {
    return await prisma.certification
      .findMany({
        include: {
          organization: {
            select: {
              nameEnglish: true,
              nameAmharic: true,
              documents: true,
              address: {
                select: {
                  id: true,
                  houseNumber: true,
                  specialLocation: true,
                  kebeleId: true,
                  kebele: {
                    select: {
                      id: true,
                      nameEnglish: true,
                      nameAmharic: true,
                      woreda: {
                        select: {
                          id: true,
                          nameEnglish: true,
                          nameAmharic: true,
                          zone: {
                            select: {
                              id: true,
                              nameEnglish: true,
                              nameAmharic: true,
                              region: {
                                select: {
                                  id: true,
                                  nameEnglish: true,
                                  nameAmharic: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          application: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
              type: true,
              manager: {
                select: {
                  user: {
                    select: { photoUrl: true, fullName: true },
                  },
                },
              },
              operationsHead: {
                select: {
                  user: {
                    select: { photoUrl: true, fullName: true },
                  },
                },
              },
              adminHead: {
                select: {
                  user: {
                    select: { photoUrl: true, fullName: true },
                  },
                },
              },
            },
          },
          signedByOfficial: {
            include: {
              position: true,
              user: {
                select: {
                  fullName: true,
                  user_roles: {
                    include: {
                      roles: { select: { role_name: true } },
                    },
                  },
                },
              },
            },
          },
          stampedByUser: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { issueDate: "desc" },
      })
      .then(async (certs) => {
        const synced = await Promise.all(
          certs.map((cert) => CertificationService.syncExpiryStatus(cert)),
        );

        return synced.map((cert) => ({
          ...cert,
          organization: CertificationService.normalizeOrganization(
            cert.organization,
          ),
          applicantPhotoUrl:
            cert.application?.manager?.user?.photoUrl ||
            cert.application?.operationsHead?.user?.photoUrl ||
            cert.application?.adminHead?.user?.photoUrl ||
            null,
          applicantName:
            cert.application?.manager?.user?.fullName ||
            cert.application?.operationsHead?.user?.fullName ||
            cert.application?.adminHead?.user?.fullName ||
            cert.application?.user?.fullName ||
            null,
          signedByOfficial: cert.signedByOfficial
            ? {
                id: cert.signedByOfficial.id,
                fullName: cert.signedByOfficial.user?.fullName || null,
                fullNameAm: cert.signedByOfficial.fullNameAm,
                positionEnglish:
                  cert.signedByOfficial.position?.nameEnglish || null,
                positionAmharic:
                  cert.signedByOfficial.position?.nameAmharic || null,
                signatureUrl: cert.signedByOfficial.signatureUrl || null,
                stampUrl: cert.signedByOfficial.stampUrl || null,
                signedAt: cert.signedAt || null,
                userRoles:
                  cert.signedByOfficial.user?.user_roles?.map(
                    (ur) => ur.roles.role_name,
                  ) || [],
              }
            : null,
          stampedByUser: cert.stampedByUser
            ? {
                id: cert.stampedByUser.id,
                fullName: cert.stampedByUser.fullName || null,
              }
            : null,
          stampedAt: cert.stampedAt || null,
        }));
      });
  }

  /**
   * READ: List certificates for a specific applicant/user
   */
  static async getByUserId(userId: number) {
    return await prisma.certification
      .findMany({
        where: {
          application: {
            userId,
          },
        },
        include: {
          organization: {
            select: {
              nameEnglish: true,
              nameAmharic: true,
              documents: true,
              address: {
                select: {
                  id: true,
                  houseNumber: true,
                  specialLocation: true,
                  kebeleId: true,
                  kebele: {
                    select: {
                      id: true,
                      nameEnglish: true,
                      nameAmharic: true,
                      woreda: {
                        select: {
                          id: true,
                          nameEnglish: true,
                          nameAmharic: true,
                          zone: {
                            select: {
                              id: true,
                              nameEnglish: true,
                              nameAmharic: true,
                              region: {
                                select: {
                                  id: true,
                                  nameEnglish: true,
                                  nameAmharic: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          application: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
              type: true,
              manager: {
                select: {
                  user: {
                    select: { photoUrl: true, fullName: true },
                  },
                },
              },
              operationsHead: {
                select: {
                  user: {
                    select: { photoUrl: true, fullName: true },
                  },
                },
              },
              adminHead: {
                select: {
                  user: {
                    select: { photoUrl: true, fullName: true },
                  },
                },
              },
            },
          },
          signedByOfficial: {
            include: {
              position: true,
              user: {
                select: {
                  fullName: true,
                  user_roles: {
                    include: {
                      roles: { select: { role_name: true } },
                    },
                  },
                },
              },
            },
          },
          stampedByUser: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { issueDate: "desc" },
      })
      .then(async (certs) => {
        const synced = await Promise.all(
          certs.map((cert) => CertificationService.syncExpiryStatus(cert)),
        );

        return synced.map((cert) => ({
          ...cert,
          organization: CertificationService.normalizeOrganization(
            cert.organization,
          ),
          applicantPhotoUrl:
            cert.application?.manager?.user?.photoUrl ||
            cert.application?.operationsHead?.user?.photoUrl ||
            cert.application?.adminHead?.user?.photoUrl ||
            null,
          applicantName:
            cert.application?.manager?.user?.fullName ||
            cert.application?.operationsHead?.user?.fullName ||
            cert.application?.adminHead?.user?.fullName ||
            cert.application?.user?.fullName ||
            null,
          signedByOfficial: cert.signedByOfficial
            ? {
                id: cert.signedByOfficial.id,
                fullName: cert.signedByOfficial.user?.fullName || null,
                fullNameAm: cert.signedByOfficial.fullNameAm,
                positionEnglish:
                  cert.signedByOfficial.position?.nameEnglish || null,
                positionAmharic:
                  cert.signedByOfficial.position?.nameAmharic || null,
                signatureUrl: cert.signedByOfficial.signatureUrl || null,
                stampUrl: cert.signedByOfficial.stampUrl || null,
                signedAt: cert.signedAt || null,
                userRoles:
                  cert.signedByOfficial.user?.user_roles?.map(
                    (ur) => ur.roles.role_name,
                  ) || [],
              }
            : null,
          stampedByUser: cert.stampedByUser
            ? {
                id: cert.stampedByUser.id,
                fullName: cert.stampedByUser.fullName || null,
              }
            : null,
          stampedAt: cert.stampedAt || null,
        }));
      });
  }

  /**
   * UPDATE: Edit certificate level, organization logo, and applicant photo
   */
  static async update(
    id: number,
    data: {
      level?: number;
      status?: string;
      issueDate?: Date;
      expiryDate?: Date;
      logoUrl?: string;
      applicantPhotoUrl?: string;
    },
  ) {
    const cert = await prisma.certification.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        application: {
          select: {
            manager: { select: { userId: true } },
            operationsHead: { select: { userId: true } },
            adminHead: { select: { userId: true } },
          },
        },
      },
    });

    if (!cert) throw new Error("Certificate not found");

    const applicantUserId =
      cert.application?.manager?.userId ||
      cert.application?.operationsHead?.userId ||
      cert.application?.adminHead?.userId ||
      null;

    await prisma.$transaction(async (tx) => {
      const certificationUpdateData: Record<string, any> = {
        ...(data.status ? { status: data.status } : {}),
        ...(data.issueDate ? { issueDate: data.issueDate } : {}),
        ...(data.expiryDate ? { expiryDate: data.expiryDate } : {}),
      };

      if (data.level !== undefined) {
        certificationUpdateData.level = Number(data.level);
      }

      await tx.certification.update({
        where: { id },
        data: certificationUpdateData as any,
      });

      if (data.logoUrl) {
        const existingLogo = await tx.organizationDocument.findFirst({
          where: {
            organizationId: cert.organizationId as number,
            documentType: "Organization Logo",
          },
        });

        if (existingLogo) {
          await tx.organizationDocument.update({
            where: { id: existingLogo.id },
            data: {
              fileUrl: data.logoUrl,
              isVerified: false,
              verifiedAt: null,
            },
          });
        } else {
          await tx.organizationDocument.create({
            data: {
              organizationId: cert.organizationId as number,
              documentType: "Organization Logo",
              fileUrl: data.logoUrl,
              isVerified: false,
            },
          });
        }
      }

      if (data.applicantPhotoUrl && applicantUserId) {
        await tx.user.update({
          where: { id: applicantUserId },
          data: { photoUrl: data.applicantPhotoUrl },
        });
      }
    });

    return await this.getFullDetails(id);
  }

  /**
   * PUBLIC: Verify certificate by serial string (used by QR scanner)
   */
  static async verifyBySerial(serial: string) {
    // Expect exact certificateSerialNumber (e.g. EFP-PSO-2026-860F68)
    const cert = await prisma.certification.findUnique({
      where: { certificateSerialNumber: serial },
      include: {
        organization: {
          select: {
            nameEnglish: true,
            nameAmharic: true,
            documents: true,
          },
        },
      },
    });

    if (!cert) return null;

    const syncedCert = await CertificationService.syncExpiryStatus(cert);

    return {
      id: syncedCert.id,
      certificateSerialNumber: syncedCert.certificateSerialNumber,
      level: syncedCert.level,
      issueDate: syncedCert.issueDate,
      expiryDate: syncedCert.expiryDate,
      status: syncedCert.status,
      qrCodeValue: syncedCert.qrCodeValue,
      organization: {
        name: CertificationService.getOrganizationDisplayName(
          syncedCert.organization,
        ),
        nameEnglish: syncedCert.organization?.nameEnglish || null,
        nameAmharic: syncedCert.organization?.nameAmharic || null,
        logoUrl: CertificationService.getOrganizationLogoUrl(
          syncedCert.organization,
        ),
      },
    };
  }

  /**
   * Return the applicant's user id for the given certificate (manager/operationsHead/adminHead)
   */
  static async getApplicantUserId(id: number) {
    const cert = await prisma.certification.findUnique({
      where: { id },
      select: {
        application: {
          select: {
            userId: true,
            manager: { select: { userId: true } },
            operationsHead: { select: { userId: true } },
            adminHead: { select: { userId: true } },
          },
        },
      },
    });

    if (!cert) return null;

    return (
      cert.application?.userId ||
      cert.application?.manager?.userId ||
      cert.application?.operationsHead?.userId ||
      cert.application?.adminHead?.userId ||
      null
    );
  }

  /**
   * DELETE: Revoke a certificate
   */
  static async revoke(id: number) {
    return await prisma.certification.update({
      where: { id },
      data: { status: "Revoked" },
    });
  }
}
