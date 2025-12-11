"use client"

import { GitHubDark } from "@ridemountainpig/svgl-react";
import { buttonVariants } from "@simplist/ui/components/button";
import Link from "next/link";
import { FC } from "react";

interface EditOnGitHubProps {
  githubUrl: string
}

export const EditOnGitHub: FC<EditOnGitHubProps> = ({ githubUrl }) => {
  return (
    <Link
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      <GitHubDark className="*:fill-current" />
      Edit on GitHub
    </Link>
  )
}
