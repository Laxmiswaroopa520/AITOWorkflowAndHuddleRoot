import type { HuddlePersona } from "@/features/huddle/types/huddlePersona.types";
import type { HuddleViewMode } from "@/features/huddle/store";

export interface TourStep { target: string; title: string; content: string }

const SHELL_TOP: TourStep[] = [
  { target: "brand", title: "AITO home", content: "Return to the application landing page from anywhere." },
  { target: "mode-toggle", title: "Choose your mode", content: "Switch between Workflow and Huddle while each module keeps its own experience." },
];

const SHELL_BOTTOM: TourStep[] = [
  { target: "global-search", title: "Search", content: "Find activities, prompts, and tools from the current experience." },
  { target: "help", title: "Page tips", content: "Reopen these tips any time. They change with your role and the tab you are on." },
];

const WORKFLOW_HEADER: TourStep[] = [
  { target: "saved-workflows", title: "My Workflows", content: "Open, update, copy, favorite, or delete workflows you saved." },
];

const WORKFLOW_CONTENT: TourStep[] = [
  { target: "workflow-progress", title: "Workflow steps", content: "Move through role selection, activity selection, and your generated workflow." },
  { target: "role-selection", title: "Choose your role", content: "Filter the API-backed role catalog by segment and select the role that matches your work." },
  { target: "workflow-benefits", title: "What you will get", content: "Review how AITO builds relevant activities, AI-tool guidance, and a balanced schedule." },
];

/** Copy is written per role, because each one uses this page for a different job. */
const HUDDLE_TIPS: Record<HuddlePersona, Record<string, string>> = {
  manager: {
    "huddle-role": "You are set up as a Manager. Switch experience here if you are standing in for someone else.",
    "huddle-sections": "Onboarding explains the programme, Role Path is the seven-week plan you assign, and Additional Topics is where you build extra plans.",
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
    "huddle-sections": "Onboarding explains the programme, Role Path is the seven-week sequence you run, and Additional Topics is where you assemble your own running order.",
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
    "huddle-sections": "Start with Orientation to see how the programme works. Role Path is your seven-week sequence, and Additional Topics has extra Huddles for your role.",
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
  "huddle-experience": "Choose how you take part: Manager, Facilitator, or Team Member. Everything after this is worded for that role.",
  "huddle-resources": "Every approved link in the programme, gathered in one place.",
};

const HUDDLE_TITLES: Record<string, string> = {
  "huddle-experience": "Choose your experience",
  "huddle-role": "Your experience",
  "huddle-sections": "The three sections",
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

/**
 * What is on the page right now, worded for the signed-in role. Targets that are absent
 * are dropped by the caller, so conditional controls need no special casing here.
 */
export function resolvePageSteps({ isHuddleRoute, persona, viewMode }: ResolveTourStepsInput): TourStep[] {
  if (!isHuddleRoute) return WORKFLOW_CONTENT;
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
