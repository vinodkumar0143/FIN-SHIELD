import { apiClient } from './apiClient'

export type UserRole = 'ADMIN' | 'FINANCE_MANAGER' | 'FINANCE_ANALYST' | 'EMPLOYEE'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: UserRole
  department: string
  avatar_url: string | null
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface UserQueryFilters {
  search?: string
  role?: string
  status?: string
  limit?: number
  offset?: number
}

export interface UsersResponse {
  success: boolean
  data: UserProfile[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export const usersService = {
  async getUsers(filters: UserQueryFilters = {}): Promise<UsersResponse> {
    return apiClient.get('/api/users', filters as Record<string, any>)
  },

  async getUserById(id: string): Promise<UserProfile> {
    return apiClient.get(`/api/users/${id}`)
  },

  async updateUserRole(id: string, role: UserRole): Promise<{
    success: boolean
    data: UserProfile
    message: string
  }> {
    return apiClient.patch(`/api/users/${id}/role`, { role })
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<{
    success: boolean
    data: UserProfile
    message: string
  }> {
    return apiClient.patch(`/api/users/${id}/status`, { status })
  }
}
