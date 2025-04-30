"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useSocketConnection = (userId, token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const connect = useCallback(() => {
    if (!userId || !token) {
      console.log("useSocketConnection: Missing userId or token");
      return;
    }

    console.log("useSocketConnection: Connecting to", SOCKET_SERVER_URL);
    if (socketRef.current) {
      console.log("useSocketConnection: Disconnecting existing socket");
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("useSocketConnection: Socket connected");
      setIsConnected(true);
      setError(null);
      setReconnectAttempts(0);

      if (reconnectTimerRef.current) {
        console.log("useSocketConnection: Clearing reconnect timer");
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    });

    socket.on("connect_error", (err) => {
      console.error("useSocketConnection: Socket connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
      setReconnectAttempts((prev) => prev + 1);
    });

    socket.on("disconnect", (reason) => {
      console.log("useSocketConnection: Socket disconnected, reason:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect" || reason === "transport close") {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        console.log(`useSocketConnection: Scheduling reconnect after ${delay}ms (attempt ${reconnectAttempts + 1})`);
        reconnectTimerRef.current = setTimeout(() => {
          console.log("useSocketConnection: Attempting to reconnect...");
          connect();
        }, delay);
      }
    });

    socket.on("error", (err) => {
      console.error("useSocketConnection: Socket error:", err);
      setError(err.message || "Unknown socket error");
    });

    socketRef.current = socket;

    return socket;
  }, [userId, token, reconnectAttempts]);

  useEffect(() => {
    console.log("useSocketConnection: useEffect triggered, userId:", userId);
    const socket = connect();

    return () => {
      console.log("useSocketConnection: Cleaning up");
      if (reconnectTimerRef.current) {
        console.log("useSocketConnection: Clearing reconnect timer");
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        console.log("useSocketConnection: Disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return { socket: socketRef.current, isConnected, error };
};