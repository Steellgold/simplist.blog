import { Spinner } from "@/components/ui/spinner";
import type { FC, PropsWithChildren } from "react";

const LoadingPage: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-10">
      {children}
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export default LoadingPage;