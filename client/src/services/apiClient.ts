import { supabase } from '../lib/supabaseClient'

export class ApiError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    return {
      Authorization: `Bearer ${session.access_token}`
    }
  }
  return {}
}

async function parseResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text()
  let parsed: any = null

  if (text && text.trim().length > 0) {
    try {
      parsed = JSON.parse(text)
    } catch {
      // Body is not JSON (e.g. proxy HTML error or plain text)
      parsed = null
    }
  }

  // Handle HTTP error responses (!res.ok)
  if (!res.ok) {
    // 1. Structured JSON error
    if (parsed && typeof parsed === 'object') {
      const errMsg =
        parsed.error?.message ||
        parsed.message ||
        (typeof parsed.error === 'string' ? parsed.error : null) ||
        `Request failed with status ${res.status}`
      const errCode =
        parsed.error?.code ||
        parsed.code ||
        (typeof parsed.error === 'string' ? parsed.error : undefined)
      throw new ApiError(errMsg, errCode, parsed.error?.details || parsed.details)
    }

    // 2. Gateway / Proxy connectivity errors (e.g. Vite proxy 502/504 when backend is offline)
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new ApiError(
        'Unable to connect to the FinShield server. Please ensure the backend server is running.',
        'SERVER_UNAVAILABLE',
        { status: res.status }
      )
    }

    // 3. Fallback for plain text or HTML error pages
    const cleanText = text ? text.replace(/<[^>]*>?/gm, '').trim().slice(0, 200) : ''
    throw new ApiError(
      cleanText || `Request failed with status ${res.status}`,
      `HTTP_${res.status}`
    )
  }

  // Handle successful responses (200-299)
  if (parsed && typeof parsed === 'object') {
    if (parsed.success === false) {
      const errMsg =
        parsed.error?.message ||
        parsed.message ||
        (typeof parsed.error === 'string' ? parsed.error : null) ||
        'Request failed'
      throw new ApiError(errMsg, parsed.error?.code || parsed.code, parsed.error?.details)
    }

    // Prioritize specific payload keys
    if (parsed.profile !== undefined) {
      return parsed.profile
    }
    if (parsed.data !== undefined) {
      return parsed.data
    }
    return parsed
  }

  // If response is empty or non-JSON but HTTP status was successful
  return (parsed !== null ? parsed : (text as unknown)) as T
}

export const apiClient = {
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const authHeaders = await getAuthHeader()
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    })

    return parseResponse<T>(res)
  },

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const authHeaders = await getAuthHeader()
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: body ? JSON.stringify(body) : undefined
    })

    return parseResponse<T>(res)
  },

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    const authHeaders = await getAuthHeader()
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: body ? JSON.stringify(body) : undefined
    })

    return parseResponse<T>(res)
  },

  async delete<T = any>(endpoint: string): Promise<T> {
    const authHeaders = await getAuthHeader()
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    })

    return parseResponse<T>(res)
  },

  async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    const authHeaders = await getAuthHeader()
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...authHeaders
        // Note: Do not set Content-Type; browser automatically sets multipart/form-data boundary
      },
      body: formData
    })

    return parseResponse<T>(res)
  }
}
