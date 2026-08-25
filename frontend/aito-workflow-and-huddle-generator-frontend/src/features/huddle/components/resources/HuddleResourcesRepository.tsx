import { useQueries } from "@tanstack/react-query";
import { BookOpen, ExternalLink, Library, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useApiClient } from "@/api/useApiClient";
import { Badge } from "@/components/ui/badge";
import { getHuddleById } from "../../api";
import { huddleQueryKeys } from "../../hooks/huddleQueryKeys";
import type {
  HuddleCatalogItemResponse,
  HuddleDetailResponse,
  HuddleResourceResponse,
} from "../../types";

interface HuddleResourcesRepositoryProps {
  open: boolean;
  catalog: HuddleCatalogItemResponse[];
  onClose: () => void;
}

interface RepositoryResource extends HuddleResourceResponse {
  tools: string[];
  huddles: string[];
  category: string;
}

function addResource(
  resources: Map<string, RepositoryResource>,
  resource: HuddleResourceResponse,
  huddleName: string,
  toolNames: readonly string[],
) {
  const current = resources.get(resource.externalId) ?? {
    ...resource,
    tools: [],
    huddles: [],
    category: resource.type ?? "Resource",
  };

  toolNames.forEach((name) => {
    if (name && !current.tools.includes(name)) current.tools.push(name);
  });
  if (!current.huddles.includes(huddleName)) current.huddles.push(huddleName);
  resources.set(resource.externalId, current);
}

function collectResources(details: readonly HuddleDetailResponse[]): RepositoryResource[] {
  const resources = new Map<string, RepositoryResource>();

  details.forEach((huddle) => {
    const topicTools = [...huddle.primaryAgents, ...huddle.secondaryAgents].map((agent) => agent.name);
    huddle.topicResources.forEach((resource) => addResource(resources, resource, huddle.name, topicTools));

    [...huddle.primaryAgents, ...huddle.secondaryAgents].forEach((agent) => {
      agent.resources.forEach((resource) => addResource(resources, resource, huddle.name, [agent.name]));
    });

    huddle.phases.forEach((phase) => {
      phase.activities.forEach((activity) => {
        const activityTools = activity.agents.map((agent) => agent.name);
        activity.resources.forEach((resource) => addResource(resources, resource, huddle.name, activityTools));
        activity.agents.forEach((agent) => {
          agent.resources.forEach((resource) => addResource(resources, resource, huddle.name, [agent.name]));
        });
      });
    });
  });

  return [...resources.values()]
    .map((resource) => ({
      ...resource,
      tools: [...resource.tools].sort(),
      huddles: [...resource.huddles].sort(),
    }))
    .sort((left, right) => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title));
}

/** Displays resources from the authenticated Huddle detail APIs. */
export function HuddleResourcesRepository({ open, catalog, onClose }: HuddleResourcesRepositoryProps) {
  const apiClient = useApiClient();
  const [search, setSearch] = useState("");
  const [tool, setTool] = useState("all");

  const detailQueries = useQueries({
    queries: catalog.map((huddle) => ({
      queryKey: huddleQueryKeys.detail(huddle.externalId),
      queryFn: ({ signal }: { signal: AbortSignal }) => getHuddleById(apiClient, huddle.externalId, null, signal),
      enabled: open,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    })),
  });

  const details = useMemo(
    () => detailQueries.flatMap((query) => query.data ? [query.data] : []),
    [detailQueries],
  );
  const resources = useMemo(() => collectResources(details), [details]);
  const tools = useMemo(() => [...new Set(resources.flatMap((resource) => resource.tools))].sort(), [resources]);
  const isLoading = detailQueries.some((query) => query.isLoading);
  const hasError = detailQueries.some((query) => query.isError);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) =>
      (tool === "all" || resource.tools.includes(tool)) &&
      (!query || [resource.title, resource.description, resource.category, ...resource.tools, ...resource.huddles]
        .some((value) => value?.toLowerCase().includes(query))),
    );
  }, [resources, search, tool]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="huddle-resources-title">
      <button type="button" aria-label="Close resources" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D7E4EC] bg-[#F7FAFC] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#E0E6ED] bg-[#F7FAFC] p-6">
          <div className="flex gap-3">
            <span className="rounded-xl bg-[#E2F1F9] p-2.5"><Library className="h-5 w-5 text-[#0A6BBA]" /></span>
            <div><h2 id="huddle-resources-title" className="text-xl font-semibold text-[#16233A]">Huddle Resources</h2><p className="mt-1 text-sm text-[#647185]">Search and browse playbooks, guides, AI tool resources, facilitator support, and Huddle materials.</p></div>
          </div>
          <button type="button" className="rounded-lg p-2 text-[#526176] hover:bg-white" onClick={onClose} aria-label="Close Huddle Resources"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_260px]">
            <label className="relative"><span className="sr-only">Search resources</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73869A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources, topics, roles..." className="h-10 w-full rounded-lg border border-[#D7E4EC] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0A6BBA] focus:ring-2 focus:ring-[#0A6BBA]/20" /></label>
            <select value={tool} onChange={(event) => setTool(event.target.value)} className="h-10 rounded-lg border border-[#D7E4EC] bg-white px-3 text-sm text-[#16233A] outline-none focus:border-[#0A6BBA] focus:ring-2 focus:ring-[#0A6BBA]/20"><option value="all">All AI Tools</option>{tools.map((name) => <option key={name} value={name}>{name}</option>)}</select>
          </div>

          {hasError && <div className="mt-5 rounded-xl border border-[#E7C9A8] bg-[#FFF8E8] px-4 py-3 text-sm text-[#8A4B08]">Some Huddle resources could not be loaded. The available API results are shown below.</div>}

          <div className="mt-5">
            {isLoading && resources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D7E4EC] bg-white p-10 text-center"><Library className="mx-auto h-8 w-8 animate-pulse text-[#0A6BBA]" /><p className="mt-3 font-medium text-[#16233A]">Loading Huddle resources...</p><p className="mt-1 text-sm text-[#647185]">Retrieving topic, activity, and AI-tool resources from the API.</p></div>
            ) : filtered.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((resource) => (
                  <article key={resource.externalId} className="rounded-2xl border border-[#E0E6ED] bg-white p-4 shadow-sm transition hover:border-[#8DC8E8] hover:shadow-md">
                    <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-[#E2F1F9] p-2"><BookOpen className="h-4 w-4 text-[#0A6BBA]" /></span><Badge variant="outline" className="text-[10px] text-[#526176]">{resource.category}</Badge></div>
                    <h3 className="mt-4 font-semibold text-[#16233A]">{resource.title}</h3>
                    {resource.description && <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#647185]">{resource.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5">{resource.tools.map((name) => <Badge key={name} className="border-transparent bg-[#E2F1F9] text-[#0A6BBA]">{name}</Badge>)}{resource.huddles.slice(0, 2).map((name) => <Badge key={name} variant="outline" className="max-w-full truncate text-[#526176]">{name}</Badge>)}</div>
                    {resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#0A6BBA] hover:text-[#115EA3]">{resource.linkLabel || "Open resource"}<ExternalLink className="h-3.5 w-3.5" /></a> : <p className="mt-4 text-xs text-[#73869A]">Link not yet available.</p>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D7E4EC] bg-white p-10 text-center"><Library className="mx-auto h-8 w-8 text-[#73869A]" /><p className="mt-3 font-medium text-[#16233A]">No matching resources found.</p><p className="mt-1 text-sm text-[#647185]">Try another search or AI Tool filter. If all filters are clear, no published resources are currently mapped in the API.</p></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
