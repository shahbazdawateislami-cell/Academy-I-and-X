import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, ScrollText, Database } from 'lucide-react';
import { cn } from '../utils';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'History', path: '/history', icon: ScrollText },
    { name: 'Backup', path: '/backup', icon: Database },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 font-sans">
      <header className="bg-[#0B1F3A] text-white py-4 px-6 shadow-md sticky top-0 z-20">
        <h1 className="text-xl font-bold tracking-tight text-center">AL-DAHR Academy</h1>
        <p className="text-xs text-[#4DA3FF] text-center mt-0.5">Income & Expense Manager</p>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-3xl mx-auto w-full p-4 h-full">
          <Outlet />
        </div>
      </main>

      <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full z-20 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  isActive ? 'text-[#0B1F3A]' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
