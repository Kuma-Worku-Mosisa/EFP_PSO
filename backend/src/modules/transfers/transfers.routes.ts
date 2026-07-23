import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { TransfersController } from "./transfers.controller";

const router = Router();
const controller = new TransfersController();

/**
 * @route   GET /api/transfers/employee-lookup
 * @desc    Lookup an existing employee by Fayda ID or email
 * @access  Protected (HR Manager / Admin)
 */
router.get(
  "/employee-lookup",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  controller.lookupEmployee,
);

/**
 * @route   GET /api/transfers/incoming-pending
 * @desc    Fetch pending inbound transfer requests for the current organization
 * @access  Protected (Target Agency B Official / Federal Oversight)
 */
router.get(
  "/incoming-pending",
  authenticate,
  authorize(["org_hr_manager", "admin", "super_admin"]),
  controller.getIncomingPendingRequests,
);

router.get(
  "/history",
  authenticate,
  authorize(["org_hr_manager", "admin", "super_admin"]),
  controller.getTransferHistory,
);

/**
 * @route   POST /api/transfers
 * @desc    Initiate a cross-agency personnel transfer request (Agency A)
 * @access  Protected (HR Manager / Admin)
 */
router.post(
  "/",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  controller.initiate,
);

/**
 * @route   PATCH /api/transfers/:id/decision
 * @desc    Handle incoming transfer workflow transitions (PRE_APPROVE, FINALIZE_APPROVE, REJECT)
 * @access  Protected (Target Agency B Official / Federal Oversight)
 */
router.patch(
  "/:id/decision",
  authenticate,
  authorize(["org_hr_manager", "admin", "super_admin"]),
  controller.handleDecision,
);

export default router;
