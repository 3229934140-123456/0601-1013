import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils/format';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-20' : 'ml-60'
        )}
      >
        <Header />
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
