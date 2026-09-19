import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
