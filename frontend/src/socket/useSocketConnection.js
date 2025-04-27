"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io } from "socket.io-client"

const SOCKET_SERVER_URL = "http://localhost:5000"

export const useSocketConnection = (userId) => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const socketRef = useRef(null)
  const reconnectTimerRef = useRef(null)

  const connect = useCallback(() => {
    if (!userId) return

    // Clear any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
 
    // Initialize socket connection
    const socket = io(SOCKET_SERVER_URL, {
      auth: { userId },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)
      setError(null)
      setReconnectAttempts(0)

      // Clear any reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
      setError(err.message)
      setIsConnected(false)

      // Increment reconnect attempts
      setReconnectAttempts((prev) => prev + 1)
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)

      // If the disconnection was initiated by the server, try to reconnect
      if (reason === "io server disconnect" || reason === "transport close") {
        // Manual reconnection with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000)

        reconnectTimerRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect (attempt ${reconnectAttempts + 1})...`)
          connect()
        }, delay)
      }
    })

    socket.on("error", (err) => {
      console.error("Socket error:", err)
      setError(err.message || "Unknown socket error")
    })

    socketRef.current = socket

    return socket
  }, [userId, reconnectAttempts])

  // Initialize connection
  useEffect(() => {
    const socket = connect()

    // Cleanup on unmount
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [connect])

  return { socket: socketRef.current, isConnected, error }
}
