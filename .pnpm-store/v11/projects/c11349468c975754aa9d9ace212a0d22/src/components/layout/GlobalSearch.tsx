import { Bot, BriefcaseBusiness, Search, Sparkles, Target, Users, X } from "lucide-react";
import { useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useHuddleCatalog } from "@/features/huddle/hooks";
import { huddleViewModeAtom, selectedHuddleExternalIdAtom } from "@/features/huddle/store";
import { useActivities } from "@/features/workflow-builder/hooks/useActivities";
import { useAiTools } from "@/features/workflow-builder/hooks/useAiTools";
import { useRoles } from "@/features/workflow-builder/hooks/useRoles";
import { currentWorkflowStepAtom, selectedRoleIdAtom, workflowFiltersAtom } from "@/features/workflow-builder/store/workflowAtoms";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  icon: typeof Search;
  activate: () => void;
}

interface GlobalSearchProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
}

/** Provides API-backed, module-aware search from the application header. */
export function GlobalSearch({ autoFocus = false, onNavigate }: GlobalSearchProps) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHuddleRoute = location.pathname.startsWith("/huddle");

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const finish = () => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
  };

  return <div ref={containerRef} className="relative">
    <label className="relative block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        autoFocus={autoFocus}
        type="text"
        role="searchbox"
        value={query}
        aria-label={isHuddleRoute ? "Search Huddles" : "Search workflow activities, roles and tools"}
        aria-expanded={open}
        aria-controls="global-search-results"
        placeholder={isHuddleRoute ? "Search Huddles, tools..." : "Search activities, prompts, tools..."}
        className="h-10 w-full rounded-xl border border-transparent bg-muted px-10 text-sm outline-none ring-primary/50 placeholder:text-muted-foreground hover:border-border focus:border-primary/40 focus:ring-2"
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setOpen(value.trim().length >= 2);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      />
      {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
    </label>
    {isHuddleRoute
      ? <HuddleResults query={query} open={open} activeIndex={activeIndex} setActiveIndex={setActiveIndex} finish={finish} />
      : <WorkflowResults query={query} open={open} activeIndex={activeIndex} setActiveIndex={setActiveIndex} finish={finish} />}
  </div>;
}

function useDebouncedSearchValue(value: string, delayMilliseconds = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedValue(value),
      delayMilliseconds,
    );

    return () => window.clearTimeout(timeoutId);
  }, [delayMilliseconds, value]);

  return debouncedValue;
}

function HuddleResults({ query, open, activeIndex, setActiveIndex, finish }: ResultProps) {
  const navigate = useNavigate();
  const setSelectedHuddle = useSetAtom(selectedHuddleExternalIdAtom);
  const setViewMode = useSetAtom(huddleViewModeAtom);
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedSearchValue(normalizedQuery);
  const enabled = debouncedQuery.length >= 2;
  const waitingForDebounce = normalizedQuery.length >= 2 && debouncedQuery !== normalizedQuery;
  const catalog = useHuddleCatalog(
    { search: enabled ? debouncedQuery : undefined },
    enabled,
  );
  const results = useMemo<SearchResult[]>(() => (catalog.data ?? []).slice(0, 10).map((huddle) => ({
    id: huddle.externalId,
    title: huddle.name,
    subtitle: huddle.description ?? ([huddle.focusAreaName, ...huddle.primaryAgents.map((agent) => agent.name)].filter(Boolean).join(" · ") || "Published Huddle"),
    label: huddle.type,
    icon: Users,
    activate: () => {
      setViewMode("evergreen");
      setSelectedHuddle(huddle.externalId);
      navigate("/huddle");
      finish();
    },
  })), [catalog.data, finish, navigate, setSelectedHuddle, setViewMode]);
  return <ResultsPanel query={normalizedQuery} open={open} results={results} loading={waitingForDebounce || catalog.isFetching} error={catalog.error} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />;
}

function WorkflowResults({ query, open, activeIndex, setActiveIndex, finish }: ResultProps) {
  const navigate = useNavigate();
  const setRole = useSetAtom(selectedRoleIdAtom);
  const setStep = useSetAtom(currentWorkflowStepAtom);
  const setFilters = useSetAtom(workflowFiltersAtom);
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedSearchValue(normalizedQuery);
  const enabled = debouncedQuery.length >= 2;
  const waitingForDebounce = normalizedQuery.length >= 2 && debouncedQuery !== normalizedQuery;
  const roles = useRoles();
  const tools = useAiTools();
  const activities = useActivities({ search: debouncedQuery }, enabled);
  const results = useMemo<SearchResult[]>(() => {
    if (!enabled) return [];
    const loweredQuery = debouncedQuery.toLocaleLowerCase();
    const includes = (value?: string | null) => value?.toLocaleLowerCase().includes(loweredQuery) ?? false;
    const roleResults: SearchResult[] = (roles.data ?? []).filter((role) => includes(role.name) || includes(role.abbreviation) || includes(role.description) || includes(role.segment)).slice(0, 4).map((role) => ({
      id: `role-${role.externalId}`, title: role.name, subtitle: role.description ?? role.segment ?? "Workflow role", label: "Role", icon: BriefcaseBusiness,
      activate: () => { setRole(role.externalId); setStep("customize"); navigate("/workflow"); finish(); },
    }));
    const activityResults: SearchResult[] = (activities.data ?? []).slice(0, 7).map((activity) => ({
      id: `activity-${activity.externalId}`, title: activity.title, subtitle: activity.description ?? activity.workflowBucketName, label: "Activity", icon: Target,
      activate: () => { setRole(activity.roleExternalId); setFilters((current) => ({ ...current, search: debouncedQuery })); setStep("customize"); navigate("/workflow"); finish(); },
    }));
    const toolResults: SearchResult[] = (tools.data ?? []).filter((tool) => includes(tool.name) || includes(tool.description)).slice(0, 3).map((tool) => ({
      id: `tool-${tool.externalId}`, title: tool.name, subtitle: tool.description ?? "AI tool", label: "AI Tool", icon: Bot,
      activate: () => { setFilters((current) => ({ ...current, aiToolId: tool.externalId })); setStep("customize"); navigate("/workflow"); finish(); },
    }));
    return [...roleResults, ...activityResults, ...toolResults].slice(0, 10);
  }, [activities.data, debouncedQuery, enabled, finish, navigate, roles.data, setFilters, setRole, setStep, tools.data]);
  return <ResultsPanel query={normalizedQuery} open={open} results={results} loading={waitingForDebounce || activities.isFetching || roles.isFetching || tools.isFetching} error={activities.error ?? roles.error ?? tools.error} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />;
}

interface ResultProps {
  query: string;
  open: boolean;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  finish: () => void;
}

type ResultsPanelProps = Omit<ResultProps, "finish"> & { results: SearchResult[]; loading: boolean; error: Error | null };

function ResultsPanel({ query, open, results, loading, error, activeIndex, setActiveIndex }: ResultsPanelProps) {
  if (!open) return null;
  return <div id="global-search-results" role="listbox" className="absolute right-0 top-[calc(100%+8px)] z-[70] max-h-[min(460px,70vh)] w-[min(440px,calc(100vw-2rem))] isolate overflow-y-auto rounded-xl border border-border bg-background p-2 text-foreground opacity-100 shadow-2xl">
    <div className="flex items-center justify-between px-2 pb-2 pt-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Search results</span>{loading && <span className="text-xs text-muted-foreground">Searching…</span>}</div>
    {error && <p className="rounded-lg bg-destructive/10 px-3 py-4 text-sm text-destructive">Search is temporarily unavailable.</p>}
    {!error && !loading && results.length === 0 && <div className="px-4 py-8 text-center" role="status"><Sparkles className="mx-auto mb-2 h-5 w-5 text-muted-foreground" /><p className="font-medium">No results found</p><p className="mt-1 text-xs text-muted-foreground">No matches were found for &quot;{query}&quot;. Try another activity, role, Huddle, prompt, or AI tool.</p></div>}
    <div className="space-y-1">{results.map((result, index) => {
      const Icon = result.icon;
      return <button key={result.id} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={result.activate} className={cn("flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors", index === activeIndex ? "bg-accent" : "hover:bg-accent/70")}>
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-sm font-semibold">{result.title}</strong><span className="shrink-0 rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary">{result.label}</span></span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{result.subtitle}</span></span>
      </button>;
    })}</div>
    {results.length > 0 && <div className="mt-2 flex items-center gap-3 border-t border-border px-2 pt-2 text-[10px] text-muted-foreground"><span><kbd className="rounded border px-1">↑↓</kbd> Navigate</span><span><kbd className="rounded border px-1">Enter</kbd> Open</span><span><kbd className="rounded border px-1">Esc</kbd> Close</span></div>}
    <KeyboardController results={results} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
  </div>;
}

function KeyboardController({ results, activeIndex, setActiveIndex }: { results: SearchResult[]; activeIndex: number; setActiveIndex: (index: number) => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!results.length) return;
      if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((activeIndex + 1) % results.length); }
      if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((activeIndex - 1 + results.length) % results.length); }
      if (event.key === "Enter") { event.preventDefault(); results[activeIndex]?.activate(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [activeIndex, results, setActiveIndex]);
  return null;
}
