import type { HuddlePersona } from "@/features/huddle/types/huddlePersona.types";
import type { HuddleViewMode } from "@/features/huddle/store";

export interface TourStep { target: string; title: string; content: string }

const SHELL_TOP: TourStep[] = [
  { target: "brand", title: "AITO home", content: "Return to the application landing page from anywhere." },
  { target: "mode-toggle", title: "Choose your mode", content: "Switch between Workflow and Huddle while each module keeps its own experience." },
];

/** Search searches different things in each module, so its tip is worded per module. */
function shellBottom(isHuddleRoute: boolean): TourStep[] {
  return [
    isHuddleRoute
      ? { target: "global-search", title: "Search Huddles", content: "Type at least two letters to find Huddles. Choose a result to open it in All Topics." }
      : { target: "global-search", title: "Search", content: "Type at least two letters to find roles, activities, and AI tools. Choose a result to jump to it in the workflow builder." },
    { target: "help", title: "Page tips", content: "Reopen these tips any time. They change with your role and the tab you are on." },
  ];
}

/** Last layout step: the profile menu, which is where Send feedback lives. */
const PROFILE: TourStep = { target: "user-menu", title: "Profile Settings & Feedback", content: "Open your profile menu to see your account details and use Send feedback to share your thoughts about the app." };

const WORKFLOW_HEADER: TourStep[] = [
  { target: "saved-workflows", title: "My Workflows", content: "Open the workflows you saved. From there you can open, edit, copy (Save As), favorite, or delete them." },
];

const WORKFLOW_CONTENT: TourStep[] = [
  { target: "workflow-progress", title: "Workflow steps", content: "Move through role selection, activity selection, and your generated workflow." },
  { target: "role-selection", title: "Choose your role", content: "Filter the API-backed role catalog by segment and select the role that matches your work." },
  { target: "workflow-benefits", title: "What you will get", content: "Review how AITO builds relevant activities, AI-tool guidance, and a balanced schedule." },
  { target: "workflow-filters", title: "Filter activities", content: "Narrow the activity list by AI tool or by how long an activity takes." },
  { target: "workflow-select-all", title: "Select all", content: "Add every activity that matches your current filters, or clear them again." },
  { target: "workflow-build", title: "Build My Day", content: "Turn your selected activities into a schedule. It turns on once you select at least one activity." },
  { target: "workflow-timeline", title: "Choose a timeline", content: "Switch the schedule between Day, Week, Month, Quarter, and Year views." },
  { target: "workflow-views", title: "Workflow views", content: "Use Filters to focus on a category, Your Day for the schedule, and the activities tab for the full list." },
  { target: "workflow-save", title: "Save your workflow", content: "Save Workflow stores it under My Workflows. If you opened a saved workflow, Update Workflow overwrites it and Save As keeps a copy." },
  { target: "workflow-calendar", title: "Add to my calendar", content: "Review each time block, then export an .ics file or add the events to Outlook." },
];

const SAVED_WORKFLOWS_CONTENT: TourStep[] = [
  { target: "saved-filters", title: "Find a workflow", content: "Search your saved workflows by name, or show favorites only." },
  { target: "saved-list", title: "Your saved workflows", content: "Open a workflow to view it, Edit to change it, Save As to keep a copy, or Delete to remove it. The star marks a favorite." },
];

const LAUNCH_PLANNER_CONTENT: TourStep[] = [
  { target: "planner-back", title: "Back to Huddles", content: "Return to the Huddle page." },
  { target: "planner-config", title: "Configure the launch", content: "Enter the team, cohort, start date, sponsor, and program lead. Fields marked * are required; the planner works out every other date from the start date." },
  { target: "planner-generate", title: "Generate launch plan", content: "Build the launch timeline, readiness checklist, and communication assets from your details." },
  { target: "planner-status", title: "Launch status", content: "See your launch readiness. Edit setup returns to the form, and Reset planner starts over after you confirm." },
  { target: "planner-next", title: "What to do next", content: "The next incomplete actions, ordered by launch date. Select one to open its checklist and communication assets." },
  { target: "planner-views", title: "Timeline or calendar", content: "View the communication plan as a timeline or a monthly calendar. Select any item to open its details." },
  { target: "planner-export", title: "Export launch package", content: "Bundle the plan into one package for sharing or print/PDF. It is available once you have generated a plan." },
];

/** How the filters work; each role adds why it would use them. */
const FILTERS_HOW = "Narrow the list by audience, focus area, AI tool, or keyword, and use Sort to reorder it. Audience lets you pick more than one role, and Sort > Only All Topics hides the Role Path Huddles.";

/** The breadcrumb's role name returns to that role's first tab (Onboarding, or Orientation for Team Members). */
function breadcrumbTip(roleLabel: string, startTab: string): string {
  return `Home returns to the Huddle landing page, where you can choose a different experience. From Role Path or All Topics, select ${roleLabel} to return to ${startTab}.`;
}

/**
 * Copy that depends on the role. A target a role never sees has no entry for that role, so its
 * step is dropped for it (Launch Planner is Manager-only, Facilitator Hub is Facilitator-only).
 * `huddle-list` is not read from here; see HUDDLE_LIST_TIPS.
 */
const HUDDLE_TIPS: Record<HuddlePersona, Record<string, string>> = {
  manager: {
    "huddle-role": "You are set up as a Manager. Switch experience here if you are standing in for someone else.",
    "huddle-breadcrumb": breadcrumbTip("Manager", "Onboarding"),
    "huddle-sections": "Onboarding explains the programme, Role Path is the week-by-week plan you assign, and All Topics is where you build extra plans.",
    "huddle-launch-planner": "Plan the rollout for your team. The Launch Planner turns a start date into a launch timeline, readiness checklist, and communication plan.",
    "huddle-audience": "Pick the audience role. The recommended Huddles change to match it, and you can move, replace, or reset weeks.",
    "huddle-filters": `${FILTERS_HOW} Use them to narrow the catalogue before you choose topics for your team.`,
    "huddle-detail": "Check the outcome, resources, and takeaways so you know what your team walks away with.",
  },
  facilitator: {
    "huddle-role": "You are set up as a Facilitator. Switch experience here if your role changes.",
    "huddle-breadcrumb": breadcrumbTip("Facilitator", "Onboarding"),
    "huddle-sections": "Onboarding explains the programme, Role Path is the week-by-week sequence you run, and All Topics is where you assemble your own running order.",
    "huddle-audience": "Pick the audience you are facilitating for. The recommended Huddles follow that role.",
    "huddle-filters": `${FILTERS_HOW} Use them to find the topic that fits the room.`,
    "huddle-facilitator-hub": "Open the Facilitator Hub for the selected Huddle: a full-screen workspace with the talk track, activities, notes, and progress. It appears once you select a Huddle.",
    "huddle-detail": "Open Resources and Takeaways before the session. This is your prep view.",
  },
  "team-member": {
    "huddle-role": "You are set up as a Team Member. Switch experience here if your role changes.",
    "huddle-breadcrumb": breadcrumbTip("Team Member", "Orientation"),
    "huddle-sections": "Start with Orientation to see how the programme works. Role Path is your week-by-week sequence, and All Topics has extra Huddles for your role.",
    "huddle-audience": "Pick your role so the recommended Huddles match the work you actually do.",
    "huddle-filters": `${FILTERS_HOW} Use them to find a topic you want to work through.`,
    "huddle-detail": "Read the outcome and today's objective before you start, so you know what you are aiming for.",
  },
};

/** The list means something different on Role Path (weeks) and All Topics (a catalogue). */
const HUDDLE_LIST_TIPS: Record<HuddlePersona, { guided: string; evergreen: string }> = {
  manager: {
    guided: "Your Role Path in week order. Select a week to review its Huddle in the panel before committing your team to it.",
    evergreen: "Additional Huddles for your audience. Select a card to review it before committing your team to it.",
  },
  facilitator: {
    guided: "Your Role Path in week order. Select a week to see its phases and activity count, so you know how long the session will run.",
    evergreen: "Additional Huddles for your audience. Select a card to see its phases and activity count, so you know how long the session will run.",
  },
  "team-member": {
    guided: "Your Role Path in week order. Select a week to read what the Huddle covers.",
    evergreen: "Additional Huddles for your role. Pick the topics you want to learn for your own plan, and select a card to read more.",
  },
};

/**
 * Copy that reads the same for every role. huddle-breadcrumb and huddle-filters are worded per role
 * in HUDDLE_TIPS (role copy wins in huddleStep), so they are not repeated here.
 */
const COMMON_TIPS: Record<string, string> = {
  "huddle-experience": "Choose how you take part: Manager, Facilitator, or Team Member. Everything after this is worded for that role.",
  "huddle-resources": "Every approved link in the programme, gathered in one place.",
  "huddle-onboarding-helps": "See how this app supports your role.",
  "huddle-onboarding-start": "The main button opens your Role Path. Explore All Topics opens the additional Huddles.",
  "huddle-agents": "Meet the core AI agents used across Frontier Accelerator and what each one helps with.",
  "huddle-journey": "See the stages a team moves through, from getting ready to making the Huddle rhythm its own.",
  "huddle-learning-journey": "Three connected steps: understand the motion, practise through your Role Path, then keep growing with All Topics.",
  "huddle-readiness": "A checklist to work through before your first role-based Huddle.",
  "huddle-path-actions": "Export Learning Plan downloads your Role Path as an HTML table of weeks and Huddles. Reset restores the recommended Huddle in every week and is available only after you have changed the path.",
  "huddle-week-html": "Download this week's Huddle as an HTML file. You do not need to select it first.",
  "huddle-week-menu": "Manage this week. Move to week places the Huddle in another week and shifts the rest, Replace Huddle swaps in a different Huddle, and Reset this week restores the recommended one. A Customized label marks weeks you have changed.",
  "huddle-vote": "Thumbs up or down tells us what is useful. Click your vote again to remove it. A downvote asks you to say why before it is saved.",
  "huddle-coming-soon": "Upcoming weeks show the full path, but they have no Huddle yet. They cannot be opened, voted on, managed, or downloaded.",
  "huddle-continue": "Resume a Huddle you started. Continue opens it where you left off, and if more than one is in progress you can expand the list to pick another.",
  "huddle-plan-card": "Your custom plan. Build Learning Plan opens a dialog where you reorder topics with the arrows or remove them, Export Learning Plan downloads it as HTML, and Clear Selection empties it. It appears after you tick a topic.",
  "huddle-plan-select": "Tick a card to add its Huddle to your own learning plan. The number of selected topics shows above the list.",
  "huddle-card-menu": "The three-dot menu opens View details and, when the Huddle has a primary AI tool, Open AI Tool.",
  "huddle-detail-html": "Select a Huddle, then use HTML to download the one shown here as a single HTML file.",
  "huddle-detail-coach": "Meet with a Coach: choose a coach, pick a time that works for both calendars, review, and confirm a session about this Huddle.",
};

const HUDDLE_TITLES: Record<string, string> = {
  "huddle-experience": "Choose your experience",
  "huddle-role": "Your experience",
  "huddle-breadcrumb": "Breadcrumb",
  "huddle-sections": "The three sections",
  "huddle-launch-planner": "Launch Planner",
  "huddle-audience": "Audience",
  "huddle-filters": "Filters",
  "huddle-onboarding-helps": "How this app helps",
  "huddle-onboarding-start": "Where to go next",
  "huddle-agents": "Top 5 Agents",
  "huddle-journey": "Your Huddle Journey",
  "huddle-learning-journey": "Learning Journey",
  "huddle-readiness": "Before you begin",
  "huddle-path-actions": "Reset and export",
  "huddle-continue": "Continue Learning",
  "huddle-plan-card": "Custom Learning Plan",
  "huddle-plan-select": "Add to your plan",
  "huddle-list": "Huddle list",
  "huddle-week-html": "Download as HTML",
  "huddle-week-menu": "Manage Week",
  "huddle-vote": "Vote",
  "huddle-card-menu": "Card menu",
  "huddle-coming-soon": "Coming soon",
  "huddle-detail": "Selected Huddle",
  "huddle-detail-html": "HTML",
  "huddle-detail-coach": "Meet with a Coach",
  "huddle-facilitator-hub": "Facilitator Hub",
  "huddle-resources": "Resources library",
};

/** What each tab can show, in page order. Targets that are absent from the page are dropped by the caller. */
const HUDDLE_PAGE_TARGETS: Record<HuddleViewMode, string[]> = {
  orientation: ["huddle-breadcrumb", "huddle-launch-planner", "huddle-resources", "huddle-sections", "huddle-onboarding-helps", "huddle-onboarding-start"],
  guided: ["huddle-breadcrumb", "huddle-launch-planner", "huddle-resources", "huddle-facilitator-hub", "huddle-sections", "huddle-audience", "huddle-path-actions", "huddle-list", "huddle-week-html", "huddle-week-menu", "huddle-vote", "huddle-coming-soon", "huddle-detail", "huddle-detail-html", "huddle-detail-coach"],
  evergreen: ["huddle-breadcrumb", "huddle-launch-planner", "huddle-resources", "huddle-facilitator-hub", "huddle-sections", "huddle-filters", "huddle-continue", "huddle-plan-card", "huddle-list", "huddle-plan-select", "huddle-vote", "huddle-card-menu", "huddle-detail", "huddle-detail-html", "huddle-detail-coach"],
};

/** Used before an experience is chosen, so there is no role to word the copy for. */
const HUDDLE_LANDING_TARGETS = ["huddle-experience", "huddle-resources", "huddle-agents", "huddle-journey", "huddle-learning-journey", "huddle-readiness"];

/** Role copy first, then the shared copy; a step with no copy for this role does not exist for it. */
function huddleStep(persona: HuddlePersona | null, viewMode: HuddleViewMode, target: string): TourStep | null {
  const listTips = persona ? HUDDLE_LIST_TIPS[persona] : null;
  const content = target === "huddle-list"
    ? listTips?.[viewMode === "guided" ? "guided" : "evergreen"]
    : (persona ? HUDDLE_TIPS[persona][target] : undefined) ?? COMMON_TIPS[target];
  return content ? { target, title: HUDDLE_TITLES[target] ?? target, content } : null;
}

function huddleSteps(persona: HuddlePersona | null, viewMode: HuddleViewMode, targets: string[]): TourStep[] {
  return targets.map((target) => huddleStep(persona, viewMode, target)).filter((step): step is TourStep => step !== null);
}

interface ResolveTourStepsInput {
  isHuddleRoute: boolean;
  persona: HuddlePersona | null;
  viewMode: HuddleViewMode;
  pathname: string;
}

/** Shown in place of the role-worded step until an experience is chosen. */
const CHOOSE_ROLE_STEP: TourStep = {
  target: "huddle-role",
  title: "Your experience",
  content: "Pick how you take part: Manager, Facilitator, or Team Member. The rest of the page follows that choice.",
};

/** The application shell: navigation, mode switching, search, and this help control. */
export function resolveLayoutSteps({ isHuddleRoute, persona, viewMode }: ResolveTourStepsInput): TourStep[] {
  const moduleHeader = isHuddleRoute
    ? [persona ? huddleStep(persona, viewMode, "huddle-role") : CHOOSE_ROLE_STEP].filter((step): step is TourStep => step !== null)
    : WORKFLOW_HEADER;
  return [...SHELL_TOP, ...moduleHeader, ...shellBottom(isHuddleRoute), PROFILE];
}

/**
 * What is on the page right now, worded for the signed-in role. Targets that are absent
 * are dropped by the caller, so conditional controls need no special casing here.
 */
export function resolvePageSteps({ isHuddleRoute, persona, viewMode, pathname }: ResolveTourStepsInput): TourStep[] {
  if (pathname.startsWith("/huddle/launch-planner")) return LAUNCH_PLANNER_CONTENT;
  if (pathname === "/workflows" || pathname.startsWith("/workflows/")) return SAVED_WORKFLOWS_CONTENT;
  if (!isHuddleRoute) return WORKFLOW_CONTENT;
  if (!persona) return huddleSteps(null, viewMode, HUDDLE_LANDING_TARGETS);
  return huddleSteps(persona, viewMode, HUDDLE_PAGE_TARGETS[viewMode]);
}
