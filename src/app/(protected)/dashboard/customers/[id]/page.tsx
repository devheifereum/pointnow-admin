"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { IconArrowLeft } from "@tabler/icons-react"

interface Customer {
  id: string
  name: string
  email: string
  phone_number: string
  is_verified: boolean
  joined_at: string
  total_businesses: number
  total_points: number
  total_visits: number
  last_visit_at: string
}

interface HistoricalDataPoint {
  count: number
  date: string
  total_points: number
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = React.useState<Customer | null>(null)
  const [historicalData, setHistoricalData] = React.useState<HistoricalDataPoint[]>([])
  const [isLoadingCustomer, setIsLoadingCustomer] = React.useState(true)
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchCustomer = React.useCallback(async () => {
    setIsLoadingCustomer(true)
    setError(null)

    try {
      // Try to find the customer by searching through pages
      let foundCustomer: Customer | null = null
      let page = 1
      const limit = 100
      let hasMore = true

      while (hasMore && !foundCustomer) {
        const response = await fetch(`/api/analytics/customers/summary?limit=${limit}&page=${page}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch customer')
        }

        if (data.data?.customers) {
          foundCustomer = data.data.customers.find((c: Customer) => c.id === customerId) || null
          
          if (foundCustomer) {
            setCustomer(foundCustomer)
            break
          }

          // Check if there are more pages to search
          hasMore = data.data.metadata?.has_next || false
          page++
        } else {
          hasMore = false
        }
      }

      if (!foundCustomer) {
        throw new Error('Customer not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load customer', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingCustomer(false)
    }
  }, [customerId])

  const fetchHistoricalData = React.useCallback(async () => {
    setIsLoadingHistorical(true)
    setError(null)

    try {
      const url = `/api/analytics/leaderboard/customer/points/historical-data?customer_id=${customerId}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch historical data')
      }

      if (data.data?.historical_data) {
        setHistoricalData(data.data.historical_data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load historical data', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingHistorical(false)
    }
  }, [customerId])

  React.useEffect(() => {
    if (customerId) {
      fetchCustomer()
      fetchHistoricalData()
    }
  }, [customerId, fetchCustomer, fetchHistoricalData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isLoadingCustomer ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              customer?.name || 'Customer Details'
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            View customer details and historical points data
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoadingCustomer && !isLoadingHistorical && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Customer Info Card */}
      {isLoadingCustomer ? (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Basic customer details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : customer ? (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Basic customer details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{customer.phone_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-sm font-semibold">{customer.total_points.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-sm">{customer.total_visits}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
                <p className="text-sm">{customer.total_businesses}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Joined</p>
                <p className="text-sm">{formatDate(customer.joined_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
                <p className="text-sm">
                  {customer.last_visit_at ? formatDateTime(customer.last_visit_at) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm">
                  {customer.is_verified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-muted-foreground">Not Verified</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Historical Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>Points Historical Data</CardTitle>
          <CardDescription>
            Historical points data for {customer?.name || 'this customer'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistorical ? (
            <div className="flex items-center justify-center h-64">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : historicalData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No historical data available
            </div>
          ) : (
            <div className="mt-4">
              <ChartContainer
                config={{
                  total_points: {
                    label: "Total Points",
                    color: "hsl(var(--chart-1))",
                  },
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px] w-full"
              >
                <AreaChart
                  data={historicalData
                    .map((item) => ({
                      date: format(new Date(item.date), 'MMM dd, yyyy'),
                      total_points: item.total_points,
                      count: item.count,
                      rawDate: item.date,
                    }))
                    .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                  }
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="total_points"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorPoints)"
                  />
                </AreaChart>
              </ChartContainer>

              {/* Data Table */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Historical Data</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total Points</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalData
                        .map((item) => ({
                          ...item,
                          formattedDate: format(new Date(item.date), 'MMM dd, yyyy'),
                        }))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((item) => (
                          <TableRow key={item.date}>
                            <TableCell className="font-medium">
                              {item.formattedDate}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {item.total_points.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.count}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

