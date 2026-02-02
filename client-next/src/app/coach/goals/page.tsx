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
    fetch('http://localhost:5000/api/goals', {
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
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
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
      ? `http://localhost:5000/api/goals/${editingGoal.id}` 
      : 'http://localhost:5000/api/goals';
    
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
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      <header className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">주간 목표 설정</h1>
          <p className="text-slate-400 font-bold mt-1">선수별 주간 목표를 설정하고 관리하세요</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-800 shadow-xl"
        >
          <Plus className="w-5 h-5" />
          새 목표 추가
        </button>
      </header>

      <div className="px-4 space-y-6">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-bold">로딩 중...</div>
        ) : (
          goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <div key={goal.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 relative hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-900">
                          {goal.athlete.user.firstName} {goal.athlete.user.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          goal.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {goal.status === 'COMPLETED' ? '완료' : '진행 중'}
                        </span>
                      </div>
                      <p className="text-slate-400 font-bold">{goal.goalType}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(goal)}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                      className={`h-full transition-all duration-1000 ${goal.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-blue-600'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl">
                  <p className="text-sm font-bold text-slate-500">{goal.memo || '메모가 없습니다'}</p>
                </div>
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