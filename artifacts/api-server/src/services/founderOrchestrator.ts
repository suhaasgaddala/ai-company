import { chatCompletion } from "../lib/openrouter.js";
import { FOUNDERS } from "../config/agents.js";
import { FOUNDER_PROMPTS } from "../prompts/founders.js";
import * as transcriptService from "./transcriptService.js";
import * as runService from "./runService.js";

// TODO: This is the main file for the FOUNDER LOOP person
// Implement the full debate cycle here

export async function runFounderPhase(runId: string): Promise<void> {
  const run = await runService.getRun(runId);
  if (!run) throw new Error("Run not found");

  await runService.updateRun(runId, { phase: "founders", status: "running" });

  // TODO: Step 1 - Each founder generates startup ideas based on run.userKeywords
  // Use chatCompletion() with each founder's prompt and model
  // Save each response as a transcript message
  await generateFounderIdeas(runId);

  // TODO: Step 2 - Founders critique each other's ideas
  // Pass previous messages as context
  await critiqueIdeas(runId);

  // TODO: Step 3 - Founders vote and converge on one idea
  // Determine winner, update run with company details
  await voteOnIdeas(runId);

  await runService.updateRun(runId, { phase: "founders_complete", status: "waiting" });
}

async function generateFounderIdeas(runId: string): Promise<void> {
  // TODO: For each founder in FOUNDERS:
  //   1. Build messages array with system prompt from FOUNDER_PROMPTS
  //   2. Add user message with the run's keywords
  //   3. Call chatCompletion(founder.defaultModel, messages)
  //   4. Save response via transcriptService.addTranscriptMessage()
  console.log("TODO: generateFounderIdeas", runId);
}

async function critiqueIdeas(runId: string): Promise<void> {
  // TODO: For each founder:
  //   1. Get all previous transcript messages
  //   2. Ask each founder to critique the other ideas
  //   3. Save critique responses
  console.log("TODO: critiqueIdeas", runId);
}

async function voteOnIdeas(runId: string): Promise<void> {
  // TODO: 
  //   1. Get all transcript messages
  //   2. Ask each founder to vote on the best idea
  //   3. Tally votes, determine winner
  //   4. Update run with companyName, companyTagline, selectedIdeaTitle, etc.
  console.log("TODO: voteOnIdeas", runId);
}
