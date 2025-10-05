// main.ino (merged with serial admin)
#define MQTT_MAX_PACKET_SIZE 2048  // or 1500 — big enough for your base64 template + JSON
#include <PubSubClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <HardwareSerial.h>
#include <WiFiClientSecure.h>
#include <Adafruit_Fingerprint.h>
#include <Preferences.h>

// Custom Modules
#include "secrets.h"
#include "messaging.h"
#include "fingerprint.h"
#include "fingerprint_util.h"

// Networking / MQTT
WiFiClientSecure wifiClient;
PubSubClient client(wifiClient);

// Use HardwareSerial on ESP32
HardwareSerial mySerial(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// externs from other compilation units
extern Preferences preferences;  // declared/defined in fingerprint.cpp
extern uint16_t enrolledCount;   // declared/defined in fingerprint.cpp

// Functions in other files (prototypes)
bool downloadTemplateById(uint16_t id, uint8_t maxRetries);
void downloadAllTemplates(uint16_t maxTemplates, uint8_t maxRetries);
void publishEnrolmentCount();
void publishEnrolmentStatus(EnrolmentStatus status, String message);
void resetEnrolmentCount();
uint8_t enrollFingerprint(uint16_t id);
uint8_t verifyFingerprint();

// -----------------------------------------------------------------------------
// Serial admin utilities (probe, delete, CLI)
// -----------------------------------------------------------------------------

// Non-destructive probe of slots 1..capacity (prints status)
void probeFingerprintSlots() {
  Serial.println("== Fingerprint Diagnostic Probe ==");
  if (finger.getTemplateCount() == FINGERPRINT_OK) {
    Serial.print("Sensor templateCount: ");
    Serial.println(finger.templateCount);
  } else {
    Serial.println("Unable to read templateCount from sensor.");
  }

  Serial.print("Capacity: ");
  Serial.println(finger.capacity);
  Serial.print("Packet length: ");
  Serial.println(finger.packet_len);
  Serial.print("Baud rate: ");
  Serial.println(finger.baud_rate);

  Serial.println("\nProbing each slot (1..capacity). This may take a while...");
  for (uint16_t id = 1; id <= finger.capacity; ++id) {
    uint8_t r = finger.loadModel(id);
    if (r == FINGERPRINT_OK) {
      Serial.printf("ID %u: PRESENT (loadModel returned %u)\n", (unsigned)id, (unsigned)r);
    } else if (r == FINGERPRINT_DBRANGEFAIL) {
      Serial.printf("ID %u: CORRUPT/DBRANGEFAIL (code %u)\n", (unsigned)id, (unsigned)r);
    } else if (r == FINGERPRINT_PACKETRECIEVEERR) {
      Serial.printf("ID %u: PACKET RECEIVE ERR (code %u)\n", (unsigned)id, (unsigned)r);
    } else if (r == FINGERPRINT_NOTFOUND) {
      Serial.printf("ID %u: NOT FOUND (code %u)\n", (unsigned)id, (unsigned)r);
    } else {
      Serial.printf("ID %u: OTHER ERROR code %u\n", (unsigned)id, (unsigned)r);
    }
    delay(30);  // throttle
  }
  Serial.println("== Probe complete ==");
}

// Delete a single template slot, update persisted count and publish
bool deleteTemplateId(uint16_t id) {
  if (id == 0) return false;
  Serial.printf("Deleting template ID %u ...\n", (unsigned)id);
  uint8_t res = finger.deleteModel(id);
  if (res == FINGERPRINT_OK) {
    Serial.printf("deleteModel succeeded for ID %u\n", (unsigned)id);
    if (enrolledCount > 0) {
      enrolledCount--;
      preferences.putUInt("enrolledCount", enrolledCount);
      publishEnrolmentCount();
    }
    publishEnrolmentStatus(STATUS_SUCCESS, "Deleted template ID " + String(id));
    return true;
  } else {
    Serial.printf("deleteModel failed (code %u) for ID %u\n", (unsigned)res, (unsigned)id);
    publishEnrolmentStatus(STATUS_ERROR, "Failed to delete template ID " + String(id));
    return false;
  }
}

// Serial command handler (type command then Enter)
void handleSerialCommands() {
  if (!Serial.available()) return;

  // Read a line (until newline)
  String line = Serial.readStringUntil('\n');
  line.trim();
  if (line.length() == 0) return;

  // Split command and arg
  String cmd = line;
  String arg;
  int sp = line.indexOf(' ');
  if (sp != -1) {
    cmd = line.substring(0, sp);
    arg = line.substring(sp + 1);
    arg.trim();
  }
  cmd.toLowerCase();

  if (cmd == "help") {
    Serial.println(F("Serial commands:"));
    Serial.println(F("  help                 - show this"));
    Serial.println(F("  info                 - sensor info"));
    Serial.println(F("  count                - getTemplateCount() and persisted count"));
    Serial.println(F("  probe | p            - probe all slots 1..capacity"));
    Serial.println(F("  download <id>        - download & publish template for id"));
    Serial.println(F("  download-all         - bulk download templates"));
    Serial.println(F("  delete <id>          - delete template id"));
    Serial.println(F("  delall confirm       - empty DB (dangerous)"));
    Serial.println(F("  enrolled-count       - prints enrolledCount (persisted)"));
    Serial.println(F("  enroll <id>          - run enroll flow for id (same as 'e' key)"));
    Serial.println(F("  verify               - run verify flow (same as 'v' key)"));
    return;
  }

  if (cmd == "info") {
    Serial.println("=== Sensor Info ===");
    Serial.print("Capacity: ");
    Serial.println(finger.capacity);
    Serial.print("TemplateCount(raw): ");
    if (finger.getTemplateCount() == FINGERPRINT_OK) Serial.println(finger.templateCount);
    else Serial.println("unknown");
    Serial.print("Packet length: ");
    Serial.println(finger.packet_len);
    Serial.print("Baud rate: ");
    Serial.println(finger.baud_rate);
    return;
  }

  if (cmd == "count") {
    if (finger.getTemplateCount() == FINGERPRINT_OK) {
      Serial.print("Sensor reports templateCount = ");
      Serial.println(finger.templateCount);
    } else {
      Serial.println("getTemplateCount() failed");
    }
    Serial.print("Persisted enrolledCount = ");
    Serial.println(enrolledCount);
    return;
  }

  if (cmd == "probe" || cmd == "p") {
    probeFingerprintSlots();
    return;
  }

  if (cmd == "download") {
    if (arg.length() == 0) {
      Serial.println("Usage: download <id>");
      return;
    }
    uint16_t id = (uint16_t)arg.toInt();
    if (id == 0) {
      Serial.println("Invalid id 0. use 1..capacity");
      return;
    }
    Serial.printf("Serial command: download %u\n", (unsigned)id);
    bool ok = downloadTemplateById(id, 3);
    Serial.printf("downloadTemplateById returned %s\n", ok ? "true" : "false");
    return;
  }

  if (cmd == "download-all") {
    Serial.println("Serial command: bulk download (downloadAllTemplates)");
    downloadAllTemplates((uint16_t)finger.capacity, 3);
    return;
  }

  if (cmd == "delete") {
    if (arg.length() == 0) {
      Serial.println("Usage: delete <id>");
      return;
    }
    uint16_t id = (uint16_t)arg.toInt();
    if (id == 0) {
      Serial.println("Invalid id 0. use 1..capacity");
      return;
    }
    deleteTemplateId(id);
    return;
  }

  if (cmd == "delall") {
    if (arg == "confirm") {
      Serial.println("Emptying fingerprint database (finger.emptyDatabase()) now.");
      uint8_t r = finger.emptyDatabase();
      if (r == FINGERPRINT_OK) {
        enrolledCount = 0;
        preferences.putUInt("enrolledCount", enrolledCount);
        publishEnrolmentCount();
        publishEnrolmentStatus(STATUS_SUCCESS, "Database emptied (delall confirm)");
        Serial.println("emptyDatabase: OK. enrolledCount reset to 0.");
      } else {
        Serial.printf("emptyDatabase failed with code %u\n", (unsigned)r);
        publishEnrolmentStatus(STATUS_ERROR, "emptyDatabase failed");
      }
    } else {
      Serial.println("This is dangerous. To proceed type: delall confirm");
    }
    return;
  }

  if (cmd == "enrolled-count") {
    Serial.printf("Persisted enrolledCount = %u\n", (unsigned)enrolledCount);
    return;
  }

  if (cmd == "enroll") {
    if (arg.length() == 0) {
      Serial.println("Usage: enroll <id>");
      return;
    }
    uint16_t id = (uint16_t)arg.toInt();
    Serial.printf("Serial: enrolling id %u\n", (unsigned)id);
    enrollFingerprint(id);
    return;
  }

  if (cmd == "verify") {
    verifyFingerprint();
    return;
  }

  Serial.print("Unknown command: '");
  Serial.print(cmd);
  Serial.println("'. Type 'help' for options.");
}

// -----------------------------------------------------------------------------
// Setup / Loop / MQTT callback
// -----------------------------------------------------------------------------

void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;  // For Leonardo/Micro/Zero compatibility (harmless elsewhere)

  // Start serial for sensor
  mySerial.begin(57600, SERIAL_8N1, 16, 17);

  // WiFi connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected.");

  // MQTT
  wifiClient.setInsecure();  // demo only
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setBufferSize(2048);  // attempt to set runtime buffer as well
  Serial.printf("PubSubClient buffer size: %u\n", client.getBufferSize());

  client.setCallback(mqttCallback);

  // Fingerprint persistence
  preferences.begin("fingerprint", false);
  enrolledCount = preferences.getUInt("enrolledCount", 0);
  Serial.print("Loaded enrolledCount: ");
  Serial.println(enrolledCount);

  // Fingerprint sensor init + initial probe
  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
    // run the probe once on startup so you immediately see slot status
    probeFingerprintSlots();
  } else {
    Serial.println("Fingerprint sensor not found :(");
    while (1) { delay(1); }  // block if sensor isn't present
  }
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) reconnect();
  client.loop();

  // Serial admin CLI (line-based). Also allows quick keys below
  handleSerialCommands();

  // Legacy single character shortcuts (still useful from Serial Monitor without newline)
  if (Serial.available()) {
    // peek instead of read to avoid consuming a line in the CLI
    int c = Serial.peek();
    if (c != -1 && c != '\n' && c != '\r') {
      // If user typed a single key and hit enter, the CLI above would have consumed it.
      // These single-letter shortcuts are kept for quick manual tests:
      char ch = Serial.read();
      if (ch == 'e') enrollFingerprint(enrolledCount);
      else if (ch == 'v') verifyFingerprint();
      else if (ch == 't') downloadAllTemplates(20, 3);
      // If it was part of a longer line, handleSerialCommands already processed it.
    }
  }
}

// --- MQTT Callback ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // ensure safe C-string null termination
  if (length >= 1) {
    payload[length] = '\0';
  } else {
    payload[length] = '\0';
  }
  String msg = String((char*)payload);

  Serial.printf("MQTT Message on [%s]: %s\n", topic, msg.c_str());

  // Handle fingerprint commands
  if (strcmp(topic, TOPIC_FP_COMMAND) == 0) {
    DynamicJsonDocument doc(512);
    DeserializationError err = deserializeJson(doc, msg);
    if (err) {
      Serial.println("Failed to parse fingerprint command JSON");
      return;
    }

    String action = doc["action"] | "";
    uint16_t userId = doc["userId"] | 0;

    if (action == "verify") {
      Serial.println("Fingerprint: Verify request");
      verifyFingerprint();
    } else if (action == "enroll") {
      if (userId == 0) {
        publishEnrolmentStatus(STATUS_ERROR, "Invalid userId for enroll");
      } else {
        Serial.printf("Fingerprint: Enroll request for user %d\n", userId);
        enrollFingerprint(userId);
      }
    } else if (action == "download-templates") {
      uint16_t maxT = doc["max"] | 20;
      uint8_t retries = doc["retries"] | 3;
      downloadAllTemplates(maxT, retries);
    } else if (action == "download-template") {
      if (userId == 0) {
        publishEnrolmentStatus(STATUS_ERROR, "Invalid userId for download-template");
      } else {
        Serial.printf("Fingerprint: Download template request for ID %d\n", userId);
        downloadTemplateById(userId, 3);
      }
    } else if (action == "enrolled-count") {
      Serial.println("Fingerprint: Get Enrollment Count");
      publishEnrolmentCount();
    } else if (action == "reset-enrollments") {
      Serial.println("Resetting all enrollments...");
      resetEnrolmentCount();
      publishEnrolmentCount();
    } else {
      Serial.printf("Unknown fingerprint action: %s\n", action.c_str());
    }
  }
}
