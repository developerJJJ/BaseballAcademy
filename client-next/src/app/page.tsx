import Link from 'next/link';
import { User, ClipboardList, Shield, ArrowRight } from 'lucide-react';

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-12">
        
        {/* Branding */}
        {/* Branding */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200">
            K
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Kingkang Baseball Academy
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Select your role to access the academy operations platform.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Coach */}
          <Link href="/coach" className="group relative bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 flex flex-col items-center btn-role">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Coach</h2>
            <p className="text-slate-500 text-sm mb-6">Manage athletes, drills, and sessions.</p>
            <div className="mt-auto w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Coach <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Athlete */}
          <Link href="/athlete/checkin" className="group relative bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-100 hover:border-green-500 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 flex flex-col items-center btn-role">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Athlete</h2>
            <p className="text-slate-500 text-sm mb-6">View schedule, check-in, and track progress.</p>
            <div className="mt-auto w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Athlete <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Admin */}
          <Link href="/admin" className="group relative bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-100 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 flex flex-col items-center btn-role">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin</h2>
            <p className="text-slate-500 text-sm mb-6">System configuration and academy settings.</p>
            <div className="mt-auto w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Admin <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

        </div>

        <div className="text-slate-400 text-sm">
          © 2026 Kingkang Baseball Academy Operations
        </div>
      </div>
    </div>
  );
}
