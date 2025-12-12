import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface BusinessAdmin {
  email: string
  name: string
}

export interface BusinessUsageSummary {
  service: string
  count: number
  cost: number
}

export interface BusinessSubscription {
  id: string
  type: string
  provider: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface BusinessRegion {
  id: string
  name: string
  country_code: string
}

export interface Business {
  id: string
  name: string
  email: string
  status: string
  registration_number: string
  staff_count: number
  customers_count: number
  branches_count: number
  total_points: number
  admins: BusinessAdmin[]
  usage_summary: BusinessUsageSummary[]
  latest_subscription: BusinessSubscription | {}
  regions: BusinessRegion[]
  created_at: string
}

export interface BusinessesSummaryResponse {
  message: string
  status_code: number
  data: {
    businesses: Business[]
    metadata: {
      total: number
      page: number
      limit: number
      total_pages: number
      has_next: boolean
      has_previous: boolean
    }
  }
}

/**
 * API route handler for businesses summary
 * Fetches businesses list from the backend API
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
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const query = searchParams.get('query')
    const countryCode = searchParams.get('country_code')

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('page', page)
    queryParams.append('limit', limit)
    if (query) queryParams.append('query', query)
    if (countryCode) queryParams.append('country_code', countryCode)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/business/summary?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: BusinessesSummaryResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch businesses', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Businesses summary error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}


