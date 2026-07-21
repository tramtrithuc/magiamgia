import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Gift } from 'lucide-react';
import { ReferralClient } from './referral-client';

export const metadata: Metadata = {
  title: 'Mời bạn bè nhận hoa hồng - CashBack VN',
};

export default async function ReferralPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Lấy mã giới thiệu của user hiện tại
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code, id')
    .eq('id', user.id)
    .single();

  // Đếm số người đã đăng ký qua mã giới thiệu này và số người có đơn hàng
  let referralCount = 0;
  let successfulCount = 0;

  if (profile?.referral_code) {
    const { data: referredUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('referred_by', profile.referral_code);

    if (referredUsers) {
      referralCount = referredUsers.length;

      if (referralCount > 0) {
        const referredIds = referredUsers.map(u => u.id);
        const { data: usersWithOrders } = await supabase
          .from('orders')
          .select('user_id')
          .in('user_id', referredIds)
          .neq('status', 'cancelled');
          
        if (usersWithOrders) {
          const uniqueUsers = new Set(usersWithOrders.map(o => o.user_id));
          successfulCount = uniqueUsers.size;
        }
      }
    }
  }

  const referralCode = profile?.referral_code || 'CHUA_CO_MA';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mời bạn bè nhận hoa hồng</h1>
        <p className="mt-1 text-sm text-white/50">
          Chia sẻ mã giới thiệu hoặc link để nhận hoa hồng từ các đơn hàng của bạn bè.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">Đã đăng ký</p>
                <p className="text-2xl font-bold text-white">
                  {referralCount} <span className="text-sm font-normal text-white/50">người</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/20">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">Thành công (có đơn)</p>
                <p className="text-2xl font-bold text-white">
                  {successfulCount} <span className="text-sm font-normal text-white/50">người</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/20">
                <Gift className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">Hoa hồng</p>
                <p className="text-2xl font-bold text-white">Sắp ra mắt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReferralClient referralCode={referralCode} />
    </div>
  );
}
