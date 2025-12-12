"use client"

import * as React from "react"
import { IconSettings, IconAlertTriangle, IconCheck } from "@tabler/icons-react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

// Dummy data
const subscriptionProducts = [
  {
    id: "prod_001",
    name: "Starter",
    price_monthly: 99,
    price_yearly: 990,
    has_trial: true,
    trial_days: 14,
    features: ["Up to 500 customers", "Basic analytics", "Email support"],
  },
  {
    id: "prod_002",
    name: "Premium",
    price_monthly: 299,
    price_yearly: 2990,
    has_trial: true,
    trial_days: 14,
    features: ["Unlimited customers", "Advanced analytics", "Priority support", "Custom branding"],
  },
  {
    id: "prod_003",
    name: "Enterprise",
    price_monthly: 599,
    price_yearly: 5990,
    has_trial: false,
    trial_days: 0,
    features: ["Everything in Premium", "Dedicated account manager", "API access", "Custom integrations"],
  },
]

export default function SettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false)
  const [showSavedAlert, setShowSavedAlert] = React.useState(false)

  const handleMaintenanceModeChange = (checked: boolean) => {
    setMaintenanceMode(checked)
    setShowSavedAlert(true)
    setTimeout(() => setShowSavedAlert(false), 3000)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Saved Alert */}
      {showSavedAlert && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <IconCheck className="size-4 text-green-600" />
          <AlertTitle className="text-green-600">Settings saved</AlertTitle>
          <AlertDescription className="text-green-600/80">
            Your settings have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSettings className="size-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Manage system-wide settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode" className="text-base font-medium">
                Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable to prevent users from accessing the system while performing maintenance
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={handleMaintenanceModeChange}
            />
          </div>

          {maintenanceMode && (
            <Alert variant="destructive">
              <IconAlertTriangle className="size-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Maintenance mode is enabled. Users will not be able to access the system.
              </AlertDescription>
            </Alert>
          )}

          {/* System Info */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 text-sm font-medium">System Information</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <Badge variant="outline">Production</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">Dec 3, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Status</span>
                <Badge className="bg-green-500/10 text-green-600">Connected</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Products */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Products</CardTitle>
          <CardDescription>
            Available subscription plans (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="rounded-md border min-w-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Monthly Price</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Yearly Price</TableHead>
                    <TableHead className="text-center">Trial</TableHead>
                    <TableHead className="hidden lg:table-cell">Features</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        RM {product.price_monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        RM {product.price_yearly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.has_trial ? (
                          <Badge className="bg-green-500/10 text-green-600">
                            {product.trial_days} days
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.features.slice(0, 2).map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {product.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Contact the development team to add or modify subscription products.
        </CardFooter>
      </Card>

    </div>
  )
}

