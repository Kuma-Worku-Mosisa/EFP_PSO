// filepath: backend/src/modules/position/position.service.ts
import prisma from "../../lib/prisma";
export class PositionService {
  /**
   * 1. Create a Position with optional integrated Requirements
   * Uses Prisma's nested writes to ensure transactional integrity.
   */
  static async createPosition(data: any) {
    return await prisma.position.create({
      data: {
        name: data.name,
        requirements: data.requirements
          ? {
              create: {
                minimumExperienceYears:
                  data.requirements.minimumExperienceYears,
                requiredEducationLevel:
                  data.requirements.requiredEducationLevel,
                requiredExperienceField:
                  data.requirements.requiredExperienceField,
              },
            }
          : undefined,
      },
      include: {
        requirements: true,
      },
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
   * 3. Update an existing Position profile and its Requirements matrix
   * Uses an upsert block so that if a position didn't originally have requirements,
   * they are seamlessly created without throwing record-not-found errors.
   */
  static async updatePosition(id: number, data: any) {
    return await prisma.position.update({
      where: { id },
      data: {
        name: data.name,
        requirements: data.requirements
          ? {
              upsert: {
                create: {
                  minimumExperienceYears:
                    data.requirements.minimumExperienceYears,
                  requiredEducationLevel:
                    data.requirements.requiredEducationLevel,
                  requiredExperienceField:
                    data.requirements.requiredExperienceField,
                },
                update: {
                  minimumExperienceYears:
                    data.requirements.minimumExperienceYears,
                  requiredEducationLevel:
                    data.requirements.requiredEducationLevel,
                  requiredExperienceField:
                    data.requirements.requiredExperienceField,
                },
              },
            }
          : undefined,
      },
      include: {
        requirements: true,
      },
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
    return await prisma.employeePosition.create({
      data: {
        employeeId,
        positionId,
      },
    });
  }
}
