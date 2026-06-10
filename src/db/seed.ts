import "dotenv/config";
import { db, pool } from "./index";
import { users, properti, properti_images, detail_properti, properti_hadap } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// Random number generator between min and max
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Regions
const REGIONS = [
  { name: "Jakarta", latMin: -6.3, latMax: -6.1, lngMin: 106.7, lngMax: 106.9 },
  { name: "Medan", latMin: 3.5, latMax: 3.7, lngMin: 98.6, lngMax: 98.7 },
  { name: "Malaysia (KL)", latMin: 3.0, latMax: 3.2, lngMin: 101.6, lngMax: 101.8 },
];

const KAWASAN_LIST = ["Krakatau", "Pancing", "Cemara Asri", "Kuala", "Tembung", "Helvetia", "Setia Budi", "Johor"];
const TIPE_LIST = ["house", "villa", "ruko", "apartment", "commercial"] as const;
const SIAP_LIST = ["siap_huni", "siap_kosong", "siap_huni_renovasi"] as const;

async function seed() {
  try {
    console.log("Seeding superadmin...");
    
    let superadminId = "";
    const existing = await db.query.users.findFirst({
      where: eq(users.email, "superadmin@example.com")
    });

    if (existing) {
      console.log("Superadmin already exists.");
      superadminId = existing.id;
    } else {
      const hashedPassword = await bcrypt.hash("superadmin123", 10);
      const [newAdmin] = await db.insert(users).values({
        email: "superadmin@example.com",
        username: "superadmin",
        fullName: "Super Admin",
        password: hashedPassword,
        userType: "superadmin",
        isActive: true,
        isVerified: true,
      }).returning({ id: users.id });
      
      superadminId = newAdmin.id;
      console.log("Superadmin created successfully!");
    }

    console.log("Seeding 100 dummy properties in Jakarta, Malaysia, and Medan...");
    
    // Delete existing properties
    await db.delete(properti);

    const imageUrls = [
      "https://navapark.id/site/assets/images/newsEvents/5fbca07f54a2e.jpeg",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
    ];

    for (let i = 0; i < 100; i++) {
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const lat = randomInRange(region.latMin, region.latMax);
      const lng = randomInRange(region.lngMin, region.lngMax);
      
      const kawasan = KAWASAN_LIST[Math.floor(Math.random() * KAWASAN_LIST.length)];
      const type = TIPE_LIST[Math.floor(Math.random() * TIPE_LIST.length)];
      const siap = SIAP_LIST[Math.floor(Math.random() * SIAP_LIST.length)];
      
      const priceRupiah = BigInt(Math.floor(randomInRange(500, 5000)) * 1000000); // 500jt - 5M

      const [newProp] = await db.insert(properti).values({
        ownerId: superadminId,
        createdBy: superadminId,
        name: `Properti Premium ${region.name} #${i + 1}`,
        slug: `prop-${region.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}-${Date.now()}`,
        description: `Properti eksklusif di ${region.name}. Terletak di kawasan strategis ${kawasan} dengan fasilitas terbaik.`,
        type: type,
        status: "active",
        listingType: "sale",
        price: "0",
        priceRupiah: priceRupiah,
        address: `Jl. Contoh No. ${i+1}, ${region.name}`,
        province: region.name,
        city: region.name,
        district: kawasan,
        latitude: lat.toString(),
        longitude: lng.toString(),
        group: i % 5 === 0 ? "Cluster Elite" : null,
        lebar: (Math.floor(randomInRange(5, 15))).toString(),
        panjang: (Math.floor(randomInRange(10, 30))).toString(),
        tingkat: (Math.floor(randomInRange(1, 4))).toString(),
        listingStatus: i % 10 === 0 ? "sold_out" : "in_stock",
        siap: siap,
        kawasan: JSON.stringify([kawasan]),
        unit: i % 3 === 0 ? "Ready Siap huni" : null,
      }).returning({ id: properti.id });

      // Insert detail_properti
      await db.insert(detail_properti).values({
        propertiId: newProp.id,
        hasCarport: Math.random() > 0.2, // 80% chance of having carport
      });

      // Insert image
      await db.insert(properti_images).values({
        propertiId: newProp.id,
        imageUrl: imageUrls[i % imageUrls.length],
        imageType: "thumbnail",
        sortOrder: 0,
      });

      // Insert hadap
      await db.insert(properti_hadap).values({
        propertiId: newProp.id,
        hadap: i % 2 === 0 ? "Utara" : "Selatan",
      });
      
      if (i % 25 === 0) {
        console.log(`Seeded ${i} properties...`);
      }
    }

    console.log("Seeding complete! 100 properties created.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
