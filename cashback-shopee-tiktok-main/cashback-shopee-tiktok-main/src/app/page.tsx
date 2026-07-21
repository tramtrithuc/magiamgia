import { ArrowRight, Shield, Zap, TrendingUp, Gift, Users, Star, ShoppingBag, Sparkles, Clock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LinkGeneratorForm } from '@/components/link-generator-form';

const features = [
  {
    icon: Zap,
    title: 'Nhanh chóng',
    description: 'Dán link - Lấy cashback - Mua hàng. Chỉ 3 bước đơn giản.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'An toàn & Minh bạch',
    description: 'Theo dõi đơn hàng real-time. Hoàn tiền tự động vào ví.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Tỷ lệ cao nhất',
    description: 'Hoàn tiền lên đến 50% cho mọi đơn hàng Shopee & TikTok.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Gift,
    title: 'Thưởng giới thiệu',
    description: 'Giới thiệu bạn bè, nhận thêm hoa hồng từ mọi đơn hàng.',
    color: 'from-purple-500 to-pink-500',
  },
];

const stats = [
  { label: 'Người dùng', value: '10,000+' },
  { label: 'Đơn hoàn tiền', value: '50,000+' },
  { label: 'Tiền đã hoàn', value: '2TĐ+' },
  { label: 'Tỷ lệ hoàn', value: 'Đến 50%' },
];

const steps = [
  {
    step: 1,
    title: 'Dán link & lấy link hoàn tiền',
    description: 'Copy link sản phẩm từ Shopee hoặc TikTok Shop và dán vào ô tìm kiếm.',
    icon: ShoppingBag,
  },
  {
    step: 2,
    title: 'Mua hàng bình thường',
    description: 'Bấm qua link vừa tạo và thanh toán đơn hàng như bình thường.',
    icon: Sparkles,
  },
  {
    step: 3,
    title: 'Hệ thống ghi nhận',
    description: 'Đơn hàng sẽ được ghi nhận vào hệ thống trong vòng 1-3 ngày.',
    icon: Clock,
  },
  {
    step: 4,
    title: 'Rút tiền',
    description: 'Sau khi đơn hàng hoàn tất, bạn có thể rút tiền về ví.',
    icon: Wallet,
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'VND';
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-[80px] animate-float" />
        <div className="absolute top-40 right-10 w-24 h-24 bg-pink-500/20 rounded-full blur-[60px] animate-float" style={{ animationDelay: '2s' }} />

        <div className="mx-auto max-w-7xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-400 mb-8">
            <Star className="h-3.5 w-3.5 fill-orange-400" />
            Nền tảng hoàn tiền #1 Việt Nam
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
            <span className="text-white">Mua sắm trên </span>
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Shopee & TikTok
            </span>
            <br />
            <span className="text-white">Nhận </span>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              hoàn tiền
            </span>
            <span className="text-white"> ngay</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
            Dán link sản phẩm, nhận hoàn tiền lên đến <span className="text-orange-400 font-semibold">50%</span> cho mọi đơn hàng. Đơn giản, nhanh chóng, miễn phí hoàn toàn.
          </p>

          {/* Link Generator Form */}
          <div className="mt-10">
            <LinkGeneratorForm currency={currency} />
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Quy trình nhận hoàn tiền
            </h2>
            <p className="mt-4 text-white/50 text-lg">
              Chỉ 4 bước đơn giản để tiết kiệm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
                )}

                <Card className="relative overflow-hidden group hover:border-orange-500/30 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    {/* Step number */}
                    <div className="absolute top-4 right-4 text-6xl font-extrabold text-white/5">
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/10 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-7 w-7 text-orange-400" />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Tại sao chọn CashBack VN?
            </h2>
            <p className="mt-4 text-white/50 text-lg">
              Những lý do khiến hàng ngàn người tin dùng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-orange-500/20">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-500/10" />

            <CardContent className="relative p-8 sm:p-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/25">
                <Users className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Sẵn sàng tiết kiệm?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/50">
                Tham gia cùng hàng nghìn người dùng đang tiết kiệm mỗi ngày với CashBack VN. Đăng ký miễn phí, bắt đầu ngay.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="xl">
                    Đăng ký miễn phí
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#">
                  <Button variant="outline" size="xl">
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
