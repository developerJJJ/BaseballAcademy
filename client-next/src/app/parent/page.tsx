"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, BookOpen, Target, ChevronDown } from 'lucide-react';

export default function ParentDashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetch('http://localhost:5000/api/parent/children', {
      headers: {
        'x-user-id': user.id, 
        'x-academy-id': user.academyId,
        'x-user-role': 'PARENT'
      }
    })
      .then(res => res.json())
      .then(data => {
        setChildren(data);
        if (data.length > 0) setSelectedChild(data[0]);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">{t('common.loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="px-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('parent.title')}</h1>
        <p className="text-slate-400 font-bold mt-1">{t('parent.subtitle')}</p>
      </header>

      {/* Child Selector */}
      <section className="px-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black text-slate-900">{t('parent.child_select')}</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
              {selectedChild?.name || t('parent.no_child')} ({selectedChild?.age || '--'}{t('parent.age_suffix')})
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <SummaryCard 
          label={t('parent.attendance_rate')} 
          value={`${selectedChild?.stats.attendanceRate || 0}%`} 
          icon={Calendar} 
          color="blue" 
        />
        <SummaryCard 
          label={t('parent.total_time')} 
          value={`${selectedChild?.stats.totalTime || 0}${t('parent.unit_min')}`} 
          icon={Clock} 
          color="green" 
        />
        <SummaryCard 
          label={t('parent.completed_drills')} 
          value={`${selectedChild?.stats.completedDrills || 0}${t('parent.unit_count')}`} 
          icon={BookOpen} 
          color="purple" 
        />
        <SummaryCard 
          label={t('parent.completion_rate')} 
          value={`${selectedChild?.stats.completionRate || 0}%`} 
          icon={Target} 
          color="orange" 
        />
      </section>

      {/* Attendance Status */}
      <section className="px-4">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="p-10 space-y-8">
            <h2 className="text-2xl font-black text-slate-900">{t('parent.history_title')}</h2>
            
            <div className="space-y-3">
              {selectedChild?.history.map((record: any, i: number) => (
                <AttendanceRow 
                  key={i}
                  day={new Date(record.date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'long' })} 
                  date={new Date(record.date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', { month: 'numeric', day: 'numeric' })} 
                  status={record.status === 'PRESENT' ? t('parent.status_present') : t('parent.status_absent')} 
                />
              ))}
              {(!selectedChild || selectedChild.history.length === 0) && (
                <div className="py-10 text-center text-slate-400 font-bold">{t('parent.no_history')}</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  const styles: any = {
    blue: "text-blue-600 bg-blue-50/50",
    green: "text-green-600 bg-green-50/50",
    purple: "text-purple-600 bg-purple-50/50",
    orange: "text-orange-600 bg-orange-50/50"
  };
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group transition-all hover:shadow-md">
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${styles[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  );
}

function AttendanceRow({ day, date, status }: { day: string, date: string, status: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-50 transition-all hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <span className="font-black text-slate-900">{day} ({date})</span>
      </div>
      <span className={`text-sm font-black ${status === t('parent.status_present') ? 'text-blue-600' : 'text-slate-400'}`}>{status}</span>
    </div>
  );
}