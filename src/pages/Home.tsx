import { useProject } from "@/components/page-utils";
import { Button } from "@/components/Button";
import { type Project } from "@/lib/models";

export default function HomePage() {
  const project = useProject();

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Good morning, Alex</h1>
        <p className="mt-1 text-sm text-ink-500">Your story is 0% complete. Here's what needs your attention today.</p>
        <div className="mt-6 rounded-md border border-dashed border-ink-200 p-8 text-center">
          <p className="text-sm text-ink-500">No project selected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HomeHeader project={project} />
      <ProgressRow project={project} />
      <ContinueCard />
      <TodayFocus />
      <Queue />
      <NeedsAttention />
      <ComingUp />
      <SceneProgress />
      <AiActivity />
      <WritingActivity />
    </div>
  );
}

/* ---------- Header ---------- */
function HomeHeader({ project }: { project: any }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Good morning, Alex</h1>
      <p className="mt-1 text-sm text-ink-500">
        Your story is 68% complete. Here's what needs your attention today.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-500">
          {project.title}
        </span>
        <span className="text-xs text-ink-400">Mystery · Long-form · 8 scenes</span>
      </div>
    </div>
  );
}

/* ---------- Progress ---------- */
function ProgressRow() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex items-center gap-4 rounded-md border border-ink-100 p-4">
        <ProgressRing pct={68} />
        <div>
          <div className="text-lg font-semibold text-ink-900">68% Complete</div>
          <div className="mt-1 space-y-0.5 text-xs text-ink-500">
            <div>Topic ✓</div>
            <div>Story ✓</div>
            <div>Characters ✓</div>
            <div>Scenes 6/8</div>
            <div>Dialogue 4/8</div>
            <div>Captions 3/8</div>
            <div>Draft 2/8</div>
            <div>Export —</div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-ink-100 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Stats</div>
        <div className="mt-2 space-y-1">
          <Stat label="Words" value="42,680" />
          <Stat label="Scenes" value="8" />
          <Stat label="Characters" value="6" />
          <Stat label="Unresolved issues" value="3" />
          <Stat label="Last edited" value="8 min ago" />
        </div>
      </div>

      <div className="rounded-md border border-ink-100 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Pipeline</div>
        <div className="mt-2 space-y-1 text-xs">
          <PipelineStep n="01" label="Topic" done />
          <PipelineStep n="02" label="Story" done />
          <PipelineStep n="03" label="Characters" done />
          <PipelineStep n="04" label="Scenes" value="6/8" />
          <PipelineStep n="05" label="Dialogue" value="4/8" />
          <PipelineStep n="06" label="Captions" value="3/8" />
          <PipelineStep n="07" label="Draft" value="2/8" />
          <PipelineStep n="08" label="Export" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

function PipelineStep({
  n, label, done, value,
}: { n: string; label: string; done?: boolean; value?: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded px-1 py-0.5 hover:bg-ink-50">
      <span className="text-ink-400">{n}</span>
      <span className={done ? "text-ink-900" : "text-ink-700"}>{label}</span>
      {done && <CheckIcon />}
      {value && <span className="ml-auto text-ink-400">{value}</span>}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle
        cx="32" cy="32" r={r}
        fill="none"
        stroke="#e5e5e0"
        strokeWidth="6"
      />
      <circle
        cx="32" cy="32" r={r}
        fill="none"
        stroke="#2f5d62"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1a1a1a">{pct}%</text>
    </svg>
  );
}

/* ---------- Continue ---------- */
function ContinueCard() {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        Continue Where You Left Off
      </div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-ink-900">Continue writing</div>
          <div className="mt-0.5 text-sm text-ink-700">
            Scene 06 — The Attic
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Maya finds an old photograph hidden inside the wall and realizes Daniel has been keeping a secret.
          </p>
          <div className="mt-2 text-xs text-ink-500">Progress: 72% complete</div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button variant="primary">Continue Scene</Button>
          <Button variant="secondary">View Scene</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Today's Focus ---------- */
function TodayFocus() {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Today's Focus
          </div>
          <div className="mt-0.5 text-sm text-ink-500">3 tasks · Total ~25 minutes</div>
        </div>
        <Button variant="primary">Start Focus Session</Button>
      </div>
      <div className="mt-3 space-y-2">
        <FocusRow title="Finish Scene 6 dialogue" effort="~10 min" />
        <FocusRow title="Review Scene 5 captions" effort="~5 min" />
        <FocusRow title="Resolve Daniel's age inconsistency" effort="~10 min" />
      </div>
    </div>
  );
}

function FocusRow({ title, effort }: { title: string; effort: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-ink-100 px-3 py-2">
      <span className="text-sm text-ink-700">{title}</span>
      <span className="text-xs text-ink-400">{effort}</span>
    </div>
  );
}

/* ---------- Queue ---------- */
function Queue() {
  return (
    <div className="rounded-md border border-ink-100">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Your Queue</div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Task</th>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Estimated effort</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          <QueueRow status="In Progress" task="Finish Scene 6 dialogue" section="Dialogue" priority="High" effort="~10 min" />
          <QueueRow status="Needs Review" task="Check character consistency" section="Review" priority="Medium" effort="~5 min" />
          <QueueRow status="Waiting" task="Generate captions for Scene 5" section="Captions" priority="Low" effort="~3 min" />
          <QueueRow status="Upcoming" task="Review Scene 7 structure" section="Scenes" priority="Medium" effort="~15 min" />
        </tbody>
      </table>
    </div>
  );
}

function QueueRow({
  status, task, section, priority, effort,
}: {
  status: string; task: string; section: string; priority: string; effort: string;
}) {
  return (
    <tr className="hover:bg-ink-50">
      <td className="px-4 py-2">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-2 text-ink-700">{task}</td>
      <td className="px-4 py-2 text-ink-500">{section}</td>
      <td className="px-4 py-2 text-ink-500">{priority}</td>
      <td className="px-4 py-2 text-ink-500">{effort}</td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    "In Progress": { bg: "#e7f1f2", fg: "#2f5d62" },
    "Needs Review": { bg: "#fdf3e0", fg: "#b8860b" },
    Waiting: { bg: "#f0f0ee", fg: "#6b6b6b" },
    Upcoming: { bg: "#f5f5f3", fg: "#6b6b6b" },
    Blocked: { bg: "#f7e4e4", fg: "#b03030" },
    Complete: { bg: "#e7f3ec", fg: "#2f7d4f" },
  };
  const c = map[status] ?? { bg: "#f0f0ee", fg: "#6b6b6b" };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.fg }} />
      {status}
    </span>
  );
}

/* ---------- Needs Attention ---------- */
function NeedsAttention() {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        Needs Your Attention
      </div>
      <div className="mt-3 space-y-3">
        <AttentionCard
          title="Continuity issue"
          description="Daniel is 28 in Scene 2 but 31 in Scene 8."
          action="Review issue"
        />
        <AttentionCard
          title="Missing captions"
          description="Scene 5 has completed dialogue but no captions."
          action="Generate captions"
        />
        <AttentionCard
          title="Unfinished scene"
          description="Scene 6 has no ending."
          action="Continue writing"
        />
      </div>
    </div>
  );
}

function AttentionCard({
  title, description, action,
}: { title: string; description: string; action: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-ink-100 px-3 py-2">
      <div>
        <div className="text-sm font-medium text-ink-900">{title}</div>
        <div className="text-xs text-ink-500">{description}</div>
      </div>
      <Button variant="secondary" className="shrink-0 text-xs">{action}</Button>
    </div>
  );
}

/* ---------- Coming Up ---------- */
function ComingUp() {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Coming Up</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ComingDay day="Today" tasks={["Finish Scene 6", "Review dialogue", "Resolve continuity issue"]} />
        <ComingDay day="Tomorrow" tasks={["Write Scene 7", "Generate dialogue", "Review pacing"]} />
        <ComingDay day="Sep 4" tasks={["Write Scene 8", "Generate captions", "Final review"]} />
        <ComingDay day="Sep 5" tasks={["Full manuscript review"]} />
        <ComingDay day="Sep 6" tasks={["Create final draft", "Export Word + PDF"]} />
      </div>
    </div>
  );
}

function ComingDay({ day, tasks }: { day: string; tasks: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-ink-900">{day}</div>
      <ul className="mt-1 list-disc pl-4 text-xs text-ink-500">
        {tasks.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Scene Progress ---------- */
const SCENES: Array<[string, string, string | boolean, string | boolean, string | boolean, string | boolean]> = [
  ["01", "Return", true, true, true, true],
  ["02", "The House", true, true, true, true],
  ["03", "Photograph", true, true, true, true],
  ["04", "First Clue", true, true, true, true],
  ["05", "Basement", true, true, false, true],
  ["06", "Attic", "72%", "72%", "—", "Draft"],
  ["07", "Confrontation", "—", "—", "—", "—"],
  ["08", "Resolution", "—", "—", "—", "—"],
];

function SceneProgress() {
  return (
    <div className="rounded-md border border-ink-100">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Scene Progress</div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
            <th className="px-4 py-2">Scene</th>
            <th className="px-4 py-2">Writing</th>
            <th className="px-4 py-2">Dialogue</th>
            <th className="px-4 py-2">Captions</th>
            <th className="px-4 py-2">Draft</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {SCENES.map(([num, title, w, d, c, dr]) => (
            <tr key={num} className="hover:bg-ink-50">
              <td className="px-4 py-2 font-medium text-ink-900">
                {num} {title}
              </td>
              <td className="px-4 py-2"><Cell value={w} /></td>
              <td className="px-4 py-2"><Cell value={d} /></td>
              <td className="px-4 py-2"><Cell value={c} /></td>
              <td className="px-4 py-2"><Cell value={dr} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent">
        <CheckIconSmall />
      </span>
    );
  }
  if (value === false) {
    return <span className="text-ink-300">—</span>;
  }
  return <span className="text-ink-500">{value}</span>;
}

function CheckIconSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ---------- AI Activity ---------- */
const AI_ACTIVITY = [
  { agent: "Scene Agent", text: "Finished expanding Scene 6.", actions: ["Review", "Accept", "Dismiss"] },
  { agent: "Character Agent", text: "Found a possible continuity issue with Daniel.", actions: ["Review", "Accept", "Dismiss"] },
  { agent: "Dialogue Agent", text: "Suggested dialogue for Scene 5.", actions: ["Review", "Accept", "Dismiss"] },
  { agent: "Editor Agent", text: "Found 3 repeated phrases.", actions: ["Review", "Accept", "Dismiss"] },
];

function AiActivity() {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">AI Activity</div>
      <div className="mt-3 space-y-3">
        {AI_ACTIVITY.map((a) => (
          <div key={a.agent} className="rounded-md border border-ink-100 px-3 py-2">
            <div className="text-xs font-semibold text-ink-900">{a.agent}</div>
            <div className="text-xs text-ink-500">{a.text}</div>
            <div className="mt-2 flex gap-1.5">
              {a.actions.map((act) => (
                <button key={act} className="rounded-md border border-ink-200 px-2 py-0.5 text-xs hover:bg-ink-50">
                  {act}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-400">The AI should never silently make major edits.</p>
    </div>
  );
}

/* ---------- Writing Activity ---------- */
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WORDS = [1200, 1800, 900, 2400, 1600, 3200, 800];

function WritingActivity() {
  const max = Math.max(...WORDS);
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Writing Activity</div>
        <div className="flex gap-4 text-xs text-ink-500">
          <span>Words written</span>
          <span>Scenes completed</span>
          <span>Writing sessions</span>
        </div>
      </div>
      <div className="mt-3 flex h-32 items-end gap-2">
        {WORDS.map((w, i) => (
          <div key={WEEK[i]} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full max-w-[28px] rounded-sm bg-accent-soft"
              style={{ height: `${(w / max) * 100}%` }}
            />
            <span className="text-[10px] text-ink-400">{WEEK[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-ink-100 pt-3">
        <div>
          <div className="text-xs text-ink-400">Words written</div>
          <div className="text-sm font-medium text-ink-900">11,900</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Scenes completed</div>
          <div className="text-sm font-medium text-ink-900">5</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Writing sessions</div>
          <div className="text-sm font-medium text-ink-900">7</div>
        </div>
      </div>
    </div>
  );
}