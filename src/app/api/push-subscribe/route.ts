import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/push-subscribe - Save push subscription
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { endpoint, keys, device_label } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        device_label: device_label || 'Unknown device',
        is_active: true,
      },
      { onConflict: 'endpoint' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/push-subscribe - Remove subscription
export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { endpoint } = body

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
