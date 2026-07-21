import { Metadata } from 'next';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { cookies } from 'next/headers';
import type { Order } from '@/types';

export const metadata: Metadata = {
  title: 'Lịch sử đơn hàng - CashBack VN',
  description: 'Xem lịch sử đơn hàng hoàn tiền của bạn',
};

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'VND';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orders: Order[] = [];
  
  if (user) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Lỗi lấy orders:', error);
    } else if (data) {
      orders = data as Order[];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Lịch sử đơn hàng</h1>
        <p className="mt-1 text-sm text-white/50">
          Theo dõi tất cả đơn hàng hoàn tiền của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-white/20 mb-4" />
              <p className="text-white/50">Chưa có đơn hàng nào</p>
              <p className="mt-1 text-sm text-white/30">
                Đơn hàng sẽ xuất hiện tại đây khi bạn mua hàng qua link cashback
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500/30 transition-colors">
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-white/10">
                    {order.product_image ? (
                      <img src={order.product_image} alt={order.product_name || 'Product'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                        <ShoppingBag className="h-6 w-6 text-orange-400/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize border-white/20">{order.platform}</Badge>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(order.status))}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <a href={order.affiliate_link || order.product_url} target="_blank" rel="noreferrer" className="text-base font-medium text-white truncate hover:text-orange-400 flex items-center gap-2 group">
                      <span className="truncate">{order.product_name || 'Sản phẩm ' + order.platform}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                    <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
                      <span>{formatDate(order.created_at)}</span>
                      {order.tracking_type === 'manual' && (
                        <span className="text-yellow-400 text-xs border border-yellow-500/30 px-1.5 py-0.5 rounded bg-yellow-500/10">Cần cập nhật mã đơn</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 text-right mt-2 sm:mt-0">
                    <p className="text-sm text-white/50">Dự kiến hoàn</p>
                    <p className="text-lg font-bold text-green-400">
                      {order.cashback_amount ? formatCurrency(order.cashback_amount, currency) : (order.cashback_percent ? `${order.cashback_percent}%` : 'Chờ tính')}
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
