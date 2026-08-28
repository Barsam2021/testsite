/** Platzhalter-Logo (das Original nutzt eine PNG-Bitmap) */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="38" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="6" width="12" height="6" rx="1.2" fill="currentColor" opacity="0.28" />
      <rect x="21" y="6" width="12" height="6" rx="1.2" fill="currentColor" opacity="0.55" />
      <rect x="6" y="14" width="27" height="4" rx="1.2" fill="currentColor" opacity="0.28" />
      <path d="M0 26h40" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
