import { isValidTriplet } from "./deps.js";

/**
 * Output contract (the app's normalizer expects these keys):
 * {
 *   "title": string,            // MUST include FIELD1 + FIELD2 + FIELD3 tokens
 *   "objective": string,        // concise, 1 sentence
 *   "est_time_min": number,     // integer minutes
 *   "difficulty": "Easy" | "Moderate" | "Hard",
 *   "instructions": [string, ...] // 3–6 short, numbered-feel lines
 * }
 *
 * HARD RULES TO FORCE DIVERSITY:
 * - Title MUST contain all three: FIELD1, FIELD2, FIELD3 (verbatim tokens).
 * - Pick FORMATS that are category-specific (e.g., EMOM/AMRAP vs intervals vs drills).
 * - Use the provided variation_key to break ties (e.g., to choose rep/pace branches).
 * - Never return generic text; always include concrete volumes, loads, or timings.
 */

function baseSystem(prefix, rules) {
  return [
    `${prefix}`,
    ``,
    `Only respond with strict JSON (no prose) matching this shape:`,
    `{ "title": str, "objective": str, "est_time_min": int, "difficulty": "Easy"|"Moderate"|"Hard", "instructions": [str, ...] }`,
    ``,
    `Required diversity enforcers:`,
    `- The "title" MUST literally include the tokens FIELD1, FIELD2, and FIELD3 somewhere in the title text.`,
    `- Choose structures and parameters that differ strongly by category.`,
    `- Use "variation_key" to branch choices (e.g., pick set/rep or interval templates based on its numeric digest).`,
    ``,
    `Category-specific rules:`,
    `${rules}`,
    ``,
    `Quality rules:`,
    `- Be short, measurable, and actionable.`,
    `- Avoid fluff. No coaching paragraphs.`,
    `- est_time_min must be realistic for the plan.`,
    `- instructions length 3–6.`,
  ].join("\n");
}

export const PROMPTS_BY_FIELD1 = {
  weightlifting: {
    system: baseSystem(
      "You are a strength coach specializing in barbell/dumbbell programming.",
      [
        "- Prioritize compounds tied to FIELD2 (primary) and FIELD3 (secondary).",
        "- Use classic strength templates: 5x5, 4x6–8, 3x10–12, wave loading, or EMOM barbell complexes.",
        "- Specify exact loads as % of 1RM OR RPE targets (e.g., RPE 7–8) if %1RM unknown.",
        "- Rest periods explicit (e.g., 120s on compounds, 60–90s on accessories).",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Return strict JSON for a measurable barbell/dumbbell session with %1RM or RPE, clear sets×reps, and explicit rests. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  bodyweight: {
    system: baseSystem(
      "You design minimal-equipment bodyweight sessions.",
      [
        "- Use EMOM, AMRAP, ladder, or density blocks; select one format based on variation_key.",
        "- Bias movements to FIELD2; use FIELD3 as a targeted finisher/regression/progression.",
        "- Include precise caps (e.g., EMOM 15: 8–10 push-ups @ tempo 31X1).",
        "- Use tempo, range, unilateral focus, or pause reps to create intensity (no gear).",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON bodyweight session using EMOM/AMRAP/ladder with tempos or pauses. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  aerobics: {
    system: baseSystem(
      "You generate short, measurable cardio sessions.",
      [
        "- Choose interval structures suited to the modality (running/rowing/swimming/cycling/etc.).",
        "- Specify pace/zone or RPE and interval timing (e.g., 6×2:00 @ 10K pace + 1:00 easy).",
        "- FIELD2 is the primary emphasis (e.g., sprints vs aerobic base); FIELD3 adds a twist (hill, cadence, stroke rate).",
        "- Provide total est_time_min consistent with the plan.",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON cardio intervals with clear pace/zone/RPE and recoveries. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  mobility: {
    system: baseSystem(
      "You craft mobility routines for balance and recovery.",
      [
        "- Use blocks combining dynamic prep + positional isometrics + static holds.",
        "- Map FIELD2 to target regions; FIELD3 adds style (PNF, breath cadence, loaded mobility).",
        "- Specify hold times, breaths, and sets (e.g., 3×(90s couch stretch per side, nasal 4-4-8 breathing)).",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON mobility block with exact hold times, breaths, and sequences. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  "rest day": {
    system: baseSystem(
      "You prescribe restorative rest-day activities.",
      [
        "- Keep load low but purposeful: light walk, breathwork, gentle stretch, 5-minute tidy, etc.",
        "- FIELD2 indicates the focal recovery element; FIELD3 sets the vibe/setting.",
        "- Quantify duration and caps (e.g., 25 min total; 6 min walk, 8 min mobility, 6 min breath, 5 min journaling).",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON restorative plan with concrete durations. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  sports: {
    system: baseSystem(
      "You create sport-themed conditioning/drill blocks.",
      [
        "- FIELD2 is the sport (e.g., Basketball). FIELD3 is a theme (e.g., shooting, footwork, conditioning).",
        "- Provide skill drill structures with work:rest and rep counts (e.g., 5×(30s cone shuffles + 3 free throws)).",
        "- Make it court/field-agnostic but specific enough to measure.",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON sport drills/conditioning with reps and work:rest. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  outdoors: {
    system: baseSystem(
      "You provide outdoor activity challenges.",
      [
        "- Choose route/time structures (out-and-back, loops, fartlek on trails, elevation target).",
        "- FIELD2 is the primary mode (e.g., hiking); FIELD3 adds the twist (e.g., steady climb, cadence, landmarks).",
        "- Quantify distance/elevation/time and any cadence or landmark rules.",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON outdoor session with distance/elevation/cadence targets. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  "cheat day": {
    system: baseSystem(
      "You give light-hearted indulgence prompts with moderation logic.",
      [
        "- Make it fun but bounded (e.g., dessert serving caps, hydration rule, short walk afterward).",
        "- FIELD2 is the treat type; FIELD3 sets the accent/constraint (portion, time window, pairing).",
        "- Quantify servings, time windows, and any balancing behaviors.",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON indulgence plan with caps and balancing actions. Title must include FIELD1 FIELD2 FIELD3."
      })
  },

  mix: {
    system: baseSystem(
      "You assemble hybrid micro-sessions combining styles.",
      [
        "- Stitch 2–3 mini-blocks: e.g., weightlifting superset + short cardio interval + mobility finisher.",
        "- FIELD2 is the main anchor; FIELD3 informs the second block.",
        "- Each block must be measurable (sets×reps, watts/pace, or hold times).",
      ].join("\n")
    ),
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        variation_key: `${dateISO}-${tz}`,
        FIELD1: field1,
        FIELD2: field2,
        FIELD3: field3,
        request: "Strict JSON hybrid session with 2–3 measurable blocks. Title must include FIELD1 FIELD2 FIELD3."
      })
  }
};

export function buildPrompt(field1, field2, field3, dateISO, tz) {
  if (!isValidTriplet(field1, field2, field3)) {
    throw new Error("Invalid training selection");
  }
  const template = PROMPTS_BY_FIELD1[field1];
  if (!template) {
    throw new Error(`Missing prompt template for ${field1}`);
  }
  return {
    systemPrompt: template.system,
    userPayload: template.buildUser({ dateISO, tz, field1, field2, field3 })
  };
}
