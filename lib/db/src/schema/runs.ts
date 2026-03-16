import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const runsTable = pgTable("runs", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: text("status").notNull().default("created"),
  phase: text("phase").notNull().default("idle"),
  userKeywords: text("user_keywords"),
  companyName: text("company_name"),
  companyTagline: text("company_tagline"),
  selectedIdeaTitle: text("selected_idea_title"),
  selectedIdeaSummary: text("selected_idea_summary"),
  winnerAgentKey: text("winner_agent_key"),
  stateJson: jsonb("state_json"),
});

export const insertRunSchema = createInsertSchema(runsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runsTable.$inferSelect;
