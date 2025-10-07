
'use client';
import { Header } from '@/components/layout/header';
import { PrintProvider } from '@/contexts/print-context';
import { EditorProvider } from '@/contexts/editor-context';
import { Suspense } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <EditorProvider>
        <div className="flex h-screen w-full flex-col">
          <Header />
          <main className="flex-1 bg-background overflow-hidden flex">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
    </EditorProvider>
  );
}
