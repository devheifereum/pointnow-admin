import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

export interface Charge {
  id: string
  object: string
  amount: number
  amount_captured: number
  amount_refunded: number
  balance_transaction: string
  billing_details: {
    address: {
      city: string | null
      country: string
      line1: string | null
      line2: string | null
      postal_code: string | null
      state: string | null
    }
    email: string
    name: string
    phone: string | null
    tax_id: string | null
  }
  captured: boolean
  created: number
  currency: string
  customer: string
  description: string
  paid: boolean
  payment_intent: string
  payment_method: string
  payment_method_details: {
    card: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
    type: string
  }
  receipt_url: string | null
  refunded: boolean
  status: string
  outcome: {
    network_status: string
    risk_level: string
    risk_score: number
    seller_message: string
    type: string
  }
}

export interface ChargesResponse {
  message: string
  status_code: number
  data: {
    charges: Charge[]
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
 * API route handler for revenue charges
 * Fetches charges from the backend API
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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    // Build query string
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('start_date', startDate)
    if (endDate) queryParams.append('end_date', endDate)
    queryParams.append('page', page)
    queryParams.append('limit', limit)

    const queryString = queryParams.toString()
    const url = `${API_URL}/analytics/revenue/charges?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const data: ChargesResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch charges', status_code: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Charges error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status_code: 500 },
      { status: 500 }
    )
  }
}


