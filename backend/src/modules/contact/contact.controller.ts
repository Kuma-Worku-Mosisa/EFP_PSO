import { Request, Response } from "express";
import { ContactService } from "./contact.service";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import { sendSystemEmail } from "../../utils/emailService";

export const submitContactHandler = async (req: Request, res: Response) => {
  try {
    const {
      senderName,
      senderEmail,
      subject,
      message,
      department,
      departmentHeadId: rawDepartmentHeadId,
      departmentHeadRole,
    } = req.body;

    const cleanedSenderName = String(senderName || "").trim();
    const cleanedSenderEmail = String(senderEmail || "").trim();
    const cleanedSubject = String(subject || "").trim();
    const cleanedMessage = String(message || "").trim();
    const cleanedDepartment =
      String(department || "General Inquiry").trim() || "General Inquiry";
    const cleanedDepartmentHeadRole =
      typeof departmentHeadRole === "string"
        ? departmentHeadRole.trim().toLowerCase()
        : "";

    const parsedDepartmentHeadId =
      typeof rawDepartmentHeadId === "number" &&
      Number.isFinite(rawDepartmentHeadId)
        ? rawDepartmentHeadId
        : typeof rawDepartmentHeadId === "string" &&
            rawDepartmentHeadId.trim().length > 0
          ? Number(rawDepartmentHeadId)
          : undefined;

    if (
      !cleanedSenderName ||
      !cleanedSenderEmail ||
      !cleanedSubject ||
      !cleanedMessage
    ) {
      return ApiResponse.error(res, "All fields are required", 400);
    }

    let departmentHeadId = parsedDepartmentHeadId;

    if (!departmentHeadId) {
      if (cleanedDepartmentHeadRole) {
        const matchedHead = await prisma.user.findFirst({
          where: {
            user_roles: {
              some: {
                roles: {
                  role_name: cleanedDepartmentHeadRole,
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        if (!matchedHead) {
          return ApiResponse.error(
            res,
            `No contact user found for role ${cleanedDepartmentHeadRole}`,
            404,
          );
        }

        departmentHeadId = matchedHead.id;
      } else {
        const defaultHead = await prisma.user.findFirst({
          where: {
            user_roles: {
              some: {
                roles: {
                  role_name: {
                    in: ["system_admin", "super_admin", "admin"],
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        if (!defaultHead) {
          return ApiResponse.error(
            res,
            "Unable to find a department head for incoming messages",
            500,
          );
        }

        departmentHeadId = defaultHead.id;
      }
    }

    const newContact = await ContactService.createMessage({
      senderName: cleanedSenderName,
      senderEmail: cleanedSenderEmail,
      subject: cleanedSubject,
      message: cleanedMessage,
      department: cleanedDepartment,
      departmentHeadId,
    });

    // Send an email notification to the resolved department head (best-effort)
    try {
      const head = await prisma.user.findUnique({
        where: { id: departmentHeadId },
        select: { email: true, fullName: true },
      });

      if (head && head.email) {
        const emailSubject = `[Contact] ${cleanedSubject}`;
        const body = `You have received a new message via the public contact form.

Department: ${cleanedDepartment}
From: ${cleanedSenderName} <${cleanedSenderEmail}>

Message:
${cleanedMessage}
`;

        // Fire-and-forget but await to log errors inside utility
        // Pass the sender's email as replyTo so department head can reply directly
        await sendSystemEmail(
          head.email,
          emailSubject,
          body,
          cleanedSenderEmail,
        );
      } else {
        console.warn(
          `[Contact] No email for department head id=${departmentHeadId}`,
        );
      }
    } catch (notifyErr) {
      console.error("[Contact] Failed to notify department head:", notifyErr);
      // continue without failing the API response
    }

    return ApiResponse.success(res, "Message sent successfully", newContact);
  } catch (error: any) {
    if (error?.code === "NOT_FOUND") {
      return ApiResponse.error(res, error.message, 404);
    }

    return ApiResponse.error(
      res,
      "Failed to submit message",
      500,
      error?.message ?? String(error),
    );
  }
};

export const getRoleInfoHandler = async (req: Request, res: Response) => {
  try {
    const rawRole = String(req.query.role || "").trim();
    const role = rawRole.toLowerCase();

    if (!role) {
      return ApiResponse.error(res, "role query parameter is required", 400);
    }

    // Try to find an active user with the given role (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        user_roles: {
          some: {
            roles: {
              role_name: role,
            },
          },
        },
        status: {
          in: ["ACTIVE", "Active", "active"],
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return ApiResponse.error(
        res,
        `No active user found for role ${role}`,
        404,
      );
    }

    return ApiResponse.success(res, "Role contact found", {
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      status: user.status,
    });
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to fetch role contact",
      500,
      error?.message ?? String(error),
    );
  }
};

export const getMyMessagesHandler = async (req: Request, res: Response) => {
  try {
    // Assuming you have an auth middleware that attaches the logged-in user to req.user
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return ApiResponse.error(res, "Unauthorized request", 401);
    }

    const messages = await ContactService.getMessagesForHead(
      Number(currentUserId),
    );

    return ApiResponse.success(
      res,
      "Messages retrieved successfully",
      messages,
    );
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to retrieve messages",
      500,
      error?.message ?? String(error),
    );
  }
};
