"use client";

import type { FC } from "react";

type Props = {
  actions?: React.ReactNode[];
}

const Forbidden: FC<Props> = ({ actions }) => {
  return (
    <div className="max-w-2xl min-h-svh space-y-4 flex flex-col justify-center items-center mx-auto">
      <div className="space-y-4 text-center">
        <h1 className="text-9xl font-bold">403</h1>

        <div className="space-y-2">
          <p className="text-4xl font-bold">Access Denied</p>
          <p className="text-center">You don&apos;t have the necessary permissions to access this page.</p>
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

export default Forbidden;