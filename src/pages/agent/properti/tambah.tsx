import React from "react"
import type { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import Head from "next/head"
import { useRouter } from "next/router"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PropertiForm } from "@/components/properti/PropertiForm"
import { PropertiFormValues } from "@/lib/validations/properti"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TambahPropertiPage() {
  const router = useRouter()

  const handleSave = async (values: PropertiFormValues) => {
    try {
      const res = await fetch("/api/properti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menyimpan")
      }

      toast.success("Berhasil ditambahkan")
      router.push("/agent/properti")
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const handleCancel = () => {
    router.push("/agent/properti")
  }

  return (
    <>
      <Head>
        <title>Tambah Properti - Prime Property</title>
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
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-prime-black" asChild>
                <Link href="/agent/properti">
                  <IconArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </Button>
            </div>
            <PropertiForm onSave={handleSave} onCancel={handleCancel} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session || session.user.role !== "superadmin") {
    return {
      redirect: {
        destination: "/agent/properti",
        permanent: false,
      },
    }
  }

  return { props: {} }
}
