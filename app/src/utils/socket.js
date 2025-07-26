import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (process.env.NODE_ENV === "test") {
    // Return a dummy socket object in tests
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
    };
  }

  if (!socket) {
    socket = io("https://petpulse-backend.onrender.com", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
}