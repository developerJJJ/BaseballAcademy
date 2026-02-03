"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  PlayCircle,
  Timer,
  ChevronRight,
  Target,
  AlertCircle
} from 'lucide-react';

interface Drill {
  id: number;
  name: string;
  category: string;
  description: string;
  difficulty: number;
  baseReps: string;
  baseSets: string;
  baseRest: string;
  videoUrl?: string;
  cue1?: string;
  cue2?: string;
  cue3?: string;
}

export default function DrillsPage() {
  const { t } = useLanguage();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'THROWING',
    description: '',
    videoUrl: '',
    difficulty: '5',
    baseReps: '10',
    baseSets: '3',
    baseRest: '120',
    cue1: '',
    cue2: '',
    cue3: ''
  });
  const [formError, setFormError] = useState('');

  const fetchDrills = () => {
    setLoading(true);
    setFormError('');
    fetch('http://localhost:5000/api/drills', {
      headers: {
        'x-user-id': '5',
        'x-academy-id': '1',
        'x-user-role': 'COACH'
      }
    })
      .then(res => res.json())
      .then(data => {
        setDrills(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDrills();
  }, []);

  const handleOpenAdd = () => {
    setEditingDrill(null);
    setFormData({
      name: '',
      category: 'THROWING',
      description: '',
      videoUrl: '',
      difficulty: '5',
      baseReps: '10',
      baseSets: '3',
      baseRest: '120',
      cue1: '',
      cue2: '',
      cue3: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (drill: Drill) => {
    setEditingDrill(drill);
    setFormData({
      name: drill.name,
      category: drill.category,
      description: drill.description || '',
      videoUrl: drill.videoUrl || '',
      difficulty: drill.difficulty.toString(),
      baseReps: drill.baseReps || '10',
      baseSets: drill.baseSets || '3',
      baseRest: drill.baseRest || '120',
      cue1: drill.cue1 || '',
      cue2: drill.cue2 || '',
      cue3: drill.cue3 || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/drills/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': '5',
          'x-academy-id': '1',
          'x-user-role': 'COACH'
        }
      });
      if (res.ok) fetchDrills();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('드릴 이름을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('드릴 설명을 입력해주세요.');
      return;
    }

    const url = editingDrill 
      ? `http://localhost:5000/api/drills/${editingDrill.id}` 
      : 'http://localhost:5000/api/drills';
    
    const method = editingDrill ? 'PUT' : 'POST';

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
        fetchDrills();
      } else {
        const data = await res.json();
        setFormError(data.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setFormError('서버와의 통신에 실패했습니다.');
    }
  };

  const categories = Array.from(new Set(drills.map(d => d.category)));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      <header className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">드릴 템플릿 관리</h1>
          <p className="text-slate-400 font-bold mt-1">훈련 드릴을 추가하고 관리하세요</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          새 드릴 추가
        </button>
      </header>

      <div className="space-y-12">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-bold">로딩 중...</div>
        ) : (
          categories.map(cat => (
            <section key={cat} className="px-4 space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">{cat === 'THROWING' ? '타격' : cat === 'CONDITIONING' ? '웨이트' : cat}</h2>
                <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-xs font-black">
                  {drills.filter(d => d.category === cat).length}개
                </span>
              </div>
              
              <div className="grid gap-4">
                {drills.filter(d => d.category === cat).map(drill => (
                  <div key={drill.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900">{drill.name}</h3>
                      <p className="text-slate-400 font-bold text-sm">{drill.description}</p>
                      <div className="flex gap-6 pt-2">
                        <DrillMeta icon={PlayCircle} label={`${drill.baseReps || '10'}회 × ${drill.baseSets || '3'}세트`} />
                        <DrillMeta icon={Timer} label={`휴식 ${drill.baseRest || '120'}초`} />
                        <DrillMeta icon={Target} label={`난이도 ${drill.difficulty}/10`} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(drill)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(drill.id)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Add/Edit Drill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 flex justify-between items-center bg-white border-b border-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">{editingDrill ? '드릴 수정' : '새 드릴 추가'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto p-8 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">드릴 이름</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-blue-500" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="예: 티 배팅 드릴" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">카테고리</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="THROWING">타격</option>
                  <option value="MOVEMENT">움직임</option>
                  <option value="CONDITIONING">웨이트</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">설명</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold h-32 focus:ring-2 ring-blue-500" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="드릴에 대한 설명을 입력하세요" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">영상 URL (YouTube 임베드 링크)</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-blue-500" 
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://www.youtube.com/embed/..." 
                />
              </div>

              {/* Key Points Section matching Screenshot 9 */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <label className="text-sm font-black text-slate-900 px-1">핵심 포인트 (큐)</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">1</span>
                    <input 
                      className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                      value={formData.cue1}
                      onChange={e => setFormData({...formData, cue1: e.target.value})}
                      placeholder="포인트 1" 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">2</span>
                    <input 
                      className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                      value={formData.cue2}
                      onChange={e => setFormData({...formData, cue2: e.target.value})}
                      placeholder="포인트 2" 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">3</span>
                    <input 
                      className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                      value={formData.cue3}
                      onChange={e => setFormData({...formData, cue3: e.target.value})}
                      placeholder="포인트 3" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 px-1">기본 횟수</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                    value={formData.baseReps}
                    onChange={e => setFormData({...formData, baseReps: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 px-1">기본 세트</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                    value={formData.baseSets}
                    onChange={e => setFormData({...formData, baseSets: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 px-1">휴식 (초)</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                    value={formData.baseRest}
                    onChange={e => setFormData({...formData, baseRest: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">난이도 (1-10)</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" 
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value})}
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-50 shrink-0">
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrillMeta({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-900 font-black">
      <Icon className="w-4 h-4 text-blue-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
