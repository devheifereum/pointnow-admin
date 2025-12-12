import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface RecentBusiness {
  id: string
  name: string
  email: string
  phone_number: string
  status: string
  registration_number: string
  address: string
  created_at: string
}

export interface MostCustomersBusiness extends RecentBusiness {
  total_customers: number
}

export interface MostPointsBusiness {
  id: string
  name: string
  email: string | null
  phone_number: string | null
  status: string
  registration_number: string
  address: string
  created_at: string
  total_points: number
}

export interface BusinessSummaryMetricsResponse {
  message: string
  status_code: number
  data: {
    total_business: number
    recent_business: RecentBusiness[]
    most_customers_business: MostCustomersBusiness[]
    most_points_business: MostPointsBusiness[]
  }
}

/**
 * API route handler for business summary metrics
 * Fetches business analytics metrics from the backend API
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

    // Get query parameters for date range (if needed in future)
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Build query string
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('start_date', startDate)
    if (endDate) queryParams.append('end_date', endDate)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/business/summary/metrics${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: BusinessSummaryMetricsResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch business metrics', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Business metrics error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}

