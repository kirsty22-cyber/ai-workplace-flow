import type { ReactNode } from "react";

export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
