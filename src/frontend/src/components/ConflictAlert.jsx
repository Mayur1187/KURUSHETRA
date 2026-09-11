import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ConflictAlert = ({ conflict, showMediationBtn = true }) => {
  const navigate = useNavigate();
  const { handleStartMediation, loading } = useApp();

  const isCritical = conflict?.severity === 'CRITICAL';
  const isHigh = conflict?.severity === 'HIGH';

  const severityBg = isCritical
    ? 'bg-rose-950/60 border-rose-600/60 text-rose-200'
    : isHigh
    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
    : 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200';

  const onStart = async () => {
    await handleStartMediation();
    navigate('/negotiation-room');
  };

  return (
    <div className={`border rounded-xl p-5 mb-4 shadow-lg ${severityBg}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 shrink-0">
            {isCritical ? <ShieldAlert className="w-6 h-6 text-rose-400" /> : <AlertTriangle className="w-6 h-6 text-amber-400" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white">{conflict?.title || 'Water Shortage Conflict'}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {conflict?.severity || 'HIGH'} SEVERITY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{conflict?.description}</p>
            {conflict?.affected_farmers && (
              <div className="mt-2 text-xs text-slate-400">
                <span>Affected Farmers: </span>
                <span className="font-semibold text-slate-200">{conflict.affected_farmers.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {showMediationBtn && (
          <button
            onClick={onStart}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 shrink-0 transition"
          >
            <span>START AI MEDIATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
