import { Router, type IRouter } from "express";
import {
  CreateRunBody,
  GetRunResponse,
  GetTranscriptResponse,
  GetArtifactsResponse,
  StartFoundersResponse,
  StartWorkersResponse,
  GetPreviewResponse,
} from "@workspace/api-zod";
import * as runService from "../services/runService.js";
import * as transcriptService from "../services/transcriptService.js";
import * as artifactService from "../services/artifactService.js";

const router: IRouter = Router();

function formatRun(run: any) {
  return {
    id: run.id,
    createdAt: run.createdAt?.toISOString?.() ?? run.createdAt,
    updatedAt: run.updatedAt?.toISOString?.() ?? run.updatedAt,
    status: run.status,
    phase: run.phase,
    userKeywords: run.userKeywords ?? undefined,
    companyName: run.companyName ?? undefined,
    companyTagline: run.companyTagline ?? undefined,
    selectedIdeaTitle: run.selectedIdeaTitle ?? undefined,
    selectedIdeaSummary: run.selectedIdeaSummary ?? undefined,
    winnerAgentKey: run.winnerAgentKey ?? undefined,
  };
}

router.post("/runs", async (req, res) => {
  const body = CreateRunBody.parse(req.body);
  const run = await runService.createRun(body.userKeywords ?? undefined);
  await transcriptService.seedInitialMessages(run.id);
  res.status(201).json(GetRunResponse.parse(formatRun(run)));
});

router.get("/runs/:runId", async (req, res) => {
  const run = await runService.getRun(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  res.json(GetRunResponse.parse(formatRun(run)));
});

router.get("/runs/:runId/transcript", async (req, res) => {
  const run = await runService.getRun(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  const messages = await transcriptService.getTranscript(req.params.runId);
  res.json(
    GetTranscriptResponse.parse(
      messages.map((m) => ({
        id: String(m.id),
        runId: m.runId,
        createdAt: m.createdAt?.toISOString(),
        phase: m.phase ?? undefined,
        agentKey: m.agentKey ?? undefined,
        roleType: m.roleType ?? undefined,
        messageType: m.messageType ?? undefined,
        content: m.content,
        sortOrder: m.sortOrder,
      }))
    )
  );
});

router.get("/runs/:runId/artifacts", async (req, res) => {
  const run = await runService.getRun(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  const artifacts = await artifactService.getArtifacts(req.params.runId);
  res.json(
    GetArtifactsResponse.parse(
      artifacts.map((a) => ({
        id: String(a.id),
        runId: a.runId,
        createdAt: a.createdAt?.toISOString(),
        artifactType: a.artifactType,
        title: a.title ?? undefined,
        contentText: a.contentText ?? undefined,
        storagePath: a.storagePath ?? undefined,
      }))
    )
  );
});

router.post("/runs/:runId/founders/start", async (req, res) => {
  const run = await runService.getRun(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  const nextOrder = await transcriptService.getNextSortOrder(run.id);

  await transcriptService.addTranscriptMessage({
    runId: run.id,
    phase: "founders",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: "Founder debate phase initiated. AI co-CEOs are analyzing the opportunity space...",
    sortOrder: nextOrder,
  });

  await transcriptService.addTranscriptMessage({
    runId: run.id,
    phase: "founders",
    agentKey: "tech",
    roleType: "founder",
    messageType: "idea",
    content: "[PLACEHOLDER] Tech CEO would propose ideas here based on the keywords provided.",
    sortOrder: nextOrder + 1,
  });

  await transcriptService.addTranscriptMessage({
    runId: run.id,
    phase: "founders",
    agentKey: "market",
    roleType: "founder",
    messageType: "idea",
    content: "[PLACEHOLDER] Market CEO would evaluate market opportunity here.",
    sortOrder: nextOrder + 2,
  });

  await runService.updateRun(run.id, { phase: "founders", status: "running" });

  res.json(
    StartFoundersResponse.parse({
      status: "placeholder",
      message: "TODO: Founder loop not yet implemented. Placeholder messages added.",
      runId: run.id,
    })
  );
});

router.post("/runs/:runId/workers/start", async (req, res) => {
  const run = await runService.getRun(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  const nextOrder = await transcriptService.getNextSortOrder(run.id);

  await transcriptService.addTranscriptMessage({
    runId: run.id,
    phase: "workers",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: "Worker phase initiated. Specialist agents are generating deliverables...",
    sortOrder: nextOrder,
  });

  await transcriptService.addTranscriptMessage({
    runId: run.id,
    phase: "workers",
    agentKey: "builder",
    roleType: "worker",
    messageType: "artifact",
    content: "[PLACEHOLDER] Builder agent would generate product spec here.",
    sortOrder: nextOrder + 1,
  });

  await runService.updateRun(run.id, { phase: "workers", status: "running" });

  res.json(
    StartWorkersResponse.parse({
      status: "placeholder",
      message: "TODO: Worker loop not yet implemented. Placeholder messages added.",
      runId: run.id,
    })
  );
});

router.get("/runs/:runId/preview", async (req, res) => {
  const run = await runService.getRun(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  res.json(
    GetPreviewResponse.parse({
      status: "placeholder",
      message: "Preview generation not yet implemented",
      html: "<html><body><h1>Coming Soon</h1><p>Landing page preview will appear here.</p></body></html>",
    })
  );
});

export default router;
