import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { properti, properti_images, detail_properti, properti_hadap, audit_logs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { authOptions } from "../auth/[...nextauth]";
import { propertiSchema } from "@/lib/validations/properti";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "ID tidak valid" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Harap login" });
  }

  if (req.method === "GET") {
    try {
      const [row] = await db
        .select()
        .from(properti)
        .where(eq(properti.id, id))
        .limit(1);

      if (!row || row.deletedAt) return res.status(404).json({ error: "Properti tidak ditemukan" });

      const allImages = await db
        .select({ imageUrl: properti_images.imageUrl })
        .from(properti_images)
        .where(eq(properti_images.propertiId, id))
        .orderBy(asc(properti_images.sortOrder));

      const imageUrls = allImages.map((i) => i.imageUrl);
      const imageUrl = imageUrls[0] ?? null;

      // fetch detail carport
      const [detail] = await db.select().from(detail_properti).where(eq(detail_properti.propertiId, id)).limit(1);
      
      // fetch hadap
      const hadapRows = await db.select().from(properti_hadap).where(eq(properti_hadap.propertiId, id));
      const hadap = hadapRows.map(h => h.hadap);

      let kawasanArr: string[] = [];
      try { kawasanArr = row.kawasan ? JSON.parse(row.kawasan) : []; } catch(e) {}

      const data = {
        ...row,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        imageUrl,
        imageUrls,
        hasCarport: detail?.hasCarport ?? false,
        detail: detail ?? null,
        hadap,
        kawasan: kawasanArr,
        price: Number(row.priceRupiah || row.price),
      };
      
      const safeData = JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value));
      return res.status(200).json(safeData);
    } catch (error) {
      console.error("GET properti error:", error);
      return res.status(500).json({ error: "Gagal mengambil data" });
    }
  }

  if (req.method === "PATCH") {
    if (session.user.role !== "superadmin") {
      return res.status(403).json({ error: "Akses ditolak. Hanya Superadmin yang dapat mengubah properti." });
    }

    try {
      const [existing] = await db
        .select()
        .from(properti)
        .where(eq(properti.id, id))
        .limit(1);

      if (!existing || existing.deletedAt) return res.status(404).json({ error: "Properti tidak ditemukan" });

      const validatedData = propertiSchema.parse(req.body);

      // Pre-fetch old data for audit log
      const [existingDetail] = await db.select().from(detail_properti).where(eq(detail_properti.propertiId, id));
      const existingHadapRows = await db.select().from(properti_hadap).where(eq(properti_hadap.propertiId, id));
      let existingKawasan = [];
      try { existingKawasan = existing.kawasan ? JSON.parse(existing.kawasan) : []; } catch(e) {}
      
      const oldData = {
        ...existing,
        hasCarport: existingDetail?.hasCarport ?? false,
        hadap: existingHadapRows.map(h => h.hadap),
        kawasan: existingKawasan,
      };

      const changedFields = Object.keys(validatedData).filter(key => {
        const oldVal = (oldData as any)[key];
        const newVal = (validatedData as any)[key];
        const stringifyVal = (val: any) => JSON.stringify(val, (_, v) => typeof v === 'bigint' ? v.toString() : v);
        return stringifyVal(oldVal) !== stringifyVal(newVal);
      });

      const [updated] = await db
        .update(properti)
        .set({
          name: validatedData.name,
          description: validatedData.description,
          type: validatedData.type,
          listingType: validatedData.listingType,
          price: String(validatedData.priceRupiah),
          priceRupiah: BigInt(validatedData.priceRupiah),
          priceUnit: validatedData.priceUnit,
          address: validatedData.address,
          province: validatedData.province,
          city: validatedData.city,
          district: validatedData.district,
          postalCode: validatedData.postalCode ?? null,
          latitude: String(validatedData.latitude),
          longitude: String(validatedData.longitude),
          group: validatedData.group ?? null,
          lebar: String(validatedData.lebar),
          panjang: String(validatedData.panjang),
          tingkat: String(validatedData.tingkat),
          listingStatus: validatedData.listingStatus,
          siap: validatedData.siap,
          mapsLink: validatedData.mapsLink ?? null,
          kawasan: JSON.stringify(validatedData.kawasan),
          unit: validatedData.unit ?? null,
          whatsapp: validatedData.whatsapp ?? null,
          updatedAt: new Date(),
        })
        .where(eq(properti.id, id))
        .returning();

      // Update Detail Properti
      const detailPayload = {
        hasCarport: validatedData.hasCarport,
        bedroomCount: validatedData.bedroomCount ?? null,
        bathroomCount: validatedData.bathroomCount ?? null,
        buildingArea: validatedData.buildingArea ? String(validatedData.buildingArea) : null,
        landArea: validatedData.landArea ? String(validatedData.landArea) : null,
        garageCount: validatedData.garageCount ?? null,
        condition: validatedData.condition ?? null,
        certificateType: validatedData.certificateType ?? null,
        yearBuilt: validatedData.yearBuilt ?? null,
      };

      if (existingDetail) {
        await db.update(detail_properti).set(detailPayload).where(eq(detail_properti.propertiId, id));
      } else {
        await db.insert(detail_properti).values({ propertiId: id, ...detailPayload });
      }

      // Update Hadap
      await db.delete(properti_hadap).where(eq(properti_hadap.propertiId, id));
      if (validatedData.hadap.length > 0) {
        for (const h of validatedData.hadap) {
          await db.insert(properti_hadap).values({
            propertiId: id,
            hadap: h as any,
          });
        }
      }

      // Handle ImageUrls
      if (req.body.imageUrls !== undefined) {
        const bodyImages = req.body.imageUrls || req.body.imageUrl;
        const imageUrls = Array.isArray(bodyImages)
          ? bodyImages.filter((u: unknown) => typeof u === "string")
          : typeof bodyImages === "string"
            ? [bodyImages]
            : [];
        await db.delete(properti_images).where(eq(properti_images.propertiId, id));
        for (let i = 0; i < imageUrls.length; i++) {
          await db.insert(properti_images).values({
            propertiId: id,
            imageUrl: imageUrls[i],
            imageType: i === 0 ? "thumbnail" : "gallery",
            sortOrder: i,
          });
        }
      }

      // Record Audit Log
      const ipAddress = Array.isArray(req.headers["x-forwarded-for"]) 
        ? req.headers["x-forwarded-for"][0] 
        : req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        
      await db.insert(audit_logs).values({
        userId: session.user.id,
        tableName: "properti",
        recordId: id,
        action: "update",
        oldData: JSON.stringify(oldData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        newData: JSON.stringify(validatedData, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        changedFields: JSON.stringify(changedFields),
        ipAddress: ipAddress as string | null,
      });

      const safeData = JSON.parse(JSON.stringify(updated, (key, value) => typeof value === 'bigint' ? value.toString() : value));
      return res.status(200).json(safeData);
    } catch (error: any) {
      console.error("PATCH properti error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Gagal mengubah properti" });
    }
  }

  if (req.method === "DELETE") {
    if (session.user.role !== "superadmin") {
      return res.status(403).json({ error: "Akses ditolak. Hanya Superadmin yang dapat menghapus properti." });
    }

    try {
      const [existing] = await db
        .select()
        .from(properti)
        .where(eq(properti.id, id))
        .limit(1);

      if (!existing || existing.deletedAt) return res.status(404).json({ error: "Properti tidak ditemukan" });

      // Soft delete
      await db.update(properti).set({ deletedAt: new Date() }).where(eq(properti.id, id));

      // Record Audit Log
      const ipAddress = Array.isArray(req.headers["x-forwarded-for"]) 
        ? req.headers["x-forwarded-for"][0] 
        : req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        
      await db.insert(audit_logs).values({
        userId: session.user.id,
        tableName: "properti",
        recordId: id,
        action: "delete",
        oldData: JSON.stringify(existing, (key, value) => typeof value === 'bigint' ? value.toString() : value),
        ipAddress: ipAddress as string | null,
      });

      return res.status(200).json({ message: "Properti berhasil dihapus" });
    } catch (error) {
      console.error("DELETE properti error:", error);
      return res.status(500).json({ error: "Gagal menghapus properti" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
