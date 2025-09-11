#ifndef MESSAGING_H
#define MESSAGING_H

#include <Arduino.h>

// Enrolment statuses
enum EnrolmentStatus {
  STATUS_PLACE_FINGER,
  STATUS_IMAGE_TAKEN,
  STATUS_REMOVE_FINGER,
  STATUS_PLACE_FINGER_AGAIN,
  STATUS_IMAGE_TAKEN_AGAIN,
  STATUS_MODEL_CREATED,
  STATUS_STORED,
  STATUS_DOWNLOADING_TEMPLATE,
  STATUS_SUCCESS,
  STATUS_ERROR,
  STATUS_WAITING_FOR_FINGER
};

// Topics
// --- MQTT topics (mirror server) ---
#define TOPIC_FP_COMMAND "esp32/fingerprint/command"
#define TOPIC_FP_STATUS "esp32/fingerprint/status"
#define TOPIC_FP_RESULT "esp32/fingerprint/result"
#define TOPIC_FP_TEMPLATES "esp32/fingerprint/templates"
#define TOPIC_HEALTH "esp32/health"

// Function declarations
String statusToString(EnrolmentStatus status);
void publishEnrolmentStatus(EnrolmentStatus status, String message);
void publishTemplate(uint16_t id, const String& hexTemplate);
void reconnect();

#endif
