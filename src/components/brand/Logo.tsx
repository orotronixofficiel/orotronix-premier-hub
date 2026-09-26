import { Link } from "@tanstack/react-router";

const LOGO_WORDMARK =
  "https://qeqqfelebzxwupsqyzbz.supabase.co/storage/v1/object/public/orotronix-media/Branding/Picsart_26-09-25_21-06-06-191.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={"group inline-flex items-center " + className}>
      <img
        src={LOGO_WORDMARK}
        alt="OROTRONIX"
        className="h-10 w-auto max-w-[230px] object-contain sm:h-11 sm:max-w-[250px]"
      />
    </Link>
  );
}
