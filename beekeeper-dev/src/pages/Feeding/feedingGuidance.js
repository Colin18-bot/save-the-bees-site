export const FEED_OPTIONS = [
  { value: "sugar_syrup", label: "Sugar syrup – homemade" },
  { value: "invert_syrup", label: "Prepared / invert bee syrup" },
  { value: "fondant", label: "Fondant / bee candy" },
  { value: "pollen_protein", label: "Pollen / protein feed" },
  { value: "frames_of_stores", label: "Frame(s) of stores" },
  { value: "dry_sugar", label: "Dry sugar / candy board" },
  { value: "other", label: "Other" },
];

export const POLLEN_FEED_OPTIONS = [
  { value: "pollen_substitute", label: "Pollen substitute" },
  { value: "pollen_supplement", label: "Pollen supplement" },
  { value: "pollen_patty", label: "Protein / pollen patty" },
  { value: "stored_pollen", label: "Stored pollen" },
  { value: "other", label: "Other" },
];

export const REASON_OPTIONS = [
  { value: "build_stores", label: "Build winter stores" },
  { value: "low_stores", label: "Low stores / emergency feeding" },
  { value: "spring_support", label: "Spring support" },
  { value: "nuc_split_support", label: "Nuc / split support" },
  { value: "brood_build_up", label: "Support brood build-up" },
  { value: "comb_drawing", label: "Encourage comb drawing / foundation" },
  { value: "nectar_dearth", label: "Nectar dearth / poor forage" },
  { value: "queen_rearing", label: "Queen rearing / mating nuc support" },
  { value: "post_shook_swarm", label: "Post shook-swarm support" },
  { value: "not_recorded", label: "Not recorded" },
  { value: "other", label: "Other" },
];

export const UNIT_OPTIONS = [
  { value: "litres", label: "Litres (L)" },
  { value: "millilitres", label: "Millilitres (ml)" },
  { value: "kilograms", label: "Kilograms (kg)" },
  { value: "grams", label: "Grams (g)" },
  { value: "patties", label: "Patties" },
  { value: "blocks", label: "Blocks" },
  { value: "frames", label: "Frames" },
  { value: "other", label: "Other" },
];

export const SYRUP_STRENGTHS = {
  thin: {
    label: "Thin / spring",
    waterPerKg: 1.26,
    description:
      "A lighter syrup for relatively immediate use, often used when spring stores are inadequate.",
  },
  medium: {
    label: "Medium",
    waterPerKg: 1,
    description:
      "A simple 1 kg white sugar to 1 litre water mix, often used as a general-purpose spring feed.",
  },
  thick: {
    label: "Thick / autumn stores",
    waterPerKg: 0.63,
    description:
      "National Bee Unit winter-strength syrup: 1 kg white sugar to about 630 ml water.",
  },
  custom: {
    label: "Custom recipe",
    waterPerKg: null,
    description:
      "Enter the litres of water you use per 1 kg of sugar and HiveTag will scale the recipe.",
  },
  not_recorded: {
    label: "Not recorded",
    waterPerKg: null,
    description: "Record the feeding without storing a syrup recipe.",
  },
};

export const FEED_GUIDANCE = {
  sugar_syrup: {
    title: "Sugar syrup",
    summary:
      "Use white granulated sugar. Thin syrup is generally used for more immediate consumption; stronger syrup is commonly used to build stores.",
    detail:
      "HiveTag uses UK guidance rather than a single temperature cut-off. Consider colony stores, season, weather and whether the bees are able to take down and process liquid feed. Avoid contaminating honey intended for human consumption with feed syrup.",
  },
  invert_syrup: {
    title: "Prepared / invert bee syrup",
    summary:
      "Commercial prepared bee feeds can be a convenient alternative to homemade sugar syrup.",
    detail:
      "Follow the supplier's current instructions and record the product or description where useful. The amount entered in HiveTag should be what was actually given to each hive.",
  },
  fondant: {
    title: "When is fondant normally used?",
    summary:
      "Fondant or bee candy is commonly used for winter or cold-weather top-ups when a colony is becoming light.",
    detail:
      "Place it where the cluster can reach it and continue to assess stores rather than feeding automatically. It can also be useful for small mating units and other situations where solid feed is convenient.",
  },
  pollen_protein: {
    title: "When is pollen / protein feed useful?",
    summary:
      "Consider pollen substitute, supplements or patties where natural or stored pollen is inadequate, particularly around early spring brood build-up.",
    detail:
      "Do not assume a colony needs protein feed when adequate pollen is available. Protein feeding can encourage brood rearing, which also increases the colony's carbohydrate requirement. Follow the supplier's instructions for commercial products.",
  },
  frames_of_stores: {
    title: "Using frames of stores",
    summary:
      "A frame of suitable stores can be transferred when appropriate and is best recorded as the number of frames given.",
    detail:
      "Only transfer comb or stores where you are satisfied with their disease and biosecurity status. Avoid introducing material of uncertain origin.",
  },
  dry_sugar: {
    title: "Dry sugar / candy board",
    summary:
      "Solid sugar feeding methods may be used as an alternative top-up method, particularly when liquid feeding is unsuitable.",
    detail:
      "Record the amount actually supplied and use a method appropriate for the colony, hive configuration and conditions.",
  },
  other: {
    title: "Other feed",
    summary:
      "Use this where the feed does not fit the standard HiveTag categories.",
    detail:
      "Add a clear description and record the amount actually given to each hive.",
  },
};

export const MAIN_GUIDANCE_CARDS = [
  FEED_GUIDANCE.sugar_syrup,
  FEED_GUIDANCE.fondant,
  FEED_GUIDANCE.pollen_protein,
  FEED_GUIDANCE.invert_syrup,
];

export const NBU_SUGAR_GUIDANCE_URL =
  "https://www.nationalbeeunit.com/assets/PDFs/3_Resources_for_beekeepers/Best_practice_guidelines/BPG_7a_Feeding_Bees_-_sugar.pdf";

export const NBU_POLLEN_GUIDANCE_URL =
  "https://www.nationalbeeunit.com/assets/PDFs/3_Resources_for_beekeepers/articles_reports/BBKA_news/BBKA_21_Feeding_Pollen_and_Substitutes_-_January_2013_p7.pdf";

export const BBKA_MARCH_GUIDANCE_URL =
  "https://www.bbka.org.uk/blog/march-in-the-apiary";

export const feedTypeLabel = (value, other = "") => {
  if (value === "other") return other || "Other";
  return FEED_OPTIONS.find((option) => option.value === value)?.label || value || "Feed";
};

export const pollenFeedLabel = (value, other = "") => {
  if (!value) return "";
  if (value === "other") return other || "Other";
  return POLLEN_FEED_OPTIONS.find((option) => option.value === value)?.label || value;
};

export const reasonLabel = (value, other = "") => {
  if (value === "other") return other || "Other";
  return REASON_OPTIONS.find((option) => option.value === value)?.label || value || "";
};

export const syrupStrengthLabel = (value) =>
  SYRUP_STRENGTHS[value]?.label || value || "";

export const unitShortLabel = (value, other = "") => {
  const labels = {
    litres: "L",
    millilitres: "ml",
    kilograms: "kg",
    grams: "g",
    patties: "patties",
    blocks: "blocks",
    frames: "frames",
    other: other || "",
  };
  return labels[value] || value || "";
};

export const suggestedUnitForFeed = (feedType) => {
  if (feedType === "sugar_syrup" || feedType === "invert_syrup") return "litres";
  if (feedType === "fondant" || feedType === "dry_sugar") return "kilograms";
  if (feedType === "pollen_protein") return "patties";
  if (feedType === "frames_of_stores") return "frames";
  return "other";
};

export const formatAmount = (amount, unit, unitOther = "") => {
  const numeric = Number(amount);
  const display = Number.isFinite(numeric)
    ? numeric.toLocaleString("en-GB", { maximumFractionDigits: 3 })
    : amount;
  return `${display} ${unitShortLabel(unit, unitOther)}`.trim();
};
