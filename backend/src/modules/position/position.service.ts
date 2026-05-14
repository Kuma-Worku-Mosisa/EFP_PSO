// filepath: backend/src/modules/position/position.service.ts
import prisma from "../../lib/prisma";

export class PositionService {
  // 1. Create Position with Optional Requirements
  static async createPosition(data: any) {
    return await prisma.position.create({
      data: {
        name: data.name,
        // Nested write: Creates the requirement in the same transaction
        requirements: data.requirements
          ? {
              create: data.requirements,
            }
          : undefined,
      },
      include: {
        requirements: true, // Return the created requirements in the response
      },
    });
  }

  // 2. Get all Positions
  static async getAllPositions() {
    return await prisma.position.findMany({
      include: {
        requirements: true,
        _count: {
          select: { employees: true }, // Professional touch: return how many employees hold this position
        },
      },
    });
  }

  // 3. Assign an Employee to a Position (Many-to-Many)
  static async assignEmployee(employeeId: number, positionId: number) {
    return await prisma.employeePosition.create({
      data: {
        employeeId,
        positionId,
      },
    });
  }
}
