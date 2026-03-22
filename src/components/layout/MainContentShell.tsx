'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

type MainContentShellProps = {
  children: React.ReactNode;
};

export function MainContentShell({ children }: MainContentShellProps) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith('/event/')
    || /^\/markets\/(trending|new)(?:\/|$)/.test(pathname);
  const showSidebar = !hideSidebar;

  return (
    <div className="flex-1 flex">
      {showSidebar && (
        <aside className="hidden lg:block sticky top-[6.5rem] h-[calc(100vh-6.5rem)] shrink-0">
          <Sidebar />
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {children}
        <Footer />
      </main>
    </div>
  );
}
