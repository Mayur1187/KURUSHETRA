import React from 'react';
import { AlertCircle, FileSpreadsheet, UserX, PlusCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NegotiationTimeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  const eventIcons = {
    CONFLICT_DETECTED: <AlertCircle className="w-4 h-4 text-amber-400" />,
    PROPOSAL_GENERATED: <FileSpreadsheet className="w-4 h-4 text-cyan-400" />,
    FARMER_ACCEPTED: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
    FARMER_REJECTED: <UserX className="w-4 h-4 text-rose-400" />,
    OBJECTION_ANALYZED: <UserX className="w-4 h-4 text-rose-400" />,
    CONSTRAINT_ADDED: <PlusCircle className="w-4 h-4 text-amber-400" />,
    RENEGOTIATION_STARTED: <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />,
    PROPOSAL_REVISED: <FileSpreadsheet className="w-4 h-4 text-teal-400" />,
    AGREEMENT_REACHED: <CheckCircle2 className="w-4 h-4 text-teal-400" />
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg">
      <h3 className="font-bold text-base text-white mb-4 flex items-center space-x-2">
        <span>Live Autonomous Audit Timeline</span>
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
      </h3>

      <div className="relative border-l-2 border-slate-700 ml-3 space-y-4">
        {events.map((evt, idx) => (
          <div key={idx} className="relative pl-6">
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
              {eventIcons[evt.event_type] || <CheckCircle2 className="w-3 h-3 text-slate-400" />}
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-teal-400">{evt.event_type.replace(/_/g, ' ')}</span>
                <span className="text-slate-500 font-mono text-[10px]">{evt.timestamp || 'Just now'}</span>
              </div>
              <p className="text-xs text-slate-300">
                {evt.event_data?.message || evt.event_data?.description || JSON.stringify(evt.event_data)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
