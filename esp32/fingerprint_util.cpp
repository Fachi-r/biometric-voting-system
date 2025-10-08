// fingerprint_util.cpp
#include <Adafruit_Fingerprint.h>
#include "fingerprint_util.h"
#include "messaging.h"
#include "fingerprint.h"  // for enrolledCount (extern)
#include "mbedtls/sha256.h"
#include <Arduino.h>


extern HardwareSerial mySerial;
extern Adafruit_Fingerprint finger;
extern uint16_t enrolledCount;  // from fingerprint.cpp

#define TEMPLATE_PAYLOAD_SIZE 512  // the actual template payload size
#define PACKET_HEADER_PREFIX_1 0xEF
#define PACKET_HEADER_PREFIX_2 0x01
#define PACKET_HEADER_SIZE 9     // 0xEF 0x01 + 4-byte addr + packet id + length(2)
#define READ_TIMEOUT_MS 10000UL  // adjust if needed

// Helper: ask sensor for template count; fall back to enrolledCount or fallbackMax
uint16_t getStoredTemplateCount(uint16_t fallbackMax) {
  uint16_t count = 0;
  uint8_t rc = finger.getTemplateCount();
  if (rc == FINGERPRINT_OK) {
    // Adafruit library stores count in finger.templateCount
    count = (uint16_t)finger.templateCount;
    if (count > 0) {
      return count;
    }
  }

  // fallback to persisted enrolledCount if available
  if (enrolledCount > 0) return enrolledCount;

  // last fallback: use provided fallbackMax
  return fallbackMax;
}

// Wait until we see 0xEF 0x01 in sequence or timeout
static bool waitForPacketHeader(uint32_t deadline) {
  while (millis() < deadline) {
    if (mySerial.available() >= 2) {
      int b1 = mySerial.read();
      if (b1 == PACKET_HEADER_PREFIX_1) {
        int b2 = mySerial.peek();
        if (b2 == PACKET_HEADER_PREFIX_2) {
          // leave stream positioned at the second header byte for the next readBytes
          return true;
        } else {
          // continue scanning
          continue;
        }
      }
    }
    delay(1);
  }
  return false;
}

// Attempts to download and publish a template for a given ID.
// Returns true if published successfully, false otherwise.
bool downloadTemplateById(uint16_t id, uint8_t maxRetries) {
  if (id == 0) {
    Serial.println("downloadTemplateById: invalid id 0");
    publishEnrolmentStatus(STATUS_ERROR, "Invalid template ID requested (0).");
    return false;
  }

  Serial.printf("Attempting to load template ID %u\n", (unsigned)id);

  static uint8_t templatePayload[TEMPLATE_PAYLOAD_SIZE];

  for (uint8_t attempt = 0; attempt < maxRetries; ++attempt) {
    Serial.printf("  attempt %u/%u\n", (unsigned)(attempt + 1), (unsigned)maxRetries);

    // clear any stale bytes
    while (mySerial.available()) mySerial.read();

    // load model into buffer (sensor internal)
    uint8_t r = finger.loadModel(id);
    if (r != FINGERPRINT_OK) {
      Serial.printf("  loadModel returned %u\n", (unsigned)r);
      delay(100);
      continue;  // try next attempt
    }

    // tell sensor to send model
    r = finger.getModel();
    if (r != FINGERPRINT_OK) {
      Serial.printf("  getModel returned %u\n", (unsigned)r);
      delay(50);
      continue;
    }

    // collect payload bytes from incoming packets until we've got TEMPLATE_PAYLOAD_SIZE
    size_t collected = 0;
    uint32_t startMs = millis();
    uint32_t deadline = startMs + READ_TIMEOUT_MS;

    while (collected < TEMPLATE_PAYLOAD_SIZE && millis() < deadline) {
      // find packet header
      if (!waitForPacketHeader(deadline)) {
        Serial.println("  header not found within timeout");
        break;
      }

      // read the rest of the header (we already consumed first byte earlier)
      // We expect PACKET_HEADER_SIZE bytes total: 0xEF 0x01, addr(4), pid(1), len(2)
      uint8_t header[PACKET_HEADER_SIZE];
      header[0] = PACKET_HEADER_PREFIX_1;
      // read the remaining bytes (PACKET_HEADER_SIZE - 1)
      size_t got = mySerial.readBytes(header + 1, PACKET_HEADER_SIZE - 1);
      if (got != PACKET_HEADER_SIZE - 1) {
        Serial.printf("  header read incomplete: expected %d got %u\n", PACKET_HEADER_SIZE - 1, (unsigned)got);
        break;  // try next attempt
      }

      // length field is header[7]<<8 | header[8] (big endian)
      uint16_t packetLen = ((uint16_t)header[7] << 8) | header[8];
      if (packetLen < 3) {
        Serial.printf("  invalid packetLen %u\n", (unsigned)packetLen);
        // consume the rest to keep stream in sync
        if (mySerial.available()) mySerial.read();
        continue;
      }

      uint16_t payloadLen = packetLen - 2;  // minus checksum bytes
      // Sanity bound payloadLen — sensor sends chunks, typically 256 or smaller
      if (payloadLen > 1024) {
        Serial.printf("  suspicious payloadLen %u, skipping\n", (unsigned)payloadLen);
        // consume payload+checksum to resync
        uint8_t tmp[256];
        size_t toConsume = (payloadLen + 2 <= sizeof(tmp)) ? payloadLen + 2 : sizeof(tmp);
        mySerial.readBytes(tmp, toConsume);
        continue;
      }

      // read payloadLen bytes (the actual payload chunk)
      uint8_t chunkBuf[512];  // chunk won't exceed this
      size_t readGot = mySerial.readBytes(chunkBuf, payloadLen);
      if (readGot != payloadLen) {
        Serial.printf("  payload read short: expected %u got %u\n", (unsigned)payloadLen, (unsigned)readGot);
        break;  // attempt failed
      }

      // append to templatePayload
      size_t toCopy = min((size_t)payloadLen, TEMPLATE_PAYLOAD_SIZE - collected);
      memcpy(templatePayload + collected, chunkBuf, toCopy);
      collected += toCopy;

      // read & discard checksum (2 bytes)
      uint8_t checksum[2];
      size_t csGot = mySerial.readBytes(checksum, 2);
      if (csGot != 2) {
        Serial.println("  checksum read incomplete");
        break;
      }
    }  // end collect loop

    if (collected == TEMPLATE_PAYLOAD_SIZE) {
      Serial.println("Template payload collected successfully.");
      // publish via messaging (base64)
      publishTemplate(id, templatePayload, TEMPLATE_PAYLOAD_SIZE);
      publishEnrolmentStatus(STATUS_SUCCESS, "Template downloaded and published for ID " + String(id));
      return true;
    } else {
      Serial.printf("  collected %u/%u bytes (attempt %u failed)\n", (unsigned)collected, (unsigned)TEMPLATE_PAYLOAD_SIZE, (unsigned)(attempt + 1));
      delay(200);
      // next attempt
    }
  }  // attempts

  publishEnrolmentStatus(STATUS_ERROR, "Template download failed for ID " + String(id));
  return false;
}

// Bulk download using single-template downloader; uses sensor template count if available
void downloadAllTemplates(uint16_t maxTemplates, uint8_t maxRetries) {
  Serial.println("=== STARTING BULK TEMPLATE DOWNLOAD ===");

  // Get available count from sensor (fallback to provided maxTemplates)
  uint16_t sensorCount = getStoredTemplateCount(maxTemplates);
  Serial.printf("Sensor reported %u templates available (using upper bound %u)\n", (unsigned)sensorCount, (unsigned)maxTemplates);

  // Cap to maxTemplates param to avoid insane loops
  uint16_t upper = min(sensorCount, maxTemplates);

  if (upper == 0) {
    Serial.println("No templates reported; nothing to download.");
    publishEnrolmentStatus(STATUS_ERROR, "No templates to download.");
    return;
  }

  for (uint16_t id = 1; id <= upper; ++id) {
    Serial.printf("Downloading template for ID %u\n", (unsigned)id);
    bool ok = downloadTemplateById(id, maxRetries);
    if (!ok) {
      Serial.printf("Failed to download ID %u (continuing)\n", (unsigned)id);
      // continue — we don't abort whole bulk on single fail
    }
    delay(100);  // small spacing between downloads
  }

  Serial.println("=== BULK DOWNLOAD COMPLETE ===");
  publishEnrolmentStatus(STATUS_SUCCESS, "Bulk template download complete.");
}
