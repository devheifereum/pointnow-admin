/**
 * API utility functions for making authenticated requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

/**
 * Get access token from cookies (for server-side) or localStorage (for client-side)
 */
async function getAccessToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // Client-side: get from localStorage
    return localStorage.getItem('access_token')
  }
  // Server-side: would need to get from cookies via headers
  return null
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `Request failed: ${response.statusText}` 
    }))
    throw new Error(errorData.message || `Request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Make an authenticated API request via Next.js API route (for server-side)
 */
export async function apiRequestViaRoute<T>(
  route: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(route, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `Request failed: ${response.statusText}` 
    }))
    throw new Error(errorData.message || `Request failed: ${response.statusText}`)
  }

  return response.json()
}


