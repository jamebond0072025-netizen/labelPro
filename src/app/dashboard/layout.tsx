
'use client';
import { Header } from '@/components/layout/header';
import { PrintProvider } from '@/contexts/print-context';
import { EditorProvider } from '@/contexts/editor-context';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Check if window is in an iframe
    if (window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);

  return (
    <EditorProvider>
        <div className="flex h-screen w-full flex-col">
          {!isIframe && <Header />}
          <main className="flex-1 bg-background overflow-hidden flex">
            {children}
          </main>
        </div>
    </EditorProvider>
  );
}
