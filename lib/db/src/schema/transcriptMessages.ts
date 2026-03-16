import { pgTable, text, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transcriptMessagesTable = pgTable("transcript_messages", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  phase: text("phase"),
  agentKey: text("agent_key"),
  roleType: text("role_type"),
  messageType: text("message_type"),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertTranscriptMessageSchema = createInsertSchema(transcriptMessagesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTranscriptMessage = z.infer<typeof insertTranscriptMessageSchema>;
export type TranscriptMessage = typeof transcriptMessagesTable.$inferSelect;
