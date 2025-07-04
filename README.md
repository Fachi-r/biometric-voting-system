# Project Monorepo

This repository contains all components for the project.

## Structure
- `/frontend` – Vite + React + Tailwind frontend
- `/server` – Express server bridging ESP32 and frontend
- `/blockchain` – Smart contracts and deployment scripts
- `/esp32` – ESP32 firmware (Arduino)

## Requirements
- [pnpm](https://pnpm.io) installed globally
- Node.js (LTS)
<!-- - Python 3.10+ (if you end up using FastAPI) -->
- Arduino IDE for ESP32 firmware

## Scripts
Install dependencies in all subfolders:
```bash
pnpm install
```

### Development
Run all services except ESP32 in parallel:
```bash 
pnpm dev
```

## Notes
The ESP32 must be connected and flashed manually.
