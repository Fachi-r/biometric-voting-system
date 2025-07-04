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

// Function declarations
String statusToString(EnrolmentStatus status);
void publishEnrolmentStatus(EnrolmentStatus status, String message);
void publishTemplate(uint16_t id, const String& hexTemplate);
void reconnect();

#endif
