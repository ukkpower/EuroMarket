import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] shrink-0">
          <Sidebar />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}

