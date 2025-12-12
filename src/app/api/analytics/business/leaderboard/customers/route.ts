import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface LeaderboardCustomer {
  id: string
  name: string
  email: string
  phone_number: string
  total_points: number
  total_visits: number
  last_visit_at: string
}

export interface BusinessLeaderboardCustomersResponse {
  message: string
  status_code: number
  data: {
    customers: LeaderboardCustomer[]
    metadata: {
      total: number
      page: number
      limit: number
      total_pages: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

/**
 * API route handler for business customer leaderboard
 * Fetches top customers for a specific business from the backend API
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
    const businessId = searchParams.get('business_id')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!businessId) {
      return NextResponse.json(
        { message: 'Business ID is required', status_code: 400 },
        { status: 400 }
      )
    }

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('business_id', businessId)
    queryParams.append('page', page)
    queryParams.append('limit', limit)
    if (startDate) queryParams.append('start_date', startDate)
    if (endDate) queryParams.append('end_date', endDate)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/business/leaderboard/customers?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: BusinessLeaderboardCustomersResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch customer leaderboard', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Business customer leaderboard error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}


