import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

/**
 * API route handler for login
 * This acts as a proxy to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required', status: 400 },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_URL}/auth/login/super_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Login failed', status: response.status },
        { status: response.status }
      )
    }

    // Set HTTP-only cookies for tokens (more secure than localStorage)
    const responseWithCookies = NextResponse.json(data, { status: 200 })
    
    if (data.data?.backendTokens) {
      const { access_token, refresh_token, expires_in } = data.data.backendTokens
      
      // Calculate expiry date (expires_in is a timestamp)
      const expiresDate = new Date(expires_in)
      
      responseWithCookies.cookies.set('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresDate,
        path: '/',
      })
      
      responseWithCookies.cookies.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        path: '/',
      })

      // Store user data in cookie (non-sensitive info)
      const { password: _, backendTokens: __, ...userData } = data.data
      responseWithCookies.cookies.set('user_data', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresDate,
        path: '/',
      })
    }

    return responseWithCookies
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status: 500 },
      { status: 500 }
    )
  }
}

