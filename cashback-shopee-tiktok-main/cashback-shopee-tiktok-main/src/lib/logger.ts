import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export type SecurityEvent = 'LOGIN_ATTEMPT' | 'WITHDRAW_REQUEST' | 'RATE_LIMIT_EXCEEDED' | 'GENERATE_LINK_ATTEMPT';

export async function logSecurityEvent(
  userId: string | null,
  event: SecurityEvent,
  details: Record<string, any> = {}
) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    await supabase.from('security_logs').insert({
      user_id: userId,
      event_type: event,
      ip_address: ip,
      user_agent: userAgent,
      details: details,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
