import { createAdminClient } from '@/lib/supabase/admin';

const ZALO_API_URL = 'https://openapi.zalo.me/v3.0/oa/message/cs';
const APP_ID = process.env.ZALO_APP_ID;
const SECRET_KEY = process.env.ZALO_SECRET_KEY;

export async function getZaloAccessToken() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('zalo_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('Lỗi lấy token Zalo:', error);
    return null;
  }

  // Check if token is expired (Zalo access token lasts 25 hours, but we check if it's older than 24 hours)
  const updatedAt = new Date(data.updated_at).getTime();
  const now = new Date().getTime();
  const hoursSinceUpdate = (now - updatedAt) / (1000 * 60 * 60);

  if (hoursSinceUpdate > 24) {
    // Need to refresh
    const newTokenData = await refreshZaloToken(data.refresh_token);
    if (newTokenData) {
      return newTokenData.access_token;
    }
    return null;
  }

  return data.access_token;
}

async function refreshZaloToken(refreshToken: string) {
  try {
    const res = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': SECRET_KEY || '',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        app_id: APP_ID || '',
        grant_type: 'refresh_token'
      })
    });

    const data = await res.json();
    if (data.access_token) {
      const supabase = createAdminClient();
      await supabase
        .from('zalo_tokens')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
      
      return data;
    }
    console.error('Zalo refresh response error:', data);
    return null;
  } catch (error) {
    console.error('Refresh token failed:', error);
    return null;
  }
}

export async function sendZaloMessage(zaloId: string, text: string) {
  const accessToken = await getZaloAccessToken();
  if (!accessToken) return false;

  try {
    const res = await fetch(ZALO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': accessToken
      },
      body: JSON.stringify({
        recipient: { user_id: zaloId },
        message: { text }
      })
    });

    const data = await res.json();
    if (data.error !== 0) {
      console.error('Lỗi API Zalo:', data);
    }
    return data.error === 0;
  } catch (error) {
    console.error('Send Zalo message failed:', error);
    return false;
  }
}
