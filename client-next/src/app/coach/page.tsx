"use client";

import { useEffect, useState } from 'react';

// Enums matching backend
enum WorkoutType {
  A_LOWER = "A_LOWER",
  B_UPPER = "B_UPPER",
  C_SPEED = "C_SPEED",
  D_RECOVERY = "D_RECOVERY"
}

interface Session {
  id: number;
  date: string;
  template: {
    name: string;
    workoutType: WorkoutType;
    drills: Array<{
      order: number;
      sets: string;
      reps: string;
      drill: { name: string; description: string; category: string };
    }>;
  };
  attendance: Array<{
    athlete: { id: number; user: { firstName: string; lastName: string } };
    status: string;
    conditionScore: number | null;
    hasPain: boolean;
    isForcedToD: boolean;
  }>;
}

export default function CoachDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  // Mock checking in an athlete
  const [checkInState, setCheckInState] = useState<Record<number, { condition: number; pain: boolean }>>({});

  useEffect(() => {
    fetch('http://localhost:5000/api/sessions/coach', {
      headers: {
        'x-user-id': '2',
        'x-academy-id': '1',
        'x-user-role': 'COACH'
      }
    })
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const getWorkoutBadge = (type: WorkoutType) => {
    switch (type) {
      case WorkoutType.A_LOWER: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">TYPE A: LOWER</span>;
      case WorkoutType.B_UPPER: return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">TYPE B: UPPER</span>;
      case WorkoutType.C_SPEED: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">TYPE C: SPEED</span>;
      case WorkoutType.D_RECOVERY: return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">TYPE D: RECOVERY</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">UNKNOWN</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Academy Operations...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coach Ops Center</h1>
          <p className="text-slate-500 font-medium">Daily Execution & Safety Checks</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Date</span>
          <p className="text-xl font-bold text-slate-800 font-mono">{new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💤</div>
          <p className="text-slate-400 italic font-medium">No sessions scheduled. System is idle.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {sessions.map(session => (
            <div key={session.id} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transition-all">
              {/* Session Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex gap-3 items-center">
                    <h2 className="font-bold text-xl">{session.template.name}</h2>
                    {getWorkoutBadge(session.template.workoutType)}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    {session.attendance.length} Athletes • Est. 60 Mins
                  </p>
                </div>
                <button 
                  onClick={() => setActiveSessionId(activeSessionId === session.id ? null : session.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${
                    activeSessionId === session.id 
                    ? 'bg-slate-700 text-slate-200 shadow-inner' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                  }`}
                >
                  {activeSessionId === session.id ? 'Close View' : 'Manage Session'}
                </button>
              </div>

              {/* Active Session View */}
              {activeSessionId === session.id && (
                <div className="divide-y divide-slate-100">
                  
                  {/* Safety Check Module */}
                  <div className="p-6 bg-slate-50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Step 1: 10-Second Safety Check
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {session.attendance.map((att) => {
                        const state = checkInState[att.athlete.id] || { condition: 3, pain: false };
                        const isForcedD = state.condition === 1 || state.pain;

                        return (
                          <div key={att.athlete.id} className={`p-4 rounded-xl border-2 transition-all ${isForcedD ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-slate-900">{att.athlete.user.firstName} {att.athlete.user.lastName}</span>
                              {isForcedD && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Force Type D</span>}
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Condition (1-5)</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(score => (
                                    <button
                                      key={score}
                                      onClick={() => setCheckInState(prev => ({
                                        ...prev,
                                        [att.athlete.id]: { ...state, condition: score }
                                      }))}
                                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                        state.condition === score 
                                        ? (score < 3 ? 'bg-red-500 text-white' : 'bg-green-500 text-white') 
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      {score}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                                <span className="text-xs font-bold text-slate-500">Pain/Issue?</span>
                                <button
                                  onClick={() => setCheckInState(prev => ({
                                    ...prev,
                                    [att.athlete.id]: { ...state, pain: !state.pain }
                                  }))}
                                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                    state.pain ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  {state.pain ? 'YES' : 'NO'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drill Sequence */}
                  <div className="p-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       Step 2: Execution Sequence
                    </h3>
                    <div className="space-y-3">
                      {session.template.drills.map((td, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <div className="flex-grow">
                             <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800">{td.drill.name}</h4>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">{td.drill.category}</span>
                             </div>
                             <p className="text-sm text-slate-500 mt-1 line-clamp-1">{td.drill.description}</p>
                          </div>
                          <div className="text-right pl-4 border-l border-slate-100">
                             <div className="text-lg font-black text-slate-900">{td.sets} <span className="text-xs font-medium text-slate-400">SETS</span></div>
                             <div className="text-sm font-bold text-blue-600">{td.reps} <span className="text-xs font-medium text-blue-300">REPS</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
