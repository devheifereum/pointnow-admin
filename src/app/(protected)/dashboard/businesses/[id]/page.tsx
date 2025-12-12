"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { format, subYears } from "date-fns"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
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
import { DateRangePicker } from "@/components/ui/date-picker"
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react"

interface Business {
  id: string
  name: string
  email: string
  status: string
  registration_number: string
  staff_count: number
  customers_count: number
  branches_count: number
  total_points: number
  admins: Array<{
    email: string
    name: string
  }>
  usage_summary: Array<{
    service: string
    count: number
    cost: number
  }>
  latest_subscription: {
    id: string
    type: string
    provider: string
    start_date: string
    end_date: string
    is_active: boolean
  } | {}
  regions: Array<{
    id: string
    name: string
    country_code: string
  }>
  created_at: string
}

interface LeaderboardCustomer {
  id: string
  name: string
  email: string
  phone_number: string
  total_points: number
  total_visits: number
  last_visit_at: string
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

export default function BusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = React.useState<Business | null>(null)
  const [leaderboardCustomers, setLeaderboardCustomers] = React.useState<LeaderboardCustomer[]>([])
  const [isLoadingBusiness, setIsLoadingBusiness] = React.useState(true)
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  
  // Set default date range on client side only to avoid hydration mismatch
  React.useEffect(() => {
    setDateRange(getDefaultDateRange())
  }, [])
  const [leaderboardPage, setLeaderboardPage] = React.useState(1)
  const [leaderboardMetadata, setLeaderboardMetadata] = React.useState<{
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  } | null>(null)

  // Fetch business details
  const fetchBusiness = React.useCallback(async () => {
    setIsLoadingBusiness(true)
    setError(null)

    try {
      // Try to find the business by searching through pages
      let foundBusiness: Business | null = null
      let page = 1
      const limit = 100
      let hasMore = true

      while (hasMore && !foundBusiness) {
        const response = await fetch(`/api/analytics/business/summary?limit=${limit}&page=${page}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch business')
        }

        if (data.data?.businesses) {
          foundBusiness = data.data.businesses.find((b: Business) => b.id === businessId) || null
          
          if (foundBusiness) {
            setBusiness(foundBusiness)
            break
          }

          // Check if there are more pages to search
          hasMore = data.data.metadata?.has_next || false
          page++
        } else {
          hasMore = false
        }
      }

      if (!foundBusiness) {
        throw new Error('Business not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load business', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingBusiness(false)
    }
  }, [businessId])

  // Fetch customer leaderboard
  const fetchLeaderboard = React.useCallback(async (pageNum: number = 1) => {
    if (!businessId) return

    setIsLoadingLeaderboard(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('business_id', businessId)
      params.append('page', pageNum.toString())
      params.append('limit', '10')
      
      if (dateRange?.from) {
        params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'))
      }
      if (dateRange?.to) {
        params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'))
      }

      const queryString = params.toString()
      const url = `/api/analytics/business/leaderboard/customers?${queryString}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch customer leaderboard')
      }

      if (data.data) {
        setLeaderboardCustomers(data.data.customers)
        setLeaderboardMetadata(data.data.metadata)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load customer leaderboard', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }, [businessId, dateRange])

  React.useEffect(() => {
    if (businessId) {
      fetchBusiness()
    }
  }, [businessId, fetchBusiness])

  React.useEffect(() => {
    if (businessId) {
      fetchLeaderboard(leaderboardPage)
    }
  }, [businessId, leaderboardPage, fetchLeaderboard])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>
      case "trial":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Trial</Badge>
      case "expired":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Expired</Badge>
      case "none":
        return <Badge variant="outline" className="text-muted-foreground">No Subscription</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Determine subscription status
  const subscription = business?.latest_subscription && 'type' in business.latest_subscription
    ? business.latest_subscription
    : null

  let subscriptionStatus = "none"
  if (subscription) {
    if (subscription.is_active) {
      subscriptionStatus = subscription.type === "FREE" ? "trial" : "active"
    } else {
      subscriptionStatus = "expired"
    }
  }

  const isActive = subscription?.is_active || false

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
            {isLoadingBusiness ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              business?.name || 'Business Details'
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            View business details and customer leaderboard
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoadingBusiness && !isLoadingLeaderboard && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Business Info Card */}
      {isLoadingBusiness ? (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Basic business details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : business ? (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Basic business details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                <p className="text-sm font-medium">{business.registration_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{business.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm">
                  {isActive ? (
                    <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-600">Inactive</Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                <div className="mt-1">{getStatusBadge(subscriptionStatus)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Type</p>
                <p className="text-sm font-medium">{subscription?.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-sm font-medium">{business.customers_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points Issued</p>
                <p className="text-sm font-medium">{business.total_points.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
                <p className="text-sm font-medium">{business.staff_count}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Branches Count</p>
                <p className="text-sm font-medium">{business.branches_count}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="text-sm font-medium">{formatDate(business.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription End</p>
                <p className="text-sm font-medium">{formatDate(subscription?.end_date || null)}</p>
              </div>
              {business.admins.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <div className="mt-1 space-y-1">
                    {business.admins.map((admin, idx) => (
                      <p key={idx} className="text-sm">{admin.name} ({admin.email})</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Customer Leaderboard Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Customer leaderboard for this business
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {isLoadingLeaderboard ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboardCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No customer data available
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-center">Visits</TableHead>
                      <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardCustomers.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          #{((leaderboardPage - 1) * 10) + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground break-all">
                          {customer.email}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {customer.total_points.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {customer.total_visits}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                          {customer.last_visit_at 
                            ? formatDateTime(customer.last_visit_at) 
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {leaderboardMetadata && leaderboardMetadata.total_pages > 1 && (
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {leaderboardCustomers.length} of {leaderboardMetadata.total} customers
                    {leaderboardMetadata.total_pages > 1 && (
                      <span> (Page {leaderboardMetadata.page} of {leaderboardMetadata.total_pages})</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                      disabled={!leaderboardMetadata.has_prev || isLoadingLeaderboard}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {leaderboardMetadata.page} of {leaderboardMetadata.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeaderboardPage(p => p + 1)}
                      disabled={!leaderboardMetadata.has_next || isLoadingLeaderboard}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

