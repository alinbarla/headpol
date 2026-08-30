export function SeoFacts({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card p-3"
        >
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 break-all text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SeoEmpty({ children }: { children: string }) {
  return <p className="mt-6 text-sm text-muted-foreground">{children}</p>;
}
