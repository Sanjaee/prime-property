import React from "react"
import type { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import Head from "next/head"
import { useRouter } from "next/router"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { IconLoader } from "@tabler/icons-react"

import { PropertiTable } from "@/components/dashboard/properti-table"

interface PropertiPageProps {
  userRole: string
}

export default function PropertiPage({ userRole }: PropertiPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data = [], isLoading: loading, isError, error } = useQuery({
    queryKey: ["properti"],
    queryFn: async () => {
      const res = await fetch("/api/properti")
      if (!res.ok) throw new Error("Gagal mengambil data")
      return res.json()
    }
  })

  React.useEffect(() => {
    if (isError && error) {
      toast.error((error as Error).message)
    }
  }, [isError, error])

  const handleAdd = () => {
    router.push("/agent/properti/tambah")
  }

  const handleEdit = (item: any) => {
    router.push(`/agent/properti/edit/${item.id}`)
  }

  const handleDetail = (item: any) => {
    router.push(`/agent/properti/detail/${item.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/properti/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menghapus")
      }
      toast.success("Berhasil dihapus")
      queryClient.invalidateQueries({ queryKey: ["properti"] })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <Head>
        <title>Listing Properti - Prime Property</title>
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
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <PropertiTable
                data={data}
                userRole={userRole}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRowClick={handleDetail}
              />
            )}
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
