import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ClientProviders } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "500", "700"],
})

export const metadata: Metadata = {
  title: "DayOne — Field Knowledge to Micro-Learning",
  description:
    "Capture veteran worker knowledge from video and generate gamified micro-learning modules for new hires.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans min-h-screen starfield`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
