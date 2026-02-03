"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, X, Trash2, Edit2, AlertCircle, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ academies: 1, athletes: 1, coaches: 1 });
  const [rules, setRules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    level: 'L1',
    frequency: 'F2X',
    group: 'HS',
    sessionTemplateId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, templatesRes] = await Promise.all([
        fetch('/api/rules', {
          headers: { 'x-user-id': '8', 'x-academy-id': '1', 'x-user-role': 'ADMIN' }
        }),
        fetch('/api/drills/templates', {
          headers: { 'x-user-id': '8', 'x-academy-id': '1', 'x-user-role': 'ADMIN' }
        })
      ]);
      
      const rulesData = await rulesRes.json();
      const templatesData = await templatesRes.json();
      
      setRules(rulesData);
      setTemplates(templatesData);
      if (templatesData.length > 0) setFormData(prev => ({ ...prev, sessionTemplateId: templatesData[0].id.toString() }));
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      const target = user.role === 'COACH' ? '/coach' : user.role === 'PARENT' ? '/parent' : '/athlete';
      router.push(target);
    } else {
      fetchData();
    }
  }, [user, router]);

  const handleSave = async () => {
    setFormError('');
    if (!formData.sessionTemplateId) {
      setFormError('템플릿을 선택해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '8',
          'x-academy-id': '1',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        setFormError(data.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setFormError('서버와의 통신에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': '8', 'x-academy-id': '1', 'x-user-role': 'ADMIN' }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('admin.title')}</h1>
        <p className="text-slate-500 font-bold">{t('admin.subtitle')}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t('admin.athletes')} value={stats.athletes} />
        <StatCard label={t('admin.coaches')} value={stats.coaches} />
        <StatCard label={t('admin.academies')} value={stats.academies} />
      </div>

      {/* Rules Section */}
      <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 flex justify-between items-center">
          <h2 className="text-white text-xl font-black">{t('admin.sop_title')}</h2>
          <button 
            onClick={() => { setFormError(''); setIsModalOpen(true); }}
            className="bg-blue-600 text-white text-sm font-black px-6 py-3 rounded-2xl hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('admin.new_rule')}
          </button>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-xs font-black uppercase text-slate-400 tracking-widest">{t('admin.classification')}</th>
                <th className="p-6 text-xs font-black uppercase text-slate-400 tracking-widest">{t('admin.target_template')}</th>
                <th className="p-6 text-xs font-black uppercase text-slate-400 tracking-widest">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex gap-2">
                      <Badge text={rule.group} color="blue" />
                      <Badge text={rule.level} color="green" />
                      <Badge text={rule.frequency} color="purple" />
                    </div>
                  </td>
                  <td className="p-6 font-bold text-slate-700">{rule.template.name}</td>
                  <td className="p-6">
                    <button 
                      onClick={() => handleDelete(rule.id)}
                      className="p-3 text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="p-20 text-center text-slate-400 font-bold italic">
                    등록된 규칙이 없습니다. 새 규칙을 추가해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-50">
          <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            {t('admin.footer_note')}
          </p>
        </div>
      </section>

      {/* Add Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">새 분류 규칙 추가</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            {formError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}

            <div className="space-y-6">
              <InputGroup 
                label="그룹 (연령대)" 
                type="select" 
                value={formData.group}
                onChange={(v: string) => setFormData({...formData, group: v})}
                options={['YOUTH_10_12', 'YOUTH_13_15', 'HS', 'ADULT']} 
              />
              <InputGroup 
                label="레벨" 
                type="select" 
                value={formData.level}
                onChange={(v: string) => setFormData({...formData, level: v})}
                options={['L0', 'L1', 'L2']} 
              />
              <InputGroup 
                label="빈도" 
                type="select" 
                value={formData.frequency}
                onChange={(v: string) => setFormData({...formData, frequency: v})}
                options={['F1X', 'F2X', 'F4_5X']} 
              />
              <InputGroup 
                label="대상 템플릿" 
                type="select" 
                value={formData.sessionTemplateId}
                onChange={(v: string) => setFormData({...formData, sessionTemplateId: v})}
                options={templates.map(t => ({ id: t.id, name: t.name }))} 
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200"
              >
                규칙 추가
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50"
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

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  );
}

function Badge({ text, color }: { text: string, color: string }) {
  const styles: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${styles[color]}`}>
      {text}
    </span>
  );
}

function InputGroup({ label, type = 'text', options = [], value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-black text-slate-900 px-1">{label}</label>
      <div className="relative">
        <select 
          className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none focus:ring-2 ring-blue-500"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {options.map((o: any) => (
            <option key={typeof o === 'string' ? o : o.id} value={typeof o === 'string' ? o : o.id}>
              {typeof o === 'string' ? o : o.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
