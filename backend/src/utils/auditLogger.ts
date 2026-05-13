import prisma from "../lib/prisma";

export interface AuditEntry {
  userId?: number | null;
  action: string;
  entityName: string;
  entityId?: number | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create an audit log entry. If a transactional client is provided (tx) it will be used,
 * otherwise the global prisma client is used.
 */
export async function createAuditLog(client: any, entry: AuditEntry) {
  // client is expected to be either prisma or a transactional client (tx)
  try {
    if (!client || !client.auditLog) {
      // fallback to global prisma
      return await prisma.auditLog.create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          entityName: entry.entityName,
          entityId: entry.entityId ?? null,
          oldValue: entry.oldValue ?? null,
          newValue: entry.newValue ?? null,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
        },
      });
    }

    return await client.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityName: entry.entityName,
        entityId: entry.entityId ?? null,
        oldValue: entry.oldValue ?? null,
        newValue: entry.newValue ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error("[ERROR] Failed to write audit log", err);
    // Never throw from audit logger to avoid failing main flow; return null
    return null;
  }
}

export default { createAuditLog };
