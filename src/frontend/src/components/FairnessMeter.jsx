import React from 'react';
import { Award, TrendingUp, HeartHandshake } from 'lucide-react';

export const FairnessMeter = ({ fairnessScore = 92.5, farmers = [] }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-base text-white">Temporal Fairness & Sacrifice Index</h3>
        </div>
        <span className="text-xs text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/30 font-bold">
          System Rating: {fairnessScore}%
        </span>
      </div>

      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 mb-5">
        <div
          className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${fairnessScore}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Cycle Tracking</span>
          </div>
          <p className="text-slate-300 font-medium">Evaluates historical satisfaction across past irrigation rounds.</p>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
            <span>Sacrifice Credit System</span>
          </div>
          <p className="text-slate-300 font-medium">Voluntary compromises reward farmers with priority credits.</p>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Equity Enforcement</span>
          </div>
          <p className="text-slate-300 font-medium">Prevents persistent under-allocation to vulnerable farms.</p>
        </div>
      </div>
    </div>
  );
};
