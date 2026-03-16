import { db } from "@workspace/db";
import { artifactsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function getArtifacts(runId: string) {
  return db
    .select()
    .from(artifactsTable)
    .where(eq(artifactsTable.runId, runId));
}

export async function saveArtifact(artifact: {
  runId: string;
  artifactType: string;
  title?: string;
  contentText?: string;
  storagePath?: string;
}) {
  const [result] = await db
    .insert(artifactsTable)
    .values(artifact)
    .returning();
  return result;
}
