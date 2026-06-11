import Head from "next/head";
import Navbar from "@/components/general/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Footer from "@/components/general/Footer";

// Load map dynamically to avoid SSR issues with mapbox-gl
const PropertyLocationMap = dynamic(
  () => import("@/components/map/PropertyLocationMap").then((m) => m.PropertyLocationMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">Memuat Peta...</div> }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  // Kantor Pusat Prime Property
  const officeLocation = {
    lat: -6.227448,
    lng: 106.808605,
    address: "District 8, SCBD Lot 28, Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan, 12190"
  };

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal mengirim pesan");
      }

      toast({
        title: "Sukses",
        description: "Pesan terkirim, tim kami akan menghubungi Anda.",
      });
      reset();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-gray-50 text-prime-black`}>
      <Head>
        <title>Hubungi Kami - Prime Property</title>
        <meta name="description" content="Hubungi Prime Property untuk bantuan pencarian atau penjualan properti Anda." />
      </Head>

      <Navbar />

      <main className="pt-24 pb-20">
        {/* Header Section */}
        <section className="bg-prime-black text-white py-16 md:py-24 px-4 text-center rounded-b-[3rem] mx-2 mb-12 shadow-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Mulai <span className="text-prime-gold">Percakapan</span></h1>
            <p className="text-gray-400 text-lg">
              Punya pertanyaan seputar properti? Ingin berkonsultasi? Kami siap mendengarkan dan membantu Anda.
            </p>
          </motion.div>
        </section>

        <section className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Form Kontak */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm lg:col-span-7 flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" placeholder="John Doe" {...register("name")} className={`h-12 bg-gray-50 border-gray-200 ${errors.name ? "border-red-500" : ""}`} />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" type="tel" placeholder="0812-3456-7890" {...register("phone")} className={`h-12 bg-gray-50 border-gray-200 ${errors.phone ? "border-red-500" : ""}`} />
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" {...register("email")} className={`h-12 bg-gray-50 border-gray-200 ${errors.email ? "border-red-500" : ""}`} />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
                <div className="space-y-2 flex flex-col flex-grow">
                  <Label htmlFor="message">Pesan Anda</Label>
                  <Textarea id="message" placeholder="Tuliskan detail pertanyaan atau kebutuhan Anda di sini..." {...register("message")} className={`flex-grow min-h-[150px] bg-gray-50 border-gray-200 resize-none ${errors.message ? "border-red-500" : ""}`} />
                  {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 mt-auto bg-prime-gold hover:bg-[#d4af37] text-prime-black font-bold rounded-xl text-base shadow-md transition-all"
                >
                  {isSubmitting ? "Mengirim..." : (
                    <>
                      Kirim Pesan Sekarang <Send className="size-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Info Kontak & Peta */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-8 lg:col-span-5 h-full"
            >
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Informasi Kontak</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-prime-gold/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="size-5 text-prime-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-prime-black mb-1">Kantor Pusat</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{officeLocation.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-prime-gold/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="size-5 text-prime-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-prime-black mb-1">Telepon & WhatsApp</h4>
                      <a href="https://wa.me/6281112345678" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-prime-gold transition-colors text-sm leading-relaxed block">
                        +62 811-1234-5678
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-prime-gold/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="size-5 text-prime-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-prime-black mb-1">Email</h4>
                      <a href="mailto:halo@primeproperty.id" className="text-gray-500 hover:text-prime-gold transition-colors text-sm leading-relaxed block">
                        halo@primeproperty.id
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-prime-gold/10 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="size-5 text-prime-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-prime-black mb-1">Jam Operasional</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">Senin - Jumat: 09.00 - 18.00<br/>Sabtu: 09.00 - 15.00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peta */}
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-[300px]">
                <h3 className="font-bold px-4 pt-2 mb-3">Lokasi Kami</h3>
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative">
                  <PropertyLocationMap latitude={officeLocation.lat} longitude={officeLocation.lng} />
                </div>
                <Button variant="outline" className="mt-4 mx-4 mb-2 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50" asChild>
                  <a href={`https://www.google.com/maps?q=${officeLocation.lat},${officeLocation.lng}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="size-4 mr-2" />
                    Buka di Google Maps
                  </a>
                </Button>
              </div>

            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer component already added in _app.tsx so we omit it here unless there's a specific reason. 
          Ah, I see `</footer>` was left in the original contact.tsx at line 192, which was a syntax error.
          I will leave it clean without footer since _app.tsx handles it. */}
    </div>
  );
}
