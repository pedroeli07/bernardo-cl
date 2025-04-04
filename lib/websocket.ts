"use client"

import { useEffect, useState } from "react"

type WebSocketStatus = "connecting" | "open" | "closed" | "error"

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<WebSocketStatus>("connecting")
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(url)

    // Connection opened
    ws.addEventListener("open", () => {
      setStatus("open")
      console.log("WebSocket connection established")
    })

    // Listen for messages
    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data)
        setMessages((prev) => [...prev, data])
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    })

    // Connection closed
    ws.addEventListener("close", () => {
      setStatus("closed")
      console.log("WebSocket connection closed")
    })

    // Connection error
    ws.addEventListener("error", (error) => {
      setStatus("error")
      console.error("WebSocket error:", error)
    })

    setSocket(ws)

    // Clean up on unmount
    return () => {
      ws.close()
    }
  }, [url])

  // Function to send messages
  const sendMessage = (data: any) => {
    if (socket && status === "open") {
      socket.send(JSON.stringify(data))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  return { status, messages, sendMessage }
}

