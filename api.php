<?php
// Tắt hoàn toàn hiển thị lỗi PHP thô để giữ sạch gói tin JSON
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

// Khởi tạo link hoa hồng Isclix dự phòng khẩn cấp
$fallbackBase64 = base64_encode($originalLink);
$fallbackAffLink = "https://go.isclix.com/deep_link/v6/5736941195869559229/4751584435713464237?sub4=oneatweb&url_enc=" . $fallbackBase64;

$productInfo = null;
$affLink = $fallbackAffLink;
$debugLog = []; // Bộ lưu vết chẩn đoán lỗi nếu có

try {
    // BƯỚC 1: Sử dụng cơ chế tự động bám đuôi của cURL để lấy Link Dài chuẩn 100%
    $ch = curl_init($originalLink);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tự động đuổi theo link gốc
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_exec($ch);
    $longUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL); // Khui ra link dài cuối cùng
    curl_close($ch);

    $debugLog['long_url'] = $longUrl;

    // BƯỚC 2: Thuật toán quét đa định dạng để ép lấy bằng được itemId và shopId
    $itemId = ''; $shopId = '';

    // Định dạng 1: Dạng link Web (?shopid=xxx&itemid=yyy)
    $urlComponents = parse_url($longUrl);
    if (isset($urlComponents['query'])) {
        parse_str($urlComponents['query'], $queryParams);
        $itemId = $queryParams['itemid'] ?? '';
        $shopId = $queryParams['shopid'] ?? '';
    }

    // Định dạng 2: Dạng link chia sẻ từ App Shopee điện thoại (ví dụ: ...i.12345.67890)
    if (empty($itemId) || empty($shopId)) {
        if (preg_match('/i\.(\d+)\.(\d+)/', $longUrl, $matches)) {
            $shopId = $matches[1];
            $itemId = $matches[2];
        }
    }

    // Định dạng 3: Dạng đường dẫn thư mục thường gặp (/product/12345/67890)
    if (empty($itemId) || empty($shopId)) {
        if (preg_match('/product\/(\d+)\/(\d+)/', $longUrl, $matches)) {
            $shopId = $matches[1];
            $itemId = $matches[2];
        }
    }

    $debugLog['extracted_shop_id'] = $shopId;
    $debugLog['extracted_item_id'] = $itemId;

    // BƯỚC 3: Gọi API Shopee lấy thông tin bằng Header giả lập trình duyệt nghiêm ngặt
    if (!empty($itemId) && !empty($shopId)) {
        $shopeeApi = "https://shopee.vn/api/v4/item/get?itemid={$itemId}&shopid={$shopId}";
        $ch = curl_init($shopeeApi);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Referer: https://shopee.vn/',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]);
        $shopeeRes = curl_exec($ch);
        curl_close($ch);
        
        $shopeeData = json_decode($shopeeRes, true);
        if (isset($shopeeData['data']) && !empty($shopeeData['data']['name'])) {
            $productInfo = [
                "name" => $shopeeData['data']['name'],
                "image" => "https://down-vn.img.susercontent.com/file/" . $shopeeData['data']['image'],
                "price" => number_format($shopeeData['data']['price'] / 100000, 0, ',', '.') . 'đ'
            ];
        }
    }

    // BƯỚC 4: Tạo link hoa hồng động thông qua AccessTrade API
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
    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json", "Authorization: Token " . ACCESSTRADE_TOKEN]);
    $atRes = curl_exec($ch);
    curl_close($ch);
    
    $atResult = json_decode($atRes, true);
    if ($atResult['success'] && count($atResult['data']['success_link']) > 0) {
        $affLink = $atResult['data']['success_link'][0]['short_link'] ?? $atResult['data']['success_link'][0]['aff_link'];
    }
} catch (Exception $e) {
    $debugLog['error_msg'] = $e->getMessage();
}

// Trả gói tin về cho Frontend hiển thị mẫu
echo json_encode([
    "success" => true,
    "product" => $productInfo,
    "affiliateLink" => $affLink,
    "debug" => $debugLog // Kẹp thêm gói debug ẩn để kiểm tra qua F12 Console nếu cần
]);
?>
