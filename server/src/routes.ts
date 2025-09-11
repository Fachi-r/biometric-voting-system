import express from "express";
import {
  lastSeenTimestamp,
  sendBulbCommand,
  requestFingerprintVerify,
  requestFingerprintEnroll,
  requestFingerprintTemplates,
} from "./mqttClient";

const router = express.Router();

// ESP32 health check
router.get("/status", (req, res) => {
  if (!lastSeenTimestamp) return res.json({ online: false });

  const now = new Date();
  const diff = now.getTime() - lastSeenTimestamp.getTime();
  const isOnline = diff < 15000;

  res.json({ online: isOnline, lastSeen: lastSeenTimestamp });
});

// Bulb control
router.post("/bulb", (req, res) => {
  const { state } = req.body;
  if (!state || !["on", "off"].includes(state)) {
    return res.status(400).json({ message: `Invalid state: ${state}` });
  }
  sendBulbCommand(state as "on" | "off");
  res.json({ message: `Bulb command sent: ${state}` });
});

// Fingerprint endpoints
router.post("/fingerprint/verify", (req, res) => {
  const { userId } = req.body;
  requestFingerprintVerify(userId);
  res.json({ message: `Verify request sent for user ${userId}` });
});

router.post("/fingerprint/enroll", (req, res) => {
  const { userId } = req.body;

  requestFingerprintEnroll(userId);
  res.json({ message: `Enroll request sent for user ${userId}` });
});

router.get("/fingerprint/templates", (req, res) => {
  requestFingerprintTemplates();
  res.json({ message: "Requested fingerprint templates from ESP32" });
});

export default router;
