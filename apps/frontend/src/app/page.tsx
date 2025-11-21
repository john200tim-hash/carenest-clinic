'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/doctors/dashboard');
  }, [router]);

  return <p>Redirecting to dashboard...</p>;
}