import { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Đăng ký - CashBack VN',
  description: 'Tạo tài khoản CashBack VN miễn phí để nhận hoàn tiền',
};

import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white">Đang tải...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
