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
