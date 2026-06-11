import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

// Simple in-memory rate limiter: Map<IP, { count: number, resetTime: number }>
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 3;
const ONE_HOUR_MS = 60 * 60 * 1000;

function cleanUpRateLimits() {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clean up expired rate limits
  cleanUpRateLimits();

  const ipAddress = Array.isArray(req.headers["x-forwarded-for"])
    ? req.headers["x-forwarded-for"][0]
    : req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  const now = Date.now();
  const rateData = rateLimitMap.get(ipAddress) || { count: 0, resetTime: now + ONE_HOUR_MS };

  if (rateData.count >= MAX_REQUESTS_PER_HOUR) {
    if (now < rateData.resetTime) {
      return res.status(429).json({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." });
    } else {
      // Reset if time has passed (handled by cleanup, but just in case)
      rateData.count = 0;
      rateData.resetTime = now + ONE_HOUR_MS;
    }
  }

  try {
    const validatedData = contactSchema.parse(req.body);

    // Update rate limit
    rateData.count += 1;
    rateLimitMap.set(ipAddress, rateData);

    // TODO: Send real email here (e.g., via Resend, Nodemailer, SendGrid, etc.)
    // AC-4.2 Proses submit berhasil mengirimkan email notifikasi ke admin Prime Property
    console.log("========================================");
    console.log("NEW CONTACT MESSAGE RECEIVED");
    console.log("Name:", validatedData.name);
    console.log("Email:", validatedData.email);
    console.log("Phone:", validatedData.phone);
    console.log("Message:", validatedData.message);
    console.log("IP:", ipAddress);
    console.log("========================================");

    return res.status(200).json({ success: true, message: "Pesan terkirim, tim kami akan menghubungi Anda." });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error("Contact API Error:", error);
    return res.status(500).json({ error: "Gagal mengirim pesan" });
  }
}
