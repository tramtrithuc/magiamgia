<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// ========================================================
// 🔑 ĐỒNG BỘ THÔNG TIN TÀI KHOẢN TIẾP THỊ CỦA BẠN
define('ACCESSTRADE_TOKEN', '5T1WLRgD0tNK35nKgPJFipWfCBeHAt-r'); 
define('SHOPEE_CAMPAIGN_ID', '4751584435713464237'); 
// ========================================================

$input = json_decode(file_get_contents("php://input"), true);
$encodedData = $input['secure_data'] ?? '';

if (empty($encodedData)) {
    echo json_encode(["success" => false, "error" => "Dữ liệu trống"]);
    exit;
}

// Giải mã lấy link Shopee gốc từ Frontend gửi lên
$originalLink = urldecode(base64_decode($encodedData));

// Tạo link Isclix dự phòng khẩn cấp
$fallbackBase64 = base64_encode($originalLink);
$fallbackAffLink = "https://go.isclix.com/deep_link/v6/5736941195869559229/4751584435713464237?sub4=oneatweb&url_enc=" . $fallbackBase64;

$productName = "";
$productImage = "";
$productPrice = "Click để xem giá";
$affLink = $fallbackAffLink;
$liveVouchers = [];

try {
    // BƯỚC 1: Đuổi theo link rút gọn để lấy liên kết dài chuẩn SEO của Shopee
    $ch = curl_init($originalLink);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    curl_exec($ch);
    $longUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);

    // BƯỚC 2: 🌟 TUYỆT CHIÊU - Bóc tên sản phẩm trực tiếp từ URL Đường dẫn (Không sợ bị Shopee block)
    $urlPath = parse_url($longUrl, PHP_URL_PATH);
    $urlPath = trim($urlPath, '/');
    
    // Loại bỏ đuôi định dạng ID sản phẩm "-i.123.456" nếu có
    $slug = preg_replace('/-i\.\d+\.\d+/i', '', $urlPath);
    if (!empty($slug) && strpos($slug, '.') === false) {
        $decodedSlug = urldecode($slug);
        $productName = str_replace('-', ' ', $decodedSlug); // Đổi gạch ngang thành dấu cách tiếng Việt
    }

    // BƯỚC 3: Trích xuất itemId để truy vấn dữ liệu phụ trợ
    $itemId = '';
    if (preg_match('/i\.\d+\.(\d+)/', $longUrl, $matches)) {
        $itemId = $matches[1];
    } elseif (preg_match('/product\/\d+\/(\d+)/', $longUrl, $matches)) {
        $itemId = $matches[1];
    }

    // BƯỚC 4: Tìm kiếm ảnh và giá thật của sản phẩm bằng API dữ liệu của AccessTrade
    if (!empty($itemId)) {
        $atProdUrl = "https://api.accesstrade.vn/v1/products?keyword=" . urlencode($itemId) . "&limit=1";
        $ch = curl_init($atProdUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Token " . ACCESSTRADE_TOKEN]);
        $atProdRes = curl_exec($ch);
        curl_close($ch);
        
        $atProdData = json_decode($atProdRes, true);
        if (isset($atProdData['data'][0])) {
            $productImage = $atProdData['data'][0]['image'] ?? '';
            if (!empty($atProdData['data'][0]['price'])) {
                $productPrice = number_format($atProdData['data'][0]['price'], 0, ',', '.') . 'đ';
            }
            if (empty($productName)) {
                $productName = $atProdData['data'][0]['name'];
            }
        }
    }

    // BƯỚC 5: Tạo link liên kết ăn hoa hồng qua AccessTrade
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

    // BƯỚC 6: Lấy danh sách mã giảm giá Live từ hệ thống
    $voucherUrl = "https://api.accesstrade.vn/v1/offers?merchant=shopee&limit=4";
    $ch = curl_init($voucherUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Token " . ACCESSTRADE_TOKEN]);
    $voucherRes = curl_exec($ch);
    curl_close($ch);
    
    $voucherData = json_decode($voucherRes, true);
    if (isset($voucherData['data']) && is_array($voucherData['data'])) {
        foreach ($voucherData['data'] as $offer) {
            if (!empty($offer['coupons'])) {
                foreach ($offer['coupons'] as $cp) {
                    $codeStr = strtoupper($cp['coupon_code']);
                    $type = 'FB';
                    if (str_contains($codeStr, 'YT') || str_contains($codeStr, 'YOU')) $type = 'YT';
                    $liveVouchers[] = [
                        "type" => $type,
                        "code" => $cp['coupon_code'],
                        "desc" => $cp['coupon_desc'] ? $cp['coupon_desc'] : $offer['name'],
                        "usage" => rand(82, 94) . "%",
                        "status" => "Áp được"
                    ];
                }
            }
        }
    }
} catch (Exception $e) {}

// Nếu không tìm thấy tên qua các tầng lọc, đặt tên mặc định chuyên nghiệp
if (empty($productName)) {
    $productName = "Sản phẩm áp mã giảm giá Shopee độc quyền";
}

// Trả kết quả sạch về cho giao diện hiển thị
echo json_encode([
    "success" => true,
    "product" => [
        "name" => $productName,
        "image" => $productImage,
        "price" => $productPrice
    ],
    "affiliateLink" => $affLink,
    "vouchers" => !empty($liveVouchers) ? array_slice($liveVouchers, 0, 3) : [
        ["type" => "YT", "code" => "YOUTUBEJUL221319", "desc" => "Giảm 22% tối đa 3tr đơn từ 1.25tr độc quyền Youtube", "usage" => "88%", "status" => "Áp được"],
        ["type" => "FB", "code" => "METAPAR1JULD22300", "desc" => "Giảm 22% tối đa 300k đơn từ 50k toàn sàn Shopee", "usage" => "88%", "status" => "Áp được"]
    ]
]);
?>
