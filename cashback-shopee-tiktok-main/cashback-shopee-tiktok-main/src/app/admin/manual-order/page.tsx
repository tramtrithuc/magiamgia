'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  User,
  Link2,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  PlusCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserResult {
  id: string;
  full_name: string | null;
  email: string;
}

interface FormState {
  productLink: string;
  orderAmount: string;
  cashbackAmount: string;
  note: string;
}

type AlertType = 'success' | 'error' | null;

// ─── Alert Banner ─────────────────────────────────────────────────────────────

function AlertBanner({
  type,
  message,
  onClose,
}: {
  type: AlertType;
  message: string;
  onClose: () => void;
}) {
  if (!type) return null;
  const ok = type === 'success';
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        ok
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-red-500/30 bg-red-500/10 text-red-400'
      }`}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="opacity-60 transition-opacity hover:opacity-100"
        aria-label="close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── User Search ──────────────────────────────────────────────────────────────

function UserSearch({
  selected,
  onSelect,
}: {
  selected: UserResult | null;
  onSelect: (u: UserResult | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manual-order?q=${encodeURIComponent(q.trim())}`);
      const d = await res.json();
      setResults(d.users ?? []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(query), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query, search]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20">
            <User className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{selected.full_name || 'Người dùng'}</p>
            <p className="text-xs text-white/40">{selected.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="rounded p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={box} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          id="user-search"
          placeholder="Tìm theo email hoặc tên..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9 pr-9"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/30" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-[#1a1a2e] shadow-xl">
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => { onSelect(u); setQuery(''); setOpen(false); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <User className="h-3.5 w-3.5 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {u.full_name || <span className="text-white/40">Chưa đặt tên</span>}
                  </p>
                  <p className="truncate text-xs text-white/40">{u.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-3 text-sm text-white/40 shadow-xl">
          Không tìm thấy user nào
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EMPTY: FormState = { productLink: '', orderAmount: '', cashbackAmount: '', note: '' };

export default function ManualOrderPage() {
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string }>({ type: null, message: '' });

  const set = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const reset = () => { setSelectedUser(null); setForm(EMPTY); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: null, message: '' });

    if (!selectedUser) { setAlert({ type: 'error', message: 'Vui lòng chọn user.' }); return; }

    const orderAmount = parseFloat(form.orderAmount);
    const cashbackAmount = parseFloat(form.cashbackAmount);

    if (!form.productLink.trim()) { setAlert({ type: 'error', message: 'Vui lòng nhập link sản phẩm.' }); return; }
    if (isNaN(orderAmount) || orderAmount <= 0) { setAlert({ type: 'error', message: 'Số tiền đơn hàng không hợp lệ.' }); return; }
    if (isNaN(cashbackAmount) || cashbackAmount < 0) { setAlert({ type: 'error', message: 'Số tiền hoàn không hợp lệ.' }); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/manual-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          product_link: form.productLink.trim(),
          order_amount: orderAmount,
          cashback_amount: cashbackAmount,
          note: form.note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAlert({ type: 'error', message: data.error || 'Đã có lỗi xảy ra.' }); return; }
      setAlert({
        type: 'success',
        message: `Đã tạo đơn thủ công #${data.order?.id?.slice(0, 8) ?? ''} cho ${selectedUser.full_name || selectedUser.email}`,
      });
      reset();
    } catch {
      setAlert({ type: 'error', message: 'Không thể kết nối server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
            <PlusCircle className="h-4 w-4 text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Tạo đơn thủ công</h1>
          <Badge className="ml-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-400">Admin</Badge>
        </div>
        <p className="text-sm text-white/40">
          Tạo đơn cashback thủ công và gán vào tài khoản user cụ thể.
        </p>
      </div>

      {/* Alert */}
      {alert.type && (
        <div className="mb-6">
          <AlertBanner
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: null, message: '' })}
          />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin đơn hàng</CardTitle>
            <CardDescription>Điền đầy đủ thông tin bên dưới để tạo đơn.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* User */}
            <div className="space-y-1.5">
              <Label htmlFor="user-search" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-white/40" />
                User <span className="text-red-400">*</span>
              </Label>
              <UserSearch selected={selectedUser} onSelect={setSelectedUser} />
            </div>

            {/* Link sản phẩm */}
            <div className="space-y-1.5">
              <Label htmlFor="product-link" className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-white/40" />
                Link sản phẩm <span className="text-red-400">*</span>
              </Label>
              <Input
                id="product-link"
                type="url"
                placeholder="https://shopee.vn/..."
                value={form.productLink}
                onChange={(e) => set('productLink', e.target.value)}
              />
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="order-amount" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-white/40" />
                  Số tiền đơn (₫) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="order-amount"
                  type="number"
                  min="1"
                  step="1000"
                  placeholder="0"
                  value={form.orderAmount}
                  onChange={(e) => set('orderAmount', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cashback-amount" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400/70" />
                  Số tiền hoàn (₫) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="cashback-amount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={form.cashbackAmount}
                  onChange={(e) => set('cashbackAmount', e.target.value)}
                />
              </div>
            </div>

            {/* Ghi chú */}
            <div className="space-y-1.5">
              <Label htmlFor="note" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-white/40" />
                Ghi chú
              </Label>
              <textarea
                id="note"
                rows={3}
                placeholder="Ghi chú nội bộ (không bắt buộc)"
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                className="w-full resize-none rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
              />
            </div>

            {/* Preview */}
            {selectedUser && form.orderAmount && form.cashbackAmount && (
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-xs text-white/50">
                <p className="mb-1 font-medium text-white/70">Xem trước</p>
                <p>User: <span className="text-white">{selectedUser.full_name || selectedUser.email}</span></p>
                <p>
                  Đơn: <span className="text-white">{Number(form.orderAmount).toLocaleString('vi-VN')} ₫</span>
                  {' → '}Hoàn: <span className="text-emerald-400">{Number(form.cashbackAmount).toLocaleString('vi-VN')} ₫</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            disabled={submitting}
            className="text-white/40 hover:text-white/70"
          >
            Xóa form
          </Button>
          <Button type="submit" disabled={submitting || !selectedUser} className="min-w-[140px]">
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo...</>
            ) : (
              <><PlusCircle className="mr-2 h-4 w-4" />Tạo đơn hàng</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}