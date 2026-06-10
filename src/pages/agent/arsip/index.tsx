import * as React from "react"
import Head from "next/head"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ArsipTable } from "@/components/dashboard/arsip-table"
import { IconLoader } from "@tabler/icons-react"
import { toast } from "sonner"

export default function ArsipPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [arsipData, setArsipData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/agent/login")
      return
    }

    if (status === "authenticated") {
      if (session.user.role !== "superadmin") {
        router.push("/agent/dashboard")
        return
      }
      fetchArsip()
    }
  }, [status, session, router])

  const fetchArsip = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/properti/arsip")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch arsip")
      setArsipData(data)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Gagal mengambil data arsip")
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/properti/${id}/restore`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal me-restore properti")
      
      toast.success("Properti berhasil di-restore!")
      // Refresh list
      fetchArsip()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message)
    }
  }

  return (
    <>
      <Head>
        <title>Arsip Properti | Prime Property</title>
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
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {status === "loading" || loading ? (
              <div className="flex items-center justify-center h-64">
                <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ArsipTable
                data={arsipData}
                userRole={session?.user?.role || "admin"}
                onRestore={handleRestore}
              />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
