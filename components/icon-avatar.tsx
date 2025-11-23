import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/auth-client";
import { cn, getUserInitials } from "@/lib/utils";
import type { Project } from "@simplist/db/types";
import { FC } from "react";

type Props = {
  user: User;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: number;
}

export const UserIconAvatar: FC<Props> = ({ user, size = "md", rounded = 60 }) => {
  return (
    <Avatar className={cn("rounded-lg", {
      "size-4": size === "xs",
      "size-6": size === "sm",
      "size-8": size === "md",
      "size-10": size === "lg"
    })}>
      <AvatarImage
        src={
          user.image
            ? user.image
            : `https://avatar.vercel.sh/${user.name.toLowerCase().replaceAll(" ", "")}?rounded=${rounded}`
        }
        alt={user.name}
        width={32}
        height={32}
      />

      <AvatarFallback className="rounded-lg">
        {getUserInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

type ProjectProps = {
  project: Project | null;
  size?: "xs" | "sm" | "md" | "lg";
}

export const ProjectIconAvatar: FC<ProjectProps> = ({ project, size = "md" }) => {
  if (!project) {
    return <></>;
  }

  return (
    <Avatar className={cn("rounded-lg", {
      "size-4": size === "xs",
      "size-6": size === "sm",
      "size-8": size === "md",
      "size-10": size === "lg"
    })}>
      <AvatarImage
        src={project.icon ? project.icon : `https://avatar.vercel.sh/${project.name.toLowerCase().replaceAll(" ", "")}`}
        alt={project.name}
        width={32}
        height={32}
      />

      <AvatarFallback className="rounded-lg">
        {getUserInitials(project.name)}
      </AvatarFallback>
    </Avatar>
  )
}