import { cacheLife } from "next/cache";
import { appName } from "@/app/lib/site";

export async function Footer() {
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground">
      <p className="mx-auto max-w-5xl text-left">
        © {year} {appName} v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
    </footer>
  );
}
