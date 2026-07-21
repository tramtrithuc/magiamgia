import { NextResponse, type NextRequest } from 'next/server';
import { withdrawSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';
import rateLimit from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/logger';

const withdrawLimiter = rateLimit({ interval: 3600000 }); // 1 hour

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    try {
      await withdrawLimiter.check(3, user.id);
    } catch {
      await logSecurityEvent(user.id, 'RATE_LIMIT_EXCEEDED', { route: '/api/withdraw' });
      return NextResponse.json({ error: 'Thao tác quá nhanh, vui lòng thử lại sau 1 giờ.' }, { status: 429 });
    }

    await logSecurityEvent(user.id, 'WITHDRAW_REQUEST', { path: '/api/withdraw' });

    const body = await request.json();
    const result = withdrawSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { amount, method, account_info, account_name } = result.data;

    // Check user balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (!profile || profile.balance < amount) {
      return NextResponse.json(
        { error: 'Số dư không đủ' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const { error: withdrawError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount,
        method,
        account_info,
        account_name,
        status: 'pending',
      });

    if (withdrawError) {
      return NextResponse.json(
        { error: 'Không thể tạo yêu cầu rút tiền' },
        { status: 500 }
      );
    }

    // Tạm thời chưa trừ tiền trong profiles, chỉ tạo yêu cầu
    // await supabase
    //   .from('profiles')
    //   .update({ balance: profile.balance - amount })
    //   .eq('id', user.id);

    return NextResponse.json({ success: true, message: 'Yêu cầu rút tiền đã được tạo' });
  } catch {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Không thể lấy lịch sử rút tiền' },
        { status: 500 }
      );
    }

    return NextResponse.json({ withdrawals });
  } catch {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
