import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

interface UpdateMetadata {
  lastUpdated: string;
  lastUpdatedDate: string;
  timestamp: number;
}

export default function LastUpdateBadge() {
  const [metadata, setMetadata] = useState<UpdateMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/data/update-metadata.json');
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (error) {
        console.error('Failed to fetch update metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  if (isLoading || !metadata) {
    return null;
  }

  return (
    <div className="relative">
      <div
        // non-interactive: tooltip on hover only to avoid client-side triggers
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-arc-orange/10 border border-arc-orange/20 text-arc-orange text-xs font-mono font-semibold tracking-wider transition-all duration-200"
        title={`Datos actualizados: ${metadata.lastUpdatedDate}`}
        role="status"
        aria-label={`Actualizado: ${metadata.lastUpdatedDate}`}
      >
        <Clock className="w-3 h-3" />
        <span className="hidden sm:inline">Actualizado</span>
      </div>

      {showTooltip && (
        <div className="absolute right-0 mt-2 p-3 rounded-lg bg-arc-dark border border-arc-orange/30 text-arc-orange text-xs whitespace-nowrap shadow-lg shadow-arc-orange/20">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            <span>{metadata.lastUpdatedDate}</span>
          </div>
        </div>
      )}
    </div>
  );
}
