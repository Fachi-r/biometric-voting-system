import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import express from "express";

// Create the Express app and Attach it to server
export const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });

export let clients: Set<WebSocket> = new Set();

// Handle client connections
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to WebSocket");
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

// Export websocket function to broadcast data
export function broadcastData(data: any) {
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}
