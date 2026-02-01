"use client";

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">B</div>
        <span className="font-bold text-xl tracking-tight">Elite Baseball</span>
      </Link>
      <div className="flex gap-6 items-center">
        <Link href="/coach" className="hover:text-blue-400 transition-colors">Coach</Link>
        <Link href="/athlete" className="hover:text-blue-400 transition-colors">Athlete</Link>
        <Link href="/admin" className="hover:text-blue-400 transition-colors">Admin</Link>
        <div className="ml-4 px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">
          Academy ID: 1
        </div>
      </div>
    </nav>
  );
}
