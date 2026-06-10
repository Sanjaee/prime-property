import * as React from "react"
import Head from "next/head"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UsersTable, UserRow } from "@/components/users/users-table"
import { AdminCreateDialog } from "@/components/users/admin-create-dialog"
import { Button } from "@/components/ui/button"
import { IconPlus, IconLoader } from "@tabler/icons-react"
import { toast } from "sonner"

export default function UsersPage() {
  const [data, setData] = React.useState<UserRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil data admin")
      }
      
      setData(result.users)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>
      <Head>
        <title>Manajemen Admin - Prime Property</title>
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
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Admin</h2>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                    <IconPlus className="mr-2 h-4 w-4" /> Tambah Admin
                  </Button>
                </div>
              </div>

              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Daftar Admin Sistem</h3>
                  <p className="text-sm text-muted-foreground">Kelola akun admin yang memiliki akses ke portal internal.</p>
                </div>
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <UsersTable data={data} onRefresh={fetchData} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <AdminCreateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={() => {
          setIsDialogOpen(false)
          fetchData()
        }}
      />
    </>
  )
}
