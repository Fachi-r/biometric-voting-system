# Server

This directory contains the backend server that bridges the frontend and ESP32 device.

## Stack
- [Express.js](https://expressjs.com) – Web framework
- [MQTT.js](https://www.npmjs.com/package/mqtt) – MQTT client for ESP32 communication
- [Socket.IO](https://socket.io) or [ws](https://www.npmjs.com/package/ws) – Real-time communication with frontend
- [dotenv](https://www.npmjs.com/package/dotenv) – Environment variable management
- [cors](https://www.npmjs.com/package/cors) – CORS middleware
- [pnpm](https://pnpm.io)

## Scripts
- `pnpm install` – Install dependencies
- `pnpm dev` – Start development server (nodemon)
- `pnpm start` – Start production server

## Environment Variables
Create `.env`:

```bash
PORT=4000
MQTT_BROKER_URL="mqtts://<your-broker-url>:8883"
MQTT_USERNAME="your-mqtt-username"
MQTT_PASSWORD="your-mqtt-password"
```

## How It Works
- Receives data from the ESP32 via MQTT.
- Forwards real-time updates to the frontend via WebSocket.
- Provides REST endpoints for frontend actions (e.g., enrolling fingerprints, downloading templates).

## Notes
Ensure the MQTT broker is accessible.
