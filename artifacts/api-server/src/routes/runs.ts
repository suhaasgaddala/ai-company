import { Router, type IRouter } from "express";
import * as path from "path";
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
import { runFounderPhase } from "../services/founderOrchestrator.js";
import { runWorkerPhase } from "../services/workerOrchestrator.js";

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

  if (run.status === "running" || run.status === "completed") {
    res.status(409).json({ error: "Founder debate already started or completed for this run" });
    return;
  }

  runFounderPhase(run.id).catch(async (err) => {
    console.error("Founder phase error:", err);
    await runService.updateRun(run.id, { status: "error", phase: "founders_error" });
  });

  res.json(
    StartFoundersResponse.parse({
      status: "started",
      message: "Founder debate started. Poll /transcript for live updates.",
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

  if (run.phase !== "founders_complete") {
    res.status(409).json({
      error: `Cannot start workers: founder phase is "${run.phase}", expected "founders_complete"`,
    });
    return;
  }

  runWorkerPhase(run.id).catch(async (err) => {
    console.error("Worker phase error:", err);
    await runService.updateRun(run.id, { status: "error", phase: "workers_error" });
  });

  res.json(
    StartWorkersResponse.parse({
      status: "started",
      message: "Worker phase started. Specialist agents are generating deliverables.",
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

  const artifacts = await artifactService.getArtifacts(req.params.runId);
  const previewArtifact = artifacts.find((a) => a.artifactType === "preview");

  if (!previewArtifact?.contentText) {
    res.json(
      GetPreviewResponse.parse({
        status: "pending",
        message: "Landing page preview not yet generated",
        html: undefined,
      })
    );
    return;
  }

  res.json(
    GetPreviewResponse.parse({
      status: "ready",
      message: "Landing page preview ready",
      html: previewArtifact.contentText,
    })
  );
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get("/runs/:runId/preview/page", async (req, res) => {
  const { runId } = req.params;
  if (!UUID_RE.test(runId)) {
    res.status(400).send("Invalid run ID");
    return;
  }

  const run = await runService.getRun(runId);
  if (!run) {
    res.status(404).send("<html><body><h1>Run not found</h1></body></html>");
    return;
  }

  const artifacts = await artifactService.getArtifacts(runId);
  const previewArtifact = artifacts.find((a) => a.artifactType === "preview");

  if (!previewArtifact?.contentText) {
    res.status(404).send("<html><body><h1>Preview not yet generated</h1></body></html>");
    return;
  }

  res.type("html").send(previewArtifact.contentText);
});

router.get("/runs/:runId/preview/static/:filename", async (req, res) => {
  const { runId, filename } = req.params;
  if (!UUID_RE.test(runId)) {
    res.status(400).send("Invalid run ID");
    return;
  }

  const allowedFiles = ["index.html", "styles.css", "app.js"];
  if (!allowedFiles.includes(filename)) {
    res.status(404).send("File not found");
    return;
  }

  const filePath = path.join(process.cwd(), "generated", runId, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

export default router;
