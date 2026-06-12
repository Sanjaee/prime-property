"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, CheckCircle2, Clock } from "lucide-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconLoader } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/audit-table";
import { PropertiTable } from "@/components/dashboard/properti-table";

interface ActivityData {
  id: string;
  header: string;
  sectionType: string;
  status: string;
  target: string;
  reviewer: string;
}

export function DashboardActivityTable() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "";
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!role) return;
      setLoading(true);
      try {
        if (role === "superadmin") {
          const res = await fetch(`/api/admin/dashboard/activity?page=1&limit=10`);
          if (res.ok) {
            const json = await res.json();
            setData(json.data);
          }
        } else if (role === "admin") {
          const res = await fetch(`/api/properti?limit=10`);
          if (res.ok) {
            const json = await res.json();
            // /api/properti returns an array directly, not { data: [...] }
            setData(Array.isArray(json) ? json : []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch activity data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Menyesuaikan judul tabel dengan role user
  const title = role === "superadmin" ? "Audit & Activity Logs" : "Recent Inquiries & Leads";
  const description = role === "superadmin" 
    ? "Lacak aktivitas terbaru dari para Admin." 
    : "Tindak lanjut pesan dari calon prospek.";

  if (role === "superadmin") {
    return (
      <div className="mt-6 px-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <AuditTable data={data} hidePagination={true} />
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="mt-6">
        <PropertiTable 
          data={data} 
          userRole="admin" 
          onEdit={() => {}} 
          onDelete={() => {}} 
          onAdd={() => {}} 
        />
      </div>
    );
  }

  return null;
}
