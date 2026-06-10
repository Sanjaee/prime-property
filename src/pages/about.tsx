import Head from "next/head";
import Navbar from "@/components/general/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AboutPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-white text-prime-black`}>
      <Head>
        <title>Tentang Kami - Prime Property</title>
        <meta name="description" content="Tentang Prime Property - Platform pencarian properti premium terpercaya di Indonesia." />
      </Head>

      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative px-4 py-20 lg:py-32 overflow-hidden flex flex-col items-center text-center bg-gray-50/50">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-prime-gold/10 via-white to-white pointer-events-none"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10 container max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-prime-black font-bold mb-6 leading-tight">
              Menemukan <span className="text-prime-gold">Properti Premium</span><br className="hidden md:block"/> Tidak Pernah Semudah Ini.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Prime Property hadir untuk merevolusi cara Anda mencari, membeli, dan menyewa properti. Kami mengkurasi listing eksklusif dengan pengalaman pencarian peta paling interaktif di Indonesia.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => router.push("/")}
                className="bg-prime-black hover:bg-gray-800 text-white h-14 px-8 rounded-full text-base font-semibold shadow-lg transition-all"
              >
                Mulai Eksplorasi
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Value Proposition */}
        <section className="py-24 px-4 container max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-prime-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-prime-gold transition-all duration-300">
                <MapPin className="size-6 text-prime-gold group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Peta Interaktif 3D</h3>
              <p className="text-gray-500 leading-relaxed">
                Visualisasikan lokasi properti idaman Anda dengan peta interaktif yang detail, intuitif, dan responsif.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-prime-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-prime-gold transition-all duration-300">
                <ShieldCheck className="size-6 text-prime-gold group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Legalitas Terjamin</h3>
              <p className="text-gray-500 leading-relaxed">
                Setiap properti melewati proses verifikasi ketat untuk memastikan keamanan investasi dan ketenangan pikiran Anda.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-prime-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-prime-gold transition-all duration-300">
                <Building2 className="size-6 text-prime-gold group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pilihan Premium</h3>
              <p className="text-gray-500 leading-relaxed">
                Koleksi properti berkualitas tinggi, mulai dari rumah mewah siap huni hingga apartemen eksklusif di pusat kota.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-prime-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-prime-gold transition-all duration-300">
                <Star className="size-6 text-prime-gold group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Layanan Eksklusif</h3>
              <p className="text-gray-500 leading-relaxed">
                Dukungan agen profesional yang berdedikasi untuk mendampingi setiap langkah transaksi properti Anda.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4 bg-prime-black text-white">
          <div className="container max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <p className="text-prime-gold font-bold tracking-widest uppercase text-sm mb-4">Kisah Kami</p>
                <h2 className="text-4xl font-serif font-bold mb-6">Membangun Kepercayaan di Setiap Transaksi.</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Berawal dari sebuah visi sederhana: membuat pencarian properti menjadi pengalaman yang menyenangkan, bukan menyulitkan. Prime Property didirikan oleh para ahli real estat dan teknologi yang melihat kebutuhan akan transparansi dan kualitas di pasar properti Indonesia.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Kami menggabungkan desain antarmuka yang indah, teknologi pemetaan mutakhir, dan layanan pelanggan tanpa kompromi. Kami bukan sekadar platform; kami adalah mitra terpercaya Anda dalam mewujudkan rumah impian.
                </p>
              </div>
              <div className="relative h-80 md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 animate-pulse"></div>
                {/* Simulated Image Placeholder with nice gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-prime-gold/20 to-black/80 flex items-center justify-center border border-white/10 rounded-3xl">
                  <div className="text-center">
                    <Building2 className="size-20 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70 font-medium">Est. 2026</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer minimalis */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-100">
        <p>&copy; {new Date().getFullYear()} Prime Property. Hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
