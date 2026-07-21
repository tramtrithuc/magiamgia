import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LinkTelegramPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const telegramId = params.id;
  
  if (!telegramId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-red-500/20 bg-black/40 p-8 text-center max-w-md">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Lỗi liên kết</h1>
          <p className="text-white/60 mb-6">Không tìm thấy mã Telegram ID. Vui lòng lấy link liên kết trực tiếp từ chat Telegram.</p>
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login with redirect to here
    redirect(`/login?redirect=/link-telegram?id=${telegramId}`);
  }

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({ telegram_id: telegramId })
    .eq('id', user.id);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center max-w-md">
        {!error ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Liên kết thành công!</h1>
            <p className="text-white/60 mb-6">
              Tài khoản Telegram của bạn đã được liên kết với CashBack VN. Bây giờ bạn có thể gửi link sản phẩm vào Bot Telegram để nhận link hoàn tiền tự động.
            </p>
            <Button asChild className="w-full">
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer">
                Quay lại Telegram <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Lỗi liên kết</h1>
            <p className="text-white/60 mb-6">Đã có lỗi xảy ra khi lưu thông tin. {error.message}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Vào Dashboard</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
