import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin - CashBack VN',
  description: 'Quản trị hệ thống CashBack VN',
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/50">
          Quản trị hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản trị</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/50">Admin Panel</p>
            <p className="mt-1 text-sm text-white/30">
              Sẽ được triển khai trong giai đoạn tiếp theo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
