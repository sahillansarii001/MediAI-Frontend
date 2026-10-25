import { io } from "socket.io-client";

let socketInstance = null;

export function getSocket() {
  if (typeof window === "undefined") return null;

  if (socketInstance && (socketInstance.connected || socketInstance.connecting)) {
    return socketInstance;
  }

  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const apiBase = isLocalhost
    ? "http://localhost:5000"
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

  const socketUrl = apiBase.replace(/\/api\/?$/, "").replace(/\/$/, "");

  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: false,
    });

    socketInstance.on("connect_error", (err) => {
      // Quiet warning instead of throwing unhandled call stack errors
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Socket] Connection deferred:", err.message);
      }
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    try {
      socketInstance.disconnect();
    } catch (e) {}
    socketInstance = null;
  }
}
