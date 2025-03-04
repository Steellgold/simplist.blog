"use client";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Rendered } from "@workspace/ui/components/rendered";
import { SidebarMenuButton } from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AppWindow, Check, Minus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useId } from "react";

const items = [
  { value: "1", label: "Light", image: "/assets/ui-light.png" },
  { value: "2", label: "Dark", image: "/assets/ui-dark.png" },
  { value: "3", label: "System", image: "/assets/ui-system.png" },
];

export const AppSidebarTheme = () => {
  const id = useId();
  const { theme, setTheme } = useTheme();

  if (!theme) return <Skeleton className="h-12 w-full" />;

  return (
    <Rendered>
      <Dialog>
        <DialogTrigger asChild>
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {theme === "light" && <Sun className="size-4" />}
                {theme === "dark" && <Moon className="size-4" />}
                {theme === "system" && <AppWindow className="size-4" />}
              </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Choose a theme</span>
              <span className="truncate text-xs">
                {theme === "light" && "Light"}
                {theme === "dark" && "Dark"}
                {theme === "system" && "System"}
              </span>
            </div>
          </SidebarMenuButton>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
              <AppWindow className="opacity-80" size={16} strokeWidth={2} />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">Update theme</DialogTitle>
              <DialogDescription className="sm:text-center">
                Choose a theme that works best for you.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <fieldset className="space-y-4">
            <RadioGroup
              className="flex gap-3"
              defaultValue={theme === "light" ? "1" : theme === "dark" ? "2" : "3"}
              onValueChange={(value) => {
                console.log(value);
                const item = items[parseInt(value) - 1];
                if (item) setTheme(item.label.toLowerCase());
              }}
            >
              {items.map((item) => (
                <label key={`${id}-${item.value}`}>
                  <RadioGroupItem
                    id={`${id}-${item.value}`}
                    value={item.value}
                    className="peer sr-only after:absolute after:inset-0"
                  />
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={88}
                    height={70}
                    className="relative cursor-pointer overflow-hidden rounded-lg border border-input shadow-sm shadow-black/5 outline-offset-2 transition-colors peer-[:focus-visible]:outline peer-[:focus-visible]:outline-2 peer-[:focus-visible]:outline-ring/70 peer-data-[disabled]:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-[disabled]:opacity-50"
                  />
                  <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="peer-data-[state=unchecked]:group-[]:hidden"
                      aria-hidden="true"
                    />
                    <Minus
                      size={16}
                      strokeWidth={2}
                      className="peer-data-[state=checked]:group-[]:hidden"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">{item.label}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>
        </DialogContent>
      </Dialog>
    </Rendered>
  )
}