"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

interface ImagePluginContextValue {
  projectId: string | undefined;
}

const ImagePluginContext = createContext<ImagePluginContextValue | null>(null);

export const useImagePluginContext = (): ImagePluginContextValue => {
  const context = useContext(ImagePluginContext);
  if (!context) {
    // Return a default value instead of throwing, so ImageComponent
    // can work outside of ImagePlugin (e.g., in static previews)
    return { projectId: undefined };
  }
  return context;
};

interface ImagePluginProps {
  projectId?: string;
  children: ReactNode;
}

export const ImagePlugin = ({ projectId, children }: ImagePluginProps) => {
  const value = useMemo(() => ({ projectId }), [projectId]);

  return (
    <ImagePluginContext.Provider value={value}>
      {children}
    </ImagePluginContext.Provider>
  );
};
