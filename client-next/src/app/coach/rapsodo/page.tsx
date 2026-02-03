"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Target,
  ChevronDown,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

export default function RapsodoPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    athleteId: '5', // Bobby default (AthleteProfile ID)
    batSpeed: '',
    exitVelocity: '',
    launchAngle: '',
    distance: '',
    attackAngle: '',
    contactTime: '',
    memo: ''
  });
  const [formError, setFormError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setFormError('');
    fetch('/api/rapsodo', {
      headers: {
        'x-user-id': '5',
        'x-academy-id': '1',
        'x-user-role': 'COACH'
      }
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormData({
      athleteId: '5',
      batSpeed: '',
      exitVelocity: '',
      launchAngle: '',
      distance: '',
      attackAngle: '',
      contactTime: '',
      memo: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      athleteId: entry.athleteId.toString(),
      batSpeed: entry.batSpeed?.toString() || '',
      exitVelocity: entry.exitVelocity?.toString() || '',
      launchAngle: entry.launchAngle?.toString() || '',
      distance: entry.distance?.toString() || '',
      attackAngle: entry.attackAngle?.toString() || '',
      contactTime: entry.contactTime?.toString() || '',
      memo: entry.memo || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/rapsodo/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': '5',
          'x-academy-id': '1',
          'x-user-role': 'COACH'
        }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSave = async () => {
    // Basic validation: ensure at least some metrics are filled
    if (!formData.batSpeed || !formData.exitVelocity || !formData.launchAngle || !formData.distance || !formData.attackAngle || !formData.contactTime) {
      setFormError('6가지 핵심 지표를 모두 입력해주세요.');
      return;
    }

    const url = editingEntry 
      ? `/api/rapsodo/${editingEntry.id}` 
      : '/api/rapsodo';
    
    const method = editingEntry ? 'PUT' : 'POST';

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
        fetchData();
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || '저장 중 오류가 발생했습니다.');
        console.error('Save failed. Status:', res.status);
        console.error('Error details:', JSON.stringify(errorData, null, 2));
      }
    } catch (err) {
      console.error('Network or parsing error:', err);
      setFormError('서버와의 통신에 실패했습니다.');
    }
  };

  // Helper to calculate trend (simple mock implementation based on index)
  const getTrend = (idx: number, key: string, currentVal: number) => {
    if (idx === data.length - 1) return { val: '0.0%', up: true };
    const prevVal = data[idx + 1][key];
    if (!prevVal || !currentVal) return { val: '0.0%', up: true };
    const diff = ((currentVal - prevVal) / prevVal) * 100;
    return { 
      val: (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%', 
      up: diff >= 0 
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      <header className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">랩소도 데이터 관리</h1>
          <p className="text-slate-400 font-bold mt-1">선수별 타격 데이터를 기록하고 분석하세요</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-800 shadow-xl"
        >
          <Plus className="w-5 h-5" />
          새 데이터 추가
        </button>
      </header>

      <section className="px-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black text-slate-900">선수 선택:</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
              김민수 (16세)
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="px-4 space-y-8">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-bold">로딩 중...</div>
        ) : (
          data.map((entry, idx) => (
            <div key={entry.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 relative hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-black text-slate-900">{new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, '')}.</h3>
                  {idx === 0 && <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black uppercase">최신</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(entry)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(entry.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DataCard label="배트 스피드" value={`${entry.batSpeed} mph`} trend={getTrend(idx, 'batSpeed', entry.batSpeed).val} isUp={getTrend(idx, 'batSpeed', entry.batSpeed).up} />
                <DataCard label="타구 속도" value={`${entry.exitVelocity} mph`} trend={getTrend(idx, 'exitVelocity', entry.exitVelocity).val} isUp={getTrend(idx, 'exitVelocity', entry.exitVelocity).up} />
                <DataCard label="발사각" value={`${entry.launchAngle}°`} trend={getTrend(idx, 'launchAngle', entry.launchAngle).val} isUp={getTrend(idx, 'launchAngle', entry.launchAngle).up} />
                <DataCard label="비거리" value={`${entry.distance} ft`} trend={getTrend(idx, 'distance', entry.distance).val} isUp={getTrend(idx, 'distance', entry.distance).up} />
                <DataCard label="어택 앵글" value={`${entry.attackAngle}°`} trend={getTrend(idx, 'attackAngle', entry.attackAngle).val} isUp={getTrend(idx, 'attackAngle', entry.attackAngle).up} />
                <DataCard label="컨택 시간" value={`${entry.contactTime}s`} trend={getTrend(idx, 'contactTime', entry.contactTime).val} isUp={!getTrend(idx, 'contactTime', entry.contactTime).up} />
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl">
                <span className="text-xs font-black text-slate-400 uppercase block mb-2">메모</span>
                <p className="text-sm font-bold text-slate-600">{entry.memo || '메모가 없습니다'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">{editingEntry ? '랩소도 데이터 수정' : '랩소도 데이터 입력'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            {formError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">선수 선택</label>
                <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none">
                  <option>김민수 (16세)</option>
                </select>
              </div>
              <InputGroup label="배트 스피드 (mph)" value={formData.batSpeed} onChange={(val: string) => setFormData({...formData, batSpeed: val})} />
              <InputGroup label="타구 속도 (mph)" value={formData.exitVelocity} onChange={(val: string) => setFormData({...formData, exitVelocity: val})} />
              <InputGroup label="발사각 (도)" value={formData.launchAngle} onChange={(val: string) => setFormData({...formData, launchAngle: val})} />
              <InputGroup label="비거리 (feet)" value={formData.distance} onChange={(val: string) => setFormData({...formData, distance: val})} />
              <InputGroup label="어택 앵글 (도)" value={formData.attackAngle} onChange={(val: string) => setFormData({...formData, attackAngle: val})} />
              <InputGroup label="컨택 시간 (초)" value={formData.contactTime} onChange={(val: string) => setFormData({...formData, contactTime: val})} />
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-black text-slate-900 px-1">메모 (선택사항)</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold h-32 focus:ring-2 ring-blue-500" 
                  value={formData.memo}
                  onChange={e => setFormData({...formData, memo: e.target.value})}
                  placeholder="측정 조건이나 특이사항을 입력하세요" 
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl">저장</button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataCard({ label, value, trend, isUp }: any) {
  return (
    <div className={`p-6 rounded-[2rem] border border-slate-50 space-y-2 ${isUp ? 'bg-blue-50/20' : 'bg-red-50/20'}`}>
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
      <p className={`text-2xl font-black ${isUp ? 'text-blue-700' : 'text-purple-700'}`}>{value}</p>
      <div className={`flex items-center gap-1 text-xs font-black ${isUp ? 'text-blue-500' : 'text-purple-500'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-black text-slate-900 px-1">{label}</label>
      <input 
        type="number" 
        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-blue-500" 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0" 
      />
    </div>
  );
}