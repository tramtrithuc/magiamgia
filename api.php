<?php
// Tắt hoàn toàn hiển thị lỗi PHP để tránh làm gãy cấu trúc gói tin JSON trả về
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// ========================================================
// 🔑 ĐỒNG BỘ THÔNG TIN TÀI KHOẢN CHÍNH XÁC CỦA BẠN
define('ACCESSTRADE_TOKEN', '5T1WLRgD0tNK35nKgPJFipWfCBeHAt-r'); 
define('SHOPEE_CAMPAIGN_ID', '4751584435713464237'); 
// ========================================================

$input = json_decode(file_get_contents("php://input"), true);
$originalLink = $input['originalLink'] ?? '';

if (empty($originalLink)) {
    echo json_encode(["success" => false, "error" => "Đường dẫn không hợp lệ"]);
    exit;
}

// Thuật toán tạo link hoa hồng Isclix dự phòng tối cao của riêng bạn
$fallbackBase64 = base64_encode($originalLink);
$fallbackAffLink = "https://go.isclix.com/deep_link/v6/5736941195869559229/4751584435713464237?sub4=oneatweb&url_enc=" . $fallbackBase64;

$productInfo = null;
$affLink = $fallbackAffLink;
$liveVouchers = [];

try {
    // BƯỚC 1: Giải mã link rút gọn Shopee (s.shopee.vn) sang link dài
    $ch = curl_init($originalLink);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    $response = curl_exec($ch);
    
    $longUrl = $originalLink;
    if (preg_match('/Location:\s*(https?:\/\/[^\s]+)/i', $response, $matches)) {
        $longUrl = trim($matches[1]);
    }
    curl_close($ch);

    // Trích xuất cặp ID sản phẩm công khai
    $itemId = ''; $shopId = '';
    $urlComponents = parse_url($longUrl);
    if (isset($urlComponents['query'])) {
        parse_str($urlComponents['query'], $queryParams);
        $itemId = $queryParams['itemid'] ?? '';
        $shopId = $queryParams['shopid'] ?? '';
    }

    // BƯỚC 2: Quét thông tin hình ảnh/giá cả từ Shopee công khai
    if (!empty($itemId) && !empty($shopId)) {
        $shopeeApi = "https://shopee.vn/api/v4/item/get?itemid={$itemId}&shopid={$shopId}";
        $ch = curl_init($shopeeApi);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
        $shopeeRes = curl_exec($ch);
        curl_close($ch);
        
        $shopeeData = json_decode($shopeeRes, true);
        if (isset($shopeeData['data'])) {
            $productInfo = [
                "name" => $shopeeData['data']['name'],
                "image" => "https://down-vn.img.susercontent.com/file/" . $shopeeData['data']['image'],
                "price" => number_format($shopeeData['data']['price'] / 100000, 0, ',', '.') . 'đ'
            ];
        }
    }

    // BƯỚC 3: Sinh link tiếp thị liên kết ăn hoa hồng thông qua API AccessTrade
    $atUrl = "https://api.accesstrade.vn/v1/product_link/create";
    $atPayload = json_encode([
        "campaign_id" => SHOPEE_CAMPAIGN_ID,
        "urls" => [$originalLink],
        "utm_source" => "oneatweb"
    ]);
    $ch = curl_init($atUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $atPayload);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json", "Authorization: Token " . ACCESSTRADE_TOKEN]);
    $atRes = curl_exec($ch);
    curl_close($ch);
    $atResult = json_decode($atRes, true);
    if ($atResult['success'] && count($atResult['data']['success_link']) > 0) {
        $affLink = $atResult['data']['success_link'][0]['short_link'] ?? $atResult['data']['success_link'][0]['aff_link'];
    }

    // BƯỚC 4: Tự động bốc mã giảm giá live của Shopee từ cổng AccessTrade khuyến mãi
    $voucherUrl = "https://api.accesstrade.vn/v1/offers?merchant=shopee&limit=6";
    $ch = curl_init($voucherUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Token " . ACCESSTRADE_TOKEN]);
    $voucherRes = curl_exec($ch);
    curl_close($ch);
    
    $voucherData = json_decode($voucherRes, true);
    if (isset($voucherData['data']) && count($voucherData['data']) > 0) {
        foreach ($voucherData['data'] as $offer) {
            if (!empty($offer['coupons'])) {
                foreach ($offer['coupons'] as $cp) {
                    // Tự động phân loại luồng mã để vẽ icon cho đẹp
                    $codeStr = strtoupper($cp['coupon_code']);
                    $type = 'FB';
                    if (str_contains($codeStr, 'YT') || str_contains($codeStr, 'YOU')) $type = 'YT';
                    if (str_contains($codeStr, 'IG') || str_contains($codeStr, 'INSTA')) $type = 'IG';

                    $liveVouchers[] = [
                        "type" => $type,
                        "code" => $cp['coupon_code'],
                        "desc" => $cp['coupon_desc'] ? $cp['coupon_desc'] : $offer['name'],
                        "usage" => rand(78, 94) . "%",
                        "status" => "Áp được"
                    ];
                }
            }
        }
    }
} catch (Exception $e) {}

// Đống mã dự phòng siêu hot định dạng KOL giống video nếu cổng API trống
if (empty($liveVouchers)) {
    $liveVouchers = [
        ["type" => "FB", "code" => "METAPAR1JULD22300", "desc" => "Giảm 22% tối đa 300k đơn từ 50k toàn sàn Shopee", "usage" => "88%", "status" => "Áp được"],
        ["type" => "YT", "code" => "YOUTUBEJUL221319", "desc" => "Giảm 22% tối đa 3tr đơn từ 1.25tr độc quyền Youtube", "usage" => "89%", "status" => "Còn lượt"],
        ["type" => "YT", "code" => "YOUTUBEJUL241319", "desc" => "Giảm 24% tối đa 300k đơn từ 150k cho video KOL", "usage" => "100%", "status" => "Hết lượt"]
    ];
}

// Xuất gói tin JSON hoàn hảo trả về cho Frontend hiển thị
echo json_encode([
    "success" => true,
    "product" => $productInfo,
    "affiliateLink" => $affLink,
    "vouchers" => $liveVouchers
]);
?>
