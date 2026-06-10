import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import {
  properti,
  properti_images,
  detail_properti,
  properti_hadap,
  users,
} from "@/db/schema";
import { eq, desc, inArray, and, isNotNull } from "drizzle-orm";
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
    return res.status(403).json({ error: "Akses ditolak. Hanya Superadmin." });
  }

  try {
    const rows = await db
      .select()
      .from(properti)
      .where(isNotNull(properti.deletedAt))
      .orderBy(desc(properti.deletedAt));

    const ids = rows.map((p) => p.id);

    // fetch thumbnails
    const thumbnails = ids.length > 0
      ? await db
          .select({
            propertiId: properti_images.propertiId,
            imageUrl: properti_images.imageUrl,
          })
          .from(properti_images)
          .where(
            and(
              inArray(properti_images.propertiId, ids),
              eq(properti_images.imageType, "thumbnail")
            )
          )
      : [];
    const thumbMap = new Map<string, string>();
    for (const t of thumbnails) {
      if (!thumbMap.has(t.propertiId)) thumbMap.set(t.propertiId, t.imageUrl);
    }

    // fetch details for carport
    const details = ids.length > 0
      ? await db.select().from(detail_properti).where(inArray(detail_properti.propertiId, ids))
      : [];
    const detailMap = new Map<string, any>();
    for (const d of details) {
      detailMap.set(d.propertiId, d);
    }

    // fetch hadap
    const hadapRows = ids.length > 0
      ? await db.select().from(properti_hadap).where(inArray(properti_hadap.propertiId, ids))
      : [];
    const hadapMap = new Map<string, string[]>();
    for (const h of hadapRows) {
      if (!hadapMap.has(h.propertiId)) hadapMap.set(h.propertiId, []);
      hadapMap.get(h.propertiId)!.push(h.hadap);
    }

    // fetch createdBy (superadmin)
    const usersRows = ids.length > 0
      ? await db.select({ id: users.id, fullName: users.fullName }).from(users)
      : [];
    const userMap = new Map<string, string>();
    for (const u of usersRows) {
      userMap.set(u.id, u.fullName);
    }

    const data = rows.map((p) => {
      let kawasanArr: string[] = [];
      try {
         kawasanArr = p.kawasan ? JSON.parse(p.kawasan) : [];
      } catch(e) {}

      return {
        ...p,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        imageUrl: thumbMap.get(p.id) ?? null,
        hasCarport: detailMap.get(p.id)?.hasCarport ?? false,
        hadap: hadapMap.get(p.id) ?? [],
        kawasan: kawasanArr,
        createdByName: p.createdBy ? userMap.get(p.createdBy) : null,
        price: Number(p.priceRupiah || p.price),
        priceRupiah: p.priceRupiah?.toString(),
      };
    });

    const safeData = JSON.parse(JSON.stringify(data, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    ));
    return res.status(200).json(safeData);
  } catch (error) {
    console.error("GET properti arsip error:", error);
    return res.status(500).json({ error: "Gagal mengambil data arsip" });
  }
}
