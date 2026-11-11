import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, ScrollText, Database, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user, loading, signIn, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'History', path: '/history', icon: ScrollText },
    { name: 'Backup', path: '/backup', icon: Database },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 font-sans">
      <header className="bg-[#0B1F3A] text-white py-3 px-4 shadow-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-lg font-bold tracking-tight text-center">AL-DAHR Academy</h1>
          <p className="text-[10px] text-[#4DA3FF] text-center">Income & Expense Manager</p>
        </div>
        <div className="flex-1 flex justify-end">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] font-medium leading-none">{user.displayName}</span>
                <button onClick={logout} className="text-[9px] text-rose-400 hover:text-rose-300 transition-colors font-bold uppercase tracking-wider">Logout</button>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-[#4DA3FF]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#152e54] flex items-center justify-center border border-[#4DA3FF]">
                  <UserIcon className="w-4 h-4 text-[#4DA3FF]" />
                </div>
              )}
              <button onClick={logout} className="sm:hidden p-1.5 rounded-lg hover:bg-white/10 text-rose-400">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="flex items-center gap-1.5 bg-[#4DA3FF] hover:bg-[#3d8be0] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0B1F3A]">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Welcome to Management System</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">Please sign in with your Google account to access school data and manage finances.</p>
            </div>
            <button 
              onClick={signIn}
              className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#152e54] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full p-4 h-full">
            <Outlet />
          </div>
        )}
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
