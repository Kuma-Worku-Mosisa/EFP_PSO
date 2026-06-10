import prisma from "../../lib/prisma";

export class EfpPositionService {
  static async getAll() {
    return await prisma.federalPolicePosition.findMany({
      include: {
        _count: { select: { officials: true } },
      },
      orderBy: { id: "asc" },
    });
  }

  static async getById(id: number) {
    return await prisma.federalPolicePosition.findUnique({
      where: { id },
      include: {
        _count: { select: { officials: true } },
      },
    });
  }

  static async createPosition(data: any) {
    return await prisma.federalPolicePosition.create({
      data: {
        nameEnglish: data.nameEnglish,
        nameAmharic: data.nameAmharic,
      },
    });
  }

  static async updatePosition(id: number, data: any) {
    return await prisma.federalPolicePosition.update({
      where: { id },
      data: {
        nameEnglish: data.nameEnglish,
        nameAmharic: data.nameAmharic,
      },
    });
  }

  static async deletePosition(id: number) {
    return await prisma.federalPolicePosition.delete({
      where: { id },
    });
  }
}
