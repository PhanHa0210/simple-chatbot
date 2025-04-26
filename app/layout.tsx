import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChatBot from "@/components/chat-bot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chatbot Demo",
  description: "Demo chatbot với nút CSKH",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
        <ChatBot webhookUrl="https://0mixv0zt.repcl.net/webhook/timmau" />
      </body>
    </html>
  )
}
