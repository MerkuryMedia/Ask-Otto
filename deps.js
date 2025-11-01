export const FIELD1_OPTIONS = [
  "weightlifting",
  "bodyweight",
  "aerobics",
  "mobility",
  "rest day",
  "sports",
  "outdoors",
  "cheat day",
  "mix"
];

const FIELD23_OPTIONS = {
  weightlifting: [
    "push",
    "pull",
    "full body",
    "chest",
    "shoulders",
    "triceps",
    "biceps",
    "arms",
    "forearms",
    "lats",
    "traps",
    "back",
    "legs",
    "glutes",
    "calves",
    "thighs",
    "core",
    "hamstrings",
    "abs",
    "grip"
  ],
  bodyweight: [
    "push",
    "pull",
    "full body",
    "circuit",
    "calisthenics",
    "gymnastics",
    "chest",
    "shoulders",
    "triceps",
    "biceps",
    "arms",
    "forearms",
    "lats",
    "traps",
    "back",
    "legs",
    "glutes",
    "calves",
    "thighs",
    "core",
    "hamstrings",
    "abs",
    "grip"
  ],
  aerobics: [
    "running",
    "rowing",
    "swimming",
    "cycling",
    "jump rope",
    "dance",
    "cardio boxing",
    "elliptical",
    "stair climbing",
    "sprints",
    "circuit",
    "walking"
  ],
  mobility: [
    "yoga",
    "pilates",
    "tai chi",
    "static stretch",
    "dynamic stretch",
    "gymnastics",
    "ballet"
  ],
  "rest day": [
    "do nothing",
    "sleep",
    "watch tv",
    "read",
    "get a massage",
    "cuisine",
    "hobby",
    "socialization",
    "self care",
    "meditation"
  ],
  sports: [
    "Soccer",
    "Basketball",
    "Cricket",
    "Tennis",
    "Baseball",
    "Softball",
    "Field Hockey",
    "Ice Hockey",
    "Rugby",
    "American Football",
    "Water Polo",
    "Handball",
    "Dodgeball",
    "Kickball",
    "Ultimate Frisbee",
    "Pickleball",
    "Squash",
    "Racquetball",
    "Badminton",
    "Lacrosse",
    "other"
  ],
  outdoors: [
    "running",
    "hiking",
    "cycling",
    "mountain biking",
    "rock climbing",
    "skiing",
    "snowboarding",
    "surfing",
    "horseback riding",
    "kayaking",
    "canoeing",
    "skateboarding"
  ],
  "cheat day": [
    "indulge",
    "dessert binge",
    "overeat",
    "drinks",
    "carbo load",
    "cheese day",
    "treat yourself"
  ],
  mix: [
    "weightlifting",
    "bodyweight",
    "aerobics",
    "mobility",
    "rest day",
    "sports",
    "outdoors",
    "cheat day"
  ]
};

export function getField2Options(field1) {
  const options = FIELD23_OPTIONS[field1];
  return options ? [...options] : [];
}

export function getField3Options(field1) {
  const options = FIELD23_OPTIONS[field1];
  return options ? [...options] : [];
}

export function isValidTriplet(field1, field2, field3) {
  if (!FIELD1_OPTIONS.includes(field1)) {
    return false;
  }
  const options = FIELD23_OPTIONS[field1];
  if (!options) {
    return false;
  }
  return options.includes(field2) && options.includes(field3);
}
