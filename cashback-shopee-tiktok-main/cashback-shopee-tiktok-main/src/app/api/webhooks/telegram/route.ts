import { NextResponse, type NextRequest } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { createAdminClient } from '@/lib/supabase/admin';
import { detectPlatform } from '@/lib/utils';
import { generateShopeeAffiliateLink } from '@/lib/shopee';
import { generateTikTokAffiliateLink } from '@/lib/tiktok';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Telegram sends update object, which contains message
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text;

      // Handle /start command
      if (text.startsWith('/start')) {
        await sendTelegramMessage(chatId, 'Chào mừng bạn đến với CashBack VN Bot! Gửi link Shopee hoặc TikTok Shop cho tôi để nhận link hoàn tiền nhé.');
        return NextResponse.json({ success: true });
      }

      // Detect if text contains a supported link
      const platform = detectPlatform(text);

      if (platform) {
        // Extract the URL
        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        const productUrl = urlMatch ? urlMatch[0] : text;

        // Check if this telegram_id is linked
        const supabase = createAdminClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('telegram_id', chatId)
          .single();

        if (!profile) {
          // Not linked
          const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://cashback-vn.com';
          const linkUrl = `${domain}/link-telegram?id=${chatId}`;
          await sendTelegramMessage(
            chatId, 
            `Tài khoản Telegram của bạn chưa được liên kết với hệ thống.\n\nVui lòng bấm vào link sau để liên kết và nhận hoàn tiền:\n${linkUrl}`
          );
          return NextResponse.json({ success: true });
        }

        // Generate affiliate link
        let linkResult;
        if (platform === 'shopee') {
          linkResult = await generateShopeeAffiliateLink(productUrl);
        } else {
          linkResult = await generateTikTokAffiliateLink(productUrl);
        }

        if (!linkResult.success) {
          await sendTelegramMessage(chatId, `❌ Lỗi tạo link: ${linkResult.error}`);
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
          await sendTelegramMessage(chatId, '❌ Lỗi hệ thống, không thể lưu đơn hàng. Vui lòng thử lại sau.');
        } else {
          const affiliateLink = linkResult.data?.affiliate_link;
          const cashbackAmount = linkResult.data?.estimated_cashback 
            ? `${new Intl.NumberFormat('vi-VN').format(linkResult.data.estimated_cashback)}đ` 
            : `${linkResult.data?.cashback_percent}%`;

          await sendTelegramMessage(
            chatId, 
            `✅ Tạo link thành công!\n\n🛒 Mua qua link này để được hoàn ${cashbackAmount}:\n${affiliateLink}\n\n(Đơn hàng sẽ tự động ghi nhận sau khi mua thành công)`
          );
        }
      } else {
        // Not a valid link
        await sendTelegramMessage(chatId, 'Xin chào! Hãy gửi link sản phẩm Shopee hoặc TikTok Shop để nhận link hoàn tiền nhé.');
      }
    }

    // Always respond 200 to Telegram to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Don't return 500 otherwise Telegram will retry the webhook multiple times
    return NextResponse.json({ success: true });
  }
}
