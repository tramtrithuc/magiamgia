'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { withdrawSchema, type WithdrawInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Banknote, CheckCircle2 } from 'lucide-react';

interface WithdrawFormProps {
  balance: number;
  currency?: string;
}

export function WithdrawForm({ balance, currency = 'VND' }: WithdrawFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<WithdrawInput>({
    amount: 50000,
    method: 'momo',
    account_info: '',
    account_name: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof WithdrawInput, string>>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    const result = withdrawSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof WithdrawInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof WithdrawInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    if (formData.amount > balance) {
      setError('Số tiền rút vượt quá số dư hiện có');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.error || 'Có lỗi xảy ra');
        return;
      }

      setSuccess(true);
      setFormData({ amount: 50000, method: 'momo', account_info: '', account_name: '' });
      router.refresh();
    } catch (e) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Đã gửi yêu cầu rút tiền</h3>
        <p className="text-white/60 max-w-md mb-6">
          Yêu cầu rút tiền của bạn đang được xử lý. Bạn có thể theo dõi trạng thái trong phần lịch sử bên phải.
        </p>
        <Button onClick={() => setSuccess(false)} variant="outline">
          Tạo yêu cầu mới
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Số tiền muốn rút</Label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              className="pl-10"
              placeholder="50000"
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-400">{errors.amount}</p>
          )}
          <p className="text-xs text-white/40">Tối thiểu {formatCurrency(50000, currency)}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Phương thức</Label>
          <select
            id="method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="momo" className="bg-black text-white">Ví MoMo</option>
            <option value="bank" className="bg-black text-white">Chuyển khoản Ngân hàng</option>
            <option value="vietqr" className="bg-black text-white">VietQR</option>
          </select>
          {errors.method && (
            <p className="text-sm text-red-400">{errors.method}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account_info">
            {formData.method === 'momo' ? 'Số điện thoại MoMo' : 'Số tài khoản & Tên Ngân hàng'}
          </Label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              id="account_info"
              name="account_info"
              value={formData.account_info}
              onChange={handleChange}
              className="pl-10"
              placeholder={formData.method === 'momo' ? '0912345678' : '0123456789 - Vietcombank'}
            />
          </div>
          {errors.account_info && (
            <p className="text-sm text-red-400">{errors.account_info}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_name">Tên chủ tài khoản</Label>
          <div className="relative">
            <Input
              id="account_name"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              className="pl-3"
              placeholder="NGUYEN VAN A"
            />
          </div>
          {errors.account_name && (
            <p className="text-sm text-red-400">{errors.account_name}</p>
          )}
          <p className="text-xs text-white/40">Vui lòng viết hoa không dấu</p>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || balance < 50000}
        isLoading={isLoading}
      >
        Tạo yêu cầu rút tiền
      </Button>
      {balance < 50000 && (
        <p className="text-center text-sm text-red-400 mt-2">
          Số dư của bạn chưa đủ để rút (tối thiểu {formatCurrency(50000, currency)})
        </p>
      )}
    </form>
  );
}
