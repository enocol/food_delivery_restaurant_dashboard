import { createContext, useContext, useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [orders, setOrders] = useState([]);
  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      setServerReady(false);
      setOrders([]);
      return;
    }

    const s = getSocket(token);
    setSocket(s);

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => {
      setConnected(false);
      setServerReady(false);
    });
    s.on("connect_error", (err) => {
      console.error("[socket] connection error:", err.message);
      setConnected(false);
      setServerReady(false);
    });

    // Backend confirms authenticated connection
    s.on("connected", (data) => {
      console.log("[socket] server ready:", data);
      setServerReady(true);
    });

    // Incoming order
    s.on("new_order", (order) => {
      setOrders((prev) => [
        { ...order, _receivedAt: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    });

    // Signal consumers to refetch REST data after a reconnect
    s.on("reconnect", () => {
      console.log("[socket] reconnected — triggering REST refetch");
      setReconnectCount((n) => n + 1);
    });

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("connect_error");
      s.off("connected");
      s.off("new_order");
      s.off("reconnect");
    };
  }, [token]);

  // Reconnect when the tab becomes visible again after sleep / background
  useEffect(() => {
    if (!socket) return;

    function handleVisibility() {
      if (document.visibilityState === "visible" && !socket.connected) {
        console.log("[socket] tab visible — reconnecting");
        socket.connect();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, serverReady, orders, reconnectCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
