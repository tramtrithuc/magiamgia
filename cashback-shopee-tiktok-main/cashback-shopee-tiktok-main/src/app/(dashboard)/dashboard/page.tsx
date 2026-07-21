import { Metadata } from 'next';
import { Wallet, ShoppingBag, ArrowDownToLine, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Order } from '@/types';

export const metadata: Metadata = {
  title: 'Dashboard - CashBack VN',
  description: 'Quản lý hoàn tiền của bạn',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'VND';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let stats = {
    balance: 0,
    total_earned: 0,
    pending_orders: 0,
    completed_orders: 0,
  };
  let recentOrders: Order[] = [];

  if (user) {
    // Fetch profile stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, total_earned')
      .eq('id', user.id)
      .single();

    if (profile) {
      stats.balance = profile.balance || 0;
      stats.total_earned = profile.total_earned || 0;
    }

    // Fetch orders stats and recent list
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi lấy orders:', error);
    } else if (orders) {
      stats.pending_orders = orders.filter((o: Order) => o.status === 'pending').length;
      stats.completed_orders = orders.filter((o: Order) => o.status === 'completed').length;
      recentOrders = orders.slice(0, 3) as Order[];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">
          Tổng quan tài khoản của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:border-orange-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Số dư ví</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(stats.balance, currency)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/10">
                <Wallet className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:border-green-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Tổng đã hoàn</p>
                <p className="mt-2 text-2xl font-bold text-green-400">
                  {formatCurrency(stats.total_earned, currency)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/10">
                <ArrowDownToLine className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:border-blue-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Đơn hoàn thành</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.completed_orders}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/10">
                <ShoppingBag className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:border-yellow-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Đang chờ</p>
                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {stats.pending_orders}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Đơn hàng mới nhất</CardTitle>
          <Link href="/orders" className="text-sm font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-white/20 mb-4" />
              <p className="text-white/50">Chưa có đơn hàng nào</p>
              <p className="mt-1 text-sm text-white/30">
                Bắt đầu bằng cách dán link sản phẩm ở trang chủ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-white/10">
                      {order.product_image ? (
                        <img src={order.product_image} alt={order.product_name || ''} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                          <ShoppingBag className="h-5 w-5 text-orange-400/50" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pr-4">
                      <a href={order.affiliate_link || order.product_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-md hover:text-orange-400 block">
                        {order.product_name || 'Sản phẩm ' + order.platform}
                      </a>
                      <p className="text-xs text-white/50 mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="text-sm font-bold text-green-400">
                      +{order.cashback_amount ? formatCurrency(order.cashback_amount, currency) : (order.cashback_percent ? `${order.cashback_percent}%` : '---')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
