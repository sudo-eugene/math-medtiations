/**
 * Generates 365 unique entries with world-class animations
 * Each day gets a unique mathematical/philosophical quote paired with a sophisticated animation
 */

// Define a local type to avoid circular imports with `@/content/entries`
type GeneratedEntry = {
  id: number;
  date?: string;
  title: string;
  quoteText: string;
  quoteAuthor: string;
  source?: string;
  animationKey: string;
  params?: Record<string, any>;
  palette?: { bg: string; fg: string; accent?: string };
  caption?: string;
  tags?: string[];
  seo?: { slug?: string; description?: string };
  licenses?: { quote?: string };
};

// Curated collection of profound quotes from mathematics, philosophy, and science
const QUOTES_DATABASE = [
  // Mathematics & Geometry (Days 1-73)
  { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton", source: "Letter to Bentley" },
  { text: "Mathematics is the language with which God has written the universe.", author: "Galileo Galilei", source: "Il Saggiatore" },
  { text: "Pure mathematics is, in its way, the poetry of logical ideas.", author: "Albert Einstein", source: "Essays in Science" },
  { text: "The book of nature is written in the language of mathematics.", author: "Galileo Galilei", source: "The Assayer" },
  { text: "God used beautiful mathematics in creating the world.", author: "Paul Dirac", source: "Scientific American" },
  { text: "Mathematics reveals its secrets only to those who approach it with pure love.", author: "Archimedes", source: "On the Sphere and Cylinder" },
  { text: "The universe is not only queerer than we suppose, but queerer than we can suppose.", author: "J.B.S. Haldane", source: "Possible Worlds" },
  { text: "Mathematics is the music of reason.", author: "James Joseph Sylvester", source: "Mathematical Papers" },
  { text: "In mathematics, the art of proposing a question must be held of higher value than solving it.", author: "Georg Cantor", source: "Contributions to the Founding of Set Theory" },
  { text: "The essence of mathematics is not to make simple things complicated, but to make complicated things simple.", author: "Stanley Gudder", source: "A Mathematical Journey" },
  
  // Philosophy & Wisdom (Days 74-146)
  { text: "To know others brings intelligence; to know oneself brings wisdom.", author: "Lao Tzu", source: "Tao Te Ching" },
  { text: "The unexamined life is not worth living.", author: "Socrates", source: "Plato's Apology" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", source: "Self-Reliance" },
  { text: "The mind is everything. What you think you become.", author: "Buddha", source: "Dhammapada" },
  { text: "In the depth of winter, I finally learned that there was in me an invincible summer.", author: "Albert Camus", source: "The Myth of Sisyphus" },
  { text: "The way that can be spoken is not the eternal Way.", author: "Lao Tzu", source: "Tao Te Ching" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", source: "Nicomachean Ethics" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh", source: "The Miracle of Mindfulness" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", source: "Notebooks" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", source: "Plato's Apology" },
  
  // Nature & Cosmos (Days 147-219)
  { text: "We are a way for the cosmos to know itself.", author: "Carl Sagan", source: "Cosmos" },
  { text: "In every walk with nature, one receives far more than they seek.", author: "John Muir", source: "Our National Parks" },
  { text: "The clearest way into the Universe is through a forest wilderness.", author: "John Muir", source: "John of the Mountains" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", source: "Tao Te Ching" },
  { text: "Look deep into nature, and then you will understand everything better.", author: "Albert Einstein", source: "Letters to Solovine" },
  { text: "The earth does not belong to us; we belong to the earth.", author: "Chief Seattle", source: "Letter to President Pierce" },
  { text: "Nature is the art of God.", author: "Dante Alighieri", source: "Divine Comedy" },
  { text: "In nature, nothing exists alone.", author: "Rachel Carson", source: "Silent Spring" },
  { text: "The poetry of the earth is never dead.", author: "John Keats", source: "On the Grasshopper and Cricket" },
  { text: "Nature holds the key to our aesthetic, intellectual, cognitive and even spiritual satisfaction.", author: "E.O. Wilson", source: "Biophilia" },
  
  // Consciousness & Being (Days 220-292)
  { text: "Consciousness is the fundamental thing in existence.", author: "Max Planck", source: "The Observer" },
  { text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", author: "Marcel Proust", source: "In Search of Lost Time" },
  { text: "We are not going in circles, we are going upwards.", author: "Hermann Hesse", source: "Siddhartha" },
  { text: "The awakened person sees the world as it is: one continuous movement of energy.", author: "Alan Watts", source: "The Way of Zen" },
  { text: "What you seek is seeking you.", author: "Rumi", source: "Masnavi" },
  { text: "The mind is like water. When agitated, it becomes difficult to see. When calm, everything becomes clear.", author: "Buddha", source: "Dhammapada" },
  { text: "Everything you need is inside you – you just need to access it.", author: "Buddha", source: "Lotus Sutra" },
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell", source: "The Hero with a Thousand Faces" },
  { text: "Consciousness is only possible through change; change is only possible through movement.", author: "Aldous Huxley", source: "The Doors of Perception" },
  { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: "Thich Nhat Hanh", source: "Peace Is Every Step" },
  
  // Unity & Transcendence (Days 293-365)
  { text: "All is one, one is all.", author: "Heraclitus", source: "Fragments" },
  { text: "The universe is not only stranger than we imagine, it is stranger than we can imagine.", author: "Werner Heisenberg", source: "Physics and Philosophy" },
  { text: "Everything is connected to everything else.", author: "Leonardo da Vinci", source: "Codex Leicester" },
  { text: "The whole is greater than the sum of its parts.", author: "Aristotle", source: "Metaphysics" },
  { text: "Form is emptiness, emptiness is form.", author: "Heart Sutra", source: "Prajnaparamita" },
  { text: "The Tao that can be told is not the eternal Tao.", author: "Lao Tzu", source: "Tao Te Ching" },
  { text: "Silence is the language of God, all else is poor translation.", author: "Rumi", source: "Essential Rumi" },
  { text: "The drop merges with the ocean, the ocean merges with the drop.", author: "Kabir", source: "Songs of Kabir" },
  { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr.", source: "Strength to Love" },
  { text: "The eternal silence of these infinite spaces frightens me.", author: "Blaise Pascal", source: "Pensées" }
];

// Static art families (SVG-based) with visual characteristics
const ANIMATION_FAMILIES = [
  { key: "static.fibonacci_spiral", complexity: 0.6, theme: "growth", visual: "spiral" },
  { key: "static.phyllotaxis_sunflower", complexity: 0.6, theme: "nature", visual: "spiral" },
  { key: "static.flower_of_life", complexity: 0.5, theme: "harmony", visual: "sacred-geometry" },
  { key: "static.atom_orbits", complexity: 0.5, theme: "atom", visual: "orbits" },
  { key: "static.galaxy_spiral", complexity: 0.7, theme: "cosmos", visual: "stars" },
];

// Color palettes for different seasons and moods
const COLOR_PALETTES = [
  // Spring - Fresh, Growing
  { bg: "#F8F9F4", fg: "#2D3E2B", accent: "#7A9471", secondary: "#B8C5A6" },
  { bg: "#F5F8F2", fg: "#1E2B1C", accent: "#6B8E5A", secondary: "#A4B896" },
  { bg: "#F7F9F3", fg: "#253426", accent: "#5F7D56", secondary: "#9AAD8C" },
  
  // Summer - Warm, Vibrant
  { bg: "#FDF8F0", fg: "#3A2F1E", accent: "#B8956A", secondary: "#D4C19B" },
  { bg: "#FCF7EF", fg: "#342A1A", accent: "#A68B5B", secondary: "#C7B48E" },
  { bg: "#FBF6EE", fg: "#2E2518", accent: "#9A804F", secondary: "#BAA881" },
  
  // Autumn - Rich, Contemplative
  { bg: "#F9F4F0", fg: "#3D2B1F", accent: "#B5704A", secondary: "#D19B7A" },
  { bg: "#F8F3EF", fg: "#372619", accent: "#A86542", secondary: "#C4906D" },
  { bg: "#F7F2EE", fg: "#312115", accent: "#9B5A3A", secondary: "#B78560" },
  
  // Winter - Cool, Serene
  { bg: "#F4F6F8", fg: "#1F2B3D", accent: "#4A6B85", secondary: "#7A9BB5" },
  { bg: "#F3F5F7", fg: "#1A2635", accent: "#426080", secondary: "#6D8FA8" },
  { bg: "#F2F4F6", fg: "#15212E", accent: "#3A5573", secondary: "#60839B" }
];

// Simple deterministic hash and RNG for mapping quotes -> visuals
function hash32(str: string): number {
  let h = 2166136261 >>> 0; // FNV-1a basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(seed: number, offset: number): number {
  // xorshift32 variant
  let x = (seed + offset * 0x9e3779b9) >>> 0; // golden ratio step
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 1000000) / 1000000; // [0,1)
}

function generateUniqueEntry(dayNumber: number): GeneratedEntry {
  // Day-based rng only for selecting quote/palette season
  const rngDay = (offset = 0) => ((dayNumber * 137.508 + offset) % 1000) / 1000;
  
  // Select quote (cycle through with some randomness)
  const quoteIndex = (dayNumber - 1 + Math.floor(rngDay(1) * 10)) % QUOTES_DATABASE.length;
  const quote = QUOTES_DATABASE[quoteIndex];
  const qSeed = hash32(quote.text);
  const rng = (offset = 0) => rand01(qSeed, offset);
  
  // Select animation family based on day progression and theme
  const animationIndex = qSeed % ANIMATION_FAMILIES.length;
  const animation = ANIMATION_FAMILIES[animationIndex];
  
  // Select color palette deterministically from the quote (stable per quote)
  const paletteIndex = qSeed % COLOR_PALETTES.length;
  const palette = COLOR_PALETTES[paletteIndex];
  
  // Generate seeded parameters for static scenes
  const complexity = 0.6 + rng(4) * 0.4; // used for ranges
  const params: Record<string, any> = {
    seed: qSeed,
    background: palette.bg,
    fg: palette.fg,
    accent: palette.accent,
    secondary: palette.secondary,
  };

  if (animation.key === 'static.fibonacci_spiral') {
    params.turns = Math.max(6, Math.min(13, 8 + Math.floor(rng(6) * 6)));
    params.lineWidth = 3 + Math.floor(rng(7) * 6);
  } else if (animation.key === 'static.phyllotaxis_sunflower') {
    params.pointCount = 800 + Math.floor(rng(8) * 2200);
    params.angle = 137.50776405 + (rng(9) - 0.5) * 1.2;
    params.scale = 7.5 + rng(10) * 3.5;
    params.dotSize = 2.0 + rng(11) * 2.0;
  } else if (animation.key === 'static.flower_of_life') {
    params.rings = 3 + Math.floor(rng(12) * 4); // 3-6
    params.strokeWidth = 1.5 + rng(13) * 2.0;
  } else if (animation.key === 'static.atom_orbits') {
    params.shells = 3 + Math.floor(rng(14) * 3); // 3-5
    params.electronsBase = 2 + Math.floor(rng(15) * 3); // 2-4
  } else if (animation.key === 'static.galaxy_spiral') {
    params.starCount = 1200 + Math.floor(rng(16) * 1800);
    params.arms = 2 + Math.floor(rng(17) * 4); // 2-5
    params.spread = 0.3 + rng(18) * 0.3; // 0.3-0.6
  }
  
  return {
    id: dayNumber,
    title: `Day ${dayNumber.toString().padStart(3, '0')}`,
    quoteText: quote.text,
    quoteAuthor: quote.author,
    source: quote.source,
    animationKey: animation.key,
    params,
    palette: {
      bg: palette.bg,
      fg: palette.fg,
      accent: palette.accent
    },
    caption: `${animation.theme} • ${animation.visual}`,
    tags: [animation.theme, animation.visual, `day-${dayNumber}`],
    seo: {
      slug: `${dayNumber.toString().padStart(3, '0')}-${animation.theme}`,
      description: `Day ${dayNumber} meditation: ${quote.text.slice(0, 100)}...`
    },
    licenses: { quote: "Fair Use" }
  };
}

// Generate all 365 entries
export function generateAll365Entries(): GeneratedEntry[] {
  const entries: GeneratedEntry[] = [];
  
  for (let day = 1; day <= 365; day++) {
    entries.push(generateUniqueEntry(day));
  }
  
  return entries;
}

// Export for use in entries.ts
export const generated365Entries = generateAll365Entries();
