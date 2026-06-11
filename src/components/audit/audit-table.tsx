"use client"

import * as React from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { 
  IconEye,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight
} from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface AuditLogRow {
  id: string
  userFullName: string | null
  userEmail: string | null
  tableName: string
  recordId: string
  action: "create" | "update" | "delete" | "restore"
  oldData: string | null
  newData: string | null
  changedFields: string | null
  ipAddress: string | null
  createdAt: string
}

interface AuditTableProps {
  data: AuditLogRow[]
  hidePagination?: boolean
}

export function AuditTable({ data, hidePagination }: AuditTableProps) {
  const [selectedLog, setSelectedLog] = React.useState<AuditLogRow | null>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const total = data.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create": return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Create</Badge>
      case "update": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Update</Badge>
      case "delete": return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Delete</Badge>
      default: return <Badge variant="outline">{action}</Badge>
    }
  }

  const renderJsonViewer = (dataStr: string | null) => {
    if (!dataStr) return <span className="text-muted-foreground italic">Tidak ada data</span>
    try {
      const parsed = JSON.parse(dataStr)
      return (
        <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto w-full">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )
    } catch {
      return <span>{dataStr}</span>
    }
  }

  const renderChangedFields = (fieldsStr: string | null) => {
    if (!fieldsStr) return null
    try {
      const parsed = JSON.parse(fieldsStr) as string[]
      if (parsed.length === 0) return null
      return (
        <div className="flex flex-wrap gap-1">
          {parsed.map(f => (
            <Badge key={f} variant="secondary" className="text-xs font-normal">
              {f}
            </Badge>
          ))}
        </div>
      )
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted text-foreground">
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Modul</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Tidak ada data audit log ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.userFullName || "Sistem"}</span>
                      <span className="text-xs text-muted-foreground">{log.userEmail || "Auto-generated"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="capitalize">{log.tableName}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      <IconEye className="h-4 w-4 mr-2" />
                      Lihat Data
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!hidePagination && (
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
                  setPageSize(Number(value))
                  setPage(1)
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
              Page {page} of {totalPages}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || total === 0}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || total === 0}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!selectedLog} onOpenChange={(val) => !val && setSelectedLog(null)}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detail Log Perubahan
              {selectedLog && getActionBadge(selectedLog.action)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">ID Data:</span>
                  <code className="bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded text-xs">{selectedLog.recordId}</code>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">IP Address:</span>
                  <span>{selectedLog.ipAddress || "-"}</span>
                </div>
              </div>

              {selectedLog.action === "update" && (
                <div>
                  <span className="text-muted-foreground block mb-2 font-medium">Field yang diubah:</span>
                  {renderChangedFields(selectedLog.changedFields) || <span className="text-xs text-muted-foreground italic">Tidak ada perubahan field spesifik terdeteksi</span>}
                </div>
              )}

              <div className={`grid gap-4 ${selectedLog.action === "update" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {(selectedLog.action === "update" || selectedLog.action === "delete") && (
                  <div className="space-y-2 w-full">
                    <h4 className="font-semibold text-sm">Data Sebelumnya (Old Data)</h4>
                    {renderJsonViewer(selectedLog.oldData)}
                  </div>
                )}
                
                {(selectedLog.action === "update" || selectedLog.action === "create") && (
                  <div className="space-y-2 w-full">
                    <h4 className="font-semibold text-sm">Data Baru (New Data)</h4>
                    {renderJsonViewer(selectedLog.newData)}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
