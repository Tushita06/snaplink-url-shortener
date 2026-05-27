import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';
import confetti from 'canvas-confetti';
import { 
  Link as LinkIcon, 
  Plus, 
  Zap, 
  Calendar, 
  LogOut, 
  BarChart3, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  MousePointerClick
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import LinkTable from '../components/LinkTable';
import QrcodeModal from '../components/QrcodeModal';
import AnalyticsDrawer from '../components/AnalyticsDrawer';

const Dashboard = () => {
  const { user, logout, triggerToast } = useAuth();

  // URL Creation States
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Table and Search states
  const [urls, setUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // QR Modal States
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrTitle, setQrTitle] = useState('');

  // Analytics Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeUrlId, setActiveUrlId] = useState(null);

  // Fetch URLs based on search and filters
  const fetchUrls = async () => {
    try {
      setLoadingUrls(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterType !== 'all') queryParams.append('filter', filterType);
      
      const response = await apiClient(`/urls?${queryParams.toString()}`);
      if (response.success) {
        setUrls(response.urls);
      }
    } catch (err) {
      console.error('Failed to load user URLs:', err.message);
    } finally {
      setLoadingUrls(false);
    }
  };

  // Fetch Aggregated Dashboard statistics
  const fetchGlobalStats = async () => {
    try {
      setLoadingStats(true);
      const response = await apiClient('/analytics/dashboard');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  // Run searches when inputs change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUrls();
    }, 400); // 400ms debounce to prevent spamming db on every keystroke

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterType]);

  // Initial stats fetch
  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Create standard Short URL
  const handleCreateUrl = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    try {
      setIsCreating(true);
      
      const payload = {
        originalUrl,
        ...(customAlias ? { customAlias } : {}),
        ...(expiresAt ? { expiresAt } : {})
      };

      const response = await apiClient('/urls', {
        method: 'POST',
        body: payload
      });

      if (response.success) {
        // Trigger celebratory confetti explosion!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#8b5cf6', '#06b6d4', '#ec4899', '#ffffff']
        });

        triggerToast('URL Shortened successfully!', 'success');
        
        // Reset creation inputs
        setOriginalUrl('');
        setCustomAlias('');
        setExpiresAt('');

        // Refresh views
        fetchUrls();
        fetchGlobalStats();
      }
    } catch (error) {
      triggerToast(error.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Update target destination path
  const handleUpdateUrl = async (id, payload) => {
    try {
      const response = await apiClient(`/urls/${id}`, {
        method: 'PUT',
        body: payload
      });
      if (response.success) {
        triggerToast('URL details updated!', 'success');
        fetchUrls();
        fetchGlobalStats();
        return true;
      }
      return false;
    } catch (error) {
      triggerToast(error.message, 'error');
      return false;
    }
  };

  // Delete short link cascade
  const handleDeleteUrl = async (id) => {
    try {
      const response = await apiClient(`/urls/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        triggerToast('Shortlink deleted successfully!', 'success');
        fetchUrls();
        fetchGlobalStats();
      }
    } catch (error) {
      triggerToast(error.message, 'error');
    }
  };

  // QR Modal triggers
  const openQrModal = (url, title) => {
    setQrUrl(url);
    setQrTitle(title);
    setQrOpen(true);
  };

  // Analytics side-drawer triggers
  const openAnalyticsDrawer = (id) => {
    setActiveUrlId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative pb-20">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] rounded-full bg-sky-600/5 blur-[150px] pointer-events-none"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-glow-layer pointer-events-none opacity-10"></div>

      {/* Dashboard Top Navigation */}
      <header className="relative z-20 border-b border-stone-900/60 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-glow-primary">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text font-display">
              Snap<span className="text-primary font-light">Link</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-stone-400 hidden sm:inline select-none">
              Signed in as: <span className="text-stone-200">{user?.name || user?.email}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold text-stone-400 hover:text-white border border-stone-800 hover:border-stone-700 bg-stone-900/40 hover:bg-stone-800/40 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 relative z-10">
        
        {/* Welcome Banner */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text font-display">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Aggregate your metrics, customize code parameters, and handle short links instantly.
          </p>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Total Links */}
          <div className="glass-card p-5 rounded-2xl border-stone-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest font-extrabold uppercase text-stone-500 font-display">
                Total Links
              </span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/25">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3.5">
              {loadingStats ? (
                <div className="h-7 w-12 bg-stone-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-2xl font-black text-text font-display">
                  {stats?.totalLinks || 0}
                </span>
              )}
              <p className="text-[9px] text-stone-500 mt-0.5 font-medium">Short urls generated</p>
            </div>
          </div>

          {/* Card 2: Total Clicks */}
          <div className="glass-card p-5 rounded-2xl border-stone-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest font-extrabold uppercase text-stone-500 font-display">
                Total Clicks
              </span>
              <div className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/25">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3.5">
              {loadingStats ? (
                <div className="h-7 w-12 bg-stone-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-2xl font-black text-text font-display">
                  {stats?.totalClicks || 0}
                </span>
              )}
              <p className="text-[9px] text-stone-500 mt-0.5 font-medium">Redirect events logged</p>
            </div>
          </div>

          {/* Card 3: Active Links */}
          <div className="glass-card p-5 rounded-2xl border-stone-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest font-extrabold uppercase text-stone-500 font-display">
                Link Health
              </span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/25">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3.5">
              {loadingStats ? (
                <div className="h-7 w-12 bg-stone-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-2xl font-black text-text font-display">
                  {stats?.totalLinks > 0 ? '100%' : '0%'}
                </span>
              )}
              <p className="text-[9px] text-stone-500 mt-0.5 font-medium">Active operational paths</p>
            </div>
          </div>

          {/* Card 4: Most Active URL */}
          <div className="glass-card p-5 rounded-2xl border-stone-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest font-extrabold uppercase text-stone-500 font-display">
                Top Performer
              </span>
              <div className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/25">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3.5">
              {loadingStats ? (
                <div className="h-7 w-20 bg-stone-800 rounded animate-pulse"></div>
              ) : stats?.mostActiveLink ? (
                <div className="truncate">
                  <span className="text-sm font-extrabold text-text font-display leading-tight truncate block max-w-[160px]">
                    {stats.mostActiveLink.title || stats.mostActiveLink.shortCode}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-accent block mt-0.5">
                    {stats.mostActiveLink.clicks} clicks logged
                  </span>
                </div>
              ) : (
                <span className="text-sm font-extrabold text-stone-500 font-display block py-1 select-none">
                  No clicks yet
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Shortener Core Hub Input Panel */}
        <div className="glass-card p-6 rounded-3xl border-stone-800 relative overflow-hidden">
          {/* Glowing blur */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <h2 className="text-base font-extrabold text-text font-display flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Shorten a new URL
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Configure target routes, custom aliasing keys, and expiration dates.</p>

          <form onSubmit={handleCreateUrl} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              
              {/* Destination URL */}
              <div className="md:col-span-1">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5 font-display select-none">
                  Destination URL
                </label>
                <input
                  type="text"
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="e.g. docs.google.com/spreadsheets/d/1..."
                  className="block w-full px-3.5 py-2.5 border rounded-xl glass-input text-text text-xs"
                />
              </div>

              {/* Custom Alias */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5 font-display select-none">
                  Custom Alias (Optional)
                </label>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="e.g. promo-spring"
                  className="block w-full px-3.5 py-2.5 border rounded-xl glass-input text-text text-xs"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5 font-display select-none">
                  Link Expiry Date (Optional)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border rounded-xl glass-input text-text text-xs select-none cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Form Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-1.5 py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-glow-primary transition-all duration-200 disabled:opacity-50"
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Shorten Link
                    <Zap className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Analytics Chart & Activity Splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recharts click progression Area Chart */}
          <div className="glass-card p-6 rounded-3xl border-stone-800/80 shadow-2xl lg:col-span-2">
            <div className="flex items-center justify-between mb-4 select-none">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 font-display">
                  Daily click traffic
                </h3>
                <p className="text-[10px] text-stone-500 mt-0.5">Click actions counted over the past 7 days</p>
              </div>
<TrendingUp className="w-4 h-4 text-primary" />
            </div>

            <div className="h-56 w-full bg-stone-950/20 border border-stone-800 p-2 rounded-2xl shadow-inner">
              {loadingStats ? (
                <div className="h-full flex items-center justify-center text-xs text-stone-500">
                  Calculating daily metrics...
                </div>
              ) : stats?.timeline.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-stone-600 font-medium">
                  No clicks registered yet. Share your shortcodes to capture logs.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.timeline} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="glowColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#57534e" 
                      fontSize={9} 
                      tickLine={false} 
                      tickFormatter={(tick) => tick.substring(8, 10)} // Show only date number
                    />
                    <YAxis stroke="#57534e" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#161d26', 
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#fff'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#8b5cf6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#glowColor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent visit logs List */}
          <div className="glass-card p-6 rounded-3xl border-stone-800/80 shadow-2xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-4 font-display flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" />
              Live Activity feed
            </h3>

            {loadingStats ? (
              <div className="space-y-3.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex space-x-3 items-start animate-pulse">
                    <div className="h-6 w-6 rounded-full bg-stone-800 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-stone-800 rounded w-1/2"></div>
                      <div className="h-2 bg-stone-800 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats || stats.recentClicks.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center p-4">
                <p className="text-xs text-stone-600 font-medium max-w-[200px] leading-relaxed select-none">
                  Your activity feed is empty. Visit logs appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[224px] overflow-y-auto pr-1 scrollbar-thin">
                {stats.recentClicks.map((click, index) => (
                  <div key={index} className="flex gap-3 text-xs leading-normal items-start p-2 rounded-xl bg-stone-950/20 border border-stone-800 hover:border-stone-800/60 transition-all">
                    <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-primary font-mono text-[9px] font-bold">
                      {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-300 truncate">
                        {click.urlId?.title || click.urlId?.shortCode || 'Target Link'}
                      </p>
                      <p className="text-[9px] text-stone-500 mt-0.5 truncate">
                        Browser: {click.browser} &bull; Country: {click.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Detailed Links Management Data Table */}
        <div className="space-y-3">
          <div className="select-none">
            <h3 className="text-sm font-extrabold text-text font-display">
              Link Vault
            </h3>
            <p className="text-xs text-stone-400">Search, filter, and inspect generated code parameters</p>
          </div>
          
          <LinkTable 
            urls={urls}
            loading={loadingUrls}
            onDelete={handleDeleteUrl}
            onUpdate={handleUpdateUrl}
            onOpenQr={openQrModal}
            onOpenAnalytics={openAnalyticsDrawer}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
          />
        </div>

      </main>

      {/* Global customized QR code generator Modal */}
      <QrcodeModal 
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={qrUrl}
        title={qrTitle}
      />

      {/* Global Individual link metrics analytics Drawer */}
      <AnalyticsDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        urlId={activeUrlId}
      />
    </div>
  );
};

export default Dashboard;
