import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("https://petpulse-backend.onrender.com", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
}