"use client";

import { FC } from "react";
import { MediaPicker } from "./media-picker";

interface MediaCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelect: (url: string) => void;
}

export const MediaCommand: FC<MediaCommandProps> = ({
  open,
  onOpenChange,
  projectId,
  onSelect,
}) => {
  return (
    <MediaPicker
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      onSelect={onSelect}
      title="Insert from library"
      description="Select an image from your media library to insert into the content."
      confirmText="Insert image"
    />
  );
};
