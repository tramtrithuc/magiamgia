import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CashBack VN - Hoàn tiền mua sắm Shopee & TikTok Shop',
  description:
    'Nền tảng hoàn tiền hàng đầu Việt Nam. Mua sắm trên Shopee và TikTok Shop, nhận hoàn tiền lên đến 50%. Đơn giản, nhanh chóng, đáng tin cậy.',
  keywords: ['cashback', 'hoàn tiền', 'shopee', 'tiktok shop', 'mua sắm', 'tiết kiệm'],
  authors: [{ name: 'CashBack VN' }],
  openGraph: {
    title: 'CashBack VN - Hoàn tiền mua sắm Shopee & TikTok Shop',
    description: 'Mua sắm thông minh, nhận hoàn tiền lên đến 50%',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // Fetch user profile from our profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authUser.id)
        .single();

      user = {
        email: authUser.email || '',
        full_name: profile?.full_name || null,
      };
    }
  } catch {
    // Supabase not configured yet, continue without auth
  }

  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'VND';

  return (
    <html lang="vi" className="dark">
      <head>
        <meta name="zalo-platform-site-verification" content="EO-w3R-0Eo5b_-iWXz1x2M7sy0gDW2fNCZWv" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        {/* Background gradient effects */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[128px]" />
        </div>

        <Navbar user={user} initialCurrency={currency} />
        <main className="pt-16">{children}</main>
        <FloatingWidgets />
        <Footer />
      </body>
    </html>
  );
}
