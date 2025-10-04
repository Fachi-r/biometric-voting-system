#include <WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <HardwareSerial.h>
#include <WiFiClientSecure.h>
#include <Adafruit_Fingerprint.h>

// Custom Modules
#include "secrets.h"
#include "messaging.h"
#include "fingerprint.h"
#include "fingerprint_util.h"

WiFiClientSecure wifiClient;
PubSubClient client(wifiClient);

// Use HardwareSerial on ESP32
HardwareSerial mySerial(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup()  
{
  Serial.begin(115200);
  while (!Serial);  // For Leonardo/Micro/Zero
  // Start serial for sensor
  mySerial.begin(57600, SERIAL_8N1, 16, 17);  

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected.");

  // MQTT
  wifiClient.setInsecure(); // For demo
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(mqttCallback);

  // Fingerprint persistence
  preferences.begin("fingerprint", false);
  enrolledCount = preferences.getUInt("enrolledCount", 0);
  Serial.print("Loaded enrolledCount: ");
  Serial.println(enrolledCount);

  // Fingerprint
  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Fingerprint sensor not found :(");
    while (1) { delay(1); }
  }
}

void loop() {
  // MQTT maintain connection
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'e') enrollFingerprint(enrolledCount);
    if (c == 'v') verifyFingerprint();
    if (c == 't') downloadAllTemplates(20, 3);
  }
}

// --- MQTT Callback ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0'; // null-terminate
  String msg = String((char*)payload);

  Serial.printf("MQTT Message on [%s]: %s\n", topic, msg.c_str());

  // Handle fingerprint commands
  if (strcmp(topic, TOPIC_FP_COMMAND) == 0) {
    // Expected JSON: {"action":"verify"}
    DynamicJsonDocument doc(256);
    DeserializationError err = deserializeJson(doc, msg);
    if (err) {
      Serial.println("Failed to parse fingerprint command JSON");
      return;
    }

    String action = doc["action"] | "";
    uint16_t userId = doc["userId"] | enrolledCount;

    if (action == "verify") {
      Serial.printf("Fingerprint: Verify request");
      verifyFingerprint(); // pass userId if needed
    }
    else if (action == "enroll") {
      Serial.printf("Fingerprint: Enroll request for user %d\n", userId);
      enrollFingerprint(userId);
    }
    else if (action == "download-templates") {
      Serial.println("Fingerprint: Download templates request");
      downloadAllTemplates(20, 3); // adjust args as needed
    }
    else if (action == "enrolled-count") {
      Serial.println("Fingerprint: Get Enrollment Count");
      publishEnrolmentCount();
    }
    else if (action == "reset-enrollments") {
      Serial.println("Resetting all enrollments...");
      resetEnrolmentCount();
      publishEnrolmentCount();
    }
    else {
      Serial.printf("Unknown fingerprint action: %s\n", action.c_str());
    }
  }
}