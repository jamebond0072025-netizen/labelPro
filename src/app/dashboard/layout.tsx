import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background overflow-hidden">
        {children}
      </main>
    </div>
  );
}
