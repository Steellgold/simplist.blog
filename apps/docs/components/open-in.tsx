"use client";

import {
  ClaudeAI,
  GitHubDark,
  MicrosoftCopilot,
  OpenAIDark,
} from "@ridemountainpig/svgl-react";
import { Button } from "@simplist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { ChevronDown, ExternalLink } from "lucide-react";
import { FC } from "react";

interface OpenInProps {
  githubUrl: string;
  markdownUrl: string;
  className?: string;
}

const buildSearchUrl = (url: string) => {
  return `Read ${url}, I want to ask questions about it.`;
};

export const OpenIn: FC<OpenInProps> = ({
  githubUrl,
  markdownUrl,
  className,
}) => {
  const openInService = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const services = [
    {
      name: "GitHub",
      url: githubUrl,
      icon: <GitHubDark className="*:fill-current" />,
    },
    {
      name: "ChatGPT",
      url: `https://chatgpt.com/?q=${encodeURIComponent(buildSearchUrl(markdownUrl))}`,
      icon: <OpenAIDark className="*:fill-current" />,
    },
    {
      name: "Claude",
      url: `https://claude.ai/new?q=${encodeURIComponent(buildSearchUrl(markdownUrl))}`,
      icon: <ClaudeAI />,
    },
    {
      name: "Copilot",
      url: `https://copilot.microsoft.com/?q=${encodeURIComponent(buildSearchUrl(markdownUrl))}`,
      icon: <MicrosoftCopilot />,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          Open in
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {services.map((service) => (
          <DropdownMenuItem
            key={service.name}
            onClick={() => openInService(service.url)}
            className="group flex items-center gap-2 transition-colors"
          >
            {service.icon}
            <span>Open in {service.name}</span>
            <ExternalLink className="text-muted-foreground ml-auto size-4" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
