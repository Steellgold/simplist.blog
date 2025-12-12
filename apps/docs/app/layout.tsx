import { DocsSidebar } from "@/components/docs-sidebar";
import { SearchCommand } from "@/components/search-command";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { ThemeProvider } from "@simplist/ui/components/shared/theme-provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@simplist/ui/components/sidebar";
import "@simplist/ui/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { FC, PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Simplist Docs",
  description: "Documentation for Simplist",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://docs.simplist.blog'),
}

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

              <main className="p-4 sm:p-8 pt-16 overflow-x-hidden max-w-full">{children}</main>
            </SidebarInset>
            <SearchCommand />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout;