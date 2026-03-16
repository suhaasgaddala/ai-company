import { Router, type IRouter } from "express";
import { GetAgentConfigResponse } from "@workspace/api-zod";
import { FOUNDERS, WORKERS } from "../config/agents.js";

const router: IRouter = Router();

router.get("/config/agents", (_req, res) => {
  res.json(
    GetAgentConfigResponse.parse({
      founders: FOUNDERS.map((a) => ({
        key: a.key,
        displayName: a.displayName,
        roleType: a.roleType,
        defaultModel: a.defaultModel,
        color: a.color,
        description: a.description,
        avatar: a.avatar,
      })),
      workers: WORKERS.map((a) => ({
        key: a.key,
        displayName: a.displayName,
        roleType: a.roleType,
        defaultModel: a.defaultModel,
        color: a.color,
        description: a.description,
        avatar: a.avatar,
      })),
    })
  );
});

export default router;
