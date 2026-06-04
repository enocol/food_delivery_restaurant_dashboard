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

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("connect_error");
      s.off("connected");
      s.off("new_order");
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected, serverReady, orders }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
