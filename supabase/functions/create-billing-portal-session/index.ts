import Stripe from 'npm:stripe@17.7.0'
import { createAdminClient, errorResponse, handlePreflight, HttpError, jsonResponse, requireAuthenticatedUser } from '../_shared/http.ts'

Deno.serve(async (request) => {
  const preflight = handlePreflight(request)
  if (preflight) return preflight
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const { user } = await requireAuthenticatedUser(request)
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const siteUrl = Deno.env.get('SITE_URL')
    if (!stripeSecretKey || !siteUrl) throw new HttpError('Billing is not configured yet.', 503)

    const admin = createAdminClient()
    const { data: profile, error } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()
    if (error) throw error
    if (!profile.stripe_customer_id) {
      throw new HttpError('There is no paid subscription to manage on this account.', 409)
    }

    const stripe = new Stripe(stripeSecretKey, { httpClient: Stripe.createFetchHttpClient() })
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: new URL(siteUrl).origin,
    })
    return jsonResponse({ url: session.url })
  } catch (error) {
    return errorResponse(error)
  }
})
