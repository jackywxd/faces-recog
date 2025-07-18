import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Photo Face Recognition",
    template: "%s | Photo Face Recognition",
  },
  description: "基于 AI 的照片人脸识别系统，快速找到包含相同人脸的照片",
  keywords: ["人脸识别", "AI", "照片搜索", "面部检测", "图像识别"],
  authors: [{ name: "Face Recognition Team" }],
  creator: "Face Recognition Team",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),

  // Open Graph
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    title: "Photo Face Recognition",
    description: "基于 AI 的照片人脸识别系统",
    siteName: "Photo Face Recognition",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Photo Face Recognition",
    description: "基于 AI 的照片人脸识别系统",
  },

  // PWA 配置
  manifest: "/manifest.json",

  // 图标配置
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // 其他配置
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={cn(inter.variable)} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
