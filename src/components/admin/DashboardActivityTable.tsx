"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, CheckCircle2, Clock } from "lucide-react";

interface ActivityData {
  id: string;
  header: string;
  sectionType: string;
  status: string;
  target: string;
  reviewer: string;
}

export function DashboardActivityTable() {
  const [data, setData] = useState<ActivityData[]>([]);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard/activity");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
          setRole(json.role);
        }
      } catch (error) {
        console.error("Failed to fetch activity data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="animate-pulse bg-muted h-6 w-48 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-muted h-4 w-72 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Menyesuaikan judul tabel dengan role user
  const title = role === "superadmin" ? "Audit & Activity Logs" : "Recent Inquiries & Leads";
  const description = role === "superadmin" 
    ? "Lacak aktivitas terbaru dari para Admin." 
    : "Tindak lanjut pesan dari calon prospek.";

  const headerLabel = role === "superadmin" ? "Action" : "Lead Name";
  const sectionTypeLabel = role === "superadmin" ? "Module" : "Contact";
  const reviewerLabel = role === "superadmin" ? "Admin" : "Message Snippet";

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 h-9 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
            Customize Columns
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 border border-amber-200 bg-amber-50 text-amber-900 shadow-sm hover:bg-amber-100 h-9 px-4 py-2 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
            + Add Section
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="w-[200px]">{headerLabel}</TableHead>
                <TableHead>{sectionTypeLabel}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date / Target</TableHead>
                <TableHead className="hidden md:table-cell">{reviewerLabel}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada aktivitas.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-medium">{item.header}</TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {item.sectionType}
                    </TableCell>
                    <TableCell>
                      {item.status === "Done" ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          <CheckCircle2 className="mr-1 size-3" />
                          Done
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                          <Clock className="mr-1 size-3" />
                          In Process
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {new Date(item.target).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-600 dark:text-zinc-400">
                      {item.reviewer}
                    </TableCell>
                    <TableCell>
                      <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
                        <MoreVertical className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
