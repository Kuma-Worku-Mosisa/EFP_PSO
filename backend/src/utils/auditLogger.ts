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

// Useful raw SQL for DB admins / developers (SQL Server):
// SELECT TOP (1000) [audit_log_id]
//       ,[user_id]
//       ,[action]
//       ,[entity_name]
//       ,[entity_id]
//       ,[old_value]
//       ,[new_value]
//       ,[ip_address]
//       ,[user_agent]
//       ,[created_at]
//   FROM [EFP_PSO].[dbo].[audit_logs]
// The above query can be run directly against the database for quick inspection.
// Prefer using the helper below in application code to avoid raw SQL when possible.

/**
 * Return recent audit logs. Uses Prisma to fetch entries safely.
 * @param limit maximum number of records to return (default 1000)
 */
export async function getRecentAuditLogs(limit = 1000) {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { id: "desc" },
  });
}

export { createAuditLog as defaultCreateAuditLog };

/**
 * Query audit logs with filters and pagination.
 * filters: { page, pageSize, userId, entityName, from, to, action }
 */
export async function queryAuditLogs(filters: {
  page?: number;
  pageSize?: number;
  userId?: number | null | undefined;
  entityName?: string | null | undefined;
  from?: string | null | undefined;
  to?: string | null | undefined;
  action?: string | null | undefined;
}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(1000, Math.max(1, Number(filters.pageSize) || 100));

  const where: any = {};
  if (filters.userId) where.userId = Number(filters.userId);
  if (filters.entityName)
    where.entityName = {
      contains: String(filters.entityName),
      mode: "insensitive",
    };
  if (filters.action) where.action = String(filters.action);
  if (filters.from || filters.to) {
    where.createdAt = {} as any;
    if (filters.from) where.createdAt.gte = new Date(String(filters.from));
    if (filters.to) where.createdAt.lte = new Date(String(filters.to));
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
