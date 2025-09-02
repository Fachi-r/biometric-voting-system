# ESP32 Firmware

This directory contains firmware code for the ESP32.

## Stack
- **Arduino Framework** (using Arduino IDE or PlatformIO)
- **Libraries:**
  - [PubSubClient](https://pubsubclient.knolleary.net) – MQTT client
  - [Adafruit Fingerprint Sensor Library](https://github.com/adafruit/Adafruit-Fingerprint-Sensor-Library)
  - [WiFiClientSecure](https://www.arduino.cc/en/Reference/WiFiClientSecure) – Secure MQTT connections
- **Additional Tweaks:**
  - Custom retry logic for fingerprint template download
  - Removal of timeouts in initial finger placement loops
  - Reconnection logic to handle Wi-Fi and MQTT dropouts
  
## Environment Variables
Create `secrets.h`:

```cpp
#ifndef SECRETS_H
#define SECRETS_H

// WiFi credentials
#define WIFI_SSID     "yourWifi"
#define WIFI_PASSWORD "yourPassword"

// MQTT credentials
#define MQTT_SERVER   "mqttServerUrl.cloud"
#define MQTT_PORT     8883
#define MQTT_USERNAME "yourMqttUser"
#define MQTT_PASSWORD "yourMqttPass"

#endif
```

## How It Works
1. Connects to Wi-Fi and the MQTT broker.
2. Reads fingerprint data (enrollment and verification).
3. Publishes sensor and status data over MQTT.
4. Listens for commands (e.g., download templates, enroll new fingerprints).

## Uploading Firmware
1. Open in Arduino IDE.
2. Install required libraries.
3. Select:
   - **Board:** ESP32 Dev Module
   - **Port:** Your USB port
4. Upload the sketch.

## Notes
- Fingerprint sensor requires correct wiring (TX/RX).
- Wi-Fi credentials must be configured in the sketch.
- Debug output is available via Serial Monitor.
