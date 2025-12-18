"use client"

import { Alert, AlertDescription, AlertTitle } from '@simplist/ui/components/alert'
import { Button } from '@simplist/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@simplist/ui/components/card'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface AnalyticsIntegrationGuideProps {
  apiKey: string
  showSuccessCard?: boolean
  hasData?: boolean
}

export const AnalyticsIntegrationGuide = ({ apiKey, showSuccessCard = false, hasData = false }: AnalyticsIntegrationGuideProps) => {
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const scriptCodeWithSlug = `<script src="https://cdn.simplist.blog/analytics.js" data-api-key="${apiKey}" data-slug="your-article-slug"></script>`

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(scriptCodeWithSlug)
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 2000)
  }

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  // Don't show integration guide if analytics has data already
  if (hasData && !showSuccessCard) {
    return null
  }

  return (
    <div className="space-y-6">
      {showSuccessCard && (
        <Alert className="border-green-500/50 bg-green-500/5">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Analytics Enabled Successfully!</AlertTitle>
          <AlertDescription>Your analytics tracking is now active</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>Add the tracking script to your website to start collecting analytics data</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">1. Add the tracking script</h3>
              <Button
                variant="outline"
                
                onClick={handleCopyScript}
              >
                {copiedScript ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add this script tag to the {"<head>"} section of your website. Replace &quot;your-article-slug&quot; with the actual slug of each article.
            </p>
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-sm break-all whitespace-pre-wrap">
                <code>{scriptCodeWithSlug}</code>
              </pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">2. Your API Key</h3>
            <p className="text-sm text-muted-foreground">
              This is your public analytics tracking key. Keep it safe but it can be safely exposed in client-side code.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono break-all">
                {apiKey}
              </code>
              <Button
                variant="outline"
                onClick={handleCopyKey}
              >
                {copiedKey ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">3. What gets tracked?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Page views and unique visitors (anonymized)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Time on page and scroll depth</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Geographic location (country/city level)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Device type, browser, and operating system</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Referrer sources and UTM campaign parameters</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Privacy Notice</h4>
            <p className="text-sm text-muted-foreground">
              All tracking is privacy-focused and GDPR compliant. No personal data is collected, and visitor IDs are anonymized hashes that cannot be reversed.
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Once the script is added to your website, data will start appearing in your analytics dashboard within minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
