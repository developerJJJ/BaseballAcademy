"use client";

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ academies: 1, athletes: 1, coaches: 1 });

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control</h1>
        <p className="text-slate-500">System Configuration & Academy Ops</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase">Athletes</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.athletes}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase">Coaches</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.coaches}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase">Academies</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.academies}</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold">SOP Classification Rules (System Core)</h2>
          <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-blue-500 transition-colors">
            + New Rule
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold uppercase text-slate-400">Classification</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-400">Target Template</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-400">Constraints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4">
                   <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-bold">HS</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs font-bold">L1</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-bold">2x/week</span>
                   </div>
                </td>
                <td className="p-4 font-medium text-slate-700">HS_L1_2X_TEMPLATE</td>
                <td className="p-4 text-slate-400 text-sm">
                   <div className="flex flex-col gap-1">
                      <span>Max load: 75%</span>
                      <span className="text-[10px] uppercase font-bold text-slate-300">Composition: Skill, Conditioning, Strength</span>
                   </div>
                </td>
              </tr>
              <tr className="bg-slate-50/50 italic text-slate-400">
                <td colSpan={3} className="p-8 text-center text-xs">
                  Adding a new rule will automatically update assignments and generation logic.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
