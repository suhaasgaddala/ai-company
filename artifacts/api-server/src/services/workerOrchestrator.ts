import { chatCompletion, chatCompletionJSON } from "../lib/openrouter.js";
import { WORKERS } from "../config/agents.js";
import {
  buildBuilderPrompt,
  buildGtmPrompt,
  buildFinancePrompt,
  type SelectedCompanyBrief,
} from "../prompts/workers.js";
import * as transcriptService from "./transcriptService.js";
import * as runService from "./runService.js";
import * as artifactService from "./artifactService.js";
import type { FounderResult } from "../types/founder.js";
import * as fs from "fs/promises";
import * as path from "path";

export function normalizeSelectedCompany(founderResult: FounderResult): SelectedCompanyBrief {
  const brief = founderResult.canonicalBrief;
  const roles = founderResult.roles;
  const selected = founderResult.selectedProposal;

  const solutionText = brief.solution || selected.solution || "";
  const coreFeatures = solutionText
    ? solutionText.split(/[.,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 5)
    : ["Core product feature"];

  const riskSources: string[] = [];
  if (brief.moat) riskSources.push(`Competitive moat: ${brief.moat}`);
  if (selected.moat) riskSources.push(`Defensibility: ${selected.moat}`);
  if (!riskSources.length) riskSources.push("Market adoption risk", "Competitive pressure");

  const pricingFromModel = brief.businessModel
    ? `${brief.businessModel}-based pricing`
    : "Freemium with paid tiers";

  return {
    companyName: brief.companyName || selected.companyName || "Unnamed Company",
    tagline: brief.tagline || selected.tagline || "",
    customer: brief.targetMarket || selected.targetMarket || "General consumers",
    problem: brief.problem || selected.problem || "",
    solution: solutionText,
    whyNow: brief.whyNow || selected.whyNow || "",
    businessModel: brief.businessModel || "SaaS subscription",
    pricing: pricingFromModel,
    coreFeatures,
    goToMarketWedge: brief.moat || selected.moat || "First-mover advantage",
    risks: riskSources,
    brandTone: "Professional, innovative, trustworthy",
    assignedRoles: {
      CEO: roles.ceo?.toUpperCase() || "TECH",
      CTO: roles.cto?.toUpperCase() || "TECH",
      CFO: roles.cfo?.toUpperCase() || "FINANCE",
      COO: roles.coo?.toUpperCase() || "SKEPTIC",
      CMO: roles.cmo?.toUpperCase() || "MARKET",
    },
  };
}

async function loadAndNormalizeCompanyBrief(runId: string): Promise<SelectedCompanyBrief> {
  const artifacts = await artifactService.getArtifacts(runId);
  const founderResultArtifact = artifacts.find((a) => a.artifactType === "founder_result");
  if (!founderResultArtifact?.contentText) {
    throw new Error("Founder result artifact not found — founder phase must complete first");
  }
  const founderResult: FounderResult = JSON.parse(founderResultArtifact.contentText);
  return normalizeSelectedCompany(founderResult);
}

function getWorkerDef(key: string) {
  return WORKERS.find((w) => w.key === key)!;
}

interface BuilderOutput {
  productMd: string;
  landingPage: {
    indexHtml: string;
    stylesCss: string;
    appJs: string;
  };
}

interface GtmOutput {
  gtmMd: string;
}

interface FinanceOutput {
  financeMd: string;
}

async function savePreviewToDisk(
  runId: string,
  files: Record<string, string>
): Promise<string> {
  const dir = path.join(process.cwd(), "generated", runId);
  await fs.mkdir(dir, { recursive: true });
  for (const [filename, content] of Object.entries(files)) {
    await fs.writeFile(path.join(dir, filename), content, "utf-8");
  }
  return dir;
}

function extractJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        /* fall through */
      }
    }
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        /* fall through */
      }
    }
    return null;
  }
}

function assemblePreviewHtml(
  indexHtml: string,
  stylesCss: string,
  appJs: string
): string {
  let html = indexHtml;

  if (stylesCss) {
    const styleTag = `<style>\n${stylesCss}\n</style>`;
    html = html.replace(
      /<link[^>]*href=["']styles\.css["'][^>]*\/?>/gi,
      styleTag
    );
    if (!html.includes(stylesCss.substring(0, Math.min(40, stylesCss.length)))) {
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${styleTag}\n</head>`);
      } else {
        html = styleTag + "\n" + html;
      }
    }
  }

  if (appJs) {
    const scriptTag = `<script>\n${appJs}\n</script>`;
    html = html.replace(
      /<script[^>]*src=["']app\.js["'][^>]*><\/script>/gi,
      scriptTag
    );
    if (!html.includes(appJs.substring(0, Math.min(40, appJs.length)))) {
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${scriptTag}\n</body>`);
      } else {
        html = html + "\n" + scriptTag;
      }
    }
  }

  return html;
}

function generateFallbackHtml(brief: SelectedCompanyBrief): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brief.companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e0e0e0; }
    .hero { max-width: 800px; margin: 0 auto; padding: 100px 20px; text-align: center; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .tagline { font-size: 1.25rem; color: #888; margin-bottom: 2rem; }
    .desc { color: #aaa; line-height: 1.7; margin-bottom: 1rem; }
    .cta { display: inline-block; margin-top: 2rem; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #06b6d4); color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${brief.companyName}</h1>
    <p class="tagline">${brief.tagline}</p>
    <p class="desc">${brief.problem}</p>
    <p class="desc">${brief.solution}</p>
    <button class="cta">Get Early Access</button>
  </div>
</body>
</html>`;
}

async function runBuilderWorker(
  runId: string,
  brief: SelectedCompanyBrief
): Promise<void> {
  const def = getWorkerDef("builder");
  let sortOrder = await transcriptService.getNextSortOrder(runId);

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "builder",
    roleType: "worker",
    messageType: "status",
    content: `Builder agent starting: generating product specification and landing page for ${brief.companyName}...`,
    sortOrder: sortOrder++,
  });

  const { system, user } = buildBuilderPrompt(brief);

  const result = await chatCompletionJSON<BuilderOutput>(
    def.defaultModel,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    4096,
    { jsonSchema: {} }
  );

  sortOrder = await transcriptService.getNextSortOrder(runId);
  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "builder",
    roleType: "worker",
    messageType: "status",
    content: `Builder agent generating output: processing product spec and landing page assets...`,
    sortOrder,
  });

  let output: BuilderOutput;

  if (result.success && result.data) {
    output = result.data;
  } else {
    const fallback = await chatCompletion(
      def.defaultModel,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      4096
    );
    if (!fallback.success || !fallback.text) {
      throw new Error(
        `Builder worker failed: ${fallback.error || result.error}`
      );
    }
    const parsed = extractJSON<BuilderOutput>(fallback.text);
    if (!parsed) {
      throw new Error(`Builder worker failed: could not parse output as JSON`);
    }
    output = parsed;
  }

  const productMd =
    output.productMd || "# Product Specification\n\nGeneration pending...";
  await artifactService.saveArtifact({
    runId,
    artifactType: "product",
    title: `${brief.companyName} — Product Specification`,
    contentText: productMd,
  });

  const indexHtml = output.landingPage?.indexHtml || generateFallbackHtml(brief);
  const stylesCss = output.landingPage?.stylesCss || "";
  const appJs = output.landingPage?.appJs || "";

  const fullHtml = assemblePreviewHtml(indexHtml, stylesCss, appJs);

  await savePreviewToDisk(runId, {
    "index.html": indexHtml,
    "styles.css": stylesCss,
    "app.js": appJs,
  });

  await artifactService.saveArtifact({
    runId,
    artifactType: "preview",
    title: `${brief.companyName} — Landing Page`,
    contentText: fullHtml,
  });

  await artifactService.saveArtifact({
    runId,
    artifactType: "preview_file",
    title: "index.html",
    contentText: indexHtml,
    storagePath: `generated/${runId}/index.html`,
  });

  await artifactService.saveArtifact({
    runId,
    artifactType: "preview_file",
    title: "styles.css",
    contentText: stylesCss,
    storagePath: `generated/${runId}/styles.css`,
  });

  await artifactService.saveArtifact({
    runId,
    artifactType: "preview_file",
    title: "app.js",
    contentText: appJs,
    storagePath: `generated/${runId}/app.js`,
  });

  sortOrder = await transcriptService.getNextSortOrder(runId);
  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "builder",
    roleType: "worker",
    messageType: "artifact",
    content: `Builder agent complete: product specification and landing page generated for ${brief.companyName}.`,
    sortOrder,
  });
}

async function runGtmWorker(
  runId: string,
  brief: SelectedCompanyBrief
): Promise<void> {
  const def = getWorkerDef("gtm");
  let sortOrder = await transcriptService.getNextSortOrder(runId);

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "gtm",
    roleType: "worker",
    messageType: "status",
    content: `GTM Strategist starting: developing go-to-market plan for ${brief.companyName}...`,
    sortOrder: sortOrder++,
  });

  const { system, user } = buildGtmPrompt(brief);
  const result = await chatCompletionJSON<GtmOutput>(
    def.defaultModel,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    4096,
    { jsonSchema: {} }
  );

  sortOrder = await transcriptService.getNextSortOrder(runId);
  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "gtm",
    roleType: "worker",
    messageType: "status",
    content: `GTM Strategist generating output: compiling go-to-market strategy...`,
    sortOrder,
  });

  let gtmMd: string;
  if (result.success && result.data?.gtmMd) {
    gtmMd = result.data.gtmMd;
  } else {
    const fallback = await chatCompletion(
      def.defaultModel,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      4096
    );
    if (!fallback.success || !fallback.text) {
      throw new Error(`GTM worker failed: ${fallback.error || result.error || "No output from model"}`);
    }
    const parsed = extractJSON<GtmOutput>(fallback.text);
    gtmMd = parsed?.gtmMd || fallback.text;
  }

  await artifactService.saveArtifact({
    runId,
    artifactType: "gtm",
    title: `${brief.companyName} — Go-to-Market Strategy`,
    contentText: gtmMd,
  });

  sortOrder = await transcriptService.getNextSortOrder(runId);
  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "gtm",
    roleType: "worker",
    messageType: "artifact",
    content: `GTM Strategist complete: go-to-market strategy generated for ${brief.companyName}.`,
    sortOrder,
  });
}

async function runFinanceWorker(
  runId: string,
  brief: SelectedCompanyBrief
): Promise<void> {
  const def = getWorkerDef("finance_ops");
  let sortOrder = await transcriptService.getNextSortOrder(runId);

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "finance_ops",
    roleType: "worker",
    messageType: "status",
    content: `Finance Ops starting: building financial model for ${brief.companyName}...`,
    sortOrder: sortOrder++,
  });

  const { system, user } = buildFinancePrompt(brief);
  const result = await chatCompletionJSON<FinanceOutput>(
    def.defaultModel,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    4096,
    { jsonSchema: {} }
  );

  sortOrder = await transcriptService.getNextSortOrder(runId);
  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "finance_ops",
    roleType: "worker",
    messageType: "status",
    content: `Finance Ops generating output: building financial model and projections...`,
    sortOrder,
  });

  let financeMd: string;
  if (result.success && result.data?.financeMd) {
    financeMd = result.data.financeMd;
  } else {
    const fallback = await chatCompletion(
      def.defaultModel,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      4096
    );
    if (!fallback.success || !fallback.text) {
      throw new Error(`Finance worker failed: ${fallback.error || result.error || "No output from model"}`);
    }
    const parsed = extractJSON<FinanceOutput>(fallback.text);
    financeMd = parsed?.financeMd || fallback.text;
  }

  await artifactService.saveArtifact({
    runId,
    artifactType: "finance",
    title: `${brief.companyName} — Financial Memo`,
    contentText: financeMd,
  });

  sortOrder = await transcriptService.getNextSortOrder(runId);
  await transcriptService.addTranscriptMessage({
    runId,
    phase: "workers",
    agentKey: "finance_ops",
    roleType: "worker",
    messageType: "artifact",
    content: `Finance Ops complete: financial memo generated for ${brief.companyName}.`,
    sortOrder,
  });
}

export async function runWorkerPhase(runId: string): Promise<void> {
  const run = await runService.getRun(runId);
  if (!run) throw new Error("Run not found");

  if (run.phase !== "founders_complete") {
    throw new Error(
      `Cannot start workers: founder phase is "${run.phase}", expected "founders_complete"`
    );
  }

  let sortOrder = await transcriptService.getNextSortOrder(runId);

  try {
    await runService.updateRun(runId, { phase: "workers", status: "running" });

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "workers",
      agentKey: "system",
      roleType: "system",
      messageType: "phase_start",
      content:
        "Worker phase initiated. Specialist agents are generating deliverables...",
      sortOrder: sortOrder++,
    });

    const brief = await loadAndNormalizeCompanyBrief(runId);

    await runBuilderWorker(runId, brief);
    await runGtmWorker(runId, brief);
    await runFinanceWorker(runId, brief);

    sortOrder = await transcriptService.getNextSortOrder(runId);

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "workers",
      agentKey: "system",
      roleType: "system",
      messageType: "phase_complete",
      content: `All deliverables generated for ${brief.companyName}. Worker phase complete.`,
      sortOrder,
    });

    await runService.updateRun(runId, { phase: "complete", status: "completed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Worker phase error:", err);
    sortOrder = await transcriptService.getNextSortOrder(runId);
    await runService.updateRun(runId, {
      status: "error",
      phase: "workers_error",
    });
    await transcriptService.addTranscriptMessage({
      runId,
      phase: "workers",
      agentKey: "system",
      roleType: "system",
      messageType: "system",
      content: `Worker phase failed: ${message}`,
      sortOrder,
    });
  }
}
