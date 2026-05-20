// filepath: backend/src/modules/certification/certification.service.ts
import prisma from "../../lib/prisma";
import crypto from "crypto";

export class CertificationService {
  /**
   * CREATE: Issue a new 1-year certificate
   */
  static async issueCertificate(data: {
    applicationId: number;
    organizationId: number;
    level: string;
  }) {
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(issueDate.getFullYear() + 1);

    const serial = `EFP-PSO-${issueDate.getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    return await prisma.certification.create({
      data: {
        applicationId: data.applicationId,
        organizationId: data.organizationId,
        certificateSerialNumber: serial,
        issueDate,
        expiryDate,
        qrCodeValue: `https://pso.efp.gov.et/verify/${serial}`,
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
            name: true,
            logoUrl: true,
            address: {
              select: {
                id: true,
                houseNumber: true,
                specialLocation: true,
                kebeleId: true,
                kebele: {
                  select: {
                    id: true,
                    name: true,
                    woreda: {
                      select: {
                        id: true,
                        name: true,
                        zone: {
                          select: {
                            id: true,
                            name: true,
                            region: {
                              select: {
                                id: true,
                                name: true,
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

    return {
      ...cert,
      applicantPhotoUrl:
        cert.application?.manager?.user?.photoUrl ||
        cert.application?.operationsHead?.user?.photoUrl ||
        cert.application?.adminHead?.user?.photoUrl ||
        null,
      applicantName:
        cert.application?.manager?.user?.fullName ||
        cert.application?.operationsHead?.user?.fullName ||
        cert.application?.adminHead?.user?.fullName ||
        null,
      efpLogo: system?.efpLogoUrl,
      issuingAuthority: system?.issuingAuthority,
    };
  }

  /**
   * READ: List all certificates for Admin
   */
  static async getAll() {
    return await prisma.certification.findMany({
      include: {
        organization: {
          select: {
            name: true,
            logoUrl: true,
            address: {
              select: {
                id: true,
                houseNumber: true,
                specialLocation: true,
                kebeleId: true,
                kebele: {
                  select: {
                    id: true,
                    name: true,
                    woreda: {
                      select: {
                        id: true,
                        name: true,
                        zone: {
                          select: {
                            id: true,
                            name: true,
                            region: {
                              select: {
                                id: true,
                                name: true,
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
                  select: { photoUrl: true },
                },
              },
            },
          },
        },
      },
      orderBy: { issueDate: "desc" },
    });
  }

  /**
   * READ: List certificates for a specific applicant/user
   */
  static async getByUserId(userId: number) {
    return await prisma.certification.findMany({
      where: {
        application: {
          userId,
        },
      },
      include: {
        organization: {
          select: {
            name: true,
            logoUrl: true,
            address: {
              select: {
                id: true,
                houseNumber: true,
                specialLocation: true,
                kebeleId: true,
                kebele: {
                  select: {
                    id: true,
                    name: true,
                    woreda: {
                      select: {
                        id: true,
                        name: true,
                        zone: {
                          select: {
                            id: true,
                            name: true,
                            region: {
                              select: {
                                id: true,
                                name: true,
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
                  select: { photoUrl: true },
                },
              },
            },
          },
        },
      },
      orderBy: { issueDate: "desc" },
    });
  }

  /**
   * UPDATE: Edit certificate level, organization logo, and applicant photo
   */
  static async update(
    id: number,
    data: {
      level?: string;
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
      await tx.certification.update({
        where: { id },
        data: {
          ...(data.level ? { level: data.level } : {}),
        },
      });

      if (data.logoUrl) {
        await tx.organization.update({
          where: { id: cert.organizationId as number },
          data: { logoUrl: data.logoUrl },
        });
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
          select: { name: true, logoUrl: true },
        },
      },
    });

    if (!cert) return null;

    return {
      id: cert.id,
      certificateSerialNumber: cert.certificateSerialNumber,
      level: cert.level,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      status: cert.status,
      qrCodeValue: cert.qrCodeValue,
      organization: {
        name: cert.organization?.name || null,
        logoUrl: cert.organization?.logoUrl || null,
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
