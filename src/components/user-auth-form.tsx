"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function UserAuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const router = useRouter()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard after successful login
      router.push("/dashboard")
    }, 1500)
  }

  async function handleGitHubSignIn() {
    setIsLoading(true)
    // Simulate GitHub OAuth
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              placeholder="admin@pointnow.io"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Spinner className="mr-2" />}
              Sign In
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldSeparator>Or continue with</FieldSeparator>
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading}
        onClick={handleGitHubSignIn}
        className="w-full"
      >
        {isLoading ? (
          <Spinner className="mr-2" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        GitHub
      </Button>
    </div>
  )
}
