// app/login/page.tsx
'use client';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ログイン状態であれば、メインページにリダイレクト
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>ログインしてください</h1>
      <button onClick={() => signIn('google')}>Googleでサインイン</button>
    </div>
  );
}
