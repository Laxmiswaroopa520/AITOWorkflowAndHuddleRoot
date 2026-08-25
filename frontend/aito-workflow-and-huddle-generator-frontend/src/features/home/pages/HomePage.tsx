import {
  ArrowRight,
  Calendar,
  Lightbulb,
  MessageSquare,
  Presentation,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

import aitoLogo from "@/assets/AITO New Logo.png";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
} as const;

/** Presents the authenticated application-mode selector. */
export function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/[0.08] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-green-600/[0.06] blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-5xl"
      >
        <motion.header variants={itemVariants} className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm">
              <img src={aitoLogo} alt="AITO" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            AITO Workflow &amp; Huddle Generator
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose how you want to work with AI today
          </p>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-2">
          <ModeCard
            title="Build My Workflow"
            description="Plan your day, week, or quarter with AI-guided activities tailored to your role."
            audience="For Individual Contributors"
            icon={Workflow}
            accent="blue"
            features={[
              { icon: Target, label: "Role-specific activity recommendations" },
              { icon: Calendar, label: "Day/Week/Month/Quarter timeline views" },
              { icon: Zap, label: "AI tools mapped to each activity" },
            ]}
            onClick={() => navigate("/workflow")}
          />

          <ModeCard
            title="Run a Huddle"
            description="Generate team session content with talking points, demos, and coaching materials."
            audience="For Managers & Facilitators"
            icon={Users}
            accent="green"
            features={[
              { icon: Presentation, label: "Auto-generated PowerPoint decks" },
              { icon: MessageSquare, label: "Key talking points & demo prompts" },
              { icon: Lightbulb, label: "Coaching questions for your team" },
            ]}
            onClick={() => navigate("/huddle")}
          />
        </div>

        <motion.p variants={itemVariants} className="mt-10 text-center text-sm text-muted-foreground">
          You can switch modes anytime from the top navigation.
        </motion.p>
      </motion.div>
    </main>
  );
}

interface ModeCardProps {
  title: string;
  description: string;
  audience: string;
  icon: typeof Workflow;
  accent: "blue" | "green";
  features: Array<{ icon: typeof Workflow; label: string }>;
  onClick: () => void;
}

function ModeCard({
  title,
  description,
  audience,
  icon: Icon,
  accent,
  features,
  onClick,
}: ModeCardProps) {
  const green = accent === "green";

  return (
    <motion.div variants={itemVariants} className="h-full">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group h-full w-full cursor-pointer rounded-3xl border-2 border-transparent bg-card p-8 text-left shadow-sm transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          green
            ? "hover:border-green-600/50 hover:shadow-[0_0_40px_rgba(16,124,16,0.15)] focus-visible:ring-green-600"
            : "hover:border-primary/50 hover:shadow-[0_0_40px_rgba(0,120,212,0.15)] focus-visible:ring-primary",
        )}
      >
        <div className="mb-6 flex items-start justify-between">
          <span className={cn("rounded-2xl p-4 transition-colors", green ? "bg-green-600/10 group-hover:bg-green-600/20" : "bg-primary/10 group-hover:bg-primary/20")}>
            <Icon className={cn("h-8 w-8", green ? "text-green-600" : "text-primary")} />
          </span>
          <ArrowRight className={cn("h-6 w-6 text-muted-foreground transition-all group-hover:translate-x-1", green ? "group-hover:text-green-600" : "group-hover:text-primary")} />
        </div>

        <h2 className="mb-3 text-2xl font-bold text-card-foreground">{title}</h2>
        <p className="mb-6 text-muted-foreground">{description}</p>

        <div className="space-y-3">
          {features.map(feature => {
            const FeatureIcon = feature.icon;
            return (
              <div key={feature.label} className="flex items-center gap-3 text-sm">
                <FeatureIcon className={cn("h-4 w-4", green ? "text-green-600" : "text-primary")} />
                <span className="text-card-foreground">{feature.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <span className={cn("text-xs font-medium uppercase tracking-wider", green ? "text-green-600" : "text-primary")}>
            {audience}
          </span>
        </div>
      </button>
    </motion.div>
  );
}
