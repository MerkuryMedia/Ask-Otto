import { isValidTriplet } from "./deps.js";

/**
 * OUTPUT SHAPE (strict JSON; no prose outside JSON)
 * {
 *   "title": "",                 // must be empty string (no title)
 *   "objective": string,         // 1–2 sentences, short & poignant
 *   "difficulty": string,        // a vibe word like "Calm", "Focused", "Fierce", or "Playful"
 *   "instructions": [string, ...]// 3–6 ultra-brief bullets with constraints/perspective shifts/mantras
 *   // "est_time_min" OMITTED (prototype handles it as optional)
 * }
 *
 * GLOBAL RULES (apply to EVERY category):
 * - Do NOT include sets, reps, weights, distances, paces, time caps, or counts.
 * - Do NOT output a title. Set "title": "".
 * - Keep language visceral, directive, and minimal.
 * - Each bullet is an angle, constraint, or ritual—not a numbered program.
 * - Vary tone and angle by category (FIELD1) and selection (FIELD2/FIELD3).
 * - Use the variation_key to branch tone/themes so different days feel different.
 * - Safety: allow intensity but avoid encouraging injury.
 */

function baseSystem(categoryIntro, tonalDirectives) {
  return [
    categoryIntro,
    "",
    "RESPOND WITH STRICT JSON ONLY using this exact shape:",
    '{ "title": "", "objective": string, "difficulty": string, "instructions": [string, ...] }',
    "",
    "MANDATES:",
    '- "title" MUST be the empty string.',
    "- No numbers that imply programming (no sets/reps/percent, no timers, no distances).",
    "- Keep it creative: constraints, rituals, mantras, focus frames, environment shifts.",
    "- Keep it short. No paragraphs. Each instruction is one compact line.",
    "- Difficulty is a vibe word (e.g., Calm, Focused, Fierce, Playful, Grounded, Savage).",
    "- Use FIELD2 as the primary lens and FIELD3 as a secondary twist.",
    "- Use variation_key to diversify tone (e.g., choose among Technique/Brutalist/Silent/Play modes).",
    "",
    "TONE & DEVICES:",
    tonalDirectives,
  ].join("\n");
}

export const PROMPTS_BY_FIELD1 = {
  // ————————————————————————————————————————————————
  // WEIGHTLIFTING: perspective flips on load/ego/form
  // ————————————————————————————————————————————————
  weightlifting: {
    system: baseSystem(
      "You craft weight-room mindset challenges that bend perception (ego vs form, tempo vs power, silence vs hype).",
      [
        "- Themes to draw from: Technique Purist, Savage Mode, Tempo Ritual, Single-Move Meditation, Mirror Work, Breath Ledger, No-Music Monastery.",
        "- FIELD2 is the main body-focus lens (e.g., chest, back, legs). FIELD3 adds attitude (e.g., shoulders → posture pride).",
        "- Encourage mind–muscle connection, breath cadence, gaze discipline, or self-imposed rules (e.g., no phone, no social).",
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
          "Return JSON with empty title, a sharp objective, a vibe difficulty, and 3–6 bullets of constraints/rituals/mantras for weightlifting. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // BODYWEIGHT: presence, control, spatial awareness
  // ————————————————————————————————————————————————
  bodyweight: {
    system: baseSystem(
      "You design bodyweight mindset tasks that worship control, presence, and playful exploration.",
      [
        "- Themes: Animal Flow, Silence & Breath, Slow Eccentrics Without Counting, Floorcraft, Playful Balance, Eyes-Closed Control.",
        "- FIELD2 drives the primary movement flavor; FIELD3 twists it (balance, symmetry, pause, range).",
        "- Lean into proprioception, minimalism, and sensory constraints (lights low, no music, barefoot, eyes closed).",
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
          "Return JSON with empty title, short objective, vibe difficulty, and 3–6 bullets focused on presence, breath, and playful control. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // AEROBICS: internal narrative, scenery rules, silence
  // ————————————————————————————————————————————————
  aerobics: {
    system: baseSystem(
      "You compose cardio challenges that reframe pace as narrative—scenery, cadence, breath, and attention games.",
      [
        "- Themes: Sound Off (no media), Landmark Focus, Breath Cadence Imagery, Posture Halo, Cadence Mantra.",
        "- FIELD2 is the core feel (e.g., sprints vs base); FIELD3 adds a twist (hills, cadence, quiet).",
        "- Suggest attention anchors (footfall sound, arm swing symmetry, visual horizon) without numbers.",
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
          "Return JSON with empty title, brief objective, vibe difficulty, and 3–6 bullets with narrative/attention constraints for cardio. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // MOBILITY: breath, softness, ritual, slowness
  // ————————————————————————————————————————————————
  mobility: {
    system: baseSystem(
      "You write mobility rituals that emphasize slowness, softness, breath, and inner narration.",
      [
        "- Themes: Candlelight Focus, Spine Stories, Hip Gate, Shoulder Halo, Yin Stillness, Curiosity Scan.",
        "- FIELD2 targets region; FIELD3 sets flavor (PNF tone, breath focus, eyes-closed mapping).",
        "- Encourage micro-exploration: angle drift, gentle oscillation, breath-led space-finding.",
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
          "Return JSON with empty title, brief objective, vibe difficulty, and 3–6 bullets for a reflective mobility ritual. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // REST DAY: recovery as art; observation & gentle rules
  // ————————————————————————————————————————————————
  "rest day": {
    system: baseSystem(
      "You frame recovery as an art form—light motion, observation, and gentle self-respect.",
      [
        "- Themes: Quiet Walk, Solemn Kitchen, Breath Window, Light Tidy, Soft Stretch, No-Scroll Hour.",
        "- FIELD2 is the focal recovery element; FIELD3 sets vibe (nature, silence, connection, self-care).",
        "- Encourage one deliberate micro-ritual (tea, journaling, 5-minute gaze out window) without times.",
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
          "Return JSON with empty title, brief objective, vibe difficulty, and 3–6 bullets for restorative rest. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // SPORTS: skill mood, intent cues, playful constraints
  // ————————————————————————————————————————————————
  sports: {
    system: baseSystem(
      "You set sport challenges that are playful, intent-driven, and skill-mood oriented.",
      [
        "- Themes: Footwork Poise, Quiet Hands, Peripheral Vision, Rhythm Hunt, Shot Selection Wisdom.",
        "- FIELD2 is the sport; FIELD3 is a skill theme. Avoid drills-as-counts; use cues and constraints.",
        "- Lean into game IQ, flow, and self-coaching phrases.",
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
          "Return JSON with empty title, concise objective, vibe difficulty, and 3–6 bullets for sport intent & flow. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // OUTDOORS: attention, terrain stories, sensory play
  // ————————————————————————————————————————————————
  outdoors: {
    system: baseSystem(
      "You create outdoor prompts that shift attention and tell terrain stories through the body.",
      [
        "- Themes: Horizon Fix, Tree-to-Tree Focus, Texture Hunt, Wind Friend, Hill Respect, Trail Etiquette.",
        "- FIELD2 is the mode; FIELD3 adds the twist (cadence, elevation awareness, landmark rhythm).",
        "- Use senses: sound, scent, temperature, light—no numbers.",
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
          "Return JSON with empty title, brief objective, vibe difficulty, and 3–6 bullets for sensory outdoor focus. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // CHEAT DAY: joy with guardrails; ritual & awareness
  // ————————————————————————————————————————————————
  "cheat day": {
    system: baseSystem(
      "You make indulgence mindful—joy with soft guardrails and simple rituals.",
      [
        "- Themes: Savor Ritual, Pair with Water, Slow Bite, Gratitude Bite, No Guilt, Tiny Walk After.",
        "- FIELD2 is the treat; FIELD3 modifies vibe (company, silence, time window, pairing).",
        "- Focus on savoring, presence, and a simple balancing gesture—no quantities.",
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
          "Return JSON with empty title, brief objective, vibe difficulty, and 3–6 bullets for mindful indulgence. No metrics."
      })
  },

  // ————————————————————————————————————————————————
  // MIX: hybrid mindset; contrast & synthesis
  // ————————————————————————————————————————————————
  mix: {
    system: baseSystem(
      "You blend styles into a single mindset arc—contrast, then synthesis.",
      [
        "- Themes: Contrast Then Merge (power → calm), Breath Thread, Curiosity Switch, Single Constraint Across Styles.",
        "- FIELD2 anchors the first lens; FIELD3 colors the second lens.",
        "- Use a unifying mantra that stitches both lenses together.",
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
          "Return JSON with empty title, brief objective, vibe difficulty, and 3–6 bullets that blend two styles into one arc. No metrics."
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
