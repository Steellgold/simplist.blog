'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalyticsData } from '@/lib/actions/analytics'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Eye, Globe, Monitor, MousePointer, Smartphone, Tablet, Users } from 'lucide-react'
import { useState } from 'react'

interface AnalyticsDashboardProps {
  project: {
    id: string
    name: string
    slug: string
  }
  analytics: AnalyticsData
  selectedDays: number
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  suffix = ''
}: {
  title: string
  value: number | string
  description: string
  icon: React.ComponentType<{ className?: string }>
  suffix?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}{suffix}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />
    case 'tablet':
      return <Tablet className="h-4 w-4" />
    case 'desktop':
      return <Monitor className="h-4 w-4" />
    default:
      return <Monitor className="h-4 w-4" />
  }
}

export const AnalyticsDashboard = ({ analytics, selectedDays }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState(selectedDays.toString())

  const handleTimeRangeChange = (days: string) => {
    setTimeRange(days)
    window.location.href = `/analytics?days=${days}`
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Time Range:</span>
        <div className="flex gap-1">
          {['7', '30', '90'].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={analytics.summary.totalViews.toLocaleString()}
          description={`Last ${selectedDays} days`}
          icon={Eye}
        />
        <StatCard
          title="Unique Visitors"
          value={analytics.summary.uniqueVisitors.toLocaleString()}
          description={`${analytics.summary.avgViewsPerVisitor} avg views per visitor`}
          icon={Users}
        />
        <StatCard
          title="Avg Time on Page"
          value={Math.floor(analytics.summary.avgTimeOnPage / 60)}
          description={`${analytics.summary.avgTimeOnPage % 60}s seconds`}
          suffix="m"
          icon={Clock}
        />
        <StatCard
          title="Bounce Rate"
          value={analytics.summary.bounceRate}
          description={`${analytics.summary.avgScrollDepth}% avg scroll depth`}
          suffix="%"
          icon={MousePointer}
        />
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Top Articles</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Articles</CardTitle>
              <CardDescription>
                Most viewed articles in the last {selectedDays} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <h4 className="font-medium">{article.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">/{article.slug}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">{article.views.toLocaleString()} views</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(article.avgTimeOnPage / 60)}m {article.avgTimeOnPage % 60}s avg • {article.avgScrollDepth}% scroll
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCountries.map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <span className="font-medium">{country.country}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={country.percentage} className="w-20" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Visitor distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topCountries.slice(0, 5).map((country) => (
                    <div key={country.country} className="flex justify-between text-sm">
                      <span>{country.country}</span>
                      <span className="font-medium">{country.views} views</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.deviceStats.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DeviceIcon device={device.device} />
                        <span className="font-medium capitalize">{device.device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={device.percentage} className="w-20" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {device.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.browserStats.map((browser) => (
                    <div key={browser.browser} className="flex items-center justify-between">
                      <span className="font-medium">{browser.browser}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={browser.percentage} className="w-20" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {browser.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest page views and visitor interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentViews.map((view) => (
                  <div key={view.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{view.articleTitle}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{view.country}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DeviceIcon device={view.device} />
                          {view.device}
                        </span>
                        <span>•</span>
                        <span>{view.browser}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {Math.floor(view.timeOnPage / 60)}m {view.timeOnPage % 60}s
                      </div>
                      <div className="text-muted-foreground">
                        {Math.round(view.scrollDepth)}% scroll
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatDistanceToNow(view.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}