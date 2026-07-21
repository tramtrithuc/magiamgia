export type Platform = 'shopee' | 'tiktok';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';

export type WithdrawStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type WithdrawMethod = 'momo' | 'bank' | 'vietqr';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  referral_code: string;
  referred_by: string | null;
  zalo_id: string | null;
  telegram_id: string | null;
  balance: number;
  total_earned: number;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  platform: Platform;
  product_url: string;
  product_name: string | null;
  product_image: string | null;
  order_code: string | null;
  affiliate_link: string | null;
  original_price: number | null;
  cashback_percent: number | null;
  cashback_amount: number | null;
  commission_amount: number | null;
  status: OrderStatus;
  proof_image: string | null;
  admin_note: string | null;
  tracking_type: 'auto' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: WithdrawMethod;
  account_info: string;
  account_name: string;
  status: WithdrawStatus;
  admin_note: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateLinkRequest {
  product_url: string;
  platform: Platform;
}

export interface GenerateLinkResponse {
  success: boolean;
  data?: {
    affiliate_link: string;
    product_name: string;
    product_image: string;
    original_price: number;
    cashback_percent: number;
    estimated_cashback: number;
    tracking_type?: 'manual' | 'auto';
    message?: string;
  };
  error?: string;
}

export interface DashboardStats {
  balance: number;
  total_earned: number;
  pending_orders: number;
  completed_orders: number;
  pending_withdrawals: number;
}
