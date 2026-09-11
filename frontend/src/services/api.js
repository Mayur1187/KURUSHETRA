import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Water Resource
  getWaterResource: async () => {
    const res = await axios.get(`${API_BASE}/water-resource`);
    return res.data;
  },
  updateWaterResource: async (data) => {
    const res = await axios.post(`${API_BASE}/water-resource`, data);
    return res.data;
  },

  // Farmers
  getFarmers: async () => {
    const res = await axios.get(`${API_BASE}/farmers`);
    return res.data;
  },
  createFarmer: async (data) => {
    const res = await axios.post(`${API_BASE}/farmers`, data);
    return res.data;
  },

  // Conflicts
  getConflicts: async () => {
    const res = await axios.get(`${API_BASE}/conflicts`);
    return res.data;
  },
  detectConflicts: async () => {
    const res = await axios.post(`${API_BASE}/conflicts/detect`);
    return res.data;
  },

  // Mediation & Negotiation
  startMediation: async () => {
    const res = await axios.post(`${API_BASE}/mediation/start`);
    return res.data;
  },
  resetMediation: async () => {
    const res = await axios.post(`${API_BASE}/mediation/reset`);
    return res.data;
  },
  submitObjection: async (data) => {
    const res = await axios.post(`${API_BASE}/negotiation/object`, data);
    return res.data;
  },
  acceptProposal: async (data) => {
    const res = await axios.post(`${API_BASE}/negotiation/accept`, data);
    return res.data;
  },
  getNegotiation: async (id) => {
    const res = await axios.get(`${API_BASE}/negotiation/${id}`);
    return res.data;
  },

  // Agreements & Audit Logs
  getAgreement: async (id) => {
    const res = await axios.get(`${API_BASE}/agreement/${id}`);
    return res.data;
  },
  getAuditLogs: async (id) => {
    const res = await axios.get(`${API_BASE}/audit-logs/${id}`);
    return res.data;
  },

  // AgriEvidence Engine
  analyzeCropEvidence: async (formData) => {
    const res = await axios.post(`${API_BASE}/crop-evidence/analyze`, formData);
    return res.data;
  },
  getCropEvidenceHistory: async (farmerId) => {
    const res = await axios.get(`${API_BASE}/crop-evidence/farmer/${farmerId}`);
    return res.data;
  },
  reassessMediationWithEvidence: async (data) => {
    const res = await axios.post(`${API_BASE}/crop-evidence/reassess`, data);
    return res.data;
  },
  challengeCropEvidence: async (data) => {
    const res = await axios.post(`${API_BASE}/crop-evidence/challenge`, data);
    return res.data;
  },

  // Authentication
  login: async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return res.data;
  },
  register: async (data) => {
    const res = await axios.post(`${API_BASE}/auth/register`, data);
    return res.data;
  },
  quickLogin: async (preset) => {
    const res = await axios.post(`${API_BASE}/auth/quick-login`, { preset });
    return res.data;
  },
  getMe: async (token) => {
    const res = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
