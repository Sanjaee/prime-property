"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { propertiSchema, type PropertiFormValues } from "@/lib/validations/properti"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

function CommaInput({ value, onChange, placeholder }: { value: string[], onChange: (v: string[]) => void, placeholder?: string }) {
  const [raw, setRaw] = React.useState(value?.join(", ") || "");
  
  React.useEffect(() => {
    // Only update raw if external value changes (like from initialData) and doesn't match our parsed raw
    const parsedRaw = raw.split(",").map(s => s.trim()).filter(Boolean).join(", ");
    const valStr = value?.join(", ") || "";
    if (parsedRaw !== valStr && raw !== "") {
      setRaw(valStr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      placeholder={placeholder}
      value={raw}
      onChange={e => {
        setRaw(e.target.value);
        onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean));
      }}
      onBlur={() => {
        setRaw(value?.join(", ") || "");
      }}
    />
  );
}

interface PropertiFormProps {
  initialData?: any
  onSave: (data: PropertiFormValues) => Promise<void>
  onCancel: () => void
}

export function PropertiForm({ initialData, onSave, onCancel }: PropertiFormProps) {
  const isEditing = !!initialData

  const form = useForm<PropertiFormValues>({
    resolver: zodResolver(propertiSchema) as any,
    defaultValues: {
      name: "",
      group: "",
      lebar: 0,
      panjang: 0,
      hadap: [],
      type: "house",
      tingkat: 1,
      priceRupiah: 0,
      priceUnit: "IDR",
      hasCarport: false,
      listingStatus: "in_stock",
      siap: "siap_huni",
      mapsLink: "",
      kawasan: [],
      unit: "",
      description: "",
      address: "",
      province: "",
      city: "",
      district: "",
      latitude: 0,
      longitude: 0,
      postalCode: "",
      listingType: "sale",
      whatsapp: "",
    },
  })

  // Watch all values for real-time preview
  const prop = useWatch({ control: form.control }) || form.getValues()

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        priceRupiah: Number(initialData.priceRupiah || initialData.price),
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: PropertiFormValues) => {
    await onSave(data)
  }

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors)
    toast.error("Gagal menyimpan: Harap periksa kembali isian form yang berwarna merah.")
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      <div className="xl:col-span-2 bg-card rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{isEditing ? "Edit Properti" : "Tambah Properti"}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Ubah detail properti." : "Isi form di bawah ini untuk menambahkan properti baru."}
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col">
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Informasi Dasar */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Properti</FormLabel>
                        <FormControl><Input placeholder="Cluster Mentari" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group (Opsional)</FormLabel>
                        <FormControl><Input placeholder="Tahap 1" {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl><Input placeholder="Deskripsi singkat..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Tipe" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {["house", "apartment", "villa", "land", "commercial", "ruko"].map(t => (
                              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Listing</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jenis" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="sale">Dijual</SelectItem>
                            <SelectItem value="rent">Disewakan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priceRupiah"
                    render={({ field }) => {
                      const displayValue = field.value ? field.value.toLocaleString("id-ID") : "";
                      return (
                        <FormItem>
                          <FormLabel>Harga (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              value={displayValue}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/\./g, "");
                                const numValue = Number(rawValue);
                                if (!isNaN(numValue)) {
                                  field.onChange(numValue);
                                } else if (rawValue === "") {
                                  field.onChange(0);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Spesifikasi */}
              <div className="col-span-2 space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium border-b pb-2">Spesifikasi Detail</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="lebar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lebar (m)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="panjang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Panjang (m)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tingkat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tingkat (Lantai)</FormLabel>
                        <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasCarport"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 shadow-sm md:mt-[30px] h-[40px] bg-white">
                        <FormLabel className="text-sm font-medium cursor-pointer">Carport</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="siap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kesiapan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Kesiapan" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="siap_huni">Siap Huni</SelectItem>
                            <SelectItem value="siap_kosong">Siap Kosong</SelectItem>
                            <SelectItem value="siap_huni_renovasi">Siap Huni Renovasi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="listingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Inventory</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="sold_out">Sold Out</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hadap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arah Hadap</FormLabel>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {(["Utara", "Selatan", "Timur", "Barat"] as const).map((item) => {
                            // Ensure it's an array
                            let currentValues = Array.isArray(field.value) ? field.value : [];
                            if (typeof field.value === "string") {
                              currentValues = (field.value as string).split(",").map(s => s.trim()).filter(Boolean) as typeof currentValues;
                            }
                            
                            const isChecked = currentValues.includes(item);

                            return (
                              <div
                                key={item}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...currentValues, item]);
                                      } else {
                                        field.onChange(currentValues.filter((val) => val !== item));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item}
                                </FormLabel>
                              </div>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div className="col-span-2 space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium border-b pb-2">Lokasi</h3>
                
                <FormField
                  control={form.control}
                  name="kawasan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kawasan (Koma dipisah)</FormLabel>
                      <FormControl>
                        <CommaInput 
                          placeholder="Krakatau, Pancing" 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="province" render={({ field }) => (
                    <FormItem><FormLabel>Provinsi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>Kota</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem><FormLabel>Kecamatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="mapsLink" render={({ field }) => (
                    <FormItem><FormLabel>Link Google Maps (Opsional)</FormLabel><FormControl><Input placeholder="https://maps.google.com/..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="whatsapp" render={({ field }) => (
                    <FormItem><FormLabel>No. WhatsApp Agen (Opsional)</FormLabel><FormControl><Input placeholder="6281234567890" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="latitude" render={({ field }) => (
                    <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="0.000001" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="longitude" render={({ field }) => (
                    <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="0.000001" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-muted/40 flex justify-end gap-2 rounded-b-lg">
              <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Real-time Preview Card */}
      <div className="xl:col-span-1 sticky top-6">
        <h3 className="text-lg font-medium mb-4">Live Preview</h3>
        <div className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="h-48 bg-prime-black relative flex items-end justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initialData?.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
              alt={prop.name || "Preview"}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                {prop.listingStatus === "in_stock" ? "In Stock" : "Sold Out"}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-white/90 backdrop-blur-md text-prime-black text-xs font-bold px-3 py-1 rounded-full border border-gray-200 capitalize shadow-sm">
                {prop.type || "house"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs text-prime-gold font-bold mb-2 uppercase tracking-wider">
              {prop.kawasan && prop.kawasan.length > 0 ? prop.kawasan.join(", ") : prop.district || "Lokasi"}
            </div>
            <h4 className="text-lg font-bold text-prime-black mb-1 line-clamp-1">{prop.name || "Nama Properti"}</h4>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[40px]">
              {prop.description || "Deskripsi properti akan muncul di sini..."}
            </p>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
              {Number(prop.lebar) > 0 && Number(prop.panjang) > 0 && (
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {Number(prop.lebar)}x{Number(prop.panjang)}m
                </span>
              )}
              {Number(prop.tingkat) > 0 && (
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {Number(prop.tingkat)} Lt
                </span>
              )}
              {prop.hasCarport && (
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Carport
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Harga mulai</div>
                <div className="text-prime-black font-bold">
                  Rp {Number(prop.priceRupiah || 0).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-0.5">Kondisi</div>
                <div className="text-sm font-semibold text-prime-gold capitalize">
                  {prop.siap ? prop.siap.replace(/_/g, " ") : prop.unit || prop.group || "Tersedia"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
