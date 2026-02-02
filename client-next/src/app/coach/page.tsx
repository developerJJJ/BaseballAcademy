"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  X,
  CheckCircle2,
  Calendar,
  Zap,
  BookOpen
} from 'lucide-react';

interface AthleteStatus {
  id: number;
  name: string;
  program: string;
  age: number;
  progress: number;
  status: 'training' | 'not-checked-in' | 'completed';
  attendanceId: number;
  sleepHours?: number;
  fatigue?: number;
  drills: any[];
  completedDrillIds: number[];
}

export default function CoachDashboard() {
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteStatus | null>(null);
  const [currentDateLabel, setCurrentDateLabel] = useState('');
  
  const [activeWorkoutType, setActiveWorkoutType] = useState('A_LOWER');
  const [activeDuration, setActiveDuration] = useState('MIN_60');

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sessions/coach', {
        headers: {
          'x-user-id': '5',
          'x-academy-id': '1',
          'x-user-role': 'COACH'
        }
      });
      const data = await res.json();
      setSessions(data);
      
      if (data.length > 0) {
        setActiveWorkoutType(data[0].template.workoutType);
        setActiveDuration(data[0].template.duration);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const now = new Date();
    setCurrentDateLabel(now.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }));
  }, [language]);

  const handleSessionUpdate = async (type: string, dur: string) => {
    if (sessions.length === 0) return;
    
    // Optimistic UI update
    setActiveWorkoutType(type);
    setActiveDuration(dur);

    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${sessions[0].id}/setup`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '5',
          'x-academy-id': '1',
          'x-user-role': 'COACH'
        },
        body: JSON.stringify({ workoutType: type, duration: dur })
      });

      if (res.ok) {
        fetchData(); // Refresh to get the new drills
      } else {
        const err = await res.json();
        alert(err.error || '설정 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Map real data to the UI structure
  const athleteStats: AthleteStatus[] = sessions.flatMap(s => s.attendance.map((att: any) => ({
    id: att.athlete.id,
    name: `${att.athlete.user.firstName} ${att.athlete.user.lastName}`,
    program: s.template.name.split('_')[0],
    age: 16,
    progress: s.template.drills.length > 0 ? Math.round((att.drillCompletions?.length || 0) / s.template.drills.length * 100) : 0,
    status: att.status === 'PRESENT' ? 'training' : 'not-checked-in',
    attendanceId: att.id,
    sleepHours: att.sleepHours,
    fatigue: 11 - (att.conditionScore * 2), // Reverse map 1-5 to 1-10 fatigue roughly
    drills: s.template.drills,
    completedDrillIds: att.drillCompletions?.map((c: any) => c.drillId) || []
  })));

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">{t('common.loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      <header className="flex justify-between items-end px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">코치 대시보드</h1>
          <p className="text-slate-400 font-bold mt-1">{currentDateLabel}</p>
        </div>
      </header>

      {/* Session Menu Setup Section (Requirement D) */}
      <section className="px-4">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">오늘의 훈련 설정 (세션 메뉴)</h2>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black">
              <Zap className="w-3 h-3" />
              AI 추천 적용 중
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">워크아웃 메뉴</p>
              <div className="grid grid-cols-2 gap-3">
                <WorkoutTypeBtn active={activeWorkoutType === 'A_LOWER'} onClick={() => handleSessionUpdate('A_LOWER', activeDuration)} label="A: 하체 & 파워" desc="Lower Strength/Power" color="blue" />
                <WorkoutTypeBtn active={activeWorkoutType === 'B_UPPER'} onClick={() => handleSessionUpdate('B_UPPER', activeDuration)} label="B: 상체 & 안정성" desc="Upper/Shoulder/Scap" color="green" />
                <WorkoutTypeBtn active={activeWorkoutType === 'C_SPEED'} onClick={() => handleSessionUpdate('C_SPEED', activeDuration)} label="C: 스피드 & 민첩성" desc="Speed/Plyo/Agility" color="yellow" />
                <WorkoutTypeBtn active={activeWorkoutType === 'D_RECOVERY'} onClick={() => handleSessionUpdate('D_RECOVERY', activeDuration)} label="D: 회복 & 가동성" desc="Recovery/Mobility" color="purple" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">훈련 시간 설정</p>
              <div className="grid grid-cols-2 gap-3">
                <DurationBtn active={activeDuration === 'MIN_45'} onClick={() => handleSessionUpdate(activeWorkoutType, 'MIN_45')} label="45분" />
                <DurationBtn active={activeDuration === 'MIN_60'} onClick={() => handleSessionUpdate(activeWorkoutType, 'MIN_60')} label="60분 (표준)" />
                <DurationBtn active={activeDuration === 'MIN_75'} onClick={() => handleSessionUpdate(activeWorkoutType, 'MIN_75')} label="75분" />
                <DurationBtn active={activeDuration === 'MIN_120'} onClick={() => handleSessionUpdate(activeWorkoutType, 'MIN_120')} label="120분 (엘리트)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <SummaryCard label="오늘 출석" value={athleteStats.filter(a => a.status === 'training').length.toString()} icon={Users} color="blue" />
        <SummaryCard label="훈련 중" value={athleteStats.filter(a => a.status === 'training' && a.progress < 100).length.toString()} icon={Clock} color="green" />
        <SummaryCard label="경고 알림" value="0" icon={AlertCircle} color="red" />
      </section>

      {/* Athlete Status List */}
      <section className="px-4">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="p-10 space-y-8">
            <h2 className="text-2xl font-black text-slate-900">선수 현황</h2>
            
            <div className="space-y-4">
              {athleteStats.map((athlete) => (
                <button 
                  key={athlete.id}
                  onClick={() => setSelectedAthlete(athlete)}
                  className="bg-white w-full p-6 rounded-3xl border border-slate-50 hover:border-blue-100 transition-all flex items-center gap-6 text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl group-hover:scale-105 transition-transform">
                    {athlete.name.substring(0, 1)}
                  </div>
                  
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{athlete.name}</h3>
                      <p className="text-sm text-slate-400 font-bold">{athlete.program} · {athlete.age}세</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">진행률</span>
                        <span className="text-[10px] font-black text-slate-900">{athlete.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-900 h-full transition-all duration-1000" 
                          style={{ width: `${athlete.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                        athlete.status === 'training' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {athlete.status === 'training' ? '훈련 중' : '미출석'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {athleteStats.length === 0 && (
                <div className="py-20 text-center text-slate-400 font-bold italic">출석한 선수가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Athlete Detail Modal */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 flex justify-between items-center bg-white border-b border-slate-50 shrink-0">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">{selectedAthlete.name} 선수 상세 정보</h2>
                <div className="flex gap-4 text-sm font-bold text-slate-400">
                  <span>나이: <span className="text-slate-900">{selectedAthlete.age}세</span></span>
                  <span>프로그램: <span className="text-blue-600">{selectedAthlete.program}</span></span>
                </div>
              </div>
              <button onClick={() => setSelectedAthlete(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="overflow-y-auto p-8 space-y-10">
              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">오늘 컨디션</h3>
                <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">수면 시간</span>
                    <span className="font-black text-slate-900 text-lg">{selectedAthlete.sleepHours || '--'}시간</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">피로도</span>
                    <span className="font-black text-slate-900 text-lg">{selectedAthlete.fatigue || '--'}/10</span>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">오늘 플레이북</h3>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900">진행도: {selectedAthlete.progress}%</span>
                    <span className="text-sm font-bold text-slate-400">{selectedAthlete.completedDrillIds.length}/{selectedAthlete.drills.length} 완료</span>
                  </div>
                  <div className="space-y-3 pt-2">
                    {selectedAthlete.drills.map((td: any, i: number) => (
                      <AthleteDrillItem 
                        key={i} 
                        text={`${i+1}. ${td.drill.name}`} 
                        completed={selectedAthlete.completedDrillIds.includes(td.drillId)} 
                      />
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AthleteDrillItem({ text, completed }: { text: string, completed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${completed ? 'bg-green-100 border-green-500 text-green-600' : 'border-slate-200'}`}>
        {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
      </div>
      <span className={`text-sm font-bold ${completed ? 'text-green-700' : 'text-slate-400'}`}>{text}</span>
    </div>
  );
}

function WorkoutTypeBtn({ active, onClick, label, desc, color }: any) {
  const colors: any = {
    blue: "border-blue-600 bg-blue-50 text-blue-700",
    green: "border-green-600 bg-green-50 text-green-700",
    yellow: "border-yellow-500 bg-yellow-50 text-yellow-700",
    purple: "border-purple-600 bg-purple-50 text-purple-700"
  };
  return (
    <button onClick={onClick} className={`p-5 rounded-3xl border-2 transition-all text-left space-y-1 ${active ? colors[color] : 'border-slate-50 bg-white text-slate-400 hover:border-slate-200'}`}>
      <p className="font-black text-lg leading-tight">{label}</p>
      <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">{desc}</p>
    </button>
  );
}

function DurationBtn({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl border-2 font-black transition-all ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-50 bg-white text-slate-400 hover:border-slate-200'}`}>
      {label}
    </button>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  const styles: any = { blue: "text-blue-600", green: "text-green-600", red: "text-red-600" };
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-4xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`p-4 rounded-3xl bg-slate-50 group-hover:scale-110 transition-transform ${styles[color]}`}>
        <Icon className="w-10 h-10" />
      </div>
    </div>
  );
}
