'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ShoppingBag, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, detectPlatform, formatCurrency } from '@/lib/utils';

interface LinkResult {
  affiliate_link: string;
  product_name: string;
  product_image: string;
  original_price: number;
  cashback_percent: number;
  estimated_cashback: number;
  tracking_type?: 'manual' | 'auto';
  message?: string;
  order_saved?: boolean;
}

interface LinkGeneratorFormProps {
  currency?: string;
}

export function LinkGeneratorForm({ currency = 'VND' }: LinkGeneratorFormProps) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<LinkResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const platform = url ? detectPlatform(url) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Vui lòng dán link sản phẩm');
      return;
    }

    if (!platform) {
      setError('Chỉ hỗ trợ link Shopee hoặc TikTok Shop');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/generate-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_url: url }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Có lỗi xảy ra, vui lòng thử lại');
          return;
        }

        setResult(data.data);
      } catch {
        setError('Lỗi kết nối, vui lòng thử lại');
      }
    });
  };

  const handleCopy = async () => {
    if (result?.affiliate_link) {
      await navigator.clipboard.writeText(result.affiliate_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              {platform === 'shopee' ? (
                <div className="h-6 w-6 rounded-md bg-orange-500/20 flex items-center justify-center">
                  <ShoppingBag className="h-3.5 w-3.5 text-orange-400" />
                </div>
              ) : platform === 'tiktok' ? (
                <div className="h-6 w-6 rounded-md bg-pink-500/20 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                </div>
              ) : (
                <Search className="h-5 w-5 text-white/40" />
              )}
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
                setResult(null);
              }}
              placeholder="Dán link sản phẩm Shopee hoặc TikTok Shop..."
              className={cn(
                'w-full h-14 rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-base text-white placeholder:text-white/40 backdrop-blur-xl transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
                error && 'border-red-500/50',
                platform && 'border-orange-500/30'
              )}
            />
          </div>
          <Button
            type="submit"
            size="xl"
            isLoading={isPending}
            className="shrink-0 h-14 rounded-2xl px-8"
          >
            {isPending ? 'Phân tích...' : 'Lấy Cashback'}
            {!isPending && <ArrowRight className="h-5 w-5" />}
          </Button>
        </div>

        {/* Platform indicator */}
        {platform && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={platform === 'shopee' ? 'default' : 'info'}>
              {platform === 'shopee' ? '🛒 Shopee' : '🎥 TikTok Shop'}
            </Badge>
            <span className="text-xs text-white/40">Đã phát hiện nền tảng</span>
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card className="mt-6 overflow-hidden border-orange-500/20 glow-orange">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              {result.product_image ? (
                <div className="h-20 w-20 shrink-0 rounded-xl bg-white/10 overflow-hidden">
                  <img
                    src={result.product_image}
                    alt={result.product_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-orange-400/50" />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-white truncate">
                  {result.product_name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {result.original_price > 0 && (
                    <span className="text-sm text-white/60">
                      Giá: {formatCurrency(result.original_price, currency)}
                    </span>
                  )}
                  <Badge variant="success">
                    Hoàn {result.cashback_percent}%
                  </Badge>
                  {result.estimated_cashback > 0 && (
                    <span className="text-sm font-medium text-green-400">
                      ~ {formatCurrency(result.estimated_cashback, currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Affiliate Link */}
            <div className="mt-4 flex gap-2">
              <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 truncate">
                {result.affiliate_link}
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <><Check className="h-4 w-4 text-green-400" /> Đã copy</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy</>
                )}
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={() => window.open(result.affiliate_link, '_blank')}
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {result.tracking_type === 'manual' ? (
              <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                <p className="font-semibold mb-1">⚠️ Hướng dẫn hoàn tiền thủ công:</p>
                <p>{result.message || 'Link này là link gốc. Bạn hãy mua hàng bình thường, sau đó vào Dashboard → Đơn hàng để gửi mã đơn hàng + ảnh chứng minh để được duyệt hoàn tiền.'}</p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/40">
                Dùng link này để mua hàng và nhận hoàn tiền. Hệ thống tự động ghi nhận sau khi bạn thanh toán thành công.
              </p>
            )}

            {result.order_saved && (
              <div className="mt-4 flex justify-center border-t border-white/10 pt-4">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
                  Xem đơn hàng của tôi <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
