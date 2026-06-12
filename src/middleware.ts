import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

const GLOBAL_LIMIT = 100;
const AUTH_LIMIT = 10;
const ONE_MINUTE_MS = 60 * 1000;

function cleanUp() {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

export function middleware(request: NextRequest) {
  // Hanya jalankan rate limit untuk API routes (opsional: bisa juga global ke semua route)
  // Berdasarkan AC: "secara global" dan "khusus untuk endpoint otentikasi"
  // Kita terapkan ke semua pathname jika memungkinkan, tapi lebih baik fokus ke /api/
  
  cleanUp();

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const pathname = request.nextUrl.pathname;
  
  // Skip if it's an auth endpoint since it's handled in [...nextauth].ts natively
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const limitKey = `global:${ip}`;
  const now = Date.now();
  let rateData = rateLimitMap.get(limitKey);

  if (!rateData) {
    rateData = { count: 0, resetTime: now + ONE_MINUTE_MS };
  }

  if (now > rateData.resetTime) {
    rateData = { count: 0, resetTime: now + ONE_MINUTE_MS };
  }

  rateData.count++;
  rateLimitMap.set(limitKey, rateData);

  if (rateData.count > GLOBAL_LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }),
      { 
        status: 429, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  // Hanya tangkap routing di bawah /api untuk meminimalkan beban, 
  // namun sesuai AC, rate limit global dapat diartikan "semua request API"
  matcher: '/api/:path*',
};
