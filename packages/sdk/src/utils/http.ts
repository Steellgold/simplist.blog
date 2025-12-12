import { ApiError } from '../types/api'

export class SimplistApiError extends Error {
  public readonly statusCode: number
  public readonly error: string
  public readonly details?: any

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'SimplistApiError'
    this.statusCode = error.statusCode
    this.error = error.error
    this.details = error.details
  }
}

export interface HttpClientOptions {
  baseUrl: string
  apiKey: string
  apiVersion?: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

export class HttpClient {
  private baseUrl: string
  private apiKey: string
  private apiVersion: string
  private timeout: number
  private retries: number
  private retryDelay: number

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = options.apiKey
    this.apiVersion = options.apiVersion || '1'
    this.timeout = options.timeout || 10000
    this.retries = options.retries || 3
    this.retryDelay = options.retryDelay || 1000
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const versionedPath = path.startsWith('/v') ? path : `/v${this.apiVersion}${path}`
    const url = `${this.baseUrl}${versionedPath}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'User-Agent': 'SimplistSDK/1.0',
        'X-Simplist-Source': 'sdk',
        ...options.headers,
      },
    }

    // Add timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    let lastError: Error

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: 'Unknown Error',
            message: `Request failed with status ${response.status}`,
            statusCode: response.status,
          }))
          throw new SimplistApiError(errorData)
        }

        // Check if response should be parsed as text (for XML responses)
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('xml') || contentType.includes('rss') || contentType.includes('text/plain')) {
          const data = await response.text()
          return data as T
        }

        const data = await response.json()
        return data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry on client errors (4xx) or auth errors
        if (error instanceof SimplistApiError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error
        }

        // Don't retry on the last attempt
        if (attempt === this.retries) {
          break
        }

        // Wait before retrying with exponential backoff
        await this.sleep(this.retryDelay * Math.pow(2, attempt))
      }
    }

    clearTimeout(timeoutId)
    throw lastError!
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle optionalFields object specially
          if (key === 'optionalFields' && typeof value === 'object') {
            const fields = Object.entries(value)
              .filter(([_, v]) => v === true)
              .map(([k]) => k)
              .join(',')
            if (fields) {
              searchParams.append(key, fields)
            }
          } else {
            searchParams.append(key, String(value))
          }
        }
      })
    }

    const query = searchParams.toString()
    const fullPath = query ? `${path}?${query}` : path

    return this.makeRequest<T>(fullPath, { method: 'GET' })
  }

  async post<T>(path: string, body?: any): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(path: string, body?: any): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'DELETE' })
  }
}