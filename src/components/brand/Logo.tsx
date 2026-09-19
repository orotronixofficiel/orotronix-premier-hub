import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-gold/40 bg-surface-2 font-display text-lg font-bold text-gold">
        O
      </span>
      <span className="font-display text-lg font-semibold tracking-[0.28em] text-foreground">
        ORO<span className="text-gold">TRONIX</span>
      </span>
    </Link>
  );
}
