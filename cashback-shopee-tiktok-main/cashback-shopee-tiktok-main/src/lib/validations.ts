import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(255, 'Email quá dài'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100, 'Mật khẩu quá dài'),
});

const TEMP_EMAIL_DOMAINS = [
  'tempmail', '10minutemail', 'guerrillamail', 'mailinator', 'yopmail',
  'temp-mail', 'throwawaymail', 'sharklasers', 'dispostable'
];

export const registerSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(255, 'Email quá dài'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100, 'Mật khẩu quá dài'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự').max(100, 'Mật khẩu quá dài'),
  full_name: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100, 'Họ tên quá dài'),
  referral_code: z.string().trim().max(20, 'Mã giới thiệu quá dài').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(255, 'Email quá dài'),
});

export const generateLinkSchema = z.object({
  product_url: z.string().trim().url('URL không hợp lệ').max(1000, 'URL quá dài').refine(
    (url) =>
      url.includes('shopee.vn') ||
      url.includes('shope.ee') ||
      url.includes('tiktok.com') ||
      url.includes('vt.tiktok.com'),
    'Chỉ hỗ trợ link Shopee hoặc TikTok Shop'
  ),
});

export const withdrawSchema = z.object({
  amount: z.number().min(50000, 'Số tiền rút tối thiểu 50.000₫').max(100000000, 'Số tiền rút quá lớn'),
  method: z.enum(['momo', 'bank', 'vietqr']).refine((val) => ['momo', 'bank', 'vietqr'].includes(val), {
    message: 'Vui lòng chọn phương thức rút tiền'
  }),
  account_info: z.string().trim().min(1, 'Vui lòng nhập thông tin tài khoản').max(255, 'Thông tin quá dài'),
  account_name: z.string().trim().min(1, 'Vui lòng nhập tên chủ tài khoản').max(100, 'Tên quá dài'),
});

export const manualOrderSchema = z.object({
  product_url: z.string().trim().url('URL không hợp lệ').max(1000, 'URL quá dài'),
  order_code: z.string().trim().min(1, 'Vui lòng nhập mã đơn hàng').max(100, 'Mã đơn hàng quá dài'),
  platform: z.enum(['shopee', 'tiktok']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type GenerateLinkInput = z.infer<typeof generateLinkSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type ManualOrderInput = z.infer<typeof manualOrderSchema>;
