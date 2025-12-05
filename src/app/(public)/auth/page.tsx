import { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { FieldDescription } from "@/components/ui/field"
import { UserAuthForm } from "@/components/user-auth-form"

export const metadata: Metadata = {
  title: "Sign In - PointNow Admin",
  description: "Sign in to PointNow Admin Dashboard",
}

export default function AuthenticationPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      {/* Logo/Branding */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">PN</span>
          </div>
          <span>PointNow Admin</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to access the PointNow Admin Dashboard
          </p>
        </div>
        
        <UserAuthForm />
        
        <FieldDescription className="px-4 text-center text-xs">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </FieldDescription>
      </div>
    </div>
  )
}
