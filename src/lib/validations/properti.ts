import * as z from "zod";

export const propertiSchema = z.object({
  name: z.string()
    .min(3, "Nama properti minimal 3 karakter")
    .max(100, "Nama properti maksimal 100 karakter"),
  group: z.string().optional().nullable(),
  lebar: z.coerce.number().positive("Lebar harus > 0"),
  panjang: z.coerce.number().positive("Panjang harus > 0"),
  hadap: z.array(z.enum(["Utara", "Selatan", "Timur", "Barat"])).min(1, "Minimal pilih 1 arah hadap"),
  type: z.enum(["house", "apartment", "villa", "land", "commercial", "ruko"]),
  tingkat: z.coerce.number().min(1, "Tingkat minimal 1").max(10, "Tingkat maksimal 10"),
  priceRupiah: z.coerce.number().int("Harus berupa angka bulat").positive("Harga harus > 0"),
  priceUnit: z.enum(["IDR", "USD"]).default("IDR"),
  hasCarport: z.boolean().default(false),
  listingStatus: z.enum(["in_stock", "sold_out"]).default("in_stock"),
  siap: z.enum(["siap_huni", "siap_kosong", "siap_huni_renovasi"]),
  mapsLink: z.union([z.string().url("Format URL tidak valid"), z.literal("")])
    .optional()
    .nullable()
    .refine((url) => {
      if (!url) return true;
      return url.includes("google.com/maps") || url.includes("googleusercontent.com") || url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps");
    }, "Harus berupa link Google Maps"),
  kawasan: z.array(z.string()).min(1, "Minimal isi 1 kawasan"),
  unit: z.string().optional().nullable(),
  
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  province: z.string().min(3, "Provinsi minimal 3 karakter"),
  city: z.string().min(3, "Kota minimal 3 karakter"),
  district: z.string().min(3, "Kecamatan minimal 3 karakter"),
  postalCode: z.string().optional().nullable(),
  latitude: z.coerce.number().min(-90, "Latitude minimal -90").max(90, "Latitude maksimal 90"),
  longitude: z.coerce.number().min(-180, "Longitude minimal -180").max(180, "Longitude maksimal 180"),
  listingType: z.enum(["sale", "rent"]),
});

export type PropertiFormValues = z.infer<typeof propertiSchema>;
