import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiProvider } from "@/components/contex/ApiProvider";
import { MapUIProvider } from "@/components/contex/MapUIContext";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import LoadingBar from "react-top-loading-bar";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    router.events.on("routeChangeStart", () => setProgress(40));
    router.events.on("routeChangeComplete", () => setProgress(100));
    router.events.on("routeChangeError", () => setProgress(100));

    return () => {
      router.events.off("routeChangeStart", () => setProgress(40));
      router.events.off("routeChangeComplete", () => setProgress(100));
      router.events.off("routeChangeError", () => setProgress(100));
    };
  }, [router]);

  return (
    <div className={cn(geistSans.variable, geistMono.variable)}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        <SessionProvider session={session}>
          <ApiProvider>
            <MapUIProvider>
              <TooltipProvider>
                <LoadingBar
                  color="#D4AF37" // prime-gold
                  height={3}
                  progress={progress}
                  onLoaderFinished={() => setProgress(0)}
                />
                <Component {...pageProps} />
                <Toaster />
              </TooltipProvider>
            </MapUIProvider>
          </ApiProvider>
        </SessionProvider>
      </ThemeProvider>
    </div>
  );
}
