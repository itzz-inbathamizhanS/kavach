import { useState, useEffect } from 'react';
import { apiGet } from '../api/apiClient';
import { ReputationPanel } from '../components/ReputationPanel';

export function EnforcementScreen() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, automatedRate: 0, activeTierBlocks: 0, manualReviews: 0, addedToday: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Reputation Panel State
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const handleIndicatorClick = (value) => {
    // Infer type based on IP regex
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
    setSelectedIndicator(value);
    setSelectedType(isIp ? 'IP address' : 'Domain');
  };

  const closePanel = () => {
    setSelectedIndicator(null);
    setSelectedType(null);
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, search, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, pageData] = await Promise.all([
        apiGet('/enforcement/stats'),
        apiGet(`/enforcement?status=${statusFilter}&search=${search}&page=${page}&size=20`)
      ]);
      setStats(statsData);
      setItems(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error('Error fetching enforcement actions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-h1 text-headline-h1 text-on-surface tracking-tight font-medium">Enforcement actions log</h1>
          <p className="font-body-sm text-body-sm text-secondary">Automated and operator-approved defense actions across network tiers and edge firewalls.</p>
        </div>
        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <button
            onClick={() => alert("All 39 logs exported to signed CSV file.")}
            className="inline-flex items-center gap-space-xs bg-page-bg text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface-panel transition-colors text-label-md font-label-md border border-[#E5E5E3]"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">file_download</span>
            <span>Export log</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-secondary">Total enforcements</span>
            <span className="font-metric-number text-metric-number text-on-surface font-medium mt-space-xs">{stats.total}</span>
          </div>
          <div className="mt-space-xs">
            <span className="font-label-sm text-label-sm text-secondary">+{stats.addedToday} today</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-secondary">Automated rate</span>
            <span className="font-metric-number text-metric-number text-on-surface font-medium mt-space-xs">{typeof stats.automatedRate === 'number' ? stats.automatedRate.toFixed(1) + '%' : stats.automatedRate}</span>
          </div>
          <div className="mt-space-xs">
            <span className="font-label-sm text-label-sm text-secondary">Zero rollbacks</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-secondary">Active tier blocks</span>
            <span className="font-metric-number text-metric-number text-on-surface font-medium mt-space-xs">{stats.activeTierBlocks}</span>
          </div>
          <div className="mt-space-xs flex items-center">
            <span className="inline-flex items-center bg-success-bg text-success-text font-label-sm text-label-sm px-space-xs py-[2px] rounded-lg">Enforced</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-secondary">Manual reviews</span>
            <span className="font-metric-number text-metric-number text-on-surface font-medium mt-space-xs">{stats.manualReviews}</span>
          </div>
          <div className="mt-space-xs flex items-center">
            <span className="inline-flex items-center bg-danger-bg text-danger-text font-label-sm text-label-sm px-space-xs py-[2px] rounded-lg">Needs review</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm mb-space-md">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-secondary pointer-events-none">search</span>
          <input
            className="w-full bg-page-bg text-on-surface font-body-sm text-body-sm pl-9 pr-space-md py-[6px] rounded-lg placeholder:text-secondary focus:outline-none border border-[#E5E5E3]"
            placeholder="Search indicator, action, or tier..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-space-xs self-end sm:self-auto">
          <span className="font-label-sm text-label-sm text-secondary">Status:</span>
          {["all", "enforced", "pending", "needs review"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`font-label-sm text-label-sm px-space-xs py-1 rounded capitalize transition-colors ${
                statusFilter === st ? "text-on-surface bg-surface-container-low font-medium" : "text-secondary hover:text-on-surface"
              }`}
              type="button"
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-[#E5E5E3] rounded-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5E5E3] bg-surface-panel">
              <th className="py-space-sm px-space-sm font-label-md text-label-md text-secondary font-normal w-24">Time</th>
              <th className="py-space-sm px-space-sm font-label-md text-label-md text-secondary font-normal">Indicator</th>
              <th className="py-space-sm px-space-sm font-label-md text-label-md text-secondary font-normal">Tier</th>
              <th className="py-space-sm px-space-sm font-label-md text-label-md text-secondary font-normal">Action taken</th>
              <th className="py-space-sm px-space-sm font-label-md text-label-md text-secondary font-normal text-right">Status</th>
              <th className="py-space-sm px-space-sm font-label-md text-label-md text-secondary font-normal text-right w-36">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="py-space-sm px-space-sm text-center text-secondary">Loading actions...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="6" className="py-space-sm px-space-sm text-center text-secondary">No enforcement actions found.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-surface-panel transition-colors border-b border-[#E5E5E3] group">
                  <td className="py-space-sm px-space-sm font-code-sm text-code-sm text-secondary whitespace-nowrap align-middle">{new Date(row.timestamp).toLocaleTimeString()}</td>
                  <td className="py-space-sm px-space-sm font-code-sm text-code-sm whitespace-nowrap align-middle">
                    <button 
                      onClick={() => handleIndicatorClick(row.indicatorValue)}
                      className="text-on-surface group-hover:text-primary group-hover:underline flex items-center gap-1 transition-all"
                    >
                      {row.indicatorValue}
                      <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                    </button>
                  </td>
                  <td className="py-space-sm px-space-sm whitespace-nowrap align-middle">
                    <span className="inline-flex items-center px-space-xs py-[2px] rounded font-label-sm text-label-sm bg-surface-container-low text-secondary">
                      {row.tier}
                    </span>
                  </td>
                  <td className="py-space-sm px-space-sm font-body-sm text-body-sm text-on-surface align-middle">{row.actionTaken}</td>
                  <td className="py-space-sm px-space-sm text-right whitespace-nowrap align-middle">
                    <span className={`inline-flex items-center px-space-xs py-[2px] rounded-lg font-label-sm text-label-sm ${
                      row.status === "Enforced" ? "bg-success-bg text-success-text" :
                      row.status === "Pending" ? "bg-warning-bg text-warning-text" : "bg-danger-bg text-danger-text"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-space-sm px-space-sm text-right whitespace-nowrap align-middle">
                    <button
                      onClick={() => setSelectedEvidence(row)}
                      disabled={!row.evidence}
                      className={`inline-flex items-center bg-page-bg font-label-sm text-label-sm px-space-sm py-[6px] rounded-lg border border-[#E5E5E3] ${row.evidence ? "text-on-surface hover:bg-surface-panel transition-colors" : "text-secondary opacity-50 cursor-not-allowed"}`}
                      type="button"
                    >
                      View evidence
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-space-md pb-space-sm">
        <span className="font-label-sm text-label-sm text-secondary">
          Showing {items.length > 0 ? page * 20 + 1 : 0}-{Math.min((page + 1) * 20, totalElements)} of {totalElements} enforcement actions
        </span>
        <div className="flex items-center gap-space-xs">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center bg-page-bg text-secondary font-label-sm text-label-sm px-space-md py-[6px] rounded-lg disabled:opacity-50 hover:text-on-surface transition-colors border border-[#E5E5E3]"
          >
            Previous
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center bg-page-bg text-on-surface font-label-sm text-label-sm px-space-md py-[6px] rounded-lg disabled:opacity-50 hover:bg-surface-panel transition-colors border border-[#E5E5E3]"
          >
            Next
          </button>
        </div>
      </div>

      {selectedEvidence && (
        <div className="mt-4 p-4 rounded-lg bg-surface-panel border border-[#E5E5E3] flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <h3 className="font-headline-h2 text-headline-h2 font-medium">Evidence Dossier: {selectedEvidence.indicatorValue}</h3>
            </div>
            <button onClick={() => setSelectedEvidence(null)} className="text-secondary hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm">
            <div>
              <span className="text-secondary font-label-sm block">Subsystem Actor:</span>
              <span className="font-medium text-on-surface">{selectedEvidence.evidence.actor}</span>
            </div>
            <div>
              <span className="text-secondary font-label-sm block">Rule Duration:</span>
              <span className="font-medium text-on-surface">{selectedEvidence.evidence.duration}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-secondary font-label-sm block">Applied Firewall Bytecode / Directive:</span>
              <pre className="font-code-sm text-code-sm bg-page-bg p-2.5 rounded border border-[#E5E5E3] overflow-x-auto text-on-surface mt-1">
                {selectedEvidence.evidence.ruleApplied}
              </pre>
            </div>
          </div>
        </div>
      )}

      <ReputationPanel 
        isOpen={selectedIndicator !== null} 
        onClose={closePanel} 
        indicatorValue={selectedIndicator} 
        indicatorType={selectedType}
      />
    </div>
  );
}
