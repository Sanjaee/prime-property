import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { properti, audit_logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Harap login" });
  }

  if (session.user.role !== "superadmin") {
    return res.status(403).json({ error: "Akses ditolak. Hanya Superadmin." });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID tidak valid" });
  }

  try {
    const [existing] = await db
      .select()
      .from(properti)
      .where(eq(properti.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Properti tidak ditemukan" });
    }

    if (!existing.deletedAt) {
      return res.status(400).json({ error: "Properti tidak dalam status terhapus" });
    }

    await db.update(properti).set({ deletedAt: null }).where(eq(properti.id, id));

    const ipAddress = Array.isArray(req.headers["x-forwarded-for"]) 
      ? req.headers["x-forwarded-for"][0] 
      : req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
      
    await db.insert(audit_logs).values({
      userId: session.user.id,
      tableName: "properti",
      recordId: id,
      action: "restore",
      oldData: JSON.stringify({ deletedAt: existing.deletedAt }),
      newData: JSON.stringify({ deletedAt: null }),
      changedFields: JSON.stringify(["deletedAt"]),
      ipAddress: ipAddress as string | null,
    });

    return res.status(200).json({ message: "Properti berhasil di-restore" });
  } catch (error) {
    console.error("PATCH properti restore error:", error);
    return res.status(500).json({ error: "Gagal me-restore properti" });
  }
}
