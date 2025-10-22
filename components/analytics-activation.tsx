'use client'

import { AnalyticsIntegrationGuide } from '@/components/analytics-integration-guide'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { enableAnalytics } from '@/lib/actions/analytics'
import { BarChart3, Eye, Globe, Lock, MousePointer } from 'lucide-react'
import { useState } from 'react'

interface AnalyticsActivationProps {
  projectId: string
}

export const AnalyticsActivation = ({ projectId }: AnalyticsActivationProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEnableAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await enableAnalytics(projectId)
      setApiKey(result.apiKey)
      setIsEnabled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnabled && apiKey) {
    return <AnalyticsIntegrationGuide apiKey={apiKey} showSuccessCard={true} />
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Enable Analytics</h1>
          <p className="text-muted-foreground">
            Track visitor behavior and understand your audience with detailed analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Real-time tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor page views, unique visitors, and engagement as they happen</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <MousePointer className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Engagement metrics</h4>
                  <p className="text-sm text-muted-foreground">Time on page, scroll depth, bounce rate, and reading patterns</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Globe className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Audience insights</h4>
                  <p className="text-sm text-muted-foreground">Geographic data, device types, browsers, and traffic sources</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Lock className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Privacy-focused</h4>
                  <p className="text-sm text-muted-foreground">GDPR compliant, no personal data, anonymous visitor tracking</p>
                </div>
              </div>
            </div>
          </div>

        {error && (
          <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleEnableAnalytics}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Spinner />
              Enabling Analytics...
            </>
          ) : (
            <>
              <BarChart3 />
              Enable Analytics
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This will generate a public API key for tracking and activate analytics for your project
        </p>
        </div>
      </div>
    </div>
  )
}
