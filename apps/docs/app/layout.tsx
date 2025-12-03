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

            <SidebarInset>
              <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16">
                <SidebarTrigger />
                <ThemeSwitcher />
              </div>

              <main className="flex-1 overflow-auto p-8 pt-16">{children}</main>
            </SidebarInset>
            <SearchCommand />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout;