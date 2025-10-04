import dotenv from "dotenv";
import mqtt from "mqtt";
import { broadcastData } from "./webSocket";

dotenv.config();

export const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "", {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

export let lastSeenTimestamp = new Date();

// --- Topics ---
const TOPICS = {
  HEALTH: "esp32/health",
  FP_COMMAND: "esp32/fingerprint/command",
  FP_STATUS: "esp32/fingerprint/status",
  FP_COUNT: "esp32/fingerprint/count",
  FP_RESULT: "esp32/fingerprint/result",
  FP_TEMPLATES: "esp32/fingerprint/templates",
};

// Subscribe to ESP32 topics
mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");

  Object.values(TOPICS).forEach((t) => {
    if (t.endsWith("/command")) return; // don’t sub to command topics
    mqttClient.subscribe(t);
  });
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

mqttClient.on("message", (topic, message) => {
  let payload: any;
  try {
    payload = JSON.parse(message.toString());
  } catch (err) {
    console.error(`Failed to parse JSON on ${topic}:`, err);
    return;
  }

  switch (topic) {
    case TOPICS.HEALTH:
      lastSeenTimestamp = new Date();
      broadcastData(JSON.stringify({ type: "esp32-health", status: payload.status }));
      break;

    // 🔐 Fingerprint updates
    case TOPICS.FP_STATUS:
      broadcastData(JSON.stringify({ type: "fingerprint-status", ...payload }));
      break;

    case TOPICS.FP_COUNT:
      broadcastData(JSON.stringify({ type: "fingerprint-status", ...payload }));
      break;

    case TOPICS.FP_RESULT:
      broadcastData(JSON.stringify({ type: "fingerprint-result", ...payload }));
      break;

    case TOPICS.FP_TEMPLATES:
      broadcastData(JSON.stringify({ type: "fingerprint-templates", templates: payload.templates }));
      break;

    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
});

// --- Helper functions for publishing fingerprint commands ---
export const requestFingerprintVerify = (userId: number | null = null) => {
  mqttClient.publish(TOPICS.FP_COMMAND, JSON.stringify({ action: "verify", userId }));
};

export const requestFingerprintEnroll = (userId: number | null = null) => {
  mqttClient.publish(TOPICS.FP_COMMAND, JSON.stringify({ action: "enroll", userId }));
};

export const requestFingerprintTemplates = () => {
  mqttClient.publish(TOPICS.FP_COMMAND, JSON.stringify({ action: "download-templates" }));
};

export const requestEnrollmentCount = () => {
  mqttClient.publish(TOPICS.FP_COMMAND, JSON.stringify({ action: "enrolled-count" }))
};

// Debug purposes
export const requestResetTemplates = () => {
  mqttClient.publish(TOPICS.FP_COMMAND, JSON.stringify({ action: "reset-enrollments" }));
};
