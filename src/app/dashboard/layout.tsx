
import { Header } from '@/components/layout/header';
import { EditorProvider } from '@/contexts/editor-context';
import { PrintProvider } from '@/contexts/print-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrintProvider>
      <EditorProvider>
        <div className="flex h-screen w-full flex-col">
          <Header />
          <main className="flex-1 bg-background overflow-hidden flex">
            {children}
          </main>
        </div>
      </EditorProvider>
    </PrintProvider>
  );
}
