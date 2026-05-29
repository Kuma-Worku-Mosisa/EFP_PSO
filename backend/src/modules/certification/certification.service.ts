// filepath: backend/src/modules/certification/certification.service.ts
import prisma from "../../lib/prisma";
import crypto from "crypto";

const BASE_HOST =
  process.env.CERT_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://pso.efp.gov.et"
    : "http://localhost:5000");

export class CertificationService {
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

    const expiryDate = new Date(cert.expiryDate || "");
    if (Number.isNaN(expiryDate.getTime())) {
      return status || "Active";
    }

    const expiryEndOfDay = new Date(expiryDate);
    expiryEndOfDay.setHours(23, 59, 59, 999);

    if (new Date() > expiryEndOfDay) {
      return "EXPIRED";
    }

    if (normalizedStatus === "expired") {
      return "Active";
    }

    return status || "Active";
  }

  private static async syncExpiryStatus(cert: any, db: any = prisma) {
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

    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(issueDate.getFullYear() + 1);

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
