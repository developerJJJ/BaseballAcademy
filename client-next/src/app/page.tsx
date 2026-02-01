import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-6xl font-black text-slate-900 tracking-tight">
          Baseball Academy <br />
          <span className="text-blue-600">Operations Platform</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          The rule-based system for scaling sports excellence. 
          Automate scheduling, execution, and evaluation with data-driven precision.
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/coach" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-200">
          Coach Portal
        </Link>
        <Link href="/athlete" className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all hover:scale-105">
          Athlete App
        </Link>
      </div>

      <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="p-6 text-left space-y-2">
           <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">🛡️</div>
           <h3 className="font-bold text-lg">Rule Engine</h3>
           <p className="text-slate-500 text-sm">Classification-driven training paths. Pure data, no guesswork.</p>
        </div>
        <div className="p-6 text-left space-y-2">
           <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">⚡</div>
           <h3 className="font-bold text-lg">Auto-Generation</h3>
           <p className="text-slate-500 text-sm">Sessions generate themselves based on athlete level and frequency.</p>
        </div>
        <div className="p-10 text-left space-y-2">
           <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">🏢</div>
           <h3 className="font-bold text-lg">Multi-Tenant</h3>
           <p className="text-slate-500 text-sm">Scale from one academy to a franchise with a single configuration.</p>
        </div>
      </div>
    </div>
  );
}
