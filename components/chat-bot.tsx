"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, X } from "lucide-react"
import "./chat-bot.css"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
}

interface ChatBotProps {
  webhookUrl: string
}

export default function ChatBot({ webhookUrl }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Check if user is new on component mount
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("chatbot_visited")
    if (hasVisitedBefore) {
      setIsNewUser(false)
      setHasSeenWelcome(true)
    }
  }, [])

  // Add welcome message when chat is opened for the first time
  useEffect(() => {
    if (isExpanded && isNewUser && !hasSeenWelcome) {
      // Mark user as visited
      localStorage.setItem("chatbot_visited", "true")
      setIsNewUser(false)
      setHasSeenWelcome(true)

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Bạn hãy đặt câu hỏi với bác sĩ tại đây nhé",
        sender: "bot",
      }
      setMessages([welcomeMessage])
    }
  }, [isExpanded, isNewUser, hasSeenWelcome])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isExpanded) {
      scrollToBottom()
    }
  }, [messages, isExpanded])

  // Focus input when chat is expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Handle click outside to close chat on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && chatRef.current && !chatRef.current.contains(event.target as Node) && window.innerWidth < 768) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleChat = () => {
    setIsExpanded(!isExpanded)
  }

  // Format message text to handle newlines and preserve formatting
  const formatMessageText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <span key={i} className="message-line">
        {line || " "}
      </span>
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Send message to webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage.text }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          Array.isArray(data) && data[0]?.output
            ? data[0].output.trim()
            : "Xin lỗi, tôi không thể trả lời câu hỏi này.",
        sender: "bot",
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.",
        sender: "bot",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-container">
      {/* Chat Widget */}
      <div ref={chatRef} className={`chat-widget ${isExpanded ? "expanded" : ""}`}>
        {/* Chat header */}
        <div className="chat-header">
          <h3 className="chat-title">Hỗ trợ khách hàng</h3>
          <button onClick={toggleChat} className="close-button" aria-label="Đóng chat">
            <X size={18} />
          </button>
        </div>

        {/* Messages area */}
        <div className="messages-area">
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.sender === "user" ? "user-message" : "bot-message"}`}
              >
                <div className={`message ${message.sender === "user" ? "user" : "bot"}`}>
                  <div className="message-content">{formatMessageText(message.text)}</div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="message-wrapper bot-message">
                <div className="message bot">
                  <div className="message-content">
                    <div className="loading-indicator">
                      <span>Đang trả lời</span>
                      <span className="loading-dots">
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="input-field"
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading || !inputValue.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Chat Button with floating animation */}
      <button
        onClick={toggleChat}
        className={`chat-button ${isExpanded ? "hidden" : ""}`}
        aria-label="Mở chat hỗ trợ khách hàng"
      >
        <div className="button-content">
          <MessageCircle size={24} className="button-icon" />
          <span className="button-text">CSKH</span>
        </div>

        {/* New message notification for new users */}
        {isNewUser && !isExpanded && <div className="notification-badge">1</div>}

        {/* Unread message indicator for returning users */}
        {!isNewUser && !isExpanded && messages.length > 0 && messages.some((m) => m.sender === "bot") && (
          <div className="notification-badge">{messages.filter((m) => m.sender === "bot").length}</div>
        )}
      </button>
    </div>
  )
}
