import { ArrowRight, Sparkles, Users, Workflow } from "lucide-react";
import { Link } from "react-router";
import aitoLogo from "@/assets/AITO New Logo.png";

const experiences = [
  {
    title: "Build My Workflow",
    eyebrow: "Individual productivity",
    description: "Turn your role and priorities into an AI-assisted workflow with relevant activities, tools, and a balanced plan for your day.",
    href: "/workflow",
    icon: Workflow,
    bullets: ["Choose your role", "Select high-impact activities", "Build and save your workflow"],
    accent: "from-[#0A6BBA] to-[#2A446F]",
  },
  {
    title: "Run a Huddle",
    eyebrow: "Team learning",
    description: "Build AI fluency through guided team learning, role-based Huddle paths, practical prompts, and repeatable adoption habits.",
    href: "/huddle",
    icon: Users,
    bullets: ["Onboard your team", "Follow a role path", "Explore additional topics"],
    accent: "from-[#087C72] to-[#0A6BBA]",
  },
];

export function ModeSelectorPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F8FC] px-4 py-8 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={aitoLogo} alt="AITO" className="h-16 w-16 object-contain" />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#C7E0F4] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#0A6BBA]">
            <Sparkles className="h-3.5 w-3.5" /> AI Transformation Office
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#1E3252] md:text-5xl">How would you like to work today?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#5B6E82] md:text-lg">Choose an experience based on whether you are improving your own workflow or helping a team build AI fluency together.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {experiences.map((experience) => {
            const Icon = experience.icon;
            return (
              <Link key={experience.href} to={experience.href} className="group overflow-hidden rounded-[28px] border border-[#D7E4EC] bg-white shadow-[0_14px_40px_rgba(42,68,111,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_54px_rgba(42,68,111,0.14)]">
                <div className={`h-2 bg-gradient-to-r ${experience.accent}`} />
                <div className="p-6 md:p-8">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${experience.accent} text-white shadow-sm`}><Icon className="h-6 w-6" /></div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#0A6BBA]">{experience.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1E3252] md:text-3xl">{experience.title}</h2>
                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#5B6E82] md:text-base">{experience.description}</p>
                  <div className="mt-6 grid gap-2">
                    {experience.bullets.map((bullet) => <div key={bullet} className="flex items-center gap-2 text-sm font-medium text-[#31465A]"><span className="h-1.5 w-1.5 rounded-full bg-[#0A6BBA]" />{bullet}</div>)}
                  </div>
                  <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0A6BBA]">Open experience <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
