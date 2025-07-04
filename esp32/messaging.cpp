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
  client.publish("voting/enrolment/status", payload.c_str());
  Serial.println("MQTT Published: " + payload);
}

void publishTemplate(uint16_t id, const String& hexTemplate) {
  String payload = "{\"id\":" + String(id) + ",\"template\":\"" + hexTemplate + "\"}";
  client.publish("voting/enrolment/template", payload.c_str());
  Serial.println("Template published: " + payload);
}

void sendHeartbeat() {
  String statusPayload = "{\"status\":\"alive\"}";
  client.publish("esp32/health", statusPayload.c_str());
  Serial.println("MQTT Data Published: " + statusPayload);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (  client.connect("fingerprintClient", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
      // client.subscribe(topic_sub);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying...");
      delay(5000);
    }
  }
}