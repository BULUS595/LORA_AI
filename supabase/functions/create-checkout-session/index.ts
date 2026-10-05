import Stripe from 'npm:stripe@17.7.0'
import { createAdminClient, errorResponse, handlePreflight, HttpError, jsonResponse, requireAuthenticatedUser } from '../_shared/http.ts'
import { PAID_PLANS } from '../_shared/plans.ts'

Deno.serve(async (request) => {
  const preflight = handlePreflight(request)
  if (preflight) return preflight
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const { user } = await requireAuthenticatedUser(request)
    let body: { plan?: string }
    try {
      body = await request.json()
    } catch {
      throw new HttpError('A valid plan is required.', 400)
    }

    if (body.plan !== 'basic' && body.plan !== 'pro') {
      throw new HttpError('Choose a valid paid plan.', 400)
    }

    const plan = PAID_PLANS[body.plan]
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const siteUrl = Deno.env.get('SITE_URL')
    const priceId = Deno.env.get(plan.priceEnv)
    if (!stripeSecretKey || !siteUrl || !priceId) {
      throw new HttpError('Billing is not configured for this plan yet.', 503)
    }

    const stripe = new Stripe(stripeSecretKey, { httpClient: Stripe.createFetchHttpClient() })
    const stripePrice = await stripe.prices.retrieve(priceId)
    if (
      !stripePrice.active ||
      stripePrice.unit_amount !== plan.amount ||
      stripePrice.currency !== plan.currency ||
      stripePrice.recurring?.interval !== plan.interval ||
      stripePrice.recurring?.interval_count !== plan.intervalCount
    ) {
      throw new HttpError('This plan is not configured with its approved monthly price.', 503)
    }

    const admin = createAdminClient()
    const { data: current, error: subscriptionError } = await admin
      .from('user_subscriptions')
      .select('plan, status, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (subscriptionError) throw subscriptionError
    const paidStatuses = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete'])
    if (current?.stripe_subscription_id && paidStatuses.has(current.status)) {
      throw new HttpError('An active paid plan is already linked to this account.', 409)
    }

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()
    if (profileError) throw profileError

    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        metadata: { supabase_user_id: user.id },
      }, { idempotencyKey: `lora-customer-${user.id}` })
      customerId = customer.id
      const { error } = await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${new URL(siteUrl).origin}/?checkout=success`,
      cancel_url: `${new URL(siteUrl).origin}/?checkout=cancelled`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plan_id: body.plan },
      subscription_data: { metadata: { supabase_user_id: user.id, plan_id: body.plan } },
    })

    if (!checkout.url) throw new Error('Stripe did not return a checkout URL.')
    return jsonResponse({ url: checkout.url })
  } catch (error) {
    return errorResponse(error)
  }
})
