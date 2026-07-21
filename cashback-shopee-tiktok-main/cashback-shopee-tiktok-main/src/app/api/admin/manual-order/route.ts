import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ─── GET /api/admin/manual-order?q=<email|name> ─────────────────────────────
// Search users by email or full_name
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const q = request.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const adminClient = createAdminClient();

    // 1. Search by full_name in profiles (email column does NOT exist in profiles)
    const { data: byName, error: nameErr } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', `%${q}%`)
      .limit(10);

    if (nameErr) {
      console.error('[manual-order] name search error:', nameErr);
      return NextResponse.json({ error: 'Không thể tìm kiếm user' }, { status: 500 });
    }

    // 2. Search by email via auth admin API
    const { data: authData, error: authErr } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authErr) {
      console.error('[manual-order] auth search error:', authErr);
      return NextResponse.json({ error: 'Không thể tìm kiếm user' }, { status: 500 });
    }

    const lowerQ = q.toLowerCase();
    const matchedAuthUsers = (authData?.users ?? []).filter(
      (u) => u.email?.toLowerCase().includes(lowerQ)
    );

    // Merge: collect all unique IDs from both searches
    const nameIds = new Set((byName ?? []).map((p) => p.id));
    const allIds = [
      ...(byName ?? []).map((p) => p.id),
      ...matchedAuthUsers.filter((u) => !nameIds.has(u.id)).map((u) => u.id),
    ].slice(0, 10);

    if (allIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Fetch full profiles for all matched IDs
    const { data: profiles, error: profErr } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .in('id', allIds);

    if (profErr) {
      console.error('[manual-order] profile fetch error:', profErr);
      return NextResponse.json({ error: 'Không thể tìm kiếm user' }, { status: 500 });
    }

    // Build email map from auth users
    const emailMap = new Map<string, string>(
      (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
    );

    const users = (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name ?? null,
      email: emailMap.get(p.id) ?? '',
    }));

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// ─── POST /api/admin/manual-order ───────────────────────────────────────────
// Insert a manual order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, product_link, order_amount, cashback_amount, note } = body;

    if (!user_id || !product_link || order_amount == null || cashback_amount == null) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    if (typeof order_amount !== 'number' || order_amount <= 0) {
      return NextResponse.json({ error: 'Số tiền đơn không hợp lệ' }, { status: 400 });
    }

    if (typeof cashback_amount !== 'number' || cashback_amount < 0) {
      return NextResponse.json({ error: 'Số tiền hoàn không hợp lệ' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: order, error } = await adminClient
      .from('orders')
      .insert({
        user_id,
        product_link,
        order_amount,
        cashback_amount,
        note: note || null,
        status: 'manual',
        created_by_admin: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[manual-order] insert error:', error);
      return NextResponse.json({ error: 'Không thể tạo đơn hàng' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
