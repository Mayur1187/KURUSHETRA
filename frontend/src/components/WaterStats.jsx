import React from 'react';
import { Droplet, TrendingDown, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WaterStats = () => {
  const { waterResource, farmers, conflicts, activeMediation, activeAgreement } = useApp();

  const available = waterResource?.total_available_water || 10000;
  const requests = farmers.map(f => f.water_request).filter(Boolean);
  const totalDemand = requests.reduce((acc, r) => acc + (parseFloat(r.requested_water) || 0), 15000);
  const shortage = Math.max(0, totalDemand - available);

  const statusLabel = activeAgreement ? 'Agreement Finalized' : activeMediation ? 'Negotiation Active' : 'Conflicts Detected';
  const statusColor = activeAgreement ? 'text-teal-400 bg-teal-500/10 border-teal-500/30' : activeMediation ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Available Water */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Available Water Supply</span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Droplet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white">{available.toLocaleString()} L</span>
          <span className="text-xs text-slate-400">Canal Flow: {waterResource?.canal_capacity || 2500} L/h</span>
        </div>
      </div>

      {/* Total Demand */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Total Requested Demand</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white">{totalDemand.toLocaleString()} L</span>
          <span className="text-xs text-slate-400">{farmers.length} Farmers</span>
        </div>
      </div>

      {/* Water Shortage */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Water Shortage Deficit</span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-400">-{shortage.toLocaleString()} L</span>
          <span className="text-xs text-rose-400/90 font-medium">
            {shortage > 0 ? `${((shortage / totalDemand) * 100).toFixed(0)}% Deficit` : 'Balanced'}
          </span>
        </div>
      </div>

      {/* Mediation Status */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Mediation Status</span>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            {activeAgreement ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="text-xs text-slate-400">{conflicts.length} Conflict(s)</span>
        </div>
      </div>
    </div>
  );
};
