import { NextResponse, type NextRequest } from 'next/server';
import { sendZaloMessage } from '@/lib/zalo';
import { createAdminClient } from '@/lib/supabase/admin';
import { detectPlatform } from '@/lib/utils';
import { generateShopeeAffiliateLink } from '@/lib/shopee';
import { generateTikTokAffiliateLink } from '@/lib/tiktok';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zalo often sends event_name to identify the event type
    const eventName = body.event_name;
    
    // Only process text messages from users
    if (eventName === 'user_send_text') {
      const zaloId = body.sender?.id;
      const text = body.message?.text || '';

      if (zaloId && text) {
        // Detect if text contains a supported link
        const platform = detectPlatform(text);

        if (platform) {
          // Extract the URL (basic extraction assuming the text is just the URL or contains it)
          const urlMatch = text.match(/https?:\/\/[^\s]+/);
          const productUrl = urlMatch ? urlMatch[0] : text;

          // Check if this zalo_id is linked to any profile
          const supabase = createAdminClient();
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('zalo_id', zaloId)
            .single();

          if (!profile) {
            // Not linked
            const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://cashback-vn.com';
            const linkUrl = `${domain}/link-zalo?id=${zaloId}`;
            await sendZaloMessage(
              zaloId, 
              `Tài khoản Zalo của bạn chưa được liên kết với hệ thống.\n\nVui lòng bấm vào link sau để liên kết và nhận hoàn tiền:\n${linkUrl}`
            );
            return NextResponse.json({ success: true });
          }

          // User is linked, generate affiliate link
          let linkResult;
          if (platform === 'shopee') {
            linkResult = await generateShopeeAffiliateLink(productUrl);
          } else {
            linkResult = await generateTikTokAffiliateLink(productUrl);
          }

          if (!linkResult.success) {
            await sendZaloMessage(zaloId, `❌ Lỗi tạo link: ${linkResult.error}`);
            return NextResponse.json({ success: true });
          }

          // Insert order
          const insertData = {
            user_id: profile.id,
            platform,
            product_url: productUrl,
            product_name: linkResult.data?.product_name,
            product_image: linkResult.data?.product_image || null,
            affiliate_link: linkResult.data?.affiliate_link,
            original_price: linkResult.data?.original_price || null,
            cashback_percent: linkResult.data?.cashback_percent || 0,
            cashback_amount: linkResult.data?.estimated_cashback || null,
            status: 'pending',
            tracking_type: linkResult.data?.tracking_type || 'manual',
          };

          const { error } = await supabase.from('orders').insert(insertData);
          
          if (error) {
            await sendZaloMessage(zaloId, '❌ Lỗi hệ thống, không thể lưu đơn hàng. Vui lòng thử lại sau.');
          } else {
            const affiliateLink = linkResult.data?.affiliate_link;
            const cashbackAmount = linkResult.data?.estimated_cashback 
              ? `${new Intl.NumberFormat('vi-VN').format(linkResult.data.estimated_cashback)}đ` 
              : `${linkResult.data?.cashback_percent}%`;

            await sendZaloMessage(
              zaloId, 
              `✅ Tạo link thành công!\n\n🛒 Mua qua link này để được hoàn ${cashbackAmount}:\n${affiliateLink}\n\n(Đơn hàng sẽ tự động được ghi nhận sau khi bạn mua thành công)`
            );
          }
        } else {
          // If not a link or not supported
          await sendZaloMessage(zaloId, 'Xin chào! Hãy gửi cho tôi link sản phẩm Shopee hoặc TikTok để nhận link hoàn tiền nhé.');
        }
      }
    }

    // Always respond 200 to Zalo webhooks
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Zalo webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
