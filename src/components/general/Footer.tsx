import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Footer() {
  return (
    < footer className="bg-[#1A1A1A] text-white pt-20 pb-10 border-t border-gray-800" >
      <motion.div
        className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="md:col-span-5">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center justify-center w-fit bg-[#F5F5F5] py-2 px-4 rounded-lg shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Prime Property Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-sm mt-6">
            Menghadirkan ruko dan villa premium di kawasan terbaik. Setiap transaksi dilayani dengan ketelitian dan kepercayaan.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="md:col-span-3">
          <h4 className="text-prime-gold text-sm font-bold tracking-widest uppercase mb-6">Navigasi</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-gray-300 hover:text-prime-gold transition-colors">Beranda</a></li>
            <li><a href="#" className="text-gray-300 hover:text-prime-gold transition-colors">Properti</a></li>
            <li><a href="#" className="text-gray-300 hover:text-prime-gold transition-colors">Tentang Kami</a></li>
            <li><a href="#" className="text-gray-300 hover:text-prime-gold transition-colors">Kontak</a></li>
            <li><a href="/agent/login" className="text-gray-300 hover:text-prime-gold transition-colors">Login Agent</a></li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp} className="md:col-span-4">
          <h4 className="text-prime-gold text-sm font-bold tracking-widest uppercase mb-6">Kontak</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-300">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-prime-gold" />
              <span>Prime Property Tower, Lantai 12, Jl. Imam Bonjol No. 88, Medan, Sumatera Utara 20152</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Phone className="w-5 h-5 shrink-0 text-prime-gold" />
              <span>+62 811 6000 700</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <MessageCircle className="w-5 h-5 shrink-0 text-prime-gold" />
              <span>WhatsApp</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Mail className="w-5 h-5 shrink-0 text-prime-gold" />
              <span>halo@primeproperty.id</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      <motion.div
        className="container mx-auto px-4 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
      >
        <p>© 2026 Prime Property. All rights reserved.</p>
        <p>PT Prime Property Indonesia · Senin - Sabtu · 09.00 - 18.00 WIB</p>
      </motion.div>
    </footer >
  );
}
