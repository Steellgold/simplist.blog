"use client"

import { createContext, FC, ReactNode, useCallback, useContext, useState } from "react"

type WebhookFormContextType = {
  isPending: boolean
  setIsPending: (pending: boolean) => void
  handleTest?: () => void
  setHandleTest: (handler: (() => void) | undefined) => void
}

const WebhookFormContext = createContext<WebhookFormContextType | null>(null)

export const useWebhookFormContext = () => {
  const context = useContext(WebhookFormContext)
  if (!context) {
    throw new Error("useWebhookFormContext must be used within WebhookFormProvider")
  }
  return context
}

type WebhookFormProviderProps = {
  children: ReactNode
}

export const WebhookFormProvider: FC<WebhookFormProviderProps> = ({ children }) => {
  const [isPending, setIsPending] = useState(false)
  const [handleTest, setHandleTestState] = useState<(() => void) | undefined>(undefined)

  const setHandleTest = useCallback((
    handler: (() => void) | undefined
  ) => setHandleTestState(() => handler), [])

  return (
    <WebhookFormContext.Provider value={{ isPending, setIsPending, handleTest, setHandleTest }}>
      {children}
    </WebhookFormContext.Provider>
  )
}

