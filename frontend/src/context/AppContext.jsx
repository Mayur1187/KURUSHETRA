import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [farmers, setFarmers] = useState([]);
  const [waterResource, setWaterResource] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [activeMediation, setActiveMediation] = useState(null);
  const [activeAgreement, setActiveAgreement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [fData, wData, cData] = await Promise.all([
        api.getFarmers(),
        api.getWaterResource(),
        api.getConflicts()
      ]);
      if (fData.success) setFarmers(fData.farmers);
      if (wData.success) setWaterResource(wData.water_resource);
      if (cData.success) setConflicts(cData.conflicts);
      setError(null);
    } catch (err) {
      console.error("Error loading application state:", err);
      setError("Failed to connect to JalSangam backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStartMediation = async () => {
    setLoading(true);
    try {
      const res = await api.startMediation();
      if (res.success) {
        setActiveMediation(res.data);
        return res.data;
      }
    } catch (err) {
      console.error("Failed to start mediation:", err);
      setError("Error starting AI mediation process.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitObjection = async (farmerId, objectionText) => {
    setLoading(true);
    try {
      const negId = activeMediation?.negotiation_id || 'neg-1';
      const res = await api.submitObjection({
        negotiation_id: negId,
        farmer_id: farmerId,
        objection_message: objectionText
      });
      if (res.success) {
        setActiveMediation(prev => ({
          ...prev,
          revised_data: res.data,
          final_agreement: res.data.final_agreement
        }));
        setActiveAgreement(res.data.final_agreement);
        return res.data;
      }
    } catch (err) {
      console.error("Objection processing failed:", err);
      setError("Failed to process natural language objection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSystem = async () => {
    setLoading(true);
    try {
      await api.resetMediation();
      setActiveMediation(null);
      setActiveAgreement(null);
      await refreshData();
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      farmers,
      waterResource,
      conflicts,
      activeMediation,
      activeAgreement,
      loading,
      error,
      refreshData,
      handleStartMediation,
      handleSubmitObjection,
      handleResetSystem,
      setWaterResource
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
