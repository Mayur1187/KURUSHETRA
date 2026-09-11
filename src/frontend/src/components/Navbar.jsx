import React from 'react';
import { Droplet, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { handleResetSystem, loading } = useApp();

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Droplet className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent">
              JalSangam AI
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-medium">
              Autonomous Mediator
            </span>
          </div>
          <p className="text-xs text-slate-400">Fair Irrigation Dispute Resolution Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Engine: Deterministic Math + AI Mediation</span>
        </div>

        <button
          onClick={handleResetSystem}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition"
          title="Reset environment to default demo state"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
