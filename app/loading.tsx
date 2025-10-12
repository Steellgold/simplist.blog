import type { FC, PropsWithChildren } from "react";

export const LoadingPage: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-10">
      {children}
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-.3s]" />
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-.5s]" />
      </div>
    </div>
  );
}