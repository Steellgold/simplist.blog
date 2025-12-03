"use client"

import * as LucideIcons from "lucide-react"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SearchButton } from "@/components/search-button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@simplist/ui/components/sidebar"

export type SidebarItem = {
  title: string
  href: string
  description?: string
  icon?: string
  category?: string
  order?: number
}

type Props = {
  items: SidebarItem[]
}

export const AppSidebar = ({ items }: Props) => {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>

                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Docs</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchButton />
      </SidebarHeader>

      <SidebarContent>
        {(() => {
          const groupedItems = items.reduce((acc, item) => {
            const category = item.category || ""
            if (!acc[category]) acc[category] = []
            acc[category].push(item)
            return acc
          }, {} as Record<string, SidebarItem[]>)

          return Object.entries(groupedItems).map(([category, categoryItems]) => (
            <SidebarGroup key={category || "no-category"}>
              {category && <SidebarGroupLabel>{category}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {categoryItems.map((item) => {
                    const Icon =
                      item.icon && (LucideIcons as any)[item.icon]
                        ? ((LucideIcons as any)[item.icon] as React.ComponentType<{ className?: string }>)
                        : null

                    const isActive = pathname === item.href

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} className="flex items-center gap-2">
                            {Icon && <Icon className="size-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        })()}
      </SidebarContent>
    </Sidebar>
  )
};
