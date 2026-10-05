const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const OAUTH_PROVIDERS = new Set(['google', 'apple', 'microsoft', 'github'])

const parseError = async (response) => {
  try {
    const payload = await response.json()
    return payload?.message || 'Something went wrong. Please try again.'
  } catch {
    return 'Something went wrong. Please try again.'
  }
}

export const authService = {
  getOAuthUrl(provider) {
    if (!API_BASE_URL) {
      throw new Error('Authentication backend is not configured. Set VITE_AUTH_API_URL to connect LORA authentication.')
    }

    if (!OAUTH_PROVIDERS.has(provider)) {
      throw new Error('This sign-in provider is not supported.')
    }

    return `${API_BASE_URL.replace(/\/$/, '')}/auth/${provider}`
  },

  async login({ email, password }) {
    if (!API_BASE_URL) {
      throw new Error('Authentication backend is not configured. Set VITE_AUTH_API_URL to connect LORA authentication.')
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(await parseError(response))
    }

    return response.json()
  },

  async signup({ name, email, password }) {
    if (!API_BASE_URL) {
      throw new Error('Authentication backend is not configured. Set VITE_AUTH_API_URL to connect LORA authentication.')
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      throw new Error(await parseError(response))
    }

    return response.json()
  },

  async resetPassword({ email }) {
    if (!API_BASE_URL) {
      throw new Error('Authentication backend is not configured. Set VITE_AUTH_API_URL to connect LORA authentication.')
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error(await parseError(response))
    }

    return response.json()
  },
}
