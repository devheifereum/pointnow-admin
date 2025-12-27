"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { IconEye } from "@tabler/icons-react"

interface CustomerMetrics {
  total_customers: number
  active_customers_last_7_days: number
  active_customers_last_30_days: number
  new_customers_last_month: number
}

interface CustomerBusiness {
  id: string
  name: string
  email: string | null
  phone_number: string | null
  total_points: number
  total_visits: number
  last_visit_at: string
}

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
  businesses: CustomerBusiness[]
}

interface CustomersData {
  customers: Customer[]
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

export default function CustomersPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  
  // Set default date range on client side only to avoid hydration mismatch
  React.useEffect(() => {
    setDateRange(getDefaultDateRange())
  }, [])
  const [metrics, setMetrics] = React.useState<CustomerMetrics | null>(null)
  const [customersData, setCustomersData] = React.useState<CustomersData | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true)
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [joinedDateRange, setJoinedDateRange] = React.useState<DateRange | undefined>()
  const [lastActivityRange, setLastActivityRange] = React.useState<DateRange | undefined>()
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
      const url = `/api/analytics/customers/summary/metrics${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user metrics')
      }

      if (data.data) {
        setMetrics(data.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load user metrics', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [dateRange])

  const fetchCustomers = React.useCallback(async () => {
    setIsLoadingCustomers(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      
      if (joinedDateRange?.from) {
        params.append('start_date_joined', format(joinedDateRange.from, 'yyyy-MM-dd'))
      }
      if (joinedDateRange?.to) {
        params.append('end_date_joined', format(joinedDateRange.to, 'yyyy-MM-dd'))
      }
      if (lastActivityRange?.from) {
        params.append('last_visit_start_date', format(lastActivityRange.from, 'yyyy-MM-dd'))
      }
      if (lastActivityRange?.to) {
        params.append('last_visit_end_date', format(lastActivityRange.to, 'yyyy-MM-dd'))
      }

      const queryString = params.toString()
      const url = `/api/analytics/customers/summary?${queryString}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users')
      }

      if (data.data) {
        setCustomersData(data.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load users', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingCustomers(false)
    }
  }, [page, limit, joinedDateRange, lastActivityRange])

  React.useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Filter customers client-side (for search)
  const filteredCustomers = React.useMemo(() => {
    if (!customersData?.customers) return []
    
    if (!searchQuery) return customersData.customers
    
    return customersData.customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone_number.includes(searchQuery)
      )
    })
  }, [customersData, searchQuery])

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [joinedDateRange, lastActivityRange])

  const handleViewCustomer = (customer: Customer) => {
    router.push(`/dashboard/customers/${customer.id}`)
  }

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

  const clearAllFilters = () => {
    setDateRange(undefined)
    setSearchQuery("")
    setJoinedDateRange(undefined)
    setLastActivityRange(undefined)
    setPage(1)
  }

  const hasActiveFilters = dateRange?.from || searchQuery || joinedDateRange?.from || lastActivityRange?.from || page !== 1

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Date Range Filter at Top */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground text-sm">
            View and manage all users across businesses
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
      {error && !isLoadingMetrics && !isLoadingCustomers && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metrics?.total_customers.toLocaleString() || '0'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            System-wide users
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active (7 Days)</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metrics?.active_customers_last_7_days.toLocaleString() || '0'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Active users in last 7 days
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active (30 Days)</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metrics?.active_customers_last_30_days.toLocaleString() || '0'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Active users in last 30 days
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>New Users</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metrics?.new_customers_last_month.toLocaleString() || '0'}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            New users in last month
          </CardFooter>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View users across all businesses</CardDescription>
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
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Date Range Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Joined Date Range</p>
                <DateRangePicker
                  dateRange={joinedDateRange}
                  onDateRangeChange={setJoinedDateRange}
                  placeholder="Filter by joined date"
                />
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Last Visit Range</p>
                <DateRangePicker
                  dateRange={lastActivityRange}
                  onDateRangeChange={setLastActivityRange}
                  placeholder="Filter by last visit"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <div className="rounded-md border min-w-[640px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Businesses</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Visits</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Last Visit</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Joined</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-center hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell className="text-center hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                          {customer.is_verified && (
                            <Badge className="ml-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs">
                              Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground break-all">{customer.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                          {customer.phone_number}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {customer.total_points.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant="outline">{customer.total_businesses}</Badge>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {customer.total_visits}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                          {customer.last_visit_at ? formatDateTime(customer.last_visit_at) : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                          {formatDate(customer.joined_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                            className="h-8"
                          >
                            <IconEye className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination and Results count */}
          {customersData && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCustomers.length} of {customersData.metadata.total} users
                {customersData.metadata.total_pages > 1 && (
                  <span> (Page {customersData.metadata.page} of {customersData.metadata.total_pages})</span>
                )}
              </p>
              {customersData.metadata.total_pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!customersData.metadata.has_previous || isLoadingCustomers}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {customersData.metadata.page} of {customersData.metadata.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!customersData.metadata.has_next || isLoadingCustomers}
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
