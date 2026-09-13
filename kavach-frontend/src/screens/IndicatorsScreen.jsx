import { useState, useEffect } from 'react';
import { apiGet } from '../api/apiClient';
import { ReputationPanel } from '../components/ReputationPanel';

export function IndicatorsScreen() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, highConfidence: 0, activeBlocks: 0, addedToday: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Reputation Panel State
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const handleIndicatorClick = (value, type) => {
    setSelectedIndicator(value);
    setSelectedType(type);
  };

  const closePanel = () => {
    setSelectedIndicator(null);
    setSelectedType(null);
  };

  useEffect(() => {
    fetchData();
  }, [search, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, pageData] = await Promise.all([
        apiGet('/indicators/stats'),
        apiGet(`/indicators?search=${search}&page=${page}&size=20`)
      ]);
      setStats(statsData);
      setData(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error('Error fetching indicators:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await apiGet('/indicators/export');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "kavach-threat-indicators.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export CSV: " + err.message);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-h1 text-headline-h1 text-on-surface tracking-tight font-medium">Indicator repository</h1>
          <p className="font-body-sm text-body-sm text-secondary">Curated threat indicators observed across network perimeter and endpoint telemetry.</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-xs">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined text-[16px] text-secondary absolute left-3 pointer-events-none">search</span>
            <input
              className="h-9 pl-9 pr-3 rounded bg-page-bg border border-border-hairline font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-on-surface transition-colors w-56 sm:w-64"
              placeholder="Search indicators..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="h-9 px-3.5 rounded bg-primary text-on-primary font-body-sm text-body-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
            onClick={handleExportCsv}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-xl">
        <div className="bg-surface-panel rounded p-space-md flex flex-col justify-between">
          <span className="font-label-md text-label-md text-secondary">Total indicators</span>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.total}</span>
            <span className="font-label-sm text-label-sm text-secondary">+{stats.addedToday} today</span>
          </div>
        </div>
        <div className="bg-surface-panel rounded p-space-md flex flex-col justify-between">
          <span className="font-label-md text-label-md text-secondary">High confidence (&gt;90%)</span>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.highConfidence}</span>
            <span className="font-label-sm text-label-sm text-secondary">
              {stats.total > 0 ? ((stats.highConfidence / stats.total) * 100).toFixed(1) : 0}% ratio
            </span>
          </div>
        </div>
        <div className="bg-surface-panel rounded p-space-md flex flex-col justify-between">
          <span className="font-label-md text-label-md text-secondary">Active blocks</span>
          <div className="mt-space-xs flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.activeBlocks}</span>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-success-bg text-success-text">Perimeter live</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-border-hairline rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-hairline bg-surface-panel">
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Type</th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Value</th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Source</th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Confidence score</th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="py-4 text-center text-secondary">Loading indicators...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="py-4 text-center text-secondary">No indicators found.</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-border-hairline hover:bg-surface-panel transition-colors group">
                  <td className="py-3 px-3 font-label-md text-label-md text-secondary whitespace-nowrap">{row.type}</td>
                  <td className="py-3 px-3 font-code-sm text-code-sm whitespace-nowrap">
                    <button 
                      onClick={() => handleIndicatorClick(row.value, row.type)}
                      className="text-on-surface group-hover:text-primary group-hover:underline flex items-center gap-1 transition-all"
                    >
                      {row.value}
                      <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                    </button>
                  </td>
                  <td className="py-3 px-3 font-body-sm text-body-sm text-on-surface whitespace-nowrap">{row.source}</td>
                  <td className="py-3 px-3 font-body-sm text-body-sm text-on-surface whitespace-nowrap">{row.confidenceScore.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm ${
                      row.status === "Enforced" || row.status === "Verified" ? "bg-success-bg text-success-text" :
                      row.status === "Needs review" || row.status === "Pending" ? (row.status === "Pending" ? "bg-warning-bg text-warning-text" : "bg-danger-bg text-danger-text") : "bg-surface-panel text-secondary"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-md">
        <span className="font-label-sm text-label-sm text-secondary">
          Showing <span className="text-on-surface font-medium">{data.length}</span> of {totalElements} recorded indicators
        </span>
        <div className="flex items-center gap-space-xs">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-8 px-3 rounded bg-page-bg border border-border-hairline font-label-sm text-label-sm text-secondary hover:text-on-surface disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-8 px-3 rounded bg-page-bg border border-border-hairline font-label-sm text-label-sm text-on-surface hover:bg-surface-panel transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      <ReputationPanel 
        isOpen={selectedIndicator !== null} 
        onClose={closePanel} 
        indicatorValue={selectedIndicator} 
        indicatorType={selectedType}
      />
    </div>
  );
}
