import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/db";
import { properti, properti_images, detail_properti } from "@/db/schema";
import { desc, eq, inArray, and, isNull, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { IconLoader } from "@tabler/icons-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Properti = InferSelectModel<typeof properti>;

interface PropertiPageProps {
  properties: (Properti & { imageUrl: string | null; hasCarport: boolean })[];
}

export default function PropertiPage({ properties }: PropertiPageProps) {
  const [kawasanFilter, setKawasanFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [maxHargaFilter, setMaxHargaFilter] = useState("");
  const [displayProperties, setDisplayProperties] = useState(properties);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Basic client-side filtering on mount or when props change
    setDisplayProperties(properties);
  }, [properties]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // We can just filter the existing properties array client-side 
      // since we already loaded all of them in getServerSideProps!
      const filtered = properties.filter((p: any) => {
        let match = true;
        if (kawasanFilter !== "all") {
          const kwsn = Array.isArray(p.kawasan) ? p.kawasan : [];
          if (!kwsn.includes(kawasanFilter)) match = false;
        }
        if (tipeFilter !== "all" && p.type !== tipeFilter) {
          match = false;
        }
        if (maxHargaFilter && Number(maxHargaFilter) > 0) {
          const price = Number(p.priceRupiah || p.price);
          if (price > Number(maxHargaFilter)) match = false;
        }
        return match;
      });
      setDisplayProperties(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-prime-white font-sans text-prime-black flex flex-col`}>
      <Head>
        <title>Semua Properti - Prime Property</title>
      </Head>
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Semua Properti</h1>
            <p className="text-gray-500">Temukan properti idaman Anda dari koleksi lengkap kami.</p>
          </div>
        </div>

        {/* Filter Section */}
        <section className="container mx-auto px-4 relative z-20 mb-12">
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4 items-end border border-gray-100 max-w-4xl">
            <div className="w-full md:w-1/3">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Kawasan</label>
              <Select value={kawasanFilter} onValueChange={setKawasanFilter}>
                <SelectTrigger className="bg-prime-gray border-none h-11 w-full text-left">
                  <SelectValue placeholder="Semua Kawasan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kawasan</SelectItem>
                  <SelectItem value="krakatau">Krakatau</SelectItem>
                  <SelectItem value="pancing">Pancing</SelectItem>
                  <SelectItem value="cemara_asri">Cemara Asri</SelectItem>
                  <SelectItem value="kuala">Kuala</SelectItem>
                  <SelectItem value="tembung">Tembung</SelectItem>
                  <SelectItem value="helvetia">Helvetia</SelectItem>
                  <SelectItem value="setia_budi">Setia Budi</SelectItem>
                  <SelectItem value="johor">Johor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Tipe</label>
              <Select value={tipeFilter} onValueChange={setTipeFilter}>
                <SelectTrigger className="bg-prime-gray border-none h-11 w-full text-left">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="ruko">Ruko</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Harga Maksimum</label>
              <Input 
                type="text" 
                placeholder="Rp Tanpa batas" 
                className="bg-prime-gray border-none h-11" 
                value={maxHargaFilter ? Number(maxHargaFilter).toLocaleString("id-ID") : ""} 
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\./g, "");
                  if (!isNaN(Number(rawValue))) {
                    setMaxHargaFilter(rawValue);
                  }
                }} 
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full md:w-auto h-11 px-8 bg-prime-gold hover:brightness-95 text-prime-black font-semibold shadow-md">
              {isSearching ? <><IconLoader className="mr-2 h-4 w-4 animate-spin" /> Mencari...</> : "Terapkan Filter"}
            </Button>
          </div>
        </section>

        {/* Listing Grid */}
        <section className="container mx-auto px-4">
          <motion.div
            key={displayProperties.map(p => p.id).join(",")}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {displayProperties.map((prop) => (
              <motion.div key={prop.id} variants={fadeUp}>
                <Link href={`/properti/${prop.slug}`} className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 h-full">
                  <div className="h-48 bg-prime-black relative flex items-end justify-center">
                    <img
                      src={prop.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                      alt={prop.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Tersedia
                      </span>
                      {prop.listingType === "sale" && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                          Dijual
                        </span>
                      )}
                      {prop.listingType === "rent" && (
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
                          Disewa
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="font-bold text-xl group-hover:text-prime-gold transition-colors line-clamp-1">{prop.name}</h3>
                      <span className="font-bold text-lg whitespace-nowrap text-prime-black bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        Rp {Number(prop.priceRupiah || prop.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{prop.description}</p>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <MapPin className="w-4 h-4 mr-2 text-prime-gold flex-shrink-0" />
                      <span className="truncate">{prop.address}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {displayProperties.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold text-prime-black mb-1">Properti Tidak Ditemukan</h3>
                <p>Coba ubah kriteria filter pencarian Anda.</p>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch ALL active properties (no limit)
    const data = await db.query.properti.findMany({
      orderBy: [desc(properti.createdAt)],
      where: and(eq(properti.status, "active"), isNull(properti.deletedAt)),
    });

    const ids = data.map((p) => p.id);

    // Fetch images
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

    // Fetch details (for carport)
    const details = ids.length > 0
      ? await db
        .select({
          propertiId: detail_properti.propertiId,
          hasCarport: detail_properti.hasCarport,
        })
        .from(detail_properti)
        .where(inArray(detail_properti.propertiId, ids))
      : [];

    const detailMap = new Map<string, boolean>();
    for (const d of details) {
      detailMap.set(d.propertiId, d.hasCarport);
    }

    const propertiesWithImages = data.map((p) => ({
      ...p,
      imageUrl: thumbMap.get(p.id) ?? null,
      hasCarport: detailMap.get(p.id) ?? false,
    }));

    return {
      props: {
        properties: JSON.parse(
          JSON.stringify(propertiesWithImages, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        ),
      },
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return {
      props: {
        properties: [],
      },
    };
  }
}
