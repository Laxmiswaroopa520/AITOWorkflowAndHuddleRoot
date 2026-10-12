import { Bot, FolderOpen, Link2, Presentation } from 'lucide-react';
import type { ElementType } from 'react';

interface ResourceItem {
  label: string;
  url: string;
}

interface ResourceCategory {
  title: string;
  description: string;
  icon: ElementType;
  /** Empty until content is ready. A category with items lists them as links instead of "Coming soon". */
  items: ResourceItem[];
}

/**
 * The landing page's centralized Resources area. Links, presentations, agents and related materials
 * collect here at the bottom of the page rather than crowding the sections above. To publish content,
 * add items to a category; the layout does not need to change.
 */
const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { title: 'Resource links', description: 'Guides, articles, and reference pages that support each Huddle.', icon: Link2, items: [] },
  { title: 'Presentations', description: 'Decks and session materials to run or share a Huddle.', icon: Presentation, items: [] },
  { title: 'Agents', description: 'The AI agents used across Huddles and how to get started with them.', icon: Bot, items: [] },
  { title: 'Related materials', description: 'Templates, worksheets, and other supporting content.', icon: FolderOpen, items: [] },
];

export function HuddleResourcesSection() {
  return <section className="space-y-5" aria-labelledby="huddle-resources-heading">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">Resources</p>
      <h2 id="huddle-resources-heading" className="mt-2 text-3xl font-semibold text-[#16233A]">Everything that supports your Huddles, in one place</h2>
      <p className="mt-2 text-sm text-[#647185]">Resource links, presentations, agents, and related materials will live here.</p>
    </div>
    <div className="grid gap-4 rounded-[28px] border border-[#DDE6EC] bg-white p-6 sm:grid-cols-2 md:p-8 xl:grid-cols-4">
      {RESOURCE_CATEGORIES.map(({ title, description, icon: Icon, items }) => (
        <article key={title} className="flex flex-col rounded-2xl border border-[#E3EBF0] bg-[#F8FBFD] p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F1F9] text-[#0A6BBA]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
          <h3 className="mt-4 text-base font-semibold text-[#16233A]">{title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-6 text-[#647185]">{description}</p>
          {items.length > 0 ? (
            <ul className="mt-4 space-y-1.5">
              {items.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#0A6BBA] hover:underline">{item.label}</a></li>)}
            </ul>
          ) : (
            <span className="mt-4 inline-flex w-fit rounded-full border border-[#D5DEE5] bg-white px-2.5 py-1 text-xs font-semibold text-[#647185]">Coming soon</span>
          )}
        </article>
      ))}
    </div>
  </section>;
}
