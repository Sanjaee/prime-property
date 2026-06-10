import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  decimal,
  integer,
  bigint,
} from "drizzle-orm/pg-core";

// =========================================
// Enums — Auth
// =========================================
export const userTypeEnum = pgEnum("user_type", ["admin", "superadmin"]);
export const loginTypeEnum = pgEnum("login_type", ["credential", "google"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// =========================================
// Enums — Properti (EXISTING — tidak diubah)
// =========================================
export const propertiTypeEnum = pgEnum("properti_type", [
  "house",
  "apartment",
  "villa",
  "land",
  "commercial",
  // === TAMBAHAN AC-6.1 ===
  "ruko",
]);
export const propertiStatusEnum = pgEnum("properti_status", [
  "active",
  "sold",
  "rented",
  "inactive",
]);
export const listingTypeEnum = pgEnum("listing_type", ["sale", "rent"]);
export const priceUnitEnum = pgEnum("price_unit", ["IDR", "USD"]);
export const rentPeriodEnum = pgEnum("rent_period", ["monthly", "yearly"]);
export const propertiConditionEnum = pgEnum("properti_condition", [
  "new",
  "used",
  "renovated",
]);
export const certificateTypeEnum = pgEnum("certificate_type", [
  "SHM",
  "HGB",
  "SHSRS",
  "girik",
  "other",
]);
export const imageTypeEnum = pgEnum("image_type", [
  "thumbnail",
  "gallery",
  "video",
]);

// =========================================
// Enums — TAMBAHAN AC-6.1
// =========================================

/**
 * AC-6.1: status listing properti sesuai inventory tracker
 * Berbeda dari propertiStatusEnum yang sudah ada (active/sold/rented/inactive).
 * Enum baru ini dipakai di tabel properti_listing (lihat bawah).
 */
export const listingStatusEnum = pgEnum("listing_status", [
  "in_stock",   // In Stock → badge hijau (AC-7.1)
  "sold_out",   // Sold Out → badge merah #B33A3A (AC-7.1)
]);

/**
 * AC-6.1 & AC-7.1: kondisi kesiapan hunian
 */
export const siapEnum = pgEnum("siap", [
  "siap_huni",           // badge kuning/emas (AC-7.1)
  "siap_kosong",         // badge ungu muda (AC-7.1)
  "siap_huni_renovasi",
]);

/**
 * AC-6.1: arah hadap properti (bisa kombinasi/multi via junction table)
 */
export const hadapEnum = pgEnum("hadap", [
  "Utara",
  "Selatan",
  "Timur",
  "Barat",
]);

/**
 * AC-8.2: jenis operasi yang dicatat di audit log
 */
export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "restore",
]);

// =========================================
// Users table (EXISTING — tidak diubah)
// =========================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  phone: varchar("phone", { length: 20 }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  password: text("password"),
  userType: userTypeEnum("user_type").default("admin").notNull(),
  profilePhoto: text("profile_photo"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: genderEnum("gender"),
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  lastLogin: timestamp("last_login"),
  loginType: loginTypeEnum("login_type").default("credential").notNull(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =========================================
// Sessions table (EXISTING — tidak diubah)
// =========================================
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
});

// =========================================
// OTP Codes table (EXISTING — tidak diubah)
// =========================================
export const otp_codes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  otpCode: varchar("otp_code", { length: 6 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================
// Verification tokens table (EXISTING — tidak diubah)
// =========================================
export const verification_tokens = pgTable("verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================
// Properti table (EXISTING — field lama tidak diubah, field baru ditambahkan)
// =========================================
export const properti = pgTable("properti", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Info utama (EXISTING)
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  type: propertiTypeEnum("type").notNull(),
  status: propertiStatusEnum("status").default("active").notNull(),
  listingType: listingTypeEnum("listing_type").notNull(),

  // Harga (EXISTING)
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  priceUnit: priceUnitEnum("price_unit").default("IDR").notNull(),
  rentPeriod: rentPeriodEnum("rent_period"),

  // Lokasi (EXISTING)
  address: text("address").notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),

  // SEO (EXISTING)
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),

  isFeatured: boolean("is_featured").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // =====================================================
  // TAMBAHAN — AC-6.1 (field dari inventory tracker)
  // =====================================================

  /**
   * AC-6.1: grup/kluster properti, e.g. "Mentari", "Permai 123"
   * Nullable karena tidak wajib (AC-6.1 mark ❌)
   */
  group: varchar("group", { length: 255 }),

  /**
   * AC-6.1: lebar lahan/bangunan dalam meter, wajib, max 2 desimal (AC-8.4)
   */
  lebar: decimal("lebar", { precision: 10, scale: 2 }),

  /**
   * AC-6.1: panjang lahan/bangunan dalam meter, wajib, max 2 desimal (AC-8.4)
   */
  panjang: decimal("panjang", { precision: 10, scale: 2 }),

  /**
   * AC-6.1: jumlah tingkat/lantai bangunan; 1–10, max 1 desimal (AC-8.4)
   * Menggunakan decimal agar bisa menyimpan nilai seperti 2.5, 3.5
   */
  tingkat: decimal("tingkat", { precision: 4, scale: 1 }),

  /**
   * AC-6.1: harga dalam rupiah penuh (integer — BUKAN float) (AC-6.1 catatan)
   * Menggunakan bigint karena nilai rupiah bisa sangat besar
   * Field price (existing decimal) tetap ada untuk kompatibilitas
   */
  priceRupiah: bigint("price_rupiah", { mode: "bigint" }),

  /**
   * AC-6.1: status listing inventory (in_stock / sold_out)
   * Berbeda dari status existing yang tracking active/sold/rented/inactive
   */
  listingStatus: listingStatusEnum("listing_status").default("in_stock"),

  /**
   * AC-6.1: kesiapan hunian (siap_huni / siap_kosong / siap_huni_renovasi)
   */
  siap: siapEnum("siap"),

  /**
   * AC-6.1: link Google Maps lokasi properti, nullable (AC-6.1 mark ❌)
   * Validasi: harus mengandung domain google.com/maps (AC-8.4)
   */
  mapsLink: text("maps_link"),

  /**
   * AC-6.1: kawasan/area properti, multitag disimpan sebagai array teks
   * e.g. ["Krakatau", "Pancing", "Cemara Asri"]
   * Menggunakan text dengan serialisasi JSON, atau bisa pakai text[] jika driver support
   */
  kawasan: text("kawasan"), // JSON array string, e.g. '["Krakatau","Pancing"]'

  /**
   * AC-6.1: keterangan unit tambahan, nullable
   * e.g. "Ready Siap huni", "Gate siap", "Lapangan", "Rucon"
   */
  unit: varchar("unit", { length: 255 }),

  /**
   * AC-6.1: FK ke user (superadmin) yang membuat entry ini
   * created_by wajib diisi (AC-6.1 mark ✅)
   */
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),

  /**
   * AC-8.3: soft delete — properti yang dihapus tidak tampil di listing
   * Set ke timestamp saat dihapus, null berarti aktif
   */
  deletedAt: timestamp("deleted_at"),
});

// =========================================
// Properti Hadap junction table — TAMBAHAN AC-6.1
// =========================================
/**
 * AC-6.1: hadap bersifat enum multi (boleh kombinasi), misal Utara+Timur.
 * Relasi many-to-many antara properti dan arah hadap.
 */
export const properti_hadap = pgTable("properti_hadap", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertiId: uuid("properti_id")
    .references(() => properti.id, { onDelete: "cascade" })
    .notNull(),
  hadap: hadapEnum("hadap").notNull(),
});

// =========================================
// Properti Images table (EXISTING — tidak diubah)
// =========================================
export const properti_images = pgTable("properti_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertiId: uuid("properti_id")
    .references(() => properti.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  imageType: imageTypeEnum("image_type").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================
// Detail Properti table (EXISTING — tidak diubah)
// =========================================
export const detail_properti = pgTable("detail_properti", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertiId: uuid("properti_id")
    .references(() => properti.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  // Ukuran (EXISTING)
  landArea: decimal("land_area", { precision: 10, scale: 2 }),
  buildingArea: decimal("building_area", { precision: 10, scale: 2 }),
  floorCount: integer("floor_count"),

  // Kamar (EXISTING)
  bedroomCount: integer("bedroom_count"),
  bathroomCount: integer("bathroom_count"),
  garageCount: integer("garage_count"),
  carportCount: integer("carport_count"),

  // Kondisi & legalitas (EXISTING)
  condition: propertiConditionEnum("condition"),
  certificateType: certificateTypeEnum("certificate_type"),
  yearBuilt: integer("year_built"),
  facingDirection: varchar("facing_direction", { length: 20 }),

  // Fasilitas internal (EXISTING)
  isFurnished: boolean("is_furnished").default(false).notNull(),
  hasSwimmingPool: boolean("has_swimming_pool").default(false).notNull(),
  hasGarden: boolean("has_garden").default(false).notNull(),
  hasSecurity: boolean("has_security").default(false).notNull(),
  hasAc: boolean("has_ac").default(false).notNull(),
  hasWifi: boolean("has_wifi").default(false).notNull(),
  hasParking: boolean("has_parking").default(false).notNull(),

  // Utilitas (EXISTING)
  electricityCapacity: integer("electricity_capacity"),
  waterSource: varchar("water_source", { length: 100 }),

  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // =====================================================
  // TAMBAHAN — AC-6.1
  // =====================================================

  /**
   * AC-6.1: carport sebagai boolean (true/false) sesuai AC inventory tracker.
   * carportCount (existing integer) tetap ada untuk data lebih detail.
   * Field ini dipakai sebagai checkbox filter di AC-7.2.
   */
  hasCarport: boolean("has_carport").default(false).notNull(),
});

// =========================================
// Audit Log table — TAMBAHAN AC-8.2 & AC-5.2
// =========================================
/**
 * AC-8.2: setiap perubahan properti dicatat (who, when, what changed)
 * AC-5.2: superadmin dapat melihat audit log perubahan
 */
export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  /**
   * User yang melakukan aksi (superadmin)
   * Set null jika user dihapus, agar log historis tetap tersimpan
   */
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  /** Nama tabel yang terkena perubahan, e.g. "properti", "users" */
  tableName: varchar("table_name", { length: 100 }).notNull(),

  /** ID record yang berubah */
  recordId: uuid("record_id").notNull(),

  /** Jenis aksi yang dilakukan */
  action: auditActionEnum("action").notNull(),

  /**
   * Snapshot data sebelum perubahan (JSON)
   * Null untuk aksi create
   */
  oldData: text("old_data"),

  /**
   * Snapshot data setelah perubahan (JSON)
   * Null untuk aksi delete
   */
  newData: text("new_data"),

  /**
   * Field-field yang berubah (JSON array of field names)
   * Memudahkan query "apa saja yang diubah" tanpa diff old/new data
   * e.g. '["price","status","kawasan"]'
   */
  changedFields: text("changed_fields"),

  /** IP address dari mana aksi dilakukan */
  ipAddress: varchar("ip_address", { length: 45 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================
// Contact Messages table — TAMBAHAN AC-4.2
// =========================================
/**
 * AC-4.2: form kontak publik menyimpan pesan yang masuk
 * Submit mengirim email notifikasi ke admin
 */
export const contact_messages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  /** AC-4.2: field form kontak */
  nama: varchar("nama", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  nomorHp: varchar("nomor_hp", { length: 20 }).notNull(),
  pesan: text("pesan").notNull(),

  /** IP address untuk rate limiting (AC-4.2: max 3 submit/IP/jam) */
  ipAddress: varchar("ip_address", { length: 45 }),

  /** Apakah email notifikasi sudah terkirim ke admin */
  isEmailSent: boolean("is_email_sent").default(false).notNull(),

  /** Timestamp email notifikasi terkirim */
  emailSentAt: timestamp("email_sent_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================
// Type exports (EXISTING — tidak diubah)
// =========================================

// Auth
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type OtpCode = typeof otp_codes.$inferSelect;
export type NewOtpCode = typeof otp_codes.$inferInsert;
export type VerificationToken = typeof verification_tokens.$inferSelect;
export type NewVerificationToken = typeof verification_tokens.$inferInsert;

// Properti (EXISTING)
export type Properti = typeof properti.$inferSelect;
export type NewProperti = typeof properti.$inferInsert;
export type DetailProperti = typeof detail_properti.$inferSelect;
export type NewDetailProperti = typeof detail_properti.$inferInsert;
export type PropertiImage = typeof properti_images.$inferSelect;
export type NewPropertiImage = typeof properti_images.$inferInsert;

// TAMBAHAN
export type PropertiHadap = typeof properti_hadap.$inferSelect;
export type NewPropertiHadap = typeof properti_hadap.$inferInsert;
export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;
export type ContactMessage = typeof contact_messages.$inferSelect;
export type NewContactMessage = typeof contact_messages.$inferInsert;