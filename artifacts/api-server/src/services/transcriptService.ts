import { db } from "@workspace/db";
import { transcriptMessagesTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getTranscript(runId: string) {
  return db
    .select()
    .from(transcriptMessagesTable)
    .where(eq(transcriptMessagesTable.runId, runId))
    .orderBy(asc(transcriptMessagesTable.sortOrder));
}

export async function addTranscriptMessage(msg: {
  runId: string;
  phase?: string;
  agentKey?: string;
  roleType?: string;
  messageType?: string;
  content: string;
  sortOrder: number;
}) {
  const [result] = await db
    .insert(transcriptMessagesTable)
    .values(msg)
    .returning();
  return result;
}

export async function getNextSortOrder(runId: string): Promise<number> {
  const messages = await db
    .select({ sortOrder: transcriptMessagesTable.sortOrder })
    .from(transcriptMessagesTable)
    .where(eq(transcriptMessagesTable.runId, runId))
    .orderBy(asc(transcriptMessagesTable.sortOrder));

  if (messages.length === 0) return 1;
  return (messages[messages.length - 1].sortOrder || 0) + 1;
}

export async function seedInitialMessages(runId: string) {
  await addTranscriptMessage({
    runId,
    phase: "setup",
    agentKey: "system",
    roleType: "system",
    messageType: "system",
    content: "New company run initialized. Waiting for founder debate to begin...",
    sortOrder: 1,
  });
}
