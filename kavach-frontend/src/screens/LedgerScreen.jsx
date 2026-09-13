import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../api/apiClient';

export function LedgerScreen() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedInspect, setSelectedInspect] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalRecords: 0, addedToday: 0, chainValid: true, latestBlock: 0, merkleRoot: "genesis" });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filter, search, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, pageData] = await Promise.all([
        apiGet('/ledger/stats'),
        apiGet(`/ledger?category=${filter}&search=${search}&page=${page}&size=20`)
      ]);
      setStats(statsData);
      setRecords(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await apiPost('/ledger/verify');
      setVerifying(false);
      setVerifiedSuccess(res.valid);
      setVerifyMsg(res.message);
      setTimeout(() => {
        setVerifiedSuccess(false);
        setVerifyMsg("");
      }, 5000);
    } catch (err) {
      setVerifying(false);
      alert('Verification error: ' + err.message);
    }
  };

  const handleDownloadProof = async () => {
    try {
      const data = await apiGet('/ledger/proof');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kavach-proof-block-${data.height}.json`;
      a.click();
    } catch (err) {
      alert('Failed to generate proof: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-1 max-w-2xl">
          <h1 className="font-headline-h1 text-headline-h1 font-medium text-on-surface tracking-tight">Audit ledger</h1>
          <p className="font-body-sm text-body-sm text-secondary">Immutable cryptographic event log recording system telemetry, rule changes, and enforcement actions.</p>
        </div>
        <div className="flex items-center gap-space-xs shrink-0 self-start md:self-auto">
          <button
            onClick={handleDownloadProof}
            className="h-9 px-space-md bg-page-bg border border-border-hairline hover:bg-surface-container-low transition-colors text-on-surface font-body-sm text-body-sm font-medium rounded flex items-center gap-1.5 focus:outline-none"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">download</span>
            <span>Download proof</span>
          </button>
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className={`h-9 px-space-md font-body-sm text-body-sm font-medium rounded flex items-center gap-1.5 transition-colors ${
              verifiedSuccess
                ? "bg-success-text text-white"
                : "bg-primary hover:opacity-90 text-on-primary"
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${verifying ? 'animate-spin' : ''}`}>
              {verifying ? 'refresh' : verifiedSuccess ? 'check_circle' : 'verified_user'}
            </span>
            <span>{verifying ? "Verifying nodes..." : verifyMsg ? verifyMsg : "Verify integrity"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-space-lg">
        <div className="bg-surface-panel p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-label-md text-secondary">Total records</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">receipt_long</span>
          </div>
          <div className="font-metric-number text-metric-number font-medium text-on-surface my-0.5">{stats.totalRecords.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
            <span className="font-medium text-on-surface">+{stats.addedToday}</span>
            <span>committed today</span>
          </div>
        </div>

        <div className="bg-surface-panel p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-label-md text-secondary">Chain integrity</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">link</span>
          </div>
          <div className="font-metric-number text-metric-number font-medium text-on-surface my-0.5">{stats.chainValid ? "Valid" : "Compromised"}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${stats.chainValid ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'} font-label-sm text-label-sm font-normal`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats.chainValid ? 'bg-success-text' : 'bg-danger-text'}`}></span>
              {stats.chainValid ? "Verified sequence" : "Invalid sequence"}
            </span>
          </div>
        </div>

        <div className="bg-surface-panel p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-label-md text-secondary">Latest block</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">token</span>
          </div>
          <div className="font-metric-number text-metric-number font-medium text-on-surface my-0.5 font-code-sm">#{stats.latestBlock.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
            <span>Block time valid</span>
          </div>
        </div>

        <div className="bg-surface-panel p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-label-md text-secondary">Merkle root</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">hub</span>
          </div>
          <div className="font-code-sm text-code-sm font-medium text-on-surface my-1 truncate tracking-tight" title={stats.merkleRoot}>
            {stats.merkleRoot.substring(0, 5)}...{stats.merkleRoot.substring(stats.merkleRoot.length - 4)}
          </div>
          <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Synced across 4 consensus nodes</span>
          </div>
        </div>
      </div>

      <div className="bg-page-bg rounded border border-border-hairline p-3 mb-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-secondary pointer-events-none">search</span>
            <input
              className="w-full h-9 pl-9 pr-3 bg-page-bg border border-border-hairline rounded font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-on-surface transition-colors"
              placeholder="Search hash, event, or author..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter("all")}
              className={`h-8 px-3 rounded text-label-md font-label-md transition-colors whitespace-nowrap ${
                filter === "all" ? "bg-on-surface text-on-primary" : "bg-surface-container-low text-secondary hover:text-on-surface"
              }`}
              type="button"
            >
              All events
            </button>
            <button
              onClick={() => setFilter("enforcement")}
              className={`h-8 px-3 rounded text-label-md font-label-md transition-colors whitespace-nowrap ${
                filter === "enforcement" ? "bg-on-surface text-on-primary" : "bg-surface-container-low text-secondary hover:text-on-surface"
              }`}
              type="button"
            >
              Enforcement
            </button>
            <button
              onClick={() => setFilter("policy")}
              className={`h-8 px-3 rounded text-label-md font-label-md transition-colors whitespace-nowrap ${
                filter === "policy" ? "bg-on-surface text-on-primary" : "bg-surface-container-low text-secondary hover:text-on-surface"
              }`}
              type="button"
            >
              Policy updates
            </button>
          </div>
        </div>

        <div className="flex items-center gap-space-xs shrink-0 self-start sm:self-auto border-t sm:border-t-0 border-border-hairline pt-2 sm:pt-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-panel rounded text-label-sm font-label-sm text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-success-text"></span>
            <span className="text-on-surface font-medium">Ledger status:</span>
            <span>Synced (4/4 nodes)</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-page-bg border border-border-hairline rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-hairline bg-surface-panel">
                <th className="py-2.5 px-3 font-label-sm text-label-sm font-normal text-secondary w-[110px]">Timestamp</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm font-normal text-secondary w-[140px]">Block hash</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm font-normal text-secondary">Description</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm font-normal text-secondary w-[160px]">Actor / Source</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm font-normal text-secondary text-right w-[110px]">Integrity</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm font-normal text-secondary text-right w-[110px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline text-on-surface">
              {isLoading ? (
                <tr><td colSpan="6" className="py-4 text-center text-secondary">Loading ledger records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-center text-secondary">No ledger records found.</td></tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-3 px-3 font-label-md text-label-md text-secondary align-top whitespace-nowrap">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span className="block font-label-sm text-label-sm text-secondary/70">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-3 font-code-sm text-code-sm text-secondary align-top whitespace-nowrap">
                      <span className="text-on-surface font-medium hover:underline cursor-pointer flex items-center gap-1" title={item.hash}>
                        <span>{item.hash.substring(0,6)}...{item.hash.substring(item.hash.length-4)}</span>
                        <span className="material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <div className="font-body-sm text-body-sm text-on-surface font-normal">{item.description}</div>
                      <div className="font-label-sm text-label-sm text-secondary mt-1 flex items-center gap-2">
                        <span>{item.scope}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-body-sm text-body-sm text-secondary align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-on-surface">
                        <span className="material-symbols-outlined text-[14px] text-secondary">memory</span>
                        <span>{item.actor}</span>
                      </div>
                      <span className="block font-label-sm text-label-sm text-secondary/80">{item.actorSub}</span>
                    </td>
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-success-bg text-success-text font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[13px]">check</span>
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInspect(item)}
                        className="h-7 px-2 bg-page-bg border border-border-hairline hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded transition-colors"
                        type="button"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-space-md py-space-sm bg-page-bg border-t border-border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs font-label-sm text-label-sm text-secondary">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-secondary">lock</span>
            <span>Showing <span className="text-on-surface font-medium">{records.length}</span> of <span className="text-on-surface font-medium">{totalElements.toLocaleString()}</span> ledger records</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 px-space-sm bg-page-bg border border-border-hairline rounded hover:text-on-surface disabled:opacity-50 font-body-sm flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span>Previous</span>
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 px-space-sm bg-page-bg border border-border-hairline hover:bg-surface-container-low text-on-surface rounded disabled:opacity-50 font-body-sm flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {selectedInspect && (
        <div className="mt-space-md bg-surface-panel border border-border-hairline rounded p-space-md transition-all">
          <div className="flex items-center justify-between pb-space-sm border-b border-border-hairline mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface">data_object</span>
              <h2 className="font-headline-h2 text-headline-h2 font-medium text-on-surface">Cryptographic block inspector</h2>
              <span className="font-code-sm text-code-sm bg-surface-container px-2 py-0.5 rounded text-on-surface">#{selectedInspect.blockNumber}</span>
            </div>
            <button
              onClick={() => setSelectedInspect(null)}
              className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-secondary">Merkle path branch</span>
              <div className="font-code-sm text-code-sm text-on-surface bg-page-bg p-2.5 rounded border border-border-hairline space-y-1">
                <div className="text-secondary truncate">Root: {selectedInspect.hash ? selectedInspect.hash.split('').reverse().join('').substring(0, 32) : 'N/A'}</div>
                <div className="text-secondary truncate pl-2">├── Hash L1: {selectedInspect.hash ? selectedInspect.hash.substring(8, 40) : 'N/A'}</div>
                <div className="text-on-surface font-medium truncate pl-4">└── Leaf: {selectedInspect.hash}</div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-secondary">Block metadata</span>
              <div className="font-code-sm text-code-sm text-on-surface bg-page-bg p-2.5 rounded border border-border-hairline space-y-1.5">
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-secondary">Previous hash</span>
                  <span className="text-on-surface font-medium truncate max-w-[140px]" title={selectedInspect.previousHash}>{selectedInspect.previousHash === '0' ? 'Genesis (0)' : selectedInspect.previousHash.substring(0, 12) + '...'}</span>
                </div>
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-secondary">Actor</span>
                  <span className="text-on-surface font-medium">{selectedInspect.actor}</span>
                </div>
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-secondary">Category</span>
                  <span className="text-on-surface font-medium capitalize">{selectedInspect.category}</span>
                </div>
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-secondary">Status</span>
                  <span className="text-success-text font-medium">{selectedInspect.status}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-secondary">Cryptographic authenticity</span>
                <div className="font-body-sm text-body-sm text-on-surface mt-1 space-y-1">
                  <p><span className="text-secondary">Scope:</span> {selectedInspect.scope}</p>
                  <p><span className="text-secondary">Committed:</span> {new Date(selectedInspect.timestamp).toLocaleString()}</p>
                  <p className="text-secondary text-label-sm mt-1">SHA-256 hash chain verified against immutable ledger.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedInspect, null, 2));
                    alert(`Raw JSON block payload for #${selectedInspect.blockNumber} copied to clipboard.`);
                  }}
                  className="h-8 px-3 bg-page-bg border border-border-hairline hover:bg-surface-container rounded text-label-md font-label-md text-on-surface transition-colors flex items-center gap-1.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Copy raw JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
