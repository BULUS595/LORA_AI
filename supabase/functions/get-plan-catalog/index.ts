import Stripe from 'npm:stripe@17.7.0'
import { corsHeaders, errorResponse, HttpError, jsonResponse } from '../_shared/http.ts'
import { PAID_PLANS } from '../_shared/plans.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) throw new HttpError('Billing is not configured yet.', 503)

    const stripe = new Stripe(stripeSecretKey, { httpClient: Stripe.createFetchHttpClient() })
    const plans = [
      { id: 'basic', definition: PAID_PLANS.basic },
      { id: 'pro', definition: PAID_PLANS.pro },
    ]
    const catalog = await Promise.all(plans.map(async ({ id, definition }) => {
      const priceId = Deno.env.get(definition.priceEnv)
      if (!priceId) throw new HttpError(`The ${id} plan price is not configured.`, 503)

      const price = await stripe.prices.retrieve(priceId)
      if (
        !price.active ||
        price.unit_amount !== definition.amount ||
        price.currency !== definition.currency ||
        price.recurring?.interval !== definition.interval ||
        price.recurring?.interval_count !== definition.intervalCount
      ) {
        throw new HttpError(`The ${id} Stripe price must match the approved NGN monthly price.`, 503)
      }

      return {
        id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring.interval,
        intervalCount: price.recurring.interval_count,
      }
    }))

    return jsonResponse({ plans: catalog })
  } catch (error) {
    return errorResponse(error)
  }
})
