#define MQTT_MAX_PACKET_SIZE 2048  // or 1500 — big enough for your base64 template + JSON
#include <PubSubClient.h>
#include "secrets.h"
#include "messaging.h"
#include <mbedtls/sha256.h>  // Arduino HexHash helper
#include <ArduinoJson.h>

// Reference MQTT client defined in .ino
extern PubSubClient client;

String statusToString(EnrolmentStatus status) {
  switch (status) {
    case STATUS_PLACE_FINGER: return "place_finger";
    case STATUS_IMAGE_TAKEN: return "image_taken";
    case STATUS_REMOVE_FINGER: return "remove_finger";
    case STATUS_PLACE_FINGER_AGAIN: return "place_finger_again";
    case STATUS_IMAGE_TAKEN_AGAIN: return "image_taken_again";
    case STATUS_MODEL_CREATED: return "model_created";
    case STATUS_STORED: return "stored";
    case STATUS_DOWNLOADING_TEMPLATE: return "downloading_template";
    case STATUS_SUCCESS: return "success";
    case STATUS_ERROR: return "error";
    default: return "unknown";
  }
}

void publishEnrolmentStatus(EnrolmentStatus status, String message) {
  String payload = "{\"status\":\"" + statusToString(status) + "\",\"message\":\"" + message + "\"}";
  client.publish(TOPIC_FP_STATUS, payload.c_str());
  Serial.println("MQTT Published (status): " + payload);
}

void publishResult(uint16_t id, bool success, const String& message) {
  String payload = "{\"id\":" + String(id) + ",\"success\":" + String(success ? "true" : "false") + ",\"message\":\"" + message + "\"}";
  client.publish(TOPIC_FP_RESULT, payload.c_str());
  Serial.println("MQTT Published (result): " + payload);
}


void publishTemplate(uint16_t id, const uint8_t* buffer, size_t length) {
  // Hash the raw template bytes (no encode->decode nonsense)
  String hash = hashTemplate(buffer, length);

  // Build JSON: { "id": <id>, "template": "<hex-hash>" }
  StaticJsonDocument<256> doc;
  doc["id"] = id;
  doc["template"] = hash;

  char out[512];
  size_t outLen = serializeJson(doc, out, sizeof(out));

  bool ok = client.publish(TOPIC_FP_TEMPLATES, out, outLen);
  Serial.printf("publish template (hash only) id=%u len=%u -> ok=%d client_state=%d\n",
                id, (unsigned)outLen, ok, client.state());

  if (!ok) {
    publishEnrolmentStatus(STATUS_ERROR, "Template-hash publish failed");
  } else {
    Serial.printf("MQTT Published (template hash): %s\n", out);
  }
}

void publishEnrolmentCount() {
  String payload = "{\"enrolledCount\":" + String(enrolledCount) + "}";
  client.publish(TOPIC_FP_COUNT, payload.c_str());
  Serial.println("MQTT Published (enrolledCount): " + payload);
}

void sendHeartbeat() {
  String statusPayload = "{\"status\":\"alive\"}";
  client.publish(TOPIC_HEALTH, statusPayload.c_str());
  Serial.println("MQTT Data Published (heartbeat): " + statusPayload);
}

// --- Reconnect logic ---
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("fingerprintClient", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
      // Subscribe to all topics we care about
      client.subscribe(TOPIC_FP_COMMAND);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying...");
      delay(5000);
    }
  }
}

// --- Hashing Function ---
String hashTemplate(const uint8_t* data, size_t len) {
  // Compute SHA-256 of raw bytes
  unsigned char hash[32];
  mbedtls_sha256((const unsigned char*)data, len, hash, 0);  // 0 => SHA-256 (not 224)

  // Convert to hex string
  char hexBuf[65];
  for (int i = 0; i < 32; ++i) {
    sprintf(hexBuf + (i * 2), "%02x", hash[i]);
  }
  hexBuf[64] = '\0';
  return String(hexBuf);
}
