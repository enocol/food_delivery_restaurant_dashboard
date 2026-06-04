import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

/**
 * Creates (or returns the existing) socket connection authenticated with the JWT.
 * @param {string} token  – Bearer JWT
 * @returns {import("socket.io-client").Socket}
 */
export function getSocket(token) {
  if (socket) return socket;

  socket = io(BASE_URL, {
    auth: { token },
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

/**
 * Disconnects and destroys the socket instance.
 * Call this on logout.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
