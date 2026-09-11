import React from 'react';
import { useApp } from '../context/AppContext';
import { ConflictAlert } from '../components/ConflictAlert';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const ConflictCenter = () => {
  const { conflicts } = useApp();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Conflict Detection Center</h1>
          <p className="text-xs text-slate-400">Automated conflict analysis engine results</p>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center text-slate-400">
          <ShieldCheck className="w-12 h-12 text-teal-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Active Water Sharing Conflicts</h3>
          <p className="text-xs text-slate-400 mt-1">Available supply satisfies all farmer demands cleanly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict, idx) => (
            <ConflictAlert key={idx} conflict={conflict} />
          ))}
        </div>
      )}
    </div>
  );
};
