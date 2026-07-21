import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EmailVerificationPopup } from '@/components/email-verification-popup';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at, email_verified')
    .eq('id', user.id)
    .single();

  return (
    <>
      {children}
      {profile && (
        <EmailVerificationPopup 
          email={user.email!}
          createdAt={profile.created_at} 
          emailVerified={profile.email_verified || false} 
        />
      )}
    </>
  );
}
