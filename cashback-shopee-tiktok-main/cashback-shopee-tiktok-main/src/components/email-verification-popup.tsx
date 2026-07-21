'use client';

import { useState } from 'react';
import { AlertTriangle, Mail, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface EmailVerificationPopupProps {
  email: string;
  createdAt: string;
  emailVerified: boolean;
}

export function EmailVerificationPopup({ email, createdAt, emailVerified }: EmailVerificationPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  if (emailVerified || !isVisible) return null;

  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return null;

  const isLocked = diffDays > 33;
  const daysLeft = 33 - diffDays > 0 ? 33 - diffDays : 0;

  const handleSendVerification = async () => {
    setIsSending(true);
    setError('');
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSent(true);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 w-full max-w-sm rounded-xl p-5 shadow-2xl backdrop-blur-xl border",
      isLocked 
        ? "bg-red-500/10 border-red-500/20" 
        : "bg-yellow-500/10 border-yellow-500/20"
    )}>
      {!isLocked && (
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isLocked ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
        )}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">
            {isLocked ? "Tài khoản bị giới hạn" : "Yêu cầu xác minh Email"}
          </h3>
          <p className="mt-1 text-sm text-white/70">
            {isLocked 
              ? "Bạn chưa xác minh email sau 30 ngày. Tính năng rút tiền đã bị khóa tạm thời." 
              : `Bạn còn ${daysLeft} ngày để xác minh email trước khi tính năng rút tiền bị khóa.`}
          </p>

          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}

          <div className="mt-4">
            {isSent ? (
              <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Đã gửi email xác minh
              </div>
            ) : (
              <Button 
                onClick={handleSendVerification} 
                disabled={isSending}
                size="sm" 
                className={cn(
                  "w-full",
                  isLocked 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-yellow-500 hover:bg-yellow-600 text-black"
                )}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSending ? "Đang gửi..." : "Gửi email xác minh ngay"}
              </Button>
            )}
            {isSent && (
              <p className="mt-2 text-xs text-white/50">
                Vui lòng kiểm tra Hộp thư đến (hoặc Spam) của {email}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
