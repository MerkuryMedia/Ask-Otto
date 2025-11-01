import { isValidTriplet } from "./deps.js";

const PROMPTS_BY_FIELD1 = {
  weightlifting: {
    system:
      "You are a concise strength coach. Reply with compact JSON describing a single barbell or dumbbell session based on the provided focus.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        mode: field1,
        focus_primary: field2,
        focus_secondary: field3,
        request: "strength challenge"
      })
  },
  bodyweight: {
    system:
      "You design minimal-equipment bodyweight workouts. Respond with JSON only, no narration.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        category: field1,
        emphasis: field2,
        variant: field3,
        request: "bodyweight challenge"
      })
  },
  aerobics: {
    system:
      "You generate short cardio sessions. Stay efficient and measurable. JSON only.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        modality: field1,
        focus: field2,
        style: field3,
        request: "aerobic challenge"
      })
  },
  mobility: {
    system:
      "You craft mobility routines emphasizing balance and recovery. Answer strictly as JSON.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        modality: field1,
        target: field2,
        flavor: field3,
        request: "mobility challenge"
      })
  },
  "rest day": {
    system:
      "You recommend restorative rest-day activities. Keep the JSON brief and supportive.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        type: field1,
        focus: field2,
        vibe: field3,
        request: "rest day challenge"
      })
  },
  sports: {
    system:
      "You create sport-themed conditioning prompts. Respond with short JSON covering drills or play ideas.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        sport: field2,
        theme: field3,
        request: `${field1} challenge`
      })
  },
  outdoors: {
    system:
      "You provide outdoor activity challenges. Keep it weather-agnostic, JSON only.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        environment: field1,
        focus: field2,
        twist: field3,
        request: "outdoor challenge"
      })
  },
  "cheat day": {
    system:
      "You give light-hearted indulgence prompts for a cheat day while nudging moderation. Output JSON only.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        mode: field1,
        treat: field2,
        accent: field3,
        request: "cheat day challenge"
      })
  },
  mix: {
    system:
      "You mix multiple training styles into one actionable mini session. JSON response only.",
    buildUser: ({ dateISO, tz, field1, field2, field3 }) =>
      JSON.stringify({
        date: dateISO,
        timezone: tz,
        anchor: field1,
        primary: field2,
        secondary: field3,
        request: "hybrid challenge"
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

export { PROMPTS_BY_FIELD1 };
