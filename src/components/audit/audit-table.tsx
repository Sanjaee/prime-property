"use client"

import * as React from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { 
  IconEye,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

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
import { Input } from "@/components/ui/input"
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
  
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true }
  ])
  const [globalSearch, setGlobalSearch] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create": return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-transparent">Create</Badge>
      case "update": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent">Update</Badge>
      case "delete": return <Badge className="bg-[#B33A3A] text-white hover:bg-[#B33A3A]/90 border-transparent">Delete</Badge>
      default: return <Badge variant="outline">{action}</Badge>
    }
  }

  const renderJsonViewer = (dataStr: string | null) => {
    if (!dataStr) return <span className="text-muted-foreground italic">Tidak ada data</span>
    try {
      const parsed = JSON.parse(dataStr)
      return (
        <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto w-full border border-gray-100">
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

  const SortableHeader = ({ column, title }: { column: any, title: string }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 flex items-center gap-1 hover:bg-muted -ml-4"
      >
        {title}
        {column.getIsSorted() === "asc" ? (
          <IconArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <IconArrowDown className="h-4 w-4" />
        ) : null}
      </Button>
    )
  }

  const columns: ColumnDef<AuditLogRow>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} title="Waktu" />,
      cell: ({ row }) => (
        <div className="whitespace-nowrap font-medium text-sm">
          {format(new Date(row.original.createdAt), "dd MMMM yyyy, HH:mm", { locale: localeId })} WIB
        </div>
      ),
      filterFn: "includesString",
    },
    {
      id: "pengguna",
      accessorFn: (row) => `${row.userFullName || ""} ${row.userEmail || ""}`,
      header: "Pengguna",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-prime-black">{row.original.userFullName || "Sistem"}</span>
          <span className="text-xs text-muted-foreground">{row.original.userEmail || "Auto-generated"}</span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: ({ column }) => <SortableHeader column={column} title="Aksi" />,
      cell: ({ row }) => getActionBadge(row.original.action),
    },
    {
      accessorKey: "tableName",
      header: ({ column }) => <SortableHeader column={column} title="Modul" />,
      cell: ({ row }) => <div className="capitalize font-medium">{row.original.tableName}</div>,
    },
    {
      id: "actions",
      header: "Detail",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedLog(row.original)}
          className="h-8 shadow-sm"
        >
          <IconEye className="h-4 w-4 mr-2 text-muted-foreground" />
          Lihat Data
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: globalSearch,
      pagination: hidePagination ? { pageIndex: 0, pageSize: data.length } : pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalSearch,
    onPaginationChange: setPagination,
  })

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Cari log aktivitas..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="max-w-sm h-9 bg-white"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 text-foreground border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="py-2 h-10 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data audit log ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!hidePagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            Total {table.getFilteredRowModel().rows.length} baris data.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Baris per halaman
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
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
