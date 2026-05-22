// filepath: backend/src/modules/position/position.service.ts
import prisma from "../../lib/prisma";
export class PositionService {
  static normalizeRequirements(data: any) {
    if (Array.isArray(data.requirements)) {
      return data.requirements;
    }

    if (data.requirements) {
      return [data.requirements];
    }

    return [];
  }

  /**
   * 1. Create a Position with optional integrated Requirements
   * Uses Prisma's nested writes to ensure transactional integrity.
   */
  static async createPosition(data: any) {
    const requirements = PositionService.normalizeRequirements(data);

    return await prisma.$transaction(async (tx) => {
      const position = await tx.position.create({
        data: {
          name: data.name,
        },
      });

      if (requirements.length > 0) {
        await tx.positionRequirement.createMany({
          data: requirements.map((requirement: any, index: number) => ({
            positionId: position.id,
            level: requirement.level ?? index + 1,
            minimumExperienceYears: requirement.minimumExperienceYears,
            requiredEducationLevel: requirement.requiredEducationLevel,
            requiredWorkExperienceYears:
              requirement.requiredWorkExperienceYears,
          })),
        });
      }

      return await tx.position.findUnique({
        where: { id: position.id },
        include: {
          requirements: true,
        },
      });
    });
  }

  /**
   * 2. Get all Positions with their requirements and active staff headcounts
   */
  static async getAllPositions() {
    return await prisma.position.findMany({
      include: {
        requirements: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  /**
   * 2b. Get a single Position with its ordered requirements
   * Used by the application form to populate position-specific education levels.
   */
  static async getPositionById(id: number) {
    return await prisma.position.findUnique({
      where: { id },
      include: {
        requirements: {
          orderBy: {
            level: "asc",
          },
        },
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  /**
   * 3. Update an existing Position profile and its Requirements matrix
   * Replaces the current criteria rows so the UI can manage multiple entries cleanly.
   */
  static async updatePosition(id: number, data: any) {
    const requirements = PositionService.normalizeRequirements(data);

    return await prisma.$transaction(async (tx) => {
      const position = await tx.position.update({
        where: { id },
        data: {
          name: data.name,
        },
      });

      await tx.positionRequirement.deleteMany({
        where: { positionId: position.id },
      });

      if (requirements.length > 0) {
        await tx.positionRequirement.createMany({
          data: requirements.map((requirement: any, index: number) => ({
            positionId: position.id,
            level: requirement.level ?? index + 1,
            minimumExperienceYears: requirement.minimumExperienceYears,
            requiredEducationLevel: requirement.requiredEducationLevel,
            requiredWorkExperienceYears:
              requirement.requiredWorkExperienceYears,
          })),
        });
      }

      return await tx.position.findUnique({
        where: { id: position.id },
        include: {
          requirements: true,
        },
      });
    });
  }

  /**
   * 4. Permanently delete an enterprise position
   * Thanks to your onDelete: Cascade configuration in Prisma, executing this
   * automatically wipes out the related child entry in position_requirements.
   */
  static async deletePosition(id: number) {
    return await prisma.position.delete({
      where: { id },
    });
  }

  /**
   * 5. Assign an Employee to a Position (Handles Many-to-Many Bridge Table)
   */
  static async assignEmployee(employeeId: number, positionId: number) {
    return await prisma.employee.update({
      where: { id: employeeId },
      data: {
        positionId,
      },
      include: {
        position: true,
      },
    });
  }
}
