import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/feedback";
import { useResponsivePageSize } from "../../hooks/use-responsive-page-size";

interface DataListProps<T> {
  title: string;
  items: T[];
  render: (item: T) => ReactNode;
  searchableText: (item: T) => string;
  empty?: string;
  action?: ReactNode;
}

export function DataList<T>({ title, items, render, searchableText, empty, action }: DataListProps<T>) {
  const pageSize = useResponsivePageSize();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => searchableText(item).toLowerCase().includes(needle));
  }, [items, query, searchableText]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{filtered.length} items</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      <label className="search-field">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} />
      </label>
      <div className="stack">
        {visible.length ? visible.map((item, index) => <div key={`${title}-${currentPage}-${index}`} className="list-row">{render(item)}</div>) : <EmptyState body={empty} />}
      </div>
      <div className="pager">
        <Button variant="icon" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1} aria-label="Previous page"><ChevronLeft size={18} /></Button>
        <span>Page {currentPage} of {pages}</span>
        <Button variant="icon" onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={currentPage >= pages} aria-label="Next page"><ChevronRight size={18} /></Button>
      </div>
    </section>
  );
}
