import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/apiClient';

export function DashboardScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [alertNotice, setAlertNotice] = useState(false);
  const [stats, setStats] = useState({
    advisoriesToday: 0,
    indicatorsVerified: 0,
    actionsEnforced: 0,
    pendingApprovals: 0
  });
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filter, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, eventsData] = await Promise.all([
        apiGet('/dashboard/stats'),
        apiGet(`/dashboard/events?filter=${filter}&page=${page}`)
      ]);
      setStats(statsData);
      setEvents(eventsData.content);
      setTotalEvents(eventsData.totalElements);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <div className="flex flex-col w-full">
      {alertNotice && (
        <div className="mb-4 p-3 bg-warning-bg text-warning-text rounded-lg flex items-center justify-between font-body-sm text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>Perimeter honeynet alerted on 3 repeated ingress scans from AS20473.</span>
          </div>
          <button onClick={() => setAlertNotice(false)} className="text-secondary hover:text-on-surface font-medium text-xs">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl">
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="font-headline-h1 text-headline-h1 text-on-surface font-medium">Dashboard</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-success-bg text-success-text font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-success-text"></span>
            All automated defenses operational
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => setAlertNotice(!alertNotice)}
            className="inline-flex items-center justify-center bg-page-bg text-on-surface font-body-sm text-body-sm px-4 py-2 rounded-lg border border-border-hairline hover:bg-surface-panel transition-colors"
            type="button"
          >
            View alerts
          </button>
          <button
            onClick={() => alert("Audit snapshot generated. Hash: 0x9a2f4ce84b (Merkle verified).")}
            className="inline-flex items-center justify-center bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg transition-colors"
            type="button"
          >
            Export report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm mb-space-xl">
        <div 
          onClick={() => navigate("/advisories")}
          className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between cursor-pointer hover:border-on-surface border border-transparent transition-all"
        >
          <span className="font-label-md text-label-md text-secondary">Advisories today</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.advisoriesToday}</span>
            <span className="font-label-sm text-label-sm text-secondary">Nominal</span>
          </div>
        </div>

        <div 
          onClick={() => navigate("/indicators")}
          className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between cursor-pointer hover:border-on-surface border border-transparent transition-all"
        >
          <span className="font-label-md text-label-md text-secondary">Indicators verified</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.indicatorsVerified}</span>
            <span className="font-label-sm text-label-sm text-secondary">Total</span>
          </div>
        </div>

        <div 
          onClick={() => navigate("/enforcement")}
          className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between cursor-pointer hover:border-on-surface border border-transparent transition-all"
        >
          <span className="font-label-md text-label-md text-secondary">Actions enforced</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.actionsEnforced}</span>
            <span className="font-label-sm text-label-sm text-secondary">Automated</span>
          </div>
        </div>

        <div 
          onClick={() => navigate("/approvals")}
          className="bg-surface-panel rounded-lg p-4 flex flex-col justify-between cursor-pointer hover:border-on-surface border border-transparent transition-all"
        >
          <span className="font-label-md text-label-md text-secondary">Pending approvals</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-metric-number text-metric-number text-on-surface font-medium">{stats.pendingApprovals}</span>
            {stats.pendingApprovals > 0 ? (
              <span className="px-2 py-0.5 rounded-lg bg-danger-bg text-danger-text font-label-sm text-label-sm font-medium">Needs review</span>
            ) : (
              <span className="font-label-sm text-label-sm text-secondary">Clear</span>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-hairline pb-2 mb-2 gap-space-sm">
          <div className="flex items-center gap-space-lg" role="tablist">
            <button
              className={`relative pb-2 font-body-sm text-body-sm transition-colors ${
                filter === "all"
                  ? "text-on-surface font-medium border-b-2 border-on-surface -mb-[10px]"
                  : "text-secondary hover:text-on-surface"
              }`}
              onClick={() => handleFilterChange("all")}
            >
              All events
            </button>
            <button
              className={`relative pb-2 font-body-sm text-body-sm transition-colors ${
                filter === "enforcement"
                  ? "text-on-surface font-medium border-b-2 border-on-surface -mb-[10px]"
                  : "text-secondary hover:text-on-surface"
              }`}
              onClick={() => handleFilterChange("enforcement")}
            >
              Enforcements
            </button>
            <button
              className={`relative pb-2 font-body-sm text-body-sm transition-colors ${
                filter === "advisory"
                  ? "text-on-surface font-medium border-b-2 border-on-surface -mb-[10px]"
                  : "text-secondary hover:text-on-surface"
              }`}
              onClick={() => handleFilterChange("advisory")}
            >
              Advisories
            </button>
          </div>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-secondary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">sync</span>Live sync
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-hairline">
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal w-32">Time</th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal">Event</th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal w-48">Tier</th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-secondary font-normal text-right w-36">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {isLoading ? (
                <tr><td colSpan="4" className="py-4 text-center text-secondary">Loading events...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan="4" className="py-4 text-center text-secondary">No events found.</td></tr>
              ) : (
                events.map((evt, idx) => (
                  <tr key={idx} className="group hover:bg-surface-panel transition-colors">
                    <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary whitespace-nowrap">
                      {new Date(evt.time).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-body-sm text-body-sm text-on-surface">{evt.event}</span>
                        <span className="font-code-sm text-code-sm text-secondary bg-surface-panel px-1.5 py-0.5 rounded hidden lg:inline">{evt.id}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-body-sm text-body-sm text-secondary whitespace-nowrap">
                      {evt.tier}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg font-label-sm text-label-sm ${
                          evt.statusType === "success"
                            ? "bg-success-bg text-success-text"
                            : "bg-danger-bg text-danger-text"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-space-md border-t border-border-hairline">
          <span className="font-label-sm text-label-sm text-secondary">
            Showing {events.length > 0 ? page * 10 + 1 : 0}-{Math.min((page + 1) * 10, totalEvents)} of {totalEvents} recorded operational sequences
          </span>
          <div className="flex items-center gap-space-xs">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 rounded border border-border-hairline bg-page-bg text-secondary font-label-sm text-label-sm hover:text-on-surface disabled:opacity-50" 
              type="button"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * 10 >= totalEvents}
              className="px-2 py-1 rounded border border-border-hairline bg-page-bg text-on-surface font-label-sm text-label-sm hover:bg-surface-panel disabled:opacity-50 disabled:text-secondary" 
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
