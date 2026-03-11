/** Metadata for every supported icon library. */
export interface LibraryMeta {
  /** URL-safe slug used in route params */
  slug: string;
  /** Human-readable display name */
  name: string;
  /** Short description shown on the homepage card */
  description: string;
  /** Brand hex color */
  color: string;
  /** Tailwind gradient-from color token (used inline via style prop) */
  gradientFrom: string;
  /** Tailwind gradient-to color token */
  gradientTo: string;
  /** Approximate icon count string */
  approxCount: string;
  /** Official homepage URL */
  homepage: string;
  /** NPM package name */
  pkg: string;
  /** A handful of well-known icon names for the preview strip */
  sampleIcons: string[];
  /** Emoji used on cards */
  emoji: string;
}

export const LIBRARIES: Record<string, LibraryMeta> = {
  lucide: {
    slug: "lucide",
    name: "Lucide React",
    description:
      "Beautiful & consistent open-source icon toolkit. Clean, crisp SVGs that look great at any size.",
    color: "#f97316",
    gradientFrom: "#f97316",
    gradientTo: "#ea580c",
    approxCount: "1,700+",
    homepage: "https://lucide.dev",
    pkg: "lucide-react",
    sampleIcons: ["Star", "Heart", "Home", "Search", "Settings"],
    emoji: "✨",
  },
  fa: {
    slug: "fa",
    name: "Font Awesome",
    description:
      "The world's most popular and easiest to use icon set — perfect for web & app UI.",
    color: "#3b82f6",
    gradientFrom: "#3b82f6",
    gradientTo: "#2563eb",
    approxCount: "1,600+",
    homepage: "https://fontawesome.com",
    pkg: "react-icons/fa",
    sampleIcons: ["FaStar", "FaHeart", "FaHome", "FaSearch", "FaCog"],
    emoji: "🅰",
  },
  fi: {
    slug: "fi",
    name: "Feather Icons",
    description:
      "Simply beautiful open source icons. Each icon is designed on a 24×24 grid with an emphasis on simplicity and elegance.",
    color: "#10b981",
    gradientFrom: "#10b981",
    gradientTo: "#059669",
    approxCount: "280+",
    homepage: "https://feathericons.com",
    pkg: "react-icons/fi",
    sampleIcons: ["FiStar", "FiHeart", "FiHome", "FiSearch", "FiSettings"],
    emoji: "🪶",
  },
  md: {
    slug: "md",
    name: "Material Design",
    description:
      "Google's comprehensive Material Design icon library — thousands of icons spanning every category.",
    color: "#8b5cf6",
    gradientFrom: "#8b5cf6",
    gradientTo: "#7c3aed",
    approxCount: "4,000+",
    homepage: "https://fonts.google.com/icons",
    pkg: "react-icons/md",
    sampleIcons: ["MdStar", "MdFavorite", "MdHome", "MdSearch", "MdSettings"],
    emoji: "🎨",
  },
  bs: {
    slug: "bs",
    name: "Bootstrap Icons",
    description:
      "Free, high-quality, open-source icon library from the Bootstrap team. Works everywhere, not just Bootstrap projects.",
    color: "#ec4899",
    gradientFrom: "#ec4899",
    gradientTo: "#db2777",
    approxCount: "1,900+",
    homepage: "https://icons.getbootstrap.com",
    pkg: "react-icons/bs",
    sampleIcons: ["BsStar", "BsHeart", "BsHouse", "BsSearch", "BsGear"],
    emoji: "🅱",
  },
  io: {
    slug: "io",
    name: "Ionicons",
    description:
      "Premium icons crafted for Ionic Framework — hand-crafted, with iOS & Material Design variants.",
    color: "#06b6d4",
    gradientFrom: "#06b6d4",
    gradientTo: "#0891b2",
    approxCount: "1,300+",
    homepage: "https://ionic.io/ionicons",
    pkg: "react-icons/io",
    sampleIcons: ["IoIosStar", "IoIosHeart", "IoIosHome", "IoIosSearch", "IoIosSettings"],
    emoji: "⚡",
  },
  gi: {
    slug: "gi",
    name: "Game Icons",
    description:
      "A massive collection of free game-themed SVG icons — perfect for games, RPGs, and creative projects.",
    color: "#ef4444",
    gradientFrom: "#ef4444",
    gradientTo: "#dc2626",
    approxCount: "4,000+",
    homepage: "https://game-icons.net",
    pkg: "react-icons/gi",
    sampleIcons: ["GiBroadsword", "GiShield", "GiCastle", "GiDragonHead", "GiTreasureMap"],
    emoji: "🎮",
  },
  ri: {
    slug: "ri",
    name: "Remix Icons",
    description:
      "An open-source neutral-style system icon set covering core UI needs, designed for designers and developers.",
    color: "#f59e0b",
    gradientFrom: "#f59e0b",
    gradientTo: "#d97706",
    approxCount: "2,800+",
    homepage: "https://remixicon.com",
    pkg: "react-icons/ri",
    sampleIcons: ["RiStarLine", "RiHeartLine", "RiHome2Line", "RiSearchLine", "RiSettings3Line"],
    emoji: "🎯",
  },
  si: {
    slug: "si",
    name: "Simple Icons",
    description:
      "Free SVG icons for 3,000+ popular brands. The perfect set for tech logos, social media, and developer tools.",
    color: "#64748b",
    gradientFrom: "#64748b",
    gradientTo: "#475569",
    approxCount: "3,000+",
    homepage: "https://simpleicons.org",
    pkg: "react-icons/si",
    sampleIcons: ["SiGithub", "SiVercel", "SiNextdotjs", "SiReact", "SiTailwindcss"],
    emoji: "🏷",
  },
  tb: {
    slug: "tb",
    name: "Tabler Icons",
    description:
      "Over 5 000 free MIT-licensed high-quality SVG icons. Consistent, clean, and pixel-perfect at every size.",
    color: "#0ea5e9",
    gradientFrom: "#0ea5e9",
    gradientTo: "#0284c7",
    approxCount: "5,000+",
    homepage: "https://tabler.io/icons",
    pkg: "react-icons/tb",
    sampleIcons: ["TbStar", "TbHeart", "TbHome", "TbSearch", "TbSettings"],
    emoji: "📐",
  },
};

/** Ordered list of library slugs (determines card render order). */
export const LIBRARY_SLUGS = [
  "lucide",
  "tb",
  "md",
  "si",
  "gi",
  "ri",
  "fa",
  "bs",
  "fi",
  "io",
] as const;
export type LibrarySlug = (typeof LIBRARY_SLUGS)[number];

/** Returns true when a string is a valid library slug. */
export function isValidLibrary(slug: string): slug is LibrarySlug {
  return LIBRARY_SLUGS.includes(slug as LibrarySlug);
}
