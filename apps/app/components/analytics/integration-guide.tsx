"use client";

import { Check, Copy } from "@gravity-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { useState } from "react";

interface AnalyticsIntegrationGuideProps {
  apiKey: string;
  showSuccessCard?: boolean;
  hasData?: boolean;
}

export const AnalyticsIntegrationGuide = ({
  apiKey,
  showSuccessCard = false,
  hasData = false,
}: AnalyticsIntegrationGuideProps) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const scriptCodeWithSlug = `<script src="https://cdn.simplist.blog/analytics.js" data-api-key="${apiKey}" data-slug="your-article-slug"></script>`;

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(scriptCodeWithSlug);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Don't show integration guide if analytics has data already
  if (hasData && !showSuccessCard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {showSuccessCard && (
        <Alert className="border-green-500/50 bg-green-500/5">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Analytics Enabled Successfully!</AlertTitle>
          <AlertDescription>
            Your analytics tracking is now active
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            Add the tracking script to your website to start collecting
            analytics data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">1. Add the tracking script</h3>
              <Button variant="outline" onClick={handleCopyScript}>
                {copiedScript ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Add this script tag to the {"<head>"} section of your website.
              Replace &quot;your-article-slug&quot; with the actual slug of each
              article.
            </p>
            <div className="relative">
              <pre className="bg-muted rounded-lg p-4 text-sm break-all whitespace-pre-wrap">
                <code>{scriptCodeWithSlug}</code>
              </pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">2. Your API Key</h3>
            <p className="text-muted-foreground text-sm">
              This is your public analytics tracking key. Keep it safe but it
              can be safely exposed in client-side code.
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-muted flex-1 rounded-lg p-3 font-mono text-sm break-all">
                {apiKey}
              </code>
              <Button variant="outline" onClick={handleCopyKey}>
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
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>Page views and unique visitors (anonymized)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>Time on page and scroll depth</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>Geographic location (country/city level)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>Device type, browser, and operating system</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>Referrer sources and UTM campaign parameters</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
            <h4 className="mb-2 text-sm font-semibold">Privacy Notice</h4>
            <p className="text-muted-foreground text-sm">
              All tracking is privacy-focused and GDPR compliant. No personal
              data is collected, and visitor IDs are anonymized hashes that
              cannot be reversed.
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-muted-foreground text-sm">
              Once the script is added to your website, data will start
              appearing in your analytics dashboard within minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
