export interface RealtimeSessionResponse {
  id: string
  client_secret: {
    value: string
    expires_at: number
  }
  model: string
  voice: string
  [key: string]: unknown
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

/**
 * Calls the backend to create an OpenAI Realtime session.
 * Returns session credentials including the ephemeral client secret.
 */
export async function fetchRealtimeSession(): Promise<RealtimeSessionResponse> {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return handleResponse<RealtimeSessionResponse>(res)
}

/**
 * Calls the backend to record a reset event (idle timeout or manual reset).
 */
export async function resetSession(
  reason: 'idle_timeout' | 'manual',
): Promise<void> {
  const res = await fetch('/api/session/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  await handleResponse<unknown>(res)
}
