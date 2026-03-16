import { Router, type IRouter } from "express";
import healthRouter from "./health";
import runsRouter from "./runs";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(runsRouter);
router.use(configRouter);

export default router;
