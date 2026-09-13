import { useState, useEffect } from 'react';
import { apiGet, apiPatch, apiPost } from '../api/apiClient';

export function AdvisoriesScreen() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [advisories, setAdvisories] = useState([]);
  const [stats, setStats] = useState({ total: 0, unreviewed: 0, avgTriageMinutes: "-", criticalIndicators: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Local checked state tracking
  const [checkedIds, setCheckedIds] = useState(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdvisory, setNewAdvisory] = useState({
    cve: '',
    title: '',
    description: '',
    source: 'Internal Intel',
    confidenceScore: 80
  });

  useEffect(() => {
    fetchData();
  }, [sourceFilter, search, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, pageData] = await Promise.all([
        apiGet('/advisories/stats'),
        apiGet(`/advisories?source=${sourceFilter}&search=${search}&page=${page}&size=10`)
      ]);
      setStats(statsData);
      setAdvisories(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error('Error fetching advisories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheck = (id) => {
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) newChecked.delete(id);
    else newChecked.add(id);
    setCheckedIds(newChecked);
  };

  const toggleSelectAll = () => {
    if (checkedIds.size === advisories.length && advisories.length > 0) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(advisories.map(a => a.id)));
    }
  };

  const markSelectedReviewed = async () => {
    try {
      const ids = Array.from(checkedIds);
      await apiPatch('/advisories/mark-reviewed', { ids });
      setCheckedIds(new Set());
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error marking reviewed:', err);
      alert('Failed to mark reviewed: ' + err.message);
    }
  };

  const handleCreateAdvisory = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/advisories', newAdvisory);
      setIsModalOpen(false);
      setNewAdvisory({ cve: '', title: '', description: '', source: 'Internal Intel', confidenceScore: 80 });
      fetchData(); // Refresh the list
    } catch (err) {
      alert('Failed to create advisory: ' + err.message);
    }
  };

  const checkedCount = checkedIds.size;
  // Use backend data directly
  const filtered = advisories;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-space-lg">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-h1 text-headline-h1 font-medium text-on-surface">Advisories</h1>
          <p className="font-body-sm text-body-sm text-secondary">Incoming threat telemetry and vetted community security bulletins.</p>
        </div>
        <div className="flex items-center gap-space-xs pt-space-md md:pt-0">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 px-3 border border-border-hairline rounded-lg font-body-sm text-body-sm text-on-surface bg-surface-panel cursor-pointer outline-none"
          >
            <option value="all">All Sources</option>
            <option value="CERT-In">CERT-In</option>
            <option value="CISA">CISA KEV</option>
            <option value="NVD">NVD Feed</option>
            <option value="Shadowserver">Shadowserver</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-space-md rounded-lg font-body-sm text-body-sm font-medium inline-flex items-center gap-1.5 transition-all bg-page-bg hover:bg-surface-panel border border-border-hairline text-on-surface"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Advisory</span>
          </button>

          <button
            onClick={markSelectedReviewed}
            disabled={checkedCount === 0}
            className={`h-9 px-space-md rounded-lg font-body-sm text-body-sm font-medium inline-flex items-center gap-1.5 transition-all ${
              checkedCount > 0 ? "bg-primary hover:bg-primary-container text-on-primary cursor-pointer transition-colors" : "bg-surface-container text-secondary opacity-60 cursor-not-allowed"
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Mark reviewed</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pb-space-lg">
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="font-label-md text-label-md text-secondary">Total advisories</div>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number font-medium text-on-surface">{stats.total}</span>
            <span className="font-label-sm text-label-sm text-secondary">Active telemetry</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="font-label-md text-label-md text-secondary">Unreviewed</div>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number font-medium text-on-surface">{stats.unreviewed}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-warning-bg text-warning-text font-label-sm text-label-sm">Requires triage</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="font-label-md text-label-md text-secondary">Avg triage time</div>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number font-medium text-on-surface">{stats.avgTriageMinutes}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-success-bg text-success-text font-label-sm text-label-sm">-4m target</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded-lg p-space-md flex flex-col justify-between">
          <div className="font-label-md text-label-md text-secondary">Critical indicators</div>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number font-medium text-on-surface">{stats.criticalIndicators}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-danger-bg text-danger-text font-label-sm text-label-sm">Escalated</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-page-bg rounded-lg border border-border-hairline overflow-hidden">
        <div className="p-space-sm border-b border-border-hairline flex flex-wrap items-center justify-between gap-space-xs bg-page-bg">
          <div className="flex items-center gap-space-xs flex-1 min-w-[240px]">
            <span className="material-symbols-outlined text-[16px] text-secondary">search</span>
            <input
              className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none"
              placeholder="Search advisories, CVEs, or keywords..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-secondary">{checkedCount} selected</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-hairline">
                <th className="w-10 py-2.5 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={advisories.length > 0 && checkedCount === advisories.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border-hairline accent-primary cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Source</th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Advisory &amp; identifier</th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Timestamp</th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal text-right">Status</th>
                <th className="w-16 py-2.5 px-3 font-label-md text-label-md text-secondary font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {isLoading ? (
                <tr><td colSpan="6" className="py-4 text-center text-secondary">Loading advisories...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-center text-secondary">No advisories found.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-panel transition-colors group">
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={checkedIds.has(item.id)}
                        onChange={() => toggleCheck(item.id)}
                        className="w-4 h-4 rounded border-border-hairline accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 align-top whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-panel text-on-surface font-label-sm text-label-sm">
                        {item.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 align-top">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-body-sm text-body-sm font-medium text-on-surface">{item.title}</span>
                          <span className="font-code-sm text-code-sm text-secondary bg-surface-panel px-1.5 py-0.5 rounded">{item.cve}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-secondary line-clamp-1">{item.description}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 align-top whitespace-nowrap">
                      <span className="font-body-sm text-body-sm text-secondary">{new Date(item.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-label-sm text-label-sm ${
                        item.status === "Pending" ? "bg-warning-bg text-warning-text" :
                        item.status === "Verified" ? "bg-success-bg text-success-text" : "bg-surface-panel text-secondary"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                      <button
                        onClick={() => alert(`Advisory Ref: ${item.cve}\n\nTitle: ${item.title}\nSource: ${item.source}\nStatus: ${item.status}`)}
                        className="text-secondary hover:text-on-surface transition-colors p-1"
                        title="View details"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="py-2.5 px-3 border-t border-border-hairline flex items-center justify-between font-label-sm text-label-sm text-secondary bg-page-bg">
          <span>Showing {filtered.length} of {totalElements} advisories</span>
          <div className="flex items-center gap-space-xs">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 border border-border-hairline rounded bg-page-bg text-secondary hover:text-on-surface disabled:opacity-50" type="button"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 border border-border-hairline rounded bg-page-bg text-on-surface hover:bg-surface-panel transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-panel/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-page-bg rounded-lg border border-border-hairline w-[480px] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-space-md border-b border-border-hairline bg-surface-panel">
              <h2 className="font-headline-h2 text-headline-h2 text-on-surface font-medium">Create New Advisory</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreateAdvisory} className="p-space-md flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-secondary">CVE ID (e.g. CVE-2026-9999)</label>
                <input required type="text" className="h-10 px-3 bg-surface-container-low border border-border-hairline rounded-lg focus:outline-none text-on-surface font-body-sm text-body-sm" value={newAdvisory.cve} onChange={(e) => setNewAdvisory({...newAdvisory, cve: e.target.value})} />
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-secondary">Title</label>
                <input required type="text" className="h-10 px-3 bg-surface-container-low border border-border-hairline rounded-lg focus:outline-none text-on-surface font-body-sm text-body-sm" value={newAdvisory.title} onChange={(e) => setNewAdvisory({...newAdvisory, title: e.target.value})} />
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-secondary">Description</label>
                <textarea required rows={3} className="px-3 py-2 bg-surface-container-low border border-border-hairline rounded-lg focus:outline-none text-on-surface font-body-sm text-body-sm resize-none" value={newAdvisory.description} onChange={(e) => setNewAdvisory({...newAdvisory, description: e.target.value})} />
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="flex flex-col gap-space-xs flex-1">
                  <label className="font-label-sm text-label-sm text-secondary">Source</label>
                  <input type="text" className="h-10 px-3 bg-surface-container-low border border-border-hairline rounded-lg focus:outline-none text-on-surface font-body-sm text-body-sm" value={newAdvisory.source} onChange={(e) => setNewAdvisory({...newAdvisory, source: e.target.value})} />
                </div>
                <div className="flex flex-col gap-space-xs w-32">
                  <label className="font-label-sm text-label-sm text-secondary">Confidence</label>
                  <input required type="number" min="0" max="100" className="h-10 px-3 bg-surface-container-low border border-border-hairline rounded-lg focus:outline-none text-on-surface font-body-sm text-body-sm" value={newAdvisory.confidenceScore} onChange={(e) => setNewAdvisory({...newAdvisory, confidenceScore: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-space-sm pt-space-sm">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-transparent text-secondary hover:text-on-surface rounded-lg font-label-md text-label-md transition-colors border border-border-hairline">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md transition-colors">Create Advisory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
