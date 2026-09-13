import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../api/apiClient';

export function SettingsScreen() {
  const [threshold, setThreshold] = useState(85);
  const [feeds, setFeeds] = useState({ certIn: true, honeynet: true, stix: false });
  const [policies, setPolicies] = useState({ dualAuth: true, ledgerRepl: true });
  const [savedNotification, setSavedNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/settings');
      setThreshold(data.confidenceThreshold);
      setFeeds(data.feeds);
      setPolicies(data.policies);
      setOriginalSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = {
        confidenceThreshold: threshold,
        feeds,
        policies
      };
      await apiPut('/settings', updated);
      setOriginalSettings(updated);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    }
  };

  const handleDiscard = () => {
    if (originalSettings) {
      setThreshold(originalSettings.confidenceThreshold);
      setFeeds(originalSettings.feeds);
      setPolicies(originalSettings.policies);
    }
  };

  const activeFeedsCount = Object.values(feeds).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-sm pb-space-lg">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-h1 text-headline-h1 text-on-surface tracking-tight font-medium">Settings</h1>
          <p className="font-body-sm text-body-sm text-secondary">Configure threat intelligence ingest feeds, autonomous confidence thresholds, and system policies.</p>
        </div>
        <div className="flex items-center gap-space-xs shrink-0 pt-2 sm:pt-0">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:opacity-90 transition-opacity"
            type="button"
          >
            {savedNotification ? "Saved ✓" : "Save settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-xl">
        <div className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between">
          <span className="font-label-md text-label-md text-secondary">Active ingest feeds</span>
          <div className="mt-2">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{activeFeedsCount} of 3</span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary mt-2">Syncing every 15m</span>
        </div>
        <div className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between">
          <span className="font-label-md text-label-md text-secondary">Enforcement cutoff</span>
          <div className="mt-2">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{threshold}%</span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary mt-2">Autonomous defense gate</span>
        </div>
        <div className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between">
          <span className="font-label-md text-label-md text-secondary">Sync status</span>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">Connected</span>
          </div>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-success-bg text-success-text font-label-sm text-label-sm">
              Operational
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-space-xl pb-space-xl">
        <div className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-h2 text-headline-h2 text-on-surface font-medium">Advisory sources</h2>
            <p className="font-label-md text-label-md text-secondary">Select upstream threat telemetry feeds for automated indicator ingestion and correlation.</p>
          </div>
          <div className="bg-page-bg rounded-lg border border-border-hairline divide-y divide-border-hairline">
            <div className="p-4 sm:p-5 flex items-start justify-between gap-space-md">
              <div className="flex flex-col gap-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-medium text-on-surface">CERT-In national advisory feed</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-secondary">Sovereign</span>
                </div>
                <p className="font-label-md text-label-md text-secondary leading-relaxed">Official cybersecurity directives, CVE announcements, and sovereign critical vulnerability alerts.</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-sm text-label-sm text-secondary">Last poll: 4m ago • Ingest rate: ~12 advisories/day</span>
                </div>
              </div>
              <button
                onClick={() => setFeeds(f => ({ ...f, certIn: !f.certIn }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors mt-1 ${feeds.certIn ? 'bg-on-surface' : 'bg-surface-dim'}`}
                type="button"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-page-bg transition-transform my-1 ${feeds.certIn ? 'translate-x-6 mx-1' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex items-start justify-between gap-space-md">
              <div className="flex flex-col gap-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-medium text-on-surface">Autonomous enclave honeynet probe</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-secondary">Internal probe</span>
                </div>
                <p className="font-label-md text-label-md text-secondary leading-relaxed">Real-time telemetry stream from distributed honeynet traps and perimeter edge probe clusters.</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-sm text-label-sm text-secondary">Last poll: 42s ago • Ingest rate: ~840 events/hour</span>
                </div>
              </div>
              <button
                onClick={() => setFeeds(f => ({ ...f, honeynet: !f.honeynet }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors mt-1 ${feeds.honeynet ? 'bg-on-surface' : 'bg-surface-dim'}`}
                type="button"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-page-bg transition-transform my-1 ${feeds.honeynet ? 'translate-x-6 mx-1' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex items-start justify-between gap-space-md">
              <div className="flex flex-col gap-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-medium text-on-surface">Commercial threat exchange (STIX/TAXII)</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-secondary">External standard</span>
                </div>
                <p className="font-label-md text-label-md text-secondary leading-relaxed">Global multi-vendor shared threat intelligence database and malware fingerprint repository.</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-sm text-label-sm text-secondary">{feeds.stix ? "Operational" : "Disabled by administrator • Last poll: 18d ago"}</span>
                </div>
              </div>
              <button
                onClick={() => setFeeds(f => ({ ...f, stix: !f.stix }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors mt-1 ${feeds.stix ? 'bg-on-surface' : 'bg-surface-dim'}`}
                type="button"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-page-bg transition-transform my-1 ${feeds.stix ? 'translate-x-6 mx-1' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-h2 text-headline-h2 text-on-surface font-medium">Confidence threshold</h2>
            <p className="font-label-md text-label-md text-secondary">Set the minimum confidence score required before indicators are eligible for autonomous edge enforcement.</p>
          </div>
          <div className="bg-page-bg rounded-lg border border-border-hairline p-5 sm:p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 max-w-xl">
                <label className="font-body-sm text-body-sm font-medium text-on-surface">Autonomous mitigation gate</label>
                <span className="font-label-sm text-label-sm text-secondary">Determines autonomous perimeter quarantine versus mandatory analyst escalation.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-28">
                  <input
                    className="w-full text-right pr-7 pl-3 py-2 bg-page-bg border border-border-hairline rounded-lg font-code-sm text-code-sm text-on-surface focus:outline-none focus:border-on-surface"
                    max="100"
                    min="50"
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                  />
                  <span className="absolute right-3 top-2.5 font-code-sm text-code-sm text-secondary select-none">%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <input
                className="w-full accent-on-surface bg-surface-container h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none"
                max="100"
                min="50"
                type="range"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <div className="grid grid-cols-3 text-center pt-2 font-label-sm text-label-sm text-secondary">
                <button onClick={() => setThreshold(60)} className="text-left hover:text-on-surface transition-colors">
                  <span className="font-medium text-on-surface">Low (60%)</span>
                  <p className="font-label-sm text-label-sm text-secondary mt-0.5">High noise tolerance</p>
                </button>
                <button onClick={() => setThreshold(85)} className="text-center hover:text-on-surface transition-colors">
                  <span className="font-medium text-on-surface">Recommended (85%)</span>
                  <p className="font-label-sm text-label-sm text-secondary mt-0.5">Balanced enclave safety</p>
                </button>
                <button onClick={() => setThreshold(95)} className="text-right hover:text-on-surface transition-colors">
                  <span className="font-medium text-on-surface">Strict (95%)</span>
                  <p className="font-label-sm text-label-sm text-secondary mt-0.5">Zero false-positive posture</p>
                </button>
              </div>
            </div>

            <div className="bg-surface-panel rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 select-none shrink-0">info</span>
              <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                Indicators scored at or above <span className="font-medium">{threshold}%</span> confidence trigger immediate perimeter blackholing and enclave isolation. Indicators below <span className="font-medium">{threshold}%</span> route to the Approval Queue for operator dual-authorization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-h2 text-headline-h2 text-on-surface font-medium">Governance policies</h2>
            <p className="font-label-md text-label-md text-secondary">System integrity controls and authorization requirements for configuration mutability.</p>
          </div>
          <div className="bg-page-bg rounded-lg border border-border-hairline divide-y divide-border-hairline">
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-body-md text-body-md font-medium text-on-surface">Dual-authorization enforcement</span>
                <span className="font-label-md text-label-md text-secondary">Requires second security engineer sign-off on sovereign manual blocks.</span>
              </div>
              <button
                onClick={() => setPolicies(p => ({ ...p, dualAuth: !p.dualAuth }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${policies.dualAuth ? 'bg-on-surface' : 'bg-surface-dim'}`}
                type="button"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-page-bg transition-transform my-1 ${policies.dualAuth ? 'translate-x-6 mx-1' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-body-md text-body-md font-medium text-on-surface">Immutable ledger replication</span>
                <span className="font-label-md text-label-md text-secondary">Broadcast cryptographically signed policy transitions to external backup nodes.</span>
              </div>
              <button
                onClick={() => setPolicies(p => ({ ...p, ledgerRepl: !p.ledgerRepl }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${policies.ledgerRepl ? 'bg-on-surface' : 'bg-surface-dim'}`}
                type="button"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-page-bg transition-transform my-1 ${policies.ledgerRepl ? 'translate-x-6 mx-1' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border-hairline pt-space-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-secondary select-none">sync</span>
          <p className="font-label-md text-label-md text-secondary">Changes take effect immediately across all cluster edge proxies.</p>
        </div>
        <div className="flex items-center gap-space-xs self-end sm:self-auto">
          <button
            onClick={handleDiscard}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-page-bg border border-border-hairline text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface-panel transition-colors"
            type="button"
          >
            Discard changes
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:opacity-90 transition-opacity"
            type="button"
          >
            {savedNotification ? "Saved ✓" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
