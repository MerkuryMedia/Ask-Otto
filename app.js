import {
  FIELD1_OPTIONS,
  getField2Options,
  getField3Options,
  isValidTriplet
} from "./deps.js";
import { buildPrompt } from "./prompt.js";
import { MODEL_ID, API_URL, GEMINI_API_KEY, APP_VERSION } from "./config.js";

const STORAGE_KEY = "ask-otto-state";
const DEFAULT_WEEKLY_PLAN = () =>
  Array.from({ length: 7 }, () => ({ field1: null, field2: null, field3: null }));
const WEEKDAY_ABBREVS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

let storageAvailable = true;
let state = loadState();
let todayInfo = resolveTodayInfo();
let currentRoute = null;
let generatingChallenge = false;
let generationError = null;
let latestDragValue = null;

const tzDisplay = () => todayInfo.tz;

const progressBarFill = document.getElementById("progressBarFill");
const progressPercent = document.getElementById("progressPercent");
const weekView = document.getElementById("weekView");
const dayDetailView = document.getElementById("dayDetailView");
const challengeCard = document.getElementById("challengeCard");
const challengeContent = document.getElementById("challengeContent");
const challengeActions = document.getElementById("challengeActions");
const challengeStatus = document.getElementById("challengeStatus");
const profileExtras = document.getElementById("profileExtras");
const profileSaveButton = document.getElementById("btnProfileSave");
const radialSliderRoot = document.getElementById("radialSlider");
const scoreRangeInput = document.getElementById("scoreRange");
const submitScoreButton = document.getElementById("btnSubmitScore");
const profileButton = document.getElementById("btnProfile");
const resetLink = document.getElementById("linkResetApp");
const resetProfileButton = document.getElementById("linkResetProfile");
const debugPanel = document.getElementById("debugPanel");

const field1Select = document.getElementById("field1Select");
const field2Select = document.getElementById("field2Select");
const field3Select = document.getElementById("field3Select");
const returnButton = document.getElementById("btnReturnWeek");
const dayDetailLabel = document.getElementById("dayDetailLabel");

setupEventListeners();
setupRadialSlider();
applyRoute(getInitialRoute());
render();

function createDefaultState() {
  return {
    weeklyPlan: DEFAULT_WEEKLY_PLAN(),
    challengeByDate: {},
    resultsByDate: {},
    metrics: { emaProgress: 0 },
    version: APP_VERSION,
    lastValueMovedToday: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== APP_VERSION) {
      return createDefaultState();
    }
    const merged = createDefaultState();
    return {
      ...merged,
      ...parsed,
      weeklyPlan: Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length === 7
        ? parsed.weeklyPlan.map((day) => ({
            field1: day?.field1 ?? null,
            field2: day?.field2 ?? null,
            field3: day?.field3 ?? null
          }))
        : merged.weeklyPlan
    };
  } catch (error) {
    storageAvailable = false;
    console.error("Failed to load state", error);
    return createDefaultState();
  }
}

function saveState() {
  if (!storageAvailable) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    storageAvailable = false;
    console.error("Failed to save state", error);
    renderStorageError();
  }
}

function resetApp() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to clear storage", error);
  }
  window.location.reload();
}

function resolveTodayInfo() {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const dateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const iso = toISODate(dateOnly);
  const weekday = getMondayIndex(dateOnly);
  return { iso, weekday, tz };
}

function getMondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISOToDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getWeekDates(baseDate) {
  const start = new Date(baseDate);
  const weekday = getMondayIndex(start);
  start.setDate(start.getDate() - weekday);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      date: day,
      iso: toISODate(day),
      label: day.toLocaleDateString(undefined, { weekday: "short" })
    };
  });
}

function getInitialRoute() {
  const hash = window.location.hash;
  if (!hash || hash === "#" || hash === "") {
    return "#/home";
  }
  return hash;
}

function setupEventListeners() {
  window.addEventListener("hashchange", () => {
    applyRoute(window.location.hash || "#/home");
    render();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const info = resolveTodayInfo();
      if (info.iso !== todayInfo.iso) {
        todayInfo = info;
        state.lastValueMovedToday = null;
        saveState();
        render();
      }
    }
  });

  profileButton.addEventListener("click", () => {
    window.location.hash = "#/profile";
  });

  resetLink.addEventListener("click", (event) => {
    event.preventDefault();
    resetApp();
  });

  resetProfileButton.addEventListener("click", (event) => {
    event.preventDefault();
    resetApp();
  });

  if (profileSaveButton) {
    profileSaveButton.addEventListener("click", () => {
      handleProfileSave().catch((error) => {
        console.error("Profile save failed", error);
      });
    });
  }

  submitScoreButton.addEventListener("click", handleScoreSubmit);

  const rangeHandler = () => {
    const value = Number(scoreRangeInput.value);
    if (Number.isInteger(value)) {
      commitSliderValue(value);
    }
  };
  scoreRangeInput.addEventListener("change", rangeHandler);
  scoreRangeInput.addEventListener("input", rangeHandler);

  field1Select.addEventListener("change", () => {
    const field1 = field1Select.value || null;
    if (!field1) {
      populateSelect(field2Select, []);
      populateSelect(field3Select, []);
      field2Select.disabled = true;
      field3Select.disabled = true;
      updateDayPlan({ field1: null, field2: null, field3: null });
      updateDayDetailSubmitState();
      return;
    }
    const options = getField2Options(field1);
    populateSelect(field2Select, options);
    populateSelect(field3Select, options);
    updateDayPlan({ field1, field2: null, field3: null });
    field2Select.disabled = false;
    field3Select.disabled = false;
    updateDayDetailSubmitState();
  });

  field2Select.addEventListener("change", () => {
    const field1 = field1Select.value || null;
    const field2 = field2Select.value || null;
    const field3 = field3Select.value || null;
    updateDayPlan({ field1, field2, field3 });
    updateDayDetailSubmitState();
  });

  field3Select.addEventListener("change", () => {
    const field1 = field1Select.value || null;
    const field2 = field2Select.value || null;
    const field3 = field3Select.value || null;
    updateDayPlan({ field1, field2, field3 });
    updateDayDetailSubmitState();
  });

  returnButton.addEventListener("click", () => {
    window.location.hash = "#/profile";
  });
}

function applyRoute(hash) {
  const parsed = parseRoute(hash);
  currentRoute = parsed;
}

function parseRoute(hash) {
  const cleaned = (hash || "").replace(/^#/, "");
  const segments = cleaned.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { view: "home" };
  }
  if (segments[0] === "home") {
    return { view: "home" };
  }
  if (segments[0] === "profile") {
    if (segments.length === 1) {
      return { view: "profile" };
    }
    if (segments[1] === "day" && segments[2]) {
      return { view: "profile-day", iso: segments[2] };
    }
  }
  return { view: "home" };
}

function render() {
  renderStorageError();
  renderProgress();
  const route = currentRoute || { view: "home" };
  switch (route.view) {
    case "profile":
      renderProfileView();
      break;
    case "profile-day":
      renderDayDetail(route.iso);
      break;
    case "home":
    default:
      renderHome();
      break;
  }
  renderDebug();
}

function renderStorageError() {
  const storageBanner = document.getElementById("storageErrorBanner");
  if (!storageBanner) return;
  if (!storageAvailable) {
    storageBanner.classList.remove("hidden");
  } else {
    storageBanner.classList.add("hidden");
  }
}

function renderProgress() {
  const percent = Math.max(0, Math.min(100, state.metrics.emaProgress || 0));
  progressBarFill.style.width = `${percent}%`;
  progressPercent.textContent = `${Math.round(percent)}%`;
}

function renderProfileView() {
  const weekDates = getWeekDates(parseISOToDate(todayInfo.iso));
  weekView.innerHTML = "";
  weekView.classList.remove("hidden");
  dayDetailView.classList.add("hidden");
  challengeCard.classList.add("hidden");
  radialSliderRoot.classList.add("hidden");
  submitScoreButton.classList.add("hidden");
  profileExtras.classList.remove("hidden");
  scoreRangeInput.disabled = true;

  weekDates.forEach((item, index) => {
    const tile = document.createElement("button");
    tile.className = "week-tile";
    tile.setAttribute("data-iso", item.iso);
    tile.textContent = WEEKDAY_ABBREVS[index] || item.label.slice(0, 2);
    tile.addEventListener("click", () => {
      window.location.hash = `#/profile/day/${item.iso}`;
    });
    const plan = state.weeklyPlan[index];
    if (plan && isValidTriplet(plan.field1, plan.field2, plan.field3)) {
      const dot = document.createElement("span");
      dot.className = "tile-status-dot";
      tile.appendChild(dot);
    }
    if (item.iso === todayInfo.iso) {
      tile.classList.add("today");
    }
    weekView.appendChild(tile);
  });
}

function renderDayDetail(targetIso) {
  const weekDates = getWeekDates(parseISOToDate(todayInfo.iso));
  const matchIndex = weekDates.findIndex((item) => item.iso === targetIso);
  if (matchIndex === -1) {
    window.location.hash = "#/profile";
    return;
  }
  weekView.classList.add("hidden");
  dayDetailView.classList.remove("hidden");
  challengeCard.classList.add("hidden");
  radialSliderRoot.classList.add("hidden");
  submitScoreButton.classList.add("hidden");
  profileExtras.classList.add("hidden");
  scoreRangeInput.disabled = true;

  const plan = state.weeklyPlan[matchIndex] ?? {
    field1: null,
    field2: null,
    field3: null
  };

  dayDetailLabel.textContent = `${weekDates[matchIndex].label} – ${weekDates[
    matchIndex
  ].iso}`;

  populateSelect(field1Select, FIELD1_OPTIONS, plan.field1);
  if (plan.field1) {
    const options = getField2Options(plan.field1);
    populateSelect(field2Select, options, plan.field2);
    populateSelect(field3Select, options, plan.field3);
    field2Select.disabled = false;
    field3Select.disabled = false;
  } else {
    populateSelect(field2Select, []);
    populateSelect(field3Select, []);
    field2Select.disabled = true;
    field3Select.disabled = true;
  }
  field1Select.dataset.weekIndex = matchIndex;
  field2Select.dataset.weekIndex = matchIndex;
  field3Select.dataset.weekIndex = matchIndex;

  updateDayDetailSubmitState();
}

function updateDayPlan({ field1, field2, field3 }) {
  const weekIndex = Number(field1Select.dataset.weekIndex);
  if (Number.isNaN(weekIndex)) {
    return;
  }
  const current = state.weeklyPlan[weekIndex] ?? {
    field1: null,
    field2: null,
    field3: null
  };
  const next = {
    field1: field1 === undefined ? current.field1 : field1,
    field2: field2 === undefined ? current.field2 : field2,
    field3: field3 === undefined ? current.field3 : field3
  };
  state.weeklyPlan[weekIndex] = next;
  saveState();
}

function updateDayDetailSubmitState() {
  const info = document.getElementById("dayDetailStatus");
  if (!info) return;
  const weekIndex = Number(field1Select.dataset.weekIndex);
  if (Number.isNaN(weekIndex)) {
    info.textContent = "";
    return;
  }
  const plan = state.weeklyPlan[weekIndex];
  if (plan && isValidTriplet(plan.field1, plan.field2, plan.field3)) {
    info.textContent = "Selections saved.";
  } else {
    info.textContent = "Select all three fields.";
  }
}

function renderHome() {
  weekView.classList.add("hidden");
  dayDetailView.classList.add("hidden");
  challengeCard.classList.remove("hidden");
  profileExtras.classList.add("hidden");

  renderChallengeCard();
  renderSliderAndSubmit();
}

function renderChallengeCard() {
  const todayISO = todayInfo.iso;
  const plan = state.weeklyPlan[todayInfo.weekday];
  const challenge = state.challengeByDate[todayISO];
  challengeContent.innerHTML = "";
  challengeStatus.innerHTML = "";
  challengeActions.innerHTML = "";

  if (generationError) {
    const errorMsg = document.createElement("p");
    errorMsg.className = "error";
    errorMsg.textContent =
      generationError?.message || "Challenge generation failed. Try again.";
    challengeStatus.appendChild(errorMsg);

    if (generationError?.retryable !== false) {
      const retryButton = document.createElement("button");
      retryButton.className = "btn-secondary";
      retryButton.textContent = "Try again";
      retryButton.addEventListener("click", () => {
        generationError = null;
        triggerChallengeGeneration();
      });
      challengeStatus.appendChild(retryButton);
    }
    return;
  }

  if (generatingChallenge) {
    const loading = document.createElement("p");
    loading.className = "muted";
    loading.textContent = "Contacting Gemini for today's challenge...";
    challengeStatus.appendChild(loading);
    return;
  }

  if (!challenge) {
    if (plan && isValidTriplet(plan.field1, plan.field2, plan.field3)) {
      const generateButton = document.createElement("button");
      generateButton.className = "btn-primary";
      generateButton.textContent = "Generate today's challenge";
      generateButton.addEventListener("click", () => {
        triggerChallengeGeneration();
      });
      challengeActions.appendChild(generateButton);
      // Auto-trigger on view entry per spec
      triggerChallengeGeneration();
    } else {
      const msg = document.createElement("p");
      msg.className = "muted";
      msg.textContent = "Set today's training focus in the profile tab to generate a challenge.";
      challengeStatus.appendChild(msg);
    }
    return;
  }

  const title = document.createElement("h2");
  title.textContent = challenge.title || "Today's Challenge";
  challengeContent.appendChild(title);

  const objective = document.createElement("p");
  objective.className = "objective";
  objective.textContent = challenge.objective || "Stay active and consistent.";
  challengeContent.appendChild(objective);

  const chips = document.createElement("div");
  chips.className = "chip-row";
  if (challenge.est_time_min) {
    const timeChip = document.createElement("span");
    timeChip.className = "chip";
    timeChip.textContent = `${challenge.est_time_min} min`;
    chips.appendChild(timeChip);
  }
  if (challenge.difficulty) {
    const diffChip = document.createElement("span");
    diffChip.className = "chip";
    diffChip.textContent = challenge.difficulty;
    chips.appendChild(diffChip);
  }
  if (chips.childNodes.length) {
    challengeContent.appendChild(chips);
  }

  if (Array.isArray(challenge.instructions) && challenge.instructions.length) {
    const list = document.createElement("ul");
    challenge.instructions.slice(0, 6).forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      list.appendChild(li);
    });
    challengeContent.appendChild(list);
  }
}

function triggerChallengeGeneration(options = {}) {
  const { force = false } = options;
  const todayISO = todayInfo.iso;
  const plan = state.weeklyPlan[todayInfo.weekday];
  if (generatingChallenge) {
    return Promise.resolve();
  }
  if (!plan || !isValidTriplet(plan.field1, plan.field2, plan.field3)) {
    return Promise.resolve();
  }
  if (!force && state.challengeByDate[todayISO]) {
    return Promise.resolve();
  }

  if (force && state.challengeByDate[todayISO]) {
    delete state.challengeByDate[todayISO];
    saveState();
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "REPLACE_WITH_KEY") {
    const error = new Error("Gemini API key not configured. Update config.js.");
    error.retryable = false;
    generationError = error;
    generatingChallenge = false;
    renderChallengeCard();
    renderSliderAndSubmit();
    return Promise.resolve();
  }

  generatingChallenge = true;
  generationError = null;
  renderChallengeCard();
  const promise = generateChallengeForDate(todayISO, plan).finally(() => {
    generatingChallenge = false;
    renderChallengeCard();
    renderSliderAndSubmit();
  });
  return promise;
}

async function generateChallengeForDate(iso, plan) {
  try {
    const { systemPrompt, userPayload } = buildPrompt(
      plan.field1,
      plan.field2,
      plan.field3,
      iso,
      tzDisplay()
    );
    const endpoint =
      `${API_URL}/models/${MODEL_ID}:generateContent?key=${encodeURIComponent(
        GEMINI_API_KEY
      )}`;
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPayload }] }],
      generationConfig: { responseMimeType: "application/json" }
    };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error =
        response.status === 401 || response.status === 403
          ? new Error(
              "Gemini request unauthorized. Verify the API key in config.js."
            )
          : new Error(`Gemini error: ${response.status}`);
      if (response.status === 401 || response.status === 403) {
        error.retryable = false;
      }
      throw error;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) {
      throw new Error("Empty response");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      throw new Error("Invalid JSON from Gemini");
    }

    const normalized = normalizeChallenge(parsed);
    state.challengeByDate[iso] = normalized;
    state.lastValueMovedToday = null;
    saveState();
  } catch (error) {
    console.error("Challenge generation failed", error);
    generationError = error;
  }
}

function normalizeChallenge(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Missing challenge payload");
  }
  const title = sanitizeText(payload.title, "Daily Challenge");
  const objective = sanitizeText(payload.objective, "Stay consistent today.");
  const est_time_min = Number.parseInt(payload.est_time_min, 10);
  const difficulty = sanitizeText(payload.difficulty, "Moderate");
  let instructions = [];
  if (Array.isArray(payload.instructions)) {
    instructions = payload.instructions
      .map((item) => sanitizeText(item, ""))
      .filter(Boolean)
      .slice(0, 6);
  }
  if (!instructions.length) {
    instructions = ["Follow the prompt and listen to your body."];
  }
  return {
    title,
    objective,
    est_time_min: Number.isFinite(est_time_min) ? est_time_min : undefined,
    difficulty,
    instructions
  };
}

function sanitizeText(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim() || fallback;
}

function renderSliderAndSubmit() {
  const todayISO = todayInfo.iso;
  const challenge = state.challengeByDate[todayISO];
  const result = state.resultsByDate[todayISO];
  if (!challenge) {
    radialSliderRoot.classList.add("hidden");
    submitScoreButton.classList.add("hidden");
    scoreRangeInput.disabled = true;
    hideSubmissionChip();
    return;
  }
  if (result) {
    radialSliderRoot.classList.add("hidden");
    submitScoreButton.classList.add("hidden");
    scoreRangeInput.disabled = true;
    showSubmissionChip(result.score1to10);
    return;
  }
  hideSubmissionChip();
  radialSliderRoot.classList.remove("hidden");
  submitScoreButton.classList.remove("hidden");
  scoreRangeInput.disabled = false;
  submitScoreButton.disabled = typeof state.lastValueMovedToday !== "number";
  if (typeof state.lastValueMovedToday === "number") {
    updateSliderVisual(state.lastValueMovedToday);
    scoreRangeInput.value = state.lastValueMovedToday;
    latestDragValue = state.lastValueMovedToday;
  } else {
    updateSliderVisual(null);
    scoreRangeInput.value = "1";
    latestDragValue = null;
  }
}

const submissionChip = document.getElementById("submissionChip");

function showSubmissionChip(value) {
  if (!submissionChip) return;
  submissionChip.textContent = `Submitted: ${value}/10`;
  submissionChip.classList.remove("hidden");
}

function hideSubmissionChip() {
  if (!submissionChip) return;
  submissionChip.classList.add("hidden");
}

function handleScoreSubmit() {
  const todayISO = todayInfo.iso;
  const challenge = state.challengeByDate[todayISO];
  if (!challenge) {
    return;
  }
  const value = state.lastValueMovedToday;
  if (typeof value !== "number" || value < 1 || value > 10) {
    return;
  }
  const norm = (value - 1) / 9;
  const dayScore = Math.round(norm * 1000) / 10;
  const ema = state.metrics.emaProgress || 0;
  const emaNew = Math.round((ema * (1 - 0.15) + dayScore * 0.15) * 10) / 10;

  state.resultsByDate[todayISO] = {
    score1to10: value,
    norm,
    dayScore
  };
  state.metrics.emaProgress = emaNew;
  saveState();
  renderProgress();
  renderSliderAndSubmit();
}

async function handleProfileSave() {
  if (!profileSaveButton) {
    return;
  }

  const originalLabel = profileSaveButton.textContent;
  profileSaveButton.disabled = true;
  profileSaveButton.textContent = "Saving...";

  try {
    saveState();
    logWeeklyPlan();

    const todayPlan = state.weeklyPlan[todayInfo.weekday];
    const hasCompletePlan =
      todayPlan && isValidTriplet(todayPlan.field1, todayPlan.field2, todayPlan.field3);

    const generationPromise = hasCompletePlan
      ? triggerChallengeGeneration({ force: true })
      : Promise.resolve();

    if (window.location.hash !== "#/home") {
      window.location.hash = "#/home";
    } else {
      applyRoute("#/home");
      render();
    }

    await generationPromise;
  } finally {
    profileSaveButton.disabled = false;
    profileSaveButton.textContent = originalLabel;
  }
}

function logWeeklyPlan() {
  try {
    const weekDates = getWeekDates(parseISOToDate(todayInfo.iso));
    const rows = state.weeklyPlan.map((plan, index) => ({
      day: weekDates[index]?.label || `Day ${index + 1}`,
      date: weekDates[index]?.iso || "",
      field1: plan?.field1 || "",
      field2: plan?.field2 || "",
      field3: plan?.field3 || ""
    }));
    if (console.table) {
      console.table(rows);
    } else {
      console.log("Weekly plan:", rows);
    }
  } catch (error) {
    console.log("Weekly plan:", state.weeklyPlan);
  }
}

function recomputeEmaProgress() {
  const entries = Object.entries(state.resultsByDate || {})
    .filter(([, result]) => typeof result?.dayScore === "number")
    .sort(([isoA], [isoB]) => isoA.localeCompare(isoB));

  let ema = 0;
  entries.forEach(([, result]) => {
    ema = ema * (1 - 0.15) + result.dayScore * 0.15;
  });
  state.metrics.emaProgress = Math.round(ema * 10) / 10;
}

function populateSelect(selectEl, options, selectedValue = null) {
  selectEl.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select";
  placeholder.disabled = true;
  placeholder.selected = !selectedValue;
  selectEl.appendChild(placeholder);
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    if (option === selectedValue) {
      opt.selected = true;
      placeholder.selected = false;
    }
    selectEl.appendChild(opt);
  });
}

function setupRadialSlider() {
  const size = 220;
  const center = size / 2;
  const radius = 90;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.classList.add("radial-svg");
  svg.setAttribute("role", "presentation");
  svg.style.touchAction = "none";
  radialSliderRoot.appendChild(svg);

  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("cx", center);
  track.setAttribute("cy", center);
  track.setAttribute("r", radius);
  track.classList.add("slider-track");
  svg.appendChild(track);

  const ticksGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  ticksGroup.classList.add("slider-ticks");
  svg.appendChild(ticksGroup);

  for (let value = 1; value <= 10; value += 1) {
    const angle = valueToAngle(value);
    const inner = polarToCartesian(center, center, radius - 12, angle);
    const outer = polarToCartesian(center, center, radius, angle);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", inner.x);
    line.setAttribute("y1", inner.y);
    line.setAttribute("x2", outer.x);
    line.setAttribute("y2", outer.y);
    line.dataset.value = String(value);
    line.classList.add("slider-tick");
    ticksGroup.appendChild(line);
  }

  const knob = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  knob.setAttribute("cx", center);
  knob.setAttribute("cy", center - radius);
  knob.setAttribute("r", 12);
  knob.classList.add("slider-knob");
  svg.appendChild(knob);

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.classList.add("slider-label");
  label.setAttribute("x", center);
  label.setAttribute("y", center - radius - 20);
  label.textContent = "";
  svg.appendChild(label);

  let isPointerDown = false;

  const handlePointerDown = (event) => {
    event.preventDefault();
    svg.setPointerCapture(event.pointerId);
    isPointerDown = true;
    updateFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!isPointerDown) return;
    event.preventDefault();
    updateFromPointer(event);
  };

  const handlePointerUp = (event) => {
    if (!isPointerDown) return;
    event.preventDefault();
    isPointerDown = false;
    svg.releasePointerCapture(event.pointerId);
    if (typeof latestDragValue === "number") {
      commitSliderValue(latestDragValue);
    }
  };

  function updateFromPointer(event) {
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const value = positionToValue(x, y, center);
    if (value) {
      latestDragValue = value;
      updateSliderVisual(value);
    }
  }

  svg.addEventListener("pointerdown", handlePointerDown);
  svg.addEventListener("pointermove", handlePointerMove);
  svg.addEventListener("pointerup", handlePointerUp);
  svg.addEventListener("pointercancel", handlePointerUp);

  radialSliderRoot.dataset.knobSelector = ".slider-knob";
  radialSliderRoot.dataset.labelSelector = ".slider-label";
  radialSliderRoot.dataset.ticksSelector = ".slider-tick";
  radialSliderRoot.dataset.center = String(center);
  radialSliderRoot.dataset.radius = String(radius);
}

function updateSliderVisual(value) {
  const svg = radialSliderRoot.querySelector("svg");
  if (!svg) return;
  const knob = svg.querySelector(radialSliderRoot.dataset.knobSelector);
  const label = svg.querySelector(radialSliderRoot.dataset.labelSelector);
  const ticks = svg.querySelectorAll(radialSliderRoot.dataset.ticksSelector);
  const center = Number(radialSliderRoot.dataset.center);
  const radius = Number(radialSliderRoot.dataset.radius);

  ticks.forEach((tick) => {
    const tickValue = Number(tick.dataset.value);
    if (value && tickValue <= value) {
      tick.classList.add("active");
    } else {
      tick.classList.remove("active");
    }
  });

  if (value) {
    const angle = valueToAngle(value);
    const pos = polarToCartesian(center, center, radius, angle);
    knob.setAttribute("cx", pos.x);
    knob.setAttribute("cy", pos.y);
    label.setAttribute("x", pos.x);
    label.setAttribute("y", pos.y - 16);
    label.textContent = String(value);
    label.classList.remove("hidden");
  } else {
    const top = polarToCartesian(center, center, radius, -90);
    knob.setAttribute("cx", top.x);
    knob.setAttribute("cy", top.y);
    label.textContent = "";
    label.classList.add("hidden");
  }
}

function commitSliderValue(value) {
  if (typeof value !== "number" || value < 1 || value > 10) {
    return;
  }
  state.lastValueMovedToday = value;
  latestDragValue = value;
  scoreRangeInput.value = String(value);
  saveState();
  submitScoreButton.disabled = false;
  updateSliderVisual(value);
}

function valueToAngle(value) {
  return -90 + (value - 1) * 36;
}

function polarToCartesian(cx, cy, radius, angleDegrees) {
  const angleRad = (angleDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  };
}

function positionToValue(x, y, center) {
  const dx = x - center;
  const dy = y - center;
  const angle = Math.atan2(dy, dx);
  let degrees = (angle * 180) / Math.PI;
  degrees = (degrees + 360 + 90) % 360; // rotate so top is 0
  const value = Math.round(degrees / 36) + 1;
  return Math.max(1, Math.min(10, value));
}

function renderDebug() {
  if (!debugPanel) return;
  const todayPlan = state.weeklyPlan[todayInfo.weekday];
  const challenge = state.challengeByDate[todayInfo.iso];
  const ema = typeof state.metrics.emaProgress === "number" ? state.metrics.emaProgress : 0;
  debugPanel.innerHTML = `
    <strong>Debug</strong>
    <div>todayISO: ${todayInfo.iso}</div>
    <div>tz: ${todayInfo.tz}</div>
    <div>plan: ${todayPlan?.field1 || "-"}, ${todayPlan?.field2 || "-"}, ${todayPlan?.field3 || "-"}</div>
    <div>challenge loaded: ${Boolean(challenge)}</div>
    <div>emaProgress: ${ema.toFixed(1)}</div>
  `;
}
