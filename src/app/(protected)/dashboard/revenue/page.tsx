"use client"

import * as React from "react"
import { IconTrendingUp, IconTrendingDown, IconSearch, IconCalendar } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO } from "date-fns"
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

// Dummy data - in real app, this would be filtered by dateRange
const getRevenueOverview = (dateRange?: DateRange) => {
  return {
    total_mrr: 45250.00,
    total_arr: 543000.00,
    active_subscriptions: 142,
    trial_subscriptions: 14,
    paid_subscriptions: 128,
  }
}

const subscriptions = [
  {
    id: "sub_001",
    business: { id: "bus_001", name: "Coffee House Sdn Bhd" },
    subscription_type: { id: "type_001", name: "Premium" },
    product: { price: 299, duration: "MONTHLY" as const },
    start_date: "2024-01-15",
    end_date: "2025-01-15",
    is_active: true,
    cancelled_at: null,
    status: "active" as const,
  },
  {
    id: "sub_002",
    business: { id: "bus_002", name: "Tech Store MY" },
    subscription_type: { id: "type_001", name: "Premium" },
    product: { price: 2990, duration: "YEARLY" as const },
    start_date: "2024-03-01",
    end_date: "2025-03-01",
    is_active: true,
    cancelled_at: null,
    status: "active" as const,
  },
  {
    id: "sub_003",
    business: { id: "bus_003", name: "Bakery Delight" },
    subscription_type: { id: "type_002", name: "Starter" },
    product: { price: 99, duration: "MONTHLY" as const },
    start_date: "2024-11-20",
    end_date: "2024-12-20",
    is_active: true,
    cancelled_at: null,
    status: "trial" as const,
  },
  {
    id: "sub_004",
    business: { id: "bus_004", name: "FreshMart" },
    subscription_type: { id: "type_001", name: "Premium" },
    product: { price: 299, duration: "MONTHLY" as const },
    start_date: "2024-06-01",
    end_date: "2025-06-01",
    is_active: true,
    cancelled_at: null,
    status: "active" as const,
  },
  {
    id: "sub_005",
    business: { id: "bus_005", name: "Fashion Hub" },
    subscription_type: { id: "type_002", name: "Starter" },
    product: { price: 99, duration: "MONTHLY" as const },
    start_date: "2024-08-15",
    end_date: "2024-11-15",
    is_active: false,
    cancelled_at: "2024-11-15",
    status: "expired" as const,
  },
  {
    id: "sub_006",
    business: { id: "bus_006", name: "Gym Pro Fitness" },
    subscription_type: { id: "type_001", name: "Premium" },
    product: { price: 2990, duration: "YEARLY" as const },
    start_date: "2024-02-01",
    end_date: "2025-02-01",
    is_active: true,
    cancelled_at: null,
    status: "active" as const,
  },
  {
    id: "sub_007",
    business: { id: "bus_007", name: "Pet Paradise" },
    subscription_type: { id: "type_002", name: "Starter" },
    product: { price: 99, duration: "MONTHLY" as const },
    start_date: "2024-11-25",
    end_date: "2024-12-25",
    is_active: true,
    cancelled_at: null,
    status: "trial" as const,
  },
  {
    id: "sub_008",
    business: { id: "bus_008", name: "Auto Care Center" },
    subscription_type: { id: "type_001", name: "Premium" },
    product: { price: 299, duration: "MONTHLY" as const },
    start_date: "2024-04-10",
    end_date: "2025-04-10",
    is_active: true,
    cancelled_at: null,
    status: "active" as const,
  },
]

export default function RevenuePage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [planFilter, setPlanFilter] = React.useState("all")
  const [startDateRange, setStartDateRange] = React.useState<DateRange | undefined>()
  const [endDateRange, setEndDateRange] = React.useState<DateRange | undefined>()
  
  const revenueOverview = getRevenueOverview(dateRange)

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.business.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    const matchesPlan = planFilter === "all" || sub.product.duration === planFilter
    
    // Filter by start date range
    const subStartDate = parseISO(sub.start_date)
    const matchesStartDate = !startDateRange?.from || (
      isWithinInterval(subStartDate, {
        start: startDateRange.from,
        end: startDateRange.to || startDateRange.from
      })
    )
    
    // Filter by end date range
    const subEndDate = parseISO(sub.end_date)
    const matchesEndDate = !endDateRange?.from || (
      isWithinInterval(subEndDate, {
        start: endDateRange.from,
        end: endDateRange.to || endDateRange.from
      })
    )
    
    return matchesSearch && matchesStatus && matchesPlan && matchesStartDate && matchesEndDate
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>
      case "trial":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Trial</Badge>
      case "expired":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const clearAllFilters = () => {
    setDateRange(undefined)
    setSearchQuery("")
    setStatusFilter("all")
    setPlanFilter("all")
    setStartDateRange(undefined)
    setEndDateRange(undefined)
  }

  const hasActiveFilters = dateRange?.from || searchQuery || statusFilter !== "all" || planFilter !== "all" || startDateRange?.from || endDateRange?.from

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
              onClick={() => setDateRange(undefined)}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total MRR</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              ${revenueOverview.total_mrr.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Monthly Recurring Revenue
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total ARR</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              ${revenueOverview.total_arr.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Annual Recurring Revenue
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {revenueOverview.active_subscriptions}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Active subscriptions
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Trial</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {revenueOverview.trial_subscriptions}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Trial subscriptions
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {revenueOverview.paid_subscriptions}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Paid subscriptions
          </CardFooter>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Manage all active subscriptions</CardDescription>
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
                  placeholder="Search business name..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Start Date Range</p>
                <DateRangePicker
                  dateRange={startDateRange}
                  onDateRangeChange={setStartDateRange}
                  placeholder="Filter by start date"
                />
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">End Date Range</p>
                <DateRangePicker
                  dateRange={endDateRange}
                  onDateRangeChange={setEndDateRange}
                  placeholder="Filter by end date"
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
                    <TableHead>Business</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="whitespace-nowrap">Start Date</TableHead>
                    <TableHead className="whitespace-nowrap">End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.business.name}</TableCell>
                        <TableCell>{sub.subscription_type.name}</TableCell>
                        <TableCell>${sub.product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sub.product.duration}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
