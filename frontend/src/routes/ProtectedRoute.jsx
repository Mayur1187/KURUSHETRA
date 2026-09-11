import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400">
        <div className="flex items-center space-x-3 bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold text-slate-200">Authenticating JalSangam Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
