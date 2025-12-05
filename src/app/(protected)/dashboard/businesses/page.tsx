"use client"

import * as React from "react"
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
import { isWithinInterval, parseISO } from "date-fns"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DateRangePicker } from "@/components/ui/date-picker"

// Dummy data - in real app, this would be filtered by dateRange
const getBusinessesOverview = (dateRange?: DateRange) => {
  return {
    total_businesses: 156,
    active_businesses: 142,
    new_businesses: 12,
    businesses_with_subscription: 142,
    businesses_without_subscription: 14,
  }
}

const initialBusinesses = [
  {
    business: {
      id: "bus_001",
      name: "Coffee House Sdn Bhd",
      registration_number: "202401001234",
      is_active: true,
      created_at: "2024-01-15T08:00:00",
    },
    subscription: {
      status: "active" as const,
      plan_type: "MONTHLY" as const,
      end_date: "2025-01-15",
    },
    customer_count: 1250,
    total_points_issued: 125000,
  },
  {
    business: {
      id: "bus_002",
      name: "Tech Store MY",
      registration_number: "202403002345",
      is_active: true,
      created_at: "2024-03-01T09:15:00",
    },
    subscription: {
      status: "active" as const,
      plan_type: "YEARLY" as const,
      end_date: "2025-03-01",
    },
    customer_count: 3420,
    total_points_issued: 456000,
  },
  {
    business: {
      id: "bus_003",
      name: "Bakery Delight",
      registration_number: "202411003456",
      is_active: true,
      created_at: "2024-11-20T10:30:00",
    },
    subscription: {
      status: "trial" as const,
      plan_type: "MONTHLY" as const,
      end_date: "2024-12-20",
    },
    customer_count: 85,
    total_points_issued: 4250,
  },
  {
    business: {
      id: "bus_004",
      name: "FreshMart",
      registration_number: "202406004567",
      is_active: true,
      created_at: "2024-06-01T14:20:00",
    },
    subscription: {
      status: "active" as const,
      plan_type: "MONTHLY" as const,
      end_date: "2025-06-01",
    },
    customer_count: 2180,
    total_points_issued: 287000,
  },
  {
    business: {
      id: "bus_005",
      name: "Fashion Hub",
      registration_number: "202408005678",
      is_active: false,
      created_at: "2024-08-15T11:00:00",
    },
    subscription: {
      status: "expired" as const,
      plan_type: "MONTHLY" as const,
      end_date: "2024-11-15",
    },
    customer_count: 650,
    total_points_issued: 32500,
  },
  {
    business: {
      id: "bus_006",
      name: "Gym Pro Fitness",
      registration_number: "202402006789",
      is_active: true,
      created_at: "2024-02-01T08:45:00",
    },
    subscription: {
      status: "active" as const,
      plan_type: "YEARLY" as const,
      end_date: "2025-02-01",
    },
    customer_count: 890,
    total_points_issued: 178000,
  },
  {
    business: {
      id: "bus_007",
      name: "Pet Paradise",
      registration_number: "202411007890",
      is_active: true,
      created_at: "2024-11-25T13:15:00",
    },
    subscription: {
      status: "trial" as const,
      plan_type: null,
      end_date: "2024-12-25",
    },
    customer_count: 42,
    total_points_issued: 2100,
  },
  {
    business: {
      id: "bus_008",
      name: "Auto Care Center",
      registration_number: "202404008901",
      is_active: true,
      created_at: "2024-04-10T16:30:00",
    },
    subscription: {
      status: "active" as const,
      plan_type: "MONTHLY" as const,
      end_date: "2025-04-10",
    },
    customer_count: 520,
    total_points_issued: 78000,
  },
  {
    business: {
      id: "bus_009",
      name: "Book Corner",
      registration_number: "202409009012",
      is_active: true,
      created_at: "2024-09-05T09:00:00",
    },
    subscription: {
      status: "none" as const,
      plan_type: null,
      end_date: null,
    },
    customer_count: 0,
    total_points_issued: 0,
  },
]

export default function BusinessesPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [businesses, setBusinesses] = React.useState(initialBusinesses)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [activeFilter, setActiveFilter] = React.useState("all")
  const [createdDateRange, setCreatedDateRange] = React.useState<DateRange | undefined>()
  const [subscriptionEndRange, setSubscriptionEndRange] = React.useState<DateRange | undefined>()
  const [selectedBusiness, setSelectedBusiness] = React.useState<typeof initialBusinesses[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = React.useState(false)
  
  const businessesOverview = getBusinessesOverview(dateRange)

  const filteredBusinesses = businesses.filter((item) => {
    const matchesSearch = 
      item.business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.business.registration_number.includes(searchQuery)
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
    
    return matchesSearch && matchesStatus && matchesActive && matchesCreatedDate && matchesEndDate
  })

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
    setBusinesses(prev => prev.map(item => {
      if (item.business.id === businessId) {
        return {
          ...item,
          business: {
            ...item.business,
            is_active: !item.business.is_active
          }
        }
      }
      return item
    }))
  }

  const viewBusinessDetails = (business: typeof initialBusinesses[0]) => {
    setSelectedBusiness(business)
    setShowDetailDialog(true)
  }

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
            <CardDescription>Total Businesses</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.total_businesses}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Registered businesses
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active Businesses</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.active_businesses}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            With active subscription
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>New Businesses</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.new_businesses}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            This month
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>With Subscription</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.businesses_with_subscription}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Active or trial
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Without Subscription</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {businessesOverview.businesses_without_subscription}
            </CardTitle>
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
                  {filteredBusinesses.length === 0 ? (
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

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredBusinesses.length} of {businesses.length} businesses</p>
          </div>
        </CardContent>
      </Card>

      {/* Business Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedBusiness?.business.name}</DialogTitle>
            <DialogDescription>
              Business details and statistics
            </DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-medium">{selectedBusiness.business.registration_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {selectedBusiness.business.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <div className="mt-1">{getStatusBadge(selectedBusiness.subscription.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan Type</p>
                  <p className="font-medium">{selectedBusiness.subscription.plan_type || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="font-medium">{selectedBusiness.customer_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points Issued</p>
                  <p className="font-medium">{selectedBusiness.total_points_issued.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">{formatDate(selectedBusiness.business.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription End</p>
                  <p className="font-medium">{formatDate(selectedBusiness.subscription.end_date)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
