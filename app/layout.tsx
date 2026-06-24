import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🟢 1. ІМПОРТУЄМО НАШ КОМПОНЕНТ PWA
import PWARegister from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🟢 2. ДОДАЄМО НАЛАШТУВАННЯ ЕКРАНА ДЛЯ МОБІЛЬНИХ (Viewport)
// Це заборонить екрану "стрибати" при наближенні на iPhone і задасть колір верхньої шторки
export const viewport: Viewport = {
  themeColor: "#44bdf3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Аніматори Нері | Довідник аніматора",
  description: "База активностей для аніматорів",
  // 🟢 3. ПІДКЛЮЧАЄМО МАНІФЕСТ ДОДАТКА
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🟢 4. ВИПРАВЛЕНО lang="en" НА lang="uk" (бо сайт українською)
    <html
      suppressHydrationWarning lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/* 🟢 5. ДОДАЄМО АКТИВАТОР ОФЛАЙН-РЕЖИМУ */}
        <PWARegister />
        
        {children}
      </body>
    </html>
  );
}