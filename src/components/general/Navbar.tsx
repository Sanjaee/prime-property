"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMapUI, type MapStyleKey } from "@/components/contex/MapUIContext";
import { LogOut, User, Settings, Moon, Sun, Plus, Map, Check, Globe, Shield, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const mapUI = useMapUI();
  const router = useRouter();
  const isLoading = status === "loading";

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: router.asPath });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-prime-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="hover:opacity-80 transition-opacity focus:outline-none"
          >
            <img src="/logo.avif" alt="Prime Property Logo" className="h-8 w-auto" />
          </button>

          {/* Public Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-sm font-medium hover:text-prime-gold"
              onClick={() => router.push("/")}
            >
              Beranda
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium hover:text-prime-gold"
              onClick={() => router.push("/properti")}
            >
              Properti
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium hover:text-prime-gold"
              onClick={() => router.push("/about")}
            >
              Tentang Kami
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium hover:text-prime-gold"
              onClick={() => router.push("/contact")}
            >
              Kontak
            </Button>
          </div>
        </div>

        {/* Right side - Auth & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-6 pt-12">
                <nav className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start text-base font-medium w-full py-6 rounded-xl"
                    onClick={() => router.push("/")}
                  >
                    Beranda
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-base font-medium w-full py-6 rounded-xl"
                    onClick={() => router.push("/properti")}
                  >
                    Properti
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-base font-medium w-full py-6 rounded-xl"
                    onClick={() => router.push("/about")}
                  >
                    Tentang Kami
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-base font-medium w-full py-6 rounded-xl"
                    onClick={() => router.push("/contact")}
                  >
                    Kontak
                  </Button>

                  {!session?.user && (
                    <Button
                      onClick={() => router.push("/agent/login")}
                      className="w-full bg-prime-gold hover:bg-[#d4af37] text-prime-black font-bold mt-6 py-6 rounded-xl text-base shadow-sm"
                    >
                      Login Agent
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>


          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-background ring-ring">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col space-y-1 p-0">
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user.image || undefined}
                        alt={session.user.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {session.user.name || "User"}
                      </span>
                      {session.user.email && (
                        <span className="text-xs font-normal text-muted-foreground">
                          {session.user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mapUI && (
                  <>
                    <DropdownMenuItem
                      onClick={() => mapUI.setShowViewportOverlay(!mapUI.showViewportOverlay)}
                      className="cursor-pointer justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Map className="h-4 w-4" />
                        Viewport (lng, lat, zoom)
                      </span>
                      {mapUI.showViewportOverlay && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <Globe className="mr-2 h-4 w-4" />
                        Gaya Peta
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={mapUI.mapStyle}
                          onValueChange={(v) => mapUI.setMapStyle(v as MapStyleKey)}
                        >
                          <DropdownMenuRadioItem value="default" className="cursor-pointer">
                            Default (Carto)
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="openstreetmap" className="cursor-pointer">
                            OpenStreetMap
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="openstreetmap3d" className="cursor-pointer">
                            OpenStreetMap 3D
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/agent/dashboard")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  variant="destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => router.push("/agent/login")}
              variant="outline"
              className="hidden md:inline-flex border-prime-gold text-prime-gold hover:bg-prime-gold hover:text-prime-white"
            >
              Login Agent
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

