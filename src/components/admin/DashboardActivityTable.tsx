"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, CheckCircle2, Clock } from "lucide-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/dashboard/activity?page=${page}&limit=${pageSize}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
          setRole(json.role);
          setTotal(json.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch activity data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, pageSize]);

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

        <div className="flex items-center justify-between pt-4 mt-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            Total {total} record(s).
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={`${pageSize}`} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {page} of {Math.ceil(total / pageSize) || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(1)}
                disabled={page <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={page >= Math.ceil(total / pageSize) || total === 0}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(Math.ceil(total / pageSize))}
                disabled={page >= Math.ceil(total / pageSize) || total === 0}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
