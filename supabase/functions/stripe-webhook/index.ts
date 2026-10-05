import Stripe from 'npm:stripe@17.7.0'
import { createAdminClient, corsHeaders, errorResponse, HttpError, jsonResponse } from '../_shared/http.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!stripeSecretKey || !webhookSecret) throw new Error('Stripe webhook configuration is incomplete.')

    const signature = request.headers.get('Stripe-Signature')
    if (!signature) throw new HttpError('Missing Stripe signature.', 400)

    const stripe = new Stripe(stripeSecretKey, { httpClient: Stripe.createFetchHttpClient() })
    const payload = await request.text()
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )

    let subscriptionId: string | null = null
    if (event.type.startsWith('customer.subscription.')) {
      subscriptionId = (event.data.object as Stripe.Subscription).id
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null
    } else if (event.type === 'invoice.payment_failed' || event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id ?? null
    } else {
      return jsonResponse({ received: true })
    }

    if (!subscriptionId) return jsonResponse({ received: true, ignored: true })
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
    const admin = createAdminClient()
    let userId = subscription.metadata.supabase_user_id

    if (!userId) {
      const { data: profile, error } = await admin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()
      if (error) throw error
      userId = profile?.id
    }

    if (!userId) return jsonResponse({ received: true, ignored: true })

    const planId = subscription.metadata.plan_id
    if (planId !== 'basic' && planId !== 'pro') {
      throw new HttpError('Stripe subscription is missing valid plan metadata.', 400)
    }
    const accessStatuses = new Set(['active', 'trialing', 'past_due'])

    const { error } = await admin.from('user_subscriptions').upsert(
      {
        user_id: userId,
        plan: accessStatuses.has(subscription.status) ? planId : 'free',
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    if (error) throw error
    return jsonResponse({ received: true })
  } catch (error) {
    return errorResponse(error)
  }
})
