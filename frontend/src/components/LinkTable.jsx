import React, { useState } from 'react';
import { Copy, Check, BarChart2, QrCode, Trash2, Edit2, CheckSquare, XSquare, Search, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LinkTable = ({ 
  urls, 
  loading, 
  onDelete, 
  onUpdate, 
  onOpenQr, 
  onOpenAnalytics, 
  searchTerm, 
  setSearchTerm,
  filterType,
  setFilterType
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const { triggerToast } = useAuth();

  // Helper to format visual dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to construct fully qualified short links
 const getAbsoluteShortUrl = (code) => {
  return `snaplink-backend-6fum.onrender.com/${code}`;
};

  const handleCopy = async (code, id) => {
    const fullUrl = `${window.location.protocol}//${getAbsoluteShortUrl(code)}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      triggerToast('Short URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (url) => {
    setEditingId(url._id);
    setEditUrl(url.originalUrl);
    setEditExpiry(url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditUrl('');
    setEditExpiry('');
  };

  const handleSaveEdit = async (id) => {
    if (!editUrl) return;
    
    // Normalize url
    let normalized = editUrl.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }

    const payload = {
      originalUrl: normalized,
      expiresAt: editExpiry ? new Date(editExpiry).toISOString() : null
    };

    const success = await onUpdate(id, payload);
    if (success) {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-stone-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border rounded-xl glass-input text-white text-xs"
            placeholder="Search links, titles..."
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-stone-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block py-2 pl-3 pr-8 border rounded-xl glass-input text-white text-xs select-none cursor-pointer"
          >
            <option value="all">All Links</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Table Card wrapper */}
      <div className="glass-card rounded-2xl overflow-hidden border border-stone-800/80 shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
              <p className="text-xs text-stone-500 font-display animate-pulse uppercase tracking-widest font-semibold">
                Refreshing Link Vault...
              </p>
            </div>
          ) : urls.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center p-6 space-y-4">
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-2xl">
                <Search className="w-8 h-8 text-stone-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-300 font-display">No Links Found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  {searchTerm 
                    ? "We couldn't find any results matching your search queries. Try redefining filters."
                    : "Your link vault is empty! Shorten your first long URL to kickstart tracking analytics."}
                </p>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-stone-800/80">
              <thead className="bg-stone-950/40 text-[10px] uppercase tracking-wider font-extrabold text-text select-none border-b border-stone-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">Link Details</th>
                  <th scope="col" className="px-6 py-4 text-left">Short URL</th>
                  <th scope="col" className="px-6 py-4 text-center">Clicks</th>
                  <th scope="col" className="px-6 py-4 className text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 bg-transparent text-sm">
                {urls.map((url) => {
                  const isEditing = editingId === url._id;
                  const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();

                  return (
                    <tr key={url._id} className="hover:bg-stone-900/20 transition-colors">
                      
                      {/* Original Link Details */}
                      <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              className="block w-full px-3 py-1.5 border rounded-lg glass-input text-text text-xs"
                              placeholder="Edit original url"
                            />
                            <div className="flex gap-2 items-center">
                              <label className="text-[10px] text-text font-extrabold uppercase">
                                Expiry Date:
                              </label>
                              <input
                                type="date"
                                value={editExpiry}
                                onChange={(e) => setEditExpiry(e.target.value)}
                                className="px-2 py-0.5 border rounded-lg glass-input text-text text-[10px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold text-text truncate font-display tracking-wide">
                              {url.title || 'Untitled Link'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-text truncate max-w-[200px] sm:max-w-[260px] select-all font-mono leading-tight">
                                {url.originalUrl}
                              </span>
                              <a 
                                href={url.originalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-stone-500 hover:text-violet-400 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            <span className="text-[10px] text-text">
                              Created: {formatDate(url.createdAt)}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Short Link Cell */}
                      <td className="px-6 py-4 font-mono text-xs select-all font-semibold text-violet-400">
                        <a 
                          href={`${window.location.protocol}//${getAbsoluteShortUrl(url.shortCode)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-violet-300 flex items-center gap-1 group/link w-fit"
                        >
                          {getAbsoluteShortUrl(url.shortCode)}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </td>

                      {/* Total Clicks */}
                      <td className="px-6 py-4 text-center font-mono font-bold text-white text-sm">
                        {url.clicks}
                      </td>

                      {/* Expiry / Active Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border select-none ${
                          isExpired 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2.5">
                            <button
                              onClick={() => handleSaveEdit(url._id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-950/20 border border-transparent hover:border-emerald-500/20 text-emerald-400 transition-all duration-200"
                              title="Save Changes"
                            >
                              <CheckSquare className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 rounded-lg hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 text-rose-400 transition-all duration-200"
                              title="Cancel Edit"
                            >
                              <XSquare className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end items-center gap-1">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(url.shortCode, url._id)}
                              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                              title="Copy Short Link"
                            >
                              {copiedId === url._id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Analytics Panel */}
                            <button
                              onClick={() => onOpenAnalytics(url._id)}
                              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                              title="View Detailed Analytics"
                            >
                              <BarChart2 className="w-4 h-4" />
                            </button>

                            {/* QR Code */}
                            <button
                              onClick={() => onOpenQr(getAbsoluteShortUrl(url.shortCode), url.title)}
                              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                              title="Show QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => startEditing(url)}
                              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                              title="Edit Destination Link"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this shortened URL? This will permanently wipe all associated click history!")) {
                                  onDelete(url._id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-rose-950/20 text-stone-400 hover:text-rose-400 transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkTable;
