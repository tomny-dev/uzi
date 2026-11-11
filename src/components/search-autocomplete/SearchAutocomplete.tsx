"use client";

import * as React from "react";
import { Input, type InputProps } from "../input/Input";
import styles from "./search-autocomplete.module.css";

export interface SearchSuggestion {
  /** Stable unique identifier, including across groups. */
  id: string;
  label: string;
  description?: string;
  group?: string;
  href: string;
}

/** Resolve default suggestion navigation without executing non-web URL schemes. */
export function resolveSafeSuggestionHref(href: string, baseUrl: string): string | null {
  try {
    const target = new URL(href, baseUrl);
    return target.protocol === "https:" || target.protocol === "http:" ? target.href : null;
  } catch {
    return null;
  }
}

export interface SearchAutocompleteProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "onSelect"> {
  value?: string;
  defaultValue?: string;
  onQueryChange?: (query: string) => void;
  /** Recommendations shown when the input is empty. */
  recommendations?: readonly SearchSuggestion[];
  /** Async source; applications own retrieval and authorization. */
  search?: (query: string, signal: AbortSignal) => Promise<readonly SearchSuggestion[]>;
  /** Called for an option; defaults to browser navigation. */
  onNavigate?: (suggestion: SearchSuggestion) => void;
  /** Called on Enter without a selected suggestion. */
  onSearch?: (query: string) => void;
  debounceMs?: number;
  maxSuggestions?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
}

export function SearchAutocomplete({
  value,
  defaultValue = "",
  onQueryChange,
  recommendations = [],
  search,
  onNavigate,
  onSearch,
  debounceMs = 200,
  maxSuggestions = 8,
  emptyMessage = "No suggestions found",
  loadingMessage = "Searching…",
  className,
  onFocus,
  onKeyDown,
  onBlur,
  id,
  ...inputProps
}: SearchAutocompleteProps) {
  const reactId = React.useId();
  const inputId = id ?? `uzi-search-${reactId}`;
  const listId = `${inputId}-suggestions`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const query = value ?? internalValue;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [results, setResults] = React.useState<readonly SearchSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const trimmed = query.trim();
  const suggestions = (trimmed ? (search ? results : recommendations.filter((item) =>
    `${item.label} ${item.description ?? ""} ${item.group ?? ""}`.toLowerCase().includes(trimmed.toLowerCase())
  )) : recommendations).slice(0, Math.max(0, maxSuggestions));

  React.useEffect(() => {
    if (!trimmed || !search) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = window.setTimeout(() => {
      void search(trimmed, controller.signal).then((items) => {
        if (!controller.signal.aborted) setResults(items);
      }).catch(() => {
        if (!controller.signal.aborted) { setResults([]); setError(true); }
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }, Math.max(0, debounceMs));
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [trimmed, search, debounceMs]);

  React.useEffect(() => { setActive(-1); }, [query]);

  React.useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  const navigate = (item: SearchSuggestion) => {
    setOpen(false);
    if (onNavigate) onNavigate(item);
    else {
      const safeHref = resolveSafeSuggestionHref(item.href, window.location.href);
      if (safeHref) window.location.assign(safeHref);
    }
  };
  const choose = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" || event.key === "Tab") { setOpen(false); setActive(-1); }
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!open) setOpen(true);
      event.preventDefault();
      if (suggestions.length) setActive((old) => event.key === "ArrowDown"
        ? (old + 1) % suggestions.length
        : (old <= 0 ? suggestions.length - 1 : old - 1));
    } else if (event.key === "Enter") {
      if (open && active >= 0 && suggestions[active]) {
        event.preventDefault();
        navigate(suggestions[active]);
      } else if (onSearch) {
        event.preventDefault();
        setOpen(false);
        onSearch(query);
      }
    }
  };

  return (
    <div className={`${styles.root} ${className ?? ""}`} ref={rootRef}>
      <Input
        {...inputProps}
        id={inputId}
        value={query}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-option-${active}` : undefined}
        onChange={(event) => {
          if (value === undefined) setInternalValue(event.target.value);
          onQueryChange?.(event.target.value);
          setOpen(true);
        }}
        onFocus={(event) => { setOpen(true); onFocus?.(event); }}
        onBlur={onBlur}
        onKeyDown={(event) => { choose(event); onKeyDown?.(event); }}
      />
      {open && (
        <div className={styles.panel} id={listId} role="listbox" aria-label="Search suggestions">
          {loading ? <div className={styles.status} role="status">{loadingMessage}</div> : error
            ? <div className={styles.status} role="status">Suggestions unavailable</div>
            : suggestions.length === 0
              ? <div className={styles.status}>{emptyMessage}</div>
              : suggestions.map((item, index) => (
                <div key={item.id} role="option" id={`${listId}-option-${index}`}
                  aria-selected={active === index}
                  className={`${styles.option} ${active === index ? styles.active : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => navigate(item)}>
                  <span className={styles.details}>
                    <span className={styles.label}>{item.label}</span>
                    {item.description && <span className={styles.description}>{item.description}</span>}
                  </span>
                  {item.group && <span className={styles.group}>{item.group}</span>}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
