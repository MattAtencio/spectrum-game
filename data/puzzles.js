// ─── Puzzle Data ─────────────────────────────────────────────
// Each puzzle: theme, emoji, low/high labels, gradient colors, answer (ordered low→high)
// Add new puzzles to the end. Daily rotation: seed % PUZZLES.length

const PUZZLES = [
  // ── Original 8 ──
  { theme: "Speed",        emoji: "\u26a1",       low: "Slowest",   high: "Fastest",    colorA: "#93c5fd", colorB: "#f97316", answer: ["Glacier","Snail","Sloth","Walking","Jogging","Sprinting","Cheetah","Lightning"] },
  { theme: "Temperature",  emoji: "\ud83c\udf21\ufe0f",     low: "Coldest",   high: "Hottest",    colorA: "#60a5fa", colorB: "#ef4444", answer: ["Blizzard","Frost","Chilly","Cool","Warm","Toasty","Scorching","Inferno"] },
  { theme: "Volume",       emoji: "\ud83d\udd0a",      low: "Quietest",  high: "Loudest",    colorA: "#86efac", colorB: "#dc2626", answer: ["Silence","Rustle","Whisper","Murmur","Talking","Shouting","Thunder","Rocket"] },
  { theme: "Size",         emoji: "\ud83d\udcd0",      low: "Tiniest",   high: "Largest",    colorA: "#c4b5fd", colorB: "#fbbf24", answer: ["Atom","Cell","Ant","Grape","Basketball","Car","Whale","Mountain"] },
  { theme: "Spice Level",  emoji: "\ud83c\udf36\ufe0f",     low: "Mildest",   high: "Spiciest",   colorA: "#fde68a", colorB: "#dc2626", answer: ["Cucumber","Bell Pepper","Paprika","Jalape\u00f1o","Serrano","Habanero","Ghost Pepper","Carolina Reaper"] },
  { theme: "Wealth",       emoji: "\ud83d\udcb0",      low: "Poorest",   high: "Richest",    colorA: "#d1fae5", colorB: "#fbbf24", answer: ["Broke","Struggling","Getting By","Middle Class","Comfortable","Wealthy","Millionaire","Billionaire"] },
  { theme: "Brightness",   emoji: "\ud83d\udca1",      low: "Darkest",   high: "Brightest",  colorA: "#1e1b4b", colorB: "#fef08a", answer: ["Cave","Midnight","Overcast","Dawn","Cloudy","Daylight","Spotlight","Sun"] },
  { theme: "Age",          emoji: "\u23f3",       low: "Youngest",  high: "Oldest",     colorA: "#bfdbfe", colorB: "#92400e", answer: ["Newborn","Toddler","Child","Teen","Young Adult","Middle-Aged","Senior","Ancient"] },

  // ── Expanded ──
  { theme: "Danger",       emoji: "\u26a0\ufe0f",      low: "Safest",    high: "Deadliest",  colorA: "#bbf7d0", colorB: "#dc2626", answer: ["Pillow","Hamster","Bicycle","Skateboard","Motorcycle","Crocodile","Volcano","Black Hole"] },
  { theme: "Distance",     emoji: "\ud83d\udee3\ufe0f",     low: "Nearest",   high: "Farthest",   colorA: "#bfdbfe", colorB: "#4f46e5", answer: ["Nose","Mailbox","School","Airport","Coast","Continent","Moon","Galaxy"] },
  { theme: "Depth",        emoji: "\ud83c\udf0a",      low: "Shallowest",high: "Deepest",    colorA: "#bae6fd", colorB: "#1e3a5f", answer: ["Puddle","Kiddie Pool","River","Lake","Coral Reef","Submarine","Titanic","Mariana Trench"] },
  { theme: "Complexity",   emoji: "\ud83e\udde9",      low: "Simplest",  high: "Hardest",    colorA: "#d9f99d", colorB: "#7c3aed", answer: ["Tic-Tac-Toe","Checkers","Sudoku","Chess","Go","Quantum Physics","Brain Surgery","Rocket Science"] },
  { theme: "Popularity",   emoji: "\ud83c\udf1f",      low: "Obscure",   high: "Famous",     colorA: "#e2e8f0", colorB: "#eab308", answer: ["Kazoo","Ukulele","Banjo","Trumpet","Piano","Guitar","Drums","Violin"] },
  { theme: "Sweetness",    emoji: "\ud83c\udf6c",      low: "Bitter",    high: "Sweetest",   colorA: "#fef3c7", colorB: "#ec4899", answer: ["Black Coffee","Dark Chocolate","Grapefruit","Apple","Grape","Honey","Candy Corn","Cotton Candy"] },
  { theme: "Hardness",     emoji: "\ud83d\udc8e",      low: "Softest",   high: "Hardest",    colorA: "#fce7f3", colorB: "#64748b", answer: ["Marshmallow","Cotton","Rubber","Wood","Glass","Steel","Titanium","Diamond"] },
  { theme: "Weight",       emoji: "\u2696\ufe0f",      low: "Lightest",  high: "Heaviest",   colorA: "#e0f2fe", colorB: "#78350f", answer: ["Feather","Penny","Apple","Brick","Bowling Ball","Person","Elephant","Blue Whale"] },
  { theme: "Caffeine",     emoji: "\u2615",       low: "Least",     high: "Most",       colorA: "#fef9c3", colorB: "#78350f", answer: ["Decaf Tea","Hot Cocoa","Green Tea","Black Tea","Cola","Drip Coffee","Espresso","Energy Drink"] },
  { theme: "Internet Speed", emoji: "\ud83d\udcf6",   low: "Slowest",   high: "Fastest",    colorA: "#fecaca", colorB: "#22c55e", answer: ["Dial-Up","2G","3G","DSL","4G LTE","Cable","5G","Fiber Optic"] },
  { theme: "Planet Distance", emoji: "\ud83e\ude90",  low: "Nearest",   high: "Farthest",   colorA: "#fed7aa", colorB: "#1e1b4b", answer: ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"] },
  { theme: "Animal Lifespan", emoji: "\ud83d\udc22",  low: "Shortest",  high: "Longest",    colorA: "#fef08a", colorB: "#166534", answer: ["Mayfly","Mouse","Rabbit","Dog","Horse","Elephant","Whale","Tortoise"] },
  { theme: "Wind Speed",   emoji: "\ud83c\udf2c\ufe0f",     low: "Calmest",   high: "Strongest",  colorA: "#e0f2fe", colorB: "#475569", answer: ["Still Air","Breeze","Wind","Gust","Gale","Storm","Hurricane","Tornado"] },
  { theme: "Cooking Time", emoji: "\ud83c\udf73",      low: "Quickest",  high: "Longest",    colorA: "#fef08a", colorB: "#ea580c", answer: ["Toast","Scrambled Eggs","Pasta","Grilled Chicken","Baked Potato","Lasagna","Pulled Pork","Beef Brisket"] },
  { theme: "Vehicle Cost", emoji: "\ud83d\ude97",      low: "Cheapest",  high: "Priciest",   colorA: "#d1fae5", colorB: "#eab308", answer: ["Skateboard","Bicycle","Scooter","Used Car","New Car","Tesla","Ferrari","Yacht"] },
  { theme: "Musical Tempo", emoji: "\ud83c\udfb5",    low: "Slowest",   high: "Fastest",    colorA: "#e0e7ff", colorB: "#dc2626", answer: ["Lullaby","Ballad","Waltz","Pop","Rock","Punk","Techno","Drum & Bass"] },
  { theme: "Emotional Intensity", emoji: "\ud83d\ude2d", low: "Mildest", high: "Strongest", colorA: "#fef3c7", colorB: "#be123c", answer: ["Content","Pleased","Happy","Excited","Thrilled","Overjoyed","Euphoric","Ecstatic"] },
  { theme: "Historical Era", emoji: "\ud83c\udfdb\ufe0f",  low: "Oldest",    high: "Newest",     colorA: "#d6d3d1", colorB: "#3b82f6", answer: ["Stone Age","Bronze Age","Iron Age","Roman Empire","Middle Ages","Renaissance","Industrial","Digital"] },
  { theme: "Ocean Depth",  emoji: "\ud83d\udc19",      low: "Surface",   high: "Abyss",      colorA: "#bae6fd", colorB: "#0f172a", answer: ["Beach","Snorkeling","Scuba Diving","Reef","Twilight Zone","Anglerfish","Sperm Whale","Hadal Zone"] },
  { theme: "Mountain Height", emoji: "\ud83c\udfd4\ufe0f", low: "Lowest",  high: "Tallest",    colorA: "#d1fae5", colorB: "#e2e8f0", answer: ["Hill","Ben Nevis","Fuji","Matterhorn","Kilimanjaro","Denali","K2","Everest"] },
  { theme: "City Population", emoji: "\ud83c\udfd9\ufe0f", low: "Smallest", high: "Largest",   colorA: "#fef9c3", colorB: "#f97316", answer: ["Village","Small Town","Suburb","Austin","Seattle","London","Tokyo","Shanghai"] },
  { theme: "Book Length",   emoji: "\ud83d\udcda",      low: "Shortest",  high: "Longest",    colorA: "#fce7f3", colorB: "#7c3aed", answer: ["Haiku","Short Story","Novella","Novel","Epic","Textbook","Encyclopedia","Dictionary"] },
  { theme: "Scariness",    emoji: "\ud83d\udc7b",      low: "Cute",      high: "Terrifying", colorA: "#fbcfe8", colorB: "#1c1917", answer: ["Kitten","Clown Fish","Owl","Bat","Spider","Snake","Shark","Kraken"] },
  { theme: "Patience Required", emoji: "\u231b",  low: "Instant",   high: "Endless",    colorA: "#d9f99d", colorB: "#94a3b8", answer: ["Microwave","Fast Food","Uber","Laundry","Commute","DMV Line","Tax Refund","Glacier Movement"] },
];

export default PUZZLES;
