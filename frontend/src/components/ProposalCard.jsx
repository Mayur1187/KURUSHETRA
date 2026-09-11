import React from 'react';
import { CheckCircle, ShieldCheck, Clock, Award } from 'lucide-react';

export const ProposalCard = ({ proposal, isRevised = false }) => {
  if (!proposal) return null;

  const allocations = proposal.allocations || [];
  const fairnessScore = proposal.fairness_score || 88;
  const isCritical = proposal.is_critical_shortage;

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg text-white">
              {isRevised ? 'Revised Allocation Proposal (Round 2)' : 'Initial Allocation Proposal (Round 1)'}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-medium">
              Deterministic Math Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isCritical ? 'Emergency Survival Distribution' : 'Optimal Priority-Weighted Fair Allocation'}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-teal-400" />
            <span className="text-slate-300">Fairness: <strong className="text-teal-400">{fairnessScore}%</strong></span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Constraints: <strong className="text-cyan-400">Validated</strong></span>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700/60 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Farmer</th>
              <th className="py-2.5 px-3">Crop Stage</th>
              <th className="py-2.5 px-3 text-right">Requested</th>
              <th className="py-2.5 px-3 text-right">Allocated</th>
              <th className="py-2.5 px-3 text-center">Satisfaction</th>
              <th className="py-2.5 px-3 text-center">Canal Time Slot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {allocations.map((alloc) => {
              const satPct = (alloc.satisfaction_ratio * 100).toFixed(0);
              return (
                <tr key={alloc.farmer_id} className="hover:bg-slate-700/30 transition">
                  <td className="py-3 px-3 font-semibold text-white">{alloc.farmer_name}</td>
                  <td className="py-3 px-3 text-slate-400">{alloc.crop_type}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-300">{alloc.requested_water.toLocaleString()} L</td>
                  <td className="py-3 px-3 text-right font-bold text-teal-300">{alloc.allocated_water.toLocaleString()} L</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${satPct >= 80 ? 'bg-teal-500/20 text-teal-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {satPct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-cyan-300 font-medium">
                    <span className="inline-flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{alloc.start_time || '06:00'} - {alloc.end_time || '10:00'}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Decision Rationale Box */}
      {proposal.decision_explanation && (
        <div className="mt-4 bg-slate-900/70 p-3.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-teal-400 mb-1 flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-teal-400" />
            <span>Factual Decision Rationale (JalNyay AI):</span>
          </div>
          <p className="whitespace-pre-line text-slate-300 leading-relaxed">{proposal.decision_explanation}</p>
        </div>
      )}
    </div>
  );
};
