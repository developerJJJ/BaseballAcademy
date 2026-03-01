"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Target,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

export default function GoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    athleteId: '5', // Bobby as default for demo (AthleteProfile ID)
    goalType: '배트 스피드',
    targetValue: '',
    currentValue: '',
    memo: '',
    status: 'IN_PROGRESS'
  });
  const [formError, setFormError] = useState('');

  const fetchGoals = () => {
    setLoading(true);
    setFormError('');
    fetch('/api/goals', {
      headers: {
        'x-user-id': '5',
        'x-academy-id': '1',
        'x-user-role': 'COACH'
      }
    })
      .then(res => res.json())
      .then(data => {
        setGoals(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormData({
      athleteId: '5',
      goalType: '배트 스피드',
      targetValue: '',
      currentValue: '',
      memo: '',
      status: 'IN_PROGRESS'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      athleteId: goal.athleteId.toString(),
      goalType: goal.goalType,
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      memo: goal.memo || '',
      status: goal.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': '5',
          'x-academy-id': '1',
          'x-user-role': 'COACH'
        }
      });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSave = async () => {
    if (!formData.targetValue || !formData.currentValue) {
      setFormError('목표 수치와 현재 수치를 모두 입력해주세요.');
      return;
    }

    const url = editingGoal 
      ? `/api/goals/${editingGoal.id}` 
      : '/api/goals';
    
    const method = editingGoal ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '5',
          'x-academy-id': '1',
          'x-user-role': 'COACH'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchGoals();
      } else {
        const data = await res.json();
        setFormError(data.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setFormError('서버와의 통신에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-20 lg:pt-0 relative">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            주간 목표 <span className="text-blue-600">설정</span>
          </h1>
          <p className="text-slate-400 font-bold mt-1 text-sm lg:text-base">선수별 주간 목표를 설정하고 관리하세요</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-blue-100/50 group"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="whitespace-nowrap">새 목표 추가</span>
        </button>
      </header>

      <div className="px-6 space-y-8">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold italic">데이터를 불러오는 중...</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isCompleted = goal.status === 'COMPLETED';
            
            return (
              <div key={goal.id} className="group bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8 relative hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500 overflow-hidden">
                {/* Accent line */}
                <div className={`absolute top-0 left-0 w-2 h-full ${isCompleted ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner ${isCompleted ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      <Target className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                          {goal.athlete.user.firstName} {goal.athlete.user.lastName}
                        </h3>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          isCompleted ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-green-100 text-green-700'
                        }`}>
                          {isCompleted ? '완료됨' : '진행 중'}
                        </span>
                      </div>
                      <p className="text-slate-400 font-black text-xs uppercase tracking-widest mt-1">{goal.goalType}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleOpenEdit(goal)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span className="md:hidden">편집</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="md:hidden">삭제</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">목표 수치</span>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {goal.targetValue} 
                      <span className="text-base font-bold text-slate-400 ml-1.5">
                        {goal.goalType.includes('체중') ? 'kg' : 'mph'}
                      </span>
                    </p>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">현재 수치</span>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {goal.currentValue} 
                      <span className="text-base font-bold text-slate-400 ml-1.5">
                        {goal.goalType.includes('체중') ? 'kg' : 'mph'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">달성률</span>
                      <p className={`text-4xl font-black tracking-tighter ${isCompleted ? 'text-blue-600' : 'text-slate-900'}`}>{progress}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">상태</span>
                      <p className="text-sm font-black text-slate-900">{isCompleted ? 'GOAL REACHED' : 'ON TRACK'}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full p-1 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative ${isCompleted ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`} 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute top-0 right-0 w-2 h-full bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {goal.memo && (
                  <div className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-50 relative">
                    <div className="absolute top-4 left-6">
                      <svg className="w-6 h-6 text-blue-100 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H8.01703C6.91246 16 6.01703 16.8954 6.01703 18V21H4.01703V18C4.01703 15.7909 5.8079 14 8.01703 14H12.017C14.2262 14 16.017 15.7909 16.017 18V21H14.017Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic">" {goal.memo} "</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">{editingGoal ? '목표 수정' : '새 주간 목표 추가'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            {formError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">목표 유형</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none"
                  value={formData.goalType}
                  onChange={e => setFormData({...formData, goalType: e.target.value})}
                >
                  <option value="배트 스피드">배트 스피드</option>
                  <option value="구속">구속</option>
                  <option value="체중">체중</option>
                  <option value="근육량">근육량</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 px-1">목표 수치</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                    value={formData.targetValue}
                    onChange={e => setFormData({...formData, targetValue: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 px-1">현재 수치</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                    value={formData.currentValue}
                    onChange={e => setFormData({...formData, currentValue: e.target.value})}
                  />
                </div>
              </div>

              {editingGoal && (
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 px-1">상태</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="IN_PROGRESS">진행 중</option>
                    <option value="COMPLETED">완료</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">메모</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold h-32 focus:ring-2 ring-blue-500" 
                  value={formData.memo}
                  onChange={e => setFormData({...formData, memo: e.target.value})}
                  placeholder="목표에 대한 추가 설명이나 조언을 입력하세요" 
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200"
              >
                {editingGoal ? '수정 완료' : '추가'}
              </button>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}