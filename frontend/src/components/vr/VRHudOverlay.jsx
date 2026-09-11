import React from 'react';
import { Camera, Compass, Droplet, Eye, ShieldAlert, Sliders, Waves, Activity, Zap } from 'lucide-react';

export const VRHudOverlay = ({
  viewMode,
  setViewMode,
  activeCameraPreset,
  setActiveCameraPreset,
  gateStates,
  setGateStates,
  flowMode,
  setFlowMode,
  waterVolume,
  setWaterVolume
}) => {
  const cameraButtons = [
    { id: 'overview', label: 'Overview 360°' },
    { id: 'reservoir', label: 'Main Reservoir' },
    { id: 'farmerA', label: 'Farmer A (Head)' },
    { id: 'farmerB', label: 'Farmer B (Mid)' },
    { id: 'farmerC', label: 'Farmer C (Tail)' },
    { id: 'tail', label: 'Tail Canal' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar: View Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">3D VR Display Mode</h3>
            <p className="text-[11px] text-slate-400">Headset & Browser Interactive Telemetry</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('topography')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              viewMode === 'topography'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>3D Canal Topography</span>
          </button>

          <button
            onClick={() => setViewMode('warroom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              viewMode === 'warroom'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D War Room Round Table</span>
          </button>
        </div>
      </div>

      {/* Control Panel Deck */}
      {viewMode === 'topography' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Camera Flythrough Buttons */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                3D Flythrough Camera Presets
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cameraButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveCameraPreset(btn.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border ${
                    activeCameraPreset === btn.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sluice Gate Overrides */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                3D Sluice Gate Actuators
              </span>
            </div>
            <div className="space-y-2">
              {[
                { key: 'gateA', label: 'Gate A (Head - Farmer A)' },
                { key: 'gateB', label: 'Gate B (Mid - Farmer B)' },
                { key: 'gateC', label: 'Gate C (Tail - Farmer C)' }
              ].map((g) => (
                <div key={g.key} className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-xs text-slate-300 font-medium">{g.label}</span>
                  <button
                    onClick={() =>
                      setGateStates((prev) => ({ ...prev, [g.key]: !prev[g.key] }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      gateStates[g.key]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {gateStates[g.key] ? 'OPEN (Slid Up)' : 'CLOSED'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Flow Color Dynamics & Loss */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Water Flow Color Dynamics
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { mode: 'cyan', label: '🩵 Optimal (Cyan)' },
                { mode: 'amber', label: '💛 Drought (Amber)' },
                { mode: 'crimson', label: '❤️ Blocked (Crimson)' },
                { mode: 'emerald', label: '💚 Evidence (Emerald)' }
              ].map((f) => (
                <button
                  key={f.mode}
                  onClick={() => setFlowMode(f.mode)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border ${
                    flowMode === f.mode
                      ? 'bg-slate-700 text-white border-cyan-500 font-bold'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Transmission Loss Bar */}
            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>Transmission Loss (Head to Tail)</span>
                <span className="text-rose-400 font-bold">28.4% Seepage/Evaporation</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-rose-500 w-[71.6%]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
