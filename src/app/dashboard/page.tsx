'use client';

import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function DashboardContent() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/editor');
  }, [router]);

  return null;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
