import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Home, ArrowLeft, GitBranch, Eye, Info, Droplets, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const CanalTopography3D = ({
  activeCameraPreset = 'overview',
  setActiveCameraPreset,
  reservoirLevel = 8.4, // MCM (2.0 to 15.0)
  gateApertures = { gateA: 80, gateB: 65, gateC: 40 }, // percentages 0-100
  flowMode = 'cyan',
  telemetry = { flowRate: '4.2 L/s', priorityA: 0.61, priorityB: 0.55, priorityC: 0.82, loss: '12.1%', status: 'FINALIZED' }
}) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const animFrameRef = useRef(null);

  const [selectedObjectInfo, setSelectedObjectInfo] = useState(null);

  // Mesh Refs
  const lakeWaterRef = useRef(null);
  const gateAMeshRef = useRef(null);
  const gateBMeshRef = useRef(null);
  const gateCMeshRef = useRef(null);
  const particlesRef = useRef(null);
  const cropGroupARef = useRef(null);
  const cropGroupBRef = useRef(null);
  const cropGroupCRef = useRef(null);

  const cameraTargets = {
    overview: { pos: new THREE.Vector3(-14, 22, 28), target: new THREE.Vector3(0, 0, 0) },
    reservoir: { pos: new THREE.Vector3(-12, 14, -20), target: new THREE.Vector3(0, 4, -18) },
    headGate: { pos: new THREE.Vector3(-12, 8, -8), target: new THREE.Vector3(-2, 1, -8) },
    midGate: { pos: new THREE.Vector3(12, 8, 0), target: new THREE.Vector3(2, 1, 0) },
    tailGate: { pos: new THREE.Vector3(-12, 8, 12), target: new THREE.Vector3(-2, 1, 10) }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c18);
    scene.fog = new THREE.FogExp2(0x060c18, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const initialPreset = cameraTargets.overview;
    camera.position.copy(initialPreset.pos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 6;
    controls.maxDistance = 90;
    controls.target.copy(initialPreset.target);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(25, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // --- 1. MOUNTAINS & TERRAIN ---
    const terrainGeo = new THREE.PlaneGeometry(70, 70, 50, 50);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      let y = (25 - z) * 0.08;

      if (z < -15) {
        y += Math.sin(x * 0.2) * 5 + Math.cos(z * 0.2) * 6 + (Math.abs(x) > 5 ? 8 : 2);
      } else if (Math.abs(x) > 10) {
        y += Math.sin(x * 0.25) * 4 + (Math.abs(x) - 10) * 0.4;
      }

      if (Math.abs(x) < 2.5 && z > -18) {
        y -= 1.2;
      }

      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x223326,
      roughness: 0.85,
      metalness: 0.1
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // --- 2. PRIMARY RESERVOIR LAKE ---
    const lakeGroup = new THREE.Group();
    lakeGroup.position.set(-2, 3.8, -20);
    lakeGroup.userData = { name: 'Primary Reservoir', type: 'reservoir', capacity: `${reservoirLevel} MCM` };

    const lakeWaterGeo = new THREE.CylinderGeometry(10, 9, 2, 32);
    const lakeWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const lakeWaterMesh = new THREE.Mesh(lakeWaterGeo, lakeWaterMat);
    lakeWaterRef.current = lakeWaterMesh;
    lakeGroup.add(lakeWaterMesh);

    // Dam Wall Structure
    const damGeo = new THREE.BoxGeometry(12, 4, 2);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4 });
    const damMesh = new THREE.Mesh(damGeo, damMat);
    damMesh.position.set(-2, 3.2, -14.5);
    damMesh.castShadow = true;
    scene.add(damMesh);
    scene.add(lakeGroup);

    // --- 3. MAIN CANAL BED ---
    const canalBedGeo = new THREE.BoxGeometry(3.6, 0.4, 34);
    const canalBedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.3, roughness: 0.7 });
    const canalBedMesh = new THREE.Mesh(canalBedGeo, canalBedMat);
    canalBedMesh.position.set(0, 0.2, 0);
    canalBedMesh.rotation.x = 0.05;
    scene.add(canalBedMesh);

    // --- 4. ANIMATED WATER PARTICLE SYSTEM ---
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2.2; // X inside canal
      particlePositions[i * 3 + 1] = 0.6 + (16 - particlePositions[i * 3 + 2]) * 0.05; // Y
      particlePositions[i * 3 + 2] = -16 + Math.random() * 32; // Z from -16 to 16
      particleSpeeds[i] = 0.1 + Math.random() * 0.15;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.45,
      transparent: true,
      opacity: 0.85
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particleSystem;
    scene.add(particleSystem);

    // --- 5. SLUICE GATES ---
    const createSluiceGate = (zPos, gateName, gateKey) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(0, 0.8 + (16 - zPos) * 0.05, zPos);
      gateGroup.userData = { name: gateName, type: 'gate', key: gateKey };

      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
      const leftP = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.5), pillarMat);
      leftP.position.set(-1.8, 1.2, 0);
      gateGroup.add(leftP);

      const rightP = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.5), pillarMat);
      rightP.position.set(1.8, 1.2, 0);
      gateGroup.add(rightP);

      const doorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 });
      const door = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.8, 0.2), doorMat);
      door.position.set(0, 0.8, 0);
      gateGroup.add(door);

      scene.add(gateGroup);
      return door;
    };

    gateAMeshRef.current = createSluiceGate(-10, 'Gate A (Ramesh)', 'gateA');
    gateBMeshRef.current = createSluiceGate(0, 'Gate B (Suresh)', 'gateB');
    gateCMeshRef.current = createSluiceGate(10, 'Gate C (Mahesh)', 'gateC');

    // --- 6. FARM PLOTS WITH DYNAMIC CROP HEALTH ---
    const createPlot = (xPos, zPos, plotColorHex, cropColorHex, cropType, plotName, farmerName) => {
      const group = new THREE.Group();
      group.position.set(xPos, 0.6 + (16 - zPos) * 0.05, zPos);
      group.userData = { name: plotName, type: 'plot', farmer: farmerName, crop: cropType };

      // Base & Border
      const baseGeo = new THREE.BoxGeometry(10, 0.3, 8);
      const baseMat = new THREE.MeshStandardMaterial({ color: plotColorHex, roughness: 0.8 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      group.add(baseMesh);

      // Crop Field Group
      const cropGroup = new THREE.Group();
      const plantGeo = cropType === 'Sugarcane'
        ? new THREE.CylinderGeometry(0.15, 0.25, 1.2, 5)
        : cropType === 'Wheat'
        ? new THREE.ConeGeometry(0.3, 0.9, 4)
        : new THREE.SphereGeometry(0.4, 8, 8);

      const plantMat = new THREE.MeshStandardMaterial({ color: cropColorHex, roughness: 0.6 });

      for (let r = -3; r <= 3; r += 1.2) {
        for (let c = -3.8; c <= 3.8; c += 1.2) {
          const plant = new THREE.Mesh(plantGeo, plantMat);
          plant.position.set(c + Math.random() * 0.2, 0.6, r + Math.random() * 0.2);
          plant.castShadow = true;
          cropGroup.add(plant);
        }
      }

      group.add(cropGroup);
      scene.add(group);
      return cropGroup;
    };

    cropGroupARef.current = createPlot(-9, -10, 0x15803d, 0x22c55e, 'Sugarcane', 'Farmer A Plot', 'Ramesh');
    cropGroupBRef.current = createPlot(9, 0, 0xa16207, 0xeab308, 'Wheat', 'Farmer B Plot', 'Suresh');
    cropGroupCRef.current = createPlot(-9, 10, 0x7e22ce, 0xa855f7, 'Vegetables', 'Farmer C Plot', 'Mahesh');

    // --- 7. RAYCASTING INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.name && parent.parent) {
          parent = parent.parent;
        }

        if (parent && parent.userData?.name) {
          setSelectedObjectInfo(parent.userData);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // --- 8. ANIMATION LOOP ---
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();

      const elapsed = clock.getElapsedTime();

      // Animate Particles down canal
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 2] += particleSpeeds[i] * (reservoirLevel / 8.4);
          positions[i * 3 + 1] = 0.5 + (16 - positions[i * 3 + 2]) * 0.04 + Math.sin(elapsed * 4 + i) * 0.05;

          // Loop particles back to head
          if (positions[i * 3 + 2] > 16) {
            positions[i * 3 + 2] = -16;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Smoothly animate Sluice Gate Apertures (Heights based on aperture % 0-100)
      if (gateAMeshRef.current) {
        const targetY = 0.4 + (gateApertures.gateA / 100) * 1.5;
        gateAMeshRef.current.position.y += (targetY - gateAMeshRef.current.position.y) * 0.1;
      }
      if (gateBMeshRef.current) {
        const targetY = 0.4 + (gateApertures.gateB / 100) * 1.5;
        gateBMeshRef.current.position.y += (targetY - gateBMeshRef.current.position.y) * 0.1;
      }
      if (gateCMeshRef.current) {
        const targetY = 0.4 + (gateApertures.gateC / 100) * 1.5;
        gateCMeshRef.current.position.y += (targetY - gateCMeshRef.current.position.y) * 0.1;
      }

      // Animate Crop Scale/Health based on gate aperture
      if (cropGroupCRef.current) {
        const scaleC = 0.6 + (gateApertures.gateC / 100) * 0.5;
        cropGroupCRef.current.scale.set(scaleC, scaleC, scaleC);
      }

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
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleClick);
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Camera preset transition
  useEffect(() => {
    const preset = cameraTargets[activeCameraPreset] || cameraTargets.overview;
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      const startTime = performance.now();
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();

      const animateCam = (now) => {
        const elapsed = (now - startTime) / 1000;
        const duration = 1.0;
        const t = Math.min(elapsed / duration, 1.0);
        const easeT = t * t * (3 - 2 * t);

        camera.position.lerpVectors(startPos, preset.pos, easeT);
        controls.target.lerpVectors(startTarget, preset.target, easeT);
        controls.update();

        if (t < 1.0) requestAnimationFrame(animateCam);
      };

      requestAnimationFrame(animateCam);
    }
  }, [activeCameraPreset]);

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Title Header */}
      <div className="absolute top-4 left-4 z-20">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur shadow-md">
          3D INTERACTIVE 360° TOPOGRAPHY
        </h2>
      </div>

      {/* Top Right Live Telemetry Card */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-3.5 shadow-2xl backdrop-blur w-60">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
          LIVE TELEMETRY CARD
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-300 font-medium">
            <span>RESERVOIR VOL:</span>
            <span className="font-bold text-cyan-400">{reservoirLevel} MCM</span>
          </div>
          <div className="flex justify-between text-slate-300 font-medium">
            <span>FLOW RATE:</span>
            <span className="font-bold text-white">{telemetry.flowRate}</span>
          </div>
          <div className="flex justify-between text-slate-300 font-medium">
            <span>PRIORITY:</span>
            <span className="font-bold text-cyan-300">
              (A: {telemetry.priorityA}, B: {telemetry.priorityB}, C: {telemetry.priorityC})
            </span>
          </div>
          <div className="flex justify-between text-slate-300 font-medium">
            <span>LOSS:</span>
            <span className="font-bold text-rose-400">{telemetry.loss}</span>
          </div>
          <div className="flex justify-between text-slate-300 font-medium pt-0.5">
            <span>STATUS:</span>
            <span className="font-bold text-emerald-400">{telemetry.status}</span>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing flex-1" />

      {/* Terrain Badges */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-[18%] left-[22%] -translate-x-1/2">
          <span className="bg-slate-900/90 text-cyan-300 text-[11px] font-bold px-2.5 py-1 rounded-md border border-cyan-500/40 shadow-lg backdrop-blur uppercase">
            PRIMARY RESERVOIR ({reservoirLevel} MCM)
          </span>
        </div>

        <div className="absolute top-[42%] left-[16%] -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="bg-emerald-950/90 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/50 shadow-lg backdrop-blur uppercase">
            FARMER A - HEAD ({gateApertures.gateA}%)
          </span>
          <span className="bg-slate-900/80 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-600/40 uppercase">
            SUGARCANE
          </span>
        </div>

        <div className="absolute top-[32%] left-[45%] -translate-x-1/2">
          <span className="bg-slate-900/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow backdrop-blur uppercase">
            GATE A (RAMESH - {gateApertures.gateA}%)
          </span>
        </div>

        <div className="absolute top-[33%] right-[18%] translate-x-1/2 flex flex-col items-center gap-1">
          <span className="bg-amber-950/90 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-md border border-amber-500/50 shadow-lg backdrop-blur uppercase">
            FARMER B - MID ({gateApertures.gateB}%)
          </span>
          <span className="bg-slate-900/80 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-600/40 uppercase">
            WHEAT
          </span>
        </div>

        <div className="absolute top-[52%] left-[52%] -translate-x-1/2">
          <span className="bg-slate-900/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow backdrop-blur uppercase">
            GATE B (SURESH - {gateApertures.gateB}%)
          </span>
        </div>

        <div className="absolute top-[58%] right-[22%] translate-x-1/2 flex flex-col items-center gap-1">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border shadow-lg backdrop-blur uppercase ${
            gateApertures.gateC < 30
              ? 'bg-rose-950/95 text-rose-300 border-rose-500 animate-pulse'
              : 'bg-purple-950/90 text-purple-300 border-purple-500/50'
          }`}>
            FARMER C - TAIL ({gateApertures.gateC}%)
          </span>
          <span className="bg-slate-900/80 text-purple-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-600/40 uppercase">
            VEGETABLES {gateApertures.gateC < 30 ? '• STRESS ALERT' : ''}
          </span>
        </div>

        <div className="absolute top-[72%] left-[58%] -translate-x-1/2">
          <span className="bg-slate-900/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow backdrop-blur uppercase">
            GATE C (MAHESH - {gateApertures.gateC}%)
          </span>
        </div>
      </div>

      {/* Selected 3D Object Inspector Modal overlay */}
      {selectedObjectInfo && (
        <div className="absolute top-16 left-4 z-30 bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur w-72">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-extrabold text-cyan-400 uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              {selectedObjectInfo.name}
            </span>
            <button
              onClick={() => setSelectedObjectInfo(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            {selectedObjectInfo.type === 'plot' && (
              <>
                <div><span className="text-slate-400 font-semibold">Farmer:</span> {selectedObjectInfo.farmer}</div>
                <div><span className="text-slate-400 font-semibold">Crop Type:</span> {selectedObjectInfo.crop}</div>
                <div><span className="text-slate-400 font-semibold">Soil Moisture:</span> {selectedObjectInfo.crop === 'Vegetables' && gateApertures.gateC < 30 ? '18% (Critical)' : '74% (Optimal)'}</div>
              </>
            )}
            {selectedObjectInfo.type === 'gate' && (
              <>
                <div><span className="text-slate-400 font-semibold">Aperture Opening:</span> {gateApertures[selectedObjectInfo.key]}%</div>
                <div><span className="text-slate-400 font-semibold">Status:</span> {gateApertures[selectedObjectInfo.key] > 0 ? 'Actuated & Flowing' : 'Fully Sealed'}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 z-20">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1.5 uppercase">
            LIVE TELEMETRY CARD
          </h4>
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>FLOW RATE:</span>
              <span className="font-bold text-white">{telemetry.flowRate}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>PRIORITY:</span>
              <span className="font-bold text-cyan-300">
                (A: {telemetry.priorityA}, B: {telemetry.priorityB}, C: {telemetry.priorityC})
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>LOSS:</span>
              <span className="font-bold text-rose-400">{telemetry.loss}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>STATUS:</span>
              <span className="font-bold text-emerald-400">{telemetry.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
            <span>CAMERA FLYTHROUGH</span>
            <span className="text-slate-500 cursor-pointer hover:text-slate-300">✕</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <button
              onClick={() => setActiveCameraPreset('reservoir')}
              className={`p-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center space-y-0.5 border transition ${
                activeCameraPreset === 'reservoir'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>RESERVOIR</span>
            </button>

            <button
              onClick={() => setActiveCameraPreset('headGate')}
              className={`p-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center space-y-0.5 border transition ${
                activeCameraPreset === 'headGate'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>HEAD GATE</span>
            </button>

            <button
              onClick={() => setActiveCameraPreset('tailGate')}
              className={`p-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center space-y-0.5 border transition ${
                activeCameraPreset === 'tailGate'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>TAIL GATE</span>
            </button>
          </div>

          <button
            onClick={() => setActiveCameraPreset('overview')}
            className="w-full py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-600/40 text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VR Viewport (Reset 360°)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
