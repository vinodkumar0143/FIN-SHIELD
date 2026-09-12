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

    const json = await res.json()
    if (!res.ok || json.success === false) {
      throw new ApiError(
        json.error?.message || `Request failed with status ${res.status}`,
        json.error?.code,
        json.error?.details
      )
    }

    return json.data !== undefined ? json.data : json
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

    const json = await res.json()
    if (!res.ok || json.success === false) {
      throw new ApiError(
        json.error?.message || `Request failed with status ${res.status}`,
        json.error?.code,
        json.error?.details
      )
    }

    return json.data !== undefined ? json.data : json
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

    const json = await res.json()
    if (!res.ok || json.success === false) {
      throw new ApiError(
        json.error?.message || `Request failed with status ${res.status}`,
        json.error?.code,
        json.error?.details
      )
    }

    return json.data !== undefined ? json.data : json
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

    const json = await res.json()
    if (!res.ok || json.success === false) {
      throw new ApiError(
        json.error?.message || `Request failed with status ${res.status}`,
        json.error?.code,
        json.error?.details
      )
    }

    return json.data !== undefined ? json.data : json
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

    const json = await res.json()
    if (!res.ok || json.success === false) {
      throw new ApiError(
        json.error?.message || `Upload failed with status ${res.status}`,
        json.error?.code,
        json.error?.details
      )
    }

    return json.data !== undefined ? json.data : json
  }
}
