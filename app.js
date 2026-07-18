// Hàm tự động đọc từ bộ nhớ tạm và dán vào ô input
async function pasteLink() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('shopee-link').value = text;
    } catch (err) {
        alert('Không thể truy cập bộ nhớ tạm. Vui lòng tự dán link!');
    }
}

// Logic xử lý link khi bấm "Mở áp mã nhanh"
function processLink() {
    const linkInput = document.getElementById('shopee-link').value.trim();
    
    if (!linkInput) {
        alert('Vui lòng nhập hoặc dán link Shopee trước!');
        return;
    }

    if (!linkInput.includes('shopee.vn')) {
        alert('Đường dẫn không hợp lệ. Phải là link từ Shopee!');
        return;
    }

    // TĂNG ĐẾM SỐ LƯỢNG (Giả lập tăng số lượng link tạo trong ngày)
    let countElem = document.getElementById('count-link');
    let currentCount = parseInt(countElem.innerText.replace(',', ''));
    countElem.innerText = (currentCount + 1).toLocaleString();

    // LOGIC CHUYỂN ĐỔI LINK AFFILIATE
    // Ở bước này, nếu có API Affiliate (Shopee/Accesstrade), bạn sẽ gọi API để lấy link rút gọn.
    // Dưới đây là đoạn giả lập chuyển link sang dạng Deeplink để ép điện thoại mở App Shopee:
    
    let deeplink = linkInput;
    if (linkInput.startsWith('https://')) {
        // Biến đổi cấu trúc link gốc thành mã định dạng mở ứng dụng Shopee trực tiếp
        deeplink = linkInput.replace('https://', 'shopeevn://');
    }

    // Tiến hành mở link áp mã (hoặc link affiliate)
    window.open(deeplink, '_blank');
}

// Hàm sao chép lại link đã xử lý
function copyLink() {
    const linkInput = document.getElementById('shopee-link').value;
    if (!linkInput) {
        alert('Chưa có link để sao chép!');
        return;
    }
    navigator.clipboard.writeText(linkInput);
    alert('Đã sao chép đường dẫn thành công!');
}
