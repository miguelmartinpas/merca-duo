export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#0a1226"/>
      <circle cx="32" cy="27" r="19" stroke="#ffb000" strokeOpacity=".35" strokeWidth="2"/>
      <path d="M32 54C22 41 16 34.5 16 27a16 16 0 0 1 32 0c0 7.500-6 14-16 27Z" fill="#ffb000"/>
      <circle cx="32" cy="27" r="7" fill="#0a1226"/>
    </svg>
  );
}
