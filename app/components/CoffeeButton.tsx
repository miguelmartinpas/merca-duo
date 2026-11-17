import { buyMeACoffeeUrl } from "@/app/lib/site";

export function CoffeeButton() {
  return (
    <a
      href={buyMeACoffeeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      className="no-print inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-black bg-[#FFDD00] text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-10 lg:w-auto lg:px-4"
    >
      <span aria-hidden="true" className="leading-none">
        ☕
      </span>
      <span className="hidden whitespace-nowrap font-[family-name:var(--font-cookie)] text-xl leading-none lg:inline">
        Buy me a coffee
      </span>
    </a>
  );
}
