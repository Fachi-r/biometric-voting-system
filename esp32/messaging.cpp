#include "secrets.h"
#include "messaging.h"
#include <PubSubClient.h>

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
  String payload = "{\"id\":" + String(id) +
                   ",\"success\":" + String(success ? "true" : "false") +
                   ",\"message\":\"" + message + "\"}";
  client.publish(TOPIC_FP_RESULT, payload.c_str());
  Serial.println("MQTT Published (result): " + payload);
}

void publishTemplate(uint16_t id, const String& hexTemplate) {
  String payload = "{\"id\":" + String(id) + ",\"template\":\"" + hexTemplate + "\"}";
  client.publish(TOPIC_FP_TEMPLATES, payload.c_str());
  Serial.println("MQTT Published (template): " + payload);
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
