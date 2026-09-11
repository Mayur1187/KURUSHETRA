import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Sprout, 
  UploadCloud, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Award, 
  RotateCcw,
  CheckCircle2,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AgriEvidence = () => {
  const navigate = useNavigate();
  const { farmers, activeMediation } = useApp();

  const [selectedFarmerId, setSelectedFarmerId] = useState('farmer-c');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [evidenceHistory, setEvidenceHistory] = useState([]);
  const [reassessing, setReassessing] = useState(false);

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0] || {
    id: 'farmer-c',
    farmer_name: 'Farmer C (Mahesh)',
    crop_type: 'Sugarcane',
    crop_stage: 'Tillering'
  };

  const loadHistory = async (fid) => {
    try {
      const res = await api.getCropEvidenceHistory(fid);
      if (res.success) {
        setEvidenceHistory(res.history || []);
      }
    } catch (err) {
      console.error("Error loading crop evidence history:", err);
    }
  };

  useEffect(() => {
    loadHistory(selectedFarmerId);
  }, [selectedFarmerId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('farmer_id', selectedFarmerId);
      formData.append('crop_hint', selectedFarmer?.crop_type || 'Sugarcane');
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await api.analyzeCropEvidence(formData);
      if (res.success) {
        setAnalysisResult(res);
        await loadHistory(selectedFarmerId);
      }
    } catch (err) {
      console.error("Error running crop vision analysis:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReassessMediation = async () => {
    setReassessing(true);
    try {
      const negId = activeMediation?.negotiation_id || 'neg-1';
      const res = await api.reassessMediationWithEvidence({
        farmer_id: selectedFarmerId,
        negotiation_id: negId,
        priority_impact: analysisResult?.priority_impact
      });

      if (res.success) {
        navigate('/negotiation-room');
      }
    } catch (err) {
      console.error("Failed to reassess mediation:", err);
    } finally {
      setReassessing(false);
    }
  };

  const handleChallenge = async (evidenceId) => {
    try {
      const res = await api.challengeCropEvidence({
        evidence_id: evidenceId,
        farmer_id: selectedFarmerId
      });
      if (res.success) {
        setAnalysisResult(res.data);
        await loadHistory(selectedFarmerId);
      }
    } catch (err) {
      console.error("Error challenging crop evidence:", err);
    }
  };

  const evidence = analysisResult?.evidence;
  const impact = analysisResult?.priority_impact;
  const trustTier = analysisResult?.trust_tier || 'HIGH TRUST';
  const isMediationRequired = analysisResult?.mediation_required;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">AgriEvidence Engine — Crop Vision Intelligence</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Decision Evidence Protocol
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Computer vision crop analysis integrated into priority scoring, fairness credits, and mediation reassessments</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input & Upload Card */}
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <FileImage className="w-5 h-5 text-teal-400" />
              <span>Select Farmer & Upload Crop Image</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Farmer Profile:</label>
              <select
                value={selectedFarmerId}
                onChange={e => {
                  setSelectedFarmerId(e.target.value);
                  setAnalysisResult(null);
                  setPreviewUrl(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.farmer_name} — {f.crop_type} ({f.crop_stage})
                  </option>
                ))}
              </select>
            </div>

            {/* Drag and Drop Image Box */}
            <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-xl p-5 text-center transition cursor-pointer bg-slate-900/60">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="crop-image-upload"
              />
              <label htmlFor="crop-image-upload" className="cursor-pointer block">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover shadow-md" />
                ) : (
                  <div>
                    <UploadCloud className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-200 block">Click to upload crop image</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Supports JPG, PNG (or run instant demo mode)</span>
                  </div>
                )}
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg transition"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Vision Evidence...</span>
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>RUN AGRI-EVIDENCE ANALYSIS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis, Priority Impact & Mediation Trigger */}
        <div className="lg:col-span-2 space-y-6">
          {!analysisResult ? (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-10 text-center text-slate-400">
              <Sprout className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Crop Analysis Run Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Select a farmer profile and click <strong>"RUN AGRI-EVIDENCE ANALYSIS"</strong> to inspect computer vision crop criticality, water stress ratings, and priority score impacts.
              </p>
            </div>
          ) : (
            <>
              {/* Evidence Flow Header */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-widest">Evidence Flow Pipeline</span>
                <p className="text-xs font-semibold text-white mt-1">
                  Crop Image <span className="text-teal-400">→</span> AI Vision Analysis <span className="text-teal-400">→</span> Evidence Verification <span className="text-teal-400">→</span> Priority Score Impact <span className="text-teal-400">→</span> Mediation Reassessment
                </p>
              </div>

              {/* Analysis Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Crop Type & Stage</span>
                  <span className="font-bold text-white text-base block mt-1">{evidence?.crop_type}</span>
                  <span className="text-xs text-teal-400 font-medium">Stage: {evidence?.growth_stage}</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Water Stress Level</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 ${
                    evidence?.water_stress === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    evidence?.water_stress === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}>
                    {evidence?.water_stress} STRESS
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Stress Conf: {((evidence?.stress_confidence || 0.9) * 100).toFixed(0)}%</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Evidence Trust Rating</span>
                  <span className="font-bold text-cyan-300 text-sm block mt-1">{trustTier}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Crop Conf: {((evidence?.crop_confidence || 0.9) * 100).toFixed(0)}%</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Crop Criticality</span>
                  <span className="font-bold text-emerald-300 text-base block mt-1">{((evidence?.crop_criticality || 0.94) * 100).toFixed(0)}%</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Allocation Weight</span>
                </div>
              </div>

              {/* Priority Impact Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Farmer Priority Score Impact</span>
                    <div className="flex items-baseline space-x-3 mt-1">
                      <span className="text-xl font-bold text-slate-400">{impact?.previous_score}</span>
                      <span className="text-xl font-bold text-teal-400">→</span>
                      <span className="text-2xl font-extrabold text-white">{impact?.new_score}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        +{impact?.change} Delta
                      </span>
                    </div>
                  </div>
                </div>

                {isMediationRequired && (
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 block mb-2">
                      MEDIATION REASSESSMENT REQUIRED
                    </span>
                    <button
                      onClick={handleReassessMediation}
                      disabled={reassessing}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
                    >
                      <span>REASSESS MEDIATION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Advisory Summary Box */}
              {evidence?.analysis_summary && (
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-teal-400 block mb-1">AI Agricultural Evidence Summary:</span>
                  <p className="text-slate-200 leading-relaxed">{evidence.analysis_summary}</p>
                </div>
              )}
            </>
          )}

          {/* Evidence History & Challenge Timeline */}
          {evidenceHistory.length > 0 && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-base text-white mb-4 flex items-center justify-between">
                <span>Evidence History & Challenge Log</span>
                <span className="text-xs text-slate-400 font-normal">{evidenceHistory.length} Records</span>
              </h3>

              <div className="space-y-3">
                {evidenceHistory.map((item) => (
                  <div key={item.id} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{item.crop_type} ({item.growth_stage})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.evidence_status === 'active' ? 'bg-teal-500/20 text-teal-300' :
                          item.evidence_status === 'challenged' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {item.evidence_status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">{item.analysis_summary}</p>
                    </div>

                    {item.evidence_status === 'active' && (
                      <button
                        onClick={() => handleChallenge(item.id)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0 transition"
                      >
                        Challenge Evidence
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
