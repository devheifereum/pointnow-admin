"use client"

import * as React from "react"
import { IconTrendingUp, IconTrendingDown, IconCalendar } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"
import { format, subYears } from "date-fns"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface RevenueHistoricalDataPoint {
  date: string
  value: number
}

interface DashboardMetrics {
  total_revenue: number | null
  total_businesses: number | null
  total_customers: number | null
  active_subscriptions: number | null
}

// Initialize default date range: one year ago to now
const getDefaultDateRange = (): DateRange => {
  const now = new Date()
  const oneYearAgo = subYears(now, 1)
  return {
    from: oneYearAgo,
    to: now,
  }
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  
  // Set default date range on client side only to avoid hydration mismatch
  React.useEffect(() => {
    setDateRange(getDefaultDateRange())
  }, [])
  const [historicalData, setHistoricalData] = React.useState<RevenueHistoricalDataPoint[]>([])
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(true)
  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    total_revenue: null,
    total_businesses: null,
    total_customers: null,
    active_subscriptions: null,
  })
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch revenue historical data
  const fetchHistoricalData = React.useCallback(async () => {
    setIsLoadingHistorical(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (dateRange?.from) {
        params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'))
      }
      if (dateRange?.to) {
        params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'))
      }

      const queryString = params.toString()
      const url = `/api/analytics/revenue/historical-data${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch revenue historical data')
      }

      if (data.data?.historical_data) {
        setHistoricalData(data.data.historical_data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load revenue historical data', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingHistorical(false)
    }
  }, [dateRange])

  // Fetch dashboard metrics
  const fetchMetrics = React.useCallback(async () => {
    setIsLoadingMetrics(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (dateRange?.from) {
        params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'))
      }
      if (dateRange?.to) {
        params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'))
      }

      const queryString = params.toString()
      
      // Fetch all metrics in parallel
      const [revenueRes, businessRes, customerRes] = await Promise.allSettled([
        fetch(`/api/analytics/revenue/metrics${queryString ? `?${queryString}` : ''}`),
        fetch(`/api/analytics/business/summary/metrics${queryString ? `?${queryString}` : ''}`),
        fetch(`/api/analytics/customers/summary/metrics${queryString ? `?${queryString}` : ''}`),
      ])

      const newMetrics: DashboardMetrics = {
        total_revenue: null,
        total_businesses: null,
        total_customers: null,
        active_subscriptions: null,
      }

      // Process revenue metrics
      if (revenueRes.status === 'fulfilled' && revenueRes.value.ok) {
        const revenueData = await revenueRes.value.json()
        if (revenueData.data?.metrics) {
          newMetrics.total_revenue = revenueData.data.metrics.total_revenue
          newMetrics.total_customers = revenueData.data.metrics.total_customers
          newMetrics.active_subscriptions = revenueData.data.metrics.total_active_subscriptions
        }
      }

      // Process business metrics
      if (businessRes.status === 'fulfilled' && businessRes.value.ok) {
        const businessData = await businessRes.value.json()
        if (businessData.data?.total_business !== undefined) {
          newMetrics.total_businesses = businessData.data.total_business
        }
      }

      // Process customer metrics (use if revenue didn't provide it)
      if (customerRes.status === 'fulfilled' && customerRes.value.ok) {
        const customerData = await customerRes.value.json()
        if (customerData.data?.total_customers !== undefined && !newMetrics.total_customers) {
          newMetrics.total_customers = customerData.data.total_customers
        }
      }

      setMetrics(newMetrics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      // Don't show toast for metrics errors, just log
      console.error('Failed to load dashboard metrics:', errorMessage)
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [dateRange])

  React.useEffect(() => {
    fetchHistoricalData()
    fetchMetrics()
  }, [fetchHistoricalData, fetchMetrics])

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
              onClick={() => setDateRange(getDefaultDateRange())}
              className="whitespace-nowrap"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoadingMetrics || metrics.total_revenue !== null) && (
        <Card className="@container/card">
          <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              {isLoadingMetrics ? (
                <Skeleton className="h-8 w-32" />
              ) : metrics.total_revenue !== null ? (
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  RM {metrics.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
              ) : null}
          </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Total revenue
          </CardFooter>
        </Card>
        )}

        {(isLoadingMetrics || metrics.total_businesses !== null) && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Businesses</CardDescription>
              {isLoadingMetrics ? (
                <Skeleton className="h-8 w-32" />
              ) : metrics.total_businesses !== null ? (
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.total_businesses.toLocaleString()}
            </CardTitle>
              ) : null}
          </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Registered businesses
          </CardFooter>
        </Card>
        )}

        {(isLoadingMetrics || metrics.total_customers !== null) && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
              {isLoadingMetrics ? (
                <Skeleton className="h-8 w-32" />
              ) : metrics.total_customers !== null ? (
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.total_customers.toLocaleString()}
            </CardTitle>
              ) : null}
          </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              System Users
          </CardFooter>
        </Card>
        )}

        {(isLoadingMetrics || metrics.active_subscriptions !== null) && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Subscriptions</CardDescription>
              {isLoadingMetrics ? (
                <Skeleton className="h-8 w-32" />
              ) : metrics.active_subscriptions !== null ? (
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.active_subscriptions.toLocaleString()}
            </CardTitle>
              ) : null}
          </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Active subscriptions
          </CardFooter>
        </Card>
        )}
      </div>

      {/* Revenue Historical Chart */}
        <Card>
          <CardHeader>
          <CardTitle>Revenue Historical Data</CardTitle>
          <CardDescription>
            Revenue trends over time
          </CardDescription>
          </CardHeader>
        <CardContent>
          {isLoadingHistorical ? (
            <div className="flex items-center justify-center h-64">
              <Skeleton className="h-64 w-full" />
                </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-destructive">
              {error}
            </div>
          ) : historicalData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No historical data available
            </div>
          ) : (
            <ChartContainer
              config={{
                value: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px] w-full"
            >
              <AreaChart
                data={historicalData
                  .map((item) => ({
                    date: format(new Date(item.date), 'MMM dd, yyyy'),
                    value: item.value,
                    rawDate: item.date,
                  }))
                  .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                }
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => `RM ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />} 
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
        </Card>
    </div>
  )
}
