import type { HuddlePersona } from "@/features/huddle/types/huddlePersona.types";
import type { HuddleViewMode } from "@/features/huddle/store";

export interface TourStep { target: string; title: string; content: string }

const SHELL_TOP: TourStep[] = [
  { target: "brand", title: "Home", content: "Return to the application landing page from anywhere." },
  { target: "mode-toggle", title: "Choose your mode", content: "Switch between Workflow and Huddle while each module keeps its own experience." },
];

const SHELL_BOTTOM: TourStep[] = [
  { target: "global-search", title: "Search", content: "Find activities, prompts, and tools from the current experience." },
  { target: "help", title: "Page tips", content: "Reopen these tips any time. They change with your role and the tab you are on." },
  { target: "user-menu", title: "Profile Settings & Feedback", content: "Open your profile menu to see your account details and find Send feedback to share ideas or report a problem." },
];

const WORKFLOW_HEADER: TourStep[] = [];

/** Workflow tips are matched to the step on screen: a target that is not rendered is dropped when the tour opens. */
const WORKFLOW_CONTENT: TourStep[] = [
  { target: "workflow-progress", title: "Workflow steps", content: "Move through role selection, activity selection, and your generated workflow." },
  { target: "role-selection", title: "Choose your role", content: "Filter the API-backed role catalog by segment and select the role that matches your work." },
  { target: "workflow-benefits", title: "What you will get", content: "Review how Frontier Accelerator builds relevant activities, AI-tool guidance, and a balanced schedule." },
  { target: "activity-select-all", title: "Select or clear all", content: "Selects every activity that matches your filters, or clears them. You can still tick activities one by one." },
  { target: "activity-filters", title: "Filter activities", content: "Narrow the list by AI tool or by how long an activity takes." },
  { target: "saved-workflows", title: "My Workflows", content: "Open, update, copy, favorite, or delete workflows you saved." },
  { target: "activity-build", title: "Build My Day", content: "Turns your selected activities into a schedule. It stays disabled until you select at least one." },
  { target: "activity-list", title: "Choose activities", content: "Tick the activities you want in your day. Expand an activity to read its details before you decide." },
  { target: "workflow-navigation", title: "Edit or start again", content: "Edit Activities goes back to your selection. Start again begins a new workflow." },
  { target: "workflow-timeline-toggle", title: "Timeline range", content: "Switch your schedule between Day, Week, Month, Quarter, and Year." },
  { target: "workflow-view-tabs", title: "Schedule views", content: "Move between your filters, your day's schedule, and the full list of selected activities." },
  { target: "workflow-save", title: "Save your workflow", content: "Save this workflow to My Workflows. When you reopen a saved one you can Update it or Save As a copy." },
  { target: "workflow-calendar", title: "Add to my calendar", content: "Opens a review of your scheduled activities before anything is added to your calendar." },
];

/** Copy is written per role, because each one uses this page for a different job. */
const HUDDLE_TIPS: Record<HuddlePersona, Record<string, string>> = {
  manager: {
    "huddle-role": "You are set up as a Manager. Switch experience here if you are standing in for someone else.",
    "huddle-sections": "Role Path is the seven-week plan you assign, and All Topics is where you build extra plans. Select Manager in the breadcrumb to return to the onboarding page.",
    "huddle-launch-planner": "Plan the rollout for your team: dates, comms, and which sessions to run first.",
    "huddle-audience": "Pick the audience role. The seven recommended Huddles change to match it, and you can reorder or reset the plan.",
    "huddle-filters": "Narrow the catalogue by audience, focus area, AI tool, or keyword before you choose topics.",
    "huddle-list": "Review each Huddle before committing your team to it. Voting tells us what is landing and what is not.",
    "huddle-detail": "Check the outcome, resources, and takeaways so you know what your team walks away with.",
    "huddle-generate": "Generate the full session, then export it or book a coach to run it with you.",
    "huddle-resources": "Every approved link in the programme, gathered in one place.",
  },
  facilitator: {
    "huddle-role": "You are set up as a Facilitator. Switch experience here if your role changes.",
    "huddle-sections": "Role Path is the seven-week sequence you run, and All Topics is where you assemble your own running order. Select Facilitator in the breadcrumb to return to the onboarding page.",
    "huddle-launch-planner": "Plan the rollout: dates, comms, and which sessions to run first.",
    "huddle-audience": "Pick the audience you are facilitating for. The recommended seven Huddles follow that role.",
    "huddle-filters": "Filter by audience, focus area, AI tool, or keyword to find the topic that fits the room.",
    "huddle-list": "Scan the phases and activity counts so you know how long each session will actually run.",
    "huddle-detail": "Open Resources and Takeaways before the session. This is your prep view.",
    "huddle-generate": "Generate the session to get the talk track, phase timings, and activity checkpoints you run from.",
    "huddle-resources": "Every approved link in the programme, gathered in one place.",
  },
  "team-member": {
    "huddle-role": "You are set up as a Team Member. Switch experience here if your role changes.",
    "huddle-sections": "Role Path is your seven-week sequence, and All Topics has extra Huddles for your role. Select Team Member in the breadcrumb to return to the orientation page.",
    "huddle-launch-planner": "Plan the rollout: dates, comms, and which sessions to run first.",
    "huddle-audience": "Pick your role so the seven recommended Huddles match the work you actually do.",
    "huddle-filters": "Filter by audience, focus area, AI tool, or keyword to find a topic you want to work through.",
    "huddle-list": "Tick the topics you want to learn, then build them into your own plan.",
    "huddle-detail": "Read the outcome and today's objective before you start, so you know what you are aiming for.",
    "huddle-generate": "Generate the Huddle to work through it activity by activity. Your progress saves as you go.",
    "huddle-resources": "Every approved link in the programme, gathered in one place.",
  },
};

/** Used before an experience is chosen, so there is no role to word the copy for. */
const NEUTRAL_TIPS: Record<string, string> = {
  "huddle-agents": "The core AI agents used across Frontier Accelerator, with what each one helps you do.",
  "huddle-experience": "Choose how you take part: Manager, Facilitator, or Team Member. Everything after this is worded for that role.",
  "huddle-journey": "The three connected steps of the motion: understand it, practice by role, then keep expanding through self-directed topics.",
  "huddle-in-a-box": "Can't find your role, workflow, practice, or tool? Create your own Huddle opens Huddle in a Box. Download its HTML template, open it in your browser, then customize it and run it with your team.",
  "huddle-resources": "Search and browse playbooks, guides, AI tool resources, facilitator support, and Huddle materials in one place.",
};

const HUDDLE_TITLES: Record<string, string> = {
  "huddle-experience": "Select your huddle role",
  "huddle-agents": "Top 5 Agents",
  "huddle-journey": "Learning journey",
  "huddle-in-a-box": "Create your own Huddle",
  "huddle-role": "Your experience",
  "huddle-sections": "The two sections",
  "huddle-launch-planner": "Launch Planner",
  "huddle-audience": "Audience",
  "huddle-filters": "Filters",
  "huddle-list": "Huddle list",
  "huddle-detail": "Selected Huddle",
  "huddle-generate": "Generate Huddle",
  "huddle-resources": "Resources library",
};

function huddleStep(persona: HuddlePersona, target: string): TourStep {
  return { target, title: HUDDLE_TITLES[target] ?? target, content: HUDDLE_TIPS[persona][target] };
}

interface ResolveTourStepsInput {
  isHuddleRoute: boolean;
  persona: HuddlePersona | null;
  viewMode: HuddleViewMode;
}

/** Shown in place of the role-worded step until an experience is chosen. */
const CHOOSE_ROLE_STEP: TourStep = {
  target: "huddle-role",
  title: "Your experience",
  content: "Pick how you take part: Manager, Facilitator, or Team Member. The rest of the page follows that choice.",
};

/** The application shell: navigation, mode switching, search, and this help control. */
export function resolveLayoutSteps({ isHuddleRoute, persona }: ResolveTourStepsInput): TourStep[] {
  const moduleHeader = isHuddleRoute
    ? [persona ? huddleStep(persona, "huddle-role") : CHOOSE_ROLE_STEP]
    : WORKFLOW_HEADER;
  return [...SHELL_TOP, ...moduleHeader, ...SHELL_BOTTOM];
}

/** Role page tips (after choosing an experience, before opening Role Path or All Topics), as in AITO-inapp. */
const ROLE_PAGE_TIPS = new Map<HuddlePersona, TourStep[]>([
  ["manager", [
    { target: "huddle-breadcrumb", title: "Breadcrumb", content: "Home returns to the Huddle landing page, where you choose your experience. From Role Path or All Topics, select the role name here to come back to this onboarding page." },
    { target: "huddle-sections", title: "The two sections", content: "Role Path is the recommended week-by-week plan for your team's role, and All Topics is where you build extra learning plans." },
    { target: "huddle-launch-planner", title: "Launch Planner", content: "Opens the Launch Planner, for Managers only. Turn a start date into a launch timeline, readiness checklist, and communication package." },
    { target: "huddle-resources", title: "Resources library", content: "Search and browse playbooks, guides, AI tool resources, facilitator support, and Huddle materials in one place." },
    { target: "huddle-onboarding-start", title: "Start here", content: "Explore Role Path takes you to your week-by-week plan." },
    { target: "huddle-onboarding-walkthrough", title: "HTML Walkthrough", content: "Opens the one-page 'How to Lead a Huddle' guide as an image, with a Download button." },
    { target: "huddle-onboarding-helps", title: "How this app helps", content: "A summary of how this app supports you as a Manager." },
    { target: "huddle-onboarding-timeline", title: "Your action plan", content: "Your action plan: what to do at each stage of the program, in order." },
    { target: "huddle-onboarding-rhythm", title: "The Huddle rhythm", content: "What to do before, during, and after each Huddle, so the weekly routine stays consistent." },
    { target: "huddle-onboarding-continue", title: "Ready to continue?", content: "Ready to continue? Go straight to your Role Path, or choose Explore All Topics to browse additional Huddles." },
    { target: "huddle-in-a-box", title: "Create your own Huddle", content: "Can't find your role, workflow, practice, or tool? Create your own Huddle opens Huddle in a Box. Download its HTML template, open it in your browser, then customize it and run it with your team." },
  ]],
  ["facilitator", [
    { target: "huddle-breadcrumb", title: "Breadcrumb", content: "Home returns to the Huddle landing page, where you choose your experience. From Role Path or All Topics, select the role name here to come back to this onboarding page." },
    { target: "huddle-sections", title: "The two sections", content: "Role Path is the week-by-week sequence you run, and All Topics is where you assemble your own running order." },
    { target: "huddle-resources", title: "Resources library", content: "Search and browse playbooks, guides, AI tool resources, facilitator support, and Huddle materials in one place." },
    { target: "huddle-onboarding-start", title: "Start here", content: "Explore Role Path takes you to your week-by-week plan." },
    { target: "huddle-onboarding-walkthrough", title: "HTML Walkthrough", content: "Opens the one-page 'How a Huddle Runs' guide as an image, with a Download button." },
    { target: "huddle-onboarding-helps", title: "How this app helps", content: "A summary of how this app supports you as a Facilitator." },
    { target: "huddle-onboarding-timeline", title: "Your action plan", content: "Your action plan: what to do at each stage of the program, in order." },
    { target: "huddle-onboarding-rhythm", title: "The Huddle rhythm", content: "What to do before, during, and after each Huddle, so the weekly routine stays consistent." },
    { target: "huddle-onboarding-continue", title: "Ready to continue?", content: "Ready to continue? Go straight to your Role Path, or choose Explore All Topics to browse additional Huddles." },
    { target: "huddle-in-a-box", title: "Create your own Huddle", content: "Can't find your role, workflow, practice, or tool? Create your own Huddle opens Huddle in a Box. Download its HTML template, open it in your browser, then customize it and run it with your team." },
  ]],
  ["team-member", [
    { target: "huddle-breadcrumb", title: "Breadcrumb", content: "Home returns to the Huddle landing page, where you choose your experience. From Role Path or All Topics, select the role name here to come back to this onboarding page." },
    { target: "huddle-sections", title: "The two sections", content: "Role Path is your week-by-week plan, and All Topics has extra Huddles for your role." },
    { target: "huddle-resources", title: "Resources library", content: "Search and browse playbooks, guides, AI tool resources, facilitator support, and Huddle materials in one place." },
    { target: "huddle-onboarding-start", title: "Start here", content: "Explore Role Path takes you to your week-by-week plan." },
    { target: "huddle-onboarding-helps", title: "How this app helps", content: "A summary of how this app supports you as a Team Member." },
    { target: "huddle-onboarding-timeline", title: "Your action plan", content: "Your action plan: what to do at each stage of the program, in order." },
    { target: "huddle-onboarding-rhythm", title: "The Huddle rhythm", content: "What to do before, during, and after each Huddle, so the weekly routine stays consistent." },
    { target: "huddle-onboarding-continue", title: "Ready to continue?", content: "Ready to continue? Go straight to your Role Path, or choose Explore All Topics to browse additional Huddles." },
    { target: "huddle-in-a-box", title: "Create your own Huddle", content: "Can't find your role, workflow, practice, or tool? Create your own Huddle opens Huddle in a Box. Download its HTML template, open it in your browser, then customize it and run it with your team." },
  ]],
]);

/**
 * What is on the page right now, worded for the signed-in role. Targets that are absent
 * are dropped by the caller, so conditional controls need no special casing here.
 */
export function resolvePageSteps({ isHuddleRoute, persona, viewMode }: ResolveTourStepsInput): TourStep[] {
  if (!isHuddleRoute) return WORKFLOW_CONTENT;
  if (persona && viewMode === "orientation") return ROLE_PAGE_TIPS.get(persona) ?? [];
  if (!persona) {
    return Object.keys(NEUTRAL_TIPS).map((target) => ({ target, title: HUDDLE_TITLES[target] ?? target, content: NEUTRAL_TIPS[target] }));
  }

  const contentTargets = viewMode === "guided" ? ["huddle-audience"] : viewMode === "evergreen" ? ["huddle-filters"] : [];
  return [
    "huddle-sections",
    "huddle-launch-planner",
    ...contentTargets,
    "huddle-list",
    "huddle-detail",
    "huddle-generate",
    "huddle-resources",
  ].map((target) => huddleStep(persona, target));
}
