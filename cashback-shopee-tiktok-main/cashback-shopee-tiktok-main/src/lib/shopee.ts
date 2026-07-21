import type { GenerateLinkResponse } from '@/types';

const SHOPEE_APP_ID = process.env.SHOPEE_APP_ID;
const SHOPEE_SECRET = process.env.SHOPEE_SECRET;

/**
 * Extract Shopee product ID from URL
 */
export function extractShopeeProductId(url: string): { shopId: string; itemId: string } | null {
  try {
    const urlObj = new URL(url);
    // Format 1: shopee.vn/product/shopId/itemId
    const productMatch = urlObj.pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (productMatch) {
      return { shopId: productMatch[1], itemId: productMatch[2] };
    }
    
    // Format 2: shopee.vn/product-name-i.shopId.itemId
    const longUrlMatch = urlObj.pathname.match(/-i\.(\d+)\.(\d+)/);
    if (longUrlMatch) {
      return { shopId: longUrlMatch[1], itemId: longUrlMatch[2] };
    }

    // Format 3: has shopid and itemid query params
    const shopId = urlObj.searchParams.get('shopid') || urlObj.searchParams.get('shop_id');
    const itemId = urlObj.searchParams.get('itemid') || urlObj.searchParams.get('item_id');
    if (shopId && itemId) {
      return { shopId, itemId };
    }
  } catch (e) {
    return null;
  }

  // Format 4: shope.ee short links (need server-side resolution in real app)
  return null;
}

/**
 * Generate affiliate link for Shopee product
 */
export async function generateShopeeAffiliateLink(
  productUrl: string
): Promise<GenerateLinkResponse> {
  const productInfo = extractShopeeProductId(productUrl);

  // TODO: Integrate with Shopee Open API when available
  // 1. Resolve short link (shope.ee) if needed
  // 2. Call Shopee Open API (generateShortLink) with APP_ID and SECRET
  // 3. Return tracking_type: 'auto' and the generated affiliate_link
  
  if (SHOPEE_APP_ID && SHOPEE_SECRET) {
    // Real API integration would go here
    // const response = await callShopeeAPI(productUrl);
    // return {
    //   success: true,
    //   data: {
    //     affiliate_link: response.shortLink,
    //     product_name: response.productName,
    //     ...
    //     tracking_type: 'auto',
    //   }
    // };
  }

  // Fallback to manual tracking when no API keys are provided
  return {
    success: true,
    data: {
      affiliate_link: productUrl, // Provide the original link so user can still buy
      product_name: 'Sản phẩm Shopee',
      product_image: '',
      original_price: 0,
      cashback_percent: 5, // Default estimate
      estimated_cashback: 0,
      tracking_type: 'manual',
      message: 'Hiện chưa có API tự động cho Shopee. Bạn hãy mua hàng bằng link gốc, sau đó gửi mã đơn hàng để nhận hoàn tiền.',
    },
  };
}
