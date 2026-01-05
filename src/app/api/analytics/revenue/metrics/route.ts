import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface RevenueMetricsResponse {
  message: string
  status_code: number
  data: {
    metrics: {
      total_revenue: number
      total_customers: number
      total_active_subscriptions: number
    }
  }
}

/**
 * API route handler for revenue metrics
 * Fetches revenue metrics from the backend API
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized', status_code: 401 },
        { status: 401 }
      )
    }

    // Get query parameters for date range
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Build query string
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('start_date', startDate)
    if (endDate) queryParams.append('end_date', endDate)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/revenue/metrics${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: RevenueMetricsResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch revenue metrics', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Revenue metrics error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}





