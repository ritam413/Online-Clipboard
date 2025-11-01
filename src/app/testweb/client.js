// client.js
import { io } from "socket.io-client";

// Create the socket globally so it survives hot reloads
const SOCKET_URL = "http://localhost:3001";

let socket;

if (!global.socket) {
  global.socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
  });
  console.log("✅ New socket instance created");
} else {
  console.log("♻️ Using existing socket instance");
}

socket = global.socket;

export { socket };
