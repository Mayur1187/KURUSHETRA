import React, { useState } from 'react';
import { CanalTopography3D } from '../components/vr/CanalTopography3D';
import { VirtualWarRoom3D } from '../components/vr/VirtualWarRoom3D';
import { Sliders, Droplet, Sun, CloudRain, ShieldCheck, Activity, Cpu } from 'lucide-react';

export const VRCommandCenter = () => {
  const [activeCameraPreset, setActiveCameraPreset] = useState('overview');
  const [activePhase, setActivePhase] = useState(0);

  // Live Interactive Sliders State
  const [reservoirLevel, setReservoirLevel] = useState(8.4); // MCM (2.0 to 15.0)
  const [gateApertures, setGateApertures] = useState({ gateA: 80, gateB: 65, gateC: 40 });
  const [weatherScenario, setWeatherScenario] = useState('normal'); // 'rainy', 'normal', 'drought', 'heatwave'
  const [flowMode, setFlowMode] = useState('amber');

  // Computed Telemetry State
  const flowRate = (reservoirLevel * 0.5).toFixed(1) + ' L/s';
  const priorityA = (0.61 * (gateApertures.gateA / 80)).toFixed(2);
  const priorityB = (0.55 * (gateApertures.gateB / 65)).toFixed(2);
  const priorityC = (0.82 * (gateApertures.gateC / 40)).toFixed(2);
  const loss = (12.1 + (15.0 - reservoirLevel) * 0.8).toFixed(1) + '%';
  const status = reservoirLevel < 4.0 ? 'CRITICAL_SHORTAGE' : 'FINALIZED';

  const telemetry = {
    flowRate,
    priorityA,
    priorityB,
    priorityC,
    loss,
    status
  };

  // Weather Preset Handlers
  const handleApplyScenario = (scenario) => {
    setWeatherScenario(scenario);
    if (scenario === 'drought') {
      setReservoirLevel(3.2);
      setGateApertures({ gateA: 50, gateB: 30, gateC: 15 });
      setFlowMode('amber');
    } else if (scenario === 'heatwave') {
      setReservoirLevel(2.4);
      setGateApertures({ gateA: 40, gateB: 20, gateC: 10 });
      setFlowMode('amber');
    } else if (scenario === 'rainy') {
      setReservoirLevel(14.5);
      setGateApertures({ gateA: 100, gateB: 95, gateC: 90 });
      setFlowMode('cyan');
    } else {
      setReservoirLevel(8.4);
      setGateApertures({ gateA: 80, gateB: 65, gateC: 40 });
      setFlowMode('cyan');
    }
  };

  const handleTriggerStress = () => {
    setGateApertures({ gateA: 90, gateB: 70, gateC: 15 });
    setFlowMode('amber');
  };

  const handleToggleColor = () => {
    setFlowMode((prev) => (prev === 'amber' ? 'cyan' : 'amber'));
  };

  const handleOverrideGates = () => {
    setGateApertures((prev) => ({
      gateA: prev.gateA > 0 ? 0 : 80,
      gateB: prev.gateB > 0 ? 0 : 65,
      gateC: prev.gateC > 0 ? 0 : 40
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1800px] mx-auto text-slate-100 min-h-screen">
      {/* Interactive Simulation Parameters Deck (Top Slider Deck) */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Live Interactive Simulation Deck v2.0
              </h2>
              <p className="text-[11px] text-slate-400">
                Drag parameters below to observe real-time 3D water physics, gate apertures, and crop health responses
              </p>
            </div>
          </div>

          {/* Scenario Selector Buttons */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'normal', label: 'Optimal Flow', icon: Droplet },
              { id: 'rainy', label: 'Rainy Season', icon: CloudRain },
              { id: 'drought', label: 'Peak Drought', icon: Sun },
              { id: 'heatwave', label: 'Heatwave Crisis', icon: Sun }
            ].map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                    weatherScenario === sc.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Reservoir Capacity Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Reservoir Water Level</span>
              <span className="text-cyan-400 font-extrabold">{reservoirLevel} MCM</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="15.0"
              step="0.2"
              value={reservoirLevel}
              onChange={(e) => setReservoirLevel(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>2.0 MCM (Empty)</span>
              <span>15.0 MCM (Full)</span>
            </div>
          </div>

          {/* Gate A Aperture Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-emerald-400">Gate A Aperture (Head)</span>
              <span className="text-emerald-300 font-extrabold">{gateApertures.gateA}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gateApertures.gateA}
              onChange={(e) =>
                setGateApertures((prev) => ({ ...prev, gateA: parseInt(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Closed (0%)</span>
              <span>Open (100%)</span>
            </div>
          </div>

          {/* Gate B Aperture Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-amber-400">Gate B Aperture (Mid)</span>
              <span className="text-amber-300 font-extrabold">{gateApertures.gateB}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gateApertures.gateB}
              onChange={(e) =>
                setGateApertures((prev) => ({ ...prev, gateB: parseInt(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Closed (0%)</span>
              <span>Open (100%)</span>
            </div>
          </div>

          {/* Gate C Aperture Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-purple-400">Gate C Aperture (Tail)</span>
              <span className="text-purple-300 font-extrabold">{gateApertures.gateC}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gateApertures.gateC}
              onChange={(e) =>
                setGateApertures((prev) => ({ ...prev, gateC: parseInt(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Closed (0%)</span>
              <span>Open (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SPLIT GRID: LEFT (3D TOPOGRAPHY) & RIGHT (3D ROUND TABLE WAR ROOM) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: 3D INTERACTIVE 360° TOPOGRAPHY */}
        <div className="w-full h-full min-h-[620px]">
          <CanalTopography3D
            activeCameraPreset={activeCameraPreset}
            setActiveCameraPreset={setActiveCameraPreset}
            reservoirLevel={reservoirLevel}
            gateApertures={gateApertures}
            flowMode={flowMode}
            telemetry={telemetry}
          />
        </div>

        {/* RIGHT COLUMN: 3D ROUND TABLE NEGOTIATION WAR ROOM & SIMULATION DECK */}
        <div className="w-full h-full min-h-[620px]">
          <VirtualWarRoom3D
            activePhase={activePhase}
            setActivePhase={setActivePhase}
            onTriggerStress={handleTriggerStress}
            onToggleColor={handleToggleColor}
            onOverrideGates={handleOverrideGates}
          />
        </div>
      </div>
    </div>
  );
};
