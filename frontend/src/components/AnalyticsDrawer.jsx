import React, { useState, useEffect } from 'react';
import { X, Calendar, Globe, Monitor, Compass, Activity, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsDrawer = ({ isOpen, onClose, urlId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isOpen || !urlId) return;

    const fetchIndividualStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/analytics/url/${urlId}`);
        if (response.success) {
          setData(response);
        }
      } catch (err) {
        console.error('Failed to load single link analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndividualStats();
  }, [isOpen, urlId]);

  if (!isOpen) return null;

  // Helper to calculate ratios
  const renderProgressBar = (value, total, colorClass = 'bg-violet-500') => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
          <div 
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md glass-card border-l border-zinc-800/80 shadow-2xl flex flex-col h-full">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-400" />
                Link Metrics
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time click statistics</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-400 font-medium font-display animate-pulse uppercase tracking-wider">
                  Loading metrics...
                </p>
              </div>
            ) : data ? (
              <>
                {/* Link Summary Card */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <span className="text-[10px] tracking-widest font-extrabold uppercase text-violet-400 font-display">
                    Destination URL
                  </span>
                  <a 
                    href={data.url.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white hover:text-violet-400 transition-colors flex items-center gap-1.5 break-all leading-tight"
                  >
                    {data.url.title || data.url.originalUrl}
                    <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                  </a>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created: {new Date(data.url.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Main Clicks Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 shadow-inner text-center">
                    <span className="text-2xl font-black text-white font-display">
                      {data.url.clicks}
                    </span>
                    <p className="text-[10px] text-zinc-500 font-extrabold tracking-wider uppercase mt-1">
                      Total Visits
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 shadow-inner text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      data.url.expiresAt && new Date(data.url.expiresAt) <= new Date()
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {data.url.expiresAt && new Date(data.url.expiresAt) <= new Date() ? 'Expired' : 'Active'}
                    </span>
                    <p className="text-[10px] text-zinc-500 font-extrabold tracking-wider uppercase mt-2.5">
                      Link Status
                    </p>
                  </div>
                </div>

                {/* Click Timeline chart */}
                <div>
                  <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-400 mb-3 font-display">
                    Timeline (Past 7 Days)
                  </h3>
                  <div className="h-44 w-full bg-zinc-950/40 border border-zinc-850 p-2 rounded-xl">
                    {data.stats.totalClicks === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-zinc-600 font-medium">
                        No recent click events
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.stats.timeline} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <defs>
                            <linearGradient id="drawerGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            stroke="#52525b" 
                            fontSize={9} 
                            tickLine={false} 
                            tickFormatter={(tick) => tick.substring(8, 10)} // Show only day index
                          />
                          <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              background: '#121215', 
                              border: '1px solid #27272a',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: '#fff'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#drawerGlow)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Device Breakdown */}
                <div>
                  <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-400 mb-3 font-display flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-zinc-500" />
                    Devices
                  </h3>
                  {data.stats.devices.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No device records yet</p>
                  ) : (
                    <div className="space-y-3.5">
                      {data.stats.devices.map((device, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-300">{device.name}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">{device.value} clicks</span>
                          </div>
                          {renderProgressBar(device.value, data.stats.totalClicks, 'bg-violet-500')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Browser Breakdown */}
                <div>
                  <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-400 mb-3 font-display flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-zinc-500" />
                    Browsers
                  </h3>
                  {data.stats.browsers.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No browser records yet</p>
                  ) : (
                    <div className="space-y-3.5">
                      {data.stats.browsers.map((browser, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-300">{browser.name}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">{browser.value} clicks</span>
                          </div>
                          {renderProgressBar(browser.value, data.stats.totalClicks, 'bg-cyan-500')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Country Breakdown */}
                <div>
                  <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-400 mb-3 font-display flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-zinc-500" />
                    Top Geolocations
                  </h3>
                  {data.stats.countries.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No location records yet</p>
                  ) : (
                    <div className="space-y-3.5">
                      {data.stats.countries.map((country, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-300">{country.name}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">{country.value} clicks</span>
                          </div>
                          {renderProgressBar(country.value, data.stats.totalClicks, 'bg-emerald-500')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent click logs feed */}
                <div>
                  <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-400 mb-3 font-display">
                    Recent Clicks Log
                  </h3>
                  {data.stats.clickLogs.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No click logs recorded yet</p>
                  ) : (
                    <div className="flow-root bg-zinc-950/30 border border-zinc-850 p-2.5 rounded-xl max-h-60 overflow-y-auto scrollbar-thin">
                      <ul className="-mb-8">
                        {data.stats.clickLogs.map((log, idx) => (
                          <li key={idx}>
                            <div className="relative pb-8">
                              {idx !== data.stats.clickLogs.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-zinc-850" aria-hidden="true"></span>
                              ) : null}
                              <div className="relative flex space-x-3 items-start">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono text-violet-400">
                                    {idx + 1}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-xs font-semibold text-zinc-300">
                                      {log.browser} ({log.os})
                                    </p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">
                                      IP: {log.ip} &bull; Geolocation: {log.country}
                                    </p>
                                  </div>
                                  <div className="text-right text-[10px] whitespace-nowrap text-zinc-500 font-medium">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-xs text-zinc-600 italic">Failed to retrieve data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDrawer;
