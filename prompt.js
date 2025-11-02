import { isValidTriplet } from "./deps.js";

/**
 * OUTPUT SHAPE (STRICT JSON ONLY)
 * {
 *   "title": string,        // 1–3 words, e.g., "Prime & Press", "Quiet Engine"
 *   "objective": string,    // 1–3 short sentences; no bullets; no numeric programming
 *   "difficulty": string,   // 1-word vibe like: Calm | Focused | Fierce | Playful | Grounded | Savage | Quiet | Wild
 *   "instructions": []      // always an empty array (no list content)
 * }
 *
 * GLOBAL HARD RULES:
 * - Respond with STRICT JSON only (no prose outside JSON).
 * - Keep the challenge practical and immediately usable in the gym/field/home.
 * - Use specific movement names, sequences, and methods (e.g., “incline dumbbell press → lateral raise finisher”),
 *   but DO NOT include numbers: no sets, reps, loads, timers, distances, or paces.
 * - One clear focus per day. No step lists. No drill menus. No bullets in the objective.
 * - Title is 1–3 words. Objective is 1–3 sentences total.
 * - The challenge should be clearly influenced by FIELD2 (primary) with FIELD3 as a twist/finisher/emphasis.
 * - Subtle creativity is welcome (tempo cues, sensory cues, mindset), but utility comes first.
 * - Always include: "difficulty" (vibe word) and "instructions": [] (empty array).
 * - Use "variation_key" to subtly vary tone/concept day-to-day.
 */

function baseSystem(categoryIntro, tacticalNotes) {
  return [
    categoryIntro,
    "",
    "FORMAT:",
    'Return JSON ONLY with keys: {"title","objective","difficulty","instructions"}',
    '- "title": 1–3 words.',
    '- "objective": 1–3 sentences; practical, actionable, and immediately usable; no bullets or lists.',
    '- "difficulty": a single vibe word (Calm, Focused, Fierce, Playful, Grounded, Savage, Quiet, Wild, etc.).',
    '- "instructions": [] (ALWAYS an empty array).',
    "",
    "TACTICAL STYLE:",
    "- Name movements, sequences, and methods the user can perform now.",
    "- Avoid any numbers (no counts, sets, reps, weights, times, distances, paces).",
    "- Favor cues like: movement order, equipment choice, range of motion, tempo words, mind–muscle targets, environment constraints.",
    "",
    "GUIDANCE:",
    tacticalNotes
  ].join("\n");
}

export const PROMPTS_BY_FIELD1 = {
  // ————————————————————————————————————————————————
  // WEIGHTLIFTING — concrete movement order + finisher
  // ————————————————————————————————————————————————
  weightlifting: {
    system: baseSystem(
      "You prescribe focused weight-room micro-plans the user can run today.",
      [
        "- Anchor to FIELD2 with a clear compound choice (e.g., bench press for chest, row for back, squat pattern for legs).",
        "- Add a FIELD3 twist as an accessory or finisher (e.g., shoulders → lateral raise or face pull; triceps → rope pressdown).",
        "- Use method cues instead of numbers: controlled negative, long pause at stretch, strict path, limited rest chatter, no phone.",
        "- Keep it one flow the user can remember: main lift → accessory → short skill/positional finisher."
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
        request:
          "Return STRICT JSON. Title 1–3 words. Objective 1–3 sentences describing a concrete session flow (main lift tied to FIELD2, accessory/finisher tied to FIELD3). No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // BODYWEIGHT — circuit flavor with clear technique cue
  // ————————————————————————————————————————————————
  bodyweight: {
    system: baseSystem(
      "You deliver bodyweight sessions with a clear movement set and technique emphasis.",
      [
        "- Let FIELD2 drive the main pattern (e.g., push → push-up variants; pull → rows/hangs; core → hollow/arch).",
        "- Use FIELD3 as the secondary angle (balance, pause, range, symmetry, or a specific region like shoulders/legs).",
        "- Provide a simple circuit feel without numbers: choose 2–3 moves, define the order, add one technique constraint (tempo, pause, controlled transition).",
        "- Keep it location-agnostic and equipment-light."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences with a practical bodyweight flow (2–3 moves, order, technique cue). No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // AEROBICS — route/mode + cadence/feel + finish
  // ————————————————————————————————————————————————
  aerobics: {
    system: baseSystem(
      "You create aerobic sessions that state the mode, route feel, and a finish ritual.",
      [
        "- Tie FIELD2 to the intent (steady base, quicker cadence, powerful strides) and FIELD3 as the twist (hills, rhythm, dance feel, quiet).",
        "- Be explicit about the pattern: choose the route style (out-and-back, loop, track/area) and a cadence/feel cue (light feet, tall posture, soft shoulders).",
        "- Close with a short finish ritual (easy roll-down, stride rehearsal, breath reset). No numbers."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences with mode, route feel, cadence/attention cue, and a brief finish ritual. No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // MOBILITY — target area + sequence (prep → position → ease)
  // ————————————————————————————————————————————————
  mobility: {
    system: baseSystem(
      "You map a compact mobility sequence for a target area.",
      [
        "- FIELD2 selects the primary region (e.g., hips, shoulders, spine). FIELD3 sets the flavor (breath, eyes-closed, gentle oscillation, PNF tone).",
        "- Give a three-part flow without numbers: dynamic prep → positional hold or supported shape → easy release/retune.",
        "- Include one sensory or breath cue to deepen the effect."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences describing prep → position → ease for the FIELD2 area, flavored by FIELD3. No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // REST DAY — active recovery with one anchor + one add-on
  // ————————————————————————————————————————————————
  "rest day": {
    system: baseSystem(
      "You define a simple recovery plan that still feels intentional.",
      [
        "- Pick one anchor activity (light walk, gentle stretch, breath window).",
        "- Add one supportive add-on (tea ritual, brief journal line, quiet gaze).",
        "- Keep it restorative, practical, and clearly do-able today. No numbers."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences with one gentle activity plus one supportive add-on. No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // SPORTS — one skill theme + simple drill shape (no counts)
  // ————————————————————————————————————————————————
  sports: {
    system: baseSystem(
      "You deliver a sport session that names the skill intent and the simple drill shape.",
      [
        "- FIELD2 is the sport; FIELD3 is the skill theme (footwork, shooting rhythm, touch, vision).",
        "- State a single practice shape the user can run (cone pattern, wall work, solo shadow play, partner rhythm), without numbers.",
        "- Add one coaching cue to keep quality high."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences naming one drill shape for the FIELD2 sport with FIELD3 emphasis and a single cue. No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // OUTDOORS — mode + terrain tactic + observation cue
  // ————————————————————————————————————————————————
  outdoors: {
    system: baseSystem(
      "You propose an outdoor session with a terrain tactic and an observation cue.",
      [
        "- FIELD2 sets the mode (hiking, cycling, etc.); FIELD3 provides the twist (elevation feel, cadence, landmark rhythm).",
        "- Describe the route choice (park loop, neighborhood grid, trail out-and-back) and a terrain tactic (steady climbs, smooth descents, cornering line).",
        "- Add one observation cue (sound of footfall, tree-to-tree focus, wind direction). No numbers."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences with route choice, terrain tactic, and an observation cue. No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // CHEAT DAY — mindful structure with one balancing act
  // ————————————————————————————————————————————————
  "cheat day": {
    system: baseSystem(
      "You keep indulgence fun but structured with one balancing act.",
      [
        "- Name the treat context and where it fits in the day (post-meal, after training, shared with a friend).",
        "- Add one simple balancing gesture (brief walk, water pairing, slow savor ritual).",
        "- Keep it light and doable without numbers."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences that place the treat in context and include one balancing gesture. No numbers."
      })
  },

  // ————————————————————————————————————————————————
  // MIX — two-block combo with a clear thread
  // ————————————————————————————————————————————————
  mix: {
    system: baseSystem(
      "You combine two styles into one clear, memorable combo.",
      [
        "- FIELD2 anchors the first block; FIELD3 colors the second block.",
        "- State a two-block flow the user can run back-to-back (e.g., kettlebell hinge pattern → brisk shadow boxing; or yoga hip opener → light jog loop).",
        "- Add a single unifying cue (breath, posture, relaxed jaw). No numbers."
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
        request:
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences describing a two-block flow tied to FIELD2 then FIELD3, plus one unifying cue. No numbers."
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
