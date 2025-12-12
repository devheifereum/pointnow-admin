import { NextResponse } from 'next/server'

/**
 * API route handler for logout
 * Clears authentication cookies
 */
export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully', status: 200 },
    { status: 200 }
  )

  // Clear all auth cookies
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  response.cookies.delete('user_data')

  return response
}


