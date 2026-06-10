import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import {
  properti,
  properti_images,
  detail_properti,
  properti_hadap,
  users,
  audit_logs,
} from "@/db/schema";
import { eq, desc, inArray, and, isNull } from "drizzle-orm";
import { authOptions } from "../auth/[...nextauth]";
import { propertiSchema } from "@/lib/validations/properti";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const rows = await db
        .select()
        .from(properti)
        .where(isNull(properti.deletedAt))
        .orderBy(desc(properti.createdAt));

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
          // override price display
          price: Number(p.priceRupiah || p.price),
          priceRupiah: p.priceRupiah?.toString(),
        };
      });

      const safeData = JSON.parse(JSON.stringify(data, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));
      return res.status(200).json(safeData);
    } catch (error) {
      console.error("GET properti error:", error);
      return res.status(500).json({ error: "Gagal mengambil data properti" });
    }
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Harap login" });
    }
    // AC-5.2 & AC-8.1: Hanya Superadmin
    if (session.user.role !== "superadmin") {
      return res.status(403).json({ error: "Akses ditolak. Hanya Superadmin yang dapat menambah properti." });
    }

    try {
      const validatedData = propertiSchema.parse(req.body);

      const slug =
        validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now();

      const [inserted] = await db
        .insert(properti)
        .values({
          ownerId: session.user.id,
          createdBy: session.user.id,
          name: validatedData.name,
          slug,
          description: validatedData.description,
          type: validatedData.type,
          listingType: validatedData.listingType,
          price: String(validatedData.priceRupiah), // fallback to decimal price
          priceRupiah: BigInt(validatedData.priceRupiah),
          priceUnit: validatedData.priceUnit,
          address: validatedData.address,
          province: validatedData.province,
          city: validatedData.city,
          district: validatedData.district,
          postalCode: validatedData.postalCode ?? null,
          latitude: String(validatedData.latitude),
          longitude: String(validatedData.longitude),
          
          // AC-6.1 fields
          group: validatedData.group ?? null,
          lebar: String(validatedData.lebar),
          panjang: String(validatedData.panjang),
          tingkat: String(validatedData.tingkat),
          listingStatus: validatedData.listingStatus,
          siap: validatedData.siap,
          mapsLink: validatedData.mapsLink ?? null,
          kawasan: JSON.stringify(validatedData.kawasan),
          unit: validatedData.unit ?? null,
        })
        .returning();

      // Insert Detail Properti for Carport
      await db.insert(detail_properti).values({
        propertiId: inserted.id,
        hasCarport: validatedData.hasCarport,
      });

      // Insert Hadap
      if (validatedData.hadap.length > 0) {
        for (const h of validatedData.hadap) {
          await db.insert(properti_hadap).values({
            propertiId: inserted.id,
            hadap: h as any,
          });
        }
      }

      // Handle ImageUrls
      const bodyImages = req.body.imageUrls || req.body.imageUrl;
      const imageUrls = Array.isArray(bodyImages)
        ? bodyImages.filter((u: unknown) => typeof u === "string")
        : typeof bodyImages === "string"
          ? [bodyImages]
          : [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        await db.insert(properti_images).values({
          propertiId: inserted.id,
          imageUrl: imageUrls[i],
          imageType: i === 0 ? "thumbnail" : "gallery",
          sortOrder: i,
        });
      }

      // Record Audit Log
      const ipAddress = Array.isArray(req.headers["x-forwarded-for"]) 
        ? req.headers["x-forwarded-for"][0] 
        : req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        
      await db.insert(audit_logs).values({
        userId: session.user.id,
        tableName: "properti",
        recordId: inserted.id,
        action: "create",
        newData: JSON.stringify(validatedData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        ipAddress: ipAddress as string | null,
      });

      return res.status(201).json({
        ...inserted,
        priceRupiah: inserted.priceRupiah?.toString()
      });
    } catch (error: any) {
      console.error("POST properti error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Gagal menambahkan properti" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
