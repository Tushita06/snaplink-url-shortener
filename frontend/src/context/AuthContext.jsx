import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Toast State
  const [toast, setToast] = useState({ message: '', type: 'success', active: false });

  // Custom Toast Trigger
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type, active: true });
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, active: false }));
    }, 4000);
  };

  // Restore session on mount
  useEffect(() => {
    const checkAuthSession = async () => {
      const token = localStorage.getItem('snaplink_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient('/auth/me');
        if (response.success) {
          setUser(response.user);
        } else {
          localStorage.removeItem('snaplink_token');
        }
      } catch (err) {
        console.error('Session restoration failed:', err.message);
        localStorage.removeItem('snaplink_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  // Signup method
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await apiClient('/auth/signup', {
        method: 'POST',
        body: { name, email, password }
      });

      if (data.success) {
        localStorage.setItem('snaplink_token', data.token);
        setUser(data.user);
        triggerToast(`Welcome to SnapLink, ${data.user.name}!`, 'success');
        return true;
      }
      return false;
    } catch (error) {
      triggerToast(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login method
  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (data.success) {
        localStorage.setItem('snaplink_token', data.token);
        setUser(data.user);
        triggerToast(`Welcome back, ${data.user.name}!`, 'success');
        return true;
      }
      return false;
    } catch (error) {
      triggerToast(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('snaplink_token');
    setUser(null);
    triggerToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, toast, triggerToast }}>
      {children}
      
      {/* Premium Glassmorphic Toast Notification Alert Box */}
      {toast.active && (
        <div className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xl glass-card animate-bounce-slow max-w-sm w-full transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' 
            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' 
            : toast.type === 'error'
            ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
            : 'border-violet-500/30 bg-violet-950/20 text-violet-300'
        }`}>
          {toast.type === 'success' && (
            <svg className="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-5 h-5 flex-shrink-0 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
