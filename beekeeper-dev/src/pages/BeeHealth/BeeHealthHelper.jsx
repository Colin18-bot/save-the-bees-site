// src/pages/BeeHealth/BeeHealthHelper.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BEE_HEALTH_RULES } from "../../utils/BeeHealthRules";

/**
 * Route-based triage:
 * - One question at a time (guided)
 * - Yes / No / Not sure for tri
 * - Expand all for power users
 * - Manual "Get results" appears ONLY when relevant questions are complete
 *
 * Flags:
 * - tri: <id>_yes / <id>_no / <id>_unknown
 * - select: <id>_<value>  (e.g. season_summer, qb_population_change_dropped_a_lot)
 * - multi: <id> === true  (e.g. recent_move)
 */

export default function BeeHealthHelper() {
  const { questions, outcomes, redFlags, urgentReporting, confidence } = BEE_HEALTH_RULES;

  const initialState = useMemo(
    () => ({
      primary_route: "",
      inspection_level: "",
      season: "",
      onset_speed: "",
      colony_strength: "",
      // multi + tri are added dynamically
      // guided-only: we store optional multi completion as __done_<questionId>
    }),
    []
  );

  const [answers, setAnswers] = useState(initialState);
  const [mode, setMode] = useState("guided"); // guided | all
  const [results, setResults] = useState(null);

  // Optional debug
  const [showDebug, setShowDebug] = useState(false);

  // Guided state
  const [currentId, setCurrentId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const pendingScrollRef = useRef(null);
  const guidedHistoryRef = useRef([]);

  const isTri = (v) => v === "yes" || v === "no" || v === "unknown";

  const setSelect = (id, value) => setAnswers((p) => ({ ...p, [id]: value }));
  const setTri = (id, value) => setAnswers((p) => ({ ...p, [id]: value }));
  const toggleMulti = (id) => setAnswers((p) => ({ ...p, [id]: !p[id] }));

  function resetAll() {
    setAnswers(initialState);
    setResults(null);
    setCurrentId(null);
    setHighlightId(null);
    pendingScrollRef.current = null;
    guidedHistoryRef.current = [];
    setMode("guided");
  }

  // Clause evaluator for showIf/when blocks
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

  // -------- flags (engine) --------
  const flags = useMemo(() => {
    const f = {};

    Object.entries(answers).forEach(([k, v]) => {
      // select -> flags like season_summer
      if (typeof v === "string" && v && !isTri(v)) {
        f[`${k}_${v}`] = true;
      }

      // boolean -> multi flags (and also our __done_* markers)
      if (typeof v === "boolean") {
        f[k] = v;
      }

      // tri -> flags like qb_eggs_seen_no
      if (isTri(v)) {
        f[`${k}_${v}`] = true;
        if (v === "yes") f[k] = true; // convenience yes-flag
      }
    });

    // Route flags
    if (answers.primary_route) f[answers.primary_route] = true;

    // Inspection gating
    f.opened_frames_ok =
      answers.inspection_level === "opened_quick" || answers.inspection_level === "full_inspection";

    // Helper used by normalizeWhen()
    f.season_winter_or_early_spring = ["season_winter", "season_early_spring"].some((k) => f[k] === true);

    return f;
  }, [answers]);

  // ----- build question list for this run -----
  // ✅ memoised so it doesn't create a new [] every render (fixes lint warning)
  const foundation = useMemo(() => questions?.foundation || [], [questions]);

  const routeKey = useMemo(() => {
    const r = answers.primary_route;
    if (!r) return null;

    const map = {
      route_entrance_activity: "entrance_activity",
      route_queen_brood: "queen_brood",
      route_dead_dying: "dead_dying",
      route_feeding_stores: "feeding_stores",
      route_comb_building: "comb_building",
      route_pests_predators: "pests_predators",
      route_brood_disease: "brood_disease",
      route_temperament: "temperament",
      // unsure starts with entrance-ish
      route_unsure: "entrance_activity",
    };

    return map[r] || null;
  }, [answers.primary_route]);

  const routeQuestions = useMemo(() => {
    if (!routeKey) return [];
    const bank = questions?.[routeKey] || [];
    return bank.filter((q) => evalClause(q.showIf, flags));
  }, [routeKey, questions, flags]);

  const allQuestionsInOrder = useMemo(() => {
    return [...foundation, ...routeQuestions].filter(Boolean);
  }, [foundation, routeQuestions]);

  // Map question id -> label (for nicer "next checks" buttons)
  const qLabelById = useMemo(() => {
    const m = new Map();
    for (const q of allQuestionsInOrder) {
      if (q?.id) m.set(q.id, q.label || q.id);
    }
    return m;
  }, [allQuestionsInOrder]);

  // ---------- guided optional multi handling ----------
  // ✅ stable function + included where used (fixes missing-deps warnings)
  const isMultiDone = useCallback((qid) => !!answers[`__done_${qid}`], [answers]);

  const markMultiDone = (qid) => {
    setAnswers((p) => ({ ...p, [`__done_${qid}`]: true }));
  };

  const clearMultiDone = (qid) => {
    setAnswers((p) => {
      const next = { ...p };
      delete next[`__done_${qid}`];
      return next;
    });
  };

  const isMultiEmpty = (q) => {
    const opts = q?.options || [];
    if (!opts.length) return true;
    return opts.every((opt) => !answers[opt.id]);
  };

  // ----- next unanswered -----
  // Required: select + tri first. Then (guided only) offer multi questions once (optional).
  const computedNextId = useMemo(() => {
    // 1) required questions
    for (const q of allQuestionsInOrder) {
      if (q.kind === "select") {
        if (!answers[q.id]) return q.id;
      } else if (q.kind === "tri") {
        if (!isTri(answers[q.id])) return q.id;
      }
    }

    // 2) optional multi (guided only)
    if (mode === "guided") {
      for (const q of allQuestionsInOrder) {
        if (q.kind !== "multi") continue;
        if (isMultiDone(q.id)) continue;
        // show it once even if empty (user can Skip)
        return q.id;
      }
    }

    return null;
  }, [allQuestionsInOrder, answers, mode, isMultiDone]);

  const allAnswered = !computedNextId;

  // Set first question
  useEffect(() => {
    if (mode !== "guided") return;
    if (!currentId && computedNextId) setCurrentId(computedNextId);
  }, [mode, currentId, computedNextId]);

  // Scroll to pending (works in BOTH guided + all because highlightId changes on jump)
  useEffect(() => {
    const id = pendingScrollRef.current;
    if (!id) return;

    const t = setTimeout(() => {
      const el = document.getElementById(`q-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      pendingScrollRef.current = null;
    }, 50);

    return () => clearTimeout(t);
  }, [mode, currentId, highlightId]);

  // Highlight fade
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 1800);
    return () => clearTimeout(t);
  }, [highlightId]);

  // Find current question object
  const currentQuestion = useMemo(() => {
    if (!currentId) return null;
    return allQuestionsInOrder.find((q) => q.id === currentId) || null;
  }, [currentId, allQuestionsInOrder]);

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
      if (last.prevValue === undefined) delete next[last.id];
      else next[last.id] = last.prevValue;
      return next;
    });

    // If we go back to a multi question, clear its done marker so it can be shown again properly
    if (String(last.id || "").startsWith("__done_")) {
      const qid = String(last.id).replace("__done_", "");
      clearMultiDone(qid);
    }

    setCurrentId(
      String(last.id || "").startsWith("__done_") ? String(last.id).replace("__done_", "") : last.id
    );
    setHighlightId(
      String(last.id || "").startsWith("__done_") ? String(last.id).replace("__done_", "") : last.id
    );
    pendingScrollRef.current = String(last.id || "").startsWith("__done_")
      ? String(last.id).replace("__done_", "")
      : last.id;

    setResults(null);
  }

  function answerCurrent(value) {
    if (!currentId) return;
    const q = currentQuestion;
    if (!q) return;

    const prevValue = answers[currentId];

    if (q.kind === "select") {
      if (prevValue === value) return;
      pushHistory(currentId, prevValue || undefined);
      setSelect(currentId, value);
    } else if (q.kind === "tri") {
      if (prevValue === value) return;
      pushHistory(currentId, prevValue);
      setTri(currentId, value);
    }

    setResults(null);
  }

  function toggleMultiInGuided(optId) {
    const prevValue = answers[optId];
    pushHistory(optId, prevValue);
    toggleMulti(optId);
    setResults(null);
  }

  function skipMultiInGuided(qid) {
    const key = `__done_${qid}`;
    const prevValue = answers[key];
    pushHistory(key, prevValue);
    markMultiDone(qid);
    setResults(null);
  }

  // Auto-advance when answered
  useEffect(() => {
    if (mode !== "guided") return;
    if (!currentId) return;

    const q = currentQuestion;
    if (!q) return;

    const nowAnswered =
      (q.kind === "select" && !!answers[currentId]) ||
      (q.kind === "tri" && isTri(answers[currentId])) ||
      (q.kind === "multi" && isMultiDone(q.id)); // ✅ uses stable callback

    if (nowAnswered) {
      const next = computedNextId;
      if (next && next !== currentId) {
        setCurrentId(next);
        setHighlightId(next);
        pendingScrollRef.current = next;
      }
    }
  }, [answers, mode, currentId, computedNextId, currentQuestion, isMultiDone]);

  // --- JUMP TO QUESTION (used by results) ---
  function jumpToQuestion(id) {
    if (!id) return;
    const exists = allQuestionsInOrder.some((q) => q.id === id);
    if (!exists) return;

    // In guided mode, bring it into focus as the “current” question
    if (mode === "guided") {
      setCurrentId(id);
      setHighlightId(id);
      pendingScrollRef.current = id;
    } else {
      // In expand-all mode, just scroll & highlight
      setHighlightId(id);
      pendingScrollRef.current = id;
    }
  }

  // --- urgent hit ---
  function getUrgentHit() {
    for (const rule of urgentReporting || []) {
      const any = rule.any || [];
      const all = rule.all || [];
      const not = rule.not || [];

      const anyOk = any.length ? any.some((k) => flags[k] === true) : false;
      const allOk = all.length ? all.every((k) => flags[k] === true) : true;
      const notOk = not.length ? not.every((k) => flags[k] !== true) : true;

      if (anyOk && allOk && notOk) return rule;
    }
    return null;
  }

  // --- confidence helpers ---
  function confidenceLabelFromScore(score, threshold) {
    // Default to BeeHealthRules.js config: veryLikely/likely/possible
    const cfg = confidence || {
      veryLikely: { label: "Very likely", minOver: 3 },
      likely: { label: "Likely", minOver: 1 },
      possible: { label: "Possible", minOver: 0 },
    };

    const over = score - threshold;
    if (over >= (cfg.veryLikely?.minOver ?? 3)) return cfg.veryLikely?.label ?? "Very likely";
    if (over >= (cfg.likely?.minOver ?? 1)) return cfg.likely?.label ?? "Likely";
    return cfg.possible?.label ?? "Possible";
  }

  function normalizeWhen(whenObj) {
    const out = { ...(whenObj || {}) };

    // allow any2 as convenience OR list (legacy)
    if (out.any2) {
      out.any = [...(out.any || []), ...(Array.isArray(out.any2) ? out.any2 : [])];
      delete out.any2;
    }

    // expand the winter/early-spring helper if present
    if ((out.any || []).includes("season_winter_or_early_spring")) {
      out.any = (out.any || [])
        .filter((x) => x !== "season_winter_or_early_spring")
        .concat(["season_winter", "season_early_spring"]);
    }

    return out;
  }

  function ruleScore(whenObj) {
    const when = normalizeWhen(whenObj);
    const all = when.all || [];
    const any = when.any || [];

    let score = 0;

    for (const k of all) if (flags[k] === true) score += 2;

    const anyMatched = any.filter((k) => flags[k] === true);
    if (any.length) {
      if (anyMatched.length > 0) score += 2;
      score += anyMatched.length;
    }

    const threshold = all.length * 2 + (any.length ? 2 : 0);
    return { score, threshold };
  }

  // -- run outcomes --
  function runAssessment() {
    const urgentHit = getUrgentHit();

    // Hard red-flag override
    const redHit = (redFlags || []).find((k) => flags[k] === true);
    if (redHit) {
      setResults({
        type: "override",
        redHit,
        urgentHit,
        top: [],
        nextChecks: [],
      });
      return;
    }

    const matched = [];

    for (const [key, def] of Object.entries(outcomes || {})) {
      const when = normalizeWhen(def.when || {});
      const ok = evalClause({ all: when.all || [], any: when.any || [], not: when.not || [] }, flags);
      if (!ok) continue;

      // excludeIf: if it matches => skip
      if (def.excludeIf && evalClause(def.excludeIf, flags)) continue;

      const { score, threshold } = ruleScore(def.when || {});
      const confidenceText = def.confidenceHint || confidenceLabelFromScore(score, threshold);

      const rawNext = def.nextChecks || def.followUp || def.checks || [];
      const nextChecks = Array.isArray(rawNext) ? rawNext : [];

      matched.push({
        key,
        title: def.title,
        severity: def.severity || "info",
        urgency: def.urgency || "normal",
        confidence: confidenceText,
        why: def.why || [],
        actions: def.actions || [],
        whenToWorry: def.whenToWorry || [],
        nextChecks,
      });
    }

    const sevRank = (s) => (s === "alert" ? 3 : s === "warning" ? 2 : 1);
    const confRank = (c) =>
      String(c).toLowerCase().includes("very") ? 3 : String(c).toLowerCase().includes("likely") ? 2 : 1;

    matched.sort((a, b) => {
      const d1 = sevRank(b.severity) - sevRank(a.severity);
      if (d1 !== 0) return d1;
      const d2 = confRank(b.confidence) - confRank(a.confidence);
      if (d2 !== 0) return d2;
      return a.key.localeCompare(b.key);
    });

    const top = matched.slice(0, 5);

    // Build recommended next checks:
    const validQIds = new Set(allQuestionsInOrder.map((q) => q.id));
    const nextChecks = [];
    const seen = new Set();

    for (const r of top) {
      for (const id of r.nextChecks || []) {
        if (!id) continue;
        if (!validQIds.has(id)) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        nextChecks.push(id);
      }
    }

    setResults({
      type: "normal",
      urgentHit,
      top,
      nextChecks,
    });
  }

  const canGoBack = guidedHistoryRef.current.length > 0;

  // ---------------- UI ----------------
  return (
    <div className="p-6 max-w-5xl">
      {/* Print rules */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          #beehealth-print { padding: 0 !important; max-width: none !important; }
          .print-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {/* TOP DISCLAIMER */}
      <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800 no-print">
        <div className="font-semibold">Important</div>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            This tool is <b>not a diagnosis</b>. It’s a triage helper to guide what to check next.
          </li>
          <li>
            Use <b>Not sure</b> whenever you haven’t opened the hive or can’t observe something reliably.
          </li>
          <li>
            If you suspect a <b>notifiable disease/pest</b>, avoid moving colonies/equipment and follow official guidance.
          </li>
        </ul>
      </div>

      {/* HOW IT WORKS (public explainer) */}
      <div className="mb-5 rounded border bg-white p-4 text-sm text-gray-800 no-print">
        <details>
          <summary className="cursor-pointer font-semibold">How this checker works (read first)</summary>

          <div className="mt-3 space-y-3 text-gray-700">
            <p>
              This tool is a <b>triage helper</b>. It doesn’t diagnose — it helps you narrow down what to check next.
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Step 1:</b> Pick what you’re mainly seeing (this chooses the best question path).
              </li>
              <li>
                <b>Step 2:</b> Answer what you can. Use <b>Not sure</b> whenever you can’t confirm.
              </li>
              <li>
                <b>Step 3:</b> You’ll get <b>most likely</b> outcomes with “What to do now” + “When to worry”.
              </li>
            </ul>

            <p>
              Some signs overlap. That’s why you may see more than one possible outcome. If a{" "}
              <b>notifiable disease/pest</b> is suspected, the checker will tell you to stop and follow official guidance.
            </p>

            <p className="text-xs text-gray-600">
              Tip: If you haven’t opened the hive, choose “Entrance only” — the checker will avoid brood-frame questions.
            </p>
          </div>
        </details>
      </div>

      <header className="mb-5 no-print">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="w-full">
            <h1 className="text-3xl font-bold">Colony Health Check</h1>
            <p className="text-sm text-gray-600 mt-1">
              One question at a time. Expand all if you prefer.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
              >
                Reset all
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode((m) => (m === "guided" ? "all" : "guided"));
                  // If switching to guided and we haven't started, kick off the first question
                  setResults(null);
                  if (mode === "all" && !currentId && computedNextId) {
                    setCurrentId(computedNextId);
                    setHighlightId(computedNextId);
                    pendingScrollRef.current = computedNextId;
                  }
                }}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
              >
                {mode === "guided" ? "Expand all" : "Guided mode"}
              </button>

              <button
                type="button"
                onClick={() => setShowDebug((v) => !v)}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
              >
                {showDebug ? "Hide debug" : "Show debug"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PRINT HEADER */}
      <div className="print-only hidden" id="beehealth-print">
        <div className="mb-3">
          <div className="text-2xl font-bold">BeezKnees — Colony Health Check</div>
          <div className="text-sm text-gray-700">
            Printed guidance (triage only — not a diagnosis). If notifiable disease is suspected, do not move
            bees/equipment and contact official routes.
          </div>
        </div>
      </div>

      {showDebug ? (
        <div className="no-print mb-4 rounded border bg-white p-4 text-xs">
          <div className="font-semibold mb-2">Debug</div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="font-semibold">answers</div>
              <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(answers, null, 2)}</pre>
            </div>
            <div>
              <div className="font-semibold">flags</div>
              <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(flags, null, 2)}</pre>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "guided" ? (
        <div className="space-y-4">
          <div className="rounded border bg-white p-5 no-print">
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
              <div className="mt-4 text-sm text-gray-600">
                {allAnswered ? (
                  <CompletionBanner hasResults={!!results} onGetResults={runAssessment} />
                ) : (
                  "Click “Ask next” to start."
                )}
              </div>
            ) : currentQuestion.kind === "select" ? (
              <div className="mt-3">
                <SelectCard
                  id={currentQuestion.id}
                  label={currentQuestion.label}
                  help={currentQuestion.help}
                  value={answers[currentQuestion.id] || ""}
                  options={currentQuestion.options}
                  onChange={(v) => answerCurrent(v)}
                  highlight={highlightId === currentQuestion.id}
                />
              </div>
            ) : currentQuestion.kind === "tri" ? (
              <div className="mt-3">
                <TriCard
                  id={currentQuestion.id}
                  label={currentQuestion.label}
                  help={currentQuestion.help}
                  value={answers[currentQuestion.id]}
                  onChange={(v) => answerCurrent(v)}
                  highlight={highlightId === currentQuestion.id}
                />
              </div>
            ) : currentQuestion.kind === "multi" ? (
              <div className="mt-3" id={`q-${currentQuestion.id}`}>
                <MultiCard
                  label={currentQuestion.label}
                  help={currentQuestion.help}
                  options={currentQuestion.options}
                  answers={answers}
                  onToggle={(optId) => toggleMultiInGuided(optId)}
                />

                {/* Guided-only controls for optional multi */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-gray-600">
                    Optional: tick anything that applies, or skip.
                  </div>

                  <div className="flex gap-2">
                    {!isMultiEmpty(currentQuestion) ? (
                      <button
                        type="button"
                        onClick={() => {
                          // mark done once user has interacted (ticked something)
                          if (!isMultiDone(currentQuestion.id)) {
                            const key = `__done_${currentQuestion.id}`;
                            pushHistory(key, answers[key]);
                            markMultiDone(currentQuestion.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded border text-sm bg-white hover:bg-gray-50"
                      >
                        Continue →
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => skipMultiInGuided(currentQuestion.id)}
                      className="px-3 py-1.5 rounded border text-sm bg-white hover:bg-gray-50"
                    >
                      Skip →
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {allAnswered ? (
              <div className="mt-4">
                <CompletionBanner hasResults={!!results} onGetResults={runAssessment} />
              </div>
            ) : null}
          </div>

          <ResultsPanel
            results={results}
            onPrint={() => window.print()}
            onJump={jumpToQuestion}
            qLabelById={qLabelById}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded border bg-white p-5 no-print">
            <h2 className="font-semibold mb-3">All questions</h2>

            <div className="space-y-4">
              {allQuestionsInOrder.map((q) => {
                if (q.kind === "select") {
                  return (
                    <div key={q.id}>
                      <SelectCard
                        id={q.id}
                        label={q.label}
                        help={q.help}
                        value={answers[q.id] || ""}
                        options={q.options}
                        onChange={(v) => {
                          setSelect(q.id, v);
                          setResults(null);
                        }}
                        highlight={highlightId === q.id}
                      />
                    </div>
                  );
                }
                if (q.kind === "tri") {
                  return (
                    <div key={q.id}>
                      <TriCard
                        id={q.id}
                        label={q.label}
                        help={q.help}
                        value={answers[q.id]}
                        onChange={(v) => {
                          setTri(q.id, v);
                          setResults(null);
                        }}
                        highlight={highlightId === q.id}
                      />
                    </div>
                  );
                }
                if (q.kind === "multi") {
                  return (
                    <div key={q.id}>
                      <MultiCard
                        label={q.label}
                        help={q.help}
                        options={q.options}
                        answers={answers}
                        onToggle={(optId) => {
                          toggleMulti(optId);
                          setResults(null);
                        }}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={runAssessment}
                className="px-5 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-sm"
              >
                Get results
              </button>
              <div className="text-sm text-gray-600">
                If you change answers, click <b>Get results</b> again.
              </div>
            </div>
          </div>

          <ResultsPanel
            results={results}
            onPrint={() => window.print()}
            onJump={jumpToQuestion}
            qLabelById={qLabelById}
          />
        </div>
      )}
    </div>
  );
}

/* ---------------- Completion banner ---------------- */

function CompletionBanner({ hasResults, onGetResults }) {
  return (
    <div className="rounded border border-green-300 bg-green-50 p-4">
      <div className="text-lg font-bold text-green-900">Results ready</div>
      <p className="text-sm mt-1 text-green-900">
        {hasResults
          ? "You’ve already generated results. If you change any answers, click Get results again."
          : "You’ve answered all relevant questions. Click Get results to see guidance below."}
      </p>
      <div className="mt-3">
        <button
          type="button"
          onClick={onGetResults}
          className="px-5 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-sm"
        >
          Get results
        </button>
      </div>
    </div>
  );
}

/* ---------------- Cards ---------------- */

function SelectCard({ id, label, help, value, options, onChange, highlight }) {
  return (
    <div
      id={`q-${id}`}
      className={`rounded border p-4 ${highlight ? "ring-2 ring-yellow-400 bg-yellow-50" : "bg-white"}`}
    >
      <div className="font-semibold">{label}</div>
      {help ? <div className="text-xs text-gray-600 mt-1">{help}</div> : null}

      <select className="mt-3 w-full border rounded px-3 py-2" value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TriCard({ id, label, help, value, onChange, highlight }) {
  return (
    <div
      id={`q-${id}`}
      className={`rounded border p-4 ${highlight ? "ring-2 ring-yellow-400 bg-yellow-50" : "bg-white"}`}
    >
      <div className="font-semibold">{label}</div>
      {help ? <div className="text-xs text-gray-600 mt-1">{help}</div> : null}

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

function MultiCard({ label, help, options, answers, onToggle }) {
  return (
    <div className="rounded border p-4 bg-gray-50">
      <div className="font-semibold">{label}</div>
      {help ? <div className="text-xs text-gray-600 mt-1">{help}</div> : null}

      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {options?.map((opt) => (
          <label key={opt.id} className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={!!answers[opt.id]} onChange={() => onToggle(opt.id)} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Results ---------------- */

function ResultsPanel({ results, onPrint, onJump, qLabelById }) {
  const InspectorSafeDisclaimer = () => (
    <div className="p-4 rounded border bg-white print-card">
      <div className="font-semibold">Safety / inspector-safe notes</div>
      <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-gray-800">
        <li>This is guidance only — it does not diagnose disease.</li>
        <li>
          If notifiable disease/pest is suspected: <b>do not move</b> colonies, frames, bees, or equipment off site.
        </li>
        <li>Avoid combining colonies or swapping frames until you understand what’s happening.</li>
        <li>If severe or uncertain, get help from your association, mentor, or official routes.</li>
      </ul>
    </div>
  );

  if (!results) {
    return (
      <div className="p-5 rounded border bg-white print-card">
        <div className="font-semibold">Results</div>
        <p className="text-sm text-gray-600 mt-1">
          Answer questions above, then click <b>Get results</b>.
        </p>
      </div>
    );
  }

  if (results.type === "override") {
    return (
      <div className="space-y-3">
        <div className="p-5 rounded border border-red-400 bg-red-50 print-card">
          <h3 className="font-bold text-red-800 text-lg">Important — immediate action required</h3>
          <p className="mt-2 text-sm text-red-900">
            A red-flag sign was selected. This can be consistent with a <b>notifiable</b> brood disease.
            <b> Do not move</b> colonies or equipment off site.
          </p>
        </div>

        <InspectorSafeDisclaimer />

        <div className="no-print">
          <button type="button" onClick={onPrint} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 text-sm">
            Print results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-4 rounded border bg-white no-print print-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">Results</div>
            <p className="text-sm text-gray-600 mt-1">These are guidance suggestions based on your answers.</p>
          </div>

          <button type="button" onClick={onPrint} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 text-sm">
            Print results
          </button>
        </div>
      </div>

      <InspectorSafeDisclaimer />

      {results.nextChecks?.length ? (
        <div className="p-5 rounded border bg-white print-card no-print">
          <div className="font-semibold">Recommended next checks</div>
          <div className="text-sm text-gray-600 mt-1">Click one to jump to that question.</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {results.nextChecks.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onJump?.(id)}
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm"
              >
                {qLabelById?.get(id) || id}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {results.top?.length ? (
        results.top.map((r) => {
          const style =
            r.severity === "alert"
              ? "border-red-300 bg-red-50"
              : r.severity === "warning"
              ? "border-amber-300 bg-amber-50"
              : "border-gray-200 bg-white";

          return (
            <div key={r.key} className={`p-5 rounded border ${style} print-card`}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold">{r.title}</h3>
                <div className="text-xs text-gray-700 text-right">
                  <div className="font-semibold">{r.urgency}</div>
                  <div className="mt-0.5">{r.confidence}</div>
                </div>
              </div>

              {r.why?.length ? (
                <>
                  <div className="mt-3 font-semibold text-sm">Why</div>
                  <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                    {r.why.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {r.actions?.length ? (
                <>
                  <div className="mt-3 font-semibold text-sm">What to do now</div>
                  <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                    {r.actions.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {r.whenToWorry?.length ? (
                <>
                  <div className="mt-3 font-semibold text-sm">When to worry / get help</div>
                  <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                    {r.whenToWorry.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="p-5 rounded border bg-green-50 border-green-300 print-card">
          <h3 className="font-semibold">No clear issue identified</h3>
          <p className="text-sm mt-1">Try switching your route at the top or adding more observations.</p>
        </div>
      )}
    </div>
  );
}
