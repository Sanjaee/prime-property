import * as React from "react"
import Head from "next/head"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AuditTable, AuditLogRow } from "@/components/audit/audit-table"
import { IconLoader } from "@tabler/icons-react"
import { toast } from "sonner"

export default function AuditLogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = React.useState<AuditLogRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/agent/login")
    } else if (status === "authenticated") {
      if (session.user.role !== "superadmin") {
        router.push("/agent/dashboard")
      } else {
        fetchData()
      }
    }
  }, [status, session])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/audit-logs")
      if (!res.ok) {
        throw new Error("Gagal mengambil data audit log")
      }
      const result = await res.json()
      setData(result.logs || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || (status === "authenticated" && session.user.role !== "superadmin")) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Audit Log - Prime Property</title>
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
            <div className="w-full flex-col justify-start gap-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
                  <p className="text-muted-foreground mt-1">
                    Pantau riwayat perubahan data pada sistem secara menyeluruh.
                  </p>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64 border rounded-md">
                    <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <AuditTable data={data} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
