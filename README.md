# DECENTRALIZED BIOMETRIC VOTING PLATFORM

This repository contains all components for the project.

## Structure
- `/frontend` – Vite + React + Tailwind frontend
- `/server` – Express server bridging ESP32 and frontend
- `/blockchain` – Smart contracts and deployment scripts
- `/esp32` – ESP32 firmware (Arduino IDE)

## Requirements
- npm installed globally
- Node.js (LTS)
<!-- - Python 3.10+ (if you end up using FastAPI) -->
- Arduino IDE for ESP32 firmware

## Scripts
Install dependencies in all subfolders:
```bash
cd into the blochain folder and run npm install
cd info the frontend folder and run npm install
```

### Development
Run all services except ESP32 in parallel:
```bash 
blockchain folder : 1st = npx hardhat node
                    2nd = npx hardhat run scripts/deploy.js --network localhost
frontend folder  : npm run dev 
```

## Notes
The ESP32 must be connected and flashed manually.
