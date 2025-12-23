import { ObserverProvider } from "@simplist/ui/components/shared/observer-provider";
import { ThemeProvider } from "@simplist/ui/components/shared/theme-provider";
import { Toaster } from "@simplist/ui/components/sonner";
import "@simplist/ui/globals.css";
import type { Metadata } from "next";
import { Geist_Mono, Nunito, Syne } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
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
const description =
  "Simplist is a fast content management API that lets you publish articles in seconds and retrieve them from any app with clean, typed endpoints.";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: `Simplist - ${slogan}`,
    template: "%s - Simplist",
  },
  description,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Simplist",
    title: `Simplist - ${slogan}`,
    description,
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
    description,
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
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <ObserverProvider>{children}</ObserverProvider>
          </ThemeProvider>
        </NuqsAdapter>

        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
