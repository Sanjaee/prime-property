import React, { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { LoginForm } from "@/components/auth/LoginForm";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();

  // Handle OAuth errors from URL parameters
  useEffect(() => {
    const { error } = router.query;

    if (error) {
      let errorMessage = "An error occurred during authentication";

      switch (error) {
        case "AccessDenied":
          errorMessage =
            "Email ini sudah terdaftar dengan password. Silakan login dengan email dan password.";
          break;
        case "Configuration":
          errorMessage = "Terjadi masalah pada konfigurasi server. Silakan hubungi admin.";
          break;
        case "Verification":
          errorMessage =
            "Token verifikasi sudah kedaluwarsa atau sudah digunakan.";
          break;
        case "CredentialsSignin":
          errorMessage =
            "Email ini sudah terdaftar dengan Google. Silakan gunakan Google Sign In.";
          break;
        default:
          errorMessage = typeof error === 'string' ? error : "Terjadi kesalahan saat autentikasi. Silakan coba lagi.";
      }

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Clean up the URL by removing the error parameter
      router.replace("/agent/login", undefined, { shallow: true });
    }
  }, [router]);

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Get callback URL from query params or default to dashboard
        const callbackUrl =
          (router.query.callbackUrl as string) || "/agent/dashboard";
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0F0F0F] text-white">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <Link href="/" className="inline-flex items-center justify-center w-fit bg-[#F5F5F5] py-2 px-4 rounded-lg shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Prime Property Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>
          
          <div className="inline-flex items-center rounded-full border border-[#C9A961]/30 bg-[#C9A961]/10 px-2.5 py-0.5 text-xs font-semibold text-[#C9A961] transition-colors mb-6">
            <div className="mr-1 h-1.5 w-1.5 rounded-full bg-[#C9A961]" />
            Portal Agent Khusus
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-2">Portal Agent</h1>
          <h2 className="text-4xl font-bold tracking-tight text-[#C9A961] mb-6">Prime Property</h2>
          
          <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-12">
            Akses katalog properti dengan mudah, temukan lokasi strategis melalui integrasi peta interaktif, dan kelola listing Anda dalam satu dashboard yang efisien.
          </p>

          <div className="space-y-4">
            {[
              "Katalog properti lengkap & terstruktur",
              "Pencarian mudah berdasarkan lokasi peta",
              "Sistem filter detail & akurat",
              "Manajemen listing instan & transparan"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="h-5 w-5 text-[#C9A961]" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10 max-w-md">
          <div>
            <div className="text-2xl font-bold">500+</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Listing Aktif</div>
          </div>
          <div>
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Akses Data</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Transparan</div>
          </div>
        </div>

        <div className="text-xs text-gray-600 mt-12">
          &copy; 2024 Prime Property. Internal Use Only.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex flex-col justify-center items-center p-6 md:p-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/bglogin.webp" 
            alt="Prime Property Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <LoginForm defaultCallbackUrl="/agent/dashboard" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
