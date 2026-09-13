import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../api/apiClient';
import { ReputationPanel } from '../components/ReputationPanel';

export function ApprovalsScreen() {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState("");

  // Reputation Panel State
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const handleIndicatorClick = (value) => {
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
    setSelectedIndicator(value);
    setSelectedType(isIp ? 'IP address' : 'Domain');
  };

  const closePanel = () => {
    setSelectedIndicator(null);
    setSelectedType(null);
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/approvals');
      setApprovals(data);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const [selectedId, setSelectedId] = useState(null);

  const handleAction = async (id, actionType) => {
    try {
      await apiPost(`/approvals/${id}/${actionType}`, { analystNotes: actionNotes });
      setApprovals(prev => prev.filter(a => a.id !== id));
      setSelectedId(null);
      setActionNotes("");
    } catch (err) {
      console.error(`Error processing ${actionType}:`, err);
      alert(`Failed to ${actionType} request`);
    }
  };

  const selectedItem = approvals.find(a => a.id === selectedId);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col gap-1 mb-space-lg">
        <h1 className="font-headline-h1 text-headline-h1 font-medium text-on-surface">Pending approvals</h1>
        <p className="font-body-sm text-body-sm text-secondary">Manual authorization required for defense actions below the autonomous confidence threshold.</p>
      </div>

      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-space-xl bg-surface-panel rounded-lg border border-[#E5E5E3]">
          <span className="material-symbols-outlined text-[32px] text-success-text mb-2">task_alt</span>
          <h2 className="font-headline-h2 text-headline-h2 font-medium text-on-surface mb-1">Queue cleared</h2>
          <p className="font-body-sm text-body-sm text-secondary">No pending dual-authorizations required.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-space-lg h-[600px]">
          <div className="w-full lg:w-1/2 flex flex-col gap-space-sm overflow-y-auto pr-2">
            {approvals.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedId(item.id)}
                className={`p-space-md rounded-lg border cursor-pointer transition-all ${
                  selectedId === item.id 
                    ? "bg-surface-panel border-on-surface" 
                    : "bg-page-bg border-[#E5E5E3] hover:border-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm bg-warning-bg text-warning-text">Needs Review</span>
                  <span className="font-label-sm text-label-sm text-secondary">{new Date(item.requestedAt).toLocaleTimeString()}</span>
                </div>
                <div className="font-code-sm text-code-sm text-on-surface font-medium mb-1 truncate">{item.indicatorValue}</div>
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                  <span className="text-secondary">{item.type}</span>
                  <span className="text-on-surface font-medium">{item.confidenceScore.toFixed(1)}% Confidence</span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2 bg-surface-panel rounded-lg border border-[#E5E5E3] p-space-lg flex flex-col">
            {selectedItem ? (
              <div className="flex flex-col h-full animate-fadeIn">
                <div className="flex items-center gap-2 mb-space-md border-b border-[#E5E5E3] pb-space-sm">
                  <span className="material-symbols-outlined text-[20px] text-warning-text">gavel</span>
                  <h2 className="font-headline-h2 text-headline-h2 font-medium text-on-surface">Authorization Details</h2>
                </div>
                
                <div className="flex-1 flex flex-col gap-space-md overflow-y-auto pb-4">
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary block mb-1">Target Indicator</span>
                    <button 
                      onClick={() => handleIndicatorClick(selectedItem.indicatorValue)}
                      className="font-code-sm text-code-sm text-on-surface bg-page-bg px-2 py-1 rounded border border-[#E5E5E3] hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {selectedItem.indicatorValue}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary block mb-1">Proposed Action</span>
                      <span className="font-body-sm text-body-sm text-on-surface">{selectedItem.type}</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary block mb-1">Identified Threat</span>
                      <span className="font-body-sm text-body-sm text-danger-text font-medium">{selectedItem.threat}</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary block mb-1">Requested By</span>
                      <span className="font-body-sm text-body-sm text-on-surface">{selectedItem.requestedBy}</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary block mb-1">Confidence</span>
                      <span className="font-body-sm text-body-sm text-warning-text font-medium">{selectedItem.confidenceScore.toFixed(1)}% (Below threshold)</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary block mb-1">Analyst Justification / Notes</span>
                    <textarea 
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full h-24 bg-page-bg border border-[#E5E5E3] rounded-lg p-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-on-surface resize-none"
                      placeholder="Enter cryptographic signing notes or operational justification..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center gap-space-md mt-auto pt-space-md border-t border-[#E5E5E3]">
                  <button 
                    onClick={() => handleAction(selectedItem.id, 'reject')}
                    className="flex-1 bg-page-bg border border-danger-text text-danger-text hover:bg-danger-bg font-body-sm text-body-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(selectedItem.id, 'approve')}
                    className="flex-1 bg-success-text text-white hover:opacity-90 font-body-sm text-body-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Authorize Action
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">fact_check</span>
                <span className="font-body-sm text-body-sm">Select an item from the queue to review details.</span>
              </div>
            )}
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
