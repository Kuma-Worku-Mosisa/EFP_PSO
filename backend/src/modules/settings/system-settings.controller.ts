// filepath: backend/src/modules/settings/system-settings.controller.ts
import { Request, Response } from "express";
import { SystemSettingsService } from "./system-settings.service";
import {
  moveDocumentFile,
  getDocumentUrl,
} from "../../utils/documentOrganizer";

export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await SystemSettingsService.getConfiguration();
    // Ensure uploaded file paths are returned as absolute URLs so the frontend can load them
    const out = { ...config } as any;
    if (
      out.efpLogoUrl &&
      (out.efpLogoUrl.startsWith("/uploads") ||
        out.efpLogoUrl.startsWith("uploads/"))
    ) {
      const prefix = `${req.protocol}://${req.get("host")}`;
      out.efpLogoUrl = out.efpLogoUrl.startsWith("/")
        ? `${prefix}${out.efpLogoUrl}`
        : `${prefix}/${out.efpLogoUrl}`;
    }

    res.status(200).json({ success: true, data: out });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    // Dynamically extracts only the fields present in the request body
    const { governmentName, efpLogoUrl, issuingAuthority } = req.body;

    let finalLogoUrl = efpLogoUrl;

    // If the frontend passed a staged upload path (uploads/_tmp/...), move it to final uploads/ path
    if (
      typeof efpLogoUrl === "string" &&
      efpLogoUrl.includes("uploads/_tmp/")
    ) {
      try {
        // Normalize to relative paths without leading slash
        const fromRelative = efpLogoUrl.startsWith("/")
          ? efpLogoUrl.slice(1)
          : efpLogoUrl;

        const toRelative = fromRelative.replace("uploads/_tmp/", "uploads/");

        const moved = moveDocumentFile(fromRelative, toRelative);
        if (!moved) {
          return res
            .status(500)
            .json({
              success: false,
              message: "Failed to move uploaded logo to final location",
            });
        }

        finalLogoUrl = getDocumentUrl(toRelative);
      } catch (err: any) {
        console.error("[ERROR] Moving staged logo failed:", err);
        return res
          .status(500)
          .json({
            success: false,
            message: "Failed to finalize uploaded logo",
          });
      }
    }

    const updatedConfig = await SystemSettingsService.updateConfiguration({
      ...(governmentName && { governmentName }),
      ...(finalLogoUrl && { efpLogoUrl: finalLogoUrl }),
      ...(issuingAuthority && { issuingAuthority }),
    });

    // Return absolute URL for the client if efpLogoUrl is a local uploads path
    const out = { ...updatedConfig } as any;
    if (
      out.efpLogoUrl &&
      (out.efpLogoUrl.startsWith("/uploads") ||
        out.efpLogoUrl.startsWith("uploads/"))
    ) {
      const prefix = `${req.protocol}://${req.get("host")}`;
      out.efpLogoUrl = out.efpLogoUrl.startsWith("/")
        ? `${prefix}${out.efpLogoUrl}`
        : `${prefix}/${out.efpLogoUrl}`;
    }

    res.status(200).json({
      success: true,
      message:
        "System environment variables updated dynamically across all modules",
      data: out,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
