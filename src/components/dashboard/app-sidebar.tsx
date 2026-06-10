"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconArchive,
  IconDashboard,
  IconHistory,
  IconHome,
  IconInnerShadowTop,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/dashboard/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/agent/dashboard",
      icon: IconDashboard,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Listing Properti",
      url: "/agent/properti",
      icon: IconHome,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Manajemen Admin",
      url: "/agent/users",
      icon: IconUsers,
      roles: ["superadmin"],
    },
    {
      title: "Audit Log",
      url: "/agent/audit-log",
      icon: IconHistory,
      roles: ["superadmin"],
    },
    {
      title: "Arsip",
      url: "/agent/arsip",
      icon: IconArchive,
      roles: ["superadmin"],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "admin"

  const filteredNavMain = data.navMain.filter((item) => {
    if (userRole !== "superadmin") {
      return item.roles.includes("admin")
    }
    return true
  })

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.avif" alt="Prime Property Logo" className="h-10 w-auto object-contain" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
    </Sidebar>
  )
}
