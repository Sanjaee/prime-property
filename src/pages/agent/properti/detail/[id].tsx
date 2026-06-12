import React, { useEffect, useState } from "react"
import type { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import Head from "next/head"
import { useRouter } from "next/router"
import { toast } from "sonner"
import Link from "next/link"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { 
  IconLoader, IconArrowLeft, IconMapPin, IconEdit, IconTrash,
  IconBed, IconBath, IconRulerMeasure, IconHome, IconCar,
  IconWind, IconWifi, IconBolt, IconDroplet, IconTrees,
  IconPool, IconShield, IconCertificate, IconCalendar
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DetailPropertiPageProps {
  userRole: string
}

export default function DetailPropertiPage({ userRole }: DetailPropertiPageProps) {
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/properti/${id}`)
      if (!res.ok) throw new Error("Gagal mengambil data properti")
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (router.isReady) fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, id])

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/properti/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menghapus")
      }
      toast.success("Berhasil dihapus")
      router.push("/agent/properti")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!data) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p>Data tidak ditemukan.</p>
            <Button onClick={() => router.push("/agent/properti")}>Kembali</Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <>
      <Head>
        <title>{data.name} - Detail Properti</title>
      </Head>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 max-w-6xl mx-auto w-full">
            
            {/* Header / Nav */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-prime-black" asChild>
                <Link href="/agent/properti">
                  <IconArrowLeft className="h-4 w-4" />
                  Kembali ke Listing
                </Link>
              </Button>

              {userRole === "superadmin" && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href={`/agent/properti/edit/${data.id}`}>
                      <IconEdit className="h-4 w-4" /> Edit Properti
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <IconTrash className="h-4 w-4" /> Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Yakin hapus properti <strong>{data.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {/* Layout 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Kolom 1: Info Utama & Gambar */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={data.listingStatus === "sold_out" ? "bg-[#B33A3A]" : "bg-green-100 text-green-800"}>
                      {data.listingStatus === "sold_out" ? "Sold Out" : "In Stock"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">{data.type}</Badge>
                    <Badge className="bg-[#F5F5F5] text-prime-black border-transparent">
                      {data.siap?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold font-serif mb-2">{data.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mb-6">
                    <IconMapPin className="h-4 w-4" />
                    {data.address}, {data.district}, {data.city}, {data.province}
                  </p>

                  {/* Gambar (Jika ada) */}
                  {data.imageUrls && data.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {data.imageUrls.map((url: string, idx: number) => (
                        <div key={idx} className={`rounded-xl overflow-hidden bg-muted ${idx === 0 ? 'col-span-2 h-64 md:h-96' : 'h-32 md:h-48'}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Gambar ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center mb-6 text-muted-foreground">
                      Tidak ada gambar
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b pb-2">Deskripsi</h3>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{data.description || "-"}</p>
                  </div>

                  {data.detail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t">
                      <div className="space-y-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                        <h4 className="font-bold flex items-center gap-2">
                          <IconHome className="h-5 w-5 text-gray-500" />
                          Interior
                        </h4>
                        <div className="space-y-3">
                          {data.detail.bedroomCount != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconBed className="h-4 w-4" /> Kamar Tidur</span>
                              <span className="font-semibold">{data.detail.bedroomCount}</span>
                            </div>
                          )}
                          {data.detail.bathroomCount != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconBath className="h-4 w-4" /> Kamar Mandi</span>
                              <span className="font-semibold">{data.detail.bathroomCount}</span>
                            </div>
                          )}
                          {data.detail.buildingArea != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconRulerMeasure className="h-4 w-4" /> Luas Bangunan</span>
                              <span className="font-semibold">{Number(data.detail.buildingArea).toLocaleString("id-ID")} m²</span>
                            </div>
                          )}
                          {data.detail.electricityCapacity != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconBolt className="h-4 w-4" /> Listrik</span>
                              <span className="font-semibold">{data.detail.electricityCapacity} VA</span>
                            </div>
                          )}
                          {data.detail.waterSource && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconDroplet className="h-4 w-4" /> Sumber Air</span>
                              <span className="font-semibold">{data.detail.waterSource}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {data.detail.isFurnished && <Badge variant="secondary" className="font-normal"><IconHome className="w-3 h-3 mr-1"/> Furnished</Badge>}
                            {data.detail.hasAc && <Badge variant="secondary" className="font-normal"><IconWind className="w-3 h-3 mr-1"/> AC</Badge>}
                            {data.detail.hasWifi && <Badge variant="secondary" className="font-normal"><IconWifi className="w-3 h-3 mr-1"/> Wi-Fi</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                        <h4 className="font-bold flex items-center gap-2">
                          <IconTrees className="h-5 w-5 text-gray-500" />
                          Eksterior
                        </h4>
                        <div className="space-y-3">
                          {data.detail.landArea != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconRulerMeasure className="h-4 w-4" /> Luas Tanah</span>
                              <span className="font-semibold">{Number(data.detail.landArea).toLocaleString("id-ID")} m²</span>
                            </div>
                          )}
                          {data.detail.condition && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconHome className="h-4 w-4" /> Kondisi</span>
                              <span className="font-semibold capitalize">{data.detail.condition}</span>
                            </div>
                          )}
                          {data.detail.certificateType && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconCertificate className="h-4 w-4" /> Sertifikat</span>
                              <span className="font-semibold">{data.detail.certificateType}</span>
                            </div>
                          )}
                          {data.detail.yearBuilt != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconCalendar className="h-4 w-4" /> Dibangun</span>
                              <span className="font-semibold">{data.detail.yearBuilt}</span>
                            </div>
                          )}
                          {(data.detail.garageCount != null || data.detail.carportCount != null) && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><IconCar className="h-4 w-4" /> Kendaraan</span>
                              <span className="font-semibold">Gr: {data.detail.garageCount||0}, Cp: {data.detail.carportCount||0}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {data.detail.hasGarden && <Badge variant="secondary" className="font-normal"><IconTrees className="w-3 h-3 mr-1"/> Taman</Badge>}
                            {data.detail.hasSwimmingPool && <Badge variant="secondary" className="font-normal"><IconPool className="w-3 h-3 mr-1"/> Kolam</Badge>}
                            {data.detail.hasSecurity && <Badge variant="secondary" className="font-normal"><IconShield className="w-3 h-3 mr-1"/> Security</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 2: Spesifikasi Detail */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Harga</h3>
                    <p className="text-3xl font-bold text-prime-black">
                      Rp {Number(data.price).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-bold mb-3">Spesifikasi</h3>
                    
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Dimensi (L x P)</span>
                      <span className="font-medium">{data.lebar} x {data.panjang} m</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Tingkat</span>
                      <span className="font-medium">{data.tingkat} Lantai</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Arah Hadap</span>
                      <span className="font-medium">{data.hadap?.join(", ") || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Carport</span>
                      <span className="font-medium">{data.hasCarport ? "Ya" : "Tidak"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Group</span>
                      <span className="font-medium">{data.group || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Unit Khusus</span>
                      <span className="font-medium">{data.unit || "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-bold mb-3">Kawasan</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.kawasan?.map((kws: string, i: number) => (
                        <Badge key={i} variant="secondary">{kws}</Badge>
                      ))}
                      {(!data.kawasan || data.kawasan.length === 0) && <span className="text-muted-foreground">-</span>}
                    </div>
                  </div>

                  {data.mapsLink && (
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={data.mapsLink} target="_blank" rel="noopener noreferrer">
                          <IconMapPin className="h-4 w-4 text-blue-500" /> Buka di Google Maps
                        </a>
                      </Button>
                    </div>
                  )}

                  {data.whatsapp && (
                    <div className="pt-2">
                      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" asChild>
                        <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noopener noreferrer">
                          Hubungi Agen (WA)
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }

  return {
    props: {
      userRole: session.user.role || "admin",
    },
  }
}
