import type {
  ElementType,
} from "react";

import {
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  Lightbulb,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export interface SegmentStyle {
  icon: ElementType;
  iconBg: string;
  iconText: string;
  cardBorder: string;
  cardBg: string;
  cardShadow: string;
  pillActive: string;
  pillBorder: string;
  badgeBg: string;
}

export const SEGMENT_STYLES:
  Record<string, SegmentStyle> = {
    Enterprise: {
      icon: Target,

      iconBg:
        "bg-[oklch(0.55_0.22_250/0.14)]",

      iconText:
        "text-[oklch(0.55_0.22_250)]",

      cardBorder:
        "border-[oklch(0.55_0.22_250)]",

      cardBg:
        "bg-[oklch(0.55_0.22_250/0.06)]",

      cardShadow:
        "shadow-[0_8px_24px_-6px_oklch(0.55_0.22_250/0.3)]",

      pillActive:
        "bg-[oklch(0.55_0.22_250)] text-white",

      pillBorder:
        "border-[oklch(0.55_0.22_250)]",

      badgeBg:
        "bg-[oklch(0.55_0.22_250)]",
    },

    "CE&S": {
      icon: Shield,

      iconBg:
        "bg-[oklch(0.55_0.22_145/0.14)]",

      iconText:
        "text-[oklch(0.55_0.22_145)]",

      cardBorder:
        "border-[oklch(0.55_0.22_145)]",

      cardBg:
        "bg-[oklch(0.55_0.22_145/0.06)]",

      cardShadow:
        "shadow-[0_8px_24px_-6px_oklch(0.55_0.22_145/0.3)]",

      pillActive:
        "bg-[oklch(0.55_0.22_145)] text-white",

      pillBorder:
        "border-[oklch(0.55_0.22_145)]",

      badgeBg:
        "bg-[oklch(0.55_0.22_145)]",
    },

    "SME&C": {
      icon: Zap,

      iconBg:
        "bg-[oklch(0.68_0.20_50/0.16)]",

      iconText:
        "text-[oklch(0.60_0.20_50)]",

      cardBorder:
        "border-[oklch(0.68_0.20_50)]",

      cardBg:
        "bg-[oklch(0.68_0.20_50/0.07)]",

      cardShadow:
        "shadow-[0_8px_24px_-6px_oklch(0.68_0.20_50/0.35)]",

      pillActive:
        "bg-[oklch(0.68_0.20_50)] text-white",

      pillBorder:
        "border-[oklch(0.68_0.20_50)]",

      badgeBg:
        "bg-[oklch(0.68_0.20_50)]",
    },

    Partner: {
      icon: Handshake,

      iconBg:
        "bg-[oklch(0.55_0.22_290/0.14)]",

      iconText:
        "text-[oklch(0.55_0.22_290)]",

      cardBorder:
        "border-[oklch(0.55_0.22_290)]",

      cardBg:
        "bg-[oklch(0.55_0.22_290/0.06)]",

      cardShadow:
        "shadow-[0_8px_24px_-6px_oklch(0.55_0.22_290/0.3)]",

      pillActive:
        "bg-[oklch(0.55_0.22_290)] text-white",

      pillBorder:
        "border-[oklch(0.55_0.22_290)]",

      badgeBg:
        "bg-[oklch(0.55_0.22_290)]",
    },

    Manager: {
      icon: Users,

      iconBg:
        "bg-[oklch(0.58_0.17_210/0.14)]",

      iconText:
        "text-[oklch(0.48_0.17_210)]",

      cardBorder:
        "border-[oklch(0.58_0.17_210)]",

      cardBg:
        "bg-[oklch(0.58_0.17_210/0.06)]",

      cardShadow:
        "shadow-[0_8px_24px_-6px_oklch(0.58_0.17_210/0.3)]",

      pillActive:
        "bg-[oklch(0.58_0.17_210)] text-white",

      pillBorder:
        "border-[oklch(0.58_0.17_210)]",

      badgeBg:
        "bg-[oklch(0.58_0.17_210)]",
    },
  };

export const BUCKET_ICONS:
  Record<string, ElementType> = {
    "Planning & Prioritization":
      Target,

    "Pipeline & Forecasting":
      TrendingUp,

    "Deal Execution & Commercial":
      BriefcaseBusiness,

    "Customer Engagement & Executive Alignment":
      Users,

    "Technical Validation & Solution Delivery Prep":
      Shield,

    "Adoption, Consumption & Value Realization":
      Zap,

    "Partner & Ecosystem":
      Handshake,

    "Operations, Governance & Risk":
      Settings,

    "Enablement & Skill Development":
      GraduationCap,
  };

// Real launch links for the AI tools that also exist in the Huddle module's agent
// reference data (database/fresh-install-v10.2.1/25_Huddle_Agents.sql), keyed by the
// AiTool.name used on the Workflow side. Workflow's own AiTool record has no launch URL
// column yet -- until the backend exposes one directly on ActivityAiToolResponse, this is
// a stopgap so the "Launch" button only ever appears for a tool with a real destination,
// never a dead link. Tools without a confident name match here simply get no launch button.
export const AI_TOOL_LAUNCH_LINKS: Record<string, string> = {
  "Sales Agent": "https://aka.ms/SalesM365",
  "ECIF Agent": "https://aka.ms/SalesM365",
  "M365 Copilot": "https://m365.cloud.microsoft/chat",
  "Cowork": "https://m365.cloud.microsoft/",
  "Scout": "https://aka.ms/m",
  "Researcher": "https://m365.cloud.microsoft/chat",
  "Analyst": "https://m365.cloud.microsoft/chat",
  "MSXI Copilot": "https://msxi.microsoft.com/",
};

/**
 * Activity.suggestedOutputs is stored as a JSON-encoded array of short strings
 * (see e.g. the "MSX report filtering guidance" row in database/004-upsert-activities.sql),
 * not free-form prose. Parses it back into that list; falls back to treating the raw
 * string as a single line if it isn't valid JSON, and to an empty list if there's nothing.
 */
export function parseSuggestedOutputs(suggestedOutputs: string | null): string[] {
  if (!suggestedOutputs) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(suggestedOutputs);

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // not JSON -- fall through to treating it as plain text below
  }

  return [suggestedOutputs];
}

export const CATEGORY_STYLES:
  Record<
    string,
    {
      background: string;
      text: string;
      border: string;
    }
  > = {
    Planning: {
      background:
        "bg-[oklch(0.65_0.20_50/0.1)]",

      text:
        "text-[oklch(0.55_0.20_50)]",

      border:
        "border-[oklch(0.65_0.20_50/0.3)]",
    },

    Insight: {
      background: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/30",
    },

    Execution: {
      background:
        "bg-[oklch(0.55_0.22_145/0.1)]",

      text:
        "text-[oklch(0.45_0.22_145)]",

      border:
        "border-[oklch(0.55_0.22_145/0.3)]",
    },

    Engagement: {
      background:
        "bg-[oklch(0.55_0.15_280/0.1)]",

      text:
        "text-[oklch(0.45_0.15_280)]",

      border:
        "border-[oklch(0.55_0.15_280/0.3)]",
    },

    Admin: {
      background: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
    },
  };

// One icon per activity category, paired with CATEGORY_STYLES above -- used on the
// category pill in the Day view so the badge reads at a glance instead of by color alone.
export const CATEGORY_ICONS: Record<string, ElementType> = {
  Planning: Target,
  Insight: TrendingUp,
  Execution: Lightbulb,
  Engagement: Users,
  Admin: Settings,
};