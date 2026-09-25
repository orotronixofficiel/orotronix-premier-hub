import { Link } from "@tanstack/react-router";

const LOGO_WORDMARK =
  "https://qeqqfelebzxwupsqyzbz.supabase.co/storage/v1/object/public/orotronix-media/Branding/Picsart_26-09-25_21-06-06-191.png";

const LOGO_ICON =
  "https://qeqqfelebzxwupsqyzbz.supabase.co/storage/v1/object/public/orotronix-media/Branding/Picsart_26-09-23_02-28-45-100.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={"group inline-flex items-center gap-2 " + className}>
      <img
        src={LOGO_ICON}
        alt=""
        aria-hidden="true"
        className="h-9 w-9 rounded-md object-contain sm:h-10 sm:w-10"
      />
      <img
        src={LOGO_WORDMARK}
        alt="OROTRONIX"
        className="h-8 w-auto max-w-[190px] object-contain sm:h-9 sm:max-w-[220px]"
      />
    </Link>
  );
}
