"use client";

import type { FC } from "react";

type Props = {
  actions?: React.ReactNode[];
}

const NotFound: FC<Props> = ({ actions }) => {
  return (
    <div className="max-w-2xl min-h-svh space-y-4 flex flex-col justify-center items-center mx-auto">
      <div className="space-y-4 text-center">
        <h1 className="text-9xl font-bold">404</h1>

        <div className="space-y-2">
          <p className="text-4xl font-bold">Page Not Found</p>
          <p className="text-center">It seems you've lost your compass...</p>
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

export default NotFound;