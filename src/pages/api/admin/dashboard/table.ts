import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { properti, detail_properti, properti_hadap } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Lakukan left join untuk mendapatkan semua data yang dibutuhkan
    const rawData = await db
      .select({
        id: properti.id,
        name: properti.name,
        group: properti.group,
        lebar: properti.lebar,
        panjang: properti.panjang,
        type: properti.type,
        tingkat: properti.tingkat,
        priceRupiah: properti.priceRupiah,
        listingStatus: properti.listingStatus,
        siap: properti.siap,
        kawasan: properti.kawasan,
        hasCarport: detail_properti.hasCarport,
        hadap: properti_hadap.hadap,
      })
      .from(properti)
      .leftJoin(detail_properti, eq(properti.id, detail_properti.propertiId))
      .leftJoin(properti_hadap, eq(properti.id, properti_hadap.propertiId))
      .where(isNull(properti.deletedAt))
      .orderBy(desc(properti.createdAt));

    // Karena relasi properti ke properti_hadap adalah one-to-many,
    // kita perlu mengelompokkan (group) data berdasarkan properti ID
    // agar kolom 'hadap' tergabung menjadi satu array.
    const propertiesMap = new Map<string, any>();

    rawData.forEach((row) => {
      if (!propertiesMap.has(row.id)) {
        // Parse kawasan string menjadi array jika memungkinkan
        let parsedKawasan = [];
        if (row.kawasan) {
          try {
            parsedKawasan = JSON.parse(row.kawasan);
          } catch (e) {
            parsedKawasan = [row.kawasan]; // Fallback ke array string tunggal
          }
        }

        propertiesMap.set(row.id, {
          id: row.id,
          name: row.name,
          group: row.group,
          lebar: row.lebar ? Number(row.lebar) : null,
          panjang: row.panjang ? Number(row.panjang) : null,
          type: row.type,
          tingkat: row.tingkat ? Number(row.tingkat) : null,
          priceRupiah: row.priceRupiah ? row.priceRupiah.toString() : null, // Convert BigInt ke string untuk keamanan JSON
          hasCarport: row.hasCarport ?? false, // Default false jika detail_properti belum ada
          listingStatus: row.listingStatus,
          siap: row.siap,
          kawasan: parsedKawasan,
          hadap: row.hadap ? [row.hadap] : [],
        });
      } else {
        // Jika properti sudah ada di map, tambahkan nilai hadap ke dalam array
        const existing = propertiesMap.get(row.id);
        if (row.hadap && !existing.hadap.includes(row.hadap)) {
          existing.hadap.push(row.hadap);
        }
      }
    });

    const formattedData = Array.from(propertiesMap.values());

    return res.status(200).json({
      status: "success",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching table data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
