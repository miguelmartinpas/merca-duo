import { paypalDonateUrl } from "@/app/lib/site";

function PayPalIcon() {
  return (
    <svg viewBox="-0.5 -1.5 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#009cde"
        d="M9.2 4.5h5.4c2.6 0 4.3 1.5 3.8 4.2-.6 3.3-2.8 4.8-5.9 4.8h-1.6l-.9 5.5H6.7z"
      />
      <path
        fill="#003087"
        d="M6.6 2.5h5.4c2.6 0 4.3 1.5 3.8 4.2-.6 3.3-2.8 4.8-5.9 4.8H8.3l-.9 5.5H4.1z"
      />
    </svg>
  );
}

export function DonateButton({ label }: { label: string }) {
  return (
    <a
      href={paypalDonateUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="no-print inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-[#003087] bg-[#FFC439] text-[#003087] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-10 lg:w-auto lg:px-4"
    >
      <PayPalIcon />
      <span className="hidden whitespace-nowrap pt-[0.15em] text-sm font-semibold leading-none lg:inline">{label}</span>
    </a>
  );
}
