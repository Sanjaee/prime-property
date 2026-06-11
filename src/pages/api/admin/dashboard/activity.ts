import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { audit_logs, contact_messages, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = (session.user as any).role;
    
    if (role === "superadmin") {
      // Superadmin sees recent audit logs
      const logs = await db
        .select({
          id: audit_logs.id,
          action: audit_logs.action,
          tableName: audit_logs.tableName,
          createdAt: audit_logs.createdAt,
          adminName: users.fullName,
        })
        .from(audit_logs)
        .leftJoin(users, eq(audit_logs.userId, users.id))
        .orderBy(desc(audit_logs.createdAt))
        .limit(10);

      const formatted = logs.map((log) => ({
        id: log.id,
        header: log.action.toUpperCase(), // e.g., "CREATE", "UPDATE"
        sectionType: log.tableName, // e.g., "properti", "users"
        status: "Done", // Audit logs are past actions
        target: log.createdAt,
        reviewer: log.adminName || "System / Deleted User",
      }));

      return res.status(200).json({ status: "success", role, data: formatted });
      
    } else if (role === "admin") {
      // Admin sees recent contact inquiries / leads
      const leads = await db
        .select({
          id: contact_messages.id,
          nama: contact_messages.nama,
          email: contact_messages.email,
          pesan: contact_messages.pesan,
          isEmailSent: contact_messages.isEmailSent,
          createdAt: contact_messages.createdAt,
        })
        .from(contact_messages)
        .orderBy(desc(contact_messages.createdAt))
        .limit(10);

      const formatted = leads.map((lead) => ({
        id: lead.id,
        header: lead.nama,
        sectionType: lead.email,
        status: lead.isEmailSent ? "Done" : "In Process",
        target: lead.createdAt,
        reviewer: lead.pesan.length > 50 ? lead.pesan.substring(0, 50) + "..." : lead.pesan,
      }));

      return res.status(200).json({ status: "success", role, data: formatted });
      
    } else {
      return res.status(403).json({ error: "Forbidden access" });
    }
  } catch (error) {
    console.error("Dashboard Activity API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
