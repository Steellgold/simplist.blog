import { DocsSidebar } from "@/components/docs-sidebar";
import { SearchCommand } from "@/components/search-command";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { ThemeProvider } from "@simplist/ui/components/shared/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@simplist/ui/components/sidebar";
import "@simplist/ui/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { FC, PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] });

const slogan = "Where simplicity meets powerful content management";
const defaultUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://docs.simplist.blog";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: `Simplist Documentation - ${slogan}`,
    template: "%s - Simplist Docs",
  },
  description:
    "Complete documentation for Simplist - a simple, fast content management API. Learn how to use the REST API, SDK, analytics, and more.",
  keywords: [
    "Simplist documentation",
    "Simplist API docs",
    "headless CMS API",
    "REST API documentation",
    "TypeScript SDK",
    "content management API tutorial",
    "API reference",
    "blog API guide",
    "analytics API",
    "webhook documentation",
    "CMS integration",
    "developer documentation",
    "API examples",
    "SDK guide",
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
    siteName: "Simplist Documentation",
    title: `Simplist Documentation - ${slogan}`,
    description:
      "Complete documentation for Simplist - a simple, fast content management API. Learn how to use the REST API, SDK, analytics, and more.",
    images: [
      {
        url: "https://cdn.simplist.blog/assets/og-image-docs.png",
        width: 1200,
        height: 630,
        alt: `Simplist Documentation - ${slogan}`,
      },
    ],
  },
  twitter: {
    site: "@steellgold",
    card: "summary_large_image",
    creator: "@steellgold",
    creatorId: "1779571985149820928",
    description:
      "Complete documentation for Simplist - a simple, fast content management API. Learn how to use the REST API, SDK, analytics, and more.",
    images: [
      {
        url: "https://cdn.simplist.blog/assets/og-image-docs.png",
        width: 1200,
        height: 630,
        alt: `Simplist Documentation - ${slogan}`,
      },
    ],
    title: `Simplist Documentation - ${slogan}`,
  },
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <DocsSidebar />

            <SidebarInset className="overflow-x-hidden">
              <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16">
                <SidebarTrigger />
                <ThemeSwitcher />
              </div>

              <main className="max-w-full overflow-x-hidden p-4 pt-16 sm:p-8">
                {children}
              </main>
            </SidebarInset>
            <SearchCommand />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
