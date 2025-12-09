import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Influencer CRM</h1>
        <p className="text-xl">AI-Powered Content Creation & Management</p>
      </div>
    </div>
  );
}
