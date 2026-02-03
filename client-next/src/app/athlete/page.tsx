"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Clock, 
  Dumbbell, 
  Target, 
  Zap, 
  ChevronRight,
  PlayCircle,
  X,
  Timer,
  CheckCircle2,
  Undo2,
  PauseCircle
} from 'lucide-react';

interface Drill {
  id: number;
  order: number;
  sets: string;
  reps: string;
  rest: string;
  drillId: number;
  notes?: string;
  drill: {
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    category: string;
  };
}

interface Completion {
  drillId: number;
  completedAt: string;
}

interface Session {
  id: number;
  date: string;
  attendanceId: number;
  selectedProgram: string;
  completedDrills: Completion[];
  template: {
    name: string;
    duration: string;
    drills: Drill[];
  };
}

export default function AthleteDashboard() {
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [currentDateLabel, setCurrentDateLabel] = useState('');
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    fetchSessions();
    const now = new Date();
    setCurrentDateLabel(now.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }));
  }, [language]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const fetchSessions = () => {
    fetch('/api/sessions/athlete', {
      headers: {
        'x-user-id': '6',
        'x-academy-id': '1',
        'x-user-role': 'ATHLETE'
      }
    })
      .then(res => res.json())
      .then(data => {
        const adaptedData = data.map((s: any) => ({
          ...s,
          completedDrills: (s.completedDrillIds || []).map((id: number) => ({
            drillId: id,
            completedAt: new Date().toISOString()
          }))
        }));
        setSessions(adaptedData);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>;

  const todaySession = sessions.find(s => 
    new Date(s.date).toDateString() === new Date().toDateString()
  );

  const handleCompleteDrill = async (drillId: number) => {
    if (!todaySession) return;

    try {
      const res = await fetch('/api/sessions/complete-drill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '6',
          'x-academy-id': '1',
          'x-user-role': 'ATHLETE'
        },
        body: JSON.stringify({
          attendanceId: todaySession.attendanceId,
          drillId: drillId
        })
      });

      if (res.ok) {
        const now = new Date().toISOString();
        setSessions(prev => prev.map(s => {
          if (s.id === todaySession.id) {
            return {
              ...s,
              completedDrills: [...s.completedDrills, { drillId, completedAt: now }]
            };
          }
          return s;
        }));
        setSelectedDrill(null);
        setIsTimerRunning(false);
        setTimeLeft(null);
      }
    } catch (err) {
      console.error('Failed to complete drill:', err);
    }
  };

  const completedCount = todaySession?.completedDrills.length || 0;
  const totalCount = todaySession?.template.drills.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const getDurationLabel = (dur: string) => {
    const map: any = { 'MIN_120': '120분', 'MIN_90': '90분', 'MIN_75': '75분', 'MIN_60': '60분', 'MIN_45': '45분' };
    const enMap: any = { 'MIN_120': '120m', 'MIN_90': '90m', 'MIN_75': '75m', 'MIN_60': '60m', 'MIN_45': '45m' };
    return language === 'ko' ? (map[dur] || dur) : (enMap[dur] || dur);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 relative">
      <header className="px-4 pt-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('athlete.header_title')}</h1>
        <p className="text-slate-400 font-bold mt-1">{currentDateLabel}</p>
      </header>

      {todaySession ? (
        <div className="space-y-10">
          <section className="px-4 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">{t('athlete.overview_title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <OverviewCard icon={Clock} color="blue" label={t('athlete.total_time')} value={getDurationLabel(todaySession.template.duration)} />
              <OverviewCard icon={Dumbbell} color="green" label={t('athlete.drill_count')} value={language === 'ko' ? `${totalCount}개` : `${totalCount} Drills`} />
              <OverviewCard icon={Target} color="purple" label={t('athlete.program')} value={todaySession.selectedProgram === 'beginner' ? (language === 'ko' ? '비기너' : 'Beginner') : (language === 'ko' ? '엘리트' : 'Elite')} />
              <OverviewCard icon={Zap} color="orange" label={t('athlete.readiness')} value="79%" />
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-slate-400">{t('athlete.progress')}</span>
                <span className="text-sm font-black text-slate-900">{completedCount}/{totalCount} {language === 'ko' ? '완료' : 'Completed'}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-900 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </section>

          <section className="px-4 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">{t('athlete.drill_list')}</h2>
            <div className="grid gap-4">
              {todaySession.template.drills.map((td, index) => {
                const completion = todaySession.completedDrills.find(c => c.drillId === td.drillId);
                const isCompleted = !!completion;
                const completedTime = completion ? new Date(completion.completedAt).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '';

                const drillName = language === 'ko' ? td.drill.name : (td.drill.nameEn || td.drill.name);
                const drillDesc = language === 'ko' ? td.drill.description : (td.drill.descriptionEn || td.drill.description);

                return (
                  <button key={index} onClick={() => setSelectedDrill(td)} className={`bg-white p-8 rounded-[2rem] border transition-all group flex items-start gap-6 text-left w-full ${isCompleted ? 'border-green-200 bg-green-50/20' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${isCompleted ? 'border-green-500 bg-white' : 'border-slate-200 group-hover:border-blue-600'}`}>
                      {isCompleted ? <CheckCircle2 className="w-7 h-7 text-green-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-600"></div>}
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-slate-900">{index + 1}. {drillName}</h3>
                        <span className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-tighter bg-slate-100 text-slate-600">
                          {td.drill.category === 'THROWING' ? (language === 'ko' ? '타격' : 'Hit') : (language === 'ko' ? '웨이트' : 'Weight')}
                        </span>
                      </div>
                      <p className="text-slate-400 font-bold text-sm line-clamp-1">{drillDesc}</p>
                      <div className="flex gap-4 pt-1">
                        <div className="flex items-center gap-1.5 font-black text-slate-900"><FileTextIcon className="w-4 h-4 text-blue-600" /><span className="text-sm">{td.reps}{language === 'ko' ? '회' : 'r'} × {td.sets}{language === 'ko' ? '세트' : 's'}</span></div>
                        <div className="flex items-center gap-1.5 font-black text-slate-900"><TimerIcon className="w-4 h-4 text-blue-600" /><span className="text-sm">{language === 'ko' ? '휴식' : 'Rest'} {td.notes || '120'}{language === 'ko' ? '초' : 's'}</span></div>
                      </div>
                      {isCompleted && <div className="text-green-600 font-bold text-sm pt-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300"><span>✓</span><span>{completedTime} {language === 'ko' ? '완료' : 'Done'}</span></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <NoSessionPlaceholder text={t('athlete.no_session')} />
      )}

      {selectedDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 flex justify-between items-center bg-white border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900">{language === 'ko' ? selectedDrill.drill.name : (selectedDrill.drill.nameEn || selectedDrill.drill.name)}</h2>
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase">{selectedDrill.drill.category === 'THROWING' ? (language === 'ko' ? '타격 드릴' : 'Hitting Drill') : (language === 'ko' ? '웨이트 트레이닝' : 'Weight Training')}</span>
              </div>
              <button onClick={() => { setSelectedDrill(null); setTimeLeft(null); setIsTimerRunning(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto p-8 space-y-8">
              <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden relative group cursor-pointer shadow-lg">
                <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg" alt="Training Video" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center"><PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform" /></div>
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center"><span className="text-white font-black text-lg">Training Guide Video</span></div>
              </div>
              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">{t('athlete.key_points')}</h3>
                <div className="bg-blue-50/30 border border-blue-50 rounded-3xl p-6 space-y-3">
                  <KeyPoint index={1} text={language === 'ko' ? '투수 손 집중' : 'Focus on pitcher\'s hand'} /><KeyPoint index={2} text={language === 'ko' ? '스트라이크 존 판단' : 'Strike zone judgment'} /><KeyPoint index={3} text={language === 'ko' ? '강한 스윙' : 'Strong swing'} />
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">{t('athlete.training_info')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <DetailCard label={language === 'ko' ? '횟수' : 'Reps'} value={`${selectedDrill.reps}${language === 'ko' ? '회' : 'r'}`} color="blue" /><DetailCard label={language === 'ko' ? '세트' : 'Sets'} value={`${selectedDrill.sets}${language === 'ko' ? '세트' : 's'}`} color="green" /><DetailCard label={language === 'ko' ? '휴식' : 'Rest'} value={`${selectedDrill.notes || '120'}${language === 'ko' ? '초' : 's'}`} color="purple" />
                </div>
              </section>
              <div className="space-y-4">
                {timeLeft !== null ? (
                  <div className="w-full py-6 bg-blue-600 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-xl shadow-blue-200 animate-in zoom-in-95 duration-200">
                    <span className="text-white font-bold text-sm uppercase tracking-widest">{isTimerRunning ? (language === 'ko' ? '휴식 중...' : 'Resting...') : (language === 'ko' ? '일시정지됨' : 'Paused')}</span>
                    <span className="text-white font-black text-5xl font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    <div className="flex gap-4 pt-2">
                      <button onClick={toggleTimer} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">{isTimerRunning ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}</button>
                      <button onClick={() => { setTimeLeft(null); setIsTimerRunning(false); }} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"><Undo2 className="w-6 h-6" /></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startTimer(parseInt(selectedDrill.notes || '120'))} className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-600 font-black hover:bg-slate-50 transition-all"><Timer className="w-5 h-5" />{t('athlete.rest_timer_start')}</button>
                )}
              </div>
            </div>
            <div className="p-8 bg-white border-t border-slate-50 grid grid-cols-2 gap-4 shrink-0">
              <button onClick={() => { setSelectedDrill(null); setTimeLeft(null); setIsTimerRunning(false); }} className="py-4 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all">{t('athlete.do_later')}</button>
              <button onClick={() => handleCompleteDrill(selectedDrill.drillId)} className="py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"><CheckCircle2 className="w-5 h-5" />{t('athlete.mark_completed')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string }) {
  const styles: any = { blue: "bg-blue-50/50 border-blue-100 text-blue-600", green: "bg-green-50/50 border-green-100 text-green-600", purple: "bg-purple-50/50 border-purple-100 text-purple-600", orange: "bg-orange-50/50 border-orange-100 text-orange-600" };
  return (<div className={`${styles[color]} p-6 rounded-3xl border flex flex-col items-center text-center space-y-2`}><Icon className="w-6 h-6" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span><span className="text-xl font-black text-slate-900">{value}</span></div>);
}

function KeyPoint({ index, text }: { index: number, text: string }) {
  return (<div className="flex items-center gap-4"><div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">{index}</div><p className="font-bold text-slate-700">{text}</p></div>);
}

function DetailCard({ label, value, color }: { label: string, value: string, color: string }) {
  const colors: any = { blue: "bg-blue-50/50 text-blue-600", green: "bg-green-50/50 text-green-600", purple: "bg-purple-50/50 text-purple-600" };
  return (<div className={`${colors[color]} p-4 rounded-2xl flex flex-col items-center justify-center space-y-1`}><span className="text-[10px] font-bold text-slate-400">{label}</span><span className="text-lg font-black text-slate-900">{value}</span></div>);
}

function NoSessionPlaceholder({ text }: { text: string }) {
  return (<div className="px-4 py-20 text-center space-y-4"><div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl">🛌</div><p className="text-slate-400 font-bold text-xl">{text}</p></div>);
}

function FileTextIcon({ className }: { className?: string }) { return (<div className={`p-1 bg-slate-100 rounded-md ${className}`}><div className="w-full h-full border-t-2 border-l-2 border-current"></div></div>); }
function TimerIcon({ className }: { className?: string }) { return (<div className={`p-1 bg-slate-100 rounded-md flex items-center justify-center ${className}`}><div className="w-2 h-2 rounded-full border-2 border-current"></div></div>); }