import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CanvasBackground } from "@/components/ui/canvas-background"
import { ThreeBackground } from "@/components/ui/three-background"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bernardo Poker - Dashboard",
  description: "Análise de desempenho em torneios de poker",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full">
      <body className={`${inter.className} w-full`}>
        <ThreeBackground />
        <CanvasBackground />
        <div className="relative flex min-h-screen flex-col w-full">
      
          <main className="flex-1 pt-2 w-full max-w-full">{children}</main>
        </div>
      </body>
    </html>
  )
}


