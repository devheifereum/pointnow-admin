"use client"

import * as React from "react"
import { IconTrendingUp, IconSearch, IconUsers, IconCalendar } from "@tabler/icons-react"
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
import { DateRangePicker } from "@/components/ui/date-picker"

// Dummy data - in real app, this would be filtered by dateRange
const getCustomersOverview = (dateRange?: DateRange) => {
  return {
    total_customers: 12847,
    active_customers: 8432,
    new_customers: 1256,
  }
}

const customers = [
  {
    id: "cust_001",
    name: "Ahmad bin Abdullah",
    email: "ahmad@email.com",
    phone_number: "+60123456789",
    total_points_all_businesses: 15420,
    businesses_count: 3,
    last_activity: "2024-12-01T10:30:00",
    created_at: "2024-01-15T08:00:00",
  },
  {
    id: "cust_002",
    name: "Sarah Lee",
    email: "sarah.lee@email.com",
    phone_number: "+60198765432",
    total_points_all_businesses: 8750,
    businesses_count: 2,
    last_activity: "2024-12-02T14:20:00",
    created_at: "2024-03-20T09:15:00",
  },
  {
    id: "cust_003",
    name: "Raj Kumar",
    email: "raj.kumar@email.com",
    phone_number: "+60177654321",
    total_points_all_businesses: 22100,
    businesses_count: 5,
    last_activity: "2024-12-03T09:45:00",
    created_at: "2023-11-10T11:30:00",
  },
  {
    id: "cust_004",
    name: "Michelle Tan",
    email: "michelle.t@email.com",
    phone_number: "+60162345678",
    total_points_all_businesses: 5200,
    businesses_count: 1,
    last_activity: "2024-11-28T16:00:00",
    created_at: "2024-06-05T14:20:00",
  },
  {
    id: "cust_005",
    name: "David Wong",
    email: "david.wong@email.com",
    phone_number: "+60143216789",
    total_points_all_businesses: 31500,
    businesses_count: 8,
    last_activity: "2024-12-03T11:15:00",
    created_at: "2023-08-22T10:00:00",
  },
  {
    id: "cust_006",
    name: "Nurul Aisyah",
    email: "nurul.a@email.com",
    phone_number: "+60189876543",
    total_points_all_businesses: 12300,
    businesses_count: 4,
    last_activity: "2024-12-02T08:30:00",
    created_at: "2024-02-14T13:45:00",
  },
  {
    id: "cust_007",
    name: "James Chen",
    email: "james.chen@email.com",
    phone_number: "+60156789012",
    total_points_all_businesses: 7800,
    businesses_count: 2,
    last_activity: "2024-11-30T17:20:00",
    created_at: "2024-04-18T09:30:00",
  },
  {
    id: "cust_008",
    name: "Priya Nair",
    email: "priya.nair@email.com",
    phone_number: "+60134567890",
    total_points_all_businesses: 18900,
    businesses_count: 6,
    last_activity: "2024-12-01T12:00:00",
    created_at: "2023-12-05T15:10:00",
  },
]

const businesses = [
  { id: "all", name: "All Businesses" },
  { id: "bus_001", name: "Coffee House Sdn Bhd" },
  { id: "bus_002", name: "Tech Store MY" },
  { id: "bus_003", name: "Bakery Delight" },
  { id: "bus_004", name: "FreshMart" },
]

export default function CustomersPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [businessFilter, setBusinessFilter] = React.useState("all")
  const [joinedDateRange, setJoinedDateRange] = React.useState<DateRange | undefined>()
  const [lastActivityRange, setLastActivityRange] = React.useState<DateRange | undefined>()
  
  const customersOverview = getCustomersOverview(dateRange)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone_number.includes(searchQuery)
    
    // Filter by joined date range
    const joinedDate = parseISO(customer.created_at)
    const matchesJoinedDate = !joinedDateRange?.from || (
      isWithinInterval(joinedDate, {
        start: joinedDateRange.from,
        end: joinedDateRange.to || joinedDateRange.from
      })
    )
    
    // Filter by last activity date range
    const lastActivityDate = parseISO(customer.last_activity)
    const matchesLastActivity = !lastActivityRange?.from || (
      isWithinInterval(lastActivityDate, {
        start: lastActivityRange.from,
        end: lastActivityRange.to || lastActivityRange.from
      })
    )
    
    return matchesSearch && matchesJoinedDate && matchesLastActivity
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
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
    setBusinessFilter("all")
    setJoinedDateRange(undefined)
    setLastActivityRange(undefined)
  }

  const hasActiveFilters = dateRange?.from || searchQuery || businessFilter !== "all" || joinedDateRange?.from || lastActivityRange?.from

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Date Range Filter at Top */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground text-sm">
            View and manage all customers across businesses
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {customersOverview.total_customers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            System-wide customers
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>Active Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {customersOverview.active_customers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Active in last 30 days
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader className="pb-2">
            <CardDescription>New Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {customersOverview.new_customers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            This month
          </CardFooter>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>View customers across all businesses</CardDescription>
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
              <Select value={businessFilter} onValueChange={setBusinessFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Last Activity Range</p>
                <DateRangePicker
                  dateRange={lastActivityRange}
                  onDateRangeChange={setLastActivityRange}
                  placeholder="Filter by last activity"
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
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Last Activity</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-muted-foreground break-all">{customer.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                          {customer.phone_number}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {customer.total_points_all_businesses.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant="outline">{customer.businesses_count}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                          {formatDateTime(customer.last_activity)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                          {formatDate(customer.created_at)}
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
            <p>Showing {filteredCustomers.length} of {customers.length} customers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
