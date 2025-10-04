#include "fingerprint.h"
#include "messaging.h"
#include <Adafruit_Fingerprint.h>
#include <Preferences.h>

// Use the globally defined mySerial and finger
extern HardwareSerial mySerial;
extern Adafruit_Fingerprint finger;

Preferences preferences;

// Global counter of enrolled fingerprints
uint16_t enrolledCount = 0;

String encodeTemplateHex(const uint8_t* buffer) {
  String encoded = "";
  for (int i = 0; i < 512; i++) {
    if (buffer[i] < 16) encoded += "0";
    encoded += String(buffer[i], HEX);
  }
  return encoded;
}

bool downloadTemplate(uint16_t id, uint8_t* outBuffer) {
  // Load template into buffer 1
  int p = finger.loadModel(id);
  if (p != FINGERPRINT_OK) {
    publishEnrolmentStatus(STATUS_ERROR, "Failed to load template.");
    return false;
  }

  // Start transfer
  p = finger.getModel();
  if (p != FINGERPRINT_OK) {
    publishEnrolmentStatus(STATUS_ERROR, "Failed to get model.");
    return false;
  }

  uint8_t bytesReceived[534];
  memset(bytesReceived, 0xFF, 534);

  uint32_t startTime = millis();
  int i = 0;
  while (i < 534 && (millis() - startTime) < 10000) {
    if (mySerial.available()) {
      bytesReceived[i++] = mySerial.read();
    }
  }

  if (i != 534) {
    publishEnrolmentStatus(STATUS_ERROR, "Incomplete template received.");
    return false;
  }

  // Extract the 512-byte template
  int uindex = 9, index = 0;
  memcpy(outBuffer + index, bytesReceived + uindex, 256);
  uindex += 256 + 2 + 9;
  index += 256;
  memcpy(outBuffer + index, bytesReceived + uindex, 256);

  return true;
}

uint8_t enrollFingerprint(uint16_t id) {
  enum EnrolmentState {
    STATE_WAIT_FINGER_1,
    STATE_CAPTURE_1,
    STATE_REMOVE,
    STATE_WAIT_FINGER_2,
    STATE_CAPTURE_2,
    STATE_CREATE_MODEL,
    STATE_STORE_MODEL,
    STATE_DOWNLOAD_TEMPLATE,
    STATE_DONE
  };

  EnrolmentState state = STATE_WAIT_FINGER_1;
  int p = -1;
  int retries = 0;
  const int MAX_RETRIES = 3;

  uint8_t templateBuffer[512];

  while (true) {
    switch (state) {
      case STATE_WAIT_FINGER_1:
        publishEnrolmentStatus(STATUS_PLACE_FINGER, "Place your finger.");
        while ((p = finger.getImage()) != FINGERPRINT_OK) {
          if (p == FINGERPRINT_NOFINGER) continue;
        }
        retries = 0;
        state = STATE_CAPTURE_1;
        break;

      case STATE_CAPTURE_1:
        p = finger.image2Tz(1);
        if (p == FINGERPRINT_OK) {
          publishEnrolmentStatus(STATUS_IMAGE_TAKEN, "First image captured.");
          state = STATE_REMOVE;
        } else {
          publishEnrolmentStatus(STATUS_ERROR, "Error processing image.");
          return p;
        }
        break;

      case STATE_REMOVE:
        publishEnrolmentStatus(STATUS_REMOVE_FINGER, "Remove your finger.");
        delay(2000);
        while ((p = finger.getImage()) != FINGERPRINT_NOFINGER) {}
        state = STATE_WAIT_FINGER_2;
        break;

      case STATE_WAIT_FINGER_2:
        publishEnrolmentStatus(STATUS_PLACE_FINGER_AGAIN, "Place the same finger again.");
        while ((p = finger.getImage()) != FINGERPRINT_OK) {
          if (p == FINGERPRINT_NOFINGER) continue;
        }
        retries = 0;
        state = STATE_CAPTURE_2;
        break;

      case STATE_CAPTURE_2:
        p = finger.image2Tz(2);
        if (p == FINGERPRINT_OK) {
          publishEnrolmentStatus(STATUS_IMAGE_TAKEN_AGAIN, "Second image captured.");
          state = STATE_CREATE_MODEL;
        } else {
          publishEnrolmentStatus(STATUS_ERROR, "Error processing second image.");
          return p;
        }
        break;

      case STATE_CREATE_MODEL:
        p = finger.createModel();
        if (p == FINGERPRINT_OK) {
          publishEnrolmentStatus(STATUS_MODEL_CREATED, "Model created.");
          state = STATE_STORE_MODEL;
        } else {
          publishEnrolmentStatus(STATUS_ERROR, "Fingerprints did not match.");
          return p;
        }
        break;

      case STATE_STORE_MODEL:
        p = finger.storeModel(id);
        if (p == FINGERPRINT_OK) {
          publishEnrolmentStatus(STATUS_STORED, "Model stored.");
          enrolledCount++;
          preferences.putUInt("enrolledCount", enrolledCount);
          Serial.print("Enrolled count persisted: ");
          Serial.println(enrolledCount);

          state = STATE_DOWNLOAD_TEMPLATE;
        } else {
          publishEnrolmentStatus(STATUS_ERROR, "Error storing model.");
          return p;
        }
        break;

      case STATE_DOWNLOAD_TEMPLATE:
        publishEnrolmentStatus(STATUS_DOWNLOADING_TEMPLATE, "Downloading template...");
        if (downloadTemplate(id, templateBuffer)) {
          String hexTemplate = encodeTemplateHex(templateBuffer);
          publishTemplate(id, hexTemplate);
          state = STATE_DONE;
        } else {
          return FINGERPRINT_PACKETRECIEVEERR;
        }
        break;

      case STATE_DONE:
        publishEnrolmentStatus(STATUS_SUCCESS, "Enrollment complete.");
        return FINGERPRINT_OK;
    }
  }
}

uint8_t verifyFingerprint() {
  publishEnrolmentStatus(STATUS_PLACE_FINGER, "Place finger for verification...");

  int p = -1;
  // Wait for finger to be placed
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        delay(50);
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }
  }

  // Convert image to template
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) {
    Serial.println("Image conversion failed");
    publishEnrolmentStatus(STATUS_ERROR, "Image conversion failed");
    return p;
  }

  // Search for a match
  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.print("Found a print match! ID: ");
    Serial.println(finger.fingerID);
    publishEnrolmentStatus(STATUS_SUCCESS, "Match found with ID: " + String(finger.fingerID));
  } else if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("No match found");
    publishEnrolmentStatus(STATUS_ERROR, "No match found");
  } else {
    Serial.println("Search error");
    publishEnrolmentStatus(STATUS_ERROR, "Search error");
  }

  return p;
}
