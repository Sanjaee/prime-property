import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, getFirstZodError, scrollToInvalidField } from "@/lib/schemas";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm = ({ defaultCallbackUrl = "/" }: { defaultCallbackUrl?: string }) => {
  const router = useRouter();

  // Get callback URL from query params or default to dashboard
  const callbackUrl = (router.query.callbackUrl as string) || defaultCallbackUrl;
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      scrollToInvalidField(parsed.error);
      toast({
        title: "Error",
        description: getFirstZodError(parsed.error),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Use NextAuth signIn directly (like zacode)
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.ok) {
        toast({
          title: "✅ Login Berhasil!",
          description: "Selamat datang!",
        });
        router.push(callbackUrl);
      } else {
        // Handle specific errors
        let errorMessage = "Email atau password salah. Silakan coba lagi.";
        let errorTitle = "❌ Login Gagal";

        if (result?.error) {
          const errorStr = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);



          // Check for other specific error messages
          if (errorStr.includes("registered with Google") ||
            errorStr.includes("Please sign in with Google")) {
            errorMessage = "Email ini sudah terdaftar dengan Google. Silakan gunakan tombol 'Masuk dengan Google' untuk login.";
            errorTitle = "⚠️ Tipe Akun Tidak Cocok";
          } else if (errorStr.includes("User not found")) {
            errorMessage = "Email tidak terdaftar. Silakan periksa kembali email Anda atau daftar akun baru.";
            errorTitle = "👤 Email Tidak Ditemukan";
          } else if (errorStr.includes("Invalid password")) {
            errorMessage = "Email atau password salah. Silakan coba lagi.";
            errorTitle = "🔒 Login Gagal";
          } else if (typeof result.error === 'string' && result.error.trim() !== '') {
            errorMessage = result.error;
          }
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "❌ Login Gagal",
        description: "Terjadi kesalahan saat login. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl: callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = "Terjadi kesalahan saat autentikasi Google. Silakan coba lagi.";
        let errorTitle = "❌ Google Sign-In Gagal";

        const errorStr = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);

        // Check for specific error messages
        if (errorStr.includes("already registered with password") ||
          errorStr === "AccessDenied") {
          errorMessage = "Email ini sudah terdaftar dengan password. Silakan login dengan email dan password.";
          errorTitle = "⚠️ Email Sudah Terdaftar";
        } else if (errorStr.includes("different Google account")) {
          errorMessage = "Email ini sudah terdaftar dengan akun Google yang berbeda.";
          errorTitle = "⚠️ Email Sudah Terdaftar";
        } else if (errorStr === "Configuration") {
          errorMessage = "Terjadi masalah pada konfigurasi server. Silakan hubungi admin.";
        } else if (errorStr === "Verification") {
          errorMessage = "Token verifikasi sudah kedaluwarsa atau sudah digunakan.";
        } else if (typeof result.error === 'string' && result.error.trim() !== '') {
          errorMessage = result.error;
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      } else if (result?.ok) {
        // Success - redirect to callback URL
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);

      let errorMessage = "Terjadi kesalahan saat autentikasi Google. Silakan coba lagi.";

      // Handle error object
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as { message?: string };
        if (errorObj.message && typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }

      toast({
        title: "❌ Google Sign-In Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
          Selamat Datang
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 leading-relaxed">
          Silakan masuk untuk mengakses manajemen dashboard agen Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Alamat Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@primeproperty.id"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pr-10 bg-gray-50 border-gray-200"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? "Masuk..." : "Masuk ke Dashboard"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Atau</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            ← Kembali ke situs publik
          </Link>
        </div>



      </CardContent>
    </Card>
  );
};
