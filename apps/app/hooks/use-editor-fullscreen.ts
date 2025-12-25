"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

type EditorFullscreenContextType = {
  isFullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  toggleFullscreen: () => void;
};

const EditorFullscreenContext =
  createContext<EditorFullscreenContextType | null>(null);

export const EditorFullscreenProvider = EditorFullscreenContext.Provider;

/**
 * Hook to access the fullscreen state from context.
 * Must be used within an EditorFullscreenProvider.
 */
export const useEditorFullscreen = () => {
  const context = useContext(EditorFullscreenContext);

  if (!context) {
    throw new Error(
      "useEditorFullscreen must be used within an EditorFullscreenProvider",
    );
  }

  return context;
};

/**
 * Hook to safely access the fullscreen state from context.
 * Returns null if not within a provider (use for optional fullscreen support).
 */
export const useEditorFullscreenOptional = () => {
  return useContext(EditorFullscreenContext);
};

/**
 * Hook to create the fullscreen state and handlers.
 * Use this in the parent component that wraps the editor.
 * Also handles Escape key to exit fullscreen.
 */
export const useEditorFullscreenState = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const setFullscreen = useCallback((value: boolean) => {
    setIsFullscreen(value);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  return {
    isFullscreen,
    setFullscreen,
    toggleFullscreen,
    providerValue: {
      isFullscreen,
      setFullscreen,
      toggleFullscreen,
    },
  };
}
