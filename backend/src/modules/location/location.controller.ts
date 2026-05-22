// filepath: backend/src/modules/location/location.controller.ts
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import prisma from "../../lib/prisma";

// Helper to accept either new bilingual fields or legacy `name` and normalize them
const normalizeName = (v: any) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (s.length === 0) return null;
  return typeof s.normalize === "function" ? s.normalize("NFC") : s;
};

const extractNames = (body: any) => {
  const rawEnglish = body.nameEnglish ?? body.name ?? null;
  const rawAmharic = body.nameAmharic ?? body.name ?? null;
  return {
    nameEnglish: normalizeName(rawEnglish),
    nameAmharic: normalizeName(rawAmharic),
  };
};

type RegionConflict = {
  id: number;
  nameEnglish: string | null;
  nameAmharic: string | null;
};

const findRegionConflict = async (
  nameEnglish: string | null,
  nameAmharic: string | null,
  excludeId?: number,
) => {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      nameEnglish: true,
      nameAmharic: true,
    },
  });

  const isSameRegion = (region: RegionConflict) =>
    excludeId !== undefined && region.id === excludeId;

  if (nameEnglish) {
    const englishConflict = regions.find(
      (region) => !isSameRegion(region) && region.nameEnglish === nameEnglish,
    );
    if (englishConflict) {
      return { field: "nameEnglish" as const, row: englishConflict };
    }
  }

  if (nameAmharic) {
    const amharicConflict = regions.find(
      (region) => !isSameRegion(region) && region.nameAmharic === nameAmharic,
    );
    if (amharicConflict) {
      return { field: "nameAmharic" as const, row: amharicConflict };
    }
  }

  return null;
};

// ==========================================
// 1. REGION CRUD
// ==========================================

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { nameEnglish: "asc" },
    });
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    if (!nameEnglish && !nameAmharic)
      return ApiResponse.error(res, "Region name is required", 400);

    // Pre-check with exact SQL comparisons so Amharic uses binary equality.
    const conflict = await findRegionConflict(nameEnglish, nameAmharic);
    if (conflict) {
      return ApiResponse.error(
        res,
        `Region ${conflict.field} already exists (id=${conflict.row.id}).`,
        400,
      );
    }

    const region = await prisma.region.create({
      data: {
        nameEnglish: nameEnglish || undefined,
        nameAmharic: nameAmharic || undefined,
      },
    });
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);

    const data: any = {};
    if (nameEnglish !== null) data.nameEnglish = nameEnglish;
    if (nameAmharic !== null) data.nameAmharic = nameAmharic;

    // Check for conflicts excluding the current region id using exact SQL comparisons.
    const conflict = await findRegionConflict(
      nameEnglish,
      nameAmharic,
      Number(id),
    );
    if (conflict) {
      return ApiResponse.error(
        res,
        `Region ${conflict.field} already exists (id=${conflict.row.id}).`,
        400,
      );
    }

    const region = await prisma.region.update({
      where: { id: Number(id) },
      data,
    });
    return ApiResponse.success(res, "Region updated successfully", region);
  } catch (error: any) {
    if (error.code === "P2002")
      return ApiResponse.error(res, "Region name already exists", 400);
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

    const nestedZoneCount = await prisma.zone.count({
      where: { regionId: Number(id) },
    });
    if (nestedZoneCount > 0) {
      return ApiResponse.error(
        res,
        "Cannot delete region while it still has nested zones. Remove or migrate the zones first.",
        400,
      );
    }

    await prisma.region.delete({ where: { id: Number(id) } });
    return ApiResponse.success(res, "Region deleted successfully", null);
  } catch (error: any) {
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
      orderBy: { nameEnglish: "asc" },
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    if (!nameEnglish && !nameAmharic)
      return ApiResponse.error(res, "Zone name is required", 400);

    const zone = await prisma.zone.create({
      data: {
        nameEnglish: nameEnglish || undefined,
        nameAmharic: nameAmharic || undefined,
        regionId: Number(regionId),
      },
    });
    return ApiResponse.success(res, "Zone created successfully", zone);
  } catch (error: any) {
    return ApiResponse.error(res, "Failed to create zone", 500, error.message);
  }
};

export const updateZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    const data: any = {};
    if (nameEnglish !== null) data.nameEnglish = nameEnglish;
    if (nameAmharic !== null) data.nameAmharic = nameAmharic;

    const zone = await prisma.zone.update({
      where: { id: Number(zoneId) },
      data,
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
      orderBy: { nameEnglish: "asc" },
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    if (!nameEnglish && !nameAmharic)
      return ApiResponse.error(res, "Woreda name is required", 400);

    const woreda = await prisma.woreda.create({
      data: {
        nameEnglish: nameEnglish || undefined,
        nameAmharic: nameAmharic || undefined,
        zoneId: Number(zoneId),
      },
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    const data: any = {};
    if (nameEnglish !== null) data.nameEnglish = nameEnglish;
    if (nameAmharic !== null) data.nameAmharic = nameAmharic;

    const woreda = await prisma.woreda.update({
      where: { id: Number(woredaId) },
      data,
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
      orderBy: { nameEnglish: "asc" },
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    if (!nameEnglish && !nameAmharic)
      return ApiResponse.error(res, "Kebele name is required", 400);

    const kebele = await prisma.kebele.create({
      data: {
        nameEnglish: nameEnglish || undefined,
        nameAmharic: nameAmharic || undefined,
        woredaId: Number(woredaId),
      },
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
    const { nameEnglish, nameAmharic } = extractNames(req.body);
    const data: any = {};
    if (nameEnglish !== null) data.nameEnglish = nameEnglish;
    if (nameAmharic !== null) data.nameAmharic = nameAmharic;

    const kebele = await prisma.kebele.update({
      where: { id: Number(kebeleId) },
      data,
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
