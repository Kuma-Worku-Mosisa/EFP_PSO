// filepath: backend/src/modules/location/location.routes.ts
import { Router } from "express";
import {
  getRegions,
  createRegion,
  updateRegion,
  deleteRegion,
  getZonesByRegion,
  createZone,
  updateZone,
  deleteZone,
  getWoredasByZone,
  createWoreda,
  updateWoreda,
  deleteWoreda,
  getKebelesByWoreda,
  createKebele,
  updateKebele,
  deleteKebele,
} from "./location.controller";

const router = Router();

// Region Infrastructure Routes
router.get("/regions", getRegions);
router.post("/regions", createRegion);
router.put("/regions/:id", updateRegion);
router.delete("/regions/:id", deleteRegion);

// Zone Infrastructure Routes
router.get("/regions/:regionId/zones", getZonesByRegion);
router.post("/regions/:regionId/zones", createZone);
router.put("/zones/:zoneId", updateZone);
router.delete("/zones/:zoneId", deleteZone);

// Woreda Infrastructure Routes
router.get("/zones/:zoneId/woredas", getWoredasByZone);
router.post("/zones/:zoneId/woredas", createWoreda);
router.put("/woredas/:woredaId", updateWoreda);
router.delete("/woredas/:woredaId", deleteWoreda);

// Kebele Infrastructure Routes
router.get("/woredas/:woredaId/kebeles", getKebelesByWoreda);
router.post("/woredas/:woredaId/kebeles", createKebele);
router.put("/kebeles/:kebeleId", updateKebele);
router.delete("/kebeles/:kebeleId", deleteKebele);

export default router;
