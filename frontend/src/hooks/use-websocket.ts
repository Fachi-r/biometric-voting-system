"use client";
import { useEffect, useState } from "react";

export const WEBSOCKET_URL = "https://mqtt-server-d88p.onrender.com";
// export const WEBSOCKET_URL = "http://localhost:4000";

export default function useWebSocket() {
   const [healthStatus, setHealthStatus] = useState("");
   const [fingerprintStatus, setFingerprintStatus] = useState({
      status: "",
      message: "",
   });

   let heartbeatTimeout: ReturnType<typeof setTimeout>;

   useEffect(() => {
      const socket = new WebSocket(WEBSOCKET_URL);

      socket.onopen = () => {
         console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
         const data = JSON.parse(event.data);

         switch (data.type) {
            case "esp32-health":
               clearTimeout(heartbeatTimeout);
               setHealthStatus("online");
               heartbeatTimeout = setTimeout(() => {
                  setHealthStatus("offline");
               }, 10000);
               break;

            case "fingerprint-status":
               setFingerprintStatus({
                  status: data.status,
                  message: data.message,
               });
               break;

            case "fingerprint-templates":
               console.log("Got template", data);
               break;

            default:
               console.log("Unknown message type:", data);
         }
      };

      socket.onclose = () => {
         console.log("WebSocket disconnected");
      };

      return () => {
         socket.close();
      };
   }, []);

   return { healthStatus, fingerprintStatus };
}
