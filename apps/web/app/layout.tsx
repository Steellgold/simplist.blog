import { Analytics } from "@vercel/analytics/next";
import { ObserverProvider } from "@simplist/ui/components/shared/observer-provider";
import { ThemeProvider } from "@simplist/ui/components/shared/theme-provider";
import { Toaster } from "@simplist/ui/components/sonner";
import "@simplist/ui/globals.css";
import type { Metadata } from "next";
import { Geist_Mono, Nunito, Syne } from "next/font/google";
import { FC } from "react";

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

const slogan = "Where simplicity meets powerful content management";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: `Simplist - ${slogan}`,
    template: "%s - Simplist",
  },
  description:
    "Simplist is a simple, fast content management API. Post your content in the simplest way possible, and just get your content back with an API.",
  keywords: [
    "headless CMS",
    "content management API",
    "blog API",
    "REST API",
    "content API",
    "TypeScript SDK",
    "analytics",
    "content analytics",
    "blog platform",
    "documentation platform",
    "markdown blog",
    "API-first CMS",
    "developer tools",
    "content publishing",
    "JAMstack",
    "serverless CMS",
  ],
  icons: {
    icon: "/favicon.ico",
  },
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Simplist",
    title: `Simplist - ${slogan}`,
    description:
      "Simplist is a simple, fast content management API. Post your content in the simplest way possible, and just get your content back with an API.",
    images: [
      {
        url: "https://cdn.simplist.blog/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: `Simplist - ${slogan}`,
      },
    ],
  },
  twitter: {
    site: "@steellgold",
    card: "summary_large_image",
    creator: "@steellgold",
    creatorId: "1779571985149820928",
    description:
      "Simplist is a simple, fast content management API. Post your content in the simplest way possible, and just get your content back with an API.",
    images: [
      {
        url: "https://cdn.simplist.blog/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: `Simplist - ${slogan}`,
      },
    ],
    title: `Simplist - ${slogan}`,
  },
};

const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${syne.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ObserverProvider>{children}</ObserverProvider>
        </ThemeProvider>

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
