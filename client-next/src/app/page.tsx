"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function RoleSelectionPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('ATHLETE');
  const router = useRouter();

  const handleLogin = () => {
    login(selectedRole as any);
    if (selectedRole === 'ATHLETE') {
      router.push('/athlete/checkin');
    } else if (selectedRole === 'COACH') {
      router.push('/coach');
    } else if (selectedRole === 'PARENT') {
      router.push('/parent');
    } else if (selectedRole === 'ADMIN') {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/30 flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6 lg:top-10 lg:right-10">
        <LanguageToggle />
      </div>
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-100 p-12 space-y-10 border border-slate-50">
        
        {/* Logo & Brand */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black text-blue-800 tracking-tight leading-tight">
              {t('sidebar.brand')}
            </h1>
            <p className="text-slate-400 font-bold text-sm">{t('home.system_name')}</p>
          </div>
        </div>

        {/* User Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-900 block px-1">
            {t('home.user_select_label')}
          </label>
          <div className="relative">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl appearance-none font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="ATHLETE">{t('home.roles.athlete')}</option>
              <option value="COACH">{t('home.roles.coach')}</option>
              <option value="PARENT">{t('home.roles.parent')}</option>
              <option value="ADMIN">{t('home.roles.admin')}</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-200 text-xl"
        >
          {t('home.login_btn')}
        </button>

        {/* Footer info */}
        <div className="text-center space-y-2">
          <p className="text-slate-400 font-bold text-xs">{t('home.demo_version')}</p>
          <p className="text-slate-300 text-[10px] leading-relaxed">
            {t('home.demo_desc')}
          </p>
        </div>
      </div>
    </div>
  );
}