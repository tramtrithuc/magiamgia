import { Metadata } from 'next';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Quên mật khẩu - CashBack VN',
  description: 'Khôi phục mật khẩu tài khoản CashBack VN',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
