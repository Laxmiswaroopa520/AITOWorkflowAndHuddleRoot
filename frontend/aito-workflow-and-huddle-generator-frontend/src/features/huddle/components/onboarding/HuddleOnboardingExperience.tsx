import {
  ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2,
  Compass, Lightbulb, RefreshCw, Sparkles, Target,
  TrendingUp, Users, Wrench, ShieldCheck, Presentation, Check,
  Repeat2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

import type { HuddlePersona } from '../../types/huddlePersona.types';

interface HuddleOnboardingExperienceProps {
  persona: HuddlePersona | null;
  onSelectPersona: (persona: HuddlePersona) => void;
  onStartRolePath: () => void;
  onAdditionalTopics: () => void;
  onChangePersona: () => void;
}

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=86',
  manager: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=84',
  facilitator: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=84',
  member: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=84',
  coach: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=84',
};

const personas = [
  {
    id: 'manager' as const, icon: Target, title: 'Manager', headline: 'Lead AI adoption across your team', image: IMAGES.manager,
    body: 'Set direction, shape learning priorities, and help team members turn AI practice into stronger team habits.',
    helps: ['Select a role-based learning path', 'Customise recommended Huddles', 'Build and export a team learning plan', 'Reinforce adoption through team rhythm'],
    success: 'Your team applies AI to real workflows and brings back examples that improve how work gets done.',
    cta: 'Open Manager View', accent: '#0A6BBA',
  },
  {
    id: 'facilitator' as const, icon: Presentation, title: 'Facilitator', headline: 'Run practical Huddles with confidence', image: IMAGES.facilitator,
    body: 'Prepare, guide, capture, and follow up on Huddles that connect AI to the work team members do every day.',
    helps: ['Prepare for a Huddle', 'Guide the conversation', 'Use recommended prompts', 'Capture notes and actions', 'Export session materials'],
    success: 'Team members practise with real prompts and leave with one practical commitment they can apply.',
    cta: 'Open Facilitator View', accent: '#2A446F',
  },
  {
    id: 'team-member' as const, icon: Users, title: 'Team Member', headline: 'Build AI habits through real work', image: IMAGES.member,
    body: 'Follow a role-based path, practise AI in daily workflows, explore additional topics, and share what works.',
    helps: ['Understand the learning journey', 'Complete role-based Huddles', 'Practise AI with real workflows', 'Explore additional topics', 'Build repeatable AI habits'],
    success: 'You know when to use the right AI experiences and can apply them to everyday work with confidence.',
    cta: 'Start Learning Journey', accent: '#287C70',
  },
];

const whyItExists = [
  ['Increase AI confidence', 'Help team members use AI comfortably and responsibly in their work.', Sparkles],
  ['Build practical habits', 'Move beyond awareness into repeatable actions and applied skills.', Target],
  ['Learn across teams', 'Share successful approaches, examples, and practical lessons with peers.', Users],
  ['Sustain adoption', 'Create momentum that continues beyond a single Huddle.', TrendingUp],
];

const readiness = [
  ['Verify access to required tools', 'Step 1'],
  ['Complete AI fundamentals', 'Step 2'],
  ['Review motion expectations', 'Step 3'],
  ['Explore recommended resources', 'Step 4'],
  ['Watch the motion overview', 'Step 5'],
  ['Join your first Huddle', 'Step 6'],
];

const successSignals = [
  ['Use AI regularly', 'Integrate AI into day-to-day work.', Sparkles],
  ['Improve efficiency', 'Reduce friction across common workflows.', TrendingUp],
  ['Share what works', 'Bring practical examples back to peers.', Users],
  ['Build confidence', 'Use AI responsibly in real scenarios.', ShieldCheck],
  ['Create repeatable habits', 'Continue improving after the Huddle.', RefreshCw],
];

const rhythm = [
  ['Reflect', 'Share wins, lessons, and friction points.'],
  ['Frame', 'Connect the topic to the workflow and outcome.'],
  ['Discuss', 'Surface questions, blockers, and peer insights.'],
  ['Practise', 'Try a prompt, tool, or workflow pattern.'],
  ['Commit', 'Choose one practical action for this week.'],
  ['Bring Back', 'Return with evidence, learning, or a result.'],
];

const toolkit = [
  { title: 'Sales Agent', purpose: 'Prepare for customer engagements and opportunity planning.', when: 'Use when shaping account, opportunity, or deal work.', related: 'Customer prep · Opportunity planning', icon: BriefcaseBusiness },
  { title: 'MSXI Assist', purpose: 'Research, analyse, and gather insights for customer readiness.', when: 'Use when you need context, signals, or structured research.', related: 'Research · Customer readiness', icon: Compass },
  { title: 'Microsoft 365 Copilot', purpose: 'Create, summarise, and accelerate everyday work.', when: 'Use inside the flow of documents, meetings, mail, and collaboration.', related: 'Everyday productivity · Team rhythm', icon: Sparkles },
  { title: 'Additional Role Tools', purpose: 'Discover AI experiences recommended for your role path.', when: 'Use when a Huddle calls for a specialised workflow capability.', related: 'Role-specific Huddles', icon: Wrench },
];

const updates = [
  ['New AI tools', 'Toolkit'], ['Recommended activities', 'Recommended'], ['Recently added topics', 'New'],
  ['Motion announcements', 'Update'], ['Upcoming events', 'Calendar'], ['Continue where you left off', 'In progress'],
];

const personaOnboarding = {
  manager: {
    title: 'Manager Onboarding', subtitle: 'Set direction, guide your team, and turn AI practice into stronger team habits.',
    role: 'As a Manager, help the team understand why the Huddle motion matters, choose the right learning path, and create space for practical AI adoption inside normal team rhythms.',
    cards: [
      ['Set the direction', ['Choose the right role path', 'Connect Huddles to team priorities', 'Explain why the learning matters']],
      ['Shape the plan', ['Review recommended Huddles', 'Customise the sequence if needed', 'Add additional topics for your team']],
      ['Reinforce the habit', ['Encourage team members to bring back examples', 'Create repeatable AI behaviours', 'Keep the focus on real work']],
      ['Export and share', ['Export role and custom learning plans', 'Share the plan with facilitators and team members']],
    ],
    success: ['The team understands the AI adoption motion', 'Huddles connect to real priorities', 'Team members practise AI in actual workflows', 'Learning continues beyond a single session', 'The team can describe what changed in how work gets done'],
    primary: 'Go to Role Path',
  },
  facilitator: {
    title: 'Facilitator Onboarding', subtitle: 'Prepare, guide, and run practical Huddles that help team members apply AI to real work.',
    role: 'As a Facilitator, make each Huddle practical, focused, and collaborative. Use the app to prepare the session, guide discussion, use prompts, capture notes, and create useful follow-up materials.',
    cards: [
      ['Prepare the session', ['Select the Huddle topic', 'Review the outcome and activities', 'Use the facilitator workspace to prepare']],
      ['Guide the conversation', ['Use the Huddle flow', 'Facilitate around real work', 'Connect AI to workflow outcomes']],
      ['Practise with prompts', ['Use recommended prompts', 'Copy prompts into the relevant AI experience', 'Encourage experimentation and sharing']],
      ['Capture and follow up', ['Add facilitator notes', 'Save progress', 'Export HTML or PowerPoint materials where available']],
    ],
    success: ['Team members understand the purpose', 'Discussion connects to actual work', 'The team tries at least one useful prompt or workflow', 'Actions and follow-ups are clear', 'The Huddle creates a practical commitment'],
    primary: 'Open Role Path',
  },
  'team-member': {
    title: 'Team Member Orientation', subtitle: 'Build confidence with AI by practising on real workflows and learning with your team.',
    role: 'As a Team Member, join Huddles, practise with AI, share what works, and bring learning back into daily work. Follow your role path and explore additional topics when you are ready.',
    cards: [
      ['Understand the journey', ['Start with orientation', 'Follow the role path', 'Continue through additional topics']],
      ['Join Huddles', ['Take part in weekly discussions', 'Share wins and friction points', 'Learn from team examples']],
      ['Practise AI in real work', ['Try recommended prompts', 'Apply AI to common workflows', 'Bring back examples and outcomes']],
      ['Build lasting habits', ['Repeat what works', 'Save useful prompts', 'Use AI as part of everyday work']],
    ],
    success: ['You feel more confident using AI', 'You understand when and how to use the right AI tools', 'You can apply prompts to real work', 'You share useful examples with the team', 'AI becomes part of your normal workflow'],
    primary: 'Start Role Path',
  },
} as const;

function ThinkFeelDo() {
  const nodes = [
    { label: 'THINK', title: 'Adopt a Frontier Mindset', detail: 'Be curious, adaptive, human-centred, and outcome-oriented. See AI as a transformation lever and learn as Customer Zero.', color: '#8DC8E8', text: '#184C6A', pos: 'left-1/2 top-0 -translate-x-1/2' },
    { label: 'DO', title: 'Apply AI in Real Work', detail: 'Practise inside real workflows, use useful prompts, experiment with the team, and build reusable patterns.', color: '#0A6BBA', text: '#FFFFFF', pos: 'right-0 bottom-3' },
    { label: 'FEEL', title: 'Build Confidence', detail: 'Share wins, lessons, and friction. Repeated practice builds confidence, momentum, and clarity.', color: '#92D3C6', text: '#224E46', pos: 'left-0 bottom-3' },
  ];

  return <section className="space-y-6">
    <div className="max-w-3xl">
      <span className="inline-flex rounded-md bg-[#E2F1F9] px-2.5 py-1 text-xs font-semibold text-[#0A6BBA]">Think · Feel · Do</span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#16233A] md:text-3xl">Building AI Fluency in the Flow of Work</h2>
      <p className="mt-2 text-sm leading-6 text-[#5C6678]">AI fluency grows through a continuous cycle of mindset, practice, and confidence-building.</p>
    </div>

    <div className="rounded-[28px] border border-[#DDE7EE] bg-gradient-to-br from-[#F9FCFE] via-white to-[#EAF5F1] p-5 shadow-[0_16px_48px_rgba(31,65,98,.08)] md:p-8">
      <div className="mx-auto hidden h-[430px] max-w-[760px] md:block">
        <div className="relative h-full w-full">
          <div className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#9FC5DB]" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#D9EAF3] border-r-[#0A6BBA] border-b-[#92D3C6]">
            <span className="absolute left-1/2 top-[-7px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-[#0A6BBA] shadow-[0_0_16px_rgba(10,107,186,.75)]" aria-hidden="true" />
          </motion.div>
          <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white bg-white text-center shadow-[0_16px_40px_rgba(42,68,111,.14)]">
            <Repeat2 className="h-6 w-6 text-[#0A6BBA]" />
            <p className="mt-2 text-sm font-semibold text-[#16233A]">Continuous</p>
            <p className="text-xs text-[#6B7789]">learning loop</p>
          </div>
          {nodes.map((node) => <motion.article whileHover={{ scale: 1.04 }} key={node.label} className={`group absolute w-[250px] rounded-[24px] border border-white/70 p-5 shadow-[0_14px_36px_rgba(22,35,58,.12)] ${node.pos}`} style={{ background: node.color, color: node.text }}>
            <p className="text-[11px] font-bold tracking-[.2em] opacity-75">{node.label}</p>
            <h3 className="mt-2 text-lg font-semibold">{node.title}</h3>
            <p className="mt-0 max-h-0 overflow-hidden text-xs leading-5 opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-32 group-hover:opacity-90">{node.detail}</p>
          </motion.article>)}
          <div className="absolute left-[57%] top-[17%] text-xl text-[#0A6BBA]">↘</div>
          <div className="absolute bottom-[20%] right-[31%] text-xl text-[#287C70]">↙</div>
          <div className="absolute bottom-[20%] left-[30%] text-xl text-[#5B93B1]">↖</div>
        </div>
      </div>
      <div className="grid gap-3 md:hidden">{nodes.map((node, i) => <div key={node.label} className="rounded-2xl p-5" style={{background:node.color,color:node.text}}><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.18em]">{node.label}</span><span className="text-lg">{i < 2 ? '↓' : '↻'}</span></div><h3 className="mt-2 font-semibold">{node.title}</h3><p className="mt-2 text-sm leading-6 opacity-90">{node.detail}</p></div>)}</div>
      <div className="mt-5 rounded-2xl border border-[#BFDDE9] bg-white/85 px-5 py-4 text-sm font-medium text-[#2A446F]">Think influences action. Action builds confidence. Confidence changes how people feel. Feeling confident changes how teams think and work next.</div>
    </div>
  </section>;
}

function PersonaOnboarding({ persona, onStartRolePath, onAdditionalTopics, onChangePersona }: Pick<HuddleOnboardingExperienceProps, 'persona'|'onStartRolePath'|'onAdditionalTopics'|'onChangePersona'>) {
  const p = persona ? personaOnboarding[persona] : null;
  if (!p) return null;
  return <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-9 pb-10">
    <ThinkFeelDo />
    <section className="overflow-hidden rounded-[26px] border border-[#DCE6ED] bg-white shadow-[0_14px_40px_rgba(22,35,58,.06)]">
      <div className="grid lg:grid-cols-[1fr_.55fr]">
        <div className="p-7 md:p-9"><div className="flex flex-wrap items-center gap-3"><span className="inline-flex rounded-full bg-[#E2F1F9] px-3 py-1.5 text-xs font-semibold text-[#0A6BBA]">{p.title}</span>{onChangePersona && <Button variant="ghost" size="sm" onClick={onChangePersona}>Change experience</Button>}</div><h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#16233A]">{p.subtitle}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-[#5F6D80]">{p.role}</p></div>
        <div className="min-h-[230px] bg-[#EDF5F8]"><img src={persona === 'manager' ? IMAGES.manager : persona === 'facilitator' ? IMAGES.facilitator : IMAGES.member} alt="Team collaborating during practical work" className="h-full w-full object-cover" /></div>
      </div>
    </section>
    <section><p className="text-xs font-bold uppercase tracking-[.14em] text-[#0A6BBA]">How this app helps</p><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{p.cards.map(([title,items],index)=><article key={title} className="rounded-[20px] border border-[#E0E7ED] bg-white p-5 shadow-[0_8px_24px_rgba(22,35,58,.05)]"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E2F1F9] text-sm font-bold text-[#0A6BBA]">{index+1}</div><h3 className="mt-4 text-lg font-semibold text-[#16233A]">{title}</h3><ul className="mt-3 space-y-2">{items.map(i=><li key={i} className="flex gap-2 text-sm text-[#5C697D]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#287C70]"/>{i}</li>)}</ul></article>)}</div></section>
    <section className="grid gap-5 rounded-[24px] border border-[#C8DED8] bg-[#E3F1ED] p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#287C70]">Success looks like</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{p.success.map(s=><div key={s} className="flex gap-2 text-sm text-[#365A53]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>{s}</div>)}</div></div><div className="flex flex-wrap gap-2"><Button className="bg-[#0A6BBA] hover:bg-[#115EA3]" onClick={onStartRolePath}>{p.primary}<ArrowRight className="ml-2 h-4 w-4"/></Button><Button variant="outline" className="bg-white" onClick={onAdditionalTopics}>Explore Additional Topics</Button></div></section>
  </motion.section>;
}

export function HuddleOnboardingExperience({ persona, onSelectPersona, onStartRolePath, onAdditionalTopics, onChangePersona }: HuddleOnboardingExperienceProps) {
  if (persona) return <PersonaOnboarding persona={persona} onStartRolePath={onStartRolePath} onAdditionalTopics={onAdditionalTopics} onChangePersona={onChangePersona} />;

  return <motion.section initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-12 pb-12">
    {/* Primary landing hero: explain the value first, then offer immediate ways to start. */}
    <section className="relative overflow-hidden rounded-[28px] border border-[#C9DDE9] bg-white shadow-[0_18px_54px_rgba(31,65,98,.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(146,211,198,.24),transparent_34%),radial-gradient(circle_at_8%_88%,rgba(141,200,232,.20),transparent_30%)]" />
      <div className="relative grid min-h-[390px] lg:grid-cols-[1.08fr_.92fr]">
        <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
          <span className="inline-flex w-fit items-center rounded-full border border-[#CBE3F1] bg-[#E2F1F9] px-3 py-1.5 text-xs font-semibold text-[#0A6BBA]">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />Frontier Accelerator
          </span>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-.035em] text-[#16233A] md:text-5xl lg:text-[52px] lg:leading-[1.06]">
            Build AI fluency in the Flow of Work
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5C697D] md:text-lg md:leading-8">
            Frontier Accelerator helps teams apply AI to real work through guided Huddles, shared practice, and repeatable workflow habits.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" className="bg-[#0A6BBA] px-5 hover:bg-[#115EA3]" onClick={()=>document.getElementById('choose-experience')?.scrollIntoView({behavior:'smooth'})}>
              Choose your experience<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-[#BFD6E5] bg-white/90 text-[#2A446F] hover:bg-[#F4F9FC]" onClick={()=>document.getElementById('how-huddles-work')?.scrollIntoView({behavior:'smooth'})}>
              How Huddles work
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {['30 minute Huddles','Role-based paths','Real workflow practice','Team learning rhythm'].map(item=><span key={item} className="rounded-full border border-[#D8E5ED] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#526176] shadow-sm">{item}</span>)}
          </div>
        </div>

        {/* Immediate quick-start panel keeps a meaningful action above the fold. */}
        <div className="flex items-center border-t border-[#E1E9EF] bg-gradient-to-br from-[#F7FBFD]/90 to-[#EAF5F1]/90 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-9">
          <div data-tour="huddle-experience" className="w-full rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_16px_40px_rgba(42,68,111,.10)] backdrop-blur md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#0A6BBA]">Start your path</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#16233A]">What brings you here today?</h2>
                <p className="mt-2 text-sm leading-6 text-[#647185]">Jump directly into the experience that matches what you need to do.</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E2F1F9] text-[#0A6BBA] sm:flex"><Users className="h-5 w-5" /></div>
            </div>

            <div className="mt-5 grid gap-3">
              {personas.map(p=><button key={p.id} type="button" onClick={()=>onSelectPersona(p.id)} className="group flex w-full items-center gap-4 rounded-[18px] border border-[#DEE6EC] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9CCCE6] hover:shadow-[0_10px_24px_rgba(22,35,58,.08)] focus:outline-none focus:ring-2 focus:ring-[#0A6BBA]/30">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F7FB]" style={{color:p.accent}}><p.icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="font-semibold text-[#16233A]">{p.title}</p><span className="text-xs text-[#8793A2]">Experience</span></div>
                  <p className="mt-0.5 truncate text-sm text-[#5F6D80]">{p.headline}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#0A6BBA] transition-transform group-hover:translate-x-1" />
              </button>)}
            </div>

            <p className="mt-4 text-xs leading-5 text-[#7A8798]">You can switch experiences later without losing access to the rest of the Huddle library.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Rich role cards remain available for users who want more context before choosing. */}
    <section id="choose-experience" className="scroll-mt-24 space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">Choose Your Experience</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#16233A] md:text-4xl">Choose how you want to use Huddles</h2>
        <p className="mt-2 text-sm leading-6 text-[#647185]">Select the experience that best matches your role in the Huddle motion. You can switch later.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {personas.map(p=><motion.article whileHover={{y:-4}} key={p.id} className="group flex overflow-hidden rounded-[24px] border border-[#DEE5EC] bg-white shadow-[0_12px_34px_rgba(22,35,58,.06)] lg:min-h-[500px] lg:flex-col">
          <div className="relative h-44 overflow-hidden">
            <img src={p.image} alt={`${p.title} experience focused on team collaboration`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#16233A]/38 via-transparent to-transparent"/>
            <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 shadow"><p.icon className="h-5 w-5" style={{color:p.accent}}/></div>
          </div>
          <div className="flex flex-1 flex-col p-5 md:p-6">
            <h3 className="text-xl font-semibold text-[#16233A]">{p.title}</h3>
            <p className="mt-1 text-base font-medium text-[#2A446F]">{p.headline}</p>
            <p className="mt-3 text-sm leading-6 text-[#667387]">{p.body}</p>
            <div className="mt-5 space-y-2">{p.helps.slice(0,3).map(x=><div key={x} className="flex gap-2 text-sm text-[#485467]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#287C70]"/>{x}</div>)}</div>
            <div className="mt-auto pt-6">
              <Button className="w-full bg-[#0A6BBA] hover:bg-[#115EA3]" onClick={()=>onSelectPersona(p.id)}>{p.cta}<ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </div>
        </motion.article>)}
      </div>
    </section>

    <div id="how-huddles-work" className="scroll-mt-24"><ThinkFeelDo /></div>

    <section className="overflow-hidden rounded-[28px] border border-[#DCE6ED] bg-gradient-to-br from-[#F7FBFD] via-white to-[#EDF7F2] shadow-[0_14px_42px_rgba(22,35,58,.06)]"><div className="grid lg:grid-cols-[1.05fr_.95fr]"><div className="p-7 md:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">What is Frontier Accelerator?</p><h2 className="mt-3 text-3xl font-semibold text-[#16233A]">A practical path from AI awareness to adoption</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[#637085]">Frontier Accelerator helps teams adopt AI through structured conversations, guided practice, and real-world application.</p><p className="mt-3 max-w-2xl text-base leading-8 text-[#637085]">Rather than learning tools in isolation, team members learn how AI supports the workflows they already use every day.</p><div className="mt-7 rounded-2xl border border-[#C5DFF0] bg-white p-5 shadow-sm"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A6BBA] text-white"><Lightbulb className="h-5 w-5"/></div><div><p className="font-semibold text-[#2A446F]">The motion principle</p><p className="mt-2 text-sm leading-6 text-[#657286]">Start with the job to be done, then apply the right AI experience to improve the workflow.</p></div></div></div></div><div className="border-t border-[#E2E9EE] p-7 md:p-10 lg:border-l lg:border-t-0"><h3 className="text-xl font-semibold text-[#16233A]">Why it exists</h3><div className="mt-6 grid gap-4 sm:grid-cols-2">{whyItExists.map(([title,body,Icon]: any,i)=><article key={title} className="rounded-[20px] border border-[#DDE6EC] bg-white/75 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#E2F1F9] p-2.5"><Icon className="h-5 w-5 text-[#0A6BBA]"/></div><span className="text-xs font-bold text-[#8190A1]">0{i+1}</span></div><h4 className="mt-5 font-semibold text-[#16233A]">{title}</h4><p className="mt-2 text-sm leading-6 text-[#637085]">{body}</p></article>)}</div></div></div></section>

    <section className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">Learning Journey</p><h2 className="mt-2 text-3xl font-semibold text-[#16233A]">One motion. Three connected steps.</h2><p className="mt-2 text-sm text-[#647185]">Move from understanding the motion to role-based practice, then keep expanding through self-directed topics.</p></div><div className="relative rounded-[28px] border border-[#DDE6EC] bg-white p-6 md:p-8"><div className="absolute bottom-16 left-[12%] right-[12%] top-16 hidden rounded-full border-2 border-dashed border-[#C7DDE8] lg:block"/><div className="relative grid gap-4 lg:grid-cols-3">{[
      ['01','Onboarding','Understand the motion, Think Feel Do, and how your role uses Huddles.','15 min','Ready to enter your role path.',Compass,'#E2F1F9'],
      ['02','Role Path','Follow a recommended sequence of Huddles aligned to your role.','7 Huddles','Build repeatable workflow habits.',Target,'#E3F1ED'],
      ['03','Additional Topics','Explore more workflows and build a custom plan around what matters next.','Flexible','Extend fluency beyond the core path.',BookOpen,'#F0E9E3'],
    ].map(([n,title,purpose,effort,outcome,Icon,surface]:any,i)=><motion.article whileHover={{y:-4}} key={title} className="relative rounded-[22px] border border-[#DDE5EB] bg-white p-5 shadow-[0_10px_28px_rgba(22,35,58,.06)]"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{background:surface}}><Icon className="h-5 w-5 text-[#0A6BBA]"/></div><span className="text-xs font-bold tracking-[.14em] text-[#8390A0]">STEP {n}</span></div><h3 className="mt-5 text-xl font-semibold text-[#16233A]">{title}</h3><div className="mt-4 space-y-3"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8793A2]">Purpose</p><p className="mt-1 text-sm leading-6 text-[#5F6D80]">{purpose}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#F7FAFC] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8793A2]">Effort</p><p className="mt-1 text-sm font-semibold text-[#2A446F]">{effort}</p></div><div className="rounded-xl bg-[#F7FAFC] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8793A2]">Outcome</p><p className="mt-1 text-xs font-medium leading-5 text-[#2A446F]">{outcome}</p></div></div></div>{i<2 && <div className="absolute -right-3 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-[#0A6BBA] shadow lg:flex">→</div>}</motion.article>)}</div></div></section>

    <section className="grid gap-5 xl:grid-cols-2"><div className="overflow-hidden rounded-[26px] border border-[#DCE5EC] bg-white"><div className="bg-gradient-to-r from-[#EEF7FC] to-white p-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">Before you begin</p><h2 className="mt-2 text-2xl font-semibold text-[#16233A]">Readiness checklist</h2><p className="mt-2 text-sm text-[#647185]">Complete these steps before your first role-based Huddle.</p></div><div className="grid gap-3 p-6 sm:grid-cols-2">{readiness.map(([title,step])=><div key={title} className="flex gap-3 rounded-2xl border border-[#E1E7ED] p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7F6EA]"><Check className="h-4 w-4 text-[#24863A]"/></div><div><p className="text-sm font-semibold text-[#24344C]">{title}</p><p className="mt-1 text-xs text-[#8793A2]">{step}</p></div></div>)}</div></div><div className="overflow-hidden rounded-[26px] border border-[#DCE5EC] bg-white"><div className="bg-gradient-to-r from-[#F4EEFC] to-[#EEF8F2] p-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#5E45A8]">Success looks like</p><h2 className="mt-2 text-2xl font-semibold text-[#16233A]">Practical, repeatable adoption</h2><p className="mt-2 text-sm text-[#647185]">The motion is successful when team members change how work gets done.</p></div><div className="grid gap-3 p-6 sm:grid-cols-2">{successSignals.map(([title,body,Icon]:any,i)=><div key={title} className={`${i===4?'sm:col-span-2':''} flex gap-3 rounded-2xl border border-[#E1E7ED] p-4`}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0E9FA]"><Icon className="h-4 w-4 text-[#6743B5]"/></div><div><p className="text-sm font-semibold text-[#24344C]">{title}</p><p className="mt-1 text-xs leading-5 text-[#647185]">{body}</p></div></div>)}</div></div></section>

    <section className="rounded-[28px] border border-[#C9DDE9] bg-gradient-to-br from-[#193B63] to-[#2A446F] p-7 text-white md:p-9"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#BFE2F5]">Weekly Huddle Rhythm</p><h2 className="mt-2 text-3xl font-semibold">A continuous loop from reflection to action</h2><p className="mt-2 text-sm leading-6 text-white/70">Each Huddle picks up where the previous one ended. Teams reflect, practise, commit, and bring real examples back into the next conversation.</p></div><div className="mx-auto mt-8 hidden h-[500px] max-w-[780px] lg:block"><div className="relative h-full"><motion.div animate={{rotate:360}} transition={{duration:34,repeat:Infinity,ease:'linear'}} className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/35"/><div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/20 bg-white/10 text-center backdrop-blur"><Repeat2 className="h-6 w-6 text-[#92D3C6]"/><p className="mt-2 text-sm font-semibold">Team rhythm</p><p className="mt-1 px-3 text-xs leading-5 text-white/65">Learn, apply, bring back, repeat.</p></div>{rhythm.map(([title,body],i)=>{const positions=['left-1/2 top-0 -translate-x-1/2','right-[2%] top-[22%]','right-[8%] bottom-[10%]','left-1/2 bottom-0 -translate-x-1/2','left-[8%] bottom-[10%]','left-[2%] top-[22%]'];return <motion.div whileHover={{scale:1.04}} key={title} className={`absolute w-[205px] rounded-[20px] border border-white/15 bg-white/[.08] p-4 backdrop-blur ${positions[i]}`}><span className="text-[10px] font-bold text-[#92D3C6]">0{i+1}</span><p className="mt-2 font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-white/65">{body}</p></motion.div>})}</div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:hidden">{rhythm.map(([t,b],i)=><div key={t} className="rounded-2xl border border-white/12 bg-white/[.07] p-4"><span className="text-xs font-bold text-[#92D3C6]">0{i+1}</span><p className="mt-3 font-semibold">{t}</p><p className="mt-2 text-xs leading-5 text-white/70">{b}</p></div>)}</div></section>

    <section><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">AI Toolkit</p><h2 className="mt-2 text-3xl font-semibold text-[#16233A]">AI experiences that support common workflows</h2><p className="mt-2 text-sm leading-6 text-[#647185]">Choose the experience based on the job to be done, the workflow, and the outcome you need.</p></div><div className="mt-6 grid gap-4 md:grid-cols-2">{toolkit.map(tool=><motion.article whileHover={{y:-3}} key={tool.title} className="rounded-[22px] border border-[#DEE6EC] bg-white p-5 shadow-[0_8px_24px_rgba(22,35,58,.05)]"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#E2F1F9] p-3"><tool.icon className="h-5 w-5 text-[#0A6BBA]"/></div><div><h3 className="font-semibold text-[#16233A]">{tool.title}</h3><p className="text-xs text-[#7A8798]">Workflow support</p></div></div><p className="mt-4 text-sm leading-6 text-[#5F6D80]">{tool.purpose}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-[#F7FAFC] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8793A2]">When to use</p><p className="mt-1 text-xs leading-5 text-[#4F5E72]">{tool.when}</p></div><div className="rounded-xl bg-[#F7FAFC] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8793A2]">Related Huddles</p><p className="mt-1 text-xs leading-5 text-[#4F5E72]">{tool.related}</p></div></div></motion.article>)}</div></section>

    <section className="overflow-hidden rounded-[28px] border border-[#CFE0DA] bg-[#EAF5F1]"><div className="grid lg:grid-cols-[.85fr_1.15fr]"><div className="min-h-[250px]"><img src={IMAGES.coach} alt="Colleagues coaching and supporting one another in a work discussion" className="h-full w-full object-cover"/></div><div className="flex flex-col justify-center p-7 md:p-9"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#287C70]">Support the team rhythm</p><h2 className="mt-2 text-2xl font-semibold text-[#25443E]">Coaching is part of practical adoption</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#4C6863]">Strong Huddles create space for questions, peer coaching, shared examples, and practical guidance. The goal is not help-desk support. It is helping teams learn from real work together.</p></div></div></section>

    <section><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0A6BBA]">Latest updates</p><h2 className="mt-2 text-3xl font-semibold text-[#16233A]">Stay current as the motion evolves</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{updates.map(([t,m])=><div key={t} className="flex items-center gap-4 rounded-2xl border border-[#E1E7ED] bg-white p-4"><div className="rounded-xl bg-[#F0F5F8] p-2"><CalendarDays className="h-4 w-4 text-[#2A446F]"/></div><div><p className="font-semibold text-[#16233A]">{t}</p><p className="text-xs text-[#7B8798]">{m}</p></div></div>)}</div></section>
  </motion.section>;
}
