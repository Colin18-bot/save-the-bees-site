// src/pages/BeeHealth/BeeHealthHelper.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { BEE_HEALTH_RULES } from "../../utils/BeeHealthRules";

/**
 * Ada-mode philosophy:
 * - Ask 1 question at a time
 * - Allow Yes / No / Not sure (unknown)
 * - Keep "Expand all" for users who want full control
 *
 * Tri-state observation answers:
 *   "yes" | "no" | "unknown" | undefined
 *
 * Scoring flags:
 *   yes => true
 *   no/unknown/undefined => false
 */

export default function BeeHealthHelper() {
  const {
    questions,
    templates,
    conditions,
    redFlags,
    urgentReporting,
    confidence,
    dominance,
  } = BEE_HEALTH_RULES;

  const initialState = useMemo(
    () => ({
      season: "",
      colony_strength: "",
      onset_speed: "",
      main_concern: "",
      // recent_changes options are dynamic booleans (added as user clicks)
      // observation tri-states are dynamic (added as user answers)
    }),
    []
  );

  const [answers, setAnswers] = useState(initialState);
  const [mode, setMode] = useState("guided"); // "guided" | "all"
  const [results, setResults] = useState(null);

  // results UX helpers
  const [resultsStatus, setResultsStatus] = useState("idle"); // "idle" | "updating" | "ready"
  const resultsRef = useRef(null);
  const autoRunTimerRef = useRef(null);
  const didFirstAutoRunRef = useRef(false);

  // Guided flow state
  const [currentId, setCurrentId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const pendingScrollRef = useRef(null);

  // Guided history (for Back button)
  const guidedHistoryRef = useRef([]); // [{ id, prevValue }]

  // ---------- label map ----------
  const labelMap = useMemo(() => {
    const map = {};
    const ingest = (arr) =>
      (arr || []).forEach((q) => q?.id && (map[q.id] = q.label));

    ingest(questions?.context);
    ingest(questions?.concern);
    ingest(questions?.brood);
    ingest(questions?.adults_varroa);
    ingest(questions?.pests_predators);
    ingest(questions?.stores_behaviour);

    // Derived/internal flags
    map.weak_colony = "Colony is weak";
    map.strong_colony = "Colony is strong";
    map.varroa_present = "Varroa indicators present";
    map.no_varroa_signs = "No Varroa indicators reported";
    map.early_spring = "Season: Early spring";
    map.spring = "Season: Spring";
    map.summer = "Season: Summer";
    map.autumn = "Season: Autumn";
    map.winter = "Season: Winter";
    map.onset_sudden = "Sudden onset (hours–1 day)";
    map.onset_fast = "Fast onset (2–7 days)";
    map.onset_slow = "Slow onset (1–4 weeks)";
    map.onset_ongoing = "Ongoing (1+ months)";

    // Context multi
    map.recent_move = "Hive moved recently";
    map.recent_feeding = "Fed recently";
    map.recent_treatment = "Varroa treatment recently";
    map.recent_queen_event = "Recent queen event";
    map.recent_harvest = "Honey harvest / disturbance recently";
    map.none_recent = "Nothing obvious changed";

    return map;
  }, [questions]);

  const getLabel = (k) => labelMap[k] || prettyKey(k);

  // ---------- helpers ----------
  const isTri = (v) => v === "yes" || v === "no" || v === "unknown";
  const triToBool = (v) => v === "yes";

  function setSelect(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function setTri(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(optionId) {
    setAnswers((prev) => ({ ...prev, [optionId]: !prev[optionId] }));
  }

  function resetAll() {
    setAnswers(initialState);
    setResults(null);
    setCurrentId(null);
    setHighlightId(null);
    pendingScrollRef.current = null;
    guidedHistoryRef.current = [];
    setMode("guided");
    setResultsStatus("idle");
    didFirstAutoRunRef.current = false;
    if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
    autoRunTimerRef.current = null;
  }

  function jumpToResults() {
    const el = resultsRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Clause evaluator (showIf/excludeIf) uses boolean flags
  function evalClause(clause, flags) {
    if (!clause) return true;
    const any = clause.any || [];
    const all = clause.all || [];
    const not = clause.not || [];
    const anyOk = any.length === 0 ? true : any.some((k) => !!flags[k]);
    const allOk = all.length === 0 ? true : all.every((k) => !!flags[k]);
    const notOk = not.length === 0 ? true : not.every((k) => !flags[k]);
    return anyOk && allOk && notOk;
  }

  // ---------- derived flags ----------
  const derived = useMemo(() => {
    const d = {};
    d.early_spring = answers.season === "early_spring";
    d.spring = answers.season === "spring";
    d.summer = answers.season === "summer";
    d.autumn = answers.season === "autumn";
    d.winter = answers.season === "winter";

    d.weak_colony =
      answers.colony_strength === "weak" ||
      answers.colony_strength === "very_weak";
    d.strong_colony = answers.colony_strength === "strong";

    d.onset_sudden = answers.onset_speed === "sudden";
    d.onset_fast = answers.onset_speed === "fast";
    d.onset_slow = answers.onset_speed === "slow";
    d.onset_ongoing = answers.onset_speed === "ongoing";

    const concern = answers.main_concern || "";
    d.broodMode = concern === "brood" || concern === "unsure";
    d.adultMode = concern === "adults" || concern === "unsure";
    d.behaviourMode = concern === "behaviour" || concern === "unsure";
    d.collapseMode = concern === "collapse" || concern === "unsure";
    d.pestMode = concern === "pests" || concern === "unsure";
    d.unsureMode = concern === "unsure";

    // Varroa derived (tri-state "yes" only counts)
    const mitesOnBees = answers.mites_on_bees === "yes";
    const mitesOnDrone = answers.mites_on_drone_brood === "yes";
    const positiveTest = answers.positive_varroa_test === "yes";
    d.varroa_present = mitesOnBees || mitesOnDrone || positiveTest;
    d.no_varroa_signs = !d.varroa_present;

    return d;
  }, [answers]);

  // Boolean flags for scoring/showIf/excludeIf
  const flags = useMemo(() => {
    const f = { ...derived };

    Object.entries(answers).forEach(([k, v]) => {
      if (isTri(v)) f[k] = triToBool(v);
      if (typeof v === "boolean") f[k] = v;
    });

    return f;
  }, [answers, derived]);

  // Urgent reporting triggers
  function getUrgentReportingHit() {
    const list = urgentReporting || [];
    for (const rule of list) {
      const any = rule.any || [];
      const all = rule.all || [];
      const not = rule.not || [];

      const anyOk =
        any.length === 0 ? false : any.some((k) => flags[k] === true);
      const allOk =
        all.length === 0 ? true : all.every((k) => flags[k] === true);
      const notOk =
        not.length === 0 ? true : not.every((k) => flags[k] !== true);

      if (anyOk && allOk && notOk) return rule;
    }
    return null;
  }

  // ---------- question bank ----------
  const foundationQuestions = useMemo(() => {
    const qSeason =
      questions.context?.find((q) => q.id === "season") ||
      questions.context?.[0];
    const qStrength =
      questions.context?.find((q) => q.id === "colony_strength") ||
      questions.context?.[1];
    const qOnset =
      questions.context?.find((q) => q.id === "onset_speed") ||
      questions.context?.[2];
    const qConcern =
      questions.concern?.find((q) => q.id === "main_concern") ||
      questions.concern?.[0];

    return [
      { kind: "select", ...qSeason },
      { kind: "select", ...qStrength },
      { kind: "select", ...qOnset },
      { kind: "select", ...qConcern },
      ...(questions.context?.[3]?.options?.length
        ? [
            {
              kind: "multi",
              id: "recent_changes",
              label: questions.context[3].label,
              options: questions.context[3].options,
            },
          ]
        : []),
    ].filter(Boolean);
  }, [questions]);

  const observationGroups = useMemo(() => {
    return [
      { key: "brood", title: "Brood", list: questions.brood || [] },
      {
        key: "adults_varroa",
        title: "Adults / Varroa",
        list: questions.adults_varroa || [],
      },
      {
        key: "pests_predators",
        title: "Pests / Predators",
        list: questions.pests_predators || [],
      },
      {
        key: "stores_behaviour",
        title: "Stores / Behaviour",
        list: questions.stores_behaviour || [],
      },
    ];
  }, [questions]);

  const flattenedObservations = useMemo(() => {
    const arr = [];
    observationGroups.forEach((g) => {
      g.list.forEach((q) =>
        arr.push({ ...q, groupKey: g.key, groupTitle: g.title })
      );
    });
    return arr;
  }, [observationGroups]);

  // Actionable question IDs (so we never show "jump" for derived labels like Season: Winter)
  const actionableIds = useMemo(() => {
    const set = new Set();
    const addQ = (arr) => (arr || []).forEach((q) => q?.id && set.add(q.id));
    const addOpts = (arr) =>
      (arr || []).forEach((o) => o?.id && set.add(o.id));

    addQ(questions?.context);
    addQ(questions?.concern);
    addQ(questions?.brood);
    addQ(questions?.adults_varroa);
    addQ(questions?.pests_predators);
    addQ(questions?.stores_behaviour);

    // context multi options
    if (questions?.context?.[3]?.options?.length) addOpts(questions.context[3].options);

    return set;
  }, [questions]);

  const nextUnansweredFoundation = useMemo(() => {
    for (const q of foundationQuestions) {
      if (q.kind === "select") {
        if (!answers[q.id]) return q.id;
      }
      if (q.kind === "multi") continue; // optional
    }
    return null;
  }, [foundationQuestions, answers]);

  const availableObservationQuestions = useMemo(() => {
    return flattenedObservations.filter((q) => evalClause(q.showIf, flags));
  }, [flattenedObservations, flags]);

  const nextUnansweredObservation = useMemo(() => {
    for (const q of availableObservationQuestions) {
      if (!isTri(answers[q.id])) return q.id;
    }
    return null;
  }, [availableObservationQuestions, answers]);

  const computedNextId = useMemo(() => {
    if (nextUnansweredFoundation) return nextUnansweredFoundation;
    if (nextUnansweredObservation) return nextUnansweredObservation;
    return null;
  }, [nextUnansweredFoundation, nextUnansweredObservation]);

  useEffect(() => {
    if (mode !== "guided") return;
    if (!currentId && computedNextId) setCurrentId(computedNextId);
  }, [mode, currentId, computedNextId]);

  useEffect(() => {
    const id = pendingScrollRef.current;
    if (!id) return;

    const t = setTimeout(() => {
      const el = document.getElementById(`q-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      pendingScrollRef.current = null;
    }, 50);

    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(t);
  }, [highlightId]);

  // ---------- scoring ----------
  function getConfidenceLabel(score, threshold) {
    const over = score - threshold;
    if (over >= confidence.veryLikely.minOver) return confidence.veryLikely.label;
    if (over >= confidence.likely.minOver) return confidence.likely.label;
    if (over >= confidence.possible.minOver) return confidence.possible.label;
    return "Unlikely";
  }

  function getMissingEvidence(scoreMap, maxItems = 4) {
    const positives = Object.entries(scoreMap)
      .filter(([, w]) => w > 0)
      .sort((a, b) => b[1] - a[1]);

    const missing = [];
    for (const [flagId, weight] of positives) {
      const v = answers[flagId];
      const isYes = v === "yes" || flags[flagId] === true;
      if (!isYes) {
        missing.push({ flag: flagId, weight });
        if (missing.length >= maxItems) break;
      }
    }
    return missing;
  }

  function buildRecommendedNextChecks(topList) {
    const bag = new Map();
    topList.forEach((r) => {
      const def = conditions[r.key];
      if (!def?.scores) return;
      const miss = getMissingEvidence(def.scores, 6);
      miss.forEach(({ flag, weight }) => {
        const prev = bag.get(flag) || 0;
        if (weight > prev) bag.set(flag, weight);
      });
    });
    return [...bag.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([flag]) => flag)
      .filter((id) => actionableIds.has(id)); // only real questions
  }

  function runAssessment({ silent = false } = {}) {
    if (!silent) setResultsStatus("updating");

    const urgentHit = getUrgentReportingHit();

    const redHit = redFlags.find((k) => flags[k] === true);
    if (redHit) {
      setResults({ type: "override", redHit, urgentHit });
      setResultsStatus("ready");
      return;
    }

    const scored = Object.entries(conditions).map(([key, def]) => {
      const excluded = def.excludeIf ? evalClause(def.excludeIf, flags) : false;
      if (excluded) {
        return {
          key,
          excluded: true,
          score: 0,
          threshold: def.threshold,
          confidence: "Ruled out",
          severity: templates[key]?.severity ?? "info",
          missing: [],
        };
      }

      let score = 0;
      for (const [flagId, weight] of Object.entries(def.scores)) {
        if (flags[flagId]) score += weight;
      }

      const passing = score >= def.threshold;
      return {
        key,
        excluded: false,
        score,
        threshold: def.threshold,
        confidence: passing
          ? getConfidenceLabel(score, def.threshold)
          : "Not enough evidence",
        severity: templates[key]?.severity ?? "info",
        missing: getMissingEvidence(def.scores, 4),
      };
    });

    let passing = scored
      .filter((x) => !x.excluded && x.score >= x.threshold)
      .sort((a, b) => {
        const rank = (s) => (s === "alert" ? 2 : s === "warning" ? 1 : 0);
        const dr = rank(b.severity) - rank(a.severity);
        if (dr !== 0) return dr;
        return b.score - a.score;
      });

    const dominanceNotes = [];
    for (const rule of dominance || []) {
      const dom = passing.find((x) => x.key === rule.dominant);
      if (!dom) continue;
      const over = dom.score - dom.threshold;
      if (over >= rule.minOverThreshold) {
        const before = passing.length;
        passing = passing.filter((x) => !rule.suppress.includes(x.key));
        if (passing.length !== before) dominanceNotes.push(rule.note);
      }
    }

    const alerts = passing.filter((x) => x.severity === "alert").slice(0, 2);
    const nonAlerts = passing.filter((x) => x.severity !== "alert");
    const top = [...alerts];
    for (const item of nonAlerts) {
      if (top.length >= 3) break;
      top.push(item);
    }

    const shown = new Set(top.map((x) => x.key));
    const whyNot = scored
      .filter((x) => !shown.has(x.key))
      .sort((a, b) => b.score - b.threshold - (a.score - a.threshold))
      .slice(0, 6);

    const recommendedNext = buildRecommendedNextChecks(top);

    setResults({ type: "normal", top, whyNot, dominanceNotes, recommendedNext, urgentHit });
    setResultsStatus("ready");
  }

  // auto-run results as answers change (debounced)
  useEffect(() => {
    const hasAnyInput =
      !!answers.season ||
      !!answers.colony_strength ||
      !!answers.onset_speed ||
      !!answers.main_concern ||
      Object.values(answers).some(
        (v) =>
          v === "yes" ||
          v === "no" ||
          v === "unknown" ||
          v === true
      );

    if (!hasAnyInput) {
      setResults(null);
      setResultsStatus("idle");
      didFirstAutoRunRef.current = false;
      return;
    }

    if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
    setResultsStatus("updating");

    autoRunTimerRef.current = setTimeout(() => {
      runAssessment({ silent: true });
      didFirstAutoRunRef.current = true;
    }, 350);

    return () => {
      if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, flags]);

  // ---------- Guided controls ----------
  function askNextAuto() {
    if (!computedNextId) return;
    setCurrentId(computedNextId);
    setHighlightId(computedNextId);
    pendingScrollRef.current = computedNextId;
  }

  function pushHistory(id, prevValue) {
    guidedHistoryRef.current.push({ id, prevValue });
    if (guidedHistoryRef.current.length > 200) guidedHistoryRef.current.shift();
  }

  function goBackOne() {
    const last = guidedHistoryRef.current.pop();
    if (!last) return;

    setAnswers((prev) => {
      const next = { ...prev };
      if (last.prevValue === undefined) {
        delete next[last.id];
      } else {
        next[last.id] = last.prevValue;
      }
      return next;
    });

    setCurrentId(last.id);
    setHighlightId(last.id);
    pendingScrollRef.current = last.id;
  }

  function answerCurrent(kind, value) {
    if (!currentId) return;

    const prevValue = answers[currentId];

    if (kind === "select") {
      if (prevValue === value) return;
      pushHistory(currentId, prevValue === "" ? undefined : prevValue);
      setSelect(currentId, value);
    }

    if (kind === "tri") {
      if (prevValue === value) return;
      pushHistory(currentId, prevValue);
      setTri(currentId, value);
    }
  }

  useEffect(() => {
    if (mode !== "guided") return;
    if (!currentId) return;

    const foundationIds = new Set(
      foundationQuestions.filter((q) => q.kind === "select").map((q) => q.id)
    );
    const isFoundation = foundationIds.has(currentId);

    const nowAnswered =
      (isFoundation && !!answers[currentId]) ||
      (!isFoundation && isTri(answers[currentId]));

    if (nowAnswered) {
      const next = computedNextId;
      if (next && next !== currentId) {
        setCurrentId(next);
        setHighlightId(next);
        pendingScrollRef.current = next;
      }
    }
  }, [answers, mode, currentId, computedNextId, foundationQuestions]);

  const currentQuestion = useMemo(() => {
    if (!currentId) return null;

    const f = foundationQuestions.find(
      (q) => q.kind === "select" && q.id === currentId
    );
    if (f) return { kind: "select", q: f };

    const obs = availableObservationQuestions.find((q) => q.id === currentId);
    if (obs) return { kind: "tri", q: obs };

    return null;
  }, [currentId, foundationQuestions, availableObservationQuestions]);

  const allAnswered = !computedNextId;

  const resultsHasAlert =
    results?.type === "normal" &&
    results.top?.some((r) => templates[r.key]?.severity === "alert");
  const hasHornet =
    results?.type === "normal" &&
    results.top?.some((r) => r.key === "asian_hornet");
  const hasSHB =
    results?.type === "normal" &&
    results.top?.some((r) => r.key === "small_hive_beetle");

  const canGoBack = guidedHistoryRef.current.length > 0;

  // Show optional context as soon as the 4 foundation selects are done (so it’s not an “afterthought”)
  const showRecentChanges =
    mode === "guided" &&
    !nextUnansweredFoundation &&
    questions.context?.[3]?.options?.length;

  return (
    <div className="p-6 max-w-5xl">
      {/* Top disclaimer (always visible) */}
      <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
        <div className="font-semibold">Important</div>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            This tool is <b>not a diagnosis</b>. It’s a triage helper to guide what to check next.
          </li>
          <li>
            Use <b>Not sure</b> whenever you haven’t opened the hive or can’t observe something.
          </li>
          <li>
            If you suspect a <b>notifiable disease/pest</b>, avoid moving colonies/equipment and follow official guidance.
          </li>
        </ul>
      </div>

      <header className="mb-5">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="w-full">
            <h1 className="text-3xl font-bold">Bee Health Helper</h1>
            <p className="text-sm text-gray-600 mt-1">
              Guided triage. One question at a time, with an “Expand all” option.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <b>Results update automatically</b> as you answer.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
                title="Clear all answers and start again"
              >
                Reset all
              </button>

              <button
                type="button"
                onClick={() => setMode((m) => (m === "guided" ? "all" : "guided"))}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
                title="Show everything at once (expand all)"
              >
                {mode === "guided" ? "Expand all" : "Guided mode"}
              </button>

              <button
                type="button"
                onClick={jumpToResults}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
                title="Jump down to the results"
              >
                Jump to results
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-600 text-center md:text-right">
              {resultsStatus === "updating"
                ? "Updating results…"
                : resultsStatus === "ready"
                ? "Results ready."
                : ""}
            </div>
          </div>
        </div>
      </header>

      {/* GUIDED MODE */}
      {mode === "guided" && (
        <div className="space-y-4">
          {/* OPTIONAL CONTEXT (moved up + explained) */}
          {showRecentChanges ? (
            <div className="rounded border bg-white p-5">
              <div className="font-semibold text-sm">
                {questions.context[3].label}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Optional — this helps interpret signs. For example, feeding or a queen event can temporarily change
                behaviour/brood patterns and reduce false alarms. You can skip this.
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {questions.context[3].options.map((opt) => (
                  <label key={opt.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!answers[opt.id]}
                      onChange={() => toggleMulti(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">Next question</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goBackOne}
                  disabled={!canGoBack}
                  className={`px-3 py-1.5 rounded text-sm border ${
                    canGoBack ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={askNextAuto}
                  disabled={!computedNextId}
                  className={`px-3 py-1.5 rounded text-sm border ${
                    computedNextId ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  Ask next →
                </button>
              </div>
            </div>

            {!currentQuestion ? (
              <div className="mt-3 text-sm text-gray-700">
                {allAnswered ? (
                  <div className="rounded border border-green-200 bg-green-50 p-4">
                    <div className="font-semibold text-green-900">
                      You’ve answered all relevant questions.
                    </div>
                    <p className="text-sm mt-1 text-green-900">
                      Tap <b>Get results</b> to view the suggested causes and safe next steps. (Results will still update if you change answers.)
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          runAssessment({ silent: false });
                          jumpToResults();
                        }}
                        className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-sm"
                      >
                        Get results
                      </button>
                      <button
                        type="button"
                        onClick={jumpToResults}
                        className="px-4 py-2 rounded bg-white border hover:bg-gray-50 text-sm"
                      >
                        View results ↓
                      </button>
                    </div>
                  </div>
                ) : (
                  "Click “Ask next” to continue."
                )}
              </div>
            ) : currentQuestion.kind === "select" ? (
              <div className="mt-3">
                <SelectCard
                  id={currentQuestion.q.id}
                  label={currentQuestion.q.label}
                  value={answers[currentQuestion.q.id] || ""}
                  options={currentQuestion.q.options}
                  onChange={(v) => answerCurrent("select", v)}
                  highlight={highlightId === currentQuestion.q.id}
                />
              </div>
            ) : (
              <div className="mt-3">
                <TriCard
                  id={currentQuestion.q.id}
                  label={currentQuestion.q.label}
                  value={answers[currentQuestion.q.id]}
                  onChange={(v) => answerCurrent("tri", v)}
                  hint={currentQuestion.q.hint}
                  highlight={highlightId === currentQuestion.q.id}
                />
              </div>
            )}
          </div>

          <div ref={resultsRef}>
            <ResultsPanel
              results={results}
              templates={templates}
              getLabel={getLabel}
              resultsHasAlert={resultsHasAlert}
              hasHornet={hasHornet}
              hasSHB={hasSHB}
              urgentHit={results?.urgentHit}
              onAsk={(id) => {
                setCurrentId(id);
                setHighlightId(id);
                pendingScrollRef.current = id;
              }}
              actionableIds={actionableIds}
            />
          </div>
        </div>
      )}

      {/* EXPAND ALL MODE */}
      {mode === "all" && (
        <div className="space-y-4">
          <div className="rounded border bg-white p-5">
            <h2 className="font-semibold mb-3">Quick triage (don’t skip these)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {foundationQuestions
                .filter((q) => q.kind === "select")
                .map((q) => (
                  <SelectInline
                    key={q.id}
                    id={q.id}
                    label={q.label}
                    value={answers[q.id] || ""}
                    options={q.options}
                    onChange={(v) => setSelect(q.id, v)}
                  />
                ))}
            </div>

            {questions.context?.[3]?.options?.length ? (
              <div className="mt-4">
                <div className="font-semibold text-sm">{questions.context[3].label}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Optional — helps interpret signs (feeding/queen events/treatments can temporarily change behaviour).
                </p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {questions.context[3].options.map((opt) => (
                    <label key={opt.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={!!answers[opt.id]}
                        onChange={() => toggleMulti(opt.id)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {observationGroups.map((g) => (
            <div key={g.key} className="rounded border bg-white p-5">
              <h2 className="font-semibold mb-3">{g.title}</h2>
              <div className="space-y-2">
                {g.list
                  .filter((q) => evalClause(q.showIf, flags))
                  .map((q) => (
                    <TriRow
                      key={q.id}
                      id={q.id}
                      label={q.label}
                      value={answers[q.id]}
                      onChange={(v) => setTri(q.id, v)}
                    />
                  ))}
              </div>
            </div>
          ))}

          <div ref={resultsRef}>
            <ResultsPanel
              results={results}
              templates={templates}
              getLabel={getLabel}
              resultsHasAlert={resultsHasAlert}
              hasHornet={hasHornet}
              hasSHB={hasSHB}
              urgentHit={results?.urgentHit}
              onAsk={(id) => {
                setHighlightId(id);
                const el = document.getElementById(`q-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              actionableIds={actionableIds}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Results ---------------- */

function ResultsPanel({
  results,
  templates,
  getLabel,
  resultsHasAlert,
  hasHornet,
  hasSHB,
  urgentHit,
  onAsk,
  actionableIds,
}) {
  if (!results) {
    return (
      <div className="p-5 rounded border bg-white">
        <div className="font-semibold">Results</div>
        <p className="text-sm text-gray-600 mt-1">
          Start answering questions above and your results will appear here.
        </p>
      </div>
    );
  }

  const recommended = (results.recommendedNext || []).filter((id) => actionableIds?.has(id));

  return (
    <div className="space-y-3">
      <div className="p-4 rounded border bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Results</div>
          <div className="text-xs text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full border bg-gray-50">Live</span>
              <span>Updates as you answer</span>
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          These suggestions help narrow down likely causes. Click a suggested check to jump to that question.
        </p>
      </div>

      {results.type === "override" ? (
        <>
          <OverridePanel reasonLabel={getLabel(results.redHit)} />
          <UKReportingPanel mode="foulbrood" />
        </>
      ) : (
        <>
          {(urgentHit || resultsHasAlert || hasHornet || hasSHB) && (
            <UKReportingPanel
              mode={
                urgentHit?.mode
                  ? urgentHit.mode
                  : hasHornet
                  ? "asian_hornet"
                  : hasSHB
                  ? "shb"
                  : "general_alert"
              }
            />
          )}

          {recommended.length ? (
            <div className="p-4 rounded border bg-white">
              <div className="font-semibold">Recommended next checks (to narrow it down)</div>
              <p className="text-sm text-gray-600 mt-1">
                If you only answer a few more questions, answer these — they’re most likely to change the result.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommended.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onAsk(id)}
                    className="px-3 py-1.5 rounded-full text-sm border bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                  >
                    {getLabel(id)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {results.top?.length ? (
            results.top.map((r) => {
              const t = templates[r.key];
              const sev = t?.severity ?? "info";
              const style =
                sev === "alert"
                  ? "border-red-300 bg-red-50"
                  : sev === "warning"
                  ? "border-amber-300 bg-amber-50"
                  : "border-gray-200 bg-white";

              return (
                <div key={r.key} className={`p-5 rounded border ${style}`}>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold">{t?.title ?? prettyKey(r.key)}</h3>
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold">{r.confidence}</span>
                    </div>
                  </div>

                  {t?.note ? (
                    <p className="mt-2 text-sm text-gray-700">
                      <b>Note:</b> {t.note}
                    </p>
                  ) : null}

                  {t?.why?.length ? (
                    <>
                      <div className="mt-3 font-semibold text-sm">Why this was suggested</div>
                      <ul className="list-disc pl-5 text-sm mt-1 space-y-1 text-gray-800">
                        {t.why.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {r.missing?.length ? (
                    <>
                      <div className="mt-3 font-semibold text-sm">To confirm or rule this out, check:</div>
                      <ul className="list-disc pl-5 text-sm mt-1 space-y-1 text-gray-800">
                        {r.missing
                          .map((m) => m.flag)
                          .filter((id) => actionableIds?.has(id))
                          .map((id) => (
                            <li key={id}>
                              <button
                                type="button"
                                onClick={() => onAsk(id)}
                                className="inline-flex items-center gap-2"
                                title="Jump to this question"
                              >
                                <span className="underline hover:no-underline">{getLabel(id)}</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-white">
                                  Jump
                                </span>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : null}

                  {t?.steps?.length ? (
                    <>
                      <div className="mt-3 font-semibold text-sm">Safe next steps</div>
                      <ul className="list-disc pl-5 text-sm mt-1 space-y-1 text-gray-800">
                        {t.steps.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="p-5 rounded border bg-green-50 border-green-300">
              <h3 className="font-semibold">No clear issue identified</h3>
              <p className="text-sm text-gray-700 mt-1">
                Answer more questions (or use “Not sure”) and results will update automatically if symptoms change.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Guided cards ---------------- */

function SelectCard({ id, label, value, options, onChange, highlight }) {
  return (
    <div
      id={`q-${id}`}
      className={`rounded border p-4 ${
        highlight ? "ring-2 ring-yellow-400 bg-yellow-50" : "bg-white"
      }`}
    >
      <div className="font-semibold">{label}</div>
      <select
        className="mt-3 w-full border rounded px-3 py-2"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-gray-600">
        Tip: This changes which questions come next — it doesn’t “diagnose” anything.
      </p>
    </div>
  );
}

function TriCard({ id, label, value, onChange, hint, highlight }) {
  return (
    <div
      id={`q-${id}`}
      className={`rounded border p-4 ${
        highlight ? "ring-2 ring-yellow-400 bg-yellow-50" : "bg-white"
      }`}
    >
      <div className="font-semibold">{label}</div>
      {hint ? <div className="text-xs text-gray-600 mt-1">{hint}</div> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <TriButton active={value === "yes"} onClick={() => onChange("yes")}>
          Yes
        </TriButton>
        <TriButton active={value === "no"} onClick={() => onChange("no")}>
          No
        </TriButton>
        <TriButton active={value === "unknown"} onClick={() => onChange("unknown")}>
          Not sure
        </TriButton>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        “Not sure” is normal — e.g. hefting only, bad weather, or you haven’t opened the hive.
      </p>
    </div>
  );
}

function TriButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded border text-sm transition ${
        active ? "bg-yellow-500 border-yellow-500 text-black" : "bg-white hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- Expand all controls ---------------- */

function SelectInline({ id, label, value, options, onChange }) {
  return (
    <label className="text-sm" id={`q-${id}`}>
      <div className="font-medium mb-1">{label}</div>
      <select
        className="w-full border rounded px-3 py-2"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TriRow({ id, label, value, onChange }) {
  return (
    <div
      id={`q-${id}`}
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 rounded hover:bg-gray-50"
    >
      <div className="flex-1 text-sm">{label}</div>
      <div className="flex gap-2">
        <SmallTri active={value === "yes"} onClick={() => onChange("yes")}>
          Yes
        </SmallTri>
        <SmallTri active={value === "no"} onClick={() => onChange("no")}>
          No
        </SmallTri>
        <SmallTri active={value === "unknown"} onClick={() => onChange("unknown")}>
          Not sure
        </SmallTri>
      </div>
    </div>
  );
}

function SmallTri({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded border text-xs transition ${
        active ? "bg-yellow-500 border-yellow-500 text-black" : "bg-white hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- UK alert panels ---------------- */

function OverridePanel({ reasonLabel }) {
  return (
    <div className="p-5 rounded border border-red-400 bg-red-50">
      <h3 className="font-bold text-red-800 text-lg">Important — immediate action required</h3>
      <p className="mt-2 text-sm text-red-900">
        You selected a red-flag sign: <b>{reasonLabel}</b>.
      </p>
      <p className="mt-3 text-sm text-red-900">
        These signs can be consistent with a <b>notifiable</b> honey bee disease. This tool cannot confirm a diagnosis.
        Do not apply treatments or move equipment until assessed.
      </p>
      <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-red-900">
        <li>Do not move frames, bees, or equipment off site</li>
        <li>Do not combine this colony with others</li>
        <li>Avoid unnecessary disturbance</li>
      </ul>
    </div>
  );
}

function UKReportingPanel({ mode = "general_alert" }) {
  const links = {
    beeHealth: "https://www.gov.uk/guidance/bee-health",
    foulbrood: "https://www.nationalbeeunit.com/diseases-and-pests/foulbroods-notifiable",
    nbuContact: "https://www.nationalbeeunit.com/contact-us",
    asianHornetApp: "https://www.gov.uk/government/news/new-app-to-report-asian-hornet-sightings",
    shb: "https://www.nationalbeeunit.com/diseases-and-pests/exotic-pests/small-hive-beetle",
  };

  const title =
    mode === "foulbrood"
      ? "UK action: suspected foulbrood (notifiable)"
      : mode === "asian_hornet"
      ? "UK action: Asian hornet reporting"
      : mode === "shb"
      ? "UK action: small hive beetle (notifiable pest)"
      : "UK action: reporting / official advice";

  const bullets =
    mode === "foulbrood"
      ? [
          "Do not move colonies, frames, or equipment off site.",
          "Do not apply treatments as a substitute for inspection/confirmation.",
          "Contact the National Bee Unit / local bee inspector for assessment.",
        ]
      : mode === "asian_hornet"
      ? [
          "Do not attempt to destroy nests yourself.",
          "Report sightings promptly using the official reporting routes (app is encouraged).",
          "If possible, safely take a photo for identification.",
        ]
      : mode === "shb"
      ? [
          "Do not move colonies, frames, or equipment off site.",
          "Treat as urgent: this is a statutory notifiable pest.",
          "Contact the National Bee Unit immediately for advice and next steps.",
        ]
      : [
          "If you suspect a notifiable pest/disease, avoid moving equipment off site.",
          "Use official guidance and contact routes for advice/inspection.",
        ];

  const linkItems =
    mode === "foulbrood"
      ? [
          ["National Bee Unit – foulbroods", links.foulbrood],
          ["National Bee Unit – contact details", links.nbuContact],
        ]
      : mode === "asian_hornet"
      ? [
          ["GOV.UK – Asian Hornet Watch app", links.asianHornetApp],
          ["GOV.UK – bee health", links.beeHealth],
        ]
      : mode === "shb"
      ? [
          ["National Bee Unit – small hive beetle", links.shb],
          ["GOV.UK – bee health", links.beeHealth],
          ["National Bee Unit – contact details", links.nbuContact],
        ]
      : [
          ["GOV.UK – bee health", links.beeHealth],
          ["National Bee Unit – contact details", links.nbuContact],
        ];

  return (
    <div className="p-4 rounded border bg-red-50 border-red-200">
      <div className="font-semibold text-red-900">{title}</div>
      <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-red-900">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <div className="mt-3 text-sm text-red-900">
        <div className="font-semibold">Official links</div>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          {linkItems.map(([label, href]) => (
            <li key={href}>
              <a className="underline" href={href} target="_blank" rel="noreferrer">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- misc ---------------- */

function prettyKey(k) {
  return String(k || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
