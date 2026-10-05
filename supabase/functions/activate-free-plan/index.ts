import { errorResponse, handlePreflight, HttpError, jsonResponse, requireAuthenticatedUser } from '../_shared/http.ts'

Deno.serve(async (request) => {
  const preflight = handlePreflight(request)
  if (preflight) return preflight
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const { admin, user } = await requireAuthenticatedUser(request)
    const { data: current, error: readError } = await admin
      .from('user_subscriptions')
      .select('plan, status, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (readError) throw readError
    const paidStatuses = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete'])
    if (current?.stripe_subscription_id && paidStatuses.has(current.status)) {
      throw new HttpError('Cancel or manage your paid plan before switching to the free plan.', 409)
    }

    const { error } = await admin.from('user_subscriptions').upsert(
      {
        user_id: user.id,
        plan: 'free',
        status: 'active',
        stripe_subscription_id: null,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    if (error) throw error
    return jsonResponse({ plan: 'free', status: 'active' })
  } catch (error) {
    return errorResponse(error)
  }
})
