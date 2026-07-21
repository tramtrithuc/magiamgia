import { Metadata } from 'next';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { WithdrawForm } from './withdraw-form';
import type { Withdrawal } from '@/types';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Rút tiền - CashBack VN',
  description: 'Rút tiền hoàn về ví MoMo hoặc tài khoản ngân hàng',
};

export default async function WithdrawPage() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'VND';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let balance = 0;
  let withdrawals: Withdrawal[] = [];
  let isLocked = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, created_at, email_verified')
      .eq('id', user.id)
      .single();

    if (profile) {
      balance = profile.balance || 0;
      
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 33 && !profile.email_verified) {
        isLocked = true;
      }
    }

    const { data: history } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (history) {
      withdrawals = history as Withdrawal[];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Rút tiền</h1>
        <p className="mt-1 text-sm text-white/50">
          Rút tiền hoàn về MoMo, Ngân hàng hoặc VietQR
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b border-white/10 bg-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Tạo yêu cầu</CardTitle>
                <div className="sm:text-right">
                  <p className="text-xs text-white/50">Số dư khả dụng</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCurrency(balance, currency)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLocked ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-red-500/10 p-4 mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Tính năng bị khóa</h3>
                  <p className="text-sm text-white/60 max-w-sm">
                    Tài khoản của bạn đã quá hạn xác minh email. Vui lòng xác minh email (bấm nút ở góc dưới màn hình) để tiếp tục sử dụng tính năng rút tiền.
                  </p>
                </div>
              ) : (
                <WithdrawForm balance={balance} currency={currency} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Column */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Lịch sử rút tiền</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-8 w-8 text-white/20 mb-3" />
                  <p className="text-sm text-white/50">Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(w.status))}>
                          {getStatusLabel(w.status)}
                        </span>
                        <span className="text-base font-bold text-white">
                          {formatCurrency(w.amount, currency)}
                        </span>
                      </div>
                      <div className="text-xs text-white/60 space-y-1.5 bg-black/20 p-2 rounded-lg">
                        <p className="flex justify-between"><span className="text-white/40">Kênh:</span> <span className="uppercase text-white font-medium">{w.method}</span></p>
                        <p className="flex justify-between"><span className="text-white/40">TT:</span> <span className="text-white font-medium truncate ml-2">{w.account_info}</span></p>
                      </div>
                      <p className="text-white/30 text-[10px] mt-3 text-right">{formatDate(w.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
