"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface GenerationState {
  isGenerating: boolean;
  presentationId: string | null;
  title: string;
  status: string;
  progress: string;
}

interface GenerationContextValue extends GenerationState {
  startGeneration: (presentationId: string, title: string) => boolean;
  updateProgress: (progress: string) => void;
  completeGeneration: () => void;
  failGeneration: () => void;
}

const initial: GenerationState = {
  isGenerating: false,
  presentationId: null,
  title: "",
  status: "idle",
  progress: "",
};

const GenerationContext = createContext<GenerationContextValue>({
  ...initial,
  startGeneration: () => false,
  updateProgress: () => {},
  completeGeneration: () => {},
  failGeneration: () => {},
});

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GenerationState>(initial);

  const startGeneration = useCallback((presentationId: string, title: string): boolean => {
    let started = false;
    setState((prev) => {
      if (prev.isGenerating) return prev;
      started = true;
      return {
        isGenerating: true,
        presentationId,
        title,
        status: "generating",
        progress: "Starting generation...",
      };
    });
    return started;
  }, []);

  const updateProgress = useCallback((progress: string) => {
    setState((prev) => (prev.isGenerating ? { ...prev, progress } : prev));
  }, []);

  const completeGeneration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      status: "completed",
      progress: "Complete!",
    }));
  }, []);

  const failGeneration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      status: "failed",
      progress: "Generation failed.",
    }));
  }, []);

  return (
    <GenerationContext.Provider
      value={{ ...state, startGeneration, updateProgress, completeGeneration, failGeneration }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  return useContext(GenerationContext);
}
