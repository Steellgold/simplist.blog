import { User } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { Project } from "@simplist/db/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@simplist/ui/components/avatar";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import {
  getColorValue,
  getIconTextColorWithBackgroundColorOf,
} from "@simplist/ui/lib/color";
import { i } from "@simplist/ui/lib/icons.enum";
import { getInitials } from "@simplist/ui/lib/utils";
import { FC } from "react";

type Props = {
  user: User;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: number;
};

export const UserIconAvatar: FC<Props> = ({
  user,
  size = "md",
  rounded = 60,
}) => {
  return (
    <Avatar
      className={cn("rounded-lg", {
        "size-4": size === "xs",
        "size-6": size === "sm",
        "size-8": size === "md",
        "size-10": size === "lg",
      })}
    >
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
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
};

type ProjectProps = {
  project: Project | null;
  size?: "xs" | "sm" | "md" | "lg";
  roundedSize?: "xs" | "sm" | "md" | "lg";
  onlyDot?: boolean;
  useVercelAvatar?: boolean;
};

export const ProjectIconAvatar: FC<ProjectProps> = ({
  project,
  size = "md",
  roundedSize = "lg",
  onlyDot = false,
  useVercelAvatar = false,
}) => {
  if (!project) {
    return <></>;
  }

  const iconName = i(project.icon || "building-2");
  const backgroundColor = getColorValue(project.color || "CYAN");
  const textColor = getIconTextColorWithBackgroundColorOf(
    project.color || "CYAN",
  );

  if (onlyDot) {
    return (
      <div className={cn("flex items-center justify-center")}>
        <div className="size-3.5 rounded-xs" style={{ backgroundColor }}></div>
      </div>
    );
  }

  // If project has an avatarUrl, use Avatar component with the image
  if (project.avatarUrl) {
    return (
      <Avatar
        className={cn({
          "size-4": size === "xs",
          "size-6": size === "sm",
          "size-8": size === "md",
          "size-10": size === "lg",
          "rounded-xs": roundedSize === "xs",
          "rounded-sm": roundedSize === "sm",
          "rounded-md": roundedSize === "md",
          "rounded-lg": roundedSize === "lg",
        })}
      >
        <AvatarImage
          src={project.avatarUrl}
          alt={project.name}
          width={32}
          height={32}
        />

        <AvatarFallback
          className={cn({
            "rounded-xs": roundedSize === "xs",
            "rounded-sm": roundedSize === "sm",
            "rounded-md": roundedSize === "md",
            "rounded-lg": roundedSize === "lg",
          })}
          style={{
            backgroundColor,
            color: textColor,
          }}
        >
          <IconRender
            name={iconName}
            className={cn({
              "size-2": size === "xs",
              "size-3": size === "sm",
              "size-4": size === "md",
              "size-5": size === "lg",
            })}
          />
        </AvatarFallback>
      </Avatar>
    );
  }

  if (useVercelAvatar) {
    return (
      <Avatar
        className={cn({
          "size-4": size === "xs",
          "size-6": size === "sm",
          "size-8": size === "md",
          "size-10": size === "lg",
          "rounded-xs": roundedSize === "xs",
          "rounded-sm": roundedSize === "sm",
          "rounded-md": roundedSize === "md",
          "rounded-lg": roundedSize === "lg",
        })}
      >
        <AvatarImage
          src={`https://avatar.vercel.sh/${project.name.toLowerCase().replaceAll(" ", "")}`}
          alt={project.name}
          width={32}
          height={32}
        />

        <AvatarFallback
          className={cn({
            "rounded-xs": roundedSize === "xs",
            "rounded-sm": roundedSize === "sm",
            "rounded-md": roundedSize === "md",
            "rounded-lg": roundedSize === "lg",
          })}
        >
          {getInitials(project.name)}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center", {
        "size-4": size === "xs",
        "size-6": size === "sm",
        "size-8": size === "md",
        "size-10": size === "lg",
        "rounded-xs": roundedSize === "xs",
        "rounded-sm": roundedSize === "sm",
        "rounded-md": roundedSize === "md",
        "rounded-lg": roundedSize === "lg",
      })}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <IconRender
        name={iconName}
        className={cn({
          "size-2": size === "xs",
          "size-3": size === "sm",
          "size-4": size === "md",
          "size-5": size === "lg",
        })}
      />
    </div>
  );
};
