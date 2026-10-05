import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export class HttpError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

export const errorResponse = (error: unknown) => {
  const status = error instanceof HttpError ? error.status : 500
  if (status === 500) console.error(error)
  return jsonResponse(
    { error: status === 500 ? 'A server error occurred. Please try again.' : (error as Error).message },
    status,
  )
}

export const handlePreflight = (request: Request) =>
  request.method === 'OPTIONS' ? new Response('ok', { headers: corsHeaders }) : null

export const createAdminClient = () => {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceRoleKey) throw new Error('Supabase server configuration is incomplete.')

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const requireAuthenticatedUser = async (request: Request) => {
  const authorization = request.headers.get('Authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) throw new HttpError('Sign in to continue.', 401)

  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!url || !anonKey) throw new Error('Supabase server configuration is incomplete.')

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new HttpError('Your session is invalid or has expired. Sign in again.', 401)

  return { admin: createAdminClient(), user: data.user }
}
