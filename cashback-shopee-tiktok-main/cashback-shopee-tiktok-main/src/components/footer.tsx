import Link from 'next/link';
import { Wallet } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                CashBack VN
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/50 leading-relaxed">
              Nền tảng hoàn tiền hàng đầu Việt Nam cho Shopee và TikTok Shop.
              Mua sắm thông minh, tiết kiệm tối đa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4">Liên kết</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4">Pháp lý</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/50 hover:text-orange-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} CashBack VN. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">Hỗ trợ Shopee & TikTok Shop</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
