import "dotenv/config";
import * as bcrypt from "bcrypt";
import { sql } from "kysely";
import { db, generateId } from "../server/db/index.js";
import type {
  ChannelType,
  CommunityJoinRequestStatus,
  NotificationType
} from "../server/db/tables/index.js";

// ─── Config ──────────────────────────────────────────────────────────────────
const PASSWORD = "Password@123";
const EMOJIS = ["🔥", "👍", "😂", "❤️", "🎉", "🤝", "💯", "🚀"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}
function chunk<T>(items: T[], size: number): T[][] {
  const r: T[][] = [];
  for (let i = 0; i < items.length; i += size) r.push(items.slice(i, i + size));
  return r;
}
async function insertChunked<T extends object>(
  table: Parameters<typeof db.insertInto>[0],
  rows: T[],
  size = 500
) {
  for (const part of chunk(rows, size)) {
    if (part.length) await db.insertInto(table).values(part).execute();
  }
}

// ─── 49 Users with local avatars ─────────────────────────────────────────────
const people = [
  {
    username: "jerry_bhai",
    firstName: "Jerry",
    lastName: "Bhai",
    email: "jerry@gmail.com",
    avatar: "/uploads/avatars/a1.jpeg",
    background: "/uploads/backgrounds/b1.jpg",
    about: "Just an ordinary mouse with extraordinary plans.",
    location: "Cartoon City"
  },
  {
    username: "tom",
    firstName: "Tom",
    lastName: "Jasper",
    email: "tom.jasper@gmail.com",
    avatar: "/uploads/avatars/a2.jpg",
    background: "/uploads/backgrounds/b2.webp",
    about: "A cat with a never-ending chase and a heart of gold.",
    location: "Cartoon City"
  },
  {
    username: "doremon",
    firstName: "Doremon",
    lastName: "Robot Cat",
    email: "doremon@gmail.com",
    avatar: "/uploads/avatars/a3.jpg",
    background: "",
    about: "A robotic cat from the future, here to help!",
    location: "Tokyo, Japan"
  },
  {
    username: "tinku_bhai",
    firstName: "Tinku",
    lastName: "Bhai",
    email: "tinkubhai@gmail.com",
    avatar: "/uploads/avatars/a4.jpg",
    background: "",
    about: "Full stack developer by day, gamer by night.",
    location: "Mumbai, India"
  },
  {
    username: "ludobhai",
    firstName: "Ludo",
    lastName: "Bhai",
    email: "ludobhai@gmail.com",
    avatar: "/uploads/avatars/a5.jpeg",
    background: "/uploads/backgrounds/b6.jpeg",
    about: "Life is a dice roll. Always aiming for a six!",
    location: "Mumbai, India"
  },
  {
    username: "munnabhai",
    firstName: "Munna",
    lastName: "Bhai",
    email: "munna_bhai@gmail.com",
    avatar: "/uploads/avatars/a6.png",
    background: "/uploads/backgrounds/b6.jpeg",
    about: "Jaadu ki jhappi specialist. Spreading love everywhere.",
    location: "Mumbai, India"
  },
  {
    username: "bablibhai",
    firstName: "Babli",
    lastName: "Bhai",
    email: "babli_bhai@gmail.com",
    avatar: "/uploads/avatars/a7.jpg",
    background: "",
    about: "Creative designer and UI enthusiast.",
    location: "Pune, India"
  },
  {
    username: "rajuhalkat",
    firstName: "Raju",
    lastName: "Sharma",
    email: "raju@gmail.com",
    avatar: "/uploads/avatars/a8.webp",
    background: "/uploads/backgrounds/b8.jpg",
    about: "Entrepreneur and startup dreamer.",
    location: "Mumbai, India"
  },
  {
    username: "tiwari_seth",
    firstName: "Tiwari",
    lastName: "Seth",
    email: "tiwari.seth@gmail.com",
    avatar: "/uploads/avatars/a9.jpg",
    background: "",
    about: "Business analytics and data-driven decisions.",
    location: "Mumbai, India"
  },
  {
    username: "maru_dhamdhere",
    firstName: "Martand",
    lastName: "Dhamdhere",
    email: "maru@gmail.com",
    avatar: "/uploads/avatars/a10.jpg",
    background: "",
    about: "Meticulous planner and project manager.",
    location: "Mumbai, India"
  },
  {
    username: "majanu",
    firstName: "Majnu",
    lastName: "Bhai",
    email: "majnu_bhai@gmail.com",
    avatar: "/uploads/avatars/a11.avif",
    background: "/uploads/backgrounds/b11.jpg",
    about: "Artist and creative visionary.",
    location: "Dubai, UAE"
  },
  {
    username: "uday_shetty",
    firstName: "Uday",
    lastName: "Shetty",
    email: "uday@gmail.com",
    avatar: "/uploads/avatars/a12.jpeg",
    background: "/uploads/backgrounds/b12.jpeg",
    about: "Control is the ultimate power.",
    location: "Dubai, UAE"
  },
  {
    username: "papi_papita",
    firstName: "Papi",
    lastName: "Papita",
    email: "papi.papita@gmail.com",
    avatar: "/uploads/avatars/a13.jpg",
    background: "",
    about: "Tropical vibes and good energy only.",
    location: "Hawaii, USA"
  },
  {
    username: "mithunda",
    firstName: "Mithun",
    lastName: "Chakraborty",
    email: "mithun.da@gmail.com",
    avatar: "/uploads/avatars/a14.webp",
    background: "/uploads/backgrounds/b14.webp",
    about: "Full-time dancer, part-time developer.",
    location: "Kolkata, India"
  },
  {
    username: "chagan_halwai",
    firstName: "Chagan",
    lastName: "Halwai",
    email: "chagan.halwai@yahoo.com",
    avatar: "/uploads/avatars/a15.jpg",
    background: "",
    about: "Sweet maker and community builder.",
    location: "Dholakpur, India"
  },
  {
    username: "mikala_jaksun",
    firstName: "Michael",
    lastName: "Jackson",
    email: "mikalal.jaksun@gmail.com",
    avatar: "/uploads/avatars/a16.jpg",
    background: "",
    about: "Music lover and rhythm enthusiast.",
    location: "Los Angeles, CA"
  },
  {
    username: "champaklal",
    firstName: "Champak",
    lastName: "Gada",
    email: "champak.gada@gmail.com",
    avatar: "/uploads/avatars/a17.jpg",
    background: "",
    about: "Wise elder with decades of experience.",
    location: "Mumbai, India"
  },
  {
    username: "lord_jetha",
    firstName: "Jetha",
    lastName: "Gada",
    email: "jethalovesbabita@gmail.com",
    avatar: "/uploads/avatars/a18.jpg",
    background: "",
    about: "Business owner and community leader.",
    location: "Mumbai, India"
  },
  {
    username: "shishimaru",
    firstName: "Shishimaru",
    lastName: "Ninja",
    email: "shishimaru@gmail.com",
    avatar: "/uploads/avatars/a19.webp",
    background: "",
    about: "Loyal companion and fearless ninja dog.",
    location: "Iga, Japan"
  },
  {
    username: "kio",
    firstName: "Kio",
    lastName: "Koga",
    email: "kio.koga@gmail.com",
    avatar: "/uploads/avatars/a20.jpeg",
    background: "",
    about: "Stealthy, strategic, and always one step ahead.",
    location: "Koga, Japan"
  },
  {
    username: "lord_amara",
    firstName: "Kemuzou",
    lastName: "Kemumaki",
    email: "amara@gmail.com",
    avatar: "/uploads/avatars/a21.jpg",
    background: "/uploads/backgrounds/b21.webp",
    about: "Rival ninja and master strategist.",
    location: "Koga, Japan"
  },
  {
    username: "kaliya",
    firstName: "Kaliya",
    lastName: "Kumar",
    email: "kaliya@gmail.com",
    avatar: "/uploads/avatars/a22.jpeg",
    background: "",
    about: "Strongest kid in the village. Always ready for a challenge.",
    location: "Dholakpur, India"
  },
  {
    username: "kaliya_ka_mama",
    firstName: "Mama",
    lastName: "Ji",
    email: "kaliya.mama@gmail.com",
    avatar: "/uploads/avatars/a23.jpeg",
    background: "",
    about: "Travels between cities bringing mischief wherever he goes.",
    location: "Mumbai, India"
  },
  {
    username: "dhooni_baba",
    firstName: "Dhooni",
    lastName: "Baba",
    email: "dhooni.baba@gmail.com",
    avatar: "/uploads/avatars/a24.jpeg",
    background: "",
    about: "The wisest sage with the best advice.",
    location: "Himalayas, India"
  },
  {
    username: "kitchak",
    firstName: "Kitchak",
    lastName: "Kothari",
    email: "kitchak@gmail.com",
    avatar: "/uploads/avatars/a25.jpg",
    background: "",
    about: "Wrestler and fitness enthusiast.",
    location: "Pehlwanpur, India"
  },
  {
    username: "principle_007",
    firstName: "Bunta",
    lastName: "Takakura",
    email: "principle@gmail.com",
    avatar: "/uploads/avatars/a26.jpeg",
    background: "/uploads/backgrounds/principle.webp",
    about: "Strict but fair. Education is the key.",
    location: "Kasukabe, Japan"
  },
  {
    username: "baburao_aapte",
    firstName: "Baburao",
    lastName: "Apte",
    email: "babu.aapte@gmail.com",
    avatar: "/uploads/avatars/a27.jpg",
    background: "/uploads/backgrounds/b27.jpeg",
    about: "Garage owner and philosopher of life.",
    location: "Mumbai, India"
  },
  {
    username: "shyam",
    firstName: "Shyam",
    lastName: "Sundar",
    email: "shyam@gmail.com",
    avatar: "/uploads/avatars/a28.png",
    background: "/uploads/backgrounds/b28.webp",
    about: "Quick thinker and master negotiator.",
    location: "Mumbai, India"
  },
  {
    username: "bagheswar",
    firstName: "Bagha",
    lastName: "Sharma",
    email: "bagha.boy@gmail.com",
    avatar: "/uploads/avatars/a29.png",
    background: "",
    about: "Thoughtful and caring community member.",
    location: "Mumbai, India"
  },
  {
    username: "radhe_shyam",
    firstName: "Radhe",
    lastName: "Tiwari",
    email: "radheshyam.tiwari@gmail.com",
    avatar: "/uploads/avatars/a30.jpg",
    background: "",
    about: "Poet at heart with a sharp mind.",
    location: "Mumbai, India"
  },
  {
    username: "lord_jack",
    firstName: "Jack",
    lastName: "Sparrow",
    email: "jack@gmail.com",
    avatar: "/uploads/avatars/a31.gif",
    background: "",
    about: "Captain of adventure. Savvy?",
    location: "Caribbean"
  },
  {
    username: "giyan",
    firstName: "Takeshi",
    lastName: "Gouda",
    email: "giyan.aslimard@gmail.com",
    avatar: "/uploads/avatars/a32.jpeg",
    background: "",
    about: "Local tough guy with a heart of gold.",
    location: "Tokyo, Japan"
  },
  {
    username: "sinchan",
    firstName: "Shin",
    lastName: "Nohara",
    email: "sinchan.nohara@gmail.com",
    avatar: "/uploads/avatars/a33.jpeg",
    background: "",
    about: "Five years old and already wiser than most adults.",
    location: "Kasukabe, Japan"
  },
  {
    username: "kachara_seth",
    firstName: "Kachara",
    lastName: "Seth",
    email: "kachara.seth@gmail.com",
    avatar: "/uploads/avatars/a34.jpeg",
    background: "",
    about: "Drives a hard bargain every time.",
    location: "Mumbai, India"
  },
  {
    username: "chotta_chattri",
    firstName: "Chotta",
    lastName: "Chattri",
    email: "chotta.chattri@gmail.com",
    avatar: "/uploads/avatars/a35.avif",
    background: "",
    about: "Small but mighty. Never underestimate.",
    location: "Mumbai, India"
  },
  {
    username: "dr_ghungroo",
    firstName: "Dr",
    lastName: "Ghungroo",
    email: "drghungroo@gmail.com",
    avatar: "/uploads/avatars/a36.jpg",
    background: "",
    about: "Medical professional and wellness advocate.",
    location: "Dubai, UAE"
  },
  {
    username: "vasooli",
    firstName: "Vasooli",
    lastName: "Bhai",
    email: "vasooli_bhai@gmail.com",
    avatar: "/uploads/avatars/a37.png",
    background: "",
    about: "Deadline-driven project manager.",
    location: "Goa, India"
  },
  {
    username: "buri_buri",
    firstName: "Buri Buri",
    lastName: "Zaemon",
    email: "buriburizaemon@gmail.com",
    avatar: "/uploads/avatars/a38.jpg",
    background: "",
    about: "Always helping the strong and ambitious.",
    location: "Tokyo, Japan"
  },
  {
    username: "pythagorus_bhai",
    firstName: "Pythagorus",
    lastName: "Bhai",
    email: "pythogorus_bhai@gmail.com",
    avatar: "/uploads/avatars/a39.jpg",
    background: "",
    about: "Mathematics and algorithm enthusiast.",
    location: "Athens, Greece"
  },
  {
    username: "mommbati_joshi",
    firstName: "Mommbati",
    lastName: "Joshi",
    email: "mommbati.joshi@gmail.com",
    avatar: "/uploads/avatars/a40.jpg",
    background: "",
    about: "Marketing specialist with global reach.",
    location: "California, USA"
  },
  {
    username: "ramesh",
    firstName: "Ramesh",
    lastName: "Kumar",
    email: "ramesh@gmail.com",
    avatar: "/uploads/avatars/a41.jpg",
    background: "",
    about: "Backend developer and API craftsman.",
    location: "Delhi, India"
  },
  {
    username: "jhoney_pandey",
    firstName: "Jhoney",
    lastName: "Pandey",
    email: "jhoney.pandey@gmail.com",
    avatar: "/uploads/avatars/a42.jpeg",
    background: "",
    about: "Open source contributor and community advocate.",
    location: "Bangalore, India"
  },
  {
    username: "pavitra_prabhakar",
    firstName: "Pavitra",
    lastName: "Prabhakar",
    email: "pavitra.prabhakar@gmail.com",
    avatar: "/uploads/avatars/a43.png",
    background: "",
    about: "Friendly neighborhood full-stack developer.",
    location: "New York, USA"
  },
  {
    username: "ajay_devgan",
    firstName: "Ajay",
    lastName: "Devgan",
    email: "ajay.devgan@gmail.com",
    avatar: "/uploads/avatars/a44.jpg",
    background: "",
    about: "Action-oriented problem solver.",
    location: "Kanpur, India"
  },
  {
    username: "babloo_blaster",
    firstName: "Babloo",
    lastName: "Blaster",
    email: "babloo.blaster@gmail.com",
    avatar: "/uploads/avatars/a45.jpg",
    background: "",
    about: "DevOps engineer and deployment specialist.",
    location: "New Delhi, India"
  },
  {
    username: "jogindar",
    firstName: "Jogindar",
    lastName: "Singh",
    email: "jogindar@gmail.com",
    avatar: "/uploads/avatars/a46.webp",
    background: "",
    about: "Nature lover and wildlife photographer.",
    location: "Amazon, Brazil"
  },
  {
    username: "barmunda",
    firstName: "Barmunda",
    lastName: "Kumar",
    email: "barmunda.kumar@gmail.com",
    avatar: "/uploads/avatars/a47.jpg",
    background: "",
    about: "Riding the waves of cloud computing.",
    location: "Bermuda"
  },
  {
    username: "divakar",
    firstName: "Divakar",
    lastName: "Pardeshi",
    email: "divakar@gmail.com",
    avatar: "/uploads/avatars/a48.jpg",
    background: "",
    about: "Product designer and UX researcher.",
    location: "Hyderabad, India"
  },
  {
    username: "raju_dalal",
    firstName: "Raju",
    lastName: "Dalal",
    email: "raju.dalal@gmail.com",
    avatar: "/uploads/avatars/a49.jpg",
    background: "",
    about: "Fintech developer and trading bot builder.",
    location: "Mumbai, India"
  }
];

// ─── 18 Curated Communities ──────────────────────────────────────────────────
const communityDefs = [
  {
    name: "Frontend Wizards",
    slug: "frontend-wizards",
    description:
      "A community for frontend developers who love crafting beautiful, responsive user interfaces with modern frameworks.",
    category: "Technology",
    tags: ["react", "design", "frontend", "css"],
    ownerIdx: 0,
    memberIdxs: [1, 2, 3, 4, 5, 6, 7, 8, 42],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "PixelBot",
      petName: "Pixel",
      model: "gpt-4o-mini",
      description: "Helps with CSS, layout, and UI component questions."
    },
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Everyday frontend talk" },
          { type: "text" as ChannelType, name: "help", topic: "Ask your frontend questions here" },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "Community updates and news"
          },
          { type: "voice" as ChannelType, name: "Voice Lounge", topic: null }
        ]
      },
      {
        cat: "Projects",
        children: [
          { type: "text" as ChannelType, name: "showcase", topic: "Show off what you built" },
          { type: "text" as ChannelType, name: "code-review", topic: "Get feedback on your code" }
        ]
      }
    ],
    workspaces: [
      { name: "Roadmap", emoji: "🗺️", description: "Frontend Wizards community roadmap and goals" },
      {
        name: "Component Library",
        emoji: "📦",
        description: "Shared component design specs and patterns"
      }
    ]
  },
  {
    name: "Backend Builders",
    slug: "backend-builders",
    description:
      "Server-side engineers discussing APIs, databases, microservices, and scalable architecture patterns.",
    category: "Technology",
    tags: ["node", "backend", "api", "database"],
    ownerIdx: 40,
    memberIdxs: [0, 1, 8, 9, 10, 27, 28, 41, 44],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "ServerBot",
      petName: "Servo",
      model: "gpt-4.1",
      description: "Answers questions about Node.js, databases, and API design."
    },
    channels: [
      {
        cat: "General",
        children: [
          {
            type: "text" as ChannelType,
            name: "general",
            topic: "Backend engineering discussions"
          },
          {
            type: "text" as ChannelType,
            name: "databases",
            topic: "PostgreSQL, MongoDB, Redis and more"
          },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "Important updates"
          },
          { type: "voice" as ChannelType, name: "Pair Programming", topic: null }
        ]
      },
      {
        cat: "Architecture",
        children: [
          {
            type: "text" as ChannelType,
            name: "microservices",
            topic: "Designing distributed systems"
          },
          { type: "text" as ChannelType, name: "devops", topic: "CI/CD, Docker, Kubernetes" }
        ]
      }
    ],
    workspaces: [
      {
        name: "API Standards",
        emoji: "📐",
        description: "REST & GraphQL conventions for the team"
      },
      { name: "System Design Notes", emoji: "🏗️", description: "Architecture decision records" }
    ]
  },
  {
    name: "UI/UX Design Lab",
    slug: "ui-ux-design-lab",
    description:
      "Designers sharing ideas, critiques, and inspiration for creating delightful user experiences.",
    category: "Design",
    tags: ["design", "ux", "figma", "product"],
    ownerIdx: 6,
    memberIdxs: [0, 3, 4, 10, 11, 12, 47, 42, 43],
    isPublic: true,
    requireApproval: true,
    isAiPet: true,
    aiAgent: {
      name: "DesignMuse",
      petName: "Muse",
      model: "claude-3.7",
      description: "Provides design feedback and UI/UX best practices."
    },
    channels: [
      {
        cat: "Design",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Design discussions" },
          {
            type: "text" as ChannelType,
            name: "inspiration",
            topic: "Share designs that inspire you"
          },
          {
            type: "text" as ChannelType,
            name: "critiques",
            topic: "Get honest feedback on your work"
          }
        ]
      },
      {
        cat: "Resources",
        children: [
          { type: "text" as ChannelType, name: "tools", topic: "Figma, Sketch, Adobe, and more" },
          {
            type: "announcement" as ChannelType,
            name: "weekly-challenge",
            topic: "Weekly design challenges"
          },
          { type: "voice" as ChannelType, name: "Design Jam", topic: null }
        ]
      }
    ],
    workspaces: [
      {
        name: "Design System",
        emoji: "🎨",
        description: "Shared design tokens, typography, and color palettes"
      },
      { name: "Case Studies", emoji: "📝", description: "UX case studies and teardowns" }
    ]
  },
  {
    name: "Startup Garage",
    slug: "startup-garage",
    description:
      "Founders, builders, and dreamers collaborating on turning ideas into real products.",
    category: "Startups",
    tags: ["startups", "product", "business", "mvp"],
    ownerIdx: 7,
    memberIdxs: [0, 1, 5, 8, 9, 26, 27, 33, 34, 48],
    isPublic: true,
    requireApproval: false,
    isAiPet: false,
    aiAgent: null,
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Startup life and hustle" },
          {
            type: "text" as ChannelType,
            name: "pitch-practice",
            topic: "Practice your elevator pitch"
          },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "Events and milestones"
          }
        ]
      },
      {
        cat: "Growth",
        children: [
          { type: "text" as ChannelType, name: "marketing", topic: "Growth hacking and marketing" },
          {
            type: "text" as ChannelType,
            name: "fundraising",
            topic: "Investors, VCs, and funding rounds"
          },
          { type: "voice" as ChannelType, name: "Founder Chat", topic: null }
        ]
      }
    ],
    workspaces: [
      {
        name: "Business Plans",
        emoji: "📊",
        description: "Pitch decks and business model canvases"
      },
      { name: "Roadmap", emoji: "🗺️", description: "Product milestones and launch plans" }
    ]
  },
  {
    name: "GameDev Arena",
    slug: "gamedev-arena",
    description:
      "Game developers sharing tips, showcasing projects, and discussing game design principles.",
    category: "Gaming",
    tags: ["gaming", "unity", "unreal", "gamedev"],
    ownerIdx: 18,
    memberIdxs: [19, 20, 31, 32, 37, 2, 12, 14, 38],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "GameMaster",
      petName: "Pixel",
      model: "gpt-4o-mini",
      description: "Helps with Unity, Unreal Engine, and game design questions."
    },
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Game development chat" },
          {
            type: "text" as ChannelType,
            name: "showcase",
            topic: "Show your games and prototypes"
          },
          {
            type: "announcement" as ChannelType,
            name: "game-jams",
            topic: "Game jam announcements and teams"
          }
        ]
      },
      {
        cat: "Development",
        children: [
          { type: "text" as ChannelType, name: "unity", topic: "Unity engine discussions" },
          { type: "text" as ChannelType, name: "pixel-art", topic: "Sprites, tiles, and game art" },
          { type: "voice" as ChannelType, name: "Game Night", topic: null }
        ]
      }
    ],
    workspaces: [
      { name: "Game Ideas", emoji: "💡", description: "Brainstorming game concepts and mechanics" },
      { name: "Asset Library", emoji: "🎮", description: "Shared sprites, sounds, and 3D models" }
    ]
  },
  {
    name: "Data Science Hub",
    slug: "data-science-hub",
    description:
      "Data scientists and ML engineers exploring datasets, models, and analytical techniques together.",
    category: "Technology",
    tags: ["ai", "python", "data", "ml"],
    ownerIdx: 38,
    memberIdxs: [0, 8, 9, 23, 27, 28, 40, 44, 48],
    isPublic: true,
    requireApproval: true,
    isAiPet: true,
    aiAgent: {
      name: "DataBot",
      petName: "Archie",
      model: "gpt-4.1",
      description: "Assists with Python, pandas, and machine learning queries."
    },
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Data science discussions" },
          {
            type: "text" as ChannelType,
            name: "datasets",
            topic: "Interesting datasets to explore"
          },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "Competitions and events"
          }
        ]
      },
      {
        cat: "ML & AI",
        children: [
          {
            type: "text" as ChannelType,
            name: "machine-learning",
            topic: "Models, training, and evaluation"
          },
          {
            type: "text" as ChannelType,
            name: "deep-learning",
            topic: "Neural networks and transformers"
          },
          { type: "voice" as ChannelType, name: "Study Group", topic: null }
        ]
      }
    ],
    workspaces: [
      { name: "Research Notes", emoji: "📚", description: "Paper summaries and experiment logs" },
      { name: "Model Zoo", emoji: "🤖", description: "Pre-trained models and benchmarks" }
    ]
  },
  {
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    description:
      "Infrastructure engineers discussing cloud platforms, containers, CI/CD, and site reliability.",
    category: "Technology",
    tags: ["devops", "aws", "docker", "kubernetes"],
    ownerIdx: 44,
    memberIdxs: [0, 1, 7, 8, 27, 40, 41, 46],
    isPublic: true,
    requireApproval: false,
    isAiPet: false,
    aiAgent: null,
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Cloud and infrastructure talk" },
          { type: "text" as ChannelType, name: "help", topic: "Deployment and infra questions" },
          { type: "announcement" as ChannelType, name: "announcements", topic: "Platform updates" },
          { type: "voice" as ChannelType, name: "War Room", topic: null }
        ]
      },
      {
        cat: "Tools",
        children: [
          { type: "text" as ChannelType, name: "docker", topic: "Containers and orchestration" },
          { type: "text" as ChannelType, name: "terraform", topic: "Infrastructure as code" }
        ]
      }
    ],
    workspaces: [
      { name: "Runbooks", emoji: "📋", description: "Incident response and deployment runbooks" },
      { name: "Architecture Diagrams", emoji: "🏗️", description: "Cloud architecture and diagrams" }
    ]
  },
  {
    name: "Mobile Dev Crew",
    slug: "mobile-dev-crew",
    description:
      "iOS, Android, and cross-platform mobile developers building amazing apps together.",
    category: "Technology",
    tags: ["mobile", "react-native", "flutter", "ios"],
    ownerIdx: 42,
    memberIdxs: [0, 2, 3, 6, 12, 18, 32, 43],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "AppBot",
      petName: "Appy",
      model: "gpt-4o-mini",
      description: "Helps with React Native, Flutter, and mobile development."
    },
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Mobile development discussions" },
          {
            type: "text" as ChannelType,
            name: "react-native",
            topic: "React Native tips and tricks"
          },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "App releases and updates"
          }
        ]
      },
      {
        cat: "Platforms",
        children: [
          { type: "text" as ChannelType, name: "ios", topic: "Swift and iOS development" },
          { type: "text" as ChannelType, name: "android", topic: "Kotlin and Android development" },
          { type: "voice" as ChannelType, name: "Code Review", topic: null }
        ]
      }
    ],
    workspaces: [
      { name: "App Ideas", emoji: "📱", description: "Mobile app concepts and wireframes" },
      { name: "Release Notes", emoji: "🚀", description: "Version history and changelogs" }
    ]
  },
  {
    name: "Open Source Collective",
    slug: "open-source-collective",
    description:
      "Contributors and maintainers of open source projects sharing knowledge and collaborating.",
    category: "Technology",
    tags: ["opensource", "github", "community", "contribution"],
    ownerIdx: 41,
    memberIdxs: [0, 1, 2, 7, 27, 28, 40, 42, 43, 44],
    isPublic: true,
    requireApproval: false,
    isAiPet: false,
    aiAgent: null,
    channels: [
      {
        cat: "Community",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Open source discussions" },
          {
            type: "text" as ChannelType,
            name: "first-contributions",
            topic: "Help for first-time contributors"
          },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "New releases and events"
          },
          { type: "voice" as ChannelType, name: "Contributor Lounge", topic: null }
        ]
      },
      {
        cat: "Projects",
        children: [
          {
            type: "text" as ChannelType,
            name: "project-showcase",
            topic: "Show your open source projects"
          },
          {
            type: "text" as ChannelType,
            name: "issue-help",
            topic: "Need help with a GitHub issue?"
          }
        ]
      }
    ],
    workspaces: [
      {
        name: "Contribution Guide",
        emoji: "📖",
        description: "How to contribute to open source projects"
      },
      { name: "Project Ideas", emoji: "💡", description: "Ideas for new open source projects" }
    ]
  },
  {
    name: "Cybersecurity Den",
    slug: "cybersecurity-den",
    description:
      "Security researchers and ethical hackers discussing vulnerabilities, CTFs, and secure coding practices.",
    category: "Technology",
    tags: ["security", "ctf", "hacking", "infosec"],
    ownerIdx: 20,
    memberIdxs: [0, 7, 8, 19, 18, 30, 36, 44, 46],
    isPublic: false,
    requireApproval: true,
    isAiPet: true,
    aiAgent: {
      name: "SecBot",
      petName: "Shield",
      model: "claude-3.7",
      description: "Helps with security best practices and vulnerability analysis."
    },
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Security discussions" },
          {
            type: "text" as ChannelType,
            name: "ctf-challenges",
            topic: "Capture The Flag writeups"
          },
          {
            type: "announcement" as ChannelType,
            name: "advisories",
            topic: "Security advisories and patches"
          }
        ]
      },
      {
        cat: "Research",
        children: [
          {
            type: "text" as ChannelType,
            name: "vulnerabilities",
            topic: "CVE discussions and analysis"
          },
          { type: "text" as ChannelType, name: "tools", topic: "Pentesting and security tools" },
          { type: "voice" as ChannelType, name: "War Room", topic: null }
        ]
      }
    ],
    workspaces: [
      { name: "CTF Notes", emoji: "🏴", description: "CTF challenge solutions and walkthroughs" },
      {
        name: "Security Checklist",
        emoji: "✅",
        description: "Application security audit checklist"
      }
    ]
  },
  {
    name: "Dholakpur Gang",
    slug: "dholakpur-gang",
    description:
      "The legendary Dholakpur crew hanging out, sharing stories, and protecting the village!",
    category: "Lifestyle",
    tags: ["fun", "community", "friends", "dholakpur"],
    ownerIdx: 14,
    memberIdxs: [21, 22, 23, 24, 0, 1, 2, 3, 4],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "ChutBot",
      petName: "Chutki",
      model: "gpt-4o-mini",
      description: "The helpful assistant of Dholakpur, knows all village secrets!"
    },
    channels: [
      {
        cat: "Village",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Village hangout" },
          { type: "text" as ChannelType, name: "announcements", topic: "Village updates" },
          {
            type: "text" as ChannelType,
            name: "recipes",
            topic: "Chagan Halwai's special recipes"
          },
          { type: "voice" as ChannelType, name: "Village Square", topic: null }
        ]
      },
      {
        cat: "Adventures",
        children: [
          { type: "text" as ChannelType, name: "missions", topic: "Village protection missions" },
          { type: "text" as ChannelType, name: "training", topic: "Martial arts and fitness" }
        ]
      }
    ],
    workspaces: [
      { name: "Mission Plans", emoji: "🛡️", description: "Village defense strategies and plans" },
      { name: "Recipe Book", emoji: "🧁", description: "Chagan's famous laddu and jalebi recipes" }
    ]
  },
  {
    name: "Gokuldham Society",
    slug: "gokuldham-society",
    description:
      "The friendly neighborhood where everyone is family. Gokuldham ke residents ka adda!",
    category: "Lifestyle",
    tags: ["fun", "family", "community", "mumbai"],
    ownerIdx: 16,
    memberIdxs: [17, 28, 29, 0, 1, 5, 26, 8, 33],
    isPublic: true,
    requireApproval: true,
    isAiPet: false,
    aiAgent: null,
    channels: [
      {
        cat: "Society",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Society gossip and chat" },
          {
            type: "text" as ChannelType,
            name: "events",
            topic: "Festival celebrations and get-togethers"
          },
          {
            type: "announcement" as ChannelType,
            name: "notice-board",
            topic: "Society notices and rules"
          },
          { type: "voice" as ChannelType, name: "Club House", topic: null }
        ]
      },
      {
        cat: "Business",
        children: [
          {
            type: "text" as ChannelType,
            name: "gada-electronics",
            topic: "Jetha's electronics shop discussions"
          },
          {
            type: "text" as ChannelType,
            name: "buy-sell",
            topic: "Buy and sell within the society"
          }
        ]
      }
    ],
    workspaces: [
      { name: "Event Calendar", emoji: "📅", description: "Upcoming festivals and events" },
      { name: "Society Rules", emoji: "📜", description: "Gokuldham Society bylaws and guidelines" }
    ]
  },
  {
    name: "Ninja Academy",
    slug: "ninja-academy",
    description:
      "A training ground for aspiring ninjas. Learn stealth, strategy, and the ancient ninja arts!",
    category: "Education",
    tags: ["ninja", "training", "japan", "martial-arts"],
    ownerIdx: 25,
    memberIdxs: [18, 19, 20, 31, 32, 37, 0, 2],
    isPublic: false,
    requireApproval: true,
    isAiPet: true,
    aiAgent: {
      name: "SenseiBot",
      petName: "Sensei",
      model: "gpt-4.1",
      description: "Your digital sensei for ninja training and strategy."
    },
    channels: [
      {
        cat: "Training",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Ninja academy discussions" },
          { type: "text" as ChannelType, name: "techniques", topic: "Jutsu and technique sharing" },
          {
            type: "announcement" as ChannelType,
            name: "assignments",
            topic: "Training assignments and missions"
          },
          { type: "voice" as ChannelType, name: "Dojo", topic: null }
        ]
      },
      {
        cat: "Strategy",
        children: [
          {
            type: "text" as ChannelType,
            name: "tactics",
            topic: "Battle strategies and formations"
          },
          { type: "text" as ChannelType, name: "history", topic: "Ninja history and lore" }
        ]
      }
    ],
    workspaces: [
      { name: "Training Manual", emoji: "📕", description: "Ninja techniques and training guides" },
      { name: "Mission Log", emoji: "🗒️", description: "Completed missions and debriefs" }
    ]
  },
  {
    name: "Hera Pheri Inc.",
    slug: "hera-pheri-inc",
    description: "The gang is back! Discussing schemes, plans, and making money the creative way.",
    category: "Business",
    tags: ["business", "comedy", "schemes", "money"],
    ownerIdx: 7,
    memberIdxs: [26, 27, 33, 34, 5, 8, 35, 36, 0],
    isPublic: true,
    requireApproval: false,
    isAiPet: false,
    aiAgent: null,
    channels: [
      {
        cat: "Business",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Business discussions and ideas" },
          { type: "text" as ChannelType, name: "schemes", topic: "Money-making plans" },
          {
            type: "announcement" as ChannelType,
            name: "deals",
            topic: "Latest deals and opportunities"
          },
          { type: "voice" as ChannelType, name: "Board Room", topic: null }
        ]
      },
      {
        cat: "Operations",
        children: [
          { type: "text" as ChannelType, name: "accounts", topic: "Financial tracking" },
          { type: "text" as ChannelType, name: "logistics", topic: "Supply chain and operations" }
        ]
      }
    ],
    workspaces: [
      {
        name: "Business Plans",
        emoji: "💰",
        description: "Revenue models and financial projections"
      },
      { name: "Client List", emoji: "📒", description: "Potential clients and leads" }
    ]
  },
  {
    name: "Kasukabe Defense Force",
    slug: "kasukabe-defense",
    description: "The Kasukabe Defense Organization protecting the town from evil and boredom!",
    category: "Lifestyle",
    tags: ["fun", "anime", "kasukabe", "defense"],
    ownerIdx: 32,
    memberIdxs: [31, 37, 25, 0, 2, 18, 19, 20],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "ActionBot",
      petName: "Kamen",
      model: "gpt-4o-mini",
      description: "The defense force's tactical AI assistant."
    },
    channels: [
      {
        cat: "HQ",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Defense force headquarters" },
          { type: "text" as ChannelType, name: "missions", topic: "Current and upcoming missions" },
          {
            type: "announcement" as ChannelType,
            name: "alerts",
            topic: "Emergency alerts and briefings"
          },
          { type: "voice" as ChannelType, name: "Command Center", topic: null }
        ]
      },
      {
        cat: "Training",
        children: [
          { type: "text" as ChannelType, name: "training", topic: "Physical and mental training" },
          { type: "text" as ChannelType, name: "gear", topic: "Weapons and equipment discussion" }
        ]
      }
    ],
    workspaces: [
      {
        name: "Mission Briefings",
        emoji: "🎯",
        description: "Detailed mission plans and objectives"
      },
      { name: "Defense Strategies", emoji: "🛡️", description: "Town defense playbooks" }
    ]
  },
  {
    name: "AI & LLM Research",
    slug: "ai-llm-research",
    description:
      "Researchers and practitioners exploring large language models, prompting, and AI applications.",
    category: "Technology",
    tags: ["ai", "llm", "gpt", "research"],
    ownerIdx: 23,
    memberIdxs: [0, 2, 38, 40, 41, 42, 44, 48],
    isPublic: true,
    requireApproval: true,
    isAiPet: true,
    aiAgent: {
      name: "ResearchBot",
      petName: "Atlas",
      model: "claude-3.7",
      description: "Summarizes papers and explains AI concepts."
    },
    channels: [
      {
        cat: "Research",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "AI research discussions" },
          { type: "text" as ChannelType, name: "papers", topic: "Interesting paper discussions" },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "Conference deadlines and news"
          }
        ]
      },
      {
        cat: "Practice",
        children: [
          {
            type: "text" as ChannelType,
            name: "prompting",
            topic: "Prompt engineering techniques"
          },
          { type: "text" as ChannelType, name: "fine-tuning", topic: "Model fine-tuning and RLHF" },
          { type: "voice" as ChannelType, name: "Paper Reading Group", topic: null }
        ]
      }
    ],
    workspaces: [
      {
        name: "Paper Summaries",
        emoji: "📄",
        description: "Summarized research papers and key findings"
      },
      { name: "Experiment Log", emoji: "🧪", description: "LLM experiment setups and results" }
    ]
  },
  {
    name: "Freelancers Guild",
    slug: "freelancers-guild",
    description:
      "Independent freelancers sharing gigs, tips, and resources for building a sustainable freelance career.",
    category: "Business",
    tags: ["freelance", "career", "remote", "business"],
    ownerIdx: 10,
    memberIdxs: [11, 12, 13, 0, 3, 6, 39, 43, 47],
    isPublic: true,
    requireApproval: false,
    isAiPet: false,
    aiAgent: null,
    channels: [
      {
        cat: "General",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Freelance life discussions" },
          { type: "text" as ChannelType, name: "gigs", topic: "Share and find freelance gigs" },
          {
            type: "announcement" as ChannelType,
            name: "announcements",
            topic: "Guild updates and events"
          }
        ]
      },
      {
        cat: "Resources",
        children: [
          { type: "text" as ChannelType, name: "pricing", topic: "How to price your services" },
          {
            type: "text" as ChannelType,
            name: "contracts",
            topic: "Contract templates and legal advice"
          },
          { type: "voice" as ChannelType, name: "Co-working", topic: null }
        ]
      }
    ],
    workspaces: [
      {
        name: "Rate Calculator",
        emoji: "💲",
        description: "Freelance rate guidelines and calculators"
      },
      { name: "Client Templates", emoji: "📄", description: "Proposal and invoice templates" }
    ]
  },
  {
    name: "Music Producers Club",
    slug: "music-producers-club",
    description:
      "Beat-makers, composers, and music producers collaborating and sharing their latest tracks.",
    category: "Lifestyle",
    tags: ["music", "production", "beats", "audio"],
    ownerIdx: 15,
    memberIdxs: [0, 4, 5, 13, 30, 31, 32, 10],
    isPublic: true,
    requireApproval: false,
    isAiPet: true,
    aiAgent: {
      name: "BeatBot",
      petName: "Beats",
      model: "gpt-4o-mini",
      description: "Helps with music theory, DAW tips, and production techniques."
    },
    channels: [
      {
        cat: "Studio",
        children: [
          { type: "text" as ChannelType, name: "general", topic: "Music production chat" },
          { type: "text" as ChannelType, name: "feedback", topic: "Get feedback on your tracks" },
          {
            type: "announcement" as ChannelType,
            name: "releases",
            topic: "New releases and drops"
          },
          { type: "voice" as ChannelType, name: "Jam Session", topic: null }
        ]
      },
      {
        cat: "Gear",
        children: [
          { type: "text" as ChannelType, name: "daw-talk", topic: "DAW tips and workflows" },
          {
            type: "text" as ChannelType,
            name: "gear-reviews",
            topic: "Hardware and plugin reviews"
          }
        ]
      }
    ],
    workspaces: [
      { name: "Sample Library", emoji: "🎵", description: "Shared samples and loops" },
      { name: "Collab Board", emoji: "🎤", description: "Find collaborators for your next track" }
    ]
  }
];

// ─── Message templates by channel name ───────────────────────────────────────
const msgTemplates: Record<string, string[]> = {
  general: [
    "Hey everyone! How's it going?",
    "Just joined the community, excited to be here!",
    "Anyone working on something cool this weekend?",
    "Great discussion yesterday, loved the insights shared.",
    "Quick question — what tools are you all using for project management?",
    "Happy Monday! Let's make this week productive 💪",
    "Appreciate all the knowledge sharing happening here.",
    "This community keeps getting better every day!",
    "What's everyone reading or learning right now?",
    "Shoutout to the mods for keeping this place awesome.",
    "Does anyone have recommendations for good tutorials?",
    "Just finished a major project — feels great!",
    "I love how supportive this community is.",
    "Any meetups planned for this month?",
    "Let's do a knowledge sharing session this Friday!"
  ],
  help: [
    "Can someone help me debug this issue? I'm stuck with a type error.",
    "How do you handle authentication in a Nuxt app?",
    "What's the best approach for database migrations?",
    "Has anyone dealt with WebSocket reconnection strategies?",
    "I'm getting a CORS error on my API calls. Any ideas?",
    "How do you structure your composables for large projects?",
    "What's the recommended way to handle file uploads?",
    "Can someone explain the difference between ref and reactive?",
    "Is there a standard pattern for optimistic UI updates?",
    "How do you test Vue components with Vitest?"
  ],
  showcase: [
    "Just shipped my portfolio website! Check it out 🚀",
    "Built a real-time chat app this weekend. Here's a demo.",
    "New open source library for form validation — feedback welcome!",
    "Created a dashboard using Vue 3 + Tailwind. Turned out great!",
    "My first mobile app is live on the App Store!",
    "Designed a new component library. Let me know what you think.",
    "Automated our CI/CD pipeline — deploys are now under 2 minutes.",
    "Built an AI-powered code review tool. Early beta is ready!"
  ],
  announcements: [
    "Welcome to the community! Please read the rules before posting.",
    "We've updated our community guidelines — check them out.",
    "New channels have been added! Explore and join the discussions.",
    "Community meetup this Saturday at 3 PM. Don't miss it!",
    "We've reached 100 members! Thank you all for being here ❤️"
  ],
  databases: [
    "PostgreSQL vs MySQL — which do you prefer for new projects?",
    "Just discovered CTE queries. They're a game changer!",
    "How do you handle database indexing for large tables?",
    "Any tips for optimizing slow SQL queries?",
    "What's your migration strategy for production databases?"
  ],
  microservices: [
    "How do you handle inter-service communication?",
    "Event-driven architecture vs request-response — thoughts?",
    "Service mesh — is it worth the complexity?",
    "What's your approach to distributed tracing?",
    "How do you manage shared data across microservices?"
  ],
  devops: [
    "Docker Compose vs Kubernetes for small projects?",
    "What's your favorite CI/CD tool and why?",
    "How do you manage environment variables across environments?",
    "Nginx vs Traefik for reverse proxying containers?",
    "Blue-green deployments — anyone doing this in production?"
  ],
  inspiration: [
    "Just saw this amazing landing page. The animations are smooth!",
    "Minimal design at its finest. Less is truly more.",
    "This app's onboarding flow is brilliant. Worth studying.",
    "Beautiful use of typography and whitespace.",
    "Dark mode done right — this design is chef's kiss 👨‍🍳"
  ],
  critiques: [
    "Would love feedback on this dashboard layout I designed.",
    "Is this color palette accessible? Trying to hit WCAG AA.",
    "How's the spacing looking on this card component?",
    "Should I use icons or text labels for navigation?",
    "Thoughts on this hero section? Too busy or just right?"
  ],
  tools: [
    "Figma released new variables feature — anyone tried it?",
    "Linear vs Jira — which project management tool do you use?",
    "Switched from VS Code to Cursor. Productivity went up!",
    "What Figma plugins are essential for your workflow?",
    "Notion for docs, Linear for tasks — great combo."
  ],
  missions: [
    "Alert! Kitchak spotted near the village border.",
    "Training session at dawn tomorrow. Everyone report at 5 AM.",
    "New threat detected — we need a plan ASAP!",
    "Mission accomplished! Great teamwork everyone 🎉",
    "Recon report from the eastern perimeter — all clear."
  ],
  training: [
    "Morning training went great! Everyone showed improvement.",
    "New technique unlocked — the shadow step!",
    "Who wants to spar after lunch?",
    "Remember to stretch before training. Injuries are no joke.",
    "The sensei said we're ready for the next level! 🥷"
  ],
  techniques: [
    "The smoke bomb technique requires precise timing.",
    "Has anyone mastered the water walking skill yet?",
    "Stealth movement practice — meet at the training ground at sunset.",
    "New scroll discovered with ancient techniques!",
    "Always sharpen your shuriken before practice."
  ],
  schemes: [
    "I have the perfect plan. Listen carefully...",
    "This could work if we get the timing right.",
    "Remember — no plan survives first contact with reality 😂",
    "Phase 1 complete. Moving to Phase 2.",
    "Budget update: we need more funding for this project."
  ],
  "code-review": [
    "Can someone review this PR? It's a refactor of the auth module.",
    "Feedback on this composable pattern — is it idiomatic Vue 3?",
    "This hook does too many things. Should I split it?",
    "PR approved! Clean code, good test coverage.",
    "Nitpick: prefer const over let when possible."
  ],
  "machine-learning": [
    "What's the best loss function for this classification task?",
    "Transformer models keep getting bigger. When does scaling stop?",
    "Has anyone tried fine-tuning LLaMA on custom datasets?",
    "Feature engineering tips for tabular data?",
    "Cross-validation vs train-test split — which do you prefer?"
  ],
  papers: [
    "Just read 'Attention Is All You Need' — still a masterpiece.",
    "New paper on efficient attention mechanisms. Worth reading!",
    "Anyone attending NeurIPS this year?",
    "This interpretability paper changed how I think about ML.",
    "The scaling laws paper from OpenAI is fascinating."
  ],
  prompting: [
    "Chain-of-thought prompting improves reasoning significantly.",
    "Few-shot vs zero-shot — when to use which?",
    "System prompts make such a huge difference in output quality.",
    "Has anyone tried tree-of-thought prompting?",
    "Prompt injection defense techniques — let's discuss."
  ],
  gigs: [
    "Looking for a React developer for a 2-week project.",
    "Anyone available for a logo design gig?",
    "Need a backend dev familiar with PostgreSQL and Kysely.",
    "Quick Tailwind CSS task — should take a few hours.",
    "Full-stack project available. Budget is flexible."
  ],
  feedback: [
    "Just dropped a new beat — feedback welcome! 🎧",
    "How's the mix sounding? I think the bass is too muddy.",
    "Loving the melody, but the drums need more punch.",
    "Clean production! What DAW are you using?",
    "The vocal processing is on point. Great work!"
  ],
  "ctf-challenges": [
    "This week's CTF challenge is up! Good luck everyone.",
    "Solved the binary exploitation challenge — writeup coming soon.",
    "Stuck on the crypto challenge. Any hints?",
    "Web exploitation level 3 was tricky but fun!",
    "New CTF platform recommendation — TryHackMe is great for beginners."
  ],
  vulnerabilities: [
    "New CVE published for a popular npm package. Patch your deps!",
    "SQL injection is still the most common vulnerability in 2026.",
    "XSS prevention — always sanitize user input.",
    "Interesting SSRF vector discovered in cloud metadata endpoints.",
    "OWASP Top 10 should be required reading for all devs."
  ],
  "react-native": [
    "Expo SDK 53 release — some breaking changes to watch out for.",
    "How do you handle navigation in React Native?",
    "Performance tips for FlatList with large datasets.",
    "Reanimated 3 makes animations so much smoother!",
    "Best practices for React Native app architecture?"
  ],
  unity: [
    "Unity 6 is impressive. The new render pipeline is fast.",
    "How do you handle object pooling in Unity?",
    "Any good tutorials for shader programming?",
    "Working on a 2D platformer — smooth physics is hard!",
    "Unity vs Godot — what are your thoughts?"
  ],
  "pixel-art": [
    "Just finished a 16x16 character sprite sheet!",
    "Aseprite is the best tool for pixel art. Change my mind.",
    "Color palette tips for pixel art game tiles?",
    "Animated my first walk cycle — four frames, eight directions.",
    "Dithering technique makes everything look so retro and cool."
  ],
  "first-contributions": [
    "Just made my first PR to an open source project! 🎉",
    "Where do I find beginner-friendly issues on GitHub?",
    "How do I fork and set up a project locally?",
    "Made a typo fix PR — small steps count!",
    "Open source is amazing. The community is so welcoming."
  ],
  "project-showcase": [
    "Built a CLI tool for managing dotfiles — repo link in bio.",
    "New VS Code extension for Tailwind CSS — check it out!",
    "Created a Vue component library — looking for contributors.",
    "My first npm package! A simple date formatting utility.",
    "Dashboard template with dark mode — MIT licensed."
  ],
  recipes: [
    "Chagan's famous laddus — guaranteed to make you smile!",
    "Secret jalebi recipe unlocked. Crispy, golden, perfect.",
    "Today's special: masala chai with extra cardamom ☕",
    "Who wants to try the new rabri recipe?",
    "Festival special! Chagan is making extra laddus today."
  ],
  events: [
    "Diwali celebration this weekend! Everyone is invited.",
    "Cricket match in the compound — Sunday 4 PM.",
    "Annual day preparations starting next week.",
    "Holi party at the club house — colors and music!",
    "Birthday celebration for our society members this month."
  ],
  "gada-electronics": [
    "New shipment of electronics arriving tomorrow!",
    "50% off on all items this weekend — Gada Electronics sale!",
    "Customer feedback: they loved the new LED TVs.",
    "Need help with inventory management. Any volunteers?",
    "The AC repair service is now available. Book your slot!"
  ],
  docker: [
    "Multi-stage builds reduced our image size by 60%!",
    "Docker Compose tips for development environments.",
    "Best practices for writing Dockerfiles.",
    "Container networking can be confusing. Here's my cheat sheet.",
    "Volume mounts vs bind mounts — when to use which?"
  ],
  terraform: [
    "Terraform state management — remote backends are essential.",
    "Modularize your Terraform configs for reusability.",
    "Terraform vs Pulumi — IaC comparison.",
    "Don't forget to lock your state files!",
    "Drift detection saved us from a major incident."
  ],
  ios: [
    "SwiftUI is getting better with each release.",
    "Core Data vs SwiftData — which one for new projects?",
    "App Store review process tips for faster approval.",
    "Testing on physical devices is still important!",
    "Xcode 18 has some great new debugging tools."
  ],
  android: [
    "Jetpack Compose is the future of Android UI.",
    "Room database migration strategies?",
    "Material 3 design components look amazing.",
    "How do you handle deep links in Android apps?",
    "Gradle build optimization techniques."
  ],
  tactics: [
    "The classic pincer movement — still effective!",
    "Coordination is key. Use hand signals for silent ops.",
    "Enemy patterns analyzed — they rotate guards every 2 hours.",
    "New formation drill tomorrow. Everyone memorize positions.",
    "Retreat is not defeat — it's strategic repositioning."
  ],
  history: [
    "The legendary Iga and Koga rivalry — a history lesson.",
    "Ancient scrolls reveal forgotten techniques.",
    "The first ninja academy was established 500 years ago.",
    "Stealth was valued above strength in classical ninja arts.",
    "The code of the ninja — honor, duty, and silence."
  ],
  accounts: [
    "Monthly expenses report is ready. Check the workspace.",
    "We need to cut costs on supplies this quarter.",
    "Revenue is up 15% — great job team!",
    "Tax filing deadline is next week. Don't forget documents.",
    "New accounting software recommendation — much better than Excel."
  ],
  logistics: [
    "Shipment delayed by 2 days. Informing all clients.",
    "New warehouse location identified. Site visit this Friday.",
    "Inventory check completed. All items accounted for.",
    "Route optimization reduced delivery time by 30%.",
    "Need volunteers for the weekend stock clearance."
  ],
  datasets: [
    "This Kaggle dataset on weather patterns is really clean.",
    "Found a great NLP dataset for sentiment analysis.",
    "Public datasets from government portals are often overlooked.",
    "Data cleaning tips — regex and pandas magic.",
    "New image classification dataset with 10k labeled samples."
  ],
  "deep-learning": [
    "When should you use CNNs vs Transformers?",
    "Training tips for GANs — mode collapse solutions.",
    "Batch normalization vs Layer normalization.",
    "GPU memory optimization for large model training.",
    "Transfer learning saves so much time and compute."
  ],
  "fine-tuning": [
    "LoRA fine-tuning is incredibly efficient. Highly recommend.",
    "How many epochs for fine-tuning a 7B model?",
    "Dataset quality matters more than dataset size.",
    "QLoRA makes fine-tuning accessible on consumer GPUs.",
    "Evaluation metrics for fine-tuned models — beyond perplexity."
  ],
  marketing: [
    "Content marketing is still king in 2026.",
    "SEO tips for startup landing pages.",
    "Social media strategy for B2B products.",
    "Email marketing automation — tools and best practices.",
    "Product Hunt launch checklist — don't forget anything!"
  ],
  fundraising: [
    "Series A preparation — what investors look for.",
    "Pitch deck essentials: problem, solution, market, traction.",
    "Angel investors vs VCs — pros and cons.",
    "Revenue-based financing as an alternative to equity.",
    "Our fundraise closed! Thanks for all the advice here 🎉"
  ],
  "pitch-practice": [
    "Just practiced my 60-second pitch. Feedback welcome!",
    "Keep it simple — investors hear hundreds of pitches.",
    "Show traction numbers early in your pitch.",
    "The problem statement should be crystal clear.",
    "Demo > slides. Always show the product if you can."
  ],
  pricing: [
    "Hourly vs project-based — what works for you?",
    "Don't undersell yourself. Know your market rate.",
    "Value-based pricing tips for designers.",
    "How to handle clients who want discounts.",
    "Annual rate review — time to raise your prices!"
  ],
  contracts: [
    "Always have a contract, even for small projects.",
    "Kill fee clause — protect yourself from scope creep.",
    "IP ownership should be clearly stated in every contract.",
    "Payment terms: 50% upfront works best for me.",
    "Free contract template for freelance developers."
  ],
  "daw-talk": [
    "Ableton Live workflow tips for faster production.",
    "FL Studio vs Logic Pro — the never-ending debate.",
    "Stock plugins are underrated. Don't sleep on them.",
    "Template sessions save hours of setup time.",
    "MIDI mapping your controller is worth the effort!"
  ],
  "gear-reviews": [
    "The new Audio-Technica headphones are incredible for mixing.",
    "Budget microphone recommendation: the Rode NT1-A is unbeatable.",
    "MIDI keyboards under $200 — top 3 picks.",
    "Monitor speakers vs headphones for mixing?",
    "The Focusrite Scarlett 2i2 is still the best entry-level interface."
  ],
  gear: [
    "New tactical gear recommendations for night ops.",
    "Lightweight equipment is essential for speed missions.",
    "Custom weapon modifications — share your setups.",
    "Armor upgrades available at the local blacksmith.",
    "Communication devices need an upgrade. Budget approved!"
  ],
  "buy-sell": [
    "Selling my old laptop — i5, 16GB RAM. Good condition!",
    "Anyone interested in a second-hand bicycle?",
    "Looking for a used desk for my home office.",
    "Free books available — pick up from flat 203.",
    "Brand new mixer grinder for sale. Unopened box!"
  ],
  "issue-help": [
    "Help needed: CI failing on a specific test case.",
    "Can't reproduce this bug locally. Any ideas?",
    "Is this issue a duplicate? Seems similar to #42.",
    "Need help writing a test for this edge case.",
    "The error message is misleading — actual fix is simple."
  ],
  "game-jams": [
    "48-hour game jam starting this Friday! Who's in?",
    "Team formation thread — post your skills and availability.",
    "Last jam's winner used only free assets. Impressive!",
    "Theme announcement: 'Second Chance' — any ideas?",
    "Reminder: submit your game before midnight Sunday."
  ],
  "weekly-challenge": [
    "This week's challenge: Design a mobile banking app.",
    "Submissions due Friday. Share in the critiques channel!",
    "Last week's winner used a beautiful gradient approach.",
    "Challenge: Redesign the settings page of any popular app.",
    "Open theme this week — be as creative as you like!"
  ],
  advisories: [
    "Critical: Update your Node.js to the latest LTS version.",
    "New vulnerability in popular ORM library — patch available.",
    "Security advisory: rotate all API keys after the breach report.",
    "SSL certificate renewal reminder for all services.",
    "Two-factor authentication now mandatory for all members."
  ],
  "notice-board": [
    "Monthly maintenance scheduled for Sunday 6 AM.",
    "New parking rules in effect from Monday.",
    "Water supply will be interrupted for 2 hours tomorrow.",
    "Annual general meeting notice — all members please attend.",
    "New security guard schedule posted at the gate."
  ],
  assignments: [
    "Assignment 1: Complete the stealth obstacle course.",
    "Written test on ninja history — next Wednesday.",
    "Practical exam: demonstrate three advanced techniques.",
    "Group assignment: plan a coordinated entry strategy.",
    "Final exam schedule posted. Check the mission log workspace."
  ],
  deals: [
    "Limited time offer — 20% off on bulk orders!",
    "New client interested in a long-term partnership.",
    "Property deal in progress. Big margins expected!",
    "Import-export opportunity — need to act fast.",
    "Referral bonus for bringing in new clients."
  ],
  alerts: [
    "ALERT: Unknown entity approaching from the east!",
    "All-clear signal. Stand down from alert status.",
    "Emergency drill at 1500 hours. Be prepared!",
    "Weather alert: heavy rain expected. Secure all equipment.",
    "Night patrol duty roster updated. Check your schedules."
  ],
  releases: [
    "New album drop this Friday! Featuring 12 original tracks.",
    "EP release: 'Digital Sunset' — now available everywhere.",
    "Single preview dropping tomorrow. Stay tuned! 🎶",
    "Remix pack available for download — go wild with it.",
    "Producer compilation Vol. 3 is officially out!"
  ]
};

const defaultMessages = [
  "Great discussion! Thanks for sharing.",
  "This is really interesting. I'll try it out.",
  "Anyone else have experience with this?",
  "Thanks for the help! Problem solved.",
  "Looking forward to more discussions like this.",
  "Really appreciate the community here.",
  "Just learned something new today!",
  "Can we schedule a call to discuss further?",
  "Excellent point. I hadn't thought of that.",
  "This is exactly what I was looking for!"
];

// ─── Main seed function ──────────────────────────────────────────────────────
async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log("🌱 Seeding database with presentation-ready data...\n");

  await sql`
    TRUNCATE TABLE
      workspace_memories, prompt_run_results, prompt_runs,
      node_messages, ai_nodes,
      dm_messages, dm_conversations, friend_requests,
      reactions, message_attachments, messages,
      notifications, community_join_requests,
      member_roles, workspaces, channels,
      community_members, roles, communities,
      refresh_sessions, users
    RESTART IDENTITY CASCADE
  `.execute(db);
  console.log("✓ Database cleared\n");

  // ── 1. Users ───────────────────────────────────────────────────────────────
  const userRows = people.map((p) => ({
    id: generateId(),
    username: p.username,
    email: p.email,
    password_hash: passwordHash,
    avatar_url: p.avatar,
    is_2fa_enabled: false,
    totp_secret: null
  }));
  await insertChunked("users", userRows);
  console.log(`✓ Created ${userRows.length} users (password: ${PASSWORD})`);

  // ── 2. Friend requests ────────────────────────────────────────────────────
  const friendPairs: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 5],
    [0, 7],
    [0, 26],
    [1, 2],
    [1, 5],
    [1, 7],
    [5, 26],
    [5, 7],
    [5, 8],
    [7, 26],
    [7, 27],
    [7, 33],
    [14, 21],
    [14, 22],
    [14, 23],
    [14, 24],
    [16, 17],
    [16, 28],
    [16, 29],
    [18, 19],
    [18, 20],
    [18, 25],
    [25, 19],
    [25, 20],
    [10, 11],
    [10, 12],
    [10, 13],
    [32, 31],
    [32, 37],
    [40, 41],
    [40, 42],
    [26, 27],
    [26, 33]
  ];
  const pendingFriends: [number, number][] = [
    [3, 0],
    [4, 0],
    [30, 0],
    [43, 7],
    [46, 44],
    [48, 38]
  ];
  const friendRows = [
    ...friendPairs.map(([a, b]) => ({
      id: generateId(),
      sender_id: userRows[a]!.id,
      receiver_id: userRows[b]!.id,
      status: "accepted" as const
    })),
    ...pendingFriends.map(([a, b]) => ({
      id: generateId(),
      sender_id: userRows[a]!.id,
      receiver_id: userRows[b]!.id,
      status: "pending" as const
    }))
  ];
  await insertChunked("friend_requests", friendRows);
  console.log(
    `✓ Created ${friendRows.length} friend connections (${friendPairs.length} accepted, ${pendingFriends.length} pending)`
  );

  // ── 3. DM conversations ───────────────────────────────────────────────────
  const dmPairs = friendPairs.slice(0, 8);
  const dmConversations = dmPairs.map(([a, b]) => ({
    id: generateId(),
    user1_id: userRows[a]!.id,
    user2_id: userRows[b]!.id,
    last_message_at: new Date()
  }));
  await insertChunked("dm_conversations", dmConversations);

  const dmMsgTemplates = [
    "Hey! How's everything going?",
    "Did you see the announcement in the community?",
    "Let's work on that project together this weekend!",
    "Thanks for helping me out with that bug 🙌",
    "Have you tried the new features they added?",
    "See you at the meetup tomorrow!",
    "Just pushed the latest changes. Take a look when you can.",
    "That was a great session. Learned a lot!"
  ];
  const dmMessages = dmConversations.flatMap((conv, idx) => {
    const pair = dmPairs[idx]!;
    const count = 4 + Math.floor(Math.random() * 5);
    return Array.from({ length: count }, (_, i) => ({
      id: generateId(),
      conversation_id: conv.id,
      sender_id: i % 2 === 0 ? userRows[pair[0]]!.id : userRows[pair[1]]!.id,
      content: dmMsgTemplates[i % dmMsgTemplates.length]!,
      is_edited: false
    }));
  });
  await insertChunked("dm_messages", dmMessages);
  console.log(
    `✓ Created ${dmConversations.length} DM conversations with ${dmMessages.length} messages`
  );

  // ── 4. Communities ─────────────────────────────────────────────────────────
  type CommunityRow = {
    id: string;
    ownerIdx: number;
    memberIdxs: number[];
    requireApproval: boolean;
    isPublic: boolean;
  };
  const communityRowsMeta: CommunityRow[] = [];
  const communityInserts = communityDefs.map((def, ci) => {
    const id = generateId();
    const allMemberIdxs = [...new Set([def.ownerIdx, ...def.memberIdxs])];
    communityRowsMeta.push({
      id,
      ownerIdx: def.ownerIdx,
      memberIdxs: allMemberIdxs,
      requireApproval: def.requireApproval,
      isPublic: def.isPublic
    });

    return {
      id,
      owner_id: userRows[def.ownerIdx]!.id,
      name: def.name,
      slug: def.slug,
      description: def.description,
      icon_url: `/images/servers/${(ci % 5) + 1}.png`,
      banner_url: `/images/servers/${((ci + 2) % 5) + 1}.png`,
      rules: JSON.stringify([
        { id: 1, text: "Be respectful and constructive in all discussions." },
        { id: 2, text: "No spam, self-promotion, or off-topic content." },
        { id: 3, text: "Keep conversations on-topic within channels." },
        { id: 4, text: "No harassment, hate speech, or personal attacks." }
      ]),
      is_public: def.isPublic,
      member_count: allMemberIdxs.length,
      category: def.category,
      tags: def.tags,
      require_approval: def.requireApproval,
      is_ai_pet: def.isAiPet,
      ai_agent_name: def.aiAgent?.name ?? null,
      ai_agent_pet_name: def.aiAgent?.petName ?? null,
      ai_agent_avatar: def.aiAgent ? pick(userRows).avatar_url : null,
      ai_agent_model: def.aiAgent?.model ?? null,
      ai_agent_description: def.aiAgent?.description ?? null
    };
  });
  await insertChunked("communities", communityInserts);
  console.log(`✓ Created ${communityDefs.length} communities`);

  // ── 5. Roles ───────────────────────────────────────────────────────────────
  const roleMap = new Map<string, { defaultId: string; adminId: string; modId: string }>();
  const roleInserts = communityRowsMeta.flatMap((c) => {
    const ids = { defaultId: generateId(), adminId: generateId(), modId: generateId() };
    roleMap.set(c.id, ids);
    return [
      {
        id: ids.defaultId,
        community_id: c.id,
        name: "everyone",
        color: null,
        permissions: 3,
        position: 0,
        is_default: true
      },
      {
        id: ids.adminId,
        community_id: c.id,
        name: "admin",
        color: "#EF4444",
        permissions: 63,
        position: 100,
        is_default: false
      },
      {
        id: ids.modId,
        community_id: c.id,
        name: "moderator",
        color: "#3B82F6",
        permissions: 27,
        position: 60,
        is_default: false
      }
    ];
  });
  await insertChunked("roles", roleInserts);
  console.log(`✓ Created ${roleInserts.length} roles`);

  // ── 6. Community members + member roles ────────────────────────────────────
  const memberInserts: {
    id: string;
    community_id: string;
    user_id: string;
    nickname: string | null;
  }[] = [];
  const memberRoleInserts: { member_id: string; role_id: string }[] = [];

  for (const c of communityRowsMeta) {
    const roles = roleMap.get(c.id)!;
    for (const userIdx of c.memberIdxs) {
      const memberId = generateId();
      memberInserts.push({
        id: memberId,
        community_id: c.id,
        user_id: userRows[userIdx]!.id,
        nickname: null
      });
      memberRoleInserts.push({ member_id: memberId, role_id: roles.defaultId });
      if (userIdx === c.ownerIdx) {
        memberRoleInserts.push({ member_id: memberId, role_id: roles.adminId });
      }
      if (userIdx === c.memberIdxs.find((i) => i !== c.ownerIdx)) {
        memberRoleInserts.push({ member_id: memberId, role_id: roles.modId });
      }
    }
  }
  await insertChunked("community_members", memberInserts);
  await insertChunked("member_roles", memberRoleInserts);
  console.log(
    `✓ Created ${memberInserts.length} community memberships with ${memberRoleInserts.length} role assignments`
  );

  // ── 7. Channels ────────────────────────────────────────────────────────────
  type ChannelInfo = {
    id: string;
    communityId: string;
    communityIdx: number;
    type: ChannelType;
    name: string;
  };
  const allChannels: ChannelInfo[] = [];

  for (let ci = 0; ci < communityDefs.length; ci++) {
    const def = communityDefs[ci]!;
    const communityId = communityRowsMeta[ci]!.id;
    let catPos = 0;

    for (const catGroup of def.channels) {
      const categoryId = generateId();
      await db
        .insertInto("channels")
        .values({
          id: categoryId,
          community_id: communityId,
          parent_id: null,
          type: "category",
          name: catGroup.cat,
          topic: null,
          description: `${catGroup.cat} channels`,
          banner_url: null,
          position: catPos++,
          is_private: false,
          slowmode_seconds: 0,
          last_message_at: null
        })
        .execute();

      let childPos = 0;
      for (const ch of catGroup.children) {
        const channelId = generateId();
        allChannels.push({
          id: channelId,
          communityId,
          communityIdx: ci,
          type: ch.type,
          name: ch.name
        });
        await db
          .insertInto("channels")
          .values({
            id: channelId,
            community_id: communityId,
            parent_id: categoryId,
            type: ch.type,
            name: ch.name,
            topic: ch.topic,
            description: `${ch.name} channel for ${def.name}`,
            banner_url: null,
            position: childPos++,
            is_private: false,
            slowmode_seconds: ch.type === "text" && ch.name === "help" ? 30 : 0,
            last_message_at: null
          })
          .execute();
      }
    }
  }
  console.log(
    `✓ Created ${allChannels.length} channels across ${communityDefs.length} communities`
  );

  // ── 8. Messages ────────────────────────────────────────────────────────────
  const textChannels = allChannels.filter((ch) => ch.type === "text" || ch.type === "announcement");
  const allMessages: { id: string; channelId: string; authorIdx: number }[] = [];

  for (const channel of textChannels) {
    const community = communityRowsMeta[channel.communityIdx]!;
    const memberIdxs = community.memberIdxs;
    const templates = msgTemplates[channel.name] ?? defaultMessages;
    const msgCount = Math.min(templates.length, 5 + Math.floor(Math.random() * 8));

    for (let i = 0; i < msgCount; i++) {
      const authorIdx = memberIdxs[i % memberIdxs.length]!;
      const msgId = generateId();
      allMessages.push({ id: msgId, channelId: channel.id, authorIdx });

      await db
        .insertInto("messages")
        .values({
          id: msgId,
          channel_id: channel.id,
          author_id: userRows[authorIdx]!.id,
          reply_to_id: null,
          content: templates[i % templates.length]!,
          type: "default",
          is_edited: false,
          is_pinned: i === 0
        })
        .execute();
    }

    await db
      .updateTable("channels")
      .set({ last_message_at: sql<Date>`now()` })
      .where("id", "=", channel.id)
      .execute();
  }
  console.log(`✓ Created ${allMessages.length} messages across ${textChannels.length} channels`);

  // ── 9. Reactions ───────────────────────────────────────────────────────────
  const reactionInserts: { id: string; message_id: string; user_id: string; emoji: string }[] = [];
  for (const msg of allMessages) {
    if (Math.random() < 0.4) continue;
    const community = communityRowsMeta.find((c) => c.memberIdxs.includes(msg.authorIdx));
    if (!community) continue;
    const reactorIdxs = pickN(community.memberIdxs, 1 + Math.floor(Math.random() * 3));
    for (const idx of reactorIdxs) {
      reactionInserts.push({
        id: generateId(),
        message_id: msg.id,
        user_id: userRows[idx]!.id,
        emoji: pick(EMOJIS)
      });
    }
  }
  await insertChunked("reactions", reactionInserts);
  console.log(`✓ Added ${reactionInserts.length} reactions`);

  // ── 10. Workspaces ─────────────────────────────────────────────────────────
  for (let ci = 0; ci < communityDefs.length; ci++) {
    const def = communityDefs[ci]!;
    const community = communityRowsMeta[ci]!;
    for (const ws of def.workspaces) {
      await db
        .insertInto("workspaces")
        .values({
          id: generateId(),
          community_id: community.id,
          created_by: userRows[community.ownerIdx]!.id,
          name: ws.name,
          emoji: ws.emoji,
          description: ws.description,
          banner_url: null,
          is_public: true
        })
        .execute();
    }
  }
  console.log(
    `✓ Created ${communityDefs.reduce((sum, d) => sum + d.workspaces.length, 0)} workspaces`
  );

  // ── 11. Join requests ──────────────────────────────────────────────────────
  const joinRequestInserts: {
    id: string;
    community_id: string;
    user_id: string;
    note: string | null;
    status: CommunityJoinRequestStatus;
    reviewed_by: string | null;
    reviewed_at: Date | null;
    notified_at: Date | null;
  }[] = [];

  for (let ci = 0; ci < communityRowsMeta.length; ci++) {
    const community = communityRowsMeta[ci]!;
    if (!community.requireApproval) continue;

    const nonMemberIdxs = Array.from({ length: userRows.length }, (_, i) => i).filter(
      (i) => !community.memberIdxs.includes(i)
    );
    const requesters = pickN(nonMemberIdxs, 3 + Math.floor(Math.random() * 3));

    const notes = [
      "Hi! I'd love to join this community and contribute.",
      "Excited to learn from everyone here!",
      "A friend recommended this community to me.",
      "I'm passionate about this topic and want to connect.",
      null
    ];

    for (let i = 0; i < requesters.length; i++) {
      const status: CommunityJoinRequestStatus =
        i === 0
          ? "pending"
          : i === 1
            ? "approved"
            : pick(["pending", "rejected"] as CommunityJoinRequestStatus[]);
      const isActioned = status === "approved" || status === "rejected";
      joinRequestInserts.push({
        id: generateId(),
        community_id: community.id,
        user_id: userRows[requesters[i]!]!.id,
        note: notes[i % notes.length]!,
        status,
        reviewed_by: isActioned ? userRows[community.ownerIdx]!.id : null,
        reviewed_at: isActioned ? new Date(Date.now() - 86400000 * (i + 1)) : null,
        notified_at: status === "approved" ? new Date(Date.now() - 86400000 * i) : null
      });
    }
  }
  await insertChunked("community_join_requests", joinRequestInserts);
  console.log(`✓ Created ${joinRequestInserts.length} join requests`);

  // ── 12. Notifications ──────────────────────────────────────────────────────
  const notifInserts: {
    id: string;
    user_id: string;
    actor_id: string | null;
    type: NotificationType;
    entity_type: "friend_request" | "community" | "channel" | "message" | null;
    entity_id: string | null;
    data: Record<string, unknown>;
    read_at: Date | null;
  }[] = [];

  for (const fr of pendingFriends) {
    notifInserts.push({
      id: generateId(),
      user_id: userRows[fr[1]]!.id,
      actor_id: userRows[fr[0]]!.id,
      type: "friend_request",
      entity_type: "friend_request",
      entity_id: null,
      data: {
        actor_username: people[fr[0]]!.username,
        preview: `${people[fr[0]]!.firstName} sent you a friend request`
      },
      read_at: null
    });
  }

  for (const jr of joinRequestInserts.filter((r) => r.status === "pending")) {
    const community = communityRowsMeta.find((c) => c.id === jr.community_id);
    if (!community) continue;
    notifInserts.push({
      id: generateId(),
      user_id: userRows[community.ownerIdx]!.id,
      actor_id: jr.user_id,
      type: "community_join",
      entity_type: "community",
      entity_id: community.id,
      data: { community_id: community.id, preview: "New join request for your community" },
      read_at: null
    });
  }

  const mentionMessages = allMessages.slice(0, 15);
  for (const msg of mentionMessages) {
    const community = communityRowsMeta[Math.floor(Math.random() * communityRowsMeta.length)]!;
    const targetIdx =
      community.memberIdxs.find((i) => i !== msg.authorIdx) ?? community.memberIdxs[0]!;
    notifInserts.push({
      id: generateId(),
      user_id: userRows[targetIdx]!.id,
      actor_id: userRows[msg.authorIdx]!.id,
      type: "mention",
      entity_type: "message",
      entity_id: msg.id,
      data: {
        actor_username: people[msg.authorIdx]!.username,
        preview: "mentioned you in a message"
      },
      read_at:
        Math.random() > 0.5 ? new Date(Date.now() - 3600000 * Math.floor(Math.random() * 48)) : null
    });
  }

  await insertChunked("notifications", notifInserts);
  console.log(`✓ Created ${notifInserts.length} notifications`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seeding complete! Ready for presentation.\n");
  console.log(`   Login with any username and password: ${PASSWORD}`);
  console.log(
    `   Total: ${userRows.length} users, ${communityDefs.length} communities, ${allChannels.length} channels, ${allMessages.length} messages\n`
  );
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
