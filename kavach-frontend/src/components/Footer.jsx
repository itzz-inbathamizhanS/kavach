export function Footer() {
  return (
    <footer className="w-full bg-page-bg border-t border-border-hairline py-space-md mt-auto">
      <div className="max-w-[1200px] mx-auto px-margin flex flex-col sm:flex-row items-center justify-between font-label-sm text-label-sm text-secondary gap-2">
        <div className="flex items-center gap-space-sm">
          <span>KAVACH Unified Cyber-Defense</span>
          <span className="text-border-hairline">•</span>
          <span>Defense State Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success-text"></span>
          <span>Nodes synced &amp; cryptographic roots verified</span>
        </div>
      </div>
    </footer>
  );
}
