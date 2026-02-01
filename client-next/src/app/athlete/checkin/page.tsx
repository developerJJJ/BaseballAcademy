"use client";

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function CheckInPage() {
  const [selectedProgram, setSelectedProgram] = useState('elite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Mocking athlete 3 (Bobby)
      const res = await fetch('http://localhost:5000/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '3',
          'x-academy-id': '1',
          'x-user-role': 'ATHLETE'
        }
      });

      if (!res.ok) {
        throw new Error('Check-in failed. Please try again or contact a coach.');
      }

      const data = await res.json();
      // Redirect to athlete dashboard to see session
      router.push('/athlete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Check-in</h1>
        <p className="text-slate-500 mt-1">Start your training session today!</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Welcome, Bobby!</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>{currentTime}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="text-sm font-semibold text-slate-900">Select Program</div>
          
          <label 
            className={`
              flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selectedProgram === 'elite' 
                ? 'border-blue-600 bg-blue-50/50' 
                : 'border-slate-200 hover:border-slate-300'}
            `}
            onClick={() => setSelectedProgram('elite')}
          >
            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedProgram === 'elite' ? 'border-blue-600' : 'border-slate-300'}`}>
              {selectedProgram === 'elite' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </div>
            <div>
              <div className="font-bold text-slate-900">Elite Program</div>
              <div className="text-sm text-slate-500 mt-1">2 Hour Intensive Training</div>
            </div>
          </label>

          <label 
            className={`
              flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selectedProgram === 'beginner' 
                ? 'border-blue-600 bg-blue-50/50' 
                : 'border-slate-200 hover:border-slate-300'}
            `}
            onClick={() => setSelectedProgram('beginner')}
          >
            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedProgram === 'beginner' ? 'border-blue-600' : 'border-slate-300'}`}>
              {selectedProgram === 'beginner' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </div>
            <div>
              <div className="font-bold text-slate-900">Beginner Program</div>
              <div className="text-sm text-slate-500 mt-1">1.5 Hour Foundational Training</div>
            </div>
          </label>
        </div>

        <button 
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2"
        >
          {loading ? 'Checking in...' : 'Check-in Now'}
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        Made by Elite Baseball Academy
      </div>
    </div>
  );
}
