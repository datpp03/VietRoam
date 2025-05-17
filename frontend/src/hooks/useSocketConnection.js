import { useEffect, useState } from "react";
import io from "socket.io-client";

export const useSocketConnection = (userId, token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !token) {
      console.error("useSocketConnection: Missing userId or token", { userId, token });
      setError("Thiếu thông tin đăng nhập");
      return;
    }

    console.log("useSocketConnection: Initializing socket with userId:", userId);

    const newSocket = io("http://localhost:3001", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("useSocketConnection: Socket connected, socketId:", newSocket.id);
      setIsConnected(true);
      setError(null);
      newSocket.emit("login", userId);
      console.log("useSocketConnection: Emitted login with userId:", userId);
    });

    newSocket.on("connect_error", (err) => {
      console.error("useSocketConnection: Connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("useSocketConnection: Socket disconnected, reason:", reason);
      setIsConnected(false);
      setError("Mất kết nối máy chủ chat");
    });

    newSocket.on("error", (error) => {
      console.error("useSocketConnection: Server error:", error);
      setError(error.message || "Lỗi máy chủ chat");
    });

    setSocket(newSocket);

    return () => {
      console.log("useSocketConnection: Cleaning up socket");
      newSocket.close();
    };
  }, [userId, token]);

  return { socket, isConnected, error };
};