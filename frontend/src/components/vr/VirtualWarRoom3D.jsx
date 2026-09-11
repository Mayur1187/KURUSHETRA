import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Play, Pause, FastForward, Rewind, Zap, AlertTriangle, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

export const VirtualWarRoom3D = ({
  activePhase = 0,
  setActivePhase,
  onTriggerStress,
  onToggleColor,
  onOverrideGates
}) => {
  const mountRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const phases = [
    {
      id: 0,
      title: 'Phase 1: Severe Drought Crisis',
      speaker: 'Farmer C (Tail-end)',
      speakerKey: 'farmerC',
      avatarColor: '#22c55e',
      text: 'Vegetables collapsing! Require immediate slot. Reservoir level has dropped below critical threshold.',
      badge: 'Tail Canal • Severe Water Deficit',
      preset: 'tailGate'
    },
    {
      id: 1,
      title: 'Phase 2: AgriEvidence AI Vision Upload',
      speaker: 'AgriEvidence Engine',
      speakerKey: 'evidence',
      avatarColor: '#06b6d4',
      text: 'Verified Crop Image: Stress Index = 0.88 (Severe Moisture Deficit). Confidence Score = 96.4%. Priority boosted +0.25.',
      badge: 'AI Vision Proof Verified',
      preset: 'tailGate'
    },
    {
      id: 2,
      title: 'Phase 3: JalNyay AI Priority Balancing',
      speaker: 'Mediator (AI)',
      speakerKey: 'mediator',
      avatarColor: '#a855f7',
      text: 'Conflict: Limited water (8,500 L). Applying Temporal Fairness Rule. Overriding standard schedule to guarantee survival.',
      badge: 'Autonomous AI Mediator',
      preset: 'overview'
    },
    {
      id: 3,
      title: 'Phase 4: Multi-Agent Objection Handling',
      speaker: 'Farmer B (Mid-end)',
      speakerKey: 'farmerB',
      avatarColor: '#eab308',
      text: 'Wheat stress evidence posted. Agreed to short-term diversion to prevent total vegetable crop failure.',
      badge: 'Mid Canal • Consensus Reached',
      preset: 'midGate'
    },
    {
      id: 4,
      title: 'Phase 5: Binding Contract Execution',
      speaker: 'Agreement Sign-off',
      speakerKey: 'contract',
      avatarColor: '#10b981',
      text: 'AGREEMENT SIGNED! Sluice Gates A, B, C actuated live in 3D topography.',
      badge: 'Contract Active • Gates Actuated',
      preset: 'overview'
    }
  ];

  // Auto-play phases
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePhase((prev) => {
        const next = (prev + 1) % phases.length;
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, phases.length, setActivePhase]);

  const currentPhaseData = phases[activePhase] || phases[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c18);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 11, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x06b6d4, 2.5, 40, Math.PI / 3, 0.5);
    spotLight.position.set(0, 18, 0);
    scene.add(spotLight);

    // Table
    const tableGroup = new THREE.Group();
    const tableGeo = new THREE.CylinderGeometry(6.5, 6.5, 0.4, 32);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = 2.0;
    tableGroup.add(tableMesh);

    const ringGeo = new THREE.TorusGeometry(6.6, 0.08, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 2.2;
    tableGroup.add(ringMesh);

    scene.add(tableGroup);

    // Avatars
    const avatars = [
      { name: 'Farmer C (Tail)', pos: [-6.2, 2.0, 1.0], shirtColor: 0x16a34a },
      { name: 'Mediator (AI)', pos: [0, 2.0, -5.5], shirtColor: 0x0891b2 },
      { name: 'Farmer B (Mid)', pos: [5.2, 2.0, -2.5], shirtColor: 0xd97706 },
      { name: 'Farmer A (Head)', pos: [6.2, 2.0, 2.5], shirtColor: 0xd97706 }
    ];

    avatars.forEach((av) => {
      const chairGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.3, 16);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const chair = new THREE.Mesh(chairGeo, chairMat);
      chair.position.set(av.pos[0], 0.15, av.pos[2]);
      scene.add(chair);

      const bodyGeo = new THREE.CapsuleGeometry(0.7, 1.4, 8, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: av.shirtColor, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(av.pos[0], 2.1, av.pos[2]);
      scene.add(body);

      const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(av.pos[0], 3.4, av.pos[2]);
      scene.add(head);
    });

    let animFrame;
    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrame) cancelAnimationFrame(animFrame);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Title Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur shadow-md">
          3D ROUND TABLE NEGOTIATION WAR ROOM
        </h2>
      </div>

      {/* 5-Phase Timeline Selector Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 backdrop-blur">
        {phases.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePhase(idx);
              setIsPlaying(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
              activePhase === idx
                ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            P{idx + 1}
          </button>
        ))}
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing flex-1" />

      {/* Floating 3D Speech Bubble Overlay (Dynamic based on active phase) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Farmer C Speech Bubble */}
        <div className={`absolute top-[28%] left-[12%] max-w-[210px] transition-all duration-500 ${
          activePhase === 0 ? 'scale-105 opacity-100' : 'scale-95 opacity-80'
        }`}>
          <div className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-2.5 shadow-2xl backdrop-blur relative">
            <div className="text-[11px] font-bold text-cyan-300 mb-0.5">Farmer C (Tail-end)</div>
            <div className="text-[11px] text-slate-200 font-medium leading-tight">
              Vegetables collapsing! Require immediate slot.
            </div>
            <div className="absolute -bottom-2 left-6 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/50 rotate-45" />
          </div>
        </div>

        {/* Mediator AI Speech Bubble */}
        <div className={`absolute top-[18%] left-[38%] max-w-[230px] transition-all duration-500 ${
          activePhase === 2 ? 'scale-105 opacity-100 ring-2 ring-purple-500 rounded-2xl' : 'scale-95 opacity-80'
        }`}>
          <div className="bg-slate-900/95 border border-purple-500/50 rounded-2xl p-2.5 shadow-2xl backdrop-blur relative">
            <div className="text-[11px] font-bold text-purple-300 mb-0.5">Mediator (AI)</div>
            <div className="text-[11px] text-slate-200 font-medium leading-tight">
              Conflict: Limited water (8,500 L). Priority needed!
            </div>
            <div className="absolute -bottom-2 left-10 w-3 h-3 bg-slate-900 border-r border-b border-purple-500/50 rotate-45" />
          </div>
        </div>

        {/* Farmer B Speech Bubble */}
        <div className={`absolute top-[22%] right-[12%] max-w-[200px] transition-all duration-500 ${
          activePhase === 3 ? 'scale-105 opacity-100' : 'scale-95 opacity-80'
        }`}>
          <div className="bg-slate-900/95 border border-amber-500/50 rounded-2xl p-2.5 shadow-2xl backdrop-blur relative">
            <div className="text-[11px] font-bold text-amber-300 mb-0.5">Farmer B (Mid-end)</div>
            <div className="text-[11px] text-slate-200 font-medium leading-tight">
              Wheat stress evidence posted.
            </div>
            <div className="absolute -bottom-2 left-6 w-3 h-3 bg-slate-900 border-r border-b border-amber-500/50 rotate-45" />
          </div>
        </div>

        {/* AGREEMENT SIGNED Speech Bubble */}
        <div className={`absolute top-[48%] right-[10%] max-w-[180px] transition-all duration-500 ${
          activePhase === 4 ? 'scale-110 opacity-100 animate-pulse' : 'scale-95 opacity-85'
        }`}>
          <div className="bg-emerald-950/95 border border-emerald-500/70 rounded-2xl p-3 shadow-2xl backdrop-blur relative text-center">
            <div className="text-xs font-extrabold text-emerald-300 tracking-wider uppercase">
              AGREEMENT SIGNED
            </div>
            <div className="absolute -bottom-2 left-8 w-3 h-3 bg-emerald-950 border-r border-b border-emerald-500/70 rotate-45" />
          </div>
        </div>
      </div>

      {/* Floating Media Playback Controls over Table Bottom */}
      <div className="absolute bottom-[105px] left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl backdrop-blur shadow-2xl">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold transition shadow-lg shadow-cyan-500/20"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={() => setActivePhase((prev) => (prev > 0 ? prev - 1 : phases.length - 1))}
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition"
        >
          <Rewind className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setActivePhase((prev) => (prev + 1) % phases.length)}
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom SIMULATION DECK */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 z-20">
        <div className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex justify-between items-center">
          <span>SIMULATION DECK</span>
          <span className="text-[10px] text-cyan-400 font-bold">{currentPhaseData.title}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={onOverrideGates}
            className="bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-cyan-300 uppercase leading-tight">
              GATE OVERRIDE <br />
              <span className="text-[10px] text-slate-400 font-medium">(A, B, C)</span>
            </span>
          </button>

          <button
            onClick={onTriggerStress}
            className="bg-slate-950/80 hover:bg-slate-900 border border-rose-600/50 hover:border-rose-500 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-rose-400 uppercase leading-tight">
              INJECT CRITICAL STRESS <br />
              <span className="text-[10px] text-slate-400 font-medium">(CROP)</span>
            </span>
          </button>

          <button
            onClick={onToggleColor}
            className="bg-slate-950/80 hover:bg-slate-900 border border-teal-500/50 hover:border-teal-400 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-teal-300 uppercase leading-tight">
              TOGGLE <br />
              <span className="text-[10px] text-slate-400 font-medium">AMBER/CYAN</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
