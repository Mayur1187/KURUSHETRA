import React from 'react';
import { User, Sprout, Clock, Shield, AlertCircle } from 'lucide-react';

export const FarmerCard = ({ farmer, request }) => {
  const req = request || farmer?.water_request || {};
  const requested = parseFloat(req.requested_water) || 4000;
  const minimum = parseFloat(req.minimum_water) || 2500;
  const urgency = req.urgency || 4;

  const urgencyColors = {
    5: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    4: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    3: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-600 transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-700/80 flex items-center justify-center text-teal-400 font-semibold border border-slate-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{farmer.farmer_name}</h3>
            <p className="text-xs text-slate-400">{farmer.land_area} {farmer.land_unit || 'Acres'} Land</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${urgencyColors[urgency] || urgencyColors[3]}`}>
          Urgency: {urgency}/5
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Sprout className="w-3.5 h-3.5 text-teal-400" />
            <span>Crop & Stage</span>
          </div>
          <span className="font-semibold text-slate-200">{farmer.crop_type} ({farmer.crop_stage})</span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preferred Window</span>
          </div>
          <span className="font-semibold text-slate-200">{req.preferred_start || '06:00'} - {req.preferred_end || '12:00'}</span>
        </div>
      </div>

      <div className="mt-3 bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">Water Demand:</span>
          <span className="font-bold text-cyan-300">{requested.toLocaleString()} L</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Strict Minimum:</span>
          <span className="font-semibold text-amber-300">{minimum.toLocaleString()} L</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full"
            style={{ width: `${(minimum / requested) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
        <span className="flex items-center space-x-1 text-teal-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Digital Agent Active</span>
        </span>
        <span>Flexibility: High</span>
      </div>
    </div>
  );
};
