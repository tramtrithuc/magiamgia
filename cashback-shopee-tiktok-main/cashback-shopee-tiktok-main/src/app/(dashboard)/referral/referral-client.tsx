'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ReferralClient({ referralCode }: { referralCode: string }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    setReferralLink(`${window.location.origin}/register?ref=${referralCode}`);
  }, [referralCode]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <CardContent className="p-8 relative z-10">
        <h2 className="text-xl font-bold text-white mb-6">Mã giới thiệu của bạn</h2>
        
        <div className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Mã giới thiệu (Code)</label>
            <div className="flex gap-2">
              <Input value={referralCode} readOnly className="font-mono text-lg font-bold text-orange-400 bg-black/50" />
              <Button onClick={copyCode} variant="outline" className="shrink-0 w-28">
                {copiedCode ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copiedCode ? 'Đã copy' : 'Copy mã'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Link giới thiệu (Gửi cho bạn bè đăng ký)</label>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="bg-black/50 text-white/80" />
              <Button onClick={copyLink} variant="outline" className="shrink-0 w-28">
                {copiedLink ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copiedLink ? 'Đã copy' : 'Copy link'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
