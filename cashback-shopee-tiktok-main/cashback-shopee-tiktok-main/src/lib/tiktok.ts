import type { GenerateLinkResponse } from '@/types';

/**
 * Extract TikTok Shop product info from URL
 */
export function extractTikTokProductId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Handle TikTok Shop URLs
    // https://shop.tiktok.com/view/product/123456
    // https://vt.tiktok.com/xxxxx
    const productMatch = urlObj.pathname.match(/\/product\/([\w-]+)/);
    if (productMatch) {
      return productMatch[1];
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Generate affiliate link for TikTok Shop product
 * Currently manual-only - user creates link and admin verifies.
 */
export async function generateTikTokAffiliateLink(
  productUrl: string
): Promise<GenerateLinkResponse> {
  // TikTok Shop affiliate is manual for now because TikTok doesn't provide
  // a public Open API for affiliate link generation without enterprise access.
  return {
    success: true,
    data: {
      affiliate_link: productUrl, // Manual - admin will verify later
      product_name: 'Sản phẩm TikTok Shop',
      product_image: '',
      original_price: 0,
      cashback_percent: 3, // Default estimate for TikTok
      estimated_cashback: 0,
      tracking_type: 'manual',
      message: 'Hệ thống đang ở chế độ thủ công cho TikTok. Hãy mua hàng bình thường, sau đó cập nhật mã đơn để được nhận tiền.',
    },
  };
}
