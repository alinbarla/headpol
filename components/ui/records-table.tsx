"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

export type Strength = "strong" | "weak" | "veryweak" | "none";
export type SortKey = "name" | "last" | "strength";

export type RecordsTableRow = {
  id: string;
  name: string;
  tags: string[];
  last: string;
  strength: Strength;
  website?: string;
  href?: string;
  linkLabel?: string;
};

const STRENGTH: Record<
  Strength,
  { label: string; color: string; rank: number }
> = {
  strong: { label: "Very strong", color: "var(--green)", rank: 3 },
  weak: { label: "Weak", color: "var(--orange)", rank: 2 },
  veryweak: { label: "Very weak", color: "var(--red)", rank: 1 },
  none: { label: "No communication", color: "var(--ink-3)", rank: 0 },
};

const TAG_COLORS: Record<string, string> = {
  B2B: "#f09a2f",
  B2C: "#92b72d",
  Cafe: "#ee6572",
  Catering: "#c84f9d",
  "Dairy-free": "#16a6c7",
  Gelato: "#9a5cff",
  Imports: "#3f78ff",
  Local: "#25a878",
  Seasonal: "#f09a2f",
  Sorbet: "#16a6c7",
  Vegan: "#92b72d",
  Wholesale: "#3f78ff",
  Mobile: "#3f78ff",
  Tablet: "#16a6c7",
  Desktop: "#9a5cff",
  "Google Ads": "#f09a2f",
  Organic: "#92b72d",
  Direct: "#25a878",
  Referral: "#3f78ff",
  Unknown: "#7f858d",
};

export const INITIAL_ROWS: RecordsTableRow[] = [
  {
    id: "aurora",
    name: "Aurora Scoops — Reykjavík",
    tags: ["Gelato", "Seasonal"],
    last: "9 days ago",
    strength: "strong",
    website: "aurora-scoops.example.com",
  },
  {
    id: "kumo",
    name: "Kumo Creamery — Tokyo",
    tags: ["B2C", "Cafe", "Vegan"],
    last: "3 weeks ago",
    strength: "strong",
    website: "kumo-creamery.example.com",
  },
  {
    id: "sol-nieve",
    name: "Sol y Nieve — Buenos Aires",
    tags: ["Gelato", "Local"],
    last: "2 months ago",
    strength: "weak",
    website: "sol-y-nieve.example.com",
  },
  {
    id: "maple-orbit",
    name: "Maple Orbit — Montréal",
    tags: ["B2B", "Wholesale", "Seasonal"],
    last: "15 days ago",
    strength: "weak",
    website: "maple-orbit.example.com",
  },
  {
    id: "blue-fig",
    name: "Blue Fig Gelato — Florence",
    tags: ["Gelato", "Cafe"],
    last: "over 1 year ago",
    strength: "veryweak",
    website: "blue-fig.example.com",
  },
  {
    id: "sahara-swirl",
    name: "Sahara Swirl — Marrakech",
    tags: ["Sorbet", "Local"],
    last: "5 months ago",
    strength: "veryweak",
  },
  {
    id: "cloudberry",
    name: "Cloudberry Cone — Helsinki",
    tags: ["Dairy-free", "Seasonal"],
    last: "No contact",
    strength: "none",
    website: "cloudberry-cone.example.com",
  },
];

function Icon({
  children,
  size = 14,
  strokeWidth = 1.8,
}: {
  children: ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Checkbox({
  checked,
  mixed = false,
  onChange,
  label,
}: {
  checked: boolean;
  mixed?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="records-checkbox" title={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span
        className={`records-checkbox-box ${checked || mixed ? "is-active" : ""}`}
      >
        {mixed ? (
          <span className="records-checkbox-dash" />
        ) : checked ? (
          <Icon size={12}>
            <path d="m5 12 4 4L19 6" />
          </Icon>
        ) : null}
      </span>
    </label>
  );
}

function Tag({ name }: { name: string }) {
  const color = TAG_COLORS[name] ?? "#7f858d";
  return (
    <span
      className="records-tag"
      style={{ "--tag-color": color } as CSSProperties}
    >
      <span className="records-tag-dot" style={{ background: color }} />
      {name}
    </span>
  );
}

function HeaderCell({
  label,
  icon,
  sortKey,
  sort,
  onSort,
  className = "",
}: {
  label: string;
  icon: ReactNode;
  sortKey?: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <th className={`records-header-cell ${className}`}>
      <button
        type="button"
        className="records-header-button"
        onClick={sortKey ? () => onSort(sortKey) : undefined}
      >
        <span className="records-header-icon">{icon}</span>
        <span className="truncate">{label}</span>
        {sortKey && (
          <span
            className={`records-sort ${sort.key === sortKey ? "is-visible" : ""}`}
            style={{
              transform:
                sort.key === sortKey && sort.dir === -1
                  ? "rotate(180deg)"
                  : undefined,
            }}
          >
            <Icon size={12}>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </Icon>
          </span>
        )}
      </button>
    </th>
  );
}

export type RecordsTableProps = {
  rows?: RecordsTableRow[];
  nameLabel?: string;
  categoriesLabel?: string;
  lastLabel?: string;
  strengthLabel?: string;
  linksLabel?: string;
  strengthLabels?: Partial<Record<Strength, string>>;
  selectedIds?: string[];
  onSelectedChange?: (ids: string[]) => void;
  emptyLabel?: string;
};

export default function RecordsTable({
  rows = INITIAL_ROWS,
  nameLabel = "Company",
  categoriesLabel = "Categories",
  lastLabel = "Last interaction",
  strengthLabel = "Connection strength",
  linksLabel = "Links",
  strengthLabels,
  selectedIds,
  onSelectedChange,
  emptyLabel = "No records.",
}: RecordsTableProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "name",
    dir: 1,
  });

  const selected = selectedIds ?? uncontrolled;
  const setSelected = onSelectedChange ?? setUncontrolled;

  const visibleRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const value =
        sort.key === "name"
          ? a.name.localeCompare(b.name)
          : sort.key === "last"
            ? a.last.localeCompare(b.last)
            : STRENGTH[a.strength].rank - STRENGTH[b.strength].rank;
      return value * sort.dir;
    });
  }, [rows, sort]);

  const allSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.includes(row.id));
  const partiallySelected =
    !allSelected && visibleRows.some((row) => selected.includes(row.id));

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: (current.dir * -1) as 1 | -1 }
        : { key, dir: 1 }
    );

  const toggleRow = (id: string) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );

  const toggleAll = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !visibleRows.some((row) => row.id === id))
        : [...new Set([...selected, ...visibleRows.map((row) => row.id)])]
    );

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const renderTags = (row: RecordsTableRow) => (
    <div className="records-tags">
      {row.tags.slice(0, 4).map((tag) => (
        <Tag key={tag} name={tag} />
      ))}
      {row.tags.length > 4 ? (
        <span className="records-more-tag">+{row.tags.length - 4}</span>
      ) : null}
    </div>
  );

  const renderStrength = (row: RecordsTableRow) => {
    const strength = STRENGTH[row.strength];
    const label = strengthLabels?.[row.strength] ?? strength.label;
    return (
      <span className="records-strength">
        <span
          className="records-strength-dot"
          style={{ background: strength.color }}
        />
        {label}
      </span>
    );
  };

  const renderLink = (row: RecordsTableRow) => {
    const href = row.href ?? (row.website ? `https://${row.website}` : undefined);
    const linkText = row.linkLabel ?? row.website ?? "Open";
    if (!href) return <span className="records-muted">—</span>;
    return (
      <a
        className="records-link"
        href={href}
        target={row.website ? "_blank" : undefined}
        rel={row.website ? "noreferrer" : undefined}
      >
        {linkText}
        <Icon size={12}>
          <path d="M14 5h5v5M19 5l-8 8" />
        </Icon>
      </a>
    );
  };

  return (
    <div className="records-shell">
      <ul className="records-mobile-list">
        {visibleRows.map((row) => {
          const selectedRow = selected.includes(row.id);
          const href = row.href ?? (row.website ? `https://${row.website}` : undefined);
          return (
            <li
              key={row.id}
              className={`records-mobile-card ${selectedRow ? "is-selected" : ""}`}
            >
              <div className="records-mobile-card-top">
                <Checkbox
                  checked={selectedRow}
                  onChange={() => toggleRow(row.id)}
                  label={`Select ${row.name}`}
                />
                <span className="records-company-mark">
                  {row.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="records-mobile-card-title">
                  {href ? (
                    <a href={href} className="records-company-name has-link">
                      {row.name}
                    </a>
                  ) : (
                    <span className="records-company-name">{row.name}</span>
                  )}
                  <span
                    className={`records-mobile-last ${row.last === "No contact" ? "records-muted" : ""}`}
                  >
                    {row.last}
                  </span>
                </div>
                {renderLink(row)}
              </div>
              {row.tags.length > 0 ? (
                <div className="records-mobile-card-tags">{renderTags(row)}</div>
              ) : null}
              <div className="records-mobile-card-meta">{renderStrength(row)}</div>
            </li>
          );
        })}
      </ul>

      <div
        className="records-scroll"
        tabIndex={0}
        aria-label={`${nameLabel} table. Scroll horizontally and vertically to view all columns and records.`}
      >
        <table className="records-table">
          <colgroup>
            <col className="records-company-col" />
            <col className="records-category-col" />
            <col className="records-last-col" />
            <col className="records-strength-col" />
            <col className="records-link-col" />
          </colgroup>
          <thead>
            <tr>
              <th className="records-header-cell records-sticky-cell">
                <div className="records-company-header">
                  <Checkbox
                    checked={allSelected}
                    mixed={partiallySelected}
                    onChange={toggleAll}
                    label={`Select all ${nameLabel.toLowerCase()}s`}
                  />
                  <span>{nameLabel}</span>
                </div>
              </th>
              <HeaderCell
                label={categoriesLabel}
                sort={sort}
                onSort={toggleSort}
                icon={
                  <Icon size={15}>
                    <path d="m20.6 13.4-8.6 8.6-8-8V4h10l6.6 6.6a2 2 0 0 1 0 2.8zM7 7h.01" />
                  </Icon>
                }
              />
              <HeaderCell
                label={lastLabel}
                sortKey="last"
                sort={sort}
                onSort={toggleSort}
                icon={
                  <Icon size={15}>
                    <path d="M3 5h18M3 12h12M3 19h7M18 15v6m-3-3h6" />
                  </Icon>
                }
              />
              <HeaderCell
                label={strengthLabel}
                sortKey="strength"
                sort={sort}
                onSort={toggleSort}
                icon={
                  <Icon size={15}>
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.9z" />
                  </Icon>
                }
              />
              <HeaderCell
                label={linksLabel}
                sort={sort}
                onSort={toggleSort}
                icon={
                  <Icon size={15}>
                    <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
                  </Icon>
                }
              />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const selectedRow = selected.includes(row.id);
              const href = row.href ?? (row.website ? `https://${row.website}` : undefined);
              return (
                <tr
                  key={row.id}
                  className={`records-row ${selectedRow ? "is-selected" : ""}`}
                >
                  <td className="records-cell records-sticky-cell records-company-cell">
                    <div className="records-company-header">
                      <Checkbox
                        checked={selectedRow}
                        onChange={() => toggleRow(row.id)}
                        label={`Select ${row.name}`}
                      />
                      <span className="records-company-mark">
                        {row.name.slice(0, 1).toUpperCase()}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          className="records-company-name has-link"
                        >
                          {row.name}
                        </a>
                      ) : (
                        <span className="records-company-name">{row.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="records-cell">{renderTags(row)}</td>
                  <td
                    className={`records-cell ${row.last === "No contact" ? "records-muted" : ""}`}
                  >
                    {row.last}
                  </td>
                  <td className="records-cell">{renderStrength(row)}</td>
                  <td className="records-cell">{renderLink(row)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="records-calculation-row">
              <td className="records-cell records-sticky-cell records-calculation-label">
                <span className="records-calculation-number">{rows.length}</span>{" "}
                count
              </td>
              <td className="records-cell">
                <span className="records-muted">
                  {new Set(rows.flatMap((row) => row.tags)).size} tags
                </span>
              </td>
              <td className="records-cell records-muted">—</td>
              <td className="records-cell">
                <span className="records-average">
                  <span
                    className="records-strength-dot"
                    style={{ background: "var(--orange)" }}
                  />
                  {Math.round(
                    (rows.reduce(
                      (sum, row) => sum + STRENGTH[row.strength].rank,
                      0
                    ) /
                      rows.length /
                      3) *
                      100
                  )}
                  % average
                </span>
              </td>
              <td className="records-cell">
                <span className="records-muted">
                  {rows.filter((row) => row.website || row.href).length} links
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
