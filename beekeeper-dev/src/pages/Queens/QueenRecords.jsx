import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Baby,
  CheckCircle2,
  CircleDot,
  Crown,
  Egg,
  GitBranch,
  History,
  Info,
  Lock,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { queenColourReference, queenPreviewData } from "./queenPreviewData.js";

const TABS = [
  { id: "overview", label: "Overview", icon: Crown },
  { id: "current", label: "Current Queen", icon: CircleDot },
  { id: "progress", label: "Progress", icon: Activity },
  { id: "history", label: "History", icon: History },
  { id: "events", label: "Events & Changes", icon: GitBranch },
];

const EVENT_ACTIONS = [
  {
    id: "add",
    label: "Add a Queen",
    description: "Create the first known Queen record for the selected hive.",
    icon: Plus,
  },
  {
    id: "edit",
    label: "Edit Queen Information",
    description: "Correct or add permanent information about the current queen.",
    icon: Pencil,
  },
  {
    id: "progress",
    label: "Record Queen Progress",
    description: "Record acceptance, emergence, mating or laying progress.",
    icon: Activity,
  },
  {
    id: "swarm",
    label: "Record a Swarm",
    description: "End the current assignment and record what remains in the hive.",
    icon: Sparkles,
  },
  {
    id: "split",
    label: "Record a Split",
    description: "Create or select a destination and choose where the queen moved.",
    icon: GitBranch,
  },
  {
    id: "transfer",
    label: "Transfer a Queen",
    description: "Move the current queen to another existing hive or nucleus.",
    icon: ArrowRightLeft,
  },
  {
    id: "introduce",
    label: "Introduce a Queen",
    description: "Record a purchased mated queen, virgin queen or queen cell.",
    icon: UserPlus,
  },
  {
    id: "rearing",
    label: "Start Queen Rearing",
    description: "Record a brood frame, retained cells or another rearing method.",
    icon: Egg,
  },
];

const accessOptions = [
  { value: "premium", label: "Premium — editable" },
  { value: "readonly", label: "Free — retained records (read-only)" },
  { value: "free-empty", label: "Free — no Queen records" },
];

const statusClass = (status = "") => {
  const value = status.toLowerCase();
  if (value.includes("present") || value.includes("laying")) {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (value.includes("pending") || value.includes("rearing") || value.includes("expected")) {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const StatusPill = ({ children }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
      children
    )}`}
  >
    {children}
  </span>
);

const Card = ({ children, className = "" }) => (
  <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-bold text-[#1a3329]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
    </div>
    {action}
  </div>
);

const Detail = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-gray-900">{value || "Not recorded"}</dd>
  </div>
);

const EmptyHiveSelection = () => (
  <Card className="p-8 text-center">
    <Crown className="mx-auto h-10 w-10 text-amber-500" />
    <h2 className="mt-3 text-xl font-bold text-[#1a3329]">Select a hive</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
      Choose a particular hive above to view its Current Queen, progress, history and event tools.
    </p>
  </Card>
);

const ReadOnlyNotice = () => (
  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex gap-3">
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
      <div>
        <p className="font-bold text-amber-950">Queen Records are read-only</p>
        <p className="mt-1 text-sm text-amber-900">
          Existing records have been retained. Restore Premium to add, edit or progress Queen information.
        </p>
      </div>
    </div>
    <Link
      to="/pricing"
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
    >
      Restore Premium
    </Link>
  </div>
);

const PremiumOnlyLanding = () => (
  <div className="mx-auto max-w-4xl">
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-[#1a3329] to-[#28513f] px-6 py-10 text-center text-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-[#1a3329]">
          <Crown className="h-9 w-9" />
        </div>
        <h2 className="mt-5 text-3xl font-extrabold">Queen Records</h2>
        <p className="mx-auto mt-3 max-w-2xl text-green-50">
          Build a permanent history of every queen, including marking details, introductions, splits,
          transfers, mating progress, supersedure and previous queens.
        </p>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {[
          "Track queen age, colour, origin and marking details",
          "Follow a queen when she moves during a split or transfer",
          "Preserve the Queen record that applied to every inspection",
          "Record introduction, emergence, mating and laying progress",
          "Review current and previous queens by apiary and hive",
          "Keep all Queen information if Premium later ends",
        ].map((item) => (
          <div key={item} className="flex gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
            <p className="text-sm font-medium text-gray-800">{item}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 p-6 text-center">
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
        >
          Upgrade to HiveTag Premium
        </Link>
      </div>
    </Card>
  </div>
);

const AllHivesOverview = ({ hives, onOpenHive }) => {
  const withCurrentQueen = hives.filter((hive) => hive.currentQueen).length;
  const inTransition = hives.filter((hive) => hive.transition).length;
  const needingAttention = hives.filter((hive) => hive.attention).length;
  const previousQueens = hives.reduce((total, hive) => total + hive.previousQueens.length, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Current queens", withCurrentQueen, Crown],
          ["Queen transitions", inTransition, Activity],
          ["Requiring attention", needingAttention, AlertTriangle],
          ["Previous queens", previousQueens, History],
        ].map(([label, value, Icon]) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="mt-1 text-3xl font-extrabold text-[#1a3329]">{value}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-800">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Queen register"
          subtitle="Current Queen position for the hives included by the selected apiary filter."
        />
        <div className="divide-y divide-gray-100">
          {hives.map((hive) => (
            <button
              key={hive.id}
              type="button"
              onClick={() => onOpenHive(hive.id)}
              className="grid w-full gap-3 px-5 py-4 text-left hover:bg-amber-50 sm:grid-cols-[1.1fr_1.6fr_1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-bold text-[#1a3329]">{hive.name}</p>
                <p className="text-xs text-gray-500">
                  {queenPreviewData.apiaries.find((apiary) => apiary.id === hive.apiaryId)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {hive.currentQueen
                    ? `${hive.currentQueen.year} ${hive.currentQueen.actualColour.toLowerCase()}-marked queen`
                    : "No confirmed current queen"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {hive.currentQueen?.origin || hive.transition?.method || "No Queen process recorded"}
                </p>
              </div>
              <div>
                <StatusPill>{hive.status}</StatusPill>
              </div>
              <span className="text-sm font-bold text-blue-700">Open →</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

const QueenOverview = ({ hive, canEdit, onAction }) => (
  <div className="grid gap-5 xl:grid-cols-3">
    <Card className="xl:col-span-2">
      <CardHeader
        title="Current Queen position"
        subtitle={`The position that will be shown when a new inspection is started for ${hive.name}.`}
        action={
          canEdit ? (
            <button
              type="button"
              onClick={() => onAction(hive.currentQueen ? "progress" : "introduce")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a3329] px-4 py-2 text-sm font-bold text-white hover:bg-[#28513f]"
            >
              {hive.currentQueen ? <Activity className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {hive.currentQueen ? "Record Progress" : "Establish a Queen"}
            </button>
          ) : null
        }
      />
      <div className="p-5">
        {hive.currentQueen ? (
          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-amber-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[#1a3329]">
                  <Crown className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">{hive.currentQueen.reference}</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-[#1a3329]">
                    {hive.currentQueen.year} {hive.currentQueen.actualColour.toLowerCase()}-marked queen
                  </h3>
                  <p className="mt-2 text-sm text-gray-700">{hive.currentQueen.origin}</p>
                </div>
              </div>
              <StatusPill>{hive.currentQueen.status}</StatusPill>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Detail label="Last seen" value={hive.currentQueen.lastSeen} />
              <Detail label="Current since" value={hive.currentQueen.currentSince} />
              <Detail label="Clipped" value={hive.currentQueen.clipped} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-800" />
              <div>
                <h3 className="text-xl font-extrabold text-amber-950">No confirmed current queen</h3>
                <p className="mt-2 text-sm text-amber-900">
                  {hive.transition?.method || "No replacement method has been recorded."}
                </p>
                {hive.transition ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Detail label="Started" value={hive.transition.startedOn} />
                    <Detail label="Current stage" value={hive.transition.status} />
                    <Detail label="Expected check" value={hive.transition.expectedCheck} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>

    <Card>
      <CardHeader title="Next action" subtitle="Current Queen-related follow-up." />
      <div className="p-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-amber-950">{hive.nextAction.title}</p>
          <p className="mt-1 text-sm font-semibold text-amber-900">Due: {hive.nextAction.due}</p>
          <p className="mt-3 text-sm text-gray-700">{hive.nextAction.note}</p>
        </div>
      </div>
    </Card>

    <Card className="xl:col-span-2">
      <CardHeader title="Latest Queen activity" subtitle="Important Queen and colony events only." />
      <div className="divide-y divide-gray-100">
        {hive.events.slice(0, 3).map((event) => (
          <div key={`${event.date}-${event.type}`} className="flex gap-4 px-5 py-4">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-yellow-400 ring-4 ring-yellow-100" />
            <div>
              <p className="font-bold text-[#1a3329]">{event.type}</p>
              <p className="mt-1 text-sm text-gray-600">{event.detail}</p>
              <p className="mt-1 text-xs font-semibold text-gray-500">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <CardHeader title="Historical protection" />
      <div className="p-5">
        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <ShieldCheck className="h-6 w-6 shrink-0 text-blue-700" />
          <p className="text-sm text-blue-950">
            Changes recorded here apply from the event date forward. Queen information already saved in
            previous inspections will remain unchanged.
          </p>
        </div>
      </div>
    </Card>
  </div>
);

const CurrentQueenTab = ({ hive, canEdit, onAction }) => {
  if (!hive.currentQueen) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
        <h2 className="mt-3 text-xl font-bold text-[#1a3329]">No current Queen record</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
          {hive.transition?.note || "Record how this colony will obtain or establish its next queen."}
        </p>
        {canEdit ? (
          <button
            type="button"
            onClick={() => onAction("introduce")}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a3329] px-5 py-2.5 font-bold text-white hover:bg-[#28513f]"
          >
            <Plus className="h-4 w-4" /> Establish a Queen
          </button>
        ) : null}
      </Card>
    );
  }

  const queen = hive.currentQueen;
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader
          title="Current Queen"
          subtitle="Permanent information about the individual queen currently assigned to this hive."
          action={
            canEdit ? (
              <button
                type="button"
                onClick={() => onAction("edit")}
                className="inline-flex items-center gap-2 rounded-lg border border-[#1a3329] px-4 py-2 text-sm font-bold text-[#1a3329] hover:bg-green-50"
              >
                <Pencil className="h-4 w-4" /> Edit Information
              </button>
            ) : null
          }
        />
        <div className="p-5">
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">{queen.reference}</p>
              <h3 className="mt-1 text-2xl font-extrabold text-[#1a3329]">
                {queen.year} {queen.actualColour.toLowerCase()}-marked queen
              </h3>
            </div>
            <StatusPill>{queen.status}</StatusPill>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Queen year" value={queen.year} />
            <Detail label="Expected colour" value={queen.expectedColour} />
            <Detail label="Actual marking colour" value={queen.actualColour} />
            <Detail label="Marked" value={queen.marked} />
            <Detail label="Clipped" value={queen.clipped} />
            <Detail label="Origin" value={queen.origin} />
            <Detail label="Supplier" value={queen.supplier} />
            <Detail label="Emerged" value={queen.emergedOn} />
            <Detail label="Introduced" value={queen.introducedOn} />
            <Detail label="Current since" value={queen.currentSince} />
            <Detail label="Last seen" value={queen.lastSeen} />
            <Detail label="Current status" value={queen.status} />
          </dl>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Queen notes</p>
            <p className="mt-2 text-sm text-gray-700">{queen.notes}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Queen marking colour reference"
          subtitle={`For ${queen.year}, the expected international marking colour is ${queen.expectedColour}.`}
        />
        <div className="p-5">
          <div className="space-y-2">
            {queenColourReference.map((row) => (
              <div
                key={row.colour}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  row.colour === queen.expectedColour
                    ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full border ${row.swatch}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{row.colour}</p>
                    <p className="text-xs text-gray-500">Years ending {row.ending}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600">e.g. {row.example}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Info className="h-5 w-5 shrink-0 text-blue-700" />
            <p className="text-sm text-blue-950">
              Queen year and actual marking colour remain separate. HiveTag suggests the recognised colour but
              does not assume that the queen is marked.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProgressTab = ({ hive, canEdit, onAction }) => (
  <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
    <Card>
      <CardHeader
        title="Queen progress"
        subtitle="A focused record of the current introduction, rearing or mating process."
        action={
          canEdit ? (
            <button
              type="button"
              onClick={() => onAction("progress")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a3329] px-4 py-2 text-sm font-bold text-white hover:bg-[#28513f]"
            >
              <Activity className="h-4 w-4" /> Record Progress
            </button>
          ) : null
        }
      />
      <div className="p-5">
        <div className="relative ml-3 border-l-2 border-amber-200 pl-7">
          {hive.progress.map((item, index) => (
            <div key={`${item.date}-${item.title}`} className={index === hive.progress.length - 1 ? "pb-0" : "pb-7"}>
              <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-4 border-white bg-yellow-400" />
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{item.date}</p>
              <h3 className="mt-1 font-bold text-[#1a3329]">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>

    <Card>
      <CardHeader title="What can be recorded?" />
      <div className="space-y-3 p-5">
        {[
          "Queen accepted or released",
          "Virgin queen seen",
          "Queen emerged",
          "Mating outcome pending",
          "Eggs observed",
          "Laying queen confirmed",
          "Queen not seen — continue monitoring",
          "Queen presumed lost",
          "Queenless confirmed",
        ].map((item) => (
          <div key={item} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
            <p className="text-sm text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const HistoryTab = ({ hive }) => (
  <div className="space-y-5">
    {hive.currentQueen ? (
      <Card>
        <CardHeader title="Current Queen" />
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">{hive.currentQueen.reference}</p>
            <p className="mt-1 text-lg font-extrabold text-[#1a3329]">
              {hive.currentQueen.year} {hive.currentQueen.actualColour.toLowerCase()}-marked queen
            </p>
            <p className="mt-1 text-sm text-gray-600">Current since {hive.currentQueen.currentSince}</p>
          </div>
          <StatusPill>{hive.currentQueen.status}</StatusPill>
        </div>
      </Card>
    ) : null}

    <Card>
      <CardHeader
        title="Previous queens"
        subtitle="Historical Queen records remain linked to this hive without changing earlier inspections."
      />
      {hive.previousQueens.length ? (
        <div className="divide-y divide-gray-100">
          {hive.previousQueens.map((queen) => (
            <div key={queen.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_1.6fr_1fr] sm:items-center">
              <div>
                <p className="font-bold text-[#1a3329]">{queen.reference}</p>
                <p className="mt-1 text-xs font-semibold text-gray-500">{queen.period}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{queen.summary}</p>
                <p className="mt-1 text-xs text-gray-500">{queen.currentLocation}</p>
              </div>
              <div className="sm:text-right">
                <StatusPill>{queen.outcome}</StatusPill>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-gray-600">No previous Queen records for this hive.</div>
      )}
    </Card>
  </div>
);

const ActionForm = ({ actionId, hive, onClose, onSaved }) => {
  const action = EVENT_ACTIONS.find((item) => item.id === actionId);
  const [eventDate, setEventDate] = useState("2026-08-04");
  const [queenType, setQueenType] = useState("Purchased mated queen");
  const [destination, setDestination] = useState("Nucleus B");
  const [replacement, setReplacement] = useState("Existing queen cells retained");
  const [progress, setProgress] = useState("Queen accepted");
  const [notes, setNotes] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onSaved(`${action.label} preview saved locally. Nothing has been written to Supabase.`);
    onClose();
  };

  return (
    <Card className="overflow-hidden border-amber-300 ring-2 ring-amber-100">
      <div className="flex items-start justify-between bg-amber-50 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Staging preview form</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#1a3329]">{action.label}</h2>
          <p className="mt-1 text-sm text-gray-600">{action.description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-900"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Hive
            <input
              type="text"
              value={hive.name}
              disabled
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Event date
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </label>
        </div>

        {(actionId === "add" || actionId === "edit" || actionId === "introduce") && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold text-gray-700">
              Queen type or origin
              <select
                value={queenType}
                onChange={(event) => setQueenType(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
              >
                <option>Purchased mated queen</option>
                <option>Purchased virgin queen</option>
                <option>Home-reared queen</option>
                <option>Transferred queen</option>
                <option>Queen cell</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Queen year
              <input type="number" defaultValue="2026" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Marking colour
              <select defaultValue="White" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                <option>Unmarked</option>
                <option>White</option>
                <option>Yellow</option>
                <option>Red</option>
                <option>Green</option>
                <option>Blue</option>
              </select>
            </label>
          </div>
        )}

        {(actionId === "split" || actionId === "transfer") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Destination hive or nucleus
              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
              >
                <option>Nucleus B</option>
                <option>Hive C</option>
                <option>Create a new hive or nucleus</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Where is the current queen?
              <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                <option>Moved to {destination}</option>
                <option>Remained in {hive.name}</option>
                <option>Queen location unknown</option>
              </select>
            </label>
          </div>
        )}

        {(actionId === "split" || actionId === "swarm" || actionId === "rearing") && (
          <label className="block text-sm font-semibold text-gray-700">
            How will {hive.name} obtain its next queen?
            <select
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option>Existing queen cells retained</option>
              <option>Frame of eggs or young larvae added</option>
              <option>Purchased mated queen</option>
              <option>Introduced virgin queen</option>
              <option>Queen cell added</option>
              <option>Temporarily queenless</option>
              <option>Not yet decided</option>
            </select>
          </label>
        )}

        {actionId === "progress" && (
          <label className="block text-sm font-semibold text-gray-700">
            Current progress
            <select
              value={progress}
              onChange={(event) => setProgress(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option>Queen accepted</option>
              <option>Queen released</option>
              <option>Virgin queen seen</option>
              <option>Queen emerged</option>
              <option>Mating outcome pending</option>
              <option>Eggs observed</option>
              <option>Laying queen confirmed</option>
              <option>Queen not seen — continue monitoring</option>
              <option>Queen presumed lost</option>
              <option>Queenless confirmed</option>
            </select>
          </label>
        )}

        <label className="block text-sm font-semibold text-gray-700">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows="4"
            placeholder="Add any useful details for this event..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a3329] px-5 py-2 text-sm font-bold text-white hover:bg-[#28513f]"
          >
            <Save className="h-4 w-4" /> Save Preview
          </button>
        </div>
      </form>
    </Card>
  );
};

const EventsTab = ({ hive, canEdit, activeAction, onAction, onClose, onSaved }) => (
  <div className="space-y-5">
    <Card>
      <CardHeader
        title="Record an event or change"
        subtitle="Use a dated event whenever the Queen or colony position changes. Do not replace a Queen by simply editing her details."
      />
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {EVENT_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              disabled={!canEdit}
              onClick={() => onAction(action.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                canEdit
                  ? "border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm"
                  : "cursor-not-allowed border-gray-200 bg-gray-100 opacity-65"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-full bg-green-100 p-2 text-green-800">
                  <Icon className="h-5 w-5" />
                </div>
                {!canEdit ? <Lock className="h-4 w-4 text-gray-500" /> : null}
              </div>
              <p className="mt-4 font-bold text-[#1a3329]">{action.label}</p>
              <p className="mt-2 text-sm text-gray-600">{action.description}</p>
            </button>
          );
        })}
      </div>
    </Card>

    {activeAction && canEdit ? (
      <ActionForm actionId={activeAction} hive={hive} onClose={onClose} onSaved={onSaved} />
    ) : null}

    <Card>
      <CardHeader title="Recent changes" />
      <div className="divide-y divide-gray-100">
        {hive.events.map((event) => (
          <div key={`${event.date}-${event.type}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[150px_1fr]">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{event.date}</p>
            <div>
              <p className="font-bold text-[#1a3329]">{event.type}</p>
              <p className="mt-1 text-sm text-gray-600">{event.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const QueenRecords = () => {
  const initialMode = localStorage.getItem("subscription_level") === "premium" ? "premium" : "free-empty";
  const [accessMode, setAccessMode] = useState(initialMode);
  const [selectedApiaryId, setSelectedApiaryId] = useState("all");
  const [selectedHiveId, setSelectedHiveId] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeAction, setActiveAction] = useState(null);
  const [message, setMessage] = useState("");

  const filteredHives = useMemo(
    () =>
      queenPreviewData.hives.filter(
        (hive) => selectedApiaryId === "all" || hive.apiaryId === selectedApiaryId
      ),
    [selectedApiaryId]
  );

  const selectedHive = useMemo(
    () => queenPreviewData.hives.find((hive) => hive.id === selectedHiveId) || null,
    [selectedHiveId]
  );

  const selectedApiaryName =
    selectedApiaryId === "all"
      ? "All apiaries"
      : queenPreviewData.apiaries.find((apiary) => apiary.id === selectedApiaryId)?.name;

  const canEdit = accessMode === "premium";
  const isReadOnly = accessMode === "readonly";
  const isFreeEmpty = accessMode === "free-empty";

  const changeApiary = (event) => {
    setSelectedApiaryId(event.target.value);
    setSelectedHiveId("all");
    setActiveTab("overview");
    setActiveAction(null);
  };

  const changeHive = (event) => {
    setSelectedHiveId(event.target.value);
    setActiveTab("overview");
    setActiveAction(null);
  };

  const openHive = (hiveId) => {
    const hive = queenPreviewData.hives.find((item) => item.id === hiveId);
    if (hive) setSelectedApiaryId(hive.apiaryId);
    setSelectedHiveId(hiveId);
    setActiveTab("overview");
    setActiveAction(null);
  };

  const openAction = (actionId) => {
    if (!canEdit) return;
    setActiveTab("events");
    setActiveAction(actionId);
  };

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-400 p-3 text-[#1a3329]">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Premium feature</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1a3329]">Queen Records</h1>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-gray-600">
            Review the current Queen position, preserve Queen history and record dated changes without altering
            the Queen information stored in previous inspections.
          </p>
        </div>

        <label className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm font-semibold text-purple-950">
          <span className="mb-1 block text-xs uppercase tracking-wide text-purple-700">Staging access preview</span>
          <select
            value={accessMode}
            onChange={(event) => {
              setAccessMode(event.target.value);
              setActiveAction(null);
              setMessage("");
            }}
            className="w-full min-w-[260px] rounded-lg border border-purple-300 bg-white px-3 py-2"
          >
            {accessOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />
            <p>{message}</p>
          </div>
          <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {isFreeEmpty ? (
        <PremiumOnlyLanding />
      ) : (
        <>
          {isReadOnly ? <ReadOnlyNotice /> : null}

          <Card className="mb-5">
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Apiary
                <select
                  value={selectedApiaryId}
                  onChange={changeApiary}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="all">All apiaries</option>
                  {queenPreviewData.apiaries.map((apiary) => (
                    <option key={apiary.id} value={apiary.id}>
                      {apiary.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-gray-700">
                Hive
                <select
                  value={selectedHiveId}
                  onChange={changeHive}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="all">All hives</option>
                  {filteredHives.map((hive) => (
                    <option key={hive.id} value={hive.id}>
                      {hive.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 text-xs font-semibold text-gray-500">
              Viewing: {selectedApiaryName} / {selectedHive?.name || "All hives"}
            </div>
          </Card>

          <div className="mb-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <nav className="flex min-w-max" aria-label="Queen page tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const disabled = selectedHiveId === "all" && tab.id !== "overview";
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveAction(null);
                    }}
                    className={`flex items-center gap-2 border-b-4 px-5 py-4 text-sm font-bold transition ${
                      activeTab === tab.id
                        ? "border-yellow-400 bg-amber-50 text-[#1a3329]"
                        : disabled
                        ? "cursor-not-allowed border-transparent text-gray-300"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-[#1a3329]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {selectedHiveId === "all" ? (
            <AllHivesOverview hives={filteredHives} onOpenHive={openHive} />
          ) : !selectedHive ? (
            <EmptyHiveSelection />
          ) : activeTab === "overview" ? (
            <QueenOverview hive={selectedHive} canEdit={canEdit} onAction={openAction} />
          ) : activeTab === "current" ? (
            <CurrentQueenTab hive={selectedHive} canEdit={canEdit} onAction={openAction} />
          ) : activeTab === "progress" ? (
            <ProgressTab hive={selectedHive} canEdit={canEdit} onAction={openAction} />
          ) : activeTab === "history" ? (
            <HistoryTab hive={selectedHive} />
          ) : (
            <EventsTab
              hive={selectedHive}
              canEdit={canEdit}
              activeAction={activeAction}
              onAction={openAction}
              onClose={() => setActiveAction(null)}
              onSaved={setMessage}
            />
          )}

          <div className="mt-5 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <Baby className="h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="font-bold text-blue-950">Visual prototype only</p>
              <p className="mt-1 text-sm text-blue-900">
                All Apiary, Hive and Queen information on this page is temporary sample data. The controls work
                locally for layout review, but no Queen data is read from or written to Supabase.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QueenRecords;