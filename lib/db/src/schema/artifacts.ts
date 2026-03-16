import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const artifactsTable = pgTable("artifacts", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  artifactType: text("artifact_type").notNull(),
  title: text("title"),
  contentText: text("content_text"),
  storagePath: text("storage_path"),
});

export const insertArtifactSchema = createInsertSchema(artifactsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
export type Artifact = typeof artifactsTable.$inferSelect;
