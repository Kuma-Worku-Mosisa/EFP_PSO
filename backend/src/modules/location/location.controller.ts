// filepath: backend/src/modules/location/location.controller.ts
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import prisma from "../../lib/prisma";

// ==========================================
// 1. REGION CRUD
// ==========================================

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });
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

export const createRegion = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return ApiResponse.error(res, "Region name is required", 400);

    const region = await prisma.region.create({ data: { name } });
    return ApiResponse.success(res, "Region created successfully", region);
  } catch (error: any) {
    if (error.code === "P2002")
      return ApiResponse.error(res, "Region name already exists", 400);
    return ApiResponse.error(
      res,
      "Failed to create region",
      500,
      error.message,
    );
  }
};

export const updateRegion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const region = await prisma.region.update({
      where: { id: Number(id) },
      data: { name },
    });
    return ApiResponse.success(res, "Region updated successfully", region);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to update region",
      500,
      error.message,
    );
  }
};

export const deleteRegion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.region.delete({ where: { id: Number(id) } });
    return ApiResponse.success(res, "Region deleted successfully", null);
  } catch (error: any) {
    if (error.code === "P2003") {
      return ApiResponse.error(
        res,
        "Dependency Violation: Remove or migrate all nested Zones first.",
        400,
      );
    }
    return ApiResponse.error(
      res,
      "Failed to delete region",
      500,
      error.message,
    );
  }
};

// ==========================================
// 2. ZONE CRUD
// ==========================================

export const getZonesByRegion = async (req: Request, res: Response) => {
  try {
    const { regionId } = req.params;
    const zones = await prisma.zone.findMany({
      where: { regionId: Number(regionId) },
      orderBy: { name: "asc" },
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

export const createZone = async (req: Request, res: Response) => {
  try {
    const { regionId } = req.params;
    const { name } = req.body;
    if (!name) return ApiResponse.error(res, "Zone name is required", 400);

    const zone = await prisma.zone.create({
      data: { name, regionId: Number(regionId) },
    });
    return ApiResponse.success(res, "Zone created successfully", zone);
  } catch (error: any) {
    return ApiResponse.error(res, "Failed to create zone", 500, error.message);
  }
};

export const updateZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { name } = req.body;

    const zone = await prisma.zone.update({
      where: { id: Number(zoneId) },
      data: { name },
    });
    return ApiResponse.success(res, "Zone updated successfully", zone);
  } catch (error: any) {
    return ApiResponse.error(res, "Failed to update zone", 500, error.message);
  }
};

export const deleteZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    await prisma.zone.delete({ where: { id: Number(zoneId) } });
    return ApiResponse.success(res, "Zone deleted successfully", null);
  } catch (error: any) {
    if (error.code === "P2003") {
      return ApiResponse.error(
        res,
        "Dependency Violation: Remove or migrate all nested Woredas first.",
        400,
      );
    }
    return ApiResponse.error(res, "Failed to delete zone", 500, error.message);
  }
};

// ==========================================
// 3. WOREDA CRUD
// ==========================================

export const getWoredasByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const woredas = await prisma.woreda.findMany({
      where: { zoneId: Number(zoneId) },
      orderBy: { name: "asc" },
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

export const createWoreda = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { name } = req.body;
    if (!name) return ApiResponse.error(res, "Woreda name is required", 400);

    const woreda = await prisma.woreda.create({
      data: { name, zoneId: Number(zoneId) },
    });
    return ApiResponse.success(res, "Woreda created successfully", woreda);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to create woreda",
      500,
      error.message,
    );
  }
};

export const updateWoreda = async (req: Request, res: Response) => {
  try {
    const { woredaId } = req.params;
    const { name } = req.body;

    const woreda = await prisma.woreda.update({
      where: { id: Number(woredaId) },
      data: { name },
    });
    return ApiResponse.success(res, "Woreda updated successfully", woreda);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to update woreda",
      500,
      error.message,
    );
  }
};

export const deleteWoreda = async (req: Request, res: Response) => {
  try {
    const { woredaId } = req.params;
    await prisma.woreda.delete({ where: { id: Number(woredaId) } });
    return ApiResponse.success(res, "Woreda deleted successfully", null);
  } catch (error: any) {
    if (error.code === "P2003") {
      return ApiResponse.error(
        res,
        "Dependency Violation: Remove or migrate all nested Kebeles first.",
        400,
      );
    }
    return ApiResponse.error(
      res,
      "Failed to delete woreda",
      500,
      error.message,
    );
  }
};

// ==========================================
// 4. KEBELE CRUD
// ==========================================

export const getKebelesByWoreda = async (req: Request, res: Response) => {
  try {
    const { woredaId } = req.params;
    const kebeles = await prisma.kebele.findMany({
      where: { woredaId: Number(woredaId) },
      orderBy: { name: "asc" },
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

export const createKebele = async (req: Request, res: Response) => {
  try {
    const { woredaId } = req.params;
    const { name } = req.body;
    if (!name) return ApiResponse.error(res, "Kebele name is required", 400);

    const kebele = await prisma.kebele.create({
      data: { name, woredaId: Number(woredaId) },
    });
    return ApiResponse.success(res, "Kebele created successfully", kebele);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to create kebele",
      500,
      error.message,
    );
  }
};

export const updateKebele = async (req: Request, res: Response) => {
  try {
    const { kebeleId } = req.params;
    const { name } = req.body;

    const kebele = await prisma.kebele.update({
      where: { id: Number(kebeleId) },
      data: { name },
    });
    return ApiResponse.success(res, "Kebele updated successfully", kebele);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to update kebele",
      500,
      error.message,
    );
  }
};

export const deleteKebele = async (req: Request, res: Response) => {
  try {
    const { kebeleId } = req.params;
    await prisma.kebele.delete({ where: { id: Number(kebeleId) } });
    return ApiResponse.success(res, "Kebele deleted successfully", null);
  } catch (error: any) {
    if (error.code === "P2003") {
      return ApiResponse.error(
        res,
        "Dependency Violation: This Kebele is linked to an active target structural Address record.",
        400,
      );
    }
    return ApiResponse.error(
      res,
      "Failed to delete kebele",
      500,
      error.message,
    );
  }
};
