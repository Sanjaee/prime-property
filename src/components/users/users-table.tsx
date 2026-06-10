"use client"

import * as React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  IconDotsVertical,
  IconKey,
  IconShieldLock,
  IconUserCheck,
  IconUserX,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/alert-dialog"

export interface UserRow {
  id: string
  fullName: string
  email: string
  userType: "admin" | "superadmin"
  isActive: boolean
  createdAt: string
}

interface UsersTableProps {
  data: UserRow[]
  onRefresh: () => void
}

export function UsersTable({ data, onRefresh }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [resetUser, setResetUser] = React.useState<UserRow | null>(null)
  const [newPassword, setNewPassword] = React.useState("")
  const [isResetting, setIsResetting] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const filteredData = data.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleActive = async (user: UserRow) => {
    if (user.userType === "superadmin") {
      toast.error("Tidak dapat menonaktifkan Superadmin")
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-active", isActive: !user.isActive }),
      })
      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error || "Gagal mengubah status")
      
      toast.success(result.message)
      onRefresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleResetPassword = async () => {
    if (!resetUser) return
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter")
      return
    }

    setIsResetting(true)
    try {
      const response = await fetch(`/api/admin/users/${resetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", password: newPassword }),
      })
      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error || "Gagal mereset password")
      
      toast.success(result.message)
      setResetUser(null)
      setNewPassword("")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Cari nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm h-9"
          autoComplete="off"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tgl. Bergabung</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Tidak ada data admin ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.userType === "superadmin" ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">Superadmin</Badge>
                    ) : (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
                    ) : (
                      <Badge variant="destructive">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "dd MMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => setResetUser(user)}
                        title="Reset Password"
                      >
                        <IconKey className="h-4 w-4" />
                        <span className="sr-only">Reset Password</span>
                      </Button>
                      
                      {user.userType !== "superadmin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {user.isActive ? (
                            <IconUserX className="h-4 w-4 text-destructive" />
                          ) : (
                            <IconUserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reset Password Dialog */}
      <AlertDialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Masukkan password baru untuk akun <strong>{resetUser?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 relative">
            {/* Hidden input to prevent aggressive browser autofill */}
            <input type="text" name="username" autoComplete="username" className="hidden" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password baru (min 6 karakter)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-4 h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <Button onClick={handleResetPassword} disabled={isResetting || newPassword.length < 6}>
              {isResetting ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
