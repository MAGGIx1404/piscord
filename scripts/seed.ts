import "dotenv/config";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import { sql } from "kysely";
import { db, generateId } from "../server/db/index.js";
import type {
  ChannelType,
  CommunityJoinRequestStatus,
  NotificationType
} from "../server/db/tables/index.js";

const PASSWORD = "Password@123";
const USER_COUNT = Number(process.env.SEED_USER_COUNT ?? "500");
const COMMUNITY_COUNT = Number(process.env.SEED_COMMUNITY_COUNT ?? "100");

const EMOJIS = ["🔥", "👍", "😂", "❤️", "🎉", "🤝", "💯", "🚀"];
const COMMUNITY_CATEGORIES = [
  "Technology",
  "Gaming",
  "Design",
  "Business",
  "Education",
  "Startups",
  "Lifestyle"
];

type SeedUser = {
  id: string;
  username: string;
};

type SeedCommunity = {
  id: string;
  ownerId: string;
  memberUserIds: string[];
  requireApproval: boolean;
  isPublic: boolean;
  isAiPet: boolean;
};

type SeedRoleMap = {
  defaultRoleId: string;
  adminRoleId: string;
  modRoleId: string;
};

type SeedChannel = {
  id: string;
  communityId: string;
  type: ChannelType;
};

type SeedCommunityMember = {
  id: string;
  communityId: string;
  userId: string;
};

type SeedMessage = {
  id: string;
  channelId: string;
  authorId: string;
};

function sampleUnique<T>(items: T[], count: number): T[] {
  return faker.helpers.arrayElements(items, Math.min(count, items.length));
}

function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

async function insertInChunks<T extends object>(
  table: Parameters<typeof db.insertInto>[0],
  rows: T[],
  size = 500
): Promise<void> {
  for (const part of chunk(rows, size)) {
    if (!part.length) continue;
    await db.insertInto(table).values(part).execute();
  }
}

function makeCommunitySlug(name: string, used: Set<string>): string {
  let slug = faker.helpers.slugify(name).toLowerCase();
  if (!slug) slug = `community-${faker.string.alphanumeric(6).toLowerCase()}`;

  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }

  let attempt = `${slug}-${faker.string.alphanumeric(4).toLowerCase()}`;
  while (used.has(attempt)) {
    attempt = `${slug}-${faker.string.alphanumeric(4).toLowerCase()}`;
  }
  used.add(attempt);
  return attempt;
}

const awesomePeople = [
  {
    username: "jerry_bhai",
    firstName: "Jerry",
    lastName: "Bhai",
    email: "jerry@gmail.com",
    avatar: "/uploads/avatars/a1.jpeg",
    background: "/uploads/covers/b1.jpg",
    about: "Just an ordinary mouse with extraordinary plans.",
    location: "Cartoon City",
    gender: "MALE"
  },
  {
    username: "tom",
    firstName: "Tom",
    lastName: "Jasper",
    email: "tom.jasper@gmail.com",
    avatar: "/uploads/avatars/a2.jpg",
    background: "/uploads/covers/b2.webp",
    about: "A cat with a never-ending chase and a heart of gold.",
    location: "Cartoon City",
    gender: "MALE"
  },
  {
    username: "doremon",
    firstName: "Doremon",
    lastName: "Billa",
    email: "doremon@gmail.com",
    avatar: "/uploads/avatars/a3.jpg",
    background: "",
    about: "A robotic cat from the future, here to help a useless kid named Nobita.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "tinku_bhai",
    firstName: "Tinku",
    lastName: "Bhai",
    email: "tinkubhai@gmail.com",
    avatar: "/uploads/avatars/a4.jpg",
    background: "",
    about: "EMI dreams, cash attitude. Inbox pehle, respect baad mein.",
    location: "Bhindi Bazar",
    gender: "MALE"
  },
  {
    username: "ludobhai",
    firstName: "Ludo",
    lastName: "Bhai",
    email: "ludobhai@gmail.com",
    avatar: "/uploads/avatars/a5.jpeg",
    background: "/uploads/covers/b5.webp",
    about: "Life is a dice roll. Main toh bas 6 pe hi rukta hoon.",
    location: "Bhindi Bazar",
    gender: "MALE"
  },
  {
    username: "munnabhai",
    firstName: "Munna",
    lastName: "Bhai",
    email: "munna_bhai@gmail.com",
    avatar: "/uploads/avatars/a6.png",
    background: "/uploads/covers/b6.jpeg",
    about: "Aye yede tere baap ki saadi hai kya ?.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "bablibhai",
    firstName: "Babli",
    lastName: "Bhai",
    email: "babli_bhai@gmail.com",
    avatar: "/uploads/avatars/a7.jpg",
    background: "",
    about: "Party badal liya sala",
    location: "On the boat",
    gender: "MALE"
  },
  {
    username: "rajuhalkat",
    firstName: "Raju",
    lastName: "Hera pheri wala",
    email: "raju@gmail.com",
    avatar: "/uploads/avatars/a8.webp",
    background: "/uploads/covers/b8.jpg",
    about: "Ekkis din main paise double.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "tiwari_seth",
    firstName: "Tiwari",
    lastName: "Seth",
    email: "tiwari.seth@gmail.com",
    avatar: "/uploads/avatars/a9.jpg",
    background: "",
    about: "Mera bees laat rupiya kidhal hai.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "maru_dhamdhere",
    firstName: "Martand",
    lastName: "Dhamdhere",
    email: "maru@gmail.com",
    avatar: "/uploads/avatars/a10.jpg",
    background: "",
    about: "Aaj budhwar hai aur budhwar ko main kagaz kalam chhuta nahi.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "majanu",
    firstName: "Majnu",
    lastName: "Bhai",
    email: "majnu_bhai@gmail.com",
    avatar: "/uploads/avatars/a11.avif",
    background: "/uploads/covers/b11.jpg",
    about: "Yeh raaz bhi ushi ke saath chala gaya.",
    location: "Dubai",
    gender: "MALE"
  },
  {
    username: "uday_shetty",
    firstName: "Uday",
    lastName: "Shetty",
    email: "uday@gmail.com",
    avatar: "/uploads/avatars/a12.jpeg",
    background: "/uploads/covers/b12.jpeg",
    about: "Control uday control.",
    location: "Dubai",
    gender: "MALE"
  },
  {
    username: "papi_papita",
    firstName: "Papi",
    lastName: "papita",
    email: "papi.papita@gmail.com",
    avatar: "/uploads/avatars/a13.jpg",
    background: "",
    about: "Half fruit, half flirt, full-time papita.",
    location: "Hawaii",
    gender: "MALE"
  },
  {
    username: "mithunda",
    firstName: "Mithun",
    lastName: "Chakraborty",
    email: "mithun.da@gmail.com",
    avatar: "/uploads/avatars/a14.webp",
    background: "/uploads/covers/b14.webp",
    about: "My name is Jimmy, and I'm a gangster! Half hero, half dancer, full Da.",
    location: "Kolkata",
    gender: "MALE"
  },
  {
    username: "chagan_halwai_880",
    firstName: "Chagan",
    lastName: "Halwai",
    email: "chagan.halwai@yahoo.com",
    avatar: "/uploads/avatars/a15.jpg",
    background: "",
    about: "My problems melt faster than my jalebis.",
    location: "Dholakpur",
    gender: "MALE"
  },
  {
    username: "mikala_jaksun",
    firstName: "Mikalal",
    lastName: "Jeksun",
    email: "mikalal.jaksun@gmail.com",
    avatar: "/uploads/avatars/a16.jpg",
    background: "",
    about: "The only King of Pop who still takes the bus.",
    location: "Los Angeles, CA",
    gender: "MALE"
  },
  {
    username: "champaklal",
    firstName: "Champak lal",
    lastName: "Gada",
    email: "champak.gada@gmail.com",
    avatar: "/uploads/avatars/a17.jpg",
    background: "",
    about: "Nahane ja nahane.",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "lord_jetha",
    firstName: "Jetha",
    lastName: "Champak Gada",
    email: "jethalovesbabita@gmail.com",
    avatar: "/uploads/avatars/a18.jpg",
    background: "",
    about: "Cash ya cheque.",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "shishimaru",
    firstName: "Shishimaru",
    lastName: "Ninja dog",
    email: "shishimaru@gmail.com",
    avatar: "/uploads/avatars/a19.webp",
    background: "",
    about: "Andhe ne movie dekhi, gunge ne gana gaya!!!!!",
    location: "Iga Village, Japan",
    gender: "MALE"
  },
  {
    username: "kio",
    firstName: "Kio",
    lastName: "black billa",
    email: "kio.koga@gmail.com",
    avatar: "/uploads/avatars/a20.jpeg",
    background: "",
    about: "Yeh Shishimaru sirf acting karta hai... asli talent toh mere paas hai!",
    location: "Koga Village, Japan",
    gender: "MALE"
  },
  {
    username: "lord_amara",
    firstName: "Kemuzou",
    lastName: "Kemumaki",
    email: "amara@gmail.com",
    avatar: "/uploads/avatars/a21.jpg",
    background: "/uploads/covers/b21.webp",
    about: "Mera name hai Amara, or main marta hu favara.",
    location: "Koga Village, Japan",
    gender: "MALE"
  },
  {
    username: "kaliya",
    firstName: "Kaliya",
    lastName: "Bully boy",
    email: "kaliya@gmail.com",
    avatar: "/uploads/avatars/a22.jpeg",
    background: "",
    about: "Only wearing black chaddi and fit kid in the dholakpur.",
    location: "Dholakpur",
    gender: "MALE"
  },
  {
    username: "kaliya_ka_mama",
    firstName: "Kaliya",
    lastName: "Ka mama",
    email: "kaliya.mama@gmail.com",
    avatar: "/uploads/avatars/a23.jpeg",
    background: "",
    about: "Mumbai se aarela mama.",
    location: "Mumbai <-> Dholakpur",
    gender: "MALE"
  },
  {
    username: "dhooni_baba",
    firstName: "Dhooni",
    lastName: "Baba",
    email: "dhooni.baba@gmail.com",
    avatar: "/uploads/avatars/a24.jpeg",
    background: "",
    about: "Dhooni baba, the wisest of them all.",
    location: "Dholakpur <-> Himalayas",
    gender: "MALE"
  },
  {
    username: "kitchak",
    firstName: "Kitchak",
    lastName: "kothari",
    email: "kitchak@gmail.com",
    avatar: "/uploads/avatars/a25.jpg",
    background: "",
    about: "Pehlwan pur ka kitchak.",
    location: "Pehlwan pur",
    gender: "MALE"
  },
  {
    username: "principle_007",
    firstName: "Bunta",
    lastName: "Takakura",
    email: "principle@gmail.com",
    avatar: "/uploads/avatars/a26.jpeg",
    background: "/uploads/covers/principle.webp",
    about: "Kasukabe kindergarden principle.",
    location: "Kasukabe, Japan",
    gender: "MALE"
  },
  {
    username: "baburao_aapte",
    firstName: "Baburao",
    lastName: "Ganpatrao Apte",
    email: "babu.aapte@gmail.com",
    avatar: "/uploads/avatars/a27.jpg",
    background: "/uploads/covers/b27.jpeg",
    about: "Cha maila, babu bhaiya se direct babu, tera to game bajana padega.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "shyam",
    firstName: "Shyam",
    lastName: "Sundar",
    email: "shyam@gmail.com",
    avatar: "/uploads/avatars/a28.png",
    background: "/uploads/covers/b28.webp",
    about: "ITUS - Iski Topi Uske Sar.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "bagheswar",
    firstName: "Bagha",
    lastName: "Boy",
    email: "bagha.boy@gmail.com",
    avatar: "/uploads/avatars/a29.png",
    background: "",
    about: "Voto, jaisi jiski soch",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "radhe_shyam",
    firstName: "Radhe",
    lastName: "Shyam tiwari",
    email: "radheshyam.tiwari@gmail.com",
    avatar: "/uploads/avatars/a30.jpg",
    background: "",
    about: "Kaua kitna bhi washing machine mai naha le, bagula nahi banta.",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "lord_jack",
    firstName: "Jack",
    lastName: "--",
    email: "jack@gmail.com",
    avatar: "/uploads/avatars/a31.gif",
    background: "",
    about: "Papa hu papa, iss duniya ka papa",
    location: "All around the world 🌍",
    gender: "MALE"
  },
  {
    username: "giyan",
    firstName: "Takeshi",
    lastName: "Gouda",
    email: "giyan.aslimard@gmail.com",
    avatar: "/uploads/avatars/a32.jpeg",
    background: "",
    about: "I am Gian — anyone who says no to me gets a free private performance.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "sinchan",
    firstName: "Shinnosuke",
    lastName: "Nohara",
    email: "sinchan.nohara@gmail.com",
    avatar: "/uploads/avatars/a33.jpeg",
    background: "",
    about: "My name is sinchan and I am 5 years old.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "kachara_seth",
    firstName: "Kachara",
    lastName: "Seth",
    email: "kachara.seth@gmail.com",
    avatar: "/uploads/avatars/a34.jpeg",
    background: "",
    about: "150rs dega!",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "chotta_chattri",
    firstName: "Chotta",
    lastName: "Chattri",
    email: "chotta.chattri@gmail.com",
    avatar: "/uploads/avatars/a35.avif",
    background: "",
    about: "Aye break maar, vinash kale viprit buddhi",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "dr_ghungroo",
    firstName: "Dr.",
    lastName: "Ghungroo",
    email: "drghungroo@gmail.com",
    avatar: "/uploads/avatars/a36.jpg",
    background: "",
    about: "Tera baap yaha chodke gaya tha ya teri ma?",
    location: "Dubai",
    gender: "MALE"
  },
  {
    username: "vasooli",
    firstName: "Vasooli",
    lastName: "Bhai",
    email: "vasooli_bhai@gmail.com",
    avatar: "/uploads/avatars/a37.png",
    background: "",
    about: "Jaldi bol kal subah panvel niklna hai.",
    location: "Goa",
    gender: "MALE"
  },
  {
    username: "buri_buri",
    firstName: "Buri",
    lastName: "zaemon",
    email: "buriburizaemon@gmail.com",
    avatar: "/uploads/avatars/a38.jpg",
    background: "",
    about: "Mai hamesha takatwar logo ki madad karta hu.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "pythagorus_bhai",
    firstName: "Pythagorus",
    lastName: "Bhai",
    email: "pythogorus_bhai@gmail.com",
    avatar: "/uploads/avatars/a39.jpg",
    background: "",
    about: "Inventor of pythagorus theorem and a great mathematician.",
    location: "Ancient Greece",
    gender: "MALE"
  },
  {
    username: "mommbati_joshi",
    firstName: "Mommbati",
    lastName: "Joshi",
    email: "mommbati.joshi@gmail.com",
    avatar: "/uploads/avatars/a40.jpg",
    background: "",
    about: "Selling videshi lalli powder",
    location: "California, USA",
    gender: "FEMALE"
  },
  {
    username: "ramesh",
    firstName: "Ramesh",
    lastName: "Rasilla",
    email: "ramesh@gmail.com",
    avatar: "/uploads/avatars/a41.jpg",
    background: "",
    about: "Just a sweet guy who loves rasilla padarth.",
    location: "Uttar Pradesh, India",
    gender: "MALE"
  },
  {
    username: "jhoney_pandey",
    firstName: "Jhoney",
    lastName: "Pandey",
    email: "jhoney.pandey@gmail.com",
    avatar: "/uploads/avatars/a42.jpeg",
    background: "",
    about: "Freedom fighter. Fight for memes.",
    location: "India",
    gender: "MALE"
  },
  {
    username: "pavitra_prabhakar",
    firstName: "Pavitra",
    lastName: "Prabhakar",
    email: "pavitra.prabhakar@gmail.com",
    avatar: "/uploads/avatars/a43.png",
    background: "",
    about: "Just your friendly neighborhood spoiderman.",
    location: "New York, USA",
    gender: "MALE"
  },
  {
    username: "ajay_bhai_devgan",
    firstName: "Ajay",
    lastName: "Bhai Devgan",
    email: "ajay.devgan@gmail.com",
    avatar: "/uploads/avatars/a44.jpg",
    background: "",
    about: "Bolo zubaan kesri.",
    location: "Kanpur, India",
    gender: "MALE"
  },
  {
    username: "babloo_blaster",
    firstName: "Babloo",
    lastName: "Blaster",
    email: "babloo.blaster@gmail.com",
    avatar: "/uploads/avatars/a45.jpg",
    background: "",
    about: "Eat s, shoots, and leaves.",
    location: "Chandani Chowk",
    gender: "MALE"
  },
  {
    username: "jogindar_jehrila",
    firstName: "Jogindar",
    lastName: "Jehrila",
    email: "jogindar@gmail.com",
    avatar: "/uploads/avatars/a46.webp",
    background: "",
    about: "I love snakes 🐍",
    location: "Somewhere in Amazon forest",
    gender: "MALE"
  },
  {
    username: "barmunda_kumar",
    firstName: "Barmunda",
    lastName: "Bur kumar",
    email: "barmunda.kumar@gmail.com",
    avatar: "/uploads/avatars/a47.jpg",
    background: "",
    about: "Riding high on the waves of life 🌊.",
    location: "Barmuda Triangle",
    gender: "MALE"
  },
  {
    username: "divakar_pardeshi",
    firstName: "Divakar",
    lastName: "Pardeshi",
    email: "divakar@gmail.com",
    avatar: "/uploads/avatars/a48.jpg",
    background: "",
    about: "Love desi potli with some extra water.",
    location: "Bhainsa",
    gender: "MALE"
  },
  {
    username: "raju_dalal",
    firstName: "Raju",
    lastName: "Dalal",
    email: "raju.dalal@gmail.com",
    avatar: "/uploads/avatars/a49.jpg",
    background: "",
    about: "Share market se bada koi game nahi.",
    location: "Lost in stock market",
    gender: "MALE"
  },
  {
    username: "mangal_singh",
    firstName: "Daku",
    lastName: "Mangal Singh",
    email: "dakumangal.singh@gmail.com",
    avatar: "/uploads/avatars/a50.jpg",
    background: "",
    about: "Most wanted daku of dholakpur.",
    location: "Dholakpur",
    gender: "MALE"
  },
  {
    username: "action_ka_men",
    firstName: "Action",
    lastName: "Ka men",
    email: "actionkamen@gmail.com",
    avatar: "/uploads/avatars/a51.jpg",
    background: "",
    about: "Just like my name, I am full of action and always ready for an adventure.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "lucky_man",
    firstName: "Lucky",
    lastName: "Men",
    email: "lucky.men@gmail.com",
    avatar: "/uploads/avatars/a52.jpg",
    background: "",
    about: "They call me Lucky because I always find a way out of tricky situations.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "hagemaru",
    firstName: "Tsurupika",
    lastName: "Hagemaru",
    email: "hagemaru@gmail.com",
    avatar: "/uploads/avatars/a53.jpg",
    background: "",
    about: "A kanjus kid in tokyo.",
    location: "Tokyo, Japan",
    gender: "MALE"
  }
];

async function main() {
  faker.seed(20260321);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log("Seeding database...");

  await sql`
    TRUNCATE TABLE
      reactions,
      message_attachments,
      messages,
      notifications,
      community_join_requests,
      member_roles,
      workspaces,
      channels,
      community_members,
      roles,
      communities,
      refresh_sessions,
      users
    RESTART IDENTITY CASCADE
  `.execute(db);

  console.log("Database truncated.");

  const users = Array.from({ length: USER_COUNT }, (_, index) => {
    const id = generateId();
    const first = faker.person.firstName().toLowerCase();
    const suffix = faker.string.alphanumeric(4).toLowerCase();
    const username = `${first}_${suffix}_${index}`;

    return {
      id,
      username,
      email: `${first}.${suffix}.${index}@piscord.dev`.toLowerCase(),
      password_hash: passwordHash,
      avatar_url: faker.image.avatar(),
      is_2fa_enabled: faker.datatype.boolean({ probability: 0.15 }),
      totp_secret: null
    };
  });

  const awesomeUsers = awesomePeople.map((p) => ({
    id: generateId(),
    username: p.username,
    email: p.email,
    password_hash: passwordHash,
    avatar_url: p.avatar,
    is_2fa_enabled: false,
    totp_secret: null
  }));

  await Promise.all([insertInChunks("users", users), insertInChunks("users", awesomeUsers)]);
  const seedUsers: SeedUser[] = [...users, ...awesomeUsers].map((user) => ({
    id: user.id,
    username: user.username
  }));

  console.log(`Created ${seedUsers.length} users.`);

  const usedSlugs = new Set<string>();
  const communities: SeedCommunity[] = Array.from({ length: COMMUNITY_COUNT }, () => {
    const owner = faker.helpers.arrayElement(awesomeUsers);
    const isPublic = faker.datatype.boolean({ probability: 0.75 });
    const requireApproval = !isPublic || faker.datatype.boolean({ probability: 0.35 });
    const minMembers = Math.min(50, USER_COUNT);
    const maxMembers = USER_COUNT;
    const memberSize = randomInt(minMembers, maxMembers);
    const members = sampleUnique(seedUsers, memberSize).map((user) => user.id);
    if (!members.includes(owner.id)) members.push(owner.id);

    return {
      id: generateId(),
      ownerId: owner.id,
      memberUserIds: members,
      requireApproval,
      isPublic,
      isAiPet: faker.datatype.boolean({ probability: 0.25 })
    };
  });

  await insertInChunks(
    "communities",
    communities.map((community) => {
      const name = faker.company.name();
      const isAiPet = community.isAiPet;

      return {
        id: community.id,
        owner_id: community.ownerId,
        name,
        slug: makeCommunitySlug(name, usedSlugs),
        description: faker.company.catchPhrase(),
        icon_url: faker.image.urlPicsumPhotos({ width: 256, height: 256 }),
        banner_url: faker.image.urlPicsumPhotos({ width: 1280, height: 320 }),
        rules: JSON.stringify([
          { id: 1, text: "Be respectful and constructive." },
          { id: 2, text: "No spam, harassment, or hate speech." },
          { id: 3, text: "Keep channels on-topic." }
        ]),
        is_public: community.isPublic,
        member_count: community.memberUserIds.length,
        category: faker.helpers.arrayElement(COMMUNITY_CATEGORIES),
        tags: faker.helpers.arrayElements(
          ["react", "design", "node", "product", "mobile", "backend", "career", "ai"],
          { min: 2, max: 4 }
        ),
        require_approval: community.requireApproval,
        is_ai_pet: isAiPet,
        ai_agent_name: isAiPet ? faker.person.firstName() : null,
        ai_agent_pet_name: isAiPet ? faker.animal.petName() : null,
        ai_agent_avatar: isAiPet ? faker.image.avatar() : null,
        ai_agent_model: isAiPet
          ? faker.helpers.arrayElement(["gpt-4o-mini", "gpt-4.1", "claude-3.7"])
          : null,
        ai_agent_description: isAiPet ? faker.lorem.sentence() : null
      };
    })
  );

  console.log(`Created ${communities.length} communities.`);

  const roleMapByCommunity = new Map<string, SeedRoleMap>();
  const roles = communities.flatMap((community) => {
    const defaultRoleId = generateId();
    const adminRoleId = generateId();
    const modRoleId = generateId();

    roleMapByCommunity.set(community.id, { defaultRoleId, adminRoleId, modRoleId });

    return [
      {
        id: defaultRoleId,
        community_id: community.id,
        name: "everyone",
        color: null,
        permissions: 3,
        position: 0,
        is_default: true
      },
      {
        id: adminRoleId,
        community_id: community.id,
        name: "admin",
        color: "#EF4444",
        permissions: 63,
        position: 100,
        is_default: false
      },
      {
        id: modRoleId,
        community_id: community.id,
        name: "moderator",
        color: "#3B82F6",
        permissions: 27,
        position: 60,
        is_default: false
      }
    ];
  });

  await insertInChunks("roles", roles);

  console.log(`Created ${roles.length} roles.`);

  const communityMembers: SeedCommunityMember[] = [];
  const memberByCommunityAndUser = new Map<string, string>();

  for (const community of communities) {
    for (const userId of community.memberUserIds) {
      const memberId = generateId();
      communityMembers.push({
        id: memberId,
        communityId: community.id,
        userId
      });
      memberByCommunityAndUser.set(`${community.id}:${userId}`, memberId);
    }
  }

  await insertInChunks(
    "community_members",
    communityMembers.map((member) => ({
      id: member.id,
      community_id: member.communityId,
      user_id: member.userId,
      nickname: faker.datatype.boolean({ probability: 0.2 }) ? faker.internet.displayName() : null
    }))
  );

  console.log(`Created ${communityMembers.length} community members.`);

  const memberRoles: Array<{ member_id: string; role_id: string }> = [];

  for (const community of communities) {
    const rolesForCommunity = roleMapByCommunity.get(community.id);
    if (!rolesForCommunity) continue;

    for (const userId of community.memberUserIds) {
      const memberId = memberByCommunityAndUser.get(`${community.id}:${userId}`);
      if (!memberId) continue;

      memberRoles.push({ member_id: memberId, role_id: rolesForCommunity.defaultRoleId });

      if (userId === community.ownerId) {
        memberRoles.push({ member_id: memberId, role_id: rolesForCommunity.adminRoleId });
        continue;
      }

      if (faker.datatype.boolean({ probability: 0.08 })) {
        memberRoles.push({ member_id: memberId, role_id: rolesForCommunity.modRoleId });
      }
    }
  }

  await insertInChunks("member_roles", memberRoles);
  console.log(`Assigned roles to community members.`);

  const channels: SeedChannel[] = [];

  for (const community of communities) {
    const generalCategoryId = generateId();
    const buildCategoryId = generateId();
    const announcementId = generateId();
    const generalTextId = generateId();
    const helpTextId = generateId();
    const showcaseTextId = generateId();
    const loungeVoiceId = generateId();
    const pairVoiceId = generateId();

    channels.push(
      { id: generalCategoryId, communityId: community.id, type: "category" },
      { id: buildCategoryId, communityId: community.id, type: "category" },
      { id: announcementId, communityId: community.id, type: "announcement" },
      { id: generalTextId, communityId: community.id, type: "text" },
      { id: helpTextId, communityId: community.id, type: "text" },
      { id: showcaseTextId, communityId: community.id, type: "text" },
      { id: loungeVoiceId, communityId: community.id, type: "voice" },
      { id: pairVoiceId, communityId: community.id, type: "voice" }
    );

    await db
      .insertInto("channels")
      .values([
        {
          id: generalCategoryId,
          community_id: community.id,
          parent_id: null,
          type: "category",
          name: "General",
          topic: null,
          description: "Default community channels",
          banner_url: null,
          position: 0,
          is_private: false,
          slowmode_seconds: 0,
          last_message_at: null
        },
        {
          id: buildCategoryId,
          community_id: community.id,
          parent_id: null,
          type: "category",
          name: "Build & Ship",
          topic: null,
          description: "Product and engineering discussions",
          banner_url: null,
          position: 1,
          is_private: false,
          slowmode_seconds: 0,
          last_message_at: null
        },
        {
          id: announcementId,
          community_id: community.id,
          parent_id: generalCategoryId,
          type: "announcement",
          name: "announcements",
          topic: "Official updates",
          description: "Release notes and important announcements",
          banner_url: faker.image.urlPicsumPhotos({ width: 1280, height: 240 }),
          position: 0,
          is_private: false,
          slowmode_seconds: 0,
          last_message_at: null
        },
        {
          id: generalTextId,
          community_id: community.id,
          parent_id: generalCategoryId,
          type: "text",
          name: "general",
          topic: "Daily chat",
          description: faker.lorem.sentence(),
          banner_url: null,
          position: 1,
          is_private: false,
          slowmode_seconds: 0,
          last_message_at: null
        },
        {
          id: helpTextId,
          community_id: community.id,
          parent_id: buildCategoryId,
          type: "text",
          name: "help",
          topic: "Get help from the community",
          description: faker.lorem.sentence(),
          banner_url: null,
          position: 0,
          is_private: false,
          slowmode_seconds: 30,
          last_message_at: null
        },
        {
          id: showcaseTextId,
          community_id: community.id,
          parent_id: buildCategoryId,
          type: "text",
          name: "showcase",
          topic: "Share what you shipped",
          description: faker.lorem.sentence(),
          banner_url: null,
          position: 1,
          is_private: faker.datatype.boolean({ probability: 0.15 }),
          slowmode_seconds: 10,
          last_message_at: null
        },
        {
          id: loungeVoiceId,
          community_id: community.id,
          parent_id: generalCategoryId,
          type: "voice",
          name: "Lounge",
          topic: null,
          description: null,
          banner_url: null,
          position: 2,
          is_private: false,
          slowmode_seconds: 0,
          last_message_at: null
        },
        {
          id: pairVoiceId,
          community_id: community.id,
          parent_id: buildCategoryId,
          type: "voice",
          name: "Pair Programming",
          topic: null,
          description: null,
          banner_url: null,
          position: 3,
          is_private: faker.datatype.boolean({ probability: 0.2 }),
          slowmode_seconds: 0,
          last_message_at: null
        }
      ])
      .execute();
  }

  const channelMembersByCommunity = new Map<string, string[]>();
  for (const community of communities) {
    channelMembersByCommunity.set(community.id, community.memberUserIds);
  }

  const messageChannels = channels.filter(
    (channel) => channel.type === "text" || channel.type === "announcement"
  );
  const messages: SeedMessage[] = [];

  for (const channel of messageChannels) {
    const members = channelMembersByCommunity.get(channel.communityId) ?? [];
    const total = randomInt(18, 44);
    const channelMessageIds: string[] = [];

    for (let i = 0; i < total; i += 1) {
      const id = generateId();
      const authorId = faker.helpers.arrayElement(members);
      const replyToId =
        channelMessageIds.length && faker.datatype.boolean({ probability: 0.18 })
          ? faker.helpers.arrayElement(channelMessageIds)
          : null;

      messages.push({
        id,
        channelId: channel.id,
        authorId
      });

      channelMessageIds.push(id);

      await db
        .insertInto("messages")
        .values({
          id,
          channel_id: channel.id,
          author_id: authorId,
          reply_to_id: replyToId,
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          type: "default",
          is_edited: faker.datatype.boolean({ probability: 0.12 }),
          is_pinned: faker.datatype.boolean({ probability: 0.03 })
        })
        .execute();
    }

    await db
      .updateTable("channels")
      .set({ last_message_at: sql<Date>`now()` })
      .where("id", "=", channel.id)
      .execute();
  }

  const attachments = messages
    .filter(() => faker.datatype.boolean({ probability: 0.12 }))
    .map((message) => ({
      id: generateId(),
      message_id: message.id,
      url: faker.image.urlPicsumPhotos({ width: 1920, height: 1080 }),
      filename: faker.system.fileName(),
      mime_type: faker.helpers.arrayElement(["image/png", "image/jpeg", "application/pdf"]),
      size_bytes: randomInt(8_000, 4_500_000)
    }));

  await insertInChunks("message_attachments", attachments);
  console.log(`Created ${messages.length} messages with ${attachments.length} attachments.`);

  const reactions: Array<{ id: string; message_id: string; user_id: string; emoji: string }> = [];

  for (const message of messages) {
    const reactionCount = randomInt(0, 6);
    const seen = new Set<string>();
    const communityId = channels.find((channel) => channel.id === message.channelId)?.communityId;
    const members = communityId ? (channelMembersByCommunity.get(communityId) ?? []) : [];

    for (let i = 0; i < reactionCount; i += 1) {
      const userId = faker.helpers.arrayElement(members);
      const emoji = faker.helpers.arrayElement(EMOJIS);
      const key = `${message.id}:${userId}:${emoji}`;
      if (seen.has(key)) continue;
      seen.add(key);

      reactions.push({
        id: generateId(),
        message_id: message.id,
        user_id: userId,
        emoji
      });
    }
  }

  await insertInChunks("reactions", reactions);
  console.log(`Added ${reactions.length} reactions to messages.`);

  await insertInChunks(
    "workspaces",
    communities.flatMap((community) => {
      const total = randomInt(1, 3);
      return Array.from({ length: total }, (_, index) => ({
        id: generateId(),
        community_id: community.id,
        created_by: faker.helpers.arrayElement(community.memberUserIds),
        name: index === 0 ? "Roadmap" : faker.commerce.productName(),
        emoji: faker.helpers.arrayElement(["📌", "🧭", "🧪", "📊", null]),
        description: faker.company.catchPhrase(),
        banner_url: faker.datatype.boolean({ probability: 0.35 })
          ? faker.image.urlPicsumPhotos({ width: 1280, height: 320 })
          : null,
        is_public: faker.datatype.boolean({ probability: 0.8 })
      }));
    })
  );
  console.log(`Created workspaces for communities.`);

  const joinRequests: Array<{
    id: string;
    community_id: string;
    user_id: string;
    note: string | null;
    status: CommunityJoinRequestStatus;
    reviewed_by: string | null;
    reviewed_at: Date | null;
    notified_at: Date | null;
  }> = [];

  for (const community of communities) {
    if (!community.requireApproval && community.isPublic) continue;

    const nonMembers = seedUsers.filter((user) => !community.memberUserIds.includes(user.id));
    if (!nonMembers.length) continue;

    const requesterMin = Math.min(2, nonMembers.length);
    const requesterMax = Math.min(nonMembers.length, 8);
    const requesters = sampleUnique(nonMembers, randomInt(requesterMin, requesterMax));

    for (const requester of requesters) {
      const status = faker.helpers.arrayElement<CommunityJoinRequestStatus>([
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ]);

      const isActioned = status === "approved" || status === "rejected";
      joinRequests.push({
        id: generateId(),
        community_id: community.id,
        user_id: requester.id,
        note: faker.datatype.boolean({ probability: 0.75 }) ? faker.lorem.sentence() : null,
        status,
        reviewed_by: isActioned ? faker.helpers.arrayElement(community.memberUserIds) : null,
        reviewed_at: isActioned ? faker.date.recent({ days: 15 }) : null,
        notified_at:
          isActioned && faker.datatype.boolean({ probability: 0.5 })
            ? faker.date.recent({ days: 8 })
            : null
      });
    }
  }

  await insertInChunks("community_join_requests", joinRequests);
  console.log(`Created ${joinRequests.length} community join requests.`);

  const notifications: Array<{
    id: string;
    user_id: string;
    actor_id: string | null;
    type: NotificationType;
    entity_type: "friend_request" | "community" | "channel" | "message" | null;
    entity_id: string | null;
    data: Record<string, unknown>;
    read_at: Date | null;
  }> = [];

  for (let i = 0; i < 260; i += 1) {
    const targetUser = faker.helpers.arrayElement(seedUsers);
    const actor = faker.helpers.arrayElement(seedUsers);
    const roll = faker.number.float({ min: 0, max: 1, fractionDigits: 2 });

    if (roll < 0.35 && messages.length) {
      const message = faker.helpers.arrayElement(messages);
      notifications.push({
        id: generateId(),
        user_id: targetUser.id,
        actor_id: actor.id === targetUser.id ? null : actor.id,
        type: "mention",
        entity_type: "message",
        entity_id: message.id,
        data: {
          preview: faker.lorem.sentence(),
          actor_username: actor.username
        },
        read_at: faker.datatype.boolean({ probability: 0.55 })
          ? faker.date.recent({ days: 7 })
          : null
      });
      continue;
    }

    if (roll < 0.7 && channels.length) {
      const channel = faker.helpers.arrayElement(channels);
      notifications.push({
        id: generateId(),
        user_id: targetUser.id,
        actor_id: actor.id === targetUser.id ? null : actor.id,
        type: "channel_message",
        entity_type: "channel",
        entity_id: channel.id,
        data: {
          channel_type: channel.type,
          actor_username: actor.username
        },
        read_at: faker.datatype.boolean({ probability: 0.62 })
          ? faker.date.recent({ days: 10 })
          : null
      });
      continue;
    }

    if (roll < 0.9 && communities.length) {
      const community = faker.helpers.arrayElement(communities);
      notifications.push({
        id: generateId(),
        user_id: community.ownerId,
        actor_id: actor.id,
        type: "community_join",
        entity_type: "community",
        entity_id: community.id,
        data: {
          community_id: community.id,
          actor_username: actor.username
        },
        read_at: faker.datatype.boolean({ probability: 0.48 })
          ? faker.date.recent({ days: 10 })
          : null
      });
      continue;
    }

    notifications.push({
      id: generateId(),
      user_id: targetUser.id,
      actor_id: null,
      type: "system",
      entity_type: null,
      entity_id: null,
      data: {
        title: faker.company.buzzPhrase(),
        body: faker.lorem.sentence()
      },
      read_at: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 20 }) : null
    });
  }

  await insertInChunks("notifications", notifications);
  console.log(`Created ${notifications.length} notifications.`);
  console.log("Seeding completed.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
