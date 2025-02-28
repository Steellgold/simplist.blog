"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { PropsWithChildren } from "react"
import { Component } from "@workspace/ui/components/utils/component";
import { NoOrganizations } from "@/app/(app)/_components/no-organizations";

export const NewOrganization: Component<PropsWithChildren> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sm:text-center">
            Create your organization
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            Organizations are a way to group your projects and teams together in one place.
          </DialogDescription>
        </DialogHeader>
        
        <NoOrganizations isFrame />
      </DialogContent>
    </Dialog>
  )
}