import { db } from "@workspace/db";
import { runsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function createRun(userKeywords?: string) {
  const id = randomUUID();
  const [run] = await db
    .insert(runsTable)
    .values({
      id,
      status: "created",
      phase: "idle",
      userKeywords: userKeywords || null,
    })
    .returning();
  return run;
}

export async function getRun(runId: string) {
  const [run] = await db.select().from(runsTable).where(eq(runsTable.id, runId));
  return run || null;
}

export async function updateRun(runId: string, updates: Partial<typeof runsTable.$inferInsert>) {
  const [run] = await db
    .update(runsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(runsTable.id, runId))
    .returning();
  return run || null;
}
