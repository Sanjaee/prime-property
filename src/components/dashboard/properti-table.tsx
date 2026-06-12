"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconFilter,
  IconX,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  FilterFn,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/router"
import { useDebounce } from "use-debounce"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// Format rupiah
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

interface PropertiTableProps {
  data: any[]
  userRole: string
  onEdit: (properti: any) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onRowClick?: (properti: any) => void
}

export function PropertiTable({
  data: initialData,
  userRole,
  onEdit,
  onDelete,
  onAdd,
  onRowClick,
}: PropertiTableProps) {
  const router = useRouter()
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  })

  // Advanced Filters State
  const [globalSearch, setGlobalSearch] = React.useState("")
  const [filterKawasan, setFilterKawasan] = React.useState<string[]>([])
  const [filterLebarMin, setFilterLebarMin] = React.useState("")
  const [filterHadap, setFilterHadap] = React.useState<string[]>([])
  const [filterHargaMax, setFilterHargaMax] = React.useState("")
  const [filterTipe, setFilterTipe] = React.useState("all")
  const [filterStatus, setFilterStatus] = React.useState("all")
  const [filterSiap, setFilterSiap] = React.useState<string[]>([])
  const [filterCarport, setFilterCarport] = React.useState("all") // "all", "ya", "tidak"

  const [debouncedSearch] = useDebounce(globalSearch, 300)
  const [debouncedLebarMin] = useDebounce(filterLebarMin, 300)
  const [debouncedHargaMax] = useDebounce(filterHargaMax, 300)

  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  // Initialize filters from URL
  React.useEffect(() => {
    if (router.isReady) {
      const q = router.query
      if (q.search) setGlobalSearch(q.search as string)
      if (q.kawasan) setFilterKawasan((q.kawasan as string).split(","))
      if (q.lebarMin) setFilterLebarMin(q.lebarMin as string)
      if (q.hadap) setFilterHadap((q.hadap as string).split(","))
      if (q.hargaMax) setFilterHargaMax(q.hargaMax as string)
      if (q.tipe) setFilterTipe(q.tipe as string)
      if (q.status) setFilterStatus(q.status as string)
      if (q.siap) setFilterSiap((q.siap as string).split(","))
      if (q.carport) setFilterCarport(q.carport as string)
      
      if (q.pageIndex) setPagination(p => ({ ...p, pageIndex: Number(q.pageIndex) }))
      if (q.pageSize) setPagination(p => ({ ...p, pageSize: Number(q.pageSize) }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  // Sync to URL
  React.useEffect(() => {
    if (!router.isReady) return

    const query: any = {}
    if (debouncedSearch) query.search = debouncedSearch
    if (filterKawasan.length > 0) query.kawasan = filterKawasan.join(",")
    if (debouncedLebarMin) query.lebarMin = debouncedLebarMin
    if (filterHadap.length > 0) query.hadap = filterHadap.join(",")
    if (debouncedHargaMax) query.hargaMax = debouncedHargaMax
    if (filterTipe !== "all") query.tipe = filterTipe
    if (filterStatus !== "all") query.status = filterStatus
    if (filterSiap.length > 0) query.siap = filterSiap.join(",")
    if (filterCarport !== "all") query.carport = filterCarport
    
    if (pagination.pageIndex !== 0) query.pageIndex = pagination.pageIndex
    if (pagination.pageSize !== 50) query.pageSize = pagination.pageSize

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filterKawasan,
    debouncedLebarMin,
    filterHadap,
    debouncedHargaMax,
    filterTipe,
    filterStatus,
    filterSiap,
    filterCarport,
    pagination.pageIndex,
    pagination.pageSize
  ])

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Filter Data
  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      // Global Search: name + group + kawasan
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const kawasanStr = Array.isArray(item.kawasan) ? item.kawasan.join(" ") : ""
        const combined = `${item.name} ${item.group || ""} ${kawasanStr}`.toLowerCase()
        if (!combined.includes(query)) return false
      }

      // Kawasan Multi
      if (filterKawasan.length > 0) {
        const itemKawasan = Array.isArray(item.kawasan) ? item.kawasan : []
        const hasMatch = filterKawasan.some(k => itemKawasan.includes(k))
        if (!hasMatch) return false
      }

      // Lebar Min
      if (debouncedLebarMin) {
        if (Number(item.lebar) < Number(debouncedLebarMin)) return false
      }

      // Hadap Multi
      if (filterHadap.length > 0) {
        const itemHadap = Array.isArray(item.hadap) ? item.hadap : []
        const hasMatch = filterHadap.some(h => itemHadap.includes(h))
        if (!hasMatch) return false
      }

      // Harga Max
      if (debouncedHargaMax) {
        if (Number(item.price) > Number(debouncedHargaMax)) return false
      }

      // Tipe
      if (filterTipe !== "all" && item.type !== filterTipe) return false

      // Status
      if (filterStatus !== "all" && item.listingStatus !== filterStatus) return false

      // Siap Multi
      if (filterSiap.length > 0) {
        if (!filterSiap.includes(item.siap)) return false
      }

      // Carport
      if (filterCarport !== "all") {
        const isYes = filterCarport === "ya"
        if (item.hasCarport !== isYes) return false
      }

      return true
    })
  }, [
    data,
    debouncedSearch,
    filterKawasan,
    debouncedLebarMin,
    filterHadap,
    debouncedHargaMax,
    filterTipe,
    filterStatus,
    filterSiap,
    filterCarport
  ])

  const SortableHeader = ({ column, title }: { column: any, title: string }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 flex items-center gap-1 hover:bg-muted"
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

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center pl-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center pl-2" onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Nama Properti" />,
      cell: ({ row }) => <div className="font-medium max-w-[200px] truncate" title={row.original.name}>{row.original.name}</div>,
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => <div>{row.original.group || "-"}</div>,
    },
    {
      id: "kawasan",
      header: "Kawasan",
      cell: ({ row }) => {
        const arr = Array.isArray(row.original.kawasan) ? row.original.kawasan : [];
        return <div className="truncate max-w-[120px]" title={arr.join(", ")}>{arr[0] || "-"} {arr.length > 1 && `(+${arr.length-1})`}</div>
      },
    },
    {
      id: "dimensi",
      header: "Dimensi (LxP)",
      cell: ({ row }) => <div className="whitespace-nowrap">{row.original.lebar} x {row.original.panjang} m</div>,
    },
    {
      accessorKey: "tingkat",
      header: "Tingkat",
      cell: ({ row }) => <div>{row.original.tingkat} Lt</div>,
    },
    {
      accessorKey: "hadap",
      header: "Hadap",
      cell: ({ row }) => {
        const arr = Array.isArray(row.original.hadap) ? row.original.hadap : [];
        return <div className="truncate max-w-[100px]" title={arr.join(", ")}>{arr.join(", ") || "-"}</div>
      },
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 capitalize text-muted-foreground whitespace-nowrap">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <SortableHeader column={column} title="Harga" />,
      cell: ({ row }) => <div className="whitespace-nowrap">{formatRupiah(row.original.price)}</div>,
    },
    {
      accessorKey: "hasCarport",
      header: "Carport",
      cell: ({ row }) => <div>{row.original.hasCarport ? "Ya" : "Tidak"}</div>,
    },
    {
      accessorKey: "listingStatus",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isSoldOut = row.original.listingStatus === "sold_out";
        return (
          <Badge className={isSoldOut ? "bg-[#B33A3A] hover:bg-[#B33A3A]/90 text-white border-transparent" : "bg-green-100 hover:bg-green-200 text-green-800 font-medium border-transparent"}>
            {isSoldOut ? "Sold Out" : "In Stock"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "siap",
      header: "Kesiapan",
      cell: ({ row }) => {
        let color = "bg-[#F5F5F5] text-[#1A1A1A] border-[#E5E1DA]";
        if (row.original.siap === "siap_huni") color = "bg-[#C9A961] hover:bg-[#C9A961]/90 text-[#1A1A1A] border-transparent font-medium";
        else if (row.original.siap === "siap_kosong") color = "bg-purple-100 hover:bg-purple-200 text-purple-800 border-transparent font-medium";
        else if (row.original.siap === "siap_huni_renovasi") color = "bg-[#1A1A1A] hover:bg-black text-[#C9A961] border-transparent font-medium";
        
        return (
          <Badge className={`${color} whitespace-nowrap`}>
            {row.original.siap.replace(/_/g, " ")}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (userRole !== "superadmin") return null;
        return (
          <div className="flex items-center justify-end gap-1 pr-2" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-prime-black hover:bg-gray-100"
              onClick={() => onEdit(row.original)}
              title="Edit"
            >
              <IconEdit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-destructive"
                  title="Delete"
                >
                  <IconTrash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Yakin hapus properti <strong>{row.original.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(row.original.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Active filter chips
  const activeFilters = []
  if (filterKawasan.length > 0) activeFilters.push({ label: `Kawasan: ${filterKawasan.join(", ")}`, onRemove: () => setFilterKawasan([]) })
  if (debouncedLebarMin) activeFilters.push({ label: `Min Lebar: ${debouncedLebarMin}m`, onRemove: () => setFilterLebarMin("") })
  if (filterHadap.length > 0) activeFilters.push({ label: `Hadap: ${filterHadap.join(", ")}`, onRemove: () => setFilterHadap([]) })
  if (debouncedHargaMax) activeFilters.push({ label: `Max Harga: Rp ${debouncedHargaMax}`, onRemove: () => setFilterHargaMax("") })
  if (filterTipe !== "all") activeFilters.push({ label: `Tipe: ${filterTipe}`, onRemove: () => setFilterTipe("all") })
  if (filterStatus !== "all") activeFilters.push({ label: `Status: ${filterStatus.replace("_", " ")}`, onRemove: () => setFilterStatus("all") })
  if (filterSiap.length > 0) activeFilters.push({ label: `Siap: ${filterSiap.join(", ").replace(/_/g, " ")}`, onRemove: () => setFilterSiap([]) })
  if (filterCarport !== "all") activeFilters.push({ label: `Carport: ${filterCarport}`, onRemove: () => setFilterCarport("all") })

  const resetFilters = () => {
    setGlobalSearch("")
    setFilterKawasan([])
    setFilterLebarMin("")
    setFilterHadap([])
    setFilterHargaMax("")
    setFilterTipe("all")
    setFilterStatus("all")
    setFilterSiap([])
    setFilterCarport("all")
  }

  return (
    <div className="w-full flex-col justify-start gap-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-6 gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Listing Properti</h2>
        {userRole === "superadmin" && (
          <Button size="sm" onClick={onAdd} className="bg-[#C9A961] hover:brightness-95 text-[#1A1A1A] font-bold shadow-md">
            <IconPlus className="mr-2 h-4 w-4" /> Tambah Properti
          </Button>
        )}
      </div>

      <div className="px-4 lg:px-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            placeholder="Cari nama, group, atau kawasan..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full sm:max-w-md h-10"
          />
          <Button 
            variant="outline" 
            className={`h-10 ${isFilterOpen ? 'bg-muted' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <IconFilter className="mr-2 h-4 w-4" /> Filter Lanjutan
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 ml-auto">
                <IconLayoutColumns className="mr-2 h-4 w-4" /> Kolom
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onClick={(e) => {
                        e.preventDefault()
                        column.toggleVisibility(!column.getIsVisible())
                      }}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                      />
                      {column.id}
                    </DropdownMenuItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="p-4 bg-muted/30 border rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Kawasan */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Kawasan</Label>
              <Input 
                placeholder="Krakatau, Pancing (Koma dipisah)" 
                value={filterKawasan.join(", ")}
                onChange={e => setFilterKawasan(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                className="h-9 bg-white"
              />
            </div>
            
            {/* Hadap */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Arah Hadap</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Utara", "Selatan", "Timur", "Barat"].map(h => (
                  <div key={h} className="flex items-center space-x-1.5">
                    <Checkbox 
                      id={`hadap-${h}`} 
                      checked={filterHadap.includes(h)} 
                      onCheckedChange={(c) => {
                        if (c) setFilterHadap([...filterHadap, h])
                        else setFilterHadap(filterHadap.filter(x => x !== h))
                      }} 
                    />
                    <Label htmlFor={`hadap-${h}`} className="text-sm cursor-pointer">{h}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Siap */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Kesiapan</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: "siap_huni", label: "Huni" },
                  { id: "siap_kosong", label: "Kosong" },
                  { id: "siap_huni_renovasi", label: "Renovasi" },
                ].map(s => (
                  <div key={s.id} className="flex items-center space-x-1.5">
                    <Checkbox 
                      id={`siap-${s.id}`} 
                      checked={filterSiap.includes(s.id)} 
                      onCheckedChange={(c) => {
                        if (c) setFilterSiap([...filterSiap, s.id])
                        else setFilterSiap(filterSiap.filter(x => x !== s.id))
                      }} 
                    />
                    <Label htmlFor={`siap-${s.id}`} className="text-sm cursor-pointer">{s.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Numerik */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Min Lebar (m)</Label>
              <Input 
                type="number"
                placeholder="Contoh: 4" 
                value={filterLebarMin}
                onChange={e => setFilterLebarMin(e.target.value)}
                className="h-9 bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Max Harga</Label>
              <Input 
                type="number"
                placeholder="Rp Tanpa batas" 
                value={filterHargaMax}
                onChange={e => setFilterHargaMax(e.target.value)}
                className="h-9 bg-white"
              />
            </div>

            {/* Radios */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Tipe</Label>
              <RadioGroup value={filterTipe} onValueChange={setFilterTipe} className="flex gap-3">
                <div className="flex items-center space-x-1"><RadioGroupItem value="all" id="t-all" /><Label htmlFor="t-all">Semua</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="ruko" id="t-ruko" /><Label htmlFor="t-ruko">Ruko</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="villa" id="t-villa" /><Label htmlFor="t-villa">Villa</Label></div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Status</Label>
              <RadioGroup value={filterStatus} onValueChange={setFilterStatus} className="flex gap-3">
                <div className="flex items-center space-x-1"><RadioGroupItem value="all" id="s-all" /><Label htmlFor="s-all">Semua</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="in_stock" id="s-in" /><Label htmlFor="s-in">In Stock</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="sold_out" id="s-out" /><Label htmlFor="s-out">Sold Out</Label></div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Carport</Label>
              <RadioGroup value={filterCarport} onValueChange={setFilterCarport} className="flex gap-3">
                <div className="flex items-center space-x-1"><RadioGroupItem value="all" id="c-all" /><Label htmlFor="c-all">Semua</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="ya" id="c-ya" /><Label htmlFor="c-ya">Ya</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="tidak" id="c-tidak" /><Label htmlFor="c-tidak">Tidak</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filter aktif:</span>
            {activeFilters.map((filter, i) => (
              <Badge key={i} variant="secondary" className="px-2 py-0.5 flex items-center gap-1 bg-white border border-gray-200">
                {filter.label}
                <button onClick={filter.onRemove} className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-gray-100">
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 text-xs px-2 text-muted-foreground">
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50 text-foreground border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan} className="py-2 h-10 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
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
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris terpilih.
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
                  {[25, 50, 100].map((pageSize) => (
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
      </div>
    </div>
  )
}
