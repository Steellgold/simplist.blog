import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Nunito, Syne, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FC } from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryProvider } from "@/lib/query-client";
import { ObserverProvider } from "@/components/shared/observer-provider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const slogan = "Where simplicity meets powerful content management"

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: `Simplist - ${slogan}`,
    template: "%s - Simplist",
  },
  description: "Simplist is a simple, fast. Post your content in the simplest way possible, and just get your content back with an API.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Simplist",
    title: `Simplist - ${slogan}`,
    description: "Simplist is a simple, fast. Post your content in the simplest way possible, and just get your content back with an API.",
    images: [
      {
        url: "https://cdn.simplist.blog/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: `Simplist - ${slogan}`
      }
    ]
  },
  twitter: {
    site: "@steellgold",
    card: "summary_large_image",
    creator: "@steellgold",
    creatorId: "1779571985149820928",
    description: "Simplist is a simple, fast. Post your content in the simplest way possible, and just get your content back with an API.",
    images: [
      {
        url: "https://cdn.simplist.blog/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: `Simplist - ${slogan}`
      }
    ],
    title: `Simplist - ${slogan}`
  }
};

const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${syne.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
            >
              <ObserverProvider>
                {children}
              </ObserverProvider>
            </ThemeProvider>
          </NuqsAdapter>

          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}

export default RootLayout;
