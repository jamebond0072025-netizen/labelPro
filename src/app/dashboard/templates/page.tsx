'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TemplatesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting to gallery...</p>
    </div>
  );
}
