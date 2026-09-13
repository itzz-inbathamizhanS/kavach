import React, { useState, useEffect } from 'react';

export function ReputationPanel({ isOpen, onClose, indicatorValue, indicatorType }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !indicatorValue) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        if (indicatorType === 'IP address') {
          // Fetch from free IP API
          const response = await fetch(`https://ipapi.co/${indicatorValue}/json/`);
          if (!response.ok) throw new Error('Failed to fetch IP intel');
          const result = await response.json();
          
          if (result.error) {
            throw new Error(result.reason || 'Invalid IP');
          }

          // Mock some Threat Intel data to go along with the real IP data
          setData({
            ...result,
            threatScore: Math.floor(Math.random() * 30) + 70, // 70-100
            reports: Math.floor(Math.random() * 50) + 5,
            lastSeen: 'Just now'
          });
        } else {
          // Simulate Domain data
          await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay
          setData({
            city: 'Redacted',
            region: 'Redacted',
            country_name: 'Unknown',
            asn: 'AS-UNKNOWN',
            org: 'Hidden Registrar',
            threatScore: Math.floor(Math.random() * 20) + 80, // 80-100
            reports: Math.floor(Math.random() * 200) + 20,
            lastSeen: 'Just now'
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, indicatorValue, indicatorType]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-primary/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-page-bg border-l border-border-hairline shadow-2xl flex flex-col transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-space-md border-b border-border-hairline">
          <h2 className="font-headline-h2 text-headline-h2 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">policy</span>
            Threat Intel Lookup
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-panel transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-lg">
          
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">{indicatorType}</span>
            <span className="font-code-sm text-lg text-on-surface select-all break-all">{indicatorValue}</span>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="material-symbols-outlined animate-spin text-secondary">sync</span>
              <span className="font-body-sm text-secondary">Fetching real-time intel...</span>
            </div>
          )}

          {error && (
            <div className="p-space-sm rounded bg-danger-bg border border-danger-text/20 text-danger-text font-body-sm">
              Error: {error}
            </div>
          )}

          {!isLoading && data && (
            <>
              {/* Threat Score Section */}
              <div className="bg-surface-panel rounded-lg p-space-md flex flex-col gap-space-sm border border-border-hairline">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-secondary">AbuseIPDB Score</span>
                  <span className={`px-2 py-0.5 rounded font-label-sm text-on-error ${data.threatScore > 80 ? 'bg-danger-text' : 'bg-warning-text'}`}>
                    {data.threatScore > 80 ? 'CRITICAL' : 'HIGH'}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-headline-h1 text-4xl font-bold text-on-surface">{data.threatScore}</span>
                  <span className="font-label-md text-secondary mb-1">/ 100</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${data.threatScore > 80 ? 'bg-danger-text' : 'bg-warning-text'}`} 
                    style={{ width: `${data.threatScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Geo & Network Section */}
              <div className="flex flex-col gap-space-sm">
                <h3 className="font-label-md text-secondary border-b border-border-hairline pb-2">Network & Location</h3>
                <div className="grid grid-cols-2 gap-space-sm mt-2">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-secondary">ISP / Org</span>
                    <span className="font-body-sm text-on-surface">{data.org || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-secondary">ASN</span>
                    <span className="font-body-sm text-on-surface">{data.asn || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-secondary">Country</span>
                    <span className="font-body-sm text-on-surface">{data.country_name || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-secondary">City / Region</span>
                    <span className="font-body-sm text-on-surface">{(data.city && data.region) ? `${data.city}, ${data.region}` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="flex flex-col gap-space-sm">
                <h3 className="font-label-md text-secondary border-b border-border-hairline pb-2">Recent Activity</h3>
                <div className="grid grid-cols-2 gap-space-sm mt-2">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-secondary">Recent Reports</span>
                    <span className="font-body-sm text-on-surface font-medium">{data.reports}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-secondary">Last Seen</span>
                    <span className="font-body-sm text-on-surface">{data.lastSeen}</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
        
        {/* Footer Actions */}
        <div className="p-space-md border-t border-border-hairline bg-surface flex justify-end gap-space-sm">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border border-border-hairline text-on-surface hover:bg-surface-panel transition-colors font-label-md"
          >
            Close
          </button>
          <a 
            href={`https://www.abuseipdb.com/check/${indicatorValue}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded bg-primary text-on-primary hover:opacity-90 transition-opacity font-label-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View Full Report
          </a>
        </div>
      </div>
    </>
  );
}
