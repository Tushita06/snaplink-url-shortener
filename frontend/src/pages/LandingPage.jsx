import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, BarChart3, Shield, Zap, ArrowRight, Check } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [sandboxResult, setSandboxResult] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSandboxShorten = async (e) => {
    e.preventDefault();
    if (!sandboxUrl) return;

    try {
      setIsShortening(true);
      // Simulate sandbox shortener delay for premium UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Since it's anonymous, generate a visual random shortlink
      const randomCode = Math.random().toString(36).substring(2, 8);
      const backendPort = 5000;
      setSandboxResult(`${window.location.hostname}:${backendPort}/${randomCode}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsShortening(false);
    }
  };

  const handleCopySandbox = async () => {
    if (!sandboxResult) return;
    try {
      await navigator.clipboard.writeText(`${window.location.protocol}//${sandboxResult}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-600/5 blur-[130px] pointer-events-none"></div>
      
      {/* Grid glow background */}
      <div className="absolute inset-0 grid-glow-layer pointer-events-none opacity-20"></div>

      {/* Navigation */}
      <header className="relative z-20 border-b border-stone-900/50 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors shadow-glow-primary duration-300">
              <LinkIcon className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text font-display">
              Snap<span className="text-primary font-light">Link</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-glow-primary transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-text-secondary hover:text-primary transition-colors py-2 px-4"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-20">
        
        {/* Metric Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold tracking-wider uppercase mb-8 select-none">
          <Zap className="w-3 h-3 text-primary animate-pulse" />
          The Developer's Choice Link Management Platform
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text font-display leading-[1.1] max-w-3xl">
          Smarter links.<br />
          <span className="text-gradient">Deeper audience insights.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed font-medium">
          Create, customize, and secure memorable URL shortcuts. Track visitor behavior, devices, browsers, and locations from one clean dashboard.
        </p>

        {/* Anonymous Sandbox Shortener Form */}
        <div className="mt-12 w-full max-w-lg">
          <div className="glass-card p-4 rounded-2xl border-stone-800/80 shadow-2xl relative">
            <form onSubmit={handleSandboxShorten} className="flex gap-2">
              <input
                type="text"
                required
                value={sandboxUrl}
                onChange={(e) => setSandboxUrl(e.target.value)}
                placeholder="Paste your long URL here to try..."
                className="flex-1 px-4 py-3 border rounded-xl glass-input text-text text-xs"
              />
              <button
                type="submit"
                disabled={isShortening}
                className="py-3 px-5 border border-transparent rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-glow-primary transition-all duration-200 flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50"
              >
                {isShortening ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Shorten
                    <Zap className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Sandbox Result */}
            {sandboxResult && (
              <div className="mt-4 pt-4 border-t border-stone-800/60 flex items-center justify-between text-left animate-pulse-slow">
                <div>
                  <p className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider">
                    Sandbox Code Generated
                  </p>
                  <p className="text-xs font-mono font-bold text-primary mt-1 select-all">
                    {sandboxResult}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopySandbox}
                    className="py-2 px-3 border border-stone-800 hover:border-stone-700 hover:bg-stone-800 text-stone-300 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      'Copy Link'
                    )}
                  </button>
                  <Link
                    to="/register"
                    className="py-2 px-3 bg-primary/10 border border-primary/20 text-primary hover:bg-primary-hover/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    Save link
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
          
          {/* Feature 1 */}
          <div className="glass-card p-6 rounded-2xl border-stone-800/50 hover:border-stone-800 hover:bg-stone-900/10 transition-all">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 w-fit text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-text mt-4 font-display">Instant Core Engine</h3>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Generate unique short codes in microseconds. Support customizable branded aliases and optional expiry schedules seamlessly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-6 rounded-2xl border-stone-800/50 hover:border-stone-800 hover:bg-stone-900/10 transition-all">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 w-fit text-accent">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-text mt-4 font-display">Advanced Analytics</h3>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Aggregate deep browser, system OS, geolocations, and devices splits dynamically using modern interactive Area Charts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-6 rounded-2xl border-stone-800/50 hover:border-stone-800 hover:bg-stone-900/10 transition-all">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 w-fit text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-text mt-4 font-display">Account Isolation</h3>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Keep links secure and completely private to your profile. Safeguard your traffic with robust JWT-based credentials encryption.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-stone-900/50 py-6 bg-stone-950/20 mt-12 text-center text-xs text-stone-500 font-medium">
        &copy; {new Date().getFullYear()} SnapLink. Built for elite creators and developers.
      </footer>
    </div>
  );
};

export default LandingPage;
