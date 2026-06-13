import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "CalmPrep - Mental Wellness Companion",
  description: "Your exam-season mental wellness companion.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f6f1ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#7c5cff] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:font-bold focus:border-2 focus:border-[#141414]"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          <AuthProvider>
            <div id="main-content" className="min-h-screen flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
