#include <Adafruit_Fingerprint.h>
#include "fingerprint_util.h"

// Use the globally defined mySerial and finger
extern HardwareSerial mySerial;
extern Adafruit_Fingerprint finger;

// Download and print all templates stored in the sensor
void downloadAllTemplates(uint16_t maxTemplates, uint8_t maxRetries) {
  Serial.println("=== STARTING BULK TEMPLATE DOWNLOAD ===");

  for (uint16_t id = 1; id <= maxTemplates; id++) {
    Serial.print("\nAttempting ID "); Serial.println(id);
    uint8_t p = finger.loadModel(id);

    if (p == FINGERPRINT_OK) {
      Serial.println("Model loaded successfully.");
    } else {
      Serial.print("No template or load failed (error code ");
      Serial.print(p);
      Serial.println("). Skipping.");
      continue;
    }

    uint8_t retries = 0;
    bool success = false;
    uint32_t startTime = millis();

    while (retries < maxRetries && !success) {
      Serial.print("Downloading attempt "); Serial.println(retries + 1);

      p = finger.getModel();
      if (p == FINGERPRINT_OK) {
        Serial.println("Template streaming started.");
        uint8_t bytesReceived[534];
        memset(bytesReceived, 0xff, 534);

        int i = 0;
        uint32_t readStart = millis();
        while (i < 534 && (millis() - readStart) < 10000) {
          if (mySerial.available()) {
            bytesReceived[i++] = mySerial.read();
          }
        }
        Serial.print(i); Serial.println(" bytes read.");

        if (i == 534) {
          Serial.println("Template successfully downloaded.");
          success = true;
        } else {
          Serial.println("Incomplete template, retrying...");
          retries++;
        }
      } else {
        Serial.print("getModel failed (error code ");
        Serial.print(p);
        Serial.println("). Retrying...");
        retries++;
      }
    }

    uint32_t endTime = millis();
    Serial.print("Total time for ID ");
    Serial.print(id);
    Serial.print(": ");
    Serial.print((endTime - startTime) / 1000.0, 2);
    Serial.println(" sec\n");
  }

  Serial.println("=== DONE ===");
}
