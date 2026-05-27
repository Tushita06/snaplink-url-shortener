import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
        {/* Glow Effects in background */}
        <div className="absolute w-72 h-72 rounded-full bg-violet-600/10 blur-[100px] animate-pulse-slow"></div>
        
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-stone-400 text-sm font-medium tracking-widest animate-pulse font-display uppercase">
          Initializing SnapLink...
        </p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
