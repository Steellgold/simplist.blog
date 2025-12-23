"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TestableApiContextType {
  hasTestableApi: boolean;
  setHasTestableApi: (value: boolean) => void;
}

const TestableApiContext = createContext<TestableApiContextType>({
  hasTestableApi: false,
  setHasTestableApi: () => {},
});

export function TestableApiProvider({ children }: { children: ReactNode }) {
  const [hasTestableApi, setHasTestableApi] = useState(false);

  return (
    <TestableApiContext.Provider value={{ hasTestableApi, setHasTestableApi }}>
      {children}
    </TestableApiContext.Provider>
  );
}

export function useTestableApi() {
  return useContext(TestableApiContext);
}
