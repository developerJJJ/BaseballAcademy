"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckInPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Navigation Step: 1 (Program), 2 (Condition)
  const [step, setStep] = useState(1);

  // Form State
  const [selectedProgram, setSelectedProgram] = useState<'elite' | 'beginner'>('elite');
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('good');
  const [fatigue, setFatigue] = useState(5);
  const [painAreas, setPainAreas] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Role Protection
  useEffect(() => {
    if (user && user.role !== 'ATHLETE') {
      const target = user.role === 'COACH' ? '/coach' : user.role === 'PARENT' ? '/parent' : '/admin';
      router.push(target);
    }
  }, [user, router]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }));
      setCurrentTime(now.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }));
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 10000);
    return () => clearInterval(timer);
  }, [language]);

  const toggleItem = (id: string, state: string[], setState: (val: string[]) => void) => {
    setState(state.includes(id) ? state.filter(i => i !== id) : [...state, id]);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const conditionScore = Math.ceil((11 - fatigue) / 2);
      
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '6',
          'x-academy-id': user?.academyId || '1',
          'x-user-role': user?.role || 'ATHLETE'
        },
        body: JSON.stringify({
          conditionScore,
          hasPain: painAreas.length > 0,
          painArea: painAreas.join(','),
          workedOutYesterday: activities.length > 0,
          activities: activities.join(','),
          program: selectedProgram,
          sleepHours,
          sleepQuality
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('common.error'));
      }
      router.push('/athlete');
    } catch (err: any) {
      setError(err.message || t('common.error'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const sleepQualityOptions = [
    { id: 'very_good', label: t('checkin.sleep_qualities.very_good') },
    { id: 'good', label: t('checkin.sleep_qualities.good') },
    { id: 'normal', label: t('checkin.sleep_qualities.normal') },
    { id: 'bad', label: t('checkin.sleep_qualities.bad') },
  ];

  const painAreaOptions = [
    { id: 'shoulder', label: t('checkin.pain_areas.shoulder') },
    { id: 'elbow', label: t('checkin.pain_areas.elbow') },
    { id: 'wrist', label: t('checkin.pain_areas.wrist') },
    { id: 'back', label: t('checkin.pain_areas.back') },
    { id: 'hip', label: t('checkin.pain_areas.hip') },
    { id: 'knee', label: t('checkin.pain_areas.knee') },
    { id: 'ankle', label: t('checkin.pain_areas.ankle') },
  ];

  const activityOptions = [
    { id: 'lower', label: t('checkin.activities.lower') },
    { id: 'pitching', label: t('checkin.activities.pitching') },
    { id: 'weight', label: t('checkin.activities.weight') },
  ];

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white">
      <header className="px-8 py-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 ? t('checkin.title') : "컨디션 체크"}
          </h1>
          <p className="text-slate-500 font-bold mt-1">
            {step === 1 ? t('checkin.subtitle') : "오늘의 컨디션을 정확히 입력해주세요"}
          </p>
        </div>
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            이전으로
          </button>
        )}
      </header>

      <main className="px-8 pb-12 space-y-10">
        {error && (
          <div className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* STEP 1: Program Selection (Screenshot 1) */}
        {step === 1 && (
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-10 space-y-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900">
                {t('checkin.welcome').replace('{name}', '김민수')}
              </h2>
              <div className="flex flex-col gap-3 text-slate-500 font-bold">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>{currentDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900">{t('checkin.select_program')}</h3>
              <div className="grid gap-3">
                <ProgramBtn 
                  active={selectedProgram === 'elite'} 
                  onClick={() => setSelectedProgram('elite')}
                  title={t('checkin.program_elite')}
                  desc={t('checkin.program_elite_desc')}
                />
                <ProgramBtn 
                  active={selectedProgram === 'beginner'} 
                  onClick={() => setSelectedProgram('beginner')}
                  title={t('checkin.program_beginner')}
                  desc={t('checkin.program_beginner_desc')}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-200 text-xl"
            >
              {t('checkin.submit_button')}
            </button>
          </section>
        )}

        {/* STEP 2: Condition Check (Screenshot 2 + image.png) */}
        {step === 2 && (
          <div className="space-y-10">
            {/* Sleep Condition */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 space-y-10">
              <h2 className="text-2xl font-black text-slate-900">{t('checkin.sleep_title')}</h2>
              <div className="space-y-6">
                <p className="text-lg font-black text-slate-900">{t('checkin.sleep_hours').replace('{hours}', sleepHours.toString())}</p>
                <input type="range" min="0" max="12" value={sleepHours} onChange={(e) => setSleepHours(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">{t('checkin.sleep_quality')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {sleepQualityOptions.map((o) => (
                    <button key={o.id} onClick={() => setSleepQuality(o.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${sleepQuality === o.id ? 'border-slate-900 bg-white shadow-md' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sleepQuality === o.id ? 'border-slate-900' : 'border-slate-200'}`}>{sleepQuality === o.id && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}</div>
                      <span className="font-bold">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Fatigue */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 space-y-10">
              <h2 className="text-2xl font-black text-slate-900">{t('checkin.fatigue')}</h2>
              <div className="space-y-6">
                <p className="text-lg font-black text-slate-900">{t('checkin.fatigue_desc').replace('{score}', fatigue.toString())}</p>
                <input type="range" min="1" max="10" value={fatigue} onChange={(e) => setFatigue(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs font-bold text-slate-400"><span>{t('checkin.fatigue_min')}</span><span>{t('checkin.fatigue_max')}</span></div>
              </div>
            </section>

            {/* Pain Area */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 space-y-8">
              <h2 className="text-2xl font-black text-slate-900">{t('checkin.pain_title')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {painAreaOptions.map((area) => (
                  <button key={area.id} onClick={() => toggleItem(area.id, painAreas, setPainAreas)} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${painAreas.includes(area.id) ? 'border-slate-900 bg-white shadow-md' : 'border-slate-50 bg-white text-slate-500'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${painAreas.includes(area.id) ? 'border-slate-900 bg-slate-900' : 'border-slate-200'}`}>
                      {painAreas.includes(area.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="font-bold">{area.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Yesterday Activity */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 space-y-8">
              <h2 className="text-2xl font-black text-slate-900">{t('checkin.yesterday_activity')}</h2>
              <div className="space-y-4">
                {activityOptions.map((act) => (
                  <button key={act.id} onClick={() => toggleItem(act.id, activities, setActivities)} className={`flex items-center gap-3 p-5 w-full rounded-xl border-2 transition-all ${activities.includes(act.id) ? 'border-slate-900 bg-white shadow-md' : 'border-slate-50 bg-white text-slate-500'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${activities.includes(act.id) ? 'border-slate-900 bg-slate-900' : 'border-slate-200'}`}>
                      {activities.includes(act.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="font-bold">{act.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="w-full py-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-slate-200 text-xl"
            >
              {loading ? t('checkin.processing') : t('checkin.submit_and_generate')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ProgramBtn({ active, onClick, title, desc }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${active ? 'border-slate-900 bg-white shadow-lg' : 'border-slate-50 bg-white text-slate-400 hover:border-slate-100'}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-slate-900' : 'border-slate-200'}`}>{active && <div className="w-3 h-3 rounded-full bg-slate-900" />}</div>
      <div>
        <div className="font-black text-slate-900">{title}</div>
        <div className="text-xs text-slate-400 font-bold mt-1">{desc}</div>
      </div>
    </button>
  );
}