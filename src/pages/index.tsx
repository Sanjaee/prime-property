import { useState } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/general/Navbar";
import { UnifiedMap } from "@/components/map/UnifiedMap";
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
import { MapPin, Phone, MessageCircle, Mail, Maximize2, Minimize2 } from "lucide-react";
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

interface HomeProps {
  totalCount: number;
  properties: (Properti & { imageUrl: string | null; hasCarport: boolean })[];
}

export default function Home({ properties, totalCount }: HomeProps) {
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [kawasanFilter, setKawasanFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [maxHargaFilter, setMaxHargaFilter] = useState("");
  const [displayProperties, setDisplayProperties] = useState(properties);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch("/api/properti");
      if (res.ok) {
        const allProps = await res.json();
        const filtered = allProps.filter((p: any) => {
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
        setDisplayProperties(filtered.slice(0, 6));
        
        // Scroll to the property section
        document.getElementById("koleksi-pilihan")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-prime-white font-sans text-prime-black`}>
      <Navbar />

      <section
        className={`group transition-all duration-500 ease-in-out ${isMapFullscreen
            ? "fixed inset-0 z-[100] h-screen w-screen bg-black"
            : "relative h-[45vh] md:h-[55vh] w-full pt-16 z-10 overflow-hidden"
          }`}
      >
        <UnifiedMap theme="dark" />

        {/* Overlay Pembuka (hanya tampil saat tidak fullscreen) */}
        {!isMapFullscreen && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[3px] transition-all duration-500 group-hover:bg-black/10 group-hover:backdrop-blur-none cursor-pointer mt-16"
            onClick={() => setIsMapFullscreen(true)}
          >
            <div className="bg-black/40 px-8 py-6 rounded-2xl border border-white/20 backdrop-blur-md transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4 group-hover:scale-95 text-center shadow-2xl">
              <h2 className="text-white text-2xl md:text-3xl font-serif font-bold mb-3 tracking-wide">
                Temukan Lokasi Impian Anda
              </h2>
              <div className="inline-flex items-center gap-2 bg-prime-gold/20 text-prime-gold px-4 py-2 rounded-full border border-prime-gold/30 text-sm font-semibold">
                <Maximize2 className="w-4 h-4" />
                <span>Klik peta untuk memperbesar</span>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Toggle Button */}
        <button
          onClick={() => setIsMapFullscreen(!isMapFullscreen)}
          className={`absolute ${isMapFullscreen ? "top-6 right-6" : "top-20 right-4"} bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/10 shadow-xl z-[101] ${isMapFullscreen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          title={isMapFullscreen ? "Tutup Layar Penuh" : "Buka Layar Penuh"}
        >
          {isMapFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
        </button>
      </section>

      {/* Filter Section */}
      <section className="container mx-auto px-4 relative z-20 -mt-14">
        <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col md:flex-row gap-4 items-end border border-gray-100 max-w-4xl mx-auto">
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
            {isSearching ? <><IconLoader className="mr-2 h-4 w-4 animate-spin" /> Mencari...</> : "Cari Properti"}
          </Button>
        </div>
      </section>

      {/* Trusted Areas */}
      <section className="container mx-auto px-4 mt-12 mb-16 text-center">
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium">
          <span className="text-gray-400 uppercase tracking-wider mr-2 text-xs">Dipercaya di Kawasan</span>
          <span className="text-prime-black">Krakatau</span>
          <span className="text-prime-black">Pancing</span>
          <span className="text-prime-black">Cemara Asri</span>
          <span className="text-prime-black">Kuala</span>
          <span className="text-prime-black">Tembung</span>
          <span className="text-prime-black">Helvetia</span>
          <span className="text-prime-black">Setia Budi</span>
          <span className="text-prime-black">Johor</span>
        </div>
      </section>

      {/* Properti Unggulan */}
      <motion.section
        className="container mx-auto px-4 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeUp}
      >
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-[1px] w-12 bg-prime-gold"></div>
            <h3 className="text-prime-gold text-sm font-bold tracking-widest uppercase">Properti Unggulan</h3>
          </div>
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-prime-black mb-2">Koleksi pilihan yang siap Anda miliki</h2>
              <p className="text-gray-500">Cuplikan portofolio terbaik kami—klik untuk melihat detail dan informasi harga lengkap.</p>
            </div>
            <Button variant="outline" className="border-gray-300 text-prime-black hover:bg-prime-gray" asChild>
              <Link href="/properti">
                Lihat Semua ({totalCount}) →
              </Link>
            </Button>
          </div>
        </div>

        <motion.div
          key={displayProperties.map(p => p.id).join(",")}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {displayProperties.map((prop) => (
            <motion.div key={prop.id} variants={fadeUp}>
              <Link href={`/properti/${prop.slug}`} className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 h-full">
                <div className="h-48 bg-prime-black relative flex items-end justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                    alt={prop.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      {prop.listingStatus === "in_stock" ? "In Stock" : "Sold Out"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-md text-prime-black text-xs font-bold px-3 py-1 rounded-full border border-gray-200 capitalize shadow-sm">
                      {prop.type}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs text-prime-gold font-bold mb-2 uppercase tracking-wider">{prop.kawasan ? (Array.isArray(prop.kawasan) ? prop.kawasan.join(", ") : JSON.parse(prop.kawasan as string).join(", ")) : prop.district || "Lokasi"}</div>
                  <h4 className="text-lg font-bold text-prime-black mb-1 line-clamp-1">{prop.name}</h4>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{prop.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prop.lebar && prop.panjang && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {Number(prop.lebar)}x{Number(prop.panjang)}m
                      </span>
                    )}
                    {prop.tingkat && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {Number(prop.tingkat)} Lt
                      </span>
                    )}
                    {prop.hasCarport && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Carport
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Harga mulai</div>
                      <div className="text-prime-black font-bold">
                        Rp {Number(prop.priceRupiah || prop.price).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-0.5">Kondisi</div>
                      <div className="text-sm font-semibold text-prime-gold capitalize">
                        {prop.siap ? prop.siap.replace(/_/g, " ") : prop.unit || prop.group || "Tersedia"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {displayProperties.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Belum ada data properti unggulan.
            </div>
          )}
        </motion.div>
      </motion.section>

      {/* Mengapa Prime Property */}
      <motion.section
        className="bg-prime-gray py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeUp} className="max-w-2xl mb-16">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-[1px] w-12 bg-prime-gold"></div>
              <h3 className="text-prime-gold text-sm font-bold tracking-widest uppercase">Mengapa Prime Property</h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-prime-black mb-4">Kepercayaan yang dibangun di atas detail</h2>
            <p className="text-gray-500">Empat alasan klien memilih kami untuk keputusan properti paling penting mereka.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Properti Terkurasi", desc: "Setiap unit diseleksi dengan standar tinggi—legalitas jelas, kondisi prima, nilai investasi terukur." },
              { num: "02", title: "Kawasan Strategis", desc: "Portofolio kami berada di lokasi dengan akses, fasilitas, dan prospek pertumbuhan terbaik." },
              { num: "03", title: "Legalitas Terverifikasi", desc: "Dokumen dan status setiap properti diperiksa saksama. Tanpa biaya tersembunyi." },
              { num: "04", title: "Dibantu Agent Profesional", desc: "Agen berpengalaman mendampingi Anda dari pencarian hingga serah terima dengan tenang." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-prime-gold font-serif text-3xl mb-4">{item.num}</div>
                <h4 className="text-xl font-bold text-prime-black mb-3">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tentang Kami */}
      <motion.section
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-prime-black text-white rounded-3xl p-8 md:p-16 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-prime-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="w-full md:w-1/2 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-12 bg-prime-gold"></div>
                <h3 className="text-prime-gold text-sm font-bold tracking-widest uppercase">Tentang Kami</h3>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 leading-tight">Agensi properti yang dibangun di atas kepercayaan.</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                Prime Property memadukan pemahaman pasar yang mendalam dengan pelayanan personal. Kami menempatkan ketelitian data dan transparansi sebagai fondasi—agar setiap keputusan properti Anda diambil dengan tenang dan percaya diri.
              </p>
              <Link href="/" className="inline-flex items-center justify-center w-fit bg-[#F5F5F5] py-2 px-4 rounded-lg shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Prime Property Logo" className="h-10 w-auto object-contain" />
              </Link>
            </div>
            <div className="w-full md:w-1/2 relative z-10 flex justify-center">
              <div className="w-full max-w-sm aspect-square bg-gradient-to-tr from-prime-gold/20 to-transparent rounded-full flex items-center justify-center p-8">
                <div className="w-full h-full rounded-full border border-prime-gold/30 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                  <div className="text-5xl font-serif text-prime-gold mb-2">10+</div>
                  <div className="text-sm uppercase tracking-widest text-gray-400">Tahun Pengalaman</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Langkah Berikutnya */}
      <motion.section
        className="py-24 bg-gradient-to-b from-white to-prime-gray"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif text-prime-black mb-6">Siap menemukan properti yang tepat?</h2>
          <p className="text-gray-600 mb-10 text-lg">
            Tim Prime Property siap membantu Anda menemukan ruko atau villa yang sesuai kebutuhan dan anggaran.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="h-12 px-8 bg-prime-black hover:bg-prime-black/90 text-white font-medium text-lg rounded-full">
              <Link href="/contact">Hubungi Kami Sekarang</Link>
            </Button>
            <Button variant="outline" asChild className="h-12 px-8 border-prime-black text-prime-black hover:bg-prime-gray font-medium text-lg rounded-full">
              <Link href="/properti">Lihat Properti</Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const totalCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(properti)
      .where(and(eq(properti.status, "active"), isNull(properti.deletedAt)));
      
    const totalCount = Number(totalCountResult[0]?.count || 0);

    const data = await db.query.properti.findMany({
      limit: 6,
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
        totalCount,
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
