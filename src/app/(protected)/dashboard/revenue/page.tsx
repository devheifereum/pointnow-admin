"use client"

import * as React from "react"
import { IconSearch, IconCalendar } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"
import { format, subYears } from "date-fns"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"

interface RevenueMetrics {
  total_revenue: number
  total_customers: number
  total_active_subscriptions: number
}

interface Charge {
  id: string
  amount: number
  amount_refunded: number
  billing_details: {
    email: string
    name: string
  }
  created: number
  currency: string
  customer: string
  description: string
  paid: boolean
  payment_method_details: {
    card: {
      brand: string
      last4: string
    }
    type: string
  }
  receipt_url: string | null
  refunded: boolean
  status: string
}

interface ChargesData {
  charges: Charge[]
  metadata: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
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

export default function RevenuePage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  
  // Set default date range on client side only to avoid hydration mismatch
  React.useEffect(() => {
    setDateRange(getDefaultDateRange())
  }, [])
  const [metrics, setMetrics] = React.useState<RevenueMetrics | null>(null)
  const [charges, setCharges] = React.useState<ChargesData | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true)
  const [isLoadingCharges, setIsLoadingCharges] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)

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
      const url = `/api/analytics/revenue/metrics${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch revenue metrics')
      }

      if (data.data?.metrics) {
        setMetrics(data.data.metrics)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load revenue metrics', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [dateRange])

  const fetchCharges = React.useCallback(async () => {
    setIsLoadingCharges(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (dateRange?.from) {
        params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'))
      }
      if (dateRange?.to) {
        params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'))
      }
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const queryString = params.toString()
      const url = `/api/analytics/revenue/charges?${queryString}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch charges')
      }

      if (data.data) {
        setCharges(data.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load charges', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingCharges(false)
    }
  }, [dateRange, page, limit])

  React.useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  React.useEffect(() => {
    fetchCharges()
  }, [fetchCharges])

  // Filter charges client-side (for search and status)
  const filteredCharges = React.useMemo(() => {
    if (!charges?.charges) return []
    
    return charges.charges.filter((charge) => {
      const matchesSearch = 
        charge.billing_details.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charge.billing_details.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charge.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || charge.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [charges, searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Succeeded</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    // Amount is in cents, convert to ringgit
    const amountInRinggit = amount / 100
    return `RM ${amountInRinggit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const clearAllFilters = () => {
    setDateRange(getDefaultDateRange())
    setSearchQuery("")
    setStatusFilter("all")
    setPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || page !== 1

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [dateRange, searchQuery, statusFilter])

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Date Range Filter at Top */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Revenue</h2>
          <p className="text-muted-foreground text-sm">
            Manage and track all revenue metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter analytics by date"
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

      {/* Error State */}
      {error && !isLoadingMetrics && !isLoadingCharges && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Overview Cards - Only showing metrics from API */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                RM {metrics?.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Total revenue in the selected period
          </CardFooter>
        </Card>

        {/* Total Customers */}
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total Customers</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metrics?.total_customers.toLocaleString() || '0'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Total number of customers
          </CardFooter>
        </Card>

        {/* Active Subscriptions */}
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active Subscriptions</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metrics?.total_active_subscriptions.toLocaleString() || '0'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Total active subscriptions
          </CardFooter>
        </Card>
      </div>

      {/* Charges List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Charges</CardTitle>
              <CardDescription>View all payment charges and transactions</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or charge ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <div className="rounded-md border min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Charge ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCharges ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredCharges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No charges found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCharges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell className="font-mono text-xs">
                          {charge.id.substring(0, 20)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{charge.billing_details.name}</span>
                            <span className="text-xs text-muted-foreground">{charge.billing_details.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(charge.amount, charge.currency)}
                          {charge.amount_refunded > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Refunded: {formatAmount(charge.amount_refunded, charge.currency)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {charge.payment_method_details.card?.brand.toUpperCase() || charge.payment_method_details.type}
                            </Badge>
                            {charge.payment_method_details.card?.last4 && (
                              <span className="text-xs text-muted-foreground">
                                •••• {charge.payment_method_details.card.last4}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(charge.status)}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(charge.created)}
                        </TableCell>
                        <TableCell>
                          {charge.receipt_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8"
                            >
                              <a
                                href={charge.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="text-xs">View</span>
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination and Results count */}
          {charges && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCharges.length} of {charges.metadata.total} charges
                {charges.metadata.total_pages > 1 && (
                  <span> (Page {charges.metadata.page} of {charges.metadata.total_pages})</span>
                )}
              </p>
              {charges.metadata.total_pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!charges.metadata.has_previous || isLoadingCharges}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {charges.metadata.page} of {charges.metadata.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!charges.metadata.has_next || isLoadingCharges}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
