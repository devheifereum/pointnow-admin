import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface CustomerBusiness {
  id: string
  name: string
  email: string | null
  phone_number: string | null
  total_points: number
  total_visits: number
  last_visit_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone_number: string
  is_verified: boolean
  joined_at: string
  total_businesses: number
  total_points: number
  total_visits: number
  last_visit_at: string
  businesses: CustomerBusiness[]
}

export interface CustomersSummaryResponse {
  message: string
  status_code: number
  data: {
    customers: Customer[]
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
 * API route handler for customers summary
 * Fetches customers list from the backend API
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
    const startDateJoined = searchParams.get('start_date_joined')
    const endDateJoined = searchParams.get('end_date_joined')
    const lastVisitStartDate = searchParams.get('last_visit_start_date')
    const lastVisitEndDate = searchParams.get('last_visit_end_date')

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('page', page)
    queryParams.append('limit', limit)
    if (startDateJoined) queryParams.append('start_date_joined', startDateJoined)
    if (endDateJoined) queryParams.append('end_date_joined', endDateJoined)
    if (lastVisitStartDate) queryParams.append('last_visit_start_date', lastVisitStartDate)
    if (lastVisitEndDate) queryParams.append('last_visit_end_date', lastVisitEndDate)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/customers/summary?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: CustomersSummaryResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch customers', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Customers summary error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}




