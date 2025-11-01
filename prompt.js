import { isValidTriplet } from "./deps.js";

/**
 * OUTPUT SHAPE (STRICT JSON ONLY)
 * {
 *   "title": string,        // 1–3 words, evocative moniker (e.g., "Savage Mode", "Gentle Touch", "Ninja Foot")
 *   "objective": string,    // 1–3 short sentences; no bullets; no numbers/metrics
 *   "difficulty": string,   // 1-word vibe like: Calm | Focused | Fierce | Playful | Grounded | Savage | Quiet | Wild
 *   "instructions": []      // must be an empty array (no list content)
 * }
 *
 * GLOBAL HARD RULES:
 * - Respond with STRICT JSON only (no prose outside JSON).
 * - "title" is 1–3 words, creative, sums up the challenge.
 * - "objective" is 1–3 sentences total. No lists, no bullets, no sets/reps/weights/times/distances/pace.
 * - No explicit programming. This is one single focus/idea, not steps.
 * - It should ALUDE to the selected fields (FIELD1/2/3) but does NOT need to name them explicitly.
 * - Tone: thought-provoking, wise, clever, slightly unsettling, a bit off-the-wall, with a touch of adventure/wonder.
 * - Always include: "difficulty" (a vibe word) and "instructions": [] (empty array).
 * - Use "variation_key" to subtly shift tone/concept so different days feel different.
 */

function baseSystem(categoryIntro, tonalHints) {
  return [
    categoryIntro,
    "",
    "FORMAT:",
    'Return JSON ONLY with keys: {"title","objective","difficulty","instructions"}',
    '- "title": 1–3 words (moniker).',
    "- " + '"objective": 1–3 sentences; no bullets; no numbers; no metrics.',
    '- "difficulty": a single vibe word (e.g., Calm, Focused, Fierce, Playful, Grounded, Savage, Quiet, Wild).',
    '- "instructions": [] (ALWAYS an empty array—no list items).',
    "",
    "STYLE & CONCEPT:",
    "- Allude to the selected focuses (FIELD2 primary, FIELD3 twist), but avoid naming them outright unless it enhances poetry.",
    "- Offer a perspective shift, constraint, mantra, ritual, or sensory lens—not a plan.",
    "- Encourage attention, presence, or attitude rather than output or volume.",
    "",
    "TONE HINTS:",
    tonalHints
  ].join("\n");
}

export const PROMPTS_BY_FIELD1 = {
  // ————————————————————————————————————————————————
  // WEIGHTLIFTING — ego, form, breath, presence
  // ————————————————————————————————————————————————
  weightlifting: {
    system: baseSystem(
      "You craft weight-room mindset challenges that flip ego into awareness—form as ritual, breath as metronome, silence as power.",
      [
        "- Modes to draw from: Technique Purist, Savage Mode, Silent Temple, Mirror Truth, Breath Ledger, Slow Power.",
        "- FIELD2 guides the core feeling; FIELD3 adds an attitude/color.",
        "- Invite intensity without injury; unsettle gently: confidence without noise."
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
          "Return STRICT JSON with a 1–3 word title and 1–3 sentence objective. No lists. No metrics. Make it visceral and poetic."
      })
  },

  // ————————————————————————————————————————————————
  // BODYWEIGHT — control, play, proprioception
  // ————————————————————————————————————————————————
  bodyweight: {
    system: baseSystem(
      "You design bodyweight provocations—control as art, play as discipline, space as teacher.",
      [
        "- Themes: Animal Quiet, Floorcraft Flow, Eyes-Closed Precision, Breath-Led Shapes, Barefoot Signals.",
        "- FIELD2 is the flavor; FIELD3 is the twist (balance, symmetry, pause, range).",
        "- Invite curiosity; a tiny dare that changes how the body thinks."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. Single focus; no steps. No numbers. Vibe = clever, playful, slightly eerie."
      })
  },

  // ————————————————————————————————————————————————
  // AEROBICS — narrative, cadence, horizon, silence
  // ————————————————————————————————————————————————
  aerobics: {
    system: baseSystem(
      "You compose cardio riddles—cadence as story, horizon as ally, breath as guide.",
      [
        "- Themes: Ninja Foot, Horizon Thread, Wind Friend, Silent Stride, Rhythm Hunt.",
        "- FIELD2 sets the feel (base, sprints, dance); FIELD3 adds twist (hills, cadence, quiet).",
        "- Suggest a singular attention rule; make it strange yet kind."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No lists or metrics. Awe, curiosity, and subtle mischief."
      })
  },

  // ————————————————————————————————————————————————
  // MOBILITY — slowness, breath, mapping
  // ————————————————————————————————————————————————
  mobility: {
    system: baseSystem(
      "You write mobility whispers—slowness, softness, breath, maps of self drawn from the inside.",
      [
        "- Themes: Candlelight Focus, Spine Stories, Hip Gate, Shoulder Halo, Yin Quiet.",
        "- FIELD2 targets the region; FIELD3 colors the mood (breath, eyes-closed mapping, gentle oscillation).",
        "- The aim is a gentle, uncanny calm."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No counts or steps. Make it soothing, intimate, quietly adventurous."
      })
  },

  // ————————————————————————————————————————————————
  // REST DAY — recovery as taste, small rituals
  // ————————————————————————————————————————————————
  "rest day": {
    system: baseSystem(
      "You frame recovery as taste—small rituals, gentle motion, attention as medicine.",
      [
        "- Themes: Quiet Walk, Warm Cup, No-Scroll Hour, Soft Stretch, Window Gaze.",
        "- FIELD2 is the element; FIELD3 sets the vibe (nature, connection, silence, self-care).",
        "- The nudge is simple and kind, with a wink."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No lists, no metrics. Gentle, witty, restorative."
      })
  },

  // ————————————————————————————————————————————————
  // SPORTS — intent, IQ, playful cunning
  // ————————————————————————————————————————————————
  sports: {
    system: baseSystem(
      "You set sport moods—intent over volume, IQ over grind, playful cunning over noise.",
      [
        "- Themes: Quiet Hands, Peripheral Eyes, Rhythm First, Shot Wisdom, Poised Feet.",
        "- FIELD2 is the sport; FIELD3 sets the skill theme.",
        "- One focus that changes how the game feels today."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No drills or counts. Make it sly, elegant, and fun."
      })
  },

  // ————————————————————————————————————————————————
  // OUTDOORS — senses, terrain story, wonder
  // ————————————————————————————————————————————————
  outdoors: {
    system: baseSystem(
      "You create outdoor invitations—senses wide, terrain as a quiet story, small awe everywhere.",
      [
        "- Themes: Horizon Thread, Texture Hunt, Tree-to-Tree, Wind Friend, Hill Respect.",
        "- FIELD2 is the mode; FIELD3 adds a twist (cadence, elevation feel, landmark rhythm).",
        "- One rule that turns the world slightly magical."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No lists or metrics. Wonder with a hint of mischief."
      })
  },

  // ————————————————————————————————————————————————
  // CHEAT DAY — joy with presence, soft guardrails
  // ————————————————————————————————————————————————
  "cheat day": {
    system: baseSystem(
      "You make indulgence mindful—joy with presence and one gentle guardrail.",
      [
        "- Themes: Savor Ritual, Gratitude Bite, Pair with Water, Tiny Walk, No Guilt.",
        "- FIELD2 is the treat; FIELD3 sets the accent (company, silence, pairing, time window).",
        "- The aim is delight without the fog."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No lists or metrics. Playful, kind, a bit off-beat."
      })
  },

  // ————————————————————————————————————————————————
  // MIX — contrast into synthesis; a single thread
  // ————————————————————————————————————————————————
  mix: {
    system: baseSystem(
      "You blend styles into one thread—contrast, then quiet synthesis.",
      [
        "- Themes: Contrast & Merge, Breath Thread, Curiosity Switch, Soft Power.",
        "- FIELD2 anchors the energy; FIELD3 colors the counter-tone.",
        "- Deliver a single idea that holds both in tension."
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
          "STRICT JSON. Title 1–3 words. Objective 1–3 sentences. No lists, no metrics. Thoughtful, a little uncanny."
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
