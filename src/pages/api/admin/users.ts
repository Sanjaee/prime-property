import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db, users, pool } from "@/db";
import { audit_logs } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { authOptions } from "../auth/[...nextauth]";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Harap login" });
  }

  if (session.user.role !== "superadmin") {
    // Only superadmin can manage users
    return res.status(403).json({ error: "Akses ditolak. Hanya superadmin." });
  }

  if (req.method === "POST") {
    try {
      const { fullName, email, password } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "Nama, Email, dan Password wajib diisi." });
      }

      // Check if email already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email sudah terdaftar." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [inserted] = await db.insert(users).values({
        fullName,
        email,
        password: hashedPassword,
        userType: "admin", // New users created here are admins by default
        isActive: true,
        isVerified: true, // Superadmin created it, assume verified
      }).returning();

      const ipAddress = Array.isArray(req.headers["x-forwarded-for"]) 
        ? req.headers["x-forwarded-for"][0] 
        : req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

      await db.insert(audit_logs).values({
        userId: session.user.id,
        tableName: "users",
        recordId: inserted.id,
        action: "create",
        newData: JSON.stringify({ fullName, email, userType: "admin", isActive: true }),
        ipAddress: ipAddress as string | null,
      });

      return res.status(201).json({ success: true, message: "Admin berhasil dibuat" });
    } catch (error) {
      console.error("POST admin users error:", error);
      return res.status(500).json({ error: "Gagal membuat admin" });
    }
  }

  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        phone: users.phone,
        userType: users.userType,
        isActive: users.isActive,
        isVerified: users.isVerified,
        loginType: users.loginType,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Stats by role
    const roleStats = await db
      .select({
        userType: users.userType,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.userType);

    // Stats by verification
    const verifiedCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.isVerified, true));
    const unverifiedCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.isVerified, false));

    const roleMap = Object.fromEntries(
      roleStats.map((s) => [s.userType, Number(s.count)])
    );

    // Registrations by date (last 90 days) for area chart
    const regResult = await pool.query<{
      date: string;
      user_type: string;
      count: string;
    }>(`
      SELECT date_trunc('day', created_at)::date as date, user_type, count(*)::int as count
      FROM users
      WHERE created_at >= now() - interval '90 days'
      GROUP BY date_trunc('day', created_at), user_type
      ORDER BY date
    `);

    const dateMap = new Map<string, { admin: number; superadmin: number }>();
    for (const r of regResult.rows) {
      const dateVal = r.date as any;
      const key = dateVal instanceof Date ? dateVal.toISOString().split('T')[0] : String(dateVal);
      if (!dateMap.has(key)) {
        dateMap.set(key, { admin: 0, superadmin: 0 });
      }
      const row = dateMap.get(key)!;
      const k = r.user_type as keyof typeof row;
      if (k in row) row[k] = Number(r.count);
    }
    const registrationsByDate = Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        admin: counts.admin,
        superadmin: counts.superadmin,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      users: rows.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username ?? null,
        fullName: u.fullName,
        phone: u.phone ?? null,
        userType: u.userType,
        isActive: u.isActive,
        isVerified: u.isVerified,
        loginType: u.loginType,
        createdAt: u.createdAt,
      })),
      stats: {
        total: rows.length,
        by_type: {
          admin: roleMap.admin ?? 0,
          superadmin: roleMap.superadmin ?? 0,
        },
        by_verification: {
          verified: Number(verifiedCount[0]?.count ?? 0),
          unverified: Number(unverifiedCount[0]?.count ?? 0),
        },
      },
      registrationsByDate,
    });
  } catch (error) {
    console.error("GET admin users error:", error);
    return res.status(500).json({ error: "Gagal mengambil data user" });
  }
}
