/**
 * Quote Generation System for 365 Daily Meditations
 * 
 * Generates philosophical and mathematical quotes organized by themes
 * that align with the visual animations and seasonal progression.
 */

export interface Quote {
  id: number;
  text: string;
  author: string;
  source?: string;
  theme: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  animationFamily: string;
  tags: string[];
}

// Core themes that cycle through the year
const THEMES = [
  'beginnings', 'growth', 'patterns', 'chaos', 'order', 'infinity',
  'transformation', 'cycles', 'emergence', 'complexity', 'simplicity',
  'harmony', 'balance', 'flow', 'stillness', 'motion', 'time',
  'space', 'consciousness', 'wisdom', 'truth', 'beauty', 'mystery'
];

// Mathematical and philosophical quote templates
const QUOTE_TEMPLATES = {
  mathematics: [
    "Mathematics is the language with which God has written the universe.",
    "In mathematics, the art of proposing a question must be held of higher value than solving it.",
    "Pure mathematics is, in its way, the poetry of logical ideas.",
    "Mathematics is the music of reason.",
    "The book of nature is written in the language of mathematics.",
    "Mathematics reveals its secrets only to those who approach it with pure love.",
    "God used beautiful mathematics in creating the world.",
    "Mathematics is the alphabet with which God has written the universe.",
    "The universe is not only queerer than we suppose, but queerer than we can suppose.",
    "Mathematics is the foundation of all exact knowledge of natural phenomena."
  ],
  
  philosophy: [
    "The unexamined life is not worth living.",
    "What we know is a drop, what we don't know is an ocean.",
    "The only true wisdom is in knowing you know nothing.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "The way that can be spoken is not the eternal Way.",
    "In the depth of winter, I finally learned that there was in me an invincible summer.",
    "The mind is everything. What you think you become.",
    "Life can only be understood backwards; but it must be lived forwards.",
    "The present moment is the only time over which we have dominion.",
    "Simplicity is the ultimate sophistication."
  ],
  
  nature: [
    "Nature is not only queerer than we suppose, but queerer than we can suppose.",
    "In every walk with nature, one receives far more than they seek.",
    "The clearest way into the Universe is through a forest wilderness.",
    "Nature does not hurry, yet everything is accomplished.",
    "Look deep into nature, and then you will understand everything better.",
    "The earth does not belong to us; we belong to the earth.",
    "Nature is the art of God.",
    "In nature, nothing exists alone.",
    "The poetry of the earth is never dead.",
    "Nature holds the key to our aesthetic, intellectual, cognitive and even spiritual satisfaction."
  ],
  
  consciousness: [
    "Consciousness is the fundamental thing in existence.",
    "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    "We are not going in circles, we are going upwards.",
    "The awakened person sees the world as it is: one continuous movement of energy.",
    "Consciousness is only possible through change; change is only possible through movement.",
    "The mind is like water. When agitated, it becomes difficult to see. When calm, everything becomes clear.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "The cave you fear to enter holds the treasure you seek.",
    "Everything you need is inside you – you just need to access it.",
    "The present moment is the only moment available to us, and it is the door to all moments."
  ]
};

const AUTHORS = {
  mathematics: [
    "Galileo Galilei", "Georg Cantor", "Albert Einstein", "Johannes Kepler",
    "Pythagoras", "Euclid", "Isaac Newton", "Carl Friedrich Gauss",
    "Leonhard Euler", "Henri Poincaré", "David Hilbert", "Archimedes"
  ],
  
  philosophy: [
    "Socrates", "Aristotle", "Plato", "Lao Tzu", "Buddha", "Marcus Aurelius",
    "Rumi", "Thich Nhat Hanh", "Alan Watts", "Eckhart Tolle", "Confucius",
    "Heraclitus", "Epictetus", "Seneca", "Zhuangzi", "Nagarjuna"
  ],
  
  nature: [
    "John Muir", "Rachel Carson", "Henry David Thoreau", "Ralph Waldo Emerson",
    "John Burroughs", "Aldo Leopold", "Annie Dillard", "Terry Tempest Williams",
    "Barry Lopez", "Wendell Berry", "Gary Snyder", "Robinson Jeffers"
  ],
  
  consciousness: [
    "Ramana Maharshi", "Jiddu Krishnamurti", "Sri Aurobindo", "Nisargadatta Maharaj",
    "Adyashanti", "Mooji", "Papaji", "Jean Klein", "Francis Lucille",
    "Rupert Spira", "Tony Parsons", "Jeff Foster", "Byron Katie"
  ]
};

// Generate a quote for a specific day
export function generateQuoteForDay(dayNumber: number): Quote {
  // Use day number as seed for reproducible randomness
  let seed = dayNumber;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Determine season based on day number (approximate)
  const season = dayNumber <= 91 ? 'spring' :
                 dayNumber <= 182 ? 'summer' :
                 dayNumber <= 273 ? 'autumn' : 'winter';
  
  // Select theme based on day progression
  const theme = THEMES[dayNumber % THEMES.length];
  
  // Select category based on day number pattern
  const categories = Object.keys(QUOTE_TEMPLATES);
  const category = categories[Math.floor(random() * categories.length)] as keyof typeof QUOTE_TEMPLATES;
  
  // Select quote and author
  const quotes = QUOTE_TEMPLATES[category];
  const authors = AUTHORS[category];
  
  const quoteText = quotes[Math.floor(random() * quotes.length)];
  const author = authors[Math.floor(random() * authors.length)];
  
  // Determine animation family based on theme and day
  const animationFamilies = [
    'torus_field', 'mandelbrot_zoom', 'lorenz_attractor', 'julia_morph',
    'double_pendulum', 'wave_interference', 'fibonacci_spiral', 'galaxy_formation',
    'sacred_geometry', 'flow_field', 'particle_life', 'cellular_automata'
  ];
  
  const animationFamily = animationFamilies[dayNumber % animationFamilies.length];
  
  return {
    id: dayNumber,
    text: quoteText,
    author,
    source: category === 'mathematics' ? 'Mathematical Principles' :
            category === 'philosophy' ? 'Philosophical Teachings' :
            category === 'nature' ? 'Nature Writings' :
            'Consciousness Studies',
    theme,
    season,
    animationFamily,
    tags: [category, theme, season]
  };
}

// Generate all 365 quotes
export function generateAllQuotes(): Quote[] {
  const quotes: Quote[] = [];
  
  for (let day = 1; day <= 365; day++) {
    quotes.push(generateQuoteForDay(day));
  }
  
  return quotes;
}

// Get quote by day number
export function getQuoteByDay(dayNumber: number): Quote {
  return generateQuoteForDay(Math.max(1, Math.min(365, dayNumber)));
}

// Get today's quote
export function getTodaysQuote(): Quote {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  return getQuoteByDay(dayOfYear);
}
