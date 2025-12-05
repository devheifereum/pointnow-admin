"use client"

import * as React from "react"
import { IconTrendingUp, IconTrendingDown, IconCalendar } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker"

// Dummy data for dashboard metrics
const getDashboardMetrics = (dateRange?: DateRange) => {
  // In a real app, these would be filtered by dateRange
  return {
    total_revenue_mrr: 45250.00,
    total_businesses: 156,
    total_customers: 12847,
    active_subscriptions: 142,
  }
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const metrics = getDashboardMetrics(dateRange)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your PointNow admin system.
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter by date range"
            className="w-full sm:w-[280px]"
          />
          {dateRange?.from && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateRange(undefined)}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Revenue (MRR)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${metrics.total_revenue_mrr.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="size-3" />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Growing steadily <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Monthly recurring revenue
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Businesses</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.total_businesses.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="size-3" />
                +8.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              12 new this month <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Registered businesses
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.total_customers.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="size-3" />
                +15.3%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong growth <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Across all businesses
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Subscriptions</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.active_subscriptions.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingDown className="size-3" />
                -2.1%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              3 churned this month <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Needs attention
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the platform</CardDescription>
          </CardHeader>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">New business registered</p>
                  <p className="text-xs text-muted-foreground truncate">Coffee House Sdn Bhd - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Subscription upgraded</p>
                  <p className="text-xs text-muted-foreground truncate">Tech Store MY - Monthly to Yearly - 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Trial ending soon</p>
                  <p className="text-xs text-muted-foreground truncate">Bakery Delight - 3 days remaining</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">New customer milestone</p>
                  <p className="text-xs text-muted-foreground truncate">FreshMart reached 1,000 customers - 1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground truncate">Trial Subscriptions</span>
                <span className="text-sm font-medium whitespace-nowrap">14</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground truncate">Paid Subscriptions</span>
                <span className="text-sm font-medium whitespace-nowrap">128</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground truncate">Active Customers (30d)</span>
                <span className="text-sm font-medium whitespace-nowrap">8,432</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground truncate">New Customers (This Month)</span>
                <span className="text-sm font-medium whitespace-nowrap">1,256</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground truncate">Avg. Revenue Per Business</span>
                <span className="text-sm font-medium whitespace-nowrap">$290.06</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
