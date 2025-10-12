"use client";

import type { FC } from "react";

type Props = {
  actions?: React.ReactNode[];
}

const Error: FC<Props> = ({ actions }) => {
  return (
    <div className="max-w-2xl min-h-svh space-y-4 flex flex-col justify-center items-center mx-auto">
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