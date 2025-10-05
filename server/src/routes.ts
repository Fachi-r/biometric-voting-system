import express from "express";
import {
  lastSeenTimestamp,
  requestFingerprintVerify,
  requestFingerprintEnroll,
  requestFingerprintTemplates,
  requestEnrollmentCount,
  requestResetTemplates,
  requestFingerprintTemplateById,
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
  const { userId } = req.body;
  userId ?
    requestFingerprintTemplateById(userId)
    :
    requestFingerprintTemplates();
  res.json({ message: "Requested fingerprint templates from ESP32" });
});

router.get("/fingerprint/enrolled", (req, res) => {
  requestEnrollmentCount();
  res.json({ message: "Requested Enrollment Count from ESP32" });
});

// Debug Purposes
router.get("/fingerprint/reset", (req, res) => {
  requestResetTemplates();
  res.json({ message: "Requested fingerprint Reset from ESP32" });
});

export default router;
