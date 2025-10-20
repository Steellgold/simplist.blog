"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ArticleViewsOverTime } from '@/lib/actions/analytics'
import { Line, LineChart, XAxis, YAxis } from 'recharts'

interface MiniLineChartProps {
  data: ArticleViewsOverTime[]
  className?: string
}

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-1)",
  },
  uniqueVisitors: {
    label: "Visitors",
    color: "var(--chart-2)",
  },
  avgTimeOnPage: {
    label: "Engagement (s)",
    color: "var(--chart-3)",
  }
}

export const MiniLineChart = ({ data, className }: MiniLineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`h-12 w-20 flex items-center justify-center text-xs text-muted-foreground ${className}`}>
        No data
      </div>
    )
  }

  return (
    <div className={`h-12 w-20 relative ${className}`}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
            cursor={{ strokeWidth: 1 }}
            wrapperStyle={{ zIndex: 50 }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="var(--color-views)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 2, strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="uniqueVisitors"
            stroke="var(--color-uniqueVisitors)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 2, strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="avgTimeOnPage"
            stroke="var(--color-avgTimeOnPage)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 2, strokeWidth: 1 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}