import { Router, type IRouter } from "express";
import { HealthCheckResponse, TestOpenRouterResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { chatCompletion } from "../lib/openrouter.js";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus = "disconnected";
  try {
    await pool.query("SELECT 1");
    dbStatus = "connected";
  } catch {
    dbStatus = "error";
  }

  const data = HealthCheckResponse.parse({
    ok: dbStatus === "connected",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
  res.json(data);
});

router.post("/health/openrouter", async (_req, res) => {
  const result = await chatCompletion("openai/gpt-4o-mini", [
    { role: "user", content: "Return only the word OK" },
  ], 10);

  const data = TestOpenRouterResponse.parse({
    success: result.success,
    model: result.model,
    text: result.text,
    error: result.error,
  });
  res.json(data);
});

export default router;
