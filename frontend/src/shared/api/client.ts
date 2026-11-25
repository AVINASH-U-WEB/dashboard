/**
 * Centralized HTTP API client using the native Fetch API.
 * Handles environment-based URL resolution, query string serialization,
 * error normalization, and request cancellation via AbortSignal.
 */

export class ApiError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly data?: unknown

  constructor(status: number, statusText: string, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | null | undefined> | URLSearchParams
  body?: unknown
  signal?: AbortSignal
}

interface ViteEnv {
  VITE_API_URL?: string
  VITE_API_BASE_URL?: string
  DEV?: boolean
  PROD?: boolean
  MODE?: string
}

/**
 * Resolves the API base URL based on environment configuration.
 * - In development, defaults to the Vite reverse proxy path `/api/v1`.
 * - In production, reads from `import.meta.env.VITE_API_URL` or `import.meta.env.VITE_API_BASE_URL`.
 * - If unset in production, defaults to relative `/api/v1` (never hardcoding localhost).
 */
export const getApiBaseUrl = (): string => {
  const env = (import.meta as unknown as { env?: ViteEnv }).env || {}
  const envUrl = env.VITE_API_URL || env.VITE_API_BASE_URL
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '')
  }
  return '/api/v1'
}

/**
 * Serializes query parameters into a URL query string.
 */
export const buildQueryString = (
  params?: Record<string, string | number | boolean | null | undefined> | URLSearchParams
): string => {
  if (!params) return ''
  if (params instanceof URLSearchParams) {
    const str = params.toString()
    return str ? `?${str}` : ''
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  }
  const str = searchParams.toString()
  return str ? `?${str}` : ''
}

/**
 * Centralized fetch client for API requests.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, headers, signal, ...rest } = options

  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const queryString = buildQueryString(params)
  const url = `${baseUrl}${cleanEndpoint}${queryString}`

  const requestHeaders = new Headers(headers)
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  let serializedBody: BodyInit | undefined = undefined
  if (body !== undefined && body !== null) {
    if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
      serializedBody = body
    } else {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json')
      }
      serializedBody = JSON.stringify(body)
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body: serializedBody,
      signal,
    })
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    const message = error instanceof Error ? error.message : 'Network request failed'
    throw new ApiError(0, 'NetworkError', message)
  }

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      try {
        errorData = await response.text()
      } catch {
        errorData = undefined
      }
    }

    const detail =
      typeof errorData === 'object' && errorData !== null && 'detail' in errorData
        ? String((errorData as { detail: unknown }).detail)
        : undefined

    const errorMessage =
      detail || `Request failed with status ${response.status}: ${response.statusText || 'Error'}`

    throw new ApiError(response.status, response.statusText, errorMessage, errorData)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  return response.json() as Promise<T>
}

// Convenient HTTP method helpers
apiClient.get = <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' })

apiClient.post = <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  apiClient<T>(endpoint, { ...options, method: 'POST', body })

apiClient.put = <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  apiClient<T>(endpoint, { ...options, method: 'PUT', body })

apiClient.delete = <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' })
