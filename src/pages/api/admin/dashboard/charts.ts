import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { properti } from "@/db/schema";
import { isNull } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Ambil data properti yang aktif (tidak dihapus)
    const properties = await db
      .select({
        listingStatus: properti.listingStatus,
        kawasan: properti.kawasan,
        priceRupiah: properti.priceRupiah,
        type: properti.type,
        siap: properti.siap,
      })
      .from(properti)
      .where(isNull(properti.deletedAt));

    // 1. Donut - Status Properti (in_stock vs sold_out)
    const statusData = {
      in_stock: 0,
      sold_out: 0,
    };

    // 2. Bar - Properti per Kawasan
    const kawasanData: Record<string, number> = {};

    // 3. Bar - Distribusi Harga
    const priceData = {
      "< 500 Jt": 0,
      "500 Jt - 1 M": 0,
      "1 M - 2 M": 0,
      "2 M - 5 M": 0,
      "> 5 M": 0,
    };

    // 4. Stacked Bar - Tipe x Siap Huni
    // Format: Record<type, Record<siap, number>>
    const typeSiapData: Record<string, Record<string, number>> = {};

    properties.forEach((p) => {
      // 1. Status Properti
      if (p.listingStatus === "in_stock") statusData.in_stock++;
      if (p.listingStatus === "sold_out") statusData.sold_out++;

      // 2. Kawasan
      if (p.kawasan) {
        try {
          const kawasanArray: string[] = JSON.parse(p.kawasan);
          kawasanArray.forEach((k) => {
            kawasanData[k] = (kawasanData[k] || 0) + 1;
          });
        } catch (e) {
          // Fallback if it's not a JSON string but a raw string
          const k = p.kawasan.trim();
          if (k) kawasanData[k] = (kawasanData[k] || 0) + 1;
        }
      }

      // 3. Distribusi Harga
      if (p.priceRupiah != null) {
        // Convert to Number since priceRupiah is BigInt or String from DB
        const price = Number(p.priceRupiah);
        if (price < 500_000_000) {
          priceData["< 500 Jt"]++;
        } else if (price >= 500_000_000 && price < 1_000_000_000) {
          priceData["500 Jt - 1 M"]++;
        } else if (price >= 1_000_000_000 && price < 2_000_000_000) {
          priceData["1 M - 2 M"]++;
        } else if (price >= 2_000_000_000 && price < 5_000_000_000) {
          priceData["2 M - 5 M"]++;
        } else {
          priceData["> 5 M"]++;
        }
      }

      // 4. Tipe x Siap Huni
      const type = p.type || "unknown";
      const siap = p.siap || "unknown";
      
      if (!typeSiapData[type]) {
        typeSiapData[type] = {};
      }
      typeSiapData[type][siap] = (typeSiapData[type][siap] || 0) + 1;
    });

    // Format data untuk memudahkan charting frontend
    const formattedKawasan = Object.entries(kawasanData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const formattedPriceData = Object.entries(priceData).map(
      ([bracket, count]) => ({ bracket, count })
    );

    const formattedTypeSiapData = Object.entries(typeSiapData).map(
      ([type, siapCounts]) => ({
        type,
        ...siapCounts,
      })
    );

    return res.status(200).json({
      status: "success",
      data: {
        statusChart: [
          { name: "In Stock", value: statusData.in_stock, id: "in_stock" },
          { name: "Sold Out", value: statusData.sold_out, id: "sold_out" },
        ],
        kawasanChart: formattedKawasan,
        priceChart: formattedPriceData,
        typeSiapChart: formattedTypeSiapData,
      },
    });
  } catch (error) {
    console.error("Error fetching charts data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
