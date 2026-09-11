import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Droplet, Save } from 'lucide-react';
import { api } from '../services/api';

export const WaterManagement = () => {
  const { waterResource, refreshData } = useApp();
  const [available, setAvailable] = useState(waterResource?.total_available_water || 10000);
  const [capacity, setCapacity] = useState(waterResource?.canal_capacity || 2500);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.updateWaterResource({
      total_available_water: parseFloat(available),
      canal_capacity: parseFloat(capacity)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    await refreshData();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Water Resource Administration</h1>
        <p className="text-xs text-slate-400">Configure canal water supply parameters for the current allocation cycle</p>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span>Total Available Water (Liters)</span>
              </label>
              <input
                type="number"
                value={available}
                onChange={e => setAvailable(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Current reservoir / canal volume limit</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Droplet className="w-4 h-4 text-teal-400" />
                <span>Canal Flow Capacity (Liters / Hour)</span>
              </label>
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Max delivery rate per hour</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-teal-400 font-bold">✓ Water parameters updated successfully!</span>
            ) : <span />}

            <button
              type="submit"
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-teal-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Update Supply Parameters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
