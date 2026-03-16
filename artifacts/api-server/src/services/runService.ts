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

// TODO: Implement for founder loop
export async function runFounderPhase(_runId: string): Promise<void> {
  // TODO: Orchestrate the full founder debate loop
  // 1. generateFounderIdeas(runId)
  // 2. critiqueIdeas(runId)
  // 3. voteOnIdeas(runId)
  // 4. Update run with selected company
  throw new Error("Not implemented - founder loop TODO");
}

// TODO: Implement for worker loop
export async function runWorkerPhase(_runId: string): Promise<void> {
  // TODO: Orchestrate the worker generation loop
  // 1. runBuilderWorker(runId)
  // 2. runGtmWorker(runId)
  // 3. runFinanceWorker(runId)
  // 4. Generate landing page preview
  throw new Error("Not implemented - worker loop TODO");
}
