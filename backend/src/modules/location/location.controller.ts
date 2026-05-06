import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import prisma from "../../lib/prisma"; // Import your new Prisma singleton

// 1. Get All Regions
export const getRegions = async (req: Request, res: Response) => {
  try {
    // Prisma replaces the raw SQL string
    const regions = await prisma.region.findMany();

    return ApiResponse.success(res, "Regions retrieved successfully", regions);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to retrieve regions",
      500,
      error.message,
    );
  }
};

// 2. Get Zones by Region ID
export const getZonesByRegion = async (req: Request, res: Response) => {
  try {
    const { regionId } = req.params;

    const zones = await prisma.zone.findMany({
      where: {
        regionId: Number(regionId), // Ensure it's a number for Prisma
      },
    });

    return ApiResponse.success(res, "Zones retrieved successfully", zones);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to retrieve zones",
      500,
      error.message,
    );
  }
};

// 3. Get Woredas by Zone ID
export const getWoredasByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;

    const woredas = await prisma.woreda.findMany({
      where: {
        zoneId: Number(zoneId),
      },
    });

    return ApiResponse.success(res, "Woredas retrieved successfully", woredas);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to retrieve woredas",
      500,
      error.message,
    );
  }
};

// 4. Get Kebeles by Woreda ID
export const getKebelesByWoreda = async (req: Request, res: Response) => {
  try {
    const { woredaId } = req.params;

    const kebeles = await prisma.kebele.findMany({
      where: {
        woredaId: Number(woredaId),
      },
    });

    return ApiResponse.success(res, "Kebeles retrieved successfully", kebeles);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to retrieve kebeles",
      500,
      error.message,
    );
  }
};
