import React from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, AlertTriangle, ArrowRight } from 'lucide-react';

const ExpiredPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-rose-600/5 blur-[100px] pointer-events-none"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-glow-layer pointer-events-none opacity-20"></div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-glow-primary">
            <LinkIcon className="h-5 w-5 text-violet-400" />
          </div>
          <span className="text-xl font-extrabold text-white font-display">
            Snap<span className="text-violet-400 font-light">Link</span>
          </span>
        </Link>

        {/* Glassmorphic Expiry Alert Card */}
        <div className="glass-card p-8 rounded-3xl border-rose-500/20 shadow-2xl relative">
          {/* Neon warning icon */}
          <div className="mx-auto p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl w-fit text-rose-400 mb-5 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            Link Expiration Reached
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-3 leading-relaxed font-medium">
            This shortened address has reached its specified schedule expiry date or was disabled by its owner. The destination path is no longer available.
          </p>

          <div className="mt-8 border-t border-stone-800/80 pt-6">
            <Link
              to="/"
              className="w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-glow-primary transition-all duration-200"
            >
              Shorten your own links
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-stone-600 font-semibold tracking-wide select-none">
          &copy; {new Date().getFullYear()} SnapLink URL Manager. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default ExpiredPage;
