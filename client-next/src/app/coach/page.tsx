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
  attendance: Array<{
    athlete: { user: { firstName: string; lastName: string } };
    status: string;
  }>;
}

export default function CoachDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking coach 2 (John Coach from seed)
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

  if (loading) return <div className="p-8 text-center text-slate-500">Loading sessions...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Coach Dashboard</h1>
          <p className="text-slate-500">Execute today's training sessions</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Today</span>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 italic">No assigned sessions for today.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg">{session.template.name}</h2>
                  <p className="text-slate-400 text-sm">
                    {session.attendance.length} Athlete(s) assigned
                  </p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Start Session
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Drill Sequence</h3>
                <div className="space-y-4">
                  {session.template.drills.map(td => (
                    <div key={td.order} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {td.order}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-slate-800">{td.drill.name}</h4>
                          <span className="text-blue-600 font-medium text-sm">{td.sets} Sets × {td.reps} Reps</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{td.drill.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Athletes</h3>
                <div className="flex gap-2 flex-wrap">
                  {session.attendance.map(a => (
                    <div key={a.athlete.user.firstName} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                      {a.athlete.user.firstName} {a.athlete.user.lastName[0]}.
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
