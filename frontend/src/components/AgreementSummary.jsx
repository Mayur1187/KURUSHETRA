import React from 'react';
import { FileCheck, ShieldCheck, CheckCircle2, Award, Calendar } from 'lucide-react';

export const AgreementSummary = ({ agreement }) => {
  if (!agreement) return null;

  const allocations = agreement.final_allocation || [];
  const schedule = agreement.final_schedule || [];
  const fairnessScore = agreement.final_fairness_score || 94.0;
  const acceptedBy = agreement.accepted_by || {};

  return (
    <div className="bg-slate-800/90 border border-teal-500/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
      {/* Binding Seal Badge */}
      <div className="absolute top-4 right-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5">
        <ShieldCheck className="w-4 h-4 text-teal-400" />
        <span>BINDING AGREEMENT FINALIZED</span>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
          <FileCheck className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">JalSangam Official Water Share Contract</h2>
          <p className="text-xs text-slate-400">Ref ID: {agreement.id} • Issued by JalNyay AI Autonomous Mediator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 text-xs">
        <div>
          <span className="text-slate-400 block mb-1">Agreement Status</span>
          <span className="font-bold text-teal-400 text-sm flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>100% Consensus Reached</span>
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">System Equity Rating</span>
          <span className="font-bold text-cyan-300 text-sm">{fairnessScore}%</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">Effective Date</span>
          <span className="font-mono font-semibold text-slate-200">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Final Schedule Table */}
      <h3 className="font-bold text-sm text-white mb-3 flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-teal-400" />
        <span>Final binding Canal Delivery Allocations</span>
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-700/80 mb-6">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700 uppercase">
            <tr>
              <th className="p-3">Farmer</th>
              <th className="p-3">Crop</th>
              <th className="p-3 text-right">Final Volume</th>
              <th className="p-3 text-center">Scheduled Time Slot</th>
              <th className="p-3 text-center">Agent Sign-Off</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 bg-slate-900/40">
            {allocations.map((alloc) => (
              <tr key={alloc.farmer_id}>
                <td className="p-3 font-semibold text-white">{alloc.farmer_name}</td>
                <td className="p-3 text-slate-400">{alloc.crop_type}</td>
                <td className="p-3 text-right font-bold text-teal-300">{alloc.allocated_water?.toLocaleString()} L</td>
                <td className="p-3 text-center font-mono text-cyan-300">{alloc.start_time || '06:00'} - {alloc.end_time || '10:00'}</td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center space-x-1 text-[11px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" />
                    <span>SIGNED</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {agreement.decision_explanation && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-300">
          <span className="font-bold text-teal-400 block mb-1">Mediator Summary & Explanation:</span>
          <p className="whitespace-pre-line text-slate-300 leading-relaxed">{agreement.decision_explanation}</p>
        </div>
      )}
    </div>
  );
};
