import { chatCompletion } from "../lib/openrouter.js";
import { WORKERS } from "../config/agents.js";
import { WORKER_PROMPTS } from "../prompts/workers.js";
import * as transcriptService from "./transcriptService.js";
import * as runService from "./runService.js";
import * as artifactService from "./artifactService.js";

// TODO: This is the main file for the WORKER LOOP person
// Implement the full deliverable generation cycle here

export async function runWorkerPhase(runId: string): Promise<void> {
  const run = await runService.getRun(runId);
  if (!run) throw new Error("Run not found");

  await runService.updateRun(runId, { phase: "workers", status: "running" });

  // TODO: Step 1 - Builder agent generates product spec
  await runBuilderWorker(runId);

  // TODO: Step 2 - GTM agent generates go-to-market plan
  await runGtmWorker(runId);

  // TODO: Step 3 - Finance agent generates financial memo
  await runFinanceWorker(runId);

  // TODO: Step 4 - Generate landing page preview
  await generatePreview(runId);

  await runService.updateRun(runId, { phase: "complete", status: "completed" });
}

async function runBuilderWorker(runId: string): Promise<void> {
  // TODO:
  //   1. Get run details and transcript for context
  //   2. Build prompt from WORKER_PROMPTS.builder_worker
  //   3. Call chatCompletion() with builder model
  //   4. Save response as transcript message
  //   5. Save as artifact with type "product_spec"
  console.log("TODO: runBuilderWorker", runId);
}

async function runGtmWorker(runId: string): Promise<void> {
  // TODO:
  //   1. Get run details and transcript for context
  //   2. Build prompt from WORKER_PROMPTS.gtm_worker
  //   3. Call chatCompletion() with gtm model
  //   4. Save response as transcript message
  //   5. Save as artifact with type "gtm_plan"
  console.log("TODO: runGtmWorker", runId);
}

async function runFinanceWorker(runId: string): Promise<void> {
  // TODO:
  //   1. Get run details and transcript for context
  //   2. Build prompt from WORKER_PROMPTS.finance_worker
  //   3. Call chatCompletion() with finance model
  //   4. Save response as transcript message
  //   5. Save as artifact with type "finance_memo"
  console.log("TODO: runFinanceWorker", runId);
}

async function generatePreview(runId: string): Promise<void> {
  // TODO:
  //   1. Get company details from run
  //   2. Get all artifacts (product spec, GTM, finance)
  //   3. Generate a simple landing page HTML
  //   4. Save as artifact with type "preview"
  //   5. Could use an LLM to generate the HTML or use a template
  console.log("TODO: generatePreview", runId);
}

export async function savePreviewBundle(runId: string, files: Record<string, string>): Promise<void> {
  // TODO: Save generated landing page files as artifacts
  for (const [filename, content] of Object.entries(files)) {
    await artifactService.saveArtifact({
      runId,
      artifactType: "preview_file",
      title: filename,
      contentText: content,
    });
  }
}
