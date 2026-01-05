/**
 * Authentication service for handling login, logout, and token management
 */

export interface LoginResponse {
  message: string
  status: number
  data: {
    id: string
    email: string
    name: string
    phone_number: string
    created_at: string
    updated_at: string
    admin?: {
      business_id: string
    }
    staff?: {
      business_id: string
    }
    user_roles: Array<{
      role: {
        name: string
      }
    }>
    customer?: {
      id: string
    }
    backendTokens: {
      access_token: string
      refresh_token: string
      expires_in: number
    }
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pointnow.io/api/v1'

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login/super_admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
    throw new Error(errorData.message || `Login failed: ${response.statusText}`)
  }

  const data: LoginResponse = await response.json()
  return data
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens: LoginResponse['data']['backendTokens']) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    localStorage.setItem('token_expires_in', tokens.expires_in.toString())
  }
}

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token')
  }
  return null
}

/**
 * Clear all auth tokens
 */
export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_in')
    localStorage.removeItem('user_data')
  }
}

/**
 * Store user data
 */
export function storeUserData(userData: LoginResponse['data']) {
  if (typeof window !== 'undefined') {
    // Don't store tokens in user data
    const { backendTokens, ...safeUserData } = userData
    localStorage.setItem('user_data', JSON.stringify(safeUserData))
  }
}

/**
 * Get user data from storage
 */
export function getUserData(): LoginResponse['data'] | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      return JSON.parse(userData)
    }
  }
  return null
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) return false

  // Check if token is expired
  const expiresIn = localStorage.getItem('token_expires_in')
  if (expiresIn) {
    const expiryTime = parseInt(expiresIn, 10)
    if (Date.now() >= expiryTime) {
      clearTokens()
      return false
    }
  }

  return true
}

/**
 * Check if user is authenticated (server-side)
 * Checks for access_token in cookies
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    // Client-side: use the client function
    return isAuthenticated()
  }
  
  // Server-side: would need to be called from a server component with cookies
  // This is a placeholder - actual implementation should use cookies() from next/headers
  return false
}





