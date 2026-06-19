// src/modules/organization/address-request.service.ts
import prisma from "../../lib/prisma";
import { NotificationService } from "../notification/notification.service";
import { ServiceError } from "../../utils/errors";
import { Prisma } from "@prisma/client";

export const approveAddressChange = async (
  requestId: number,
  adminId: number,
) => {
  // Keep work inside the transaction small to avoid interactive transaction timeouts.
  // Move notifications outside the transaction so commits finish quickly.
  let txResult: any;
  try {
    txResult = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Fetch the pending request using the correct unique key
        const request = await tx.organizationAddressChangeRequest.findUnique({
          where: { addressRequestId: requestId },
          include: { organization: true },
        });

        if (!request) throw new ServiceError("Request not found", "NOT_FOUND");
        if (request.status !== "PENDING")
          throw new ServiceError("Request already processed", "BAD_REQUEST");

        // 1.a Verify the acting admin has permission to approve
        const admin = await tx.user.findUnique({
          where: { id: adminId },
          include: { user_roles: { include: { roles: true } } },
        });
        if (!admin) throw new ServiceError("Admin user not found", "NOT_FOUND");

        const hasPermission = (admin.user_roles || []).some((ur) => {
          const rn = ur.roles?.role_name?.toString().toLowerCase();
          return rn === "administrator" || rn === "admin" || rn === "manager";
        });
        if (!hasPermission)
          throw new ServiceError(
            "User not authorized to approve address changes",
            "FORBIDDEN",
          );

        const orgId = request.organizationId;
        const currentAddressId = request.organization?.addressId ?? null;

        // 2. Update the actual Address table
        if (currentAddressId) {
          // If organization already has an address, update the existing address record
          await tx.address.update({
            where: { id: currentAddressId },
            data: {
              kebeleId: request.requestedKebeleId,
              houseNumber: request.requestedHouseNumber,
              specialLocation: request.requestedSpecialLocation,
            },
          });
        } else {
          // If organization didn't have an address, create one and link it
          const newAddress = await tx.address.create({
            data: {
              kebeleId: request.requestedKebeleId,
              houseNumber: request.requestedHouseNumber,
              specialLocation: request.requestedSpecialLocation,
            },
          });

          await tx.organization.update({
            where: { id: orgId },
            data: { addressId: newAddress.id },
          });
        }

        // 3. Mark the request as APPROVED
        const updatedRequest = await tx.organizationAddressChangeRequest.update(
          {
            where: { addressRequestId: requestId },
            data: { status: "APPROVED" },
          },
        );

        // 4. (Optional) Create an audit log here

        return {
          updatedRequest,
          orgId,
          orgName: request.organization?.nameEnglish || null,
          orgNameAm: request.organization?.nameAmharic || null,
        };
      },
      { timeout: 20000 },
    );
  } catch (err: any) {
    console.error(
      "approveAddressChange transaction error:",
      err?.message ?? err,
    );
    throw new ServiceError(
      `Transaction API error: ${err?.message ?? String(err)}`,
      "TRANSACTION_ERROR",
    );
  }

  // Send notifications outside transaction so the DB commit isn't delayed.
  try {
    const usersToNotify = await prisma.user.findMany({
      where: {
        status: "active",
        employee: { organizationId: txResult.orgId },
        user_roles: {
          some: {
            roles: {
              role_name: { in: ["admin", "super_admin", "org_hr_manager"] },
            },
          },
        },
      },
      select: { id: true, fullName: true },
    });

    for (const u of usersToNotify) {
      try {
        await NotificationService.sendBilingualAlert(
          u.id,
          "ADDRESS_CHANGE_APPROVED",
          {
            organizationName: txResult.orgName || undefined,
            organizationNameAm: txResult.orgNameAm || undefined,
          },
        );
      } catch (err) {
        console.warn("Failed to notify user after address approval:", err);
      }
    }
  } catch (notifyErr) {
    console.warn("Address approval notification error:", notifyErr);
  }

  return txResult.updatedRequest;
};
