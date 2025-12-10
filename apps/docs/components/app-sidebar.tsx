"use client"

import * as LucideIcons from "lucide-react"
import { ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { HttpMethodIcon } from "@/components/api-route-icons"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@simplist/ui/components/dropdown-menu"
import { Package, Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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

type Mode = 'sdk' | 'api'

export const AppSidebar = ({ items }: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const httpMethodIcons = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])

  const getCurrentMode = (): Mode => {
    if (pathname.startsWith('/api')) return 'api'
    return 'sdk'
  }

  const toggleMode = (mode: Mode) => {
    router.push(mode === 'sdk' ? '/sdk' : '/api')
  }

  const currentMode = getCurrentMode()

  const filteredItems = items.filter(item => {
    if (currentMode === 'api' as Mode) {
      return item.href.startsWith('/api')
    } else {
      return !item.href.startsWith('/api')
    }
  })

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className={cn(
                      "flex aspect-square size-8 items-center justify-center rounded-lg",
                      currentMode === 'sdk' && 'bg-border text-foreground',
                      currentMode === 'api' && 'bg-border text-foreground'
                    )}>
                      {currentMode === 'sdk' && <Package size={20} />}
                      {currentMode === 'api' && <Globe size={20} />}
                    </div>

                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-medium">
                        {
                          currentMode === 'sdk'
                            ? 'SDK Docs'
                              : currentMode === 'api'
                                ? 'REST API'
                                  : 'Documentation'
                        }
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {currentMode === 'sdk' ? 'Client Library' : 'Endpoints'}
                      </span>
                    </div>

                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width)"
                  align="start"
                >
                  <DropdownMenuItem onClick={() => toggleMode('sdk')}>
                    <Package />
                    <span>SDK Docs</span>
                    {currentMode === 'sdk' && <Check className="ml-auto" />}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => toggleMode('api')}>
                    <Globe />
                    <span>REST API</span>
                    {currentMode === 'api' && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchButton />
      </SidebarHeader>

      <SidebarContent>
        {(() => {
          const groupedItems = filteredItems.reduce((acc, item) => {
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
                    const isHttpMethodIcon = item.icon && httpMethodIcons.has(item.icon)

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} className="flex items-center gap-2">
                            {isHttpMethodIcon && <HttpMethodIcon method={item.icon as any} size="sm" />}
                            {!isHttpMethodIcon && Icon && <Icon className="size-4" />}
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
