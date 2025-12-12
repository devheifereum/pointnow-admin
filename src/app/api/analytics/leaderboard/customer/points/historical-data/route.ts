import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface HistoricalDataPoint {
  count: number
  date: string
  total_points: number
}

export interface CustomerPointsHistoricalDataResponse {
  message: string
  status_code: number
  data: {
    historical_data: HistoricalDataPoint[]
  }
}

/**
 * API route handler for customer points historical data
 * Fetches historical points data for a specific customer
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')

    if (!customerId) {
      return NextResponse.json(
        { message: 'Customer ID is required', status_code: 400 },
        { status: 400 }
      )
    }

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('customer_id', customerId)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/leaderboard/customer/points/historical-data?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: CustomerPointsHistoricalDataResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch historical data', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Customer points historical data error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}



