import { NextResponse, type NextRequest } from 'next/server';
import { generateLinkSchema } from '@/lib/validations';
import { detectPlatform } from '@/lib/utils';
import { generateShopeeAffiliateLink } from '@/lib/shopee';
import { generateTikTokAffiliateLink } from '@/lib/tiktok';
import { createClient } from '@/lib/supabase/server';
import rateLimit from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/logger';

const generateLimiter = rateLimit({ interval: 60000 }); // 1 minute

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Rate limit based on user ID or IP if not logged in
    const identifier = user?.id || request.headers.get('x-forwarded-for') || 'anonymous';
    
    try {
      await generateLimiter.check(20, identifier);
    } catch {
      await logSecurityEvent(user?.id || null, 'RATE_LIMIT_EXCEEDED', { route: '/api/generate-link' });
      return NextResponse.json({ success: false, error: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.' }, { status: 429 });
    }

    await logSecurityEvent(user?.id || null, 'GENERATE_LINK_ATTEMPT', { identifier });

    const body = await request.json();

    // Validate input
    const result = generateLinkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { product_url } = result.data;
    const platform = detectPlatform(product_url);

    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform không được hỗ trợ' },
        { status: 400 }
      );
    }

    // Generate affiliate link based on platform
    let linkResult;
    if (platform === 'shopee') {
      linkResult = await generateShopeeAffiliateLink(product_url);
    } else {
      linkResult = await generateTikTokAffiliateLink(product_url);
    }

    if (!linkResult.success) {
      return NextResponse.json(
        { success: false, error: linkResult.error },
        { status: 400 }
      );
    }

    let order_saved = false;

    // Save to database if user is authenticated
    try {
      if (user && linkResult.data) {
        const insertData = {
          user_id: user.id,
          platform,
          product_url,
          product_name: linkResult.data.product_name,
          product_image: linkResult.data.product_image || null,
          affiliate_link: linkResult.data.affiliate_link,
          original_price: linkResult.data.original_price || null,
          cashback_percent: linkResult.data.cashback_percent || 0,
          cashback_amount: linkResult.data.estimated_cashback || null,
          status: 'pending',
          tracking_type: linkResult.data.tracking_type || 'manual',
        };

        console.log('=== [API] INSERTING ORDER ===');
        console.log(insertData);

        const { error } = await supabase.from('orders').insert(insertData);
        
        if (!error) {
          order_saved = true;
          console.log('=== [API] ORDER INSERT SUCCESS ===');
        } else {
          console.error('=== [API] DB INSERT ERROR ===', error);
          return NextResponse.json(
            { success: false, error: 'Không thể lưu đơn hàng vào DB: ' + error.message },
            { status: 500 }
          );
        }
      }
    } catch (e: any) {
      console.error('=== [API] EXCEPTION SAVING ORDER ===', e);
      return NextResponse.json(
        { success: false, error: 'Lỗi máy chủ khi lưu đơn hàng: ' + (e.message || String(e)) },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...linkResult, order_saved });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi server, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
