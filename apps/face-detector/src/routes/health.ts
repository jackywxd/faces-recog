import { Router } from "express";
import { config } from "../config";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "healthy",
    service: "face-detector",
    version: config.version,
    environment: config.environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export const healthRoutes: Router = router;
