"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Shield, 
  ClipboardList, 
  LogOut, 
  Menu, 
  BookOpen, 
  Target, 
  CheckCircle2,
  Users,
  BarChart3,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const athleteItems = [
    { name: t('sidebar.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('sidebar.checkin'), href: '/athlete/checkin', icon: CheckCircle2 },
    { name: t('sidebar.playbook'), href: '/athlete', icon: BookOpen },
    { name: t('sidebar.weekly_goals'), href: '#', icon: Target },
  ];

  const coachItems = [
    { name: t('sidebar.dashboard'), href: '/coach', icon: LayoutDashboard },
    { name: t('sidebar.player_management'), href: '/coach', icon: Users },
    { name: t('sidebar.drill_templates'), href: '/coach/drills', icon: FileText },
    { name: t('sidebar.weekly_goal_setting'), href: '/coach/goals', icon: Target },
    { name: t('sidebar.rapsodo_data'), href: '/coach/rapsodo', icon: BarChart3 },
  ];

  const parentItems = [
    { name: t('sidebar.dashboard'), href: '/parent', icon: LayoutDashboard },
  ];

  const adminItems = [
    { name: t('sidebar.dashboard'), href: '/admin', icon: LayoutDashboard },
    ...coachItems.slice(1),
  ];

  let navItems = athleteItems;
  let displayRole = "선수";

  if (user?.role === 'COACH') {
    navItems = coachItems;
    displayRole = "코치";
  } else if (user?.role === 'PARENT') {
    navItems = parentItems;
    displayRole = "학부모";
  } else if (user?.role === 'ADMIN') {
    navItems = adminItems;
    displayRole = "관리자";
  }

  if (pathname === '/') return null;

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-50 px-4 flex items-center justify-between shadow-sm">
        <button 
          className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-blue-700 tracking-tighter uppercase">Baseball Academy</span>
          <span className="text-[10px] font-bold text-slate-400">{user?.name || "사용자"} ({displayRole})</span>
        </div>

        <LanguageToggle />
      </header>

      {/* Backdrop for Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-30 animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed top-16 lg:top-0 left-0 z-40 h-[calc(100vh-4rem)] lg:h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo - Only visible on desktop now */}
        <div className="p-8 border-b border-slate-50 hidden lg:block">
          <Link href="/" className="flex flex-col gap-1 items-start hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-black text-blue-700 tracking-tight leading-tight">
              {t('sidebar.brand').split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h1>
            <p className="text-sm text-slate-400 font-bold mt-1">{user?.name || "사용자"} ({displayRole})</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 lg:py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl text-md font-bold transition-all
                  ${isActive 
                    ? 'bg-slate-50 text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-slate-50">
          <Link 
            href="/" 
            onClick={logout}
            className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('sidebar.logout')}
          </Link>
        </div>
      </aside>
    </>
  );
}
