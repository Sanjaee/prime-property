import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db, users } from "@/db";
import { audit_logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "../../auth/[...nextauth]";
import bcrypt from "bcryptjs";

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
    return res.status(403).json({ error: "Akses ditolak. Hanya superadmin." });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID User tidak valid" });
  }

  const { action } = req.body;

  try {
    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (targetUser.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const ipAddress = Array.isArray(req.headers["x-forwarded-for"]) 
      ? req.headers["x-forwarded-for"][0] 
      : req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

    if (action === "toggle-active") {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "Parameter isActive harus boolean" });
      }

      await db.update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(users.id, id));

      const oldData = { ...targetUser[0] };
      const newData = { ...targetUser[0], isActive };
      
      await db.insert(audit_logs).values({
        userId: session.user.id,
        tableName: "users",
        recordId: id,
        action: "update",
        oldData: JSON.stringify(oldData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        newData: JSON.stringify(newData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        changedFields: JSON.stringify(["isActive"]),
        ipAddress: ipAddress as string | null,
      });

      return res.status(200).json({ success: true, message: `Status admin berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}.` });
    }

    if (action === "reset-password") {
      const { password } = req.body;
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password baru harus minimal 6 karakter." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, id));

      const oldData = { ...targetUser[0], password: "[REDACTED]" };
      const newData = { ...targetUser[0], password: "[NEW_PASSWORD_HASHED]" };

      await db.insert(audit_logs).values({
        userId: session.user.id,
        tableName: "users",
        recordId: id,
        action: "update",
        oldData: JSON.stringify(oldData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        newData: JSON.stringify(newData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        changedFields: JSON.stringify(["password"]),
        ipAddress: ipAddress as string | null,
      });

      return res.status(200).json({ success: true, message: "Password admin berhasil direset." });
    }

    return res.status(400).json({ error: "Action tidak dikenali" });
  } catch (error) {
    console.error("PATCH admin users/[id] error:", error);
    return res.status(500).json({ error: "Gagal memperbarui data user" });
  }
}
