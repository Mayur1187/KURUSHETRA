import React from 'react';
import { Clock, Droplet } from 'lucide-react';

export const WaterSchedule = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  const colors = [
    'from-cyan-500 to-teal-500 border-cyan-400',
    'from-amber-500 to-orange-500 border-amber-400',
    'from-indigo-500 to-purple-500 border-indigo-400',
    'from-emerald-500 to-teal-600 border-emerald-400'
  ];

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Canal Water Dispatch Schedule Timeline</span>
          </h3>
          <p className="text-xs text-slate-400">Sequenced non-overlapping irrigation delivery slots</p>
        </div>
        <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-700 font-mono">
          Flow Capacity: 2,500 L/h
        </span>
      </div>

      <div className="space-y-3">
        {schedule.map((slot, index) => {
          const colorClass = colors[index % colors.length];
          return (
            <div key={slot.farmer_id} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-10 rounded-full bg-gradient-to-b ${colorClass}`} />
                <div>
                  <h4 className="font-bold text-sm text-white">{slot.farmer_name}</h4>
                  <span className="text-xs text-slate-400">{slot.crop_type} Crop</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block">Allocated Volume</span>
                  <span className="font-bold text-teal-300">{slot.allocated_water?.toLocaleString()} L</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Delivery Window</span>
                  <span className="font-mono font-bold text-cyan-300">{slot.start_time} - {slot.end_time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-200">{slot.duration_hours} hrs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
