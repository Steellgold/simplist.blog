"use client";

import type { FC, ReactNode } from "react";

type Props = {
  actions?: ReactNode[];
};

const Error: FC<Props> = ({ actions }) => {
  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center space-y-4">
      <div className="space-y-4 text-center">
        <h1 className="text-9xl font-bold">500</h1>

        <div className="space-y-2">
          <p className="text-4xl font-bold">An Error Occurred</p>
          <p className="text-center">Something went wrong. Please try again.</p>
        </div>

        <div className="flex justify-center gap-2">
          {actions?.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Error;