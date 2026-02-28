"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Target } from 'lucide-react';

export default function AthleteGoalsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/goals/mine', {
            headers: {
                'x-user-id': user?.id || '6',
                'x-academy-id': user?.academyId || '1',
                'x-user-role': user?.role || 'ATHLETE'
            }
        })
            .then(res => res.json())
            .then(data => {
                setGoals(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 pt-20 lg:pt-0 relative">
            <header className="px-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">나의 주간 목표</h1>
                <p className="text-slate-400 font-bold mt-1">코치가 설정한 이번 주 목표를 확인하세요</p>
            </header>

            <div className="px-4 space-y-6">
                {loading ? (
                    <div className="p-20 text-center text-slate-400 font-bold">로딩 중...</div>
                ) : goals.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <Target className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold text-xl">아직 설정된 목표가 없습니다</p>
                        <p className="text-slate-300 font-bold text-sm">코치가 목표를 설정하면 여기에 표시됩니다</p>
                    </div>
                ) : (
                    goals.map((goal: any) => {
                        const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                        return (
                            <div key={goal.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-slate-900">{goal.goalType}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${goal.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {goal.status === 'COMPLETED' ? '완료' : '진행 중'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">목표</span>
                                        <p className="text-2xl font-black text-slate-900">{goal.targetValue} {goal.goalType.includes('체중') ? 'kg' : 'mph'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">현재</span>
                                        <p className="text-2xl font-black text-slate-900">{goal.currentValue} {goal.goalType.includes('체중') ? 'kg' : 'mph'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">진행률</span>
                                        <span className="text-xs font-black text-blue-600">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {goal.memo && (
                                    <div className="bg-slate-50 p-5 rounded-2xl">
                                        <p className="text-sm font-bold text-slate-500">{goal.memo}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
