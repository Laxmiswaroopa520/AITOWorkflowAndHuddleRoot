
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  Mail,
  MessageSquareText,
  List,
  MoreHorizontal,
  RotateCcw,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  emptyLaunchConfiguration as DEFAULT_LAUNCH_CONFIG,
  launchMilestones as FRONTIER_LAUNCH_MILESTONES,
  formatLaunchDate,
  launchMilestoneDate as milestoneDate,
  personalizeLaunchTemplate as personalizeTemplate,
} from '../data/launchPlannerData';
import type {
  LaunchConfiguration,
  LaunchMilestoneDefinition,
  LaunchTaskState,
  LaunchTaskStatus,
} from '../types/launchPlanner.types';
import { exportLaunchPackage as downloadLaunchPackage } from '../exports/launch-package/exportLaunchPackage';
import { useMyHuddleLaunchPlan, useResetHuddleLaunchPlan, useSaveHuddleLaunchPlan } from '../hooks';
import { cn } from '@/lib/utils';

const defaultTaskState = () => Object.fromEntries(
  FRONTIER_LAUNCH_MILESTONES.map((milestone) => [
    milestone.id,
    { status: 'not-started', checklist: milestone.checklist.map(() => false) },
  ]),
) as Record<string, LaunchTaskState>;

const statusMeta: Record<LaunchTaskStatus, { label: string; className: string }> = {
  'not-started': { label: 'Not started', className: 'border-[#D8C3B2] bg-[#F0E9E3] text-[#443429]' },
  'in-progress': { label: 'In progress', className: 'border-[#8DC8E8] bg-[#E2F1F9] text-[#1E3252]' },
  complete: { label: 'Complete', className: 'border-[#92D3C6] bg-[#E3F1ED] text-[#184448]' },
};

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
}

function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function dueLabel(date: Date | null, status: LaunchTaskStatus) {
  if (!date) return 'Date not set';
  if (status === 'complete') return 'Completed';
  const difference = daysBetween(date, startOfToday());
  if (difference === 0) return 'Due today';
  if (difference === 1) return 'Due tomorrow';
  if (difference > 1 && difference <= 7) return `Due in ${difference} days`;
  if (difference < 0) return `${Math.abs(difference)} day${Math.abs(difference) === 1 ? '' : 's'} overdue`;
  return formatLaunchDate(date);
}


const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

function buildCalendarMonths(configuration: LaunchConfiguration) {
  const dated = FRONTIER_LAUNCH_MILESTONES
    .map((milestone) => ({ milestone, date: milestoneDate(configuration, milestone) }))
    .filter((item): item is { milestone: LaunchMilestoneDefinition; date: Date } => Boolean(item.date));

  if (!dated.length) return [];
  const first = new Date(Math.min(...dated.map((item) => item.date.getTime())));
  const last = new Date(Math.max(...dated.map((item) => item.date.getTime())));
  const months: Array<{ year: number; month: number }> = [];
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(last.getFullYear(), last.getMonth(), 1);

  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function outlookDraftUrl(subject: string, body: string) {
  const params = new URLSearchParams({ subject, body });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

export function LaunchPlannerPage() {
  const navigate = useNavigate();
  const launchPlanQuery = useMyHuddleLaunchPlan();
  const saveLaunchPlan = useSaveHuddleLaunchPlan();
  const resetLaunchPlan = useResetHuddleLaunchPlan();
  const [configurationDraft, setConfigurationDraft] = useState<LaunchConfiguration | null>(null);
  const [taskStateDraft, setTaskStateDraft] = useState<Record<string, LaunchTaskState> | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<boolean | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<LaunchMilestoneDefinition | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [planView, setPlanView] = useState<'timeline' | 'calendar'>('timeline');
  const [activeCalendarMonthIndex, setActiveCalendarMonthIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const persistedConfiguration: LaunchConfiguration | null = launchPlanQuery.data
    ? {
        teamName: launchPlanQuery.data.teamName,
        cohortName: launchPlanQuery.data.cohortName,
        startDate: launchPlanQuery.data.startDate,
        endDate: launchPlanQuery.data.endDate ?? '',
        sponsorName: launchPlanQuery.data.sponsorName,
        managers: launchPlanQuery.data.managers,
        facilitators: launchPlanQuery.data.facilitators,
        programLead: launchPlanQuery.data.programLead,
      }
    : null;
  const persistedTaskState = useMemo(() => {
    try {
      return launchPlanQuery.data
        ? { ...defaultTaskState(), ...JSON.parse(launchPlanQuery.data.taskStateJson) as Record<string, LaunchTaskState> }
        : null;
    } catch {
      return null;
    }
  }, [launchPlanQuery.data]);
  const configuration = configurationDraft ?? persistedConfiguration ?? DEFAULT_LAUNCH_CONFIG;
  const taskState = taskStateDraft ?? persistedTaskState ?? defaultTaskState();
  const generated = generatedDraft ?? Boolean(launchPlanQuery.data);
  const rowVersion = saveLaunchPlan.data?.rowVersion ?? launchPlanQuery.data?.rowVersion ?? null;

  const persist = (nextConfiguration: LaunchConfiguration, nextState: Record<string, LaunchTaskState>) => {
    saveLaunchPlan.mutate({
      ...nextConfiguration,
      taskStateJson: JSON.stringify(nextState),
      rowVersion,
    });
  };

  const progress = useMemo(() => {
    const complete = Object.values(taskState).filter((task) => task.status === 'complete').length;
    return Math.round((complete / FRONTIER_LAUNCH_MILESTONES.length) * 100);
  }, [taskState]);

  const nextActions = useMemo(() => {
    if (!configuration.startDate) return [];
    return FRONTIER_LAUNCH_MILESTONES
      .map((milestone) => ({ milestone, date: milestoneDate(configuration, milestone), state: taskState[milestone.id] }))
      .filter((item) => item.date && item.state?.status !== 'complete')
      .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))
      .slice(0, 4);
  }, [configuration, taskState]);

  const calendarMonths = useMemo(() => {
    if (!configuration.startDate) return [];
    return buildCalendarMonths(configuration);
  }, [configuration]);

  const safeCalendarMonthIndex = Math.min(activeCalendarMonthIndex, Math.max(calendarMonths.length - 1, 0));
  const activeCalendarMonth = calendarMonths[safeCalendarMonthIndex] ?? calendarMonths[0];

  const updateConfig = (field: keyof LaunchConfiguration, value: string) => {
    setConfigurationDraft({ ...configuration, [field]: value });
  };

  const generatePlan = () => {
    if (!configuration.startDate) {
      setFeedback('Select a Huddle start date to generate the launch plan.');
      return;
    }
    if (!configuration.teamName.trim()) {
      setFeedback('Enter the organization or team name.');
      return;
    }
    setGeneratedDraft(true);
    persist(configuration, taskState);
    setFeedback('Launch plan generated.');
  };

  const setStatus = (milestoneId: string, status: LaunchTaskStatus) => {
    const next = { ...taskState, [milestoneId]: { ...taskState[milestoneId], status } };
    setTaskStateDraft(next);
    persist(configuration, next);
  };

  const toggleChecklist = (milestoneId: string, index: number) => {
    const milestoneState = taskState[milestoneId];
    const checklist = [...milestoneState.checklist];
    checklist[index] = !checklist[index];
    const complete = checklist.every(Boolean);
    const next = {
      ...taskState,
      [milestoneId]: {
        checklist,
        status: complete ? 'complete' as const : checklist.some(Boolean) ? 'in-progress' as const : milestoneState.status === 'complete' ? 'not-started' as const : milestoneState.status,
      },
    };
    setTaskStateDraft(next);
    persist(configuration, next);
  };

  const openMilestone = (milestone: LaunchMilestoneDefinition) => {
    setSelectedMilestone(milestone);
    setSelectedTemplateId(milestone.templates[0]?.id ?? '');
  };

  const resetPlanner = () => {
    if (launchPlanQuery.data) resetLaunchPlan.mutate();
    setConfigurationDraft(DEFAULT_LAUNCH_CONFIG);
    setTaskStateDraft(defaultTaskState());
    setGeneratedDraft(false);
    setSelectedMilestone(null);
    setFeedback('Launch Planner reset.');
  };

  const exportPackage = () => {
    if (!configuration.startDate || !generated) {
      setFeedback('Generate the launch plan before exporting the package.');
      return;
    }
    downloadLaunchPackage(configuration, FRONTIER_LAUNCH_MILESTONES, taskState);
    setFeedback('Launch package exported. Open the HTML file to review or print to PDF.');
  };

  const selectedTemplate = selectedMilestone?.templates.find((template) => template.id === selectedTemplateId) ?? selectedMilestone?.templates[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F8FC]">
      <div className="mx-auto max-w-[1540px] space-y-6 p-4 lg:p-6">
        {(launchPlanQuery.error || saveLaunchPlan.error || resetLaunchPlan.error) && (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            The Launch Planner could not synchronize with the API. Refresh after applying the required database migration.
          </div>
        )}
        {feedback && (
          <div role="status" className="rounded-xl border border-[#92D3C6] bg-[#E3F1ED] px-4 py-3 text-sm text-[#184448]">{feedback}</div>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 shrink-0 border-[#CFDEE8] bg-white text-[#2A446F]"
              onClick={() => navigate('/huddle')}
              aria-label="Back to Huddles"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-[#E2F1F9] p-2.5">
                  <CalendarDays className="h-6 w-6 text-[#0A6BBA]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0A6BBA]">Frontier Accelerator</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#1E3252] lg:text-3xl">Launch Planner</h1>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-[#5B6E82] lg:text-base">
                Turn a Huddle start date into a coordinated launch timeline, readiness checklist, and personalized communication package.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="border-[#0A6BBA] bg-white text-[#0A6BBA] hover:bg-[#E2F1F9]" onClick={exportPackage} disabled={!generated}>
              <Download className="mr-2 h-4 w-4" />
              Export launch package
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-[#CFDEE8] bg-white" aria-label="Launch Planner actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={resetPlanner}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset planner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!generated ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
            <Card className="overflow-hidden rounded-2xl border-[#D7E4EC] bg-white shadow-[0_8px_30px_rgba(42,68,111,0.07)]">
              <div className="border-b border-[#E2EAF0] bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A6BBA] text-sm font-semibold text-white">1</div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1E3252]">Configure Huddle launch</h2>
                    <p className="text-sm text-[#66798C]">Provide the launch details once. The planner calculates the rest.</p>
                  </div>
                </div>
              </div>
              <CardContent className="grid gap-5 p-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Organization / team name <span className="text-[#B42318]">*</span></Label>
                  <Input id="teamName" value={configuration.teamName} onChange={(event) => updateConfig('teamName', event.target.value)} placeholder="e.g., US Enterprise Sales" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cohortName">Cohort name</Label>
                  <Input id="cohortName" value={configuration.cohortName} onChange={(event) => updateConfig('cohortName', event.target.value)} placeholder="e.g., FY27 Cohort 1" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Huddle start date <span className="text-[#B42318]">*</span></Label>
                  <Input id="startDate" type="date" value={configuration.startDate} onChange={(event) => updateConfig('startDate', event.target.value)} className="h-11" />
                  <p className="text-xs text-[#73869A]">All launch milestones are calculated relative to this date.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Program end date <span className="font-normal text-[#73869A]">(optional)</span></Label>
                  <Input id="endDate" type="date" value={configuration.endDate ?? ''} onChange={(event) => updateConfig('endDate', event.target.value)} className="h-11" />
                  <p className="text-xs text-[#73869A]">If blank, completion defaults to T+8 weeks.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsorName">Sponsor name</Label>
                  <Input id="sponsorName" value={configuration.sponsorName} onChange={(event) => updateConfig('sponsorName', event.target.value)} placeholder="Sponsor name" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programLead">Program owner / lead</Label>
                  <Input id="programLead" value={configuration.programLead} onChange={(event) => updateConfig('programLead', event.target.value)} placeholder="Program lead name" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managers">Manager(s)</Label>
                  <Input id="managers" value={configuration.managers} onChange={(event) => updateConfig('managers', event.target.value)} placeholder="Names separated by commas" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilitators">Facilitator(s)</Label>
                  <Input id="facilitators" value={configuration.facilitators} onChange={(event) => updateConfig('facilitators', event.target.value)} placeholder="Names separated by commas" className="h-11" />
                </div>
                <div className="md:col-span-2 flex justify-end border-t border-[#E5ECF1] pt-5">
                  <Button onClick={generatePlan} className="h-11 bg-[#0A6BBA] px-6 text-white hover:bg-[#095D9F]">
                    <Sparkles className="mr-2 h-4 w-4" /> Generate launch plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-2xl border-[#D7E4EC] bg-white shadow-[0_8px_30px_rgba(42,68,111,0.06)]">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="rounded-xl bg-[#E3F1ED] p-2.5"><ClipboardCheck className="h-5 w-5 text-[#1A6B62]" /></div>
                    <div>
                      <h3 className="font-semibold text-[#1E3252]">What the planner creates</h3>
                      <p className="mt-1 text-sm leading-5 text-[#66798C]">A reusable launch motion personalized to your cohort.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      ['Date-driven timeline', 'T-4 weeks through program completion'],
                      ['Actions due next', 'A prioritized view of what needs attention'],
                      ['Readiness checklist', 'Track completion milestone by milestone'],
                      ['Communication assets', 'Email, Teams, calendar, talking points, and agendas'],
                      ['Launch package export', 'One consolidated package for sharing or print/PDF'],
                    ].map(([title, description]) => (
                      <div key={title} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1A6B62]" />
                        <div><p className="text-sm font-medium text-[#1E3252]">{title}</p><p className="text-xs leading-5 text-[#73869A]">{description}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="rounded-2xl border-[#D7E4EC] bg-white shadow-[0_8px_30px_rgba(42,68,111,0.06)]">
              <CardContent className="p-5 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-[#1E3252]">{configuration.cohortName || configuration.teamName}</h2>
                      <Badge className="border-[#92D3C6] bg-[#E3F1ED] text-[#184448]">Launch plan active</Badge>
                    </div>
                    <p className="text-sm text-[#66798C]">{configuration.teamName} · Huddle kickoff {formatLaunchDate(milestoneDate(configuration, FRONTIER_LAUNCH_MILESTONES[4]), true)}</p>
                  </div>
                  <div className="flex min-w-[280px] items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-[#5B6E82]">Launch readiness</span><span className="font-semibold text-[#1E3252]">{progress}%</span></div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Button variant="outline" className="border-[#CFDEE8] bg-white" onClick={() => setGeneratedDraft(false)}>Edit setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(330px,.7fr)]">
              <div className="space-y-6">
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1E3252]">What do I need to do next?</h2>
                      <p className="text-sm text-[#66798C]">The next incomplete actions, prioritized by launch date.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {nextActions.map(({ milestone, date, state }, index) => (
                      <button key={milestone.id} type="button" onClick={() => openMilestone(milestone)} className="group rounded-2xl border border-[#D7E4EC] bg-white p-5 text-left shadow-[0_5px_20px_rgba(42,68,111,0.05)] transition hover:border-[#8DC8E8] hover:shadow-[0_8px_26px_rgba(42,68,111,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', index === 0 ? 'bg-[#E2F1F9] text-[#0A6BBA]' : 'bg-[#F4F7F9] text-[#52697F]')}>
                            {state?.status === 'in-progress' ? <ClipboardCheck className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                          </div>
                          <Badge variant="outline" className={statusMeta[state?.status ?? 'not-started'].className}>{statusMeta[state?.status ?? 'not-started'].label}</Badge>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0A6BBA]">{dueLabel(date, state?.status ?? 'not-started')}</p>
                        <h3 className="mt-1 font-semibold text-[#1E3252] group-hover:text-[#0A6BBA]">{milestone.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#66798C]">{milestone.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-[#73869A]"><span>{milestone.audience} · {milestone.ownerRole}</span><ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></div>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1E3252]">Personalized communication plan</h2>
                      <p className="text-sm text-[#66798C]">Review the launch motion as a timeline or calendar. Select any item to open its communication assets.</p>
                    </div>
                    <div className="inline-flex w-fit rounded-xl border border-[#D7E4EC] bg-white p-1 shadow-sm" role="tablist" aria-label="Launch plan view">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={planView === 'timeline'}
                        onClick={() => setPlanView('timeline')}
                        className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]', planView === 'timeline' ? 'bg-[#E2F1F9] text-[#0A6BBA]' : 'text-[#66798C] hover:bg-[#F5F9FC]')}
                      >
                        <List className="h-4 w-4" /> Timeline
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={planView === 'calendar'}
                        onClick={() => setPlanView('calendar')}
                        className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]', planView === 'calendar' ? 'bg-[#E2F1F9] text-[#0A6BBA]' : 'text-[#66798C] hover:bg-[#F5F9FC]')}
                      >
                        <CalendarRange className="h-4 w-4" /> Calendar
                      </button>
                    </div>
                  </div>

                  {planView === 'timeline' ? (
                    <Card className="rounded-2xl border-[#D7E4EC] bg-white shadow-[0_5px_20px_rgba(42,68,111,0.05)]">
                      <CardContent className="p-3 sm:p-5">
                        {FRONTIER_LAUNCH_MILESTONES.map((milestone, index) => {
                          const state = taskState[milestone.id] ?? { status: 'not-started', checklist: [] };
                          const date = milestoneDate(configuration, milestone);
                          const completedChecks = state.checklist.filter(Boolean).length;
                          return (
                            <div key={milestone.id} className="relative flex gap-4 rounded-xl px-2 py-4 transition hover:bg-[#F8FBFD] sm:px-3">
                              {index < FRONTIER_LAUNCH_MILESTONES.length - 1 && <div className="absolute left-[29px] top-[46px] h-[calc(100%-20px)] w-px bg-[#D9E5ED] sm:left-[33px]" />}
                              <button type="button" onClick={() => openMilestone(milestone)} aria-label={`Open ${milestone.title}`} className={cn('relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]', state.status === 'complete' ? 'border-[#1A6B62] text-[#1A6B62]' : state.status === 'in-progress' ? 'border-[#0A6BBA] text-[#0A6BBA]' : 'border-[#C8D5DF] text-[#8A9AAA]')}>
                                {state.status === 'complete' ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                              </button>
                              <button type="button" onClick={() => openMilestone(milestone)} className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#1E3252]">{milestone.title}</h3><span className="text-xs font-semibold text-[#0A6BBA]">{milestone.relativeLabel}</span></div>
                                    <p className="mt-1 text-sm text-[#66798C]">{milestone.audience} · Owner: {milestone.ownerRole}</p>
                                    <p className="mt-2 text-xs text-[#73869A]">{completedChecks}/{milestone.checklist.length} readiness items complete · {milestone.templates.length} communication asset{milestone.templates.length === 1 ? '' : 's'}</p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-3"><span className="text-sm font-semibold text-[#2A446F]">{formatLaunchDate(date)}</span><Badge variant="outline" className={statusMeta[state.status].className}>{statusMeta[state.status].label}</Badge></div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ) : activeCalendarMonth ? (
                    (() => {
                      const { year, month } = activeCalendarMonth;
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
                      const cells = Array.from({ length: totalCells }, (_, index) =>
                        index < firstDay || index >= firstDay + daysInMonth ? null : index - firstDay + 1
                      );

                      const monthActivities = FRONTIER_LAUNCH_MILESTONES
                        .map((milestone) => ({ milestone, date: milestoneDate(configuration, milestone) }))
                        .filter((item): item is { milestone: LaunchMilestoneDefinition; date: Date } =>
                          Boolean(item.date && item.date.getFullYear() === year && item.date.getMonth() === month)
                        )
                        .sort((a, b) => a.date.getTime() - b.date.getTime());

                      const monthCompleted = monthActivities.filter(
                        ({ milestone }) => (taskState[milestone.id]?.status ?? 'not-started') === 'complete'
                      ).length;

                      return (
                        <Card className="overflow-hidden rounded-2xl border-[#D7E4EC] bg-white shadow-[0_8px_26px_rgba(42,68,111,0.06)]">
                          <div className="flex flex-col gap-4 border-b border-[#E3EAF0] bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F1F9] text-[#0A6BBA]">
                                <CalendarRange className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-[#1E3252]">{monthLabel(year, month)}</h3>
                                <p className="text-xs text-[#73869A]">
                                  {monthActivities.length} launch activit{monthActivities.length === 1 ? 'y' : 'ies'} · {monthCompleted} complete
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" size="icon" className="h-9 w-9 border-[#CFDEE8] bg-white text-[#2A446F]" onClick={() => setActiveCalendarMonthIndex((current) => Math.max(0, current - 1))} disabled={activeCalendarMonthIndex === 0} aria-label="Previous month">
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <div className="min-w-[92px] text-center text-xs font-medium text-[#5B6E82]">
                                {activeCalendarMonthIndex + 1} of {calendarMonths.length}
                              </div>
                              <Button type="button" variant="outline" size="icon" className="h-9 w-9 border-[#CFDEE8] bg-white text-[#2A446F]" onClick={() => setActiveCalendarMonthIndex((current) => Math.min(calendarMonths.length - 1, current + 1))} disabled={activeCalendarMonthIndex === calendarMonths.length - 1} aria-label="Next month">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <CardContent className="p-0">
                            <div className="grid grid-cols-7 border-b border-[#E6EDF2] bg-[#F8FBFD]">
                              {WEEKDAY_LABELS.map((day) => (
                                <div key={day} className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#73869A]">{day}</div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7">
                              {cells.map((day, index) => {
                                if (!day) return <div key={`blank-${index}`} className="h-[92px] border-b border-r border-[#EDF2F5] bg-[#FBFDFE]" />;
                                const date = new Date(year, month, day, 12, 0, 0);
                                const events = monthActivities.filter((item) => item.date.getDate() === day);
                                const isToday = monthKey(date) === monthKey(startOfToday()) && date.getDate() === startOfToday().getDate();
                                return (
                                  <div key={day} className="group relative h-[92px] border-b border-r border-[#EDF2F5] bg-white p-2 transition hover:bg-[#F8FBFD]">
                                    <div className={cn('mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium', isToday ? 'bg-[#0A6BBA] text-white' : 'text-[#52697F]')}>{day}</div>
                                    <div className="space-y-1">
                                      {events.slice(0, 2).map(({ milestone }) => {
                                        const state = taskState[milestone.id] ?? { status: 'not-started', checklist: [] };
                                        return (
                                          <button key={milestone.id} type="button" onClick={() => openMilestone(milestone)} title={`${milestone.title} · ${statusMeta[state.status].label}`} className={cn('flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-left text-[10px] leading-3 transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]', state.status === 'complete' ? 'border-[#BFDCD3] bg-[#EAF5F1] text-[#184448]' : state.status === 'in-progress' ? 'border-[#B9DAED] bg-[#EAF4FA] text-[#1E3252]' : 'border-[#E3D5C8] bg-[#F7F2EE] text-[#443429]')}>
                                            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', state.status === 'complete' ? 'bg-[#1A6B62]' : state.status === 'in-progress' ? 'bg-[#0A6BBA]' : 'bg-[#A98E78]')} />
                                            <span className="truncate font-medium">{milestone.title}</span>
                                          </button>
                                        );
                                      })}
                                      {events.length > 2 && (
                                        <button type="button" onClick={() => openMilestone(events[2].milestone)} className="px-1 text-[10px] font-medium text-[#0A6BBA] hover:underline">+{events.length - 2} more</button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-[#E6EDF2] bg-[#FBFDFE] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-wrap items-center gap-4 text-xs text-[#66798C]">
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#A98E78]" /> Not started</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0A6BBA]" /> In progress</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1A6B62]" /> Complete</span>
                              </div>
                              <p className="text-xs text-[#73869A]">Select an activity to open its communication assets.</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()
                  ) : (
                    <Card className="rounded-2xl border-[#D7E4EC] bg-white">
                      <CardContent className="flex min-h-[320px] items-center justify-center text-sm text-[#73869A]">No calendar dates available.</CardContent>
                    </Card>
                  )}
                </section>
              </div>

              <aside className="space-y-4">
                <Card className="rounded-2xl border-[#D7E4EC] bg-white shadow-[0_5px_20px_rgba(42,68,111,0.05)]">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start gap-3"><div className="rounded-xl bg-[#E3F1ED] p-2"><Users className="h-4 w-4 text-[#1A6B62]" /></div><div><h3 className="font-semibold text-[#1E3252]">Launch team</h3><p className="text-xs text-[#73869A]">Used to personalize communication assets.</p></div></div>
                    <div className="space-y-3 text-sm">
                      {[
                        ['Sponsor', configuration.sponsorName],
                        ['Manager(s)', configuration.managers],
                        ['Facilitator(s)', configuration.facilitators],
                        ['Program lead', configuration.programLead],
                      ].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4"><span className="text-[#73869A]">{label}</span><span className="max-w-[190px] text-right font-medium text-[#1E3252]">{value || 'Not specified'}</span></div>)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#D7E4EC] bg-white shadow-[0_5px_20px_rgba(42,68,111,0.05)]">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start gap-3"><div className="rounded-xl bg-[#E2F1F9] p-2"><FileText className="h-4 w-4 text-[#0A6BBA]" /></div><div><h3 className="font-semibold text-[#1E3252]">Launch package</h3><p className="text-xs text-[#73869A]">One consolidated, shareable output.</p></div></div>
                    <div className="space-y-2 text-sm text-[#5B6E82]">
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1A6B62]" /> Launch timeline</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1A6B62]" /> Owners and readiness checklist</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1A6B62]" /> Personalized email templates</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1A6B62]" /> Teams, calendar, agenda, and talking points</div>
                    </div>
                    <Button onClick={exportPackage} className="mt-5 w-full bg-[#0A6BBA] text-white hover:bg-[#095D9F]"><Download className="mr-2 h-4 w-4" />Generate launch package</Button>
                    <p className="mt-2 text-center text-[11px] leading-4 text-[#8292A1]">Exports as a polished HTML package that can be shared directly or printed to PDF.</p>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedMilestone)} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
        <DialogContent
          className="flex h-[calc(100vh-64px)] w-[calc(100vw-48px)] flex-col overflow-hidden overscroll-contain rounded-2xl p-0 sm:!max-w-[960px]"
        >
          {selectedMilestone && (() => {
            const state = taskState[selectedMilestone.id];
            const date = milestoneDate(configuration, selectedMilestone);
            return (
              <>
                <DialogHeader className="shrink-0 border-b border-[#E1E9EF] bg-[#F8FBFD] p-6 text-left">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:pr-8">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-[#8DC8E8] bg-[#E2F1F9] text-[#1E3252]">{selectedMilestone.relativeLabel}</Badge><span className="text-sm font-semibold text-[#2A446F]">{formatLaunchDate(date, true)}</span></div>
                      <DialogTitle className="text-xl font-semibold text-[#1E3252]">{selectedMilestone.title}</DialogTitle>
                      <p className="mt-2 max-w-2xl text-sm leading-5 text-[#66798C]">{selectedMilestone.description}</p>
                    </div>
                    <select value={state.status} onChange={(event) => setStatus(selectedMilestone.id, event.target.value as LaunchTaskStatus)} className="h-10 rounded-lg border border-[#CFDEE8] bg-white px-3 text-sm font-medium text-[#1E3252] focus:outline-none focus:ring-2 focus:ring-[#0A6BBA]">
                      <option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="complete">Complete</option>
                    </select>
                  </div>
                </DialogHeader>
                <div className="grid min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain lg:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="border-b border-[#E1E9EF] bg-white p-6 lg:border-b-0 lg:border-r">
                    <div className="mb-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#F5F9FC] p-3"><p className="text-[11px] uppercase tracking-wide text-[#73869A]">Audience</p><p className="mt-1 text-sm font-semibold text-[#1E3252]">{selectedMilestone.audience}</p></div><div className="rounded-xl bg-[#F5F9FC] p-3"><p className="text-[11px] uppercase tracking-wide text-[#73869A]">Owner</p><p className="mt-1 text-sm font-semibold text-[#1E3252]">{selectedMilestone.ownerRole}</p></div></div>
                    <h3 className="mb-3 text-sm font-semibold text-[#1E3252]">Readiness checklist</h3>
                    <div className="space-y-2">
                      {selectedMilestone.checklist.map((item, index) => (
                        <button key={item} type="button" onClick={() => toggleChecklist(selectedMilestone.id, index)} className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-[#F5F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]">
                          <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border', state.checklist[index] ? 'border-[#1A6B62] bg-[#1A6B62] text-white' : 'border-[#B9C9D5] bg-white')}>
                            {state.checklist[index] && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <span className={cn('text-sm leading-5', state.checklist[index] ? 'text-[#617568] line-through' : 'text-[#354D65]')}>{item}</span>
                        </button>
                      ))}
                    </div>
                    <Separator className="my-5" />
                    <h3 className="mb-3 text-sm font-semibold text-[#1E3252]">Communication assets</h3>
                    <div className="space-y-2">
                      {selectedMilestone.templates.map((template) => (
                        <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6BBA]', selectedTemplate?.id === template.id ? 'border-[#8DC8E8] bg-[#E2F1F9]' : 'border-[#E0E8EE] bg-white hover:bg-[#F8FBFD]')}>
                          <div className="rounded-lg bg-white p-2 text-[#0A6BBA] shadow-sm">{template.type === 'Email' ? <Mail className="h-4 w-4" /> : template.type === 'Teams post' ? <MessageSquareText className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</div>
                          <div className="min-w-0"><p className="text-sm font-medium text-[#1E3252]">{template.title}</p><p className="text-xs text-[#73869A]">{template.type}</p></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0 bg-[#F8FBFD] p-6 pb-8">
                    {selectedTemplate ? (
                      <div className="rounded-2xl border border-[#D7E4EC] bg-white shadow-[0_5px_20px_rgba(42,68,111,0.05)]">
                        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[#E3EAF0] px-5 py-4"><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0A6BBA]">{selectedTemplate.type}</p><h3 className="mt-0.5 font-semibold text-[#1E3252]">{selectedTemplate.title}</h3></div><Button variant="outline" size="sm" className="shrink-0 border-[#0A6BBA] text-[#0A6BBA]" onClick={async () => { const content = `${selectedTemplate.subject ? `Subject: ${personalizeTemplate(selectedTemplate.subject, configuration)}\n\n` : ''}${personalizeTemplate(selectedTemplate.body, configuration)}`; await navigator.clipboard.writeText(content); setFeedback('Template copied.'); }}><Copy className="mr-2 h-3.5 w-3.5" />Copy</Button></div>
                        <div className="space-y-4 p-5">
                          {selectedTemplate.subject && <div><p className="mb-1.5 text-xs font-semibold text-[#66798C]">Subject</p><div className="rounded-lg border border-[#DCE6ED] bg-[#F8FBFD] px-4 py-3 text-sm font-medium text-[#1E3252]">{personalizeTemplate(selectedTemplate.subject, configuration)}</div></div>}
                          <div>
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold text-[#66798C]">{selectedTemplate.type === 'Email' ? 'Message preview' : 'Content'}</p>
                              {selectedTemplate.type === 'Email' && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 shrink-0 border-[#0A6BBA] text-[#0A6BBA]"
                                  onClick={() => {
                                    const subject = personalizeTemplate(selectedTemplate.subject ?? selectedTemplate.title, configuration);
                                    const body = personalizeTemplate(selectedTemplate.body, configuration);
                                    window.open(outlookDraftUrl(subject, body), '_blank', 'noopener,noreferrer');
                                    setFeedback('Opening a personalized Outlook draft.');
                                  }}
                                >
                                  <Send className="mr-2 h-3.5 w-3.5" /> Open Outlook draft
                                </Button>
                              )}
                            </div>
                            {selectedTemplate.type === 'Email' ? (
                              <div className="overflow-hidden rounded-xl border border-[#DCE6ED] bg-white">
                                <div className="relative min-h-[118px] overflow-hidden border-b border-[#E4EAF0] bg-gradient-to-br from-[#FAFCFE] via-white to-[#EDF5FA] px-6 py-5">
                                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#8DC8E8]/40" />
                                  <div className="absolute right-10 top-4 grid grid-cols-5 gap-1 opacity-50">
                                    {Array.from({ length: 25 }).map((_, dot) => <span key={dot} className="h-1 w-1 rounded-full bg-[#0A6BBA]" />)}
                                  </div>
                                  <div className="relative flex items-end gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8DC8E8] bg-white text-2xl font-semibold text-[#2A446F] shadow-sm">F</div>
                                    <div>
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#2A446F]">Frontier</p>
                                      <p className="text-3xl font-semibold leading-none tracking-tight text-[#2A446F]">HUDDLE</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="whitespace-pre-wrap px-6 py-5 text-sm leading-7 text-[#263D56]">{personalizeTemplate(selectedTemplate.body, configuration)}</div>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap rounded-xl border border-[#DCE6ED] bg-white p-4 text-sm leading-6 text-[#354D65]">{personalizeTemplate(selectedTemplate.body, configuration)}</div>
                            )}
                          </div>
                          <div className="rounded-xl border border-[#CFE4DD] bg-[#EAF5F1] p-3 text-xs leading-5 text-[#315F58]">Personalized automatically using the launch setup. {selectedTemplate.type === 'Email' ? 'Open Outlook draft carries the personalized subject and message into Outlook. Sending the branded HTML directly from the app can be enabled once Microsoft Graph sender permissions are approved.' : 'Update the cohort details at any time to refresh the content.'}</div>
                        </div>
                      </div>
                    ) : <div className="flex min-h-[320px] items-center justify-center text-sm text-[#73869A]">Select a communication asset.</div>}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

