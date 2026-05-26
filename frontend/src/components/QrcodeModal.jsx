import React, { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QrcodeModal = ({ isOpen, onClose, shortUrl, title }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { triggerToast } = useAuth();

  if (!isOpen) return null;

  // Visual Short URL representation
  const absoluteShortUrl = shortUrl.startsWith('http') 
    ? shortUrl 
    : `${window.location.protocol}//${shortUrl}`;

  // QR Code API Url
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=ffffff&bgcolor=121215&margin=15&data=${encodeURIComponent(absoluteShortUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteShortUrl);
      setIsCopied(true);
      triggerToast('Short URL copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Fetch as a blob to allow direct down-file renaming in browsers
      const response = await fetch(qrCodeApiUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      // Sanitize title for filename
      const safeTitle = (title || 'snaplink-qr').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `snaplink-qr-${safeTitle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      triggerToast('QR Code downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download QR code blob:', err);
      triggerToast('Failed to download image. Try right-clicking the QR code.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="glass-card rounded-2xl max-w-sm w-full p-6 relative z-10 scale-100 opacity-100 transition-transform duration-300 shadow-glow-primary border-violet-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white font-display">
            Generate QR Code
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-inner group">
            {/* Glowing Backdrop behind QR code */}
            <div className="absolute inset-0 bg-violet-600/10 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            
            <img 
              src={qrCodeApiUrl} 
              alt={`QR Code for ${absoluteShortUrl}`}
              className="w-48 h-48 relative z-10 rounded-lg select-none"
            />
          </div>

          <div className="text-center">
            <h4 className="text-sm font-semibold text-zinc-200 truncate max-w-[260px]">
              {title || 'SnapLink Shortened URL'}
            </h4>
            <a 
              href={absoluteShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-violet-400 hover:underline mt-1 select-all font-mono inline-block"
            >
              {absoluteShortUrl}
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-zinc-800 pt-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-all duration-200"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied Link
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-400" />
                Copy Link
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-glow-primary transition-all duration-200 disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrcodeModal;
