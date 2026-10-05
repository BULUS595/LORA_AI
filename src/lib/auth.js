import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const OAUTH_PROVIDERS = new Set(['google', 'apple', 'microsoft', 'github'])
let supabaseClient

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  return supabaseClient
}

const getAuthErrorMessage = (error) => {
  const messages = {
    invalid_credentials: 'Your email or password is incorrect.',
    email_not_confirmed: 'Confirm your email before signing in.',
    email_exists: 'An account with this email already exists. Log in instead.',
    user_already_exists: 'An account with this email already exists. Log in instead.',
    weak_password: 'Choose a stronger password and try again.',
    email_address_invalid: 'Enter a valid email address.',
    over_email_send_rate_limit: 'Too many email requests. Wait a little and try again.',
  }

  return messages[error.code] || 'We could not complete that request. Please try again.'
}

const invokeBillingFunction = async (functionName, body = {}, method = 'POST') => {
  const options = method === 'GET' ? { method } : { method, body }
  const { data, error } = await getSupabase().functions.invoke(functionName, options)

  if (error) {
    let message = 'Billing is temporarily unavailable. Please try again.'
    if (error.context instanceof Response) {
      try {
        const payload = await error.context.json()
        message = payload?.error || payload?.message || message
      } catch {}
    }
    throw new Error(message)
  }

  return data
}

export const authService = {
  async login({ email, password }) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) throw new Error(getAuthErrorMessage(error))
    return { user: data.user, session: data.session }
  },

  async signup({ name, email, password }) {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw new Error(getAuthErrorMessage(error))
    return { user: data.user, session: data.session }
  },

  async startOAuth(provider) {
    if (!OAUTH_PROVIDERS.has(provider)) {
      throw new Error('This sign-in provider is not supported.')
    }

    const supabaseProvider = provider === 'microsoft' ? 'azure' : provider
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: supabaseProvider,
      options: { redirectTo: window.location.origin },
    })
    if (error) throw new Error(getAuthErrorMessage(error))
  },

  async logout() {
    const { error } = await getSupabase().auth.signOut()
    if (error) throw new Error(getAuthErrorMessage(error))
  },

  async requestPasswordReset({ email }) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw new Error(getAuthErrorMessage(error))
  },

  async updatePassword({ password }) {
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) throw new Error(getAuthErrorMessage(error))
  },

  async getCurrentUser() {
    const { data, error } = await getSupabase().auth.getUser()
    if (error) throw error
    return data.user
  },

  onAuthStateChange(callback) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return () => {}

    const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null, event)
    })
    return () => data.subscription.unsubscribe()
  },
}

export const billingService = {
  getPlanCatalog: () => invokeBillingFunction('get-plan-catalog', {}, 'GET'),
  activateFreePlan: () => invokeBillingFunction('activate-free-plan'),
  createCheckoutSession: (plan) => invokeBillingFunction('create-checkout-session', { plan }),
  createPortalSession: () => invokeBillingFunction('create-billing-portal-session'),
  async getCurrentSubscription() {
    const { data: userData, error: userError } = await getSupabase().auth.getUser()
    if (userError) throw userError
    if (!userData.user) return null

    const { data, error } = await getSupabase()
      .from('user_subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (error) throw new Error('Unable to load your profile. Please try again.')
    return data
  },
}

export const profileService = {
  async get() {
    const { data: userData, error: userError } = await getSupabase().auth.getUser()
    if (userError) throw userError
    if (!userData.user) throw new Error('Sign in to view your account.')

    const { data, error } = await getSupabase()
      .from('profiles')
      .select('full_name, preferences, created_at')
      .eq('id', userData.user.id)
      .single()
    if (error) throw error
    return { ...data, email: userData.user.email }
  },

  async update({ fullName, preferences }) {
    const { data: userData, error: userError } = await getSupabase().auth.getUser()
    if (userError) throw userError
    if (!userData.user) throw new Error('Sign in to update your account.')

    const { error } = await getSupabase()
      .from('profiles')
      .update({ full_name: fullName, preferences })
      .eq('id', userData.user.id)
    if (error) throw new Error('Unable to save your profile. Please try again.')
  },
}
