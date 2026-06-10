import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { audit_logs, users, properti } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Harap login" });
  }

  if (session.user.role !== "superadmin") {
    return res.status(403).json({ error: "Akses ditolak. Hanya superadmin." });
  }

  try {
    const logs = await db
      .select({
        id: audit_logs.id,
        tableName: audit_logs.tableName,
        recordId: audit_logs.recordId,
        action: audit_logs.action,
        oldData: audit_logs.oldData,
        newData: audit_logs.newData,
        changedFields: audit_logs.changedFields,
        ipAddress: audit_logs.ipAddress,
        createdAt: audit_logs.createdAt,
        userFullName: users.fullName,
        userEmail: users.email,
      })
      .from(audit_logs)
      .leftJoin(users, eq(audit_logs.userId, users.id))
      .orderBy(desc(audit_logs.createdAt))
      .limit(100); // Batasi sementara ke 100 terbaru

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("GET audit logs error:", error);
    return res.status(500).json({ error: "Gagal mengambil data audit log" });
  }
}
