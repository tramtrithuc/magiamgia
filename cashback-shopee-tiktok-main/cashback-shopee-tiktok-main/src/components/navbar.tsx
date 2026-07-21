'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Wallet, ShoppingBag, LogOut, User, ChevronDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  user: {
    email: string;
    full_name: string | null;
  } | null;
  initialCurrency: string;
}

export function Navbar({ user, initialCurrency }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/dashboard', label: 'Dashboard', auth: true },
    { href: '/orders', label: 'Đơn hàng', auth: true },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.auth || user
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/20 transition-shadow group-hover:shadow-orange-500/40">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              CashBack VN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-orange-400 bg-orange-500/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => {
                const next = initialCurrency === 'VND' ? 'USD' : 'VND';
                document.cookie = `currency=${next}; path=/; max-age=31536000`;
                localStorage.setItem('currency', next);
                window.location.reload();
              }}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer mr-2"
            >
              {initialCurrency === 'VND' ? '₫ VND' : '$ USD'}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-[120px] truncate">
                    {user.full_name || user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/50" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl p-1.5">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Đơn hàng
                      </Link>
                      <Link
                        href="/withdraw"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Wallet className="h-4 w-4" />
                        Rút tiền
                      </Link>
                      <Link
                        href="/referral"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        Giới thiệu
                      </Link>
                      <div className="my-1 border-t border-white/10" />
                      <form action="/api/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-orange-400 bg-orange-500/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 mt-3">
              {user ? (
                <div className="space-y-1">
                  <Link
                    href="/withdraw"
                    className="block rounded-lg px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Rút tiền
                  </Link>
                  <Link
                    href="/referral"
                    className="block rounded-lg px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giới thiệu
                  </Link>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full text-left rounded-lg px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button size="sm" className="w-full">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
