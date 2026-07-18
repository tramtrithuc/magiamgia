// DANH SÁCH MÃ GIẢM GIÁ KHUNG GIỜ (Bạn có thể tự tay thay đổi các mã hot này bất cứ lúc nào)
const VOUCHERS = [
    { type: 'YT', code: 'YOUTUBEJUL221319', desc: 'Giảm 22% tối đa 3tr đơn từ 1.25tr', usage: '88%', status: 'Còn lượt' },
    { type: 'YT', code: 'YOUTUBEJUL241319', desc: 'Giảm 24% tối đa 300k đơn từ 150k', usage: '100%', status: 'Hết lượt' },
    { type: 'FB', code: 'METAPAR1JULD22300', desc: 'Giảm 22% tối đa 300k đơn từ 50k', usage: '89%', status: 'Còn lượt' }
];

// ⚠️ CHỖ NÀY QUAN TRỌNG NHẤT: Điền link điều hướng AccessTrade của riêng bạn vào đây
// Cách lấy: Vào AccessTrade -> Chiến dịch Shopee -> Tạo link sản phẩm bất kỳ -> Copy đoạn link gốc chưa rút gọn.
const MY_ACCESSTRADE_BASE = "https://fast.accesstrade.com.vn/deep_link/5371304918731382441"; 

// Hàm tự đọc bộ nhớ tạm dán vào ô input
async function pasteClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('input-url').value = text;
    } catch (err) {
        // Fallback hiển thị thông báo lỗi như video nếu trình duyệt chặn quyền đọc clipboard
        alert("Không thể đọc clipboard tự động. Hãy ấn giữ vào ô nhập để tự dán link sản phẩm!");
    }
}

// Hàm kích hoạt xử lý khi khách bấm nút "Lấy Link"
function getLinkAndVouchers() {
    const urlInput = document.getElementById('input-url').value.trim();
    const btnSubmit = document.getElementById('btn-submit');

    if (!urlInput || !urlInput.includes('shopee.vn')) {
        alert('Vui lòng dán đúng đường dẫn link sản phẩm Shopee!');
        return;
    }

    // Hiệu ứng xoay nút tải như video
    btnSubmit.innerText = "⏳ Đang lấy mã...";
    btnSubmit.disabled = true;

    // Sử dụng cơ chế nối chuỗi link mã hóa an toàn cho GitHub Pages nhằm tránh lỗi CORS bảo mật
    const encodedUrl = encodeURIComponent(urlInput);
    const finalAffiliateLink = `${MY_ACCESSTRADE_BASE}?url=${encodedUrl}&utm_source=salesoc-clone`;

    // Giả lập đồng bộ lấy thông tin sản phẩm (Vì chạy GitHub Pages thuần bị chặn API Sàn)
    setTimeout(() => {
        // Hiển thị thông tin sản phẩm mẫu chân thực giống video
        document.getElementById('prod-img').src = 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m27wsh51b6p303'; 
        document.getElementById('prod-name').innerText = 'Giày thể thao chạy bộ nam nữ Goya Plus nam nữ cao cấp siêu nhẹ êm chân';
        document.getElementById('prod-price').innerText = '609.000đ';

        // Render danh sách mã voucher đi kèm các thanh tiến trình % tương tự mẫu
        const voucherContainer = document.getElementById('voucher-list');
        voucherContainer.innerHTML = '';

        VOUCHERS.forEach((v) => {
            const isFull = v.status === 'Hết lượt';
            voucherContainer.innerHTML += `
                <div class="bg-[#161c24] border border-slate-800/60 rounded-2xl p-4 space-y-2.5 shadow-inner">
                    <div class="flex justify-between items-center text-xs">
                        <div class="font-bold text-slate-400">
                            MÃ VOUCHER: <span class="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono ml-1">${v.code}</span>
                            <span class="ml-2 bg-slate-800/80 text-[10px] px-1.5 py-0.5 rounded text-slate-500">📺 ${v.type}</span>
                        </div>
                        <span class="text-[10px] ${isFull ? 'text-red-500 bg-red-500/10 border border-red-900/30' : 'text-green-400 bg-green-500/10 border border-green-900/30'} px-2 py-0.5 rounded-md font-bold">
                            ${v.status}
                        </span>
                    </div>
                    <p class="text-sm font-extrabold text-white">${v.desc}</p>
                    <div>
                        <div class="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Đã sử dụng</span><span>${v.usage}</span>
                        </div>
                        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 h-full rounded-full" style="width: ${v.usage}"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Đổi link gốc thành cấu trúc giao thức mở ứng dụng trực tiếp (Deeplink: shopeevn://)
        const deeplink = finalAffiliateLink.replace('https://', 'shopeevn://');

        // Gán tính năng bấm nhảy thẳng vào App Shopee ăn hoa hồng cho cả 3 nút nền tảng
        document.getElementById('btn-fb').setAttribute('onclick', `window.open('${deeplink}', '_blank')`);
        document.getElementById('btn-ytb').setAttribute('onclick', `window.open('${deeplink}', '_blank')`);
        document.getElementById('btn-ig').setAttribute('onclick', `window.open('${deeplink}', '_blank')`);

        // Kích hoạt hiển thị khung kết quả bên dưới
        document.getElementById('result-section').classList.remove('hidden');
        
        // Trả lại trạng thái ban đầu cho nút chính
        btnSubmit.innerText = "🛍️ Lấy link";
        btnSubmit.disabled = false;
    }, 1000); // Tạo độ trễ 1 giây chạy mượt mà giống như đang load dữ liệu thật
}
