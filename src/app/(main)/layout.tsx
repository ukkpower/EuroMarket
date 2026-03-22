import { Header } from '@/components/layout/Header';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { MainContentShell } from '@/components/layout/MainContentShell';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryBar />

      <MainContentShell>{children}</MainContentShell>
    </div>
  );
}
