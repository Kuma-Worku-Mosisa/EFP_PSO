import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeRole = (role: unknown) =>
  String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeRoles = (roles: unknown) => {
  if (!Array.isArray(roles)) return [] as string[];
  return roles
    .map((role) => {
      if (role && typeof role === "object" && "role_name" in role) {
        return normalizeRole((role as any).role_name);
      }
      return normalizeRole(role);
    })
    .filter(Boolean);
};
