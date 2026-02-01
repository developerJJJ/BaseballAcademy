"use client";

import { useEffect, useState } from 'react';

interface Session {
  id: number;
  date: string;
  template: {
    name: string;
    drills: Array<{
      order: number;
      sets: string;
      reps: string;
      drill: { name: string; description: string };
    }>;
  };
}

export default function AthleteDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking athlete 3 (Bobby Ballplayer from seed)
    fetch('http://localhost:5000/api/sessions/athlete', {
      headers: {
        'x-user-id': '3',
        'x-academy-id': '1',
        'x-user-role': 'ATHLETE'
      }
    })
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your training...</div>;

  const todaySession = sessions.find(s => 
    new Date(s.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">My Training</h1>
        <p className="text-slate-500">Focus on the process, result will follow</p>
      </header>

      {todaySession ? (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Today's Session</h2>
            <h3 className="text-2xl font-bold mt-1">{todaySession.template.name}</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {todaySession.template.drills.map(td => (
                <div key={td.order} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:scale-[1.01] hover:shadow-sm">
                  <div className="w-12 h-12 flex-shrink-0 bg-white border-2 border-blue-200 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-blue-400 leading-none">Sets</span>
                    <span className="text-lg font-bold text-slate-800 leading-tight">{td.sets}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-900">{td.drill.name}</h4>
                    <p className="text-sm text-slate-500">{td.reps} reps per set</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 p-4 text-center">
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              Mark as Completed
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-slate-400">No training scheduled for today. Rest and recover!</p>
        </div>
      )}

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Training History</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-12 text-center text-slate-400 italic">
             Coming soon: Your progress charts and attendance logs.
           </div>
        </div>
      </section>
    </div>
  );
}
