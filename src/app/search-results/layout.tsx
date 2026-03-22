import { Header } from '@/components/layout/Header';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Footer } from '@/components/layout/Footer';

export default function SearchResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryBar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
