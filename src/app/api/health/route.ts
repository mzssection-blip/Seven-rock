import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { aiAvailability } from "@/lib/integrations/ai";
import { emailIsConfigured } from "@/lib/integrations/email";
import { storageIsConfigured } from "@/lib/integrations/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw(Prisma.sql`SELECT 1`);
    return Response.json({
      status: "ok",
      services: {
        database: "ok",
        ai: aiAvailability().configured ? "configured" : "not-configured",
        email: emailIsConfigured() ? "configured" : "not-configured",
        storage: storageIsConfigured() ? "configured" : "not-configured",
      },
    });
  } catch {
    return Response.json({ status: "unavailable", services: { database: "unavailable" } }, { status: 503 });
  }
}
