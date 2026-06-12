import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users, audit_logs } from "@/db/index";
import { loginWithGoogle } from "@/lib/services";
import { Profile } from "next-auth";
import { v4 as uuidv4 } from "uuid";

// Extend Profile type to include Google-specific fields
interface GoogleProfile extends Profile {
  picture?: string;
  email_verified?: boolean;
  locale?: string;
  hd?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          // Rate Limit Check
          const globalAny = global as any;
          if (!globalAny.authRateLimitMap) {
            globalAny.authRateLimitMap = new Map<string, { count: number; resetTime: number }>();
          }
          const rateLimitMap = globalAny.authRateLimitMap;
          const ip = req.headers?.['x-forwarded-for'] || 'unknown';
          const now = Date.now();
          
          if (Math.random() < 0.1) {
            for (const [key, data] of rateLimitMap.entries()) {
              if (now > (data as any).resetTime) rateLimitMap.delete(key);
            }
          }

          let rateData = rateLimitMap.get(ip as string);
          if (!rateData || now > rateData.resetTime) {
            rateData = { count: 0, resetTime: now + 60 * 1000 };
          }

          rateData.count++;
          rateLimitMap.set(ip as string, rateData);

          if (rateData.count > 10) {
            // Log to audit table
            if (rateData.count === 11) { // Only log once per block period to avoid DB spam
              try {
                await db.insert(audit_logs).values({
                  id: uuidv4(),
                  tableName: "security",
                  recordId: uuidv4(), // Dummy UUID since there's no actual record
                  action: "create",
                  ipAddress: ip as string,
                  newData: JSON.stringify({ reason: "Rate limit exceeded (Auth)", ip: ip }),
                });
              } catch (err) {
                console.error("Failed to log rate limit:", err);
              }
            }
            throw new Error("Terlalu banyak permintaan otentikasi. Silakan coba lagi nanti.");
          }

          if (!credentials?.email) {
            throw new Error("Email is required");
          }

          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (!user) {
            throw new Error("User not found");
          }

          if (user.isActive === false) {
            throw new Error("Akun Anda telah dinonaktifkan. Silakan hubungi superadmin.");
          }

          // Check login method
          if (user.loginType === "google") {
            throw new Error(
              "This email is registered with Google. Please sign in with Google."
            );
          }


          if (!credentials?.password) {
            throw new Error("Password is required");
          }

          // Verify password
          if (!user.password) {
            throw new Error("Password not found");
          }

          const isValidPassword = await compare(
            credentials.password,
            user.password
          );
          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.userType,
            loginMethod: user.loginType ?? "credential",
            image: user.profilePhoto ?? undefined,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const googleProfile = profile as GoogleProfile;
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email!),
          });

          if (existingUser && existingUser.loginType === "credential") {
            throw new Error(
              "This email is registered with email/password. Please sign in with your password."
            );
          }

          if (existingUser && existingUser.isActive === false) {
            throw new Error("Akun Anda telah dinonaktifkan. Silakan hubungi superadmin.");
          }

          // Update user's profile image if it exists in Google profile
          if (existingUser && googleProfile?.picture) {
            await db
              .update(users)
              .set({ profilePhoto: googleProfile.picture })
              .where(eq(users.email, user.email!));
          }
        }
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
    async jwt({ token, account, profile, user }) {
      try {
        if (account?.provider === "credentials") {
          token.sub = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;
          token.picture = user.image;
          token.loginMethod = user.loginMethod;
        }

        if (account?.provider === "google") {
          if (!profile?.name || !profile?.email) {
            throw new Error("Google profile is missing required information");
          }

          const googleProfile = profile as GoogleProfile;

          const data = {
            username: profile.name,
            email: profile.email,
            image: googleProfile.picture ?? "",
          };

          const googleUser = await loginWithGoogle(data);
          token.sub = googleUser.id;
          token.email = googleUser.email;
          token.name = googleUser.name;
          token.role = googleUser.role;
          token.picture = googleProfile.picture || googleUser.image;
          token.loginMethod = googleUser.loginMethod;
        }

        return token;
      } catch (error) {
        console.error("JWT error:", error);
        throw error;
      }
    },
    async session({ session, token }) {
      try {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.role = token.role as string;
        session.user.loginMethod = token.loginMethod as string;
        session.user.image = token.picture ?? "";
        // Note: accessToken and refreshToken are not needed when using NextAuth directly
        // But kept for backward compatibility with ApiProvider
        session.accessToken = undefined;
        session.refreshToken = undefined;

        return session;
      } catch (error) {
        console.error("Session error:", error);
        throw error;
      }
    },
  },
  events: {
    async signIn(message) {
      try {
        if (message.user?.id) {
          await db.insert(audit_logs).values({
            id: uuidv4(),
            userId: message.user.id,
            tableName: "auth",
            recordId: message.user.id, // we can use the user ID as recordId
            action: "create",
            newData: JSON.stringify({ event: "login" })
          });
        }
      } catch (e) {
        console.error("Failed to log sign in:", e);
      }
    },
    async signOut(message) {
      try {
        if (message.token?.sub) {
          await db.insert(audit_logs).values({
            id: uuidv4(),
            userId: message.token.sub as string,
            tableName: "auth",
            recordId: message.token.sub as string,
            action: "create",
            newData: JSON.stringify({ event: "logout" })
          });
        }
      } catch (e) {
        console.error("Failed to log sign out:", e);
      }
    }
  },
  pages: {
    signIn: "/agent/login",
    error: "/agent/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
