import type {
  ElementType,
} from "react";

import {
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
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