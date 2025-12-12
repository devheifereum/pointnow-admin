"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  IconTrendingUp, 
  IconSearch, 
  IconBuildingStore, 
  IconDotsVertical,
  IconEye,
  IconToggleLeft,
  IconToggleRight,
  IconCalendar
} from "@tabler/icons-react"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, format, subYears } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRangePicker } from "@/components/ui/date-picker"

interface BusinessAdmin {
  email: string
  name: string
}

interface BusinessUsageSummary {
  service: string
  count: number
  cost: number
}

interface BusinessSubscription {
  id: string
  type: string
  provider: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface BusinessRegion {
  id: string
  name: string
  country_code: string
}

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
  admins: BusinessAdmin[]
  usage_summary: BusinessUsageSummary[]
  latest_subscription: BusinessSubscription | {}
  regions: BusinessRegion[]
  created_at: string
}

interface BusinessesData {
  businesses: Business[]
  metadata: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Transform API business to UI format
type TransformedBusiness = {
  business: {
    id: string
    name: string
    registration_number: string
    is_active: boolean
    created_at: string
  }
  subscription: {
    status: string
    plan_type: string | null
    end_date: string | null
  }
  customer_count: number
  total_points_issued: number
}

interface BusinessMetrics {
  total_business: number
  recent_business: Array<{
    id: string
    name: string
    email: string
    phone_number: string
    status: string
    registration_number: string
    address: string
    created_at: string
  }>
  most_customers_business: Array<{
    id: string
    name: string
    email: string
    phone_number: string
    status: string
    registration_number: string
    address: string
    created_at: string
    total_customers: number
  }>
  most_points_business: Array<{
    id: string
    name: string
    email: string | null
    phone_number: string | null
    status: string
    registration_number: string
    address: string
    created_at: string
    total_points: number
  }>
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

export default function BusinessesPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  
  // Set default date range on client side only to avoid hydration mismatch
  React.useEffect(() => {
    setDateRange(getDefaultDateRange())
  }, [])
  const [businessesData, setBusinessesData] = React.useState<BusinessesData | null>(null)
  const [businessMetrics, setBusinessMetrics] = React.useState<BusinessMetrics | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [activeFilter, setActiveFilter] = React.useState("all")
  const [createdDateRange, setCreatedDateRange] = React.useState<DateRange | undefined>()
  const [subscriptionEndRange, setSubscriptionEndRange] = React.useState<DateRange | undefined>()
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Transform API business to UI format
  const transformBusiness = (business: Business): TransformedBusiness => {
    const subscription = business.latest_subscription && 'type' in business.latest_subscription
      ? business.latest_subscription
      : null

    // Determine subscription status
    let subscriptionStatus = "none"
    if (subscription) {
      if (subscription.is_active) {
        subscriptionStatus = subscription.type === "FREE" ? "trial" : "active"
      } else {
        subscriptionStatus = "expired"
      }
    }

    // Business is active if it has an active subscription
    const isActive = subscription?.is_active || false

    return {
      business: {
        id: business.id,
        name: business.name,
        registration_number: business.registration_number,
        is_active: isActive,
        created_at: business.created_at,
      },
      subscription: {
        status: subscriptionStatus,
        plan_type: subscription?.type || null,
        end_date: subscription?.end_date || null,
      },
      customer_count: business.customers_count,
      total_points_issued: business.total_points,
    }
  }

  // Fetch businesses from API
  const fetchBusinesses = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      
      if (debouncedSearchQuery) {
        params.append('query', debouncedSearchQuery)
      }

      const queryString = params.toString()
      const url = `/api/analytics/business/summary?${queryString}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch businesses')
      }

      if (data.data) {
        setBusinessesData(data.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load businesses', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, debouncedSearchQuery])

  // Fetch business metrics
  const fetchBusinessMetrics = React.useCallback(async () => {
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
      const url = `/api/analytics/business/summary/metrics${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch business metrics')
      }

      if (data.data) {
        setBusinessMetrics(data.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Failed to load business metrics', {
        description: errorMessage,
      })
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [dateRange])

  React.useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  React.useEffect(() => {
    fetchBusinessMetrics()
  }, [fetchBusinessMetrics])

  // Transform businesses for UI
  const transformedBusinesses = React.useMemo(() => {
    if (!businessesData?.businesses) return []
    return businessesData.businesses.map(transformBusiness)
  }, [businessesData])

  // Calculate overview metrics from API data
  // Note: Some metrics come from the metrics API, others are calculated from businesses list
  const businessesOverview = React.useMemo(() => {
    // Use metrics API for total_business
    const totalBusinesses = businessMetrics?.total_business || 0

    // Calculate other metrics from businesses list if available
    let activeBusinesses = 0
    let newBusinesses = 0
    let businessesWithSubscription = 0
    let businessesWithoutSubscription = 0

    if (businessesData?.businesses) {
      const businesses = businessesData.businesses
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const activeBusinessesList = businesses.filter(b => {
        const sub = b.latest_subscription && 'is_active' in b.latest_subscription
          ? b.latest_subscription
          : null
        return sub?.is_active || false
      })

      const newBusinessesList = businesses.filter(b => {
        const createdDate = parseISO(b.created_at)
        return createdDate >= startOfMonth
      })

      const withSubscription = businesses.filter(b => {
        const sub = b.latest_subscription && 'type' in b.latest_subscription
          ? b.latest_subscription
          : null
        return sub && sub.is_active
      })

      activeBusinesses = activeBusinessesList.length
      newBusinesses = newBusinessesList.length
      businessesWithSubscription = withSubscription.length
      businessesWithoutSubscription = businesses.length - withSubscription.length
    }

    return {
      total_businesses: totalBusinesses,
      active_businesses: activeBusinesses,
      new_businesses: newBusinesses,
      businesses_with_subscription: businessesWithSubscription,
      businesses_without_subscription: businessesWithoutSubscription,
    }
  }, [businessMetrics, businessesData])

  // Client-side filtering (for date ranges and status filters)
  const filteredBusinesses = React.useMemo(() => {
    if (!transformedBusinesses.length) return []

    return transformedBusinesses.filter((item) => {
      // Search is handled server-side, but we can do additional client-side filtering
    const matchesStatus = statusFilter === "all" || item.subscription.status === statusFilter
    const matchesActive = 
      activeFilter === "all" || 
      (activeFilter === "active" && item.business.is_active) ||
      (activeFilter === "inactive" && !item.business.is_active)
    
    // Filter by created date range
    const createdDate = parseISO(item.business.created_at)
    const matchesCreatedDate = !createdDateRange?.from || (
      isWithinInterval(createdDate, {
        start: createdDateRange.from,
        end: createdDateRange.to || createdDateRange.from
      })
    )
    
    // Filter by subscription end date range
    const matchesEndDate = !subscriptionEndRange?.from || (
      item.subscription.end_date && 
      isWithinInterval(parseISO(item.subscription.end_date), {
        start: subscriptionEndRange.from,
        end: subscriptionEndRange.to || subscriptionEndRange.from
      })
    )
    
      return matchesStatus && matchesActive && matchesCreatedDate && matchesEndDate
  })
  }, [transformedBusinesses, statusFilter, activeFilter, createdDateRange, subscriptionEndRange])

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

  const toggleBusinessStatus = (businessId: string) => {
    // TODO: Implement API call to toggle business status
    toast.info('Business status toggle not yet implemented')
  }

  const viewBusinessDetails = (business: TransformedBusiness) => {
    router.push(`/dashboard/businesses/${business.business.id}`)
  }

  // Reset page when debounced search query changes
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery])

  const clearAllFilters = () => {
    setDateRange(undefined)
    setSearchQuery("")
    setStatusFilter("all")
    setActiveFilter("all")
    setCreatedDateRange(undefined)
    setSubscriptionEndRange(undefined)
  }

  const hasActiveFilters = dateRange?.from || searchQuery || statusFilter !== "all" || activeFilter !== "all" || createdDateRange?.from || subscriptionEndRange?.from

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Date Range Filter at Top */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Businesses</h2>
          <p className="text-muted-foreground text-sm">
            Manage registered businesses and subscriptions
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
      {error && !isLoading && !isLoadingMetrics && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total Businesses</CardDescription>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.total_businesses}
            </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Registered businesses
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active Businesses</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.active_businesses}
            </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            With active subscription
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>New Businesses</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.new_businesses}
            </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            This month
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>With Subscription</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.businesses_with_subscription}
            </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Active or trial
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Without Subscription</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.businesses_without_subscription}
            </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            No subscription
          </CardFooter>
        </Card>
      </div>

      {/* Businesses List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Businesses</CardTitle>
              <CardDescription>Manage registered businesses</CardDescription>
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
                  placeholder="Search by name or registration number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Subscription Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="none">No Subscription</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Active Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Created Date Range</p>
                <DateRangePicker
                  dateRange={createdDateRange}
                  onDateRangeChange={setCreatedDateRange}
                  placeholder="Filter by created date"
                />
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Subscription End Date Range</p>
                <DateRangePicker
                  dateRange={subscriptionEndRange}
                  onDateRangeChange={setSubscriptionEndRange}
                  placeholder="Filter by subscription end"
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
                    <TableHead>Business Name</TableHead>
                    <TableHead className="hidden md:table-cell whitespace-nowrap">Reg. Number</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Customers</TableHead>
                    <TableHead className="text-right hidden lg:table-cell whitespace-nowrap">Points Issued</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredBusinesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No businesses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBusinesses.map((item) => (
                      <TableRow key={item.business.id}>
                        <TableCell className="font-medium">{item.business.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                          {item.business.registration_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(item.subscription.status)}
                            {item.subscription.plan_type && (
                              <span className="text-xs text-muted-foreground">
                                {item.subscription.plan_type}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell whitespace-nowrap">
                          {item.customer_count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell whitespace-nowrap">
                          {item.total_points_issued.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.business.is_active ? (
                            <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                          ) : (
                            <Badge className="bg-red-500/10 text-red-600">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <IconDotsVertical className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewBusinessDetails(item)}>
                                <IconEye className="mr-2 size-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toggleBusinessStatus(item.business.id)}>
                                {item.business.is_active ? (
                                  <>
                                    <IconToggleLeft className="mr-2 size-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <IconToggleRight className="mr-2 size-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination and Results count */}
          {businessesData && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBusinesses.length} of {businessesData.metadata.total} businesses
                {businessesData.metadata.total_pages > 1 && (
                  <span> (Page {businessesData.metadata.page} of {businessesData.metadata.total_pages})</span>
                )}
              </p>
              {businessesData.metadata.total_pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!businessesData.metadata.has_previous || isLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {businessesData.metadata.page} of {businessesData.metadata.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!businessesData.metadata.has_next || isLoading}
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
