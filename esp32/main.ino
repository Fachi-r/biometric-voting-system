#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <WiFiClientSecure.h>

// TODO: Add verification logic
// TODO: Refactor messaging functions into messaging.cpp
// TODO: Add global fingerprint counter to track stored fingerprint IDs
// TODO: Add Duplex communication between Server and ESP32

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
