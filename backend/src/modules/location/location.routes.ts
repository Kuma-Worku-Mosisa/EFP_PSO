import { Router } from "express";
import {
  getRegions,
  getZonesByRegion,
  getWoredasByZone,
  getKebelesByWoreda,
} from "./location.controller";

const router = Router();

// Hierarchy routing makes the relationship obvious
router.get("/regions", getRegions);
router.get("/regions/:regionId/zones", getZonesByRegion);
router.get("/zones/:zoneId/woredas", getWoredasByZone);
router.get("/woredas/:woredaId/kebeles", getKebelesByWoreda);

export default router;
  