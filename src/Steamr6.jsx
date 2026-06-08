import React, { useState, useEffect, useRef, createContext, useContext } from "react";

// ── VIEWER DATA ───────────────────────────────────────────────────────────────
const VIEWER_PROFILE_DATA = {
  id:          99,
  username:    "darkwing99",
  displayName: "Darkwing",
  avatar:      "🦇",
  avatarImg:   null,
  joinDate:    "May 2024",
  email:       "d****9@gmail.com",
  tokens:      350,
  bio:         "Night owl, big tipper, here for the vibes 🦇✨",
  totalTipped: 1450,
};

const VIEWER_TIP_HISTORY = [
  {id:1, streamer:"Luna Vex",     avatar:"🎵", tokens:200, date:"Jun 4",  note:"Amazing stream! 🔥"},
  {id:2, streamer:"Storm Rider",  avatar:"🎮", tokens:50,  date:"Jun 2"},
  {id:3, streamer:"Crystal Wave", avatar:"🌊", tokens:100, date:"May 31", note:"Song request 🎸"},
  {id:4, streamer:"Luna Vex",     avatar:"🎵", tokens:25,  date:"May 28"},
  {id:5, streamer:"Rex Nova",     avatar:"💪", tokens:150, date:"May 22"},
  {id:6, streamer:"Luna Vex",     avatar:"🎵", tokens:500, date:"May 18", note:"Birthday treat! 🎂"},
  {id:7, streamer:"Aria Storm",   avatar:"🌟", tokens:75,  date:"May 14"},
  {id:8, streamer:"Storm Rider",  avatar:"🎮", tokens:200, date:"May 10"},
  {id:9, streamer:"Crystal Wave", avatar:"🌊", tokens:50,  date:"May 6"},
  {id:10,streamer:"Luna Vex",     avatar:"🎵", tokens:100, date:"Apr 28"},
];

const VIEWER_ACHIEVEMENTS = [
  {id:"first-tip",  icon:"🎯", label:"First Tip",     desc:"Sent your first tip",          earned:true },
  {id:"big-tipper", icon:"🐋", label:"Big Spender",   desc:"Tipped 🪙 500+ in one go",     earned:true },
  {id:"loyal",      icon:"❤️", label:"Loyal Viewer",  desc:"Followed 10+ streamers",        earned:true },
  {id:"vip",        icon:"👑", label:"Fan Club VIP",  desc:"Holds a VIP subscription",      earned:false},
  {id:"early",      icon:"🌅", label:"Early Adopter", desc:"Joined in the first month",     earned:true },
  {id:"diamond",    icon:"💎", label:"Diamond Fan",   desc:"Tipped 🪙 10,000+ total",       earned:false},
  {id:"collector",  icon:"🏆", label:"Collector",     desc:"Subbed to 5+ streamers",        earned:false},
  {id:"whale",      icon:"💰", label:"High Roller",   desc:"Spent $500+ on tokens",         earned:false},
];

// ── STREAMER WISHLIST ─────────────────────────────────────────────────────────
const DEFAULT_WISHLIST = [
  {id:1, emoji:"☕", name:"Coffee & Snacks Fund",     tokens:150,  usd:15.00,  fulfilled:false, desc:"Fuel for long streams!"},
  {id:2, emoji:"🎵", name:"Amazon Music (3 months)", tokens:1000, usd:10.00,  fulfilled:true,  desc:"Background music for streams"},
  {id:3, emoji:"🎸", name:"Ernie Ball Guitar Strings",tokens:130,  usd:12.99,  fulfilled:false, desc:"D'Addario EXL110 regular"},
  {id:4, emoji:"💻", name:"Stream Upgrade Fund",      tokens:500,  usd:50.00,  fulfilled:false, desc:"Toward a new capture card"},
  {id:5, emoji:"🎤", name:"Shure SM7B Microphone",   tokens:3990, usd:399.00, fulfilled:false, desc:"The mic all the pros use"},
];

// ── PPV / MONETIZATION DATA ──────────────────────────────────────────────────
const PPV_CONTENT = [
  {id:1, streamer:"Luna Vex",      avatar:"🎵", title:"Acoustic Night Special — Members Only", price:500, duration:"47 min", thumbnail:"🎸", category:"Music",   purchased:false},
  {id:2, streamer:"Storm Rider",   avatar:"🎮", title:"Pro Gaming Sessions — Uncut",            price:300, duration:"1h 22m",thumbnail:"🎮", category:"Gaming",  purchased:false},
  {id:3, streamer:"Crystal Wave",  avatar:"🌊", title:"ASMR Luxury Pack (3 Videos)",            price:800, duration:"2h 10m",thumbnail:"🎧", category:"ASMR",    purchased:false},
  {id:4, streamer:"Rex Nova",      avatar:"💪", title:"Extreme Workout Compilation",            price:250, duration:"38 min", thumbnail:"💪", category:"Fitness", purchased:false},
  {id:5, streamer:"Aria Storm",    avatar:"🌟", title:"Behind the Scenes: Studio Day",          price:400, duration:"1h 05m",thumbnail:"📹", category:"Exclusive",purchased:false},
  {id:6, streamer:"Luna Vex",      avatar:"🎵", title:"Unreleased Original Songs",              price:600, duration:"55 min", thumbnail:"🎶", category:"Music",   purchased:false},
];

const CLIP_PURCHASES = [
  {id:1, streamer:"Luna Vex",     avatar:"🎵", title:"Best Moments — June 2026",  price:80,  duration:"4:20", thumbnail:"🎬", purchased:false},
  {id:2, streamer:"Storm Rider",  avatar:"🎮", title:"Epic Win Compilation #12",  price:50,  duration:"2:45", thumbnail:"🏆", purchased:false},
  {id:3, streamer:"Crystal Wave", avatar:"🌊", title:"ASMR Highlight Reel",       price:60,  duration:"6:00", thumbnail:"🌊", purchased:false},
  {id:4, streamer:"Aria Storm",   avatar:"🌟", title:"Funniest Stream Moments",   price:40,  duration:"3:15", thumbnail:"😂", purchased:false},
];

const GIFT_CARD_AMOUNTS = [
  {id:1, tokens:500,  price:50.00,  label:"Starter Pack", icon:"🎁", color:"#aa8890", popular:false},
  {id:2, tokens:1000, price:95.00,  label:"Fan Pack",     icon:"⭐", color:"#ff6b35", popular:true },
  {id:3, tokens:2500, price:225.00, label:"Super Fan",    icon:"🌟", color:"#ff2d55", popular:false},
  {id:4, tokens:5000, price:400.00, label:"VIP Bundle",   icon:"👑", color:"#f5c518", popular:false},
];

const PAYOUT_HISTORY = [
  {id:1, date:"Jun 1, 2026",  amount:412.00, status:"paid",    method:"Bank Transfer ••4821"},
  {id:2, date:"May 1, 2026",  amount:387.50, status:"paid",    method:"Bank Transfer ••4821"},
  {id:3, date:"Apr 1, 2026",  amount:521.00, status:"paid",    method:"Bank Transfer ••4821"},
  {id:4, date:"Mar 1, 2026",  amount:298.75, status:"paid",    method:"Bank Transfer ••4821"},
  {id:5, date:"Feb 1, 2026",  amount:463.20, status:"paid",    method:"Bank Transfer ••4821"},
];

const EXTENDED_NOTIFICATIONS = [
  {id:1,  type:"tip",    message:"darkwing99 sent you 🪙 200 tokens", time:"2 min ago",  read:false, group:"Today"},
  {id:2,  type:"follow", message:"starfish22 started following you",   time:"8 min ago",  read:false, group:"Today"},
  {id:3,  type:"tip",    message:"nightowl sent you 🪙 50 tokens",    time:"14 min ago", read:false, group:"Today"},
  {id:4,  type:"sub",    message:"cometgaze subscribed at Fan tier 🌟",time:"1 hr ago",  read:true,  group:"Today"},
  {id:5,  type:"system", message:"Your stream got 1,200+ views! 🎉",  time:"3 hr ago",  read:true,  group:"Today"},
  {id:6,  type:"ppv",    message:"galaxy99 purchased your PPV content 🎬",time:"4 hr ago",read:true, group:"Today"},
  {id:7,  type:"payout", message:"Payout of $412.00 processed ✓",     time:"Yesterday 11:30am",read:true,group:"Yesterday"},
  {id:8,  type:"tip",    message:"galaxy99 sent you 🪙 500 tokens",   time:"Yesterday 8:15pm", read:true,group:"Yesterday"},
  {id:9,  type:"sub",    message:"neonwave upgraded to Super Fan ⭐",  time:"Yesterday 3:00pm", read:true,group:"Yesterday"},
  {id:10, type:"gift",   message:"⭐ Gift card sent to friend@email.com",time:"Sat 2:00pm",  read:true,group:"This Week"},
  {id:11, type:"follow", message:"thunderbird started following you",  time:"Mon 2:00pm",  read:true, group:"This Week"},
  {id:12, type:"system", message:"You've reached 5,000 followers! 🎉",time:"Mon 9:00am",  read:true, group:"This Week"},
];

const VIEWER_LOCATIONS = [
  {country:"United States", viewers:412, x:180, y:120},
  {country:"United Kingdom",viewers:187, x:420, y:78 },
  {country:"Canada",        viewers:134, x:155, y:85 },
  {country:"Germany",       viewers:98,  x:455, y:85 },
  {country:"Australia",     viewers:87,  x:710, y:280},
  {country:"France",        viewers:76,  x:440, y:95 },
  {country:"Brazil",        viewers:65,  x:240, y:240},
  {country:"Japan",         viewers:54,  x:730, y:115},
  {country:"Netherlands",   viewers:43,  x:450, y:80 },
  {country:"Spain",         viewers:34,  x:430, y:108},
];

const DARK_COLORS = {
  bg: "#0d0608",
  surface: "#160a0d",
  card: "#1e0f13",
  border: "#3d1f28",
  accent: "#ff2d55",
  accentB: "#c0163a",
  accentC: "#ff6b35",
  gold: "#f5c518",
  text: "#fff0f3",
  muted: "#aa8890",
  green: "#00e5a0",
};

const LIGHT_COLORS = {
  bg:      "#fff4f7",
  surface: "#ffe9f0",
  card:    "#ffffff",
  border:  "#f0ccd8",
  accent:  "#ff2d55",
  accentB: "#c0163a",
  accentC: "#e05a00",
  gold:    "#c49800",
  text:    "#1e0810",
  muted:   "#885566",
  green:   "#009966",
};
// Mutable — mutated by theme toggle, re-render picks up new values
const COLORS = { ...DARK_COLORS };

// ── Theme context ──────────────────────────────────────────────────────────
const ThemeCtx = createContext(true); // true = isDark
const useIsDark = () => useContext(ThemeCtx);

// Per-category colour — used in filter buttons and stream card pills
const CAT_COLOR = {
  Female:  "#ff6b9d",
  Male:    "#4a9edd",
  Couples: "#00e5a0",
  Trans:   "#b06fd8",
};

const TOKEN_PURCHASE_RATE = 0.10;
const STREAMER_PAYOUT_RATE = 0.05;
const tokensToStreamerUSD = (t) => (t * STREAMER_PAYOUT_RATE).toFixed(2);
const fmtUSD = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const styles = {
  app: {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "fixed",
    borderRadius: "50%",
    filter: "blur(120px)",
    pointerEvents: "none",
    zIndex: 0,
  },
};

// ── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const STREAMERS = [
  {
    id: 1, name: "Luna Vex", category: "Female", region: "North American",
    viewers: 1284, tokens: 8920, avatar: "🎵", live: true, preview: "#1a0a2e",
    isNew: false, tags: ["singer", "acoustic", "chill"],
    goal: { current: 720, target: 1000, label: "Acoustic guitar set 🎸" },
    privateRate: 30, isPrivate: false,
  },
  {
    id: 2, name: "Kai Storm", category: "Male", region: "Euro Russian",
    viewers: 4521, tokens: 23400, avatar: "🎮", live: true, preview: "#0a1a2e",
    isNew: false, tags: ["fps", "competitive", "pro"],
    goal: { current: 1000, target: 1000, label: "Marathon session 🏆" },
    privateRate: 60, isPrivate: false,
  },
  {
    id: 3, name: "Mira Sol", category: "Female", region: "South American",
    viewers: 892, tokens: 5600, avatar: "🎨", live: true, preview: "#1a2e0a",
    isNew: false, tags: ["digital art", "painting", "oc"],
    goal: { current: 400, target: 500, label: "Portrait reveal 🖼️" },
    privateRate: 20, isPrivate: false,
  },
  {
    id: 4, name: "Rex Nova", category: "Male", region: "North American",
    viewers: 2103, tokens: 11200, avatar: "💪", live: true, preview: "#2e1a0a",
    isNew: false, tags: ["workout", "hiit", "motivation"],
    goal: { current: 350, target: 2000, label: "1-hour mega workout" },
    privateRate: 45, isPrivate: false,
  },
  {
    id: 5, name: "Aria Flux", category: "Female", region: "Asian",
    viewers: 663, tokens: 3800, avatar: "🎙️", live: false, preview: "#2e0a1a",
    isNew: false, tags: ["asmr", "chill", "q&a"],
    goal: null, privateRate: 15, isPrivate: false,
  },
  {
    id: 6, name: "Zeph Cross", category: "Male", region: "Euro Russian",
    viewers: 441, tokens: 2100, avatar: "🍳", live: true, preview: "#0a2e2e",
    isNew: true, tags: ["cooking", "recipe", "live kitchen"],
    goal: { current: 150, target: 300, label: "Special dessert 🍰" },
    privateRate: 20, isPrivate: false,
  },
  {
    id: 7, name: "Nova Blaze", category: "Female", region: "North American",
    viewers: 3211, tokens: 15600, avatar: "🎸", live: true, preview: "#2e1a2e",
    isNew: true, tags: ["rock", "guitar", "live band"],
    goal: { current: 800, target: 1000, label: "Encore performance 🎵" },
    privateRate: 50, isPrivate: false,
  },
  {
    id: 8, name: "Jade Wilder", category: "Trans", region: "Asian",
    viewers: 1893, tokens: 9200, avatar: "🕹️", live: true, preview: "#1a2e2e",
    isNew: false, tags: ["rpg", "anime games", "casual"],
    goal: { current: 200, target: 800, label: "Speedrun attempt ⚡" },
    privateRate: 30, isPrivate: true,
  },
  {
    id: 9, name: "Cleo Rivers", category: "Female", region: "Euro Russian",
    viewers: 712, tokens: 4100, avatar: "🧘", live: true, preview: "#2e2e0a",
    isNew: true, tags: ["yoga", "wellness", "meditation"],
    goal: { current: 60, target: 200, label: "Live yoga flow 🌸" },
    privateRate: 25, isPrivate: false,
  },
  {
    id: 10, name: "Mars Echo", category: "Male", region: "North American",
    viewers: 2441, tokens: 12800, avatar: "🎤", live: true, preview: "#1a0a1a",
    isNew: false, tags: ["comedy", "improv", "storytelling"],
    goal: { current: 750, target: 1000, label: "Stand-up set 🎭" },
    privateRate: 40, isPrivate: false,
  },
  {
    id: 11, name: "Sol Quinn", category: "Trans", region: "South American",
    viewers: 388, tokens: 1900, avatar: "✏️", live: false, preview: "#0a1a0a",
    isNew: true, tags: ["sketch", "illustration", "character"],
    goal: null, privateRate: 15, isPrivate: false,
  },
  {
    id: 12, name: "Remi & Jay", category: "Couples", region: "Asian",
    viewers: 1024, tokens: 5300, avatar: "💑", live: true, preview: "#2e0a0a",
    isNew: false, tags: ["couple", "interactive", "lovense"],
    goal: { current: 400, target: 600, label: "Secret show reveal 💑" },
    privateRate: 20, isPrivate: false,
  },
];

// ── SUBSCRIPTION TIERS ───────────────────────────────────────────────────────
const SUBSCRIPTION_TIERS = [
  {
    name: "Fan",
    badge: "🌟",
    price: 4.99,
    color: COLORS.accentC,
    popular: false,
    perks: [
      "Fan badge in chat",
      "Access to stream replays",
      "Exclusive subscriber emotes",
    ],
  },
  {
    name: "Super Fan",
    badge: "⭐",
    price: 9.99,
    color: COLORS.accent,
    popular: true,
    perks: [
      "All Fan perks",
      "Private message the streamer",
      "5-min early stream access",
      "Priority in tip queue",
    ],
  },
  {
    name: "VIP",
    badge: "👑",
    price: 19.99,
    color: COLORS.gold,
    popular: false,
    perks: [
      "All Super Fan perks",
      "Monthly private show access",
      "Custom content requests",
      "VIP Discord role",
    ],
  },
];

// ── STREAMER PROFILES ─────────────────────────────────────────────────────────
// Full profile for Luna Vex (the logged-in streamer — fully editable)
const STREAMER_PROFILES = {
  1: {
    id: 1, name: "Luna Vex", avatar: "🎵",
    category: "Female", region: "North American",
    bannerColor: "#1a0a2e",
    bio: "Singer-songwriter streaming live acoustic sets and original music 🎸 Taking requests, sharing originals, and making magic one note at a time. Been performing for 8 years and streaming for 2. Come chill with me! 💕",
    roomSubject: "♪ Tip 🪙10 for a song request — taking requests all night! ♪",
    welcomeMsg: "Hey gorgeous, welcome to my room! 💕 Check out my tip menu below and don't forget to follow!",
    tags: ["singer", "acoustic", "chill", "music", "guitar"],
    socialLinks: { twitter: "@lunavex", instagram: "@luna.vex", tiktok: "@lunavexmusic" },
    followers: 4821,
    totalStreams: 47,
    avgViewers: 1284,
    tipMenu: [
      { tokens: 10,  action: "Song request 🎵" },
      { tokens: 25,  action: "Shoutout in stream 📢" },
      { tokens: 50,  action: "Follow back on socials 💛" },
      { tokens: 100, action: "Personal voice message 💌" },
      { tokens: 250, action: "Custom song dedication 🎶" },
      { tokens: 500, action: "30-min private show 🎭" },
    ],
    wishlist: DEFAULT_WISHLIST.map(i => ({...i})),
    streamHistory: [
      { date: "May 30", title: "Acoustic Friday Night 🎸", viewers: 1284, tokens: 8920,  duration: "2h 15m" },
      { date: "May 28", title: "Covers & Requests 🎵",     viewers: 1102, tokens: 7340,  duration: "1h 45m" },
      { date: "May 25", title: "Original Songs Session",   viewers: 892,  tokens: 5200,  duration: "1h 30m" },
      { date: "May 22", title: "Late Night Chill 🌙",      viewers: 743,  tokens: 4100,  duration: "2h 00m" },
      { date: "May 18", title: "Fan Appreciation Special", viewers: 1580, tokens: 11200, duration: "3h 00m" },
    ],
    subscriptionTiers: SUBSCRIPTION_TIERS,
  },
};
// Auto-generate streamlined profiles for all other streamers
STREAMERS.forEach(s => {
  if (!STREAMER_PROFILES[s.id]) {
    STREAMER_PROFILES[s.id] = {
      id: s.id, name: s.name, avatar: s.avatar,
      category: s.category, region: s.region,
      bannerColor: s.preview,
      bio: `${s.name} live on Steamr — follow for notifications when I go live!`,
      roomSubject: s.goal ? `Goal: ${s.goal.label} — tip to help reach it!` : "Welcome to my room!",
      welcomeMsg: `Hey! Welcome to my room 👋 Don't forget to follow!`,
      tags: s.tags,
      socialLinks: {},
      followers: Math.floor(s.viewers * 3.5),
      totalStreams: Math.floor(s.tokens / 500),
      avgViewers: s.viewers,
      tipMenu: [
        { tokens: 10,  action: "Say hi 👋"         },
        { tokens: 50,  action: "Shoutout 📢"        },
        { tokens: 100, action: "Special request 🎯" },
        { tokens: 500, action: "Private show 🔒"    },
      ],
      subscriptionTiers: SUBSCRIPTION_TIERS,
      streamHistory: [],
    };
  }
});

const TOKEN_PACKS = [
  { id: 1, tokens: 100,  price: 10.00,  bonus: 0,    popular: false },
  { id: 2, tokens: 500,  price: 50.00,  bonus: 50,   popular: true  },
  { id: 3, tokens: 1000, price: 100.00, bonus: 150,  popular: false },
  { id: 4, tokens: 5000, price: 500.00, bonus: 1000, popular: false },
];

const CHAT_MSGS = [
  { user: "darkwing99",  msg: "you're amazing!! 🔥",        tokens: null },
  { user: "viewer_x",   msg: "sent 50 tokens!",             tokens: 50   },
  { user: "nightowl",   msg: "best stream today hands down", tokens: null },
  { user: "starfish22", msg: "sent 200 tokens!",             tokens: 200  },
  { user: "cometgaze",  msg: "lol this is gold",             tokens: null },
];

// ── NOTIFICATIONS DATA ────────────────────────────────────────────────────────
const INIT_NOTIFICATIONS = [
  { id: 1, type: "tip",    message: "darkwing99 sent you 🪙 200 tokens",          time: "2 min ago",   read: false },
  { id: 2, type: "follow", message: "starfish22 started following you",            time: "8 min ago",   read: false },
  { id: 3, type: "tip",    message: "nightowl sent you 🪙 50 tokens",             time: "14 min ago",  read: false },
  { id: 4, type: "payout", message: "Payout of $412.00 processed successfully ✓", time: "1 hour ago",  read: true  },
  { id: 5, type: "follow", message: "cometgaze started following you",             time: "2 hours ago", read: true  },
  { id: 6, type: "tip",    message: "viewer_x sent you 🪙 100 tokens",            time: "3 hours ago", read: true  },
  { id: 7, type: "tip",    message: "nightbird sent you 🪙 500 tokens",           time: "5 hours ago", read: true  },
];

// ── BASE COMPONENTS ───────────────────────────────────────────────────────────
function Pill({ children, color = COLORS.accent, style = {} }) {
  return (
    <span style={{
      background: color + "22", color,
      border: `1px solid ${color}44`,
      borderRadius: 99, padding: "2px 8px",
      fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
      textTransform: "uppercase", whiteSpace: "nowrap",
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const base = {
    border: "none", borderRadius: 10, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.18s", fontSize: 14,
    padding: "10px 22px", opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary:   { background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentB})`, color: "#fff" },
    secondary: { background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    ghost:     { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}` },
    green:     { background: `linear-gradient(135deg, ${COLORS.green}, #00b37e)`, color: "#000" },
    gold:      { background: `linear-gradient(135deg, ${COLORS.gold}, #d4a017)`, color: "#000" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", background: COLORS.surface,
          border: `1px solid ${COLORS.border}`, borderRadius: 10,
          padding: "11px 14px", color: COLORS.text, fontSize: 14,
          outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = COLORS.accent}
        onBlur={e  => e.target.style.borderColor = COLORS.border}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: COLORS.surface,
          border: `1px solid ${COLORS.border}`, borderRadius: 10,
          padding: "11px 14px", color: COLORS.text, fontSize: 14,
          outline: "none", boxSizing: "border-box",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function RateInfo({ forStreamer = false }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: COLORS.gold + "18", border: `1px solid ${COLORS.gold}44`,
      borderRadius: 8, padding: "5px 10px", fontSize: 12, color: COLORS.gold, fontWeight: 600,
    }}>
      🪙 {forStreamer
        ? `You earn $${STREAMER_PAYOUT_RATE.toFixed(2)} per token · Platform fee $${(TOKEN_PURCHASE_RATE - STREAMER_PAYOUT_RATE).toFixed(2)}`
        : `1 token = $${TOKEN_PURCHASE_RATE.toFixed(2)}`}
    </div>
  );
}

// ── NOTIFICATION BELL ─────────────────────────────────────────────────────────
const NOTIF_META = {
  tip:       { icon: "🪙", color: COLORS.gold    },
  follow:    { icon: "♥",  color: COLORS.accent  },
  payout:    { icon: "💸", color: COLORS.green   },
  subscribe: { icon: "👑", color: COLORS.gold    },
  live:      { icon: "🔴", color: COLORS.accent  },
};

function NotificationBell({ notifications = [], onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell icon button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative",
          background: open ? COLORS.card : "transparent",
          border: `1px solid ${open ? COLORS.border : "transparent"}`,
          borderRadius: 10, padding: "7px 10px",
          cursor: "pointer", color: COLORS.text,
          fontSize: 18, lineHeight: 1, transition: "all 0.18s",
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            background: COLORS.accent, color: "#fff",
            borderRadius: "50%", minWidth: 16, height: 16,
            fontSize: 9, fontWeight: 800, lineHeight: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
            border: `2px solid ${COLORS.surface}`,
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: 52, right: 0,
          width: 320, background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14, boxShadow: "0 8px 32px #00000077",
          zIndex: 500, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 16px", borderBottom:`1px solid ${COLORS.border}` }}>
            <span style={{ fontWeight:800, fontSize:14 }}>
              Notifications
              {unread > 0 && <span style={{ color:COLORS.accent, marginLeft:6 }}>({unread} new)</span>}
            </span>
            {unread > 0 && (
              <button onClick={onMarkAllRead} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12, fontWeight:600, padding:0 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding:"36px 16px", textAlign:"center", color:COLORS.muted, fontSize:13 }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const meta = NOTIF_META[n.type] || { icon: "🔔", color: COLORS.muted };
                return (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    style={{
                      display:"flex", gap:12, padding:"12px 16px", cursor:"pointer",
                      alignItems:"flex-start",
                      background: n.read ? "transparent" : COLORS.accent + "0d",
                      borderBottom:`1px solid ${COLORS.border}`,
                      transition:"background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.surface}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : COLORS.accent + "0d"}
                  >
                    {/* Type icon */}
                    <div style={{
                      width:34, height:34, borderRadius:"50%", flexShrink:0,
                      background: meta.color + "22", border:`1px solid ${meta.color}44`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:14, marginTop:1,
                    }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:COLORS.text, lineHeight:1.5, marginBottom:3 }}>{n.message}</div>
                      <div style={{ fontSize:11, color:COLORS.muted }}>{n.time}</div>
                    </div>
                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS.accent, flexShrink:0, marginTop:8 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TOAST SYSTEM ──────────────────────────────────────────────────────────────
const TOAST_META = {
  tip:     { bg: COLORS.gold   + "28", border: COLORS.gold   + "66", icon: "🪙", color: COLORS.gold    },
  follow:  { bg: COLORS.accent + "28", border: COLORS.accent + "66", icon: "♥",  color: COLORS.accent  },
  payout:  { bg: COLORS.green  + "28", border: COLORS.green  + "66", icon: "💸", color: COLORS.green   },
  live:    { bg: COLORS.accent + "28", border: COLORS.accent + "66", icon: "🔴", color: COLORS.accent  },
  success:   { bg: COLORS.green  + "28", border: COLORS.green  + "66", icon: "✓",  color: COLORS.green   },
  subscribe: { bg: COLORS.gold   + "28", border: COLORS.gold   + "66", icon: "👑", color: COLORS.gold    },
};

function Toast({ t }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const id = setTimeout(() => setVisible(true), 30); return () => clearTimeout(id); }, []);
  const s = TOAST_META[t.type] || TOAST_META.success;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 12, padding: "12px 16px", maxWidth: 300,
      boxShadow: "0 4px 20px #00000055",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      pointerEvents: "none",
    }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
      <span style={{ fontSize: 13, color: s.color, fontWeight: 600, lineHeight: 1.4 }}>{t.message}</span>
    </div>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      zIndex: 9999, display: "flex", flexDirection: "column-reverse",
      gap: 8, alignItems: "flex-end", pointerEvents: "none",
    }}>
      {toasts.map(t => <Toast key={t.id} t={t} />)}
    </div>
  );
}

// ── SUB BADGE ─────────────────────────────────────────────────────────────────
const SUB_META = {
  "Fan":       { color: COLORS.accentC, icon: "🌟" },
  "Super Fan": { color: COLORS.accent,  icon: "⭐"  },
  "VIP":       { color: COLORS.gold,    icon: "👑"  },
};
function SubBadge({ tierName, style = {} }) {
  const m = SUB_META[tierName] || SUB_META["Fan"];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      background: m.color + "30", color: m.color,
      border: `1px solid ${m.color}50`,
      borderRadius: 4, padding: "1px 6px",
      whiteSpace: "nowrap", verticalAlign: "middle",
      ...style,
    }}>
      {m.icon} {tierName}
    </span>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width:44, height:24, borderRadius:12, border:"none", padding:0,
        background: checked ? COLORS.green : COLORS.border,
        position:"relative", cursor:"pointer",
        transition:"background 0.22s", flexShrink:0,
      }}
    >
      <div style={{
        width:18, height:18, borderRadius:"50%", background:"#fff",
        position:"absolute", top:3,
        left: checked ? 23 : 3,
        transition:"left 0.22s",
        boxShadow:"0 1px 4px #00000044",
      }} />
    </button>
  );
}

// ── GOAL BAR ─────────────────────────────────────────────────────────────────
function GoalBar({ goal, large = false }) {
  if (!goal) return null;
  const pct     = Math.min(100, (goal.current / goal.target) * 100);
  const reached = pct >= 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: large ? 13 : 11, marginBottom: 4 }}>
        <span style={{ color: COLORS.muted }}>🎯 {goal.label}</span>
        <span style={{ color: reached ? COLORS.gold : COLORS.text, fontWeight: 700 }}>
          {goal.current.toLocaleString()} / {goal.target.toLocaleString()} 🪙
        </span>
      </div>
      <div style={{ height: large ? 7 : 5, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 4,
          background: reached
            ? `linear-gradient(90deg, ${COLORS.gold}, #ffd700)`
            : `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentC})`,
          transition: "width 0.6s ease",
        }} />
      </div>
      {reached && (
        <div style={{ textAlign: "center", fontSize: 11, color: COLORS.gold, fontWeight: 800, marginTop: 4 }}>
          🎉 Goal Reached!
        </div>
      )}
    </div>
  );
}

// ── STREAM CARD ───────────────────────────────────────────────────────────────
function StreamCard({ streamer: s, onNavigate, isFollowing, onFollow, featured = false }) {
  const [hovered, setHovered] = useState(false);
  const thumbH = featured ? 185 : 155;

  return (
    <div
      onClick={() => s.live && !s.isPrivate && onNavigate("stream-room")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.card,
        border: `1px solid ${hovered && s.live ? (s.isPrivate ? COLORS.gold : COLORS.accent) : COLORS.border}`,
        borderRadius: 13, overflow: "hidden",
        cursor: s.live && !s.isPrivate ? "pointer" : "default",
        transform: hovered && s.live ? "translateY(-4px)" : "none",
        boxShadow: hovered && s.live ? `0 10px 28px ${COLORS.accent}22` : "none",
        transition: "all 0.2s",
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: thumbH, background: s.live ? s.preview : COLORS.surface, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: featured ? 52 : 40, opacity: s.live ? 1 : 0.35 }}>{s.avatar}</span>

        {/* Top-left badges */}
        <div style={{ position: "absolute", top: 7, left: 7, display: "flex", flexDirection: "column", gap: 3 }}>
          {s.live && !s.isPrivate && <Pill color={COLORS.accent}>🔴 LIVE</Pill>}
          {s.isPrivate               && <Pill color={COLORS.gold}>🔒 PRIVATE</Pill>}
          {!s.live                   && <Pill color={COLORS.muted}>OFFLINE</Pill>}
          {s.isNew                   && <Pill color={COLORS.accentC}>NEW</Pill>}
        </div>

        {/* Viewer count — top right */}
        {s.live && (
          <div style={{ position: "absolute", top: 7, right: 7, background: "#00000088", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
            👁 {s.viewers.toLocaleString()}
          </div>
        )}

        {/* Follow button — bottom right */}
        <button
          onClick={e => { e.stopPropagation(); onFollow(); }}
          style={{
            position: "absolute", bottom: 7, right: 7,
            background: isFollowing ? COLORS.accent : "#00000077",
            border: `1px solid ${isFollowing ? COLORS.accent : "#ffffff33"}`,
            borderRadius: 7, padding: "4px 10px",
            color: "#fff", fontSize: 16, cursor: "pointer",
            transition: "all 0.18s",
          }}
        >
          {isFollowing ? "♥" : "♡"}
        </button>

        {/* Spy overlay on private hover */}
        {s.isPrivate && hovered && (
          <div
            onClick={e => { e.stopPropagation(); onNavigate("stream-room"); }}
            style={{
              position: "absolute", inset: 0, background: "#00000099",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 4 }}>🔍</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.gold }}>Spy on Show</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>🪙 {s.privateRate} tokens / min</div>
          </div>
        )}

        {/* Offline overlay */}
        {!s.live && (
          <div style={{ position: "absolute", inset: 0, background: "#00000066", display: "flex", alignItems: "flex-end", padding: "8px 10px" }}>
            <span style={{ fontSize: 11, color: COLORS.muted }}>Was live 2h ago</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span
            onClick={e => { e.stopPropagation(); onNavigate("profile", { streamerId: s.id }); }}
            style={{ fontWeight: 700, fontSize: 14, color: s.live ? COLORS.text : COLORS.muted, cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: COLORS.border }}
          >{s.name}</span>
          <Pill color={CAT_COLOR[s.category] || COLORS.accentB}>{s.category}</Pill>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {s.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 10, color: COLORS.muted, background: COLORS.surface, borderRadius: 4, padding: "1px 5px" }}>#{tag}</span>
          ))}
        </div>

        {/* Goal bar or token count */}
        {s.goal
          ? <GoalBar goal={s.goal} />
          : <div style={{ fontSize: 11, color: COLORS.gold }}>🪙 {s.tokens.toLocaleString()} earned today</div>
        }
      </div>
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────────────────────
const STEAMR_LOGO_DATA = "data:image/png;base64,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";

// Background has been removed — image is a transparent PNG.
// No blend mode tricks needed; just a clean logo on any dark surface.
function SteamrLogo({ height = 44, glow = false, opacity = 1 }) {
  return (
    <img
      src={STEAMR_LOGO_DATA}
      alt="Steamr"
      style={{
        height,
        width: "auto",
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        opacity,
        filter: glow ? "drop-shadow(0 0 32px #ff2d5588)" : "none",
      }}
    />
  );
}

function Footer() {
  return (
    <footer style={{ borderTop:`1px solid ${COLORS.border}`, padding:"32px 24px 40px", textAlign:"center", marginTop:56 }}>
      <div style={{ marginBottom:14 }}>
        <SteamrLogo height={152} opacity={0.55} />
      </div>
      <div style={{ color:COLORS.muted, fontSize:12, marginBottom:12 }}>
        © {new Date().getFullYear()} Steamr Inc. · All rights reserved.
      </div>
      <div style={{ display:"flex", gap:18, justifyContent:"center", flexWrap:"wrap" }}>
        {["Terms of Service","Privacy Policy","DMCA","2257 Statement","Cookie Policy","Support"].map(l => (
          <span key={l} style={{ color:COLORS.muted, fontSize:11, cursor:"pointer", textDecoration:"underline", textDecorationColor:COLORS.border + "88" }}>
            {l}
          </span>
        ))}
      </div>
    </footer>
  );
}

function LoginScreen({ onNavigate, onLogin }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);

    fetch("/api/auth-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: email.trim(), password }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        onLogin(data.role, data.token, data.email, data.name);
      } else {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
      }
    })
    .catch(() => {
      setError("Could not connect. Please check your connection and try again.");
      setLoading(false);
    });
  };

  return (
    <div style={{ maxWidth:420, margin:"0 auto", padding:isMobile?"40px 20px":"60px 24px" }}>
      {/* Logo */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
        <SteamrLogo height={160} glow />
      </div>

      <h2 style={{ margin:"0 0 6px", fontSize:28, fontWeight:900, textAlign:"center" }}>Welcome back</h2>
      <p style={{ color:COLORS.muted, fontSize:14, textAlign:"center", marginBottom:32 }}>Log in to your Steamr account</p>

      <Card>
        {/* Email */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>Email Address</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"12px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>Password</label>
          <div style={{ position:"relative" }}>
            <input
              type={showPass?"text":"password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"12px 44px 12px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
            />
            <button onClick={() => setShowPass(s => !s)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:COLORS.muted, fontSize:16, padding:0 }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom:16, padding:"10px 14px", background:"#ff444422", border:"1px solid #ff444444", borderRadius:8, fontSize:13, color:"#ff6666" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Login button */}
        <Btn onClick={handleLogin} style={{ width:"100%", fontSize:15, padding:"13px", fontWeight:900 }} disabled={loading}>
          {loading ? "Logging in…" : "Log In →"}
        </Btn>

        {/* Forgot password */}
        <div style={{ textAlign:"center", marginTop:14 }}>
          <button onClick={() => onNavigate("forgot-password")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12 }}>
            Forgot your password? <span style={{ color:COLORS.accent, fontWeight:700 }}>Click Here</span>
          </button>
        </div>
      </Card>

      {/* Sign up links */}
      <div style={{ textAlign:"center", marginTop:24 }}>
        <div style={{ color:COLORS.muted, fontSize:13, marginBottom:12 }}>Don't have an account yet?</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={() => onNavigate("signup-viewer")} variant="secondary" style={{ fontSize:13 }}>Join as Viewer</Btn>
          <Btn onClick={() => onNavigate("signup-streamer")} variant="ghost" style={{ fontSize:13 }}>Become a Streamer</Btn>
        </div>
      </div>

      <div style={{ textAlign:"center", marginTop:20 }}>
        <button onClick={() => onNavigate("landing")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12 }}>← Back to Home</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ForgotPasswordScreen({ onNavigate }) {
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    fetch("/api/auth-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "forgot", email: email.trim() }),
    })
    .then(r => r.json())
    .then(data => {
      setLoading(false);
      if (data.ok) { setSent(true); }
      else { setError(data.error || "Could not send reset email. Try again."); }
    })
    .catch(() => { setLoading(false); setError("Could not connect. Try again."); });
  };

  return (
    <div style={{ maxWidth:420, margin:"0 auto", padding:"60px 24px" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
        <SteamrLogo height={120} glow />
      </div>

      {!sent ? (<>
        <h2 style={{ margin:"0 0 6px", fontSize:26, fontWeight:900, textAlign:"center" }}>Reset Password</h2>
        <p style={{ color:COLORS.muted, fontSize:14, textAlign:"center", marginBottom:32, lineHeight:1.6 }}>
          Enter the email address on your account and we'll send you a reset link.
        </p>
        <Card>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"12px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          {error && (
            <div style={{ marginBottom:16, padding:"10px 14px", background:"#ff444422", border:"1px solid #ff444444", borderRadius:8, fontSize:13, color:"#ff6666" }}>
              ⚠️ {error}
            </div>
          )}
          <Btn onClick={handleSubmit} style={{ width:"100%", fontSize:15, padding:"13px", fontWeight:900 }} disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link →"}
          </Btn>
          <div style={{ textAlign:"center", marginTop:14 }}>
            <button onClick={() => onNavigate("login")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12 }}>
              ← Back to Login
            </button>
          </div>
        </Card>
      </>) : (
        <Card style={{ textAlign:"center", padding:"40px 24px" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
          <h3 style={{ margin:"0 0 10px", fontSize:20, fontWeight:900, color:COLORS.green }}>Check your email!</h3>
          <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
            We sent a password reset link to <strong style={{ color:COLORS.text }}>{email}</strong>.
            It expires in 30 minutes.
          </p>
          <p style={{ color:COLORS.muted, fontSize:12, marginBottom:24 }}>
            Didn't receive it? Check your spam folder or try again.
          </p>
          <Btn onClick={() => { setSent(false); setEmail(""); }} variant="ghost" style={{ width:"100%" }}>
            Try a Different Email
          </Btn>
          <div style={{ marginTop:12 }}>
            <button onClick={() => onNavigate("login")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12 }}>
              ← Back to Login
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD SCREEN — accessed via steamr.app?reset=TOKEN
// ══════════════════════════════════════════════════════════════════════════════
function ResetPasswordScreen({ resetToken, onNavigate }) {
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const handleReset = () => {
    setError("");
    if (password.length < 6)          { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)         { setError("Passwords do not match."); return; }
    setLoading(true);
    fetch("/api/auth-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "reset", token: resetToken, newPassword: password }),
    })
    .then(r => r.json())
    .then(data => {
      setLoading(false);
      if (data.ok) { setDone(true); }
      else { setError(data.error || "Reset failed. The link may have expired."); }
    })
    .catch(() => { setLoading(false); setError("Could not connect. Try again."); });
  };

  return (
    <div style={{ maxWidth:420, margin:"0 auto", padding:"60px 24px" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
        <SteamrLogo height={120} glow />
      </div>

      {!done ? (<>
        <h2 style={{ margin:"0 0 6px", fontSize:26, fontWeight:900, textAlign:"center" }}>Set New Password</h2>
        <p style={{ color:COLORS.muted, fontSize:14, textAlign:"center", marginBottom:32 }}>Choose a strong password for your account.</p>
        <Card>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>New Password</label>
            <div style={{ position:"relative" }}>
              <input
                type={showPass?"text":"password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"12px 44px 12px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
              />
              <button onClick={() => setShowPass(s => !s)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:COLORS.muted, fontSize:16, padding:0 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>Confirm Password</label>
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleReset()}
              placeholder="Repeat your new password"
              style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"12px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          {error && (
            <div style={{ marginBottom:16, padding:"10px 14px", background:"#ff444422", border:"1px solid #ff444444", borderRadius:8, fontSize:13, color:"#ff6666" }}>
              ⚠️ {error}
            </div>
          )}
          <Btn onClick={handleReset} style={{ width:"100%", fontSize:15, padding:"13px", fontWeight:900 }} disabled={loading}>
            {loading ? "Saving…" : "Set New Password →"}
          </Btn>
        </Card>
      </>) : (
        <Card style={{ textAlign:"center", padding:"40px 24px" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔑</div>
          <h3 style={{ margin:"0 0 10px", fontSize:20, fontWeight:900, color:COLORS.green }}>Password Updated!</h3>
          <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Btn onClick={() => onNavigate("login")} style={{ width:"100%" }}>
            Go to Login →
          </Btn>
        </Card>
      )}
    </div>
  );
}


function LandingScreen({ onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <SteamrLogo height={560} glow />
      </div>
      <h1 style={{
        fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900, margin: "0 0 20px",
        lineHeight: 1.1,
        background: `linear-gradient(135deg, #fff 30%, ${COLORS.accent}, ${COLORS.accentB})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -2,
      }}>Steam Up. Connect.</h1>
      <p style={{ color: COLORS.muted, fontSize: 18, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
        The live streaming site where creators and fans connect for steamy fun.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => onNavigate("signup-streamer")} style={{ fontSize: 16, padding: "14px 32px" }}>🔥 Start Streaming</Btn>
        <Btn onClick={() => onNavigate("signup-viewer")} variant="secondary" style={{ fontSize: 16, padding: "14px 32px" }}>🤍 Join as Viewer</Btn>
        <Btn onClick={() => onNavigate("login")} variant="ghost" style={{ fontSize: 16, padding: "14px 32px" }}>Log In →</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginTop: 64, textAlign: "left" }}>
        {[
          { icon: "💰", title: "Real Earnings", desc: "Viewers buy tokens and send them directly to you. Cash out to your bank any time." },
          { icon: "📡", title: "Go Live Instantly", desc: "One click to broadcast your camera to thousands of viewers worldwide." },
          { icon: "🏆", title: "Top Streamers", desc: "The hottest streamers rise to the top. Build your fanbase and earn more every stream." },
        ].map(f => (
          <Card key={f.title}><div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div><div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{f.title}</div><div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div></Card>
        ))}
      </div>
      <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 48 }}>
        {[["14K+","Streamers"],["$2.1M","Paid Out"],["890K","Viewers"]].map(([val,label]) => (
          <div key={label}><div style={{ fontSize: 28, fontWeight: 900, color: COLORS.accent }}>{val}</div><div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{label}</div></div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function AgeGate({ onNavigate }) {
  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
        <SteamrLogo height={288} glow />
      </div>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔞</div>
      <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 800, color: COLORS.accent }}>You must be 18 or older</h2>
      <p style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>Steamr is an adults-only platform. Unfortunately you are not eligible to create an account.</p>
      <Btn onClick={() => onNavigate("landing")} variant="ghost">← Return to Home</Btn>
    </div>
  );
}

function SignupScreen({ role, onNavigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", dob: "", category: "female", bankName: "", accountNum: "", routing: "" });
  const [ageError, setAgeError] = useState(false);
  const [agreedToS, setAgreedToS] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const isStreamer = role === "streamer";
  const update = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleContinue = () => {
    const age = calcAge(form.dob);
    if (age === null) { setAgeError(true); return; }
    if (age < 18)     { setBlocked(true); return; }
    if (!agreedToS || !agreedAge) { setAgeError(true); return; }
    setAgeError(false);
    // Save account to Upstash via API
    fetch("/api/auth-signup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: form.email.trim(), password: form.password, name: form.name, role }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        // Save token for session
        localStorage.setItem("steamr_token", data.token);
        localStorage.setItem("steamr_session", JSON.stringify({ email: data.email, name: data.name, role: data.role }));
      }
      // Continue to step 2 regardless — user can still complete signup
    })
    .catch(() => {});
    setStep(2);
  };

  if (blocked) return <AgeGate onNavigate={onNavigate} />;
  const stepLabels = isStreamer ? ["Account Details", "Bank Setup"] : ["Account Details", "Membership"];

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
        <SteamrLogo height={152} />
      </div>
      <button onClick={() => onNavigate("landing")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", marginBottom: 20, fontSize: 13 }}>← Back</button>
      <div style={{ marginBottom: 8 }}><Pill color={isStreamer ? COLORS.accent : COLORS.accentC}>{isStreamer ? "Streamer Account" : "Viewer Account"}</Pill></div>
      <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800 }}>{step === 1 ? "Create your account" : isStreamer ? "Set up payments" : "Choose a membership"}</h2>
      <p style={{ color: COLORS.muted, marginBottom: 32, fontSize: 14 }}>{step === 1 ? "Fill in your details below" : isStreamer ? "Where should we send your earnings?" : "Select a plan to get started"}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>{[1,2].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? COLORS.accent : COLORS.border, transition: "background 0.3s" }} />)}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>{stepLabels.map((label, i) => <div key={label} style={{ flex: 1, fontSize: 11, color: i+1<=step ? COLORS.accent : COLORS.muted, fontWeight: 600 }}>{label}</div>)}</div>
      <Card>
        {step === 1 && (<>
          <Input label="Full Name" value={form.name} onChange={update("name")} placeholder="Your name" />
          <Input label="Email" type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" />
          <Input label="Password" type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 characters" />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>Date of Birth <span style={{ color: COLORS.accent }}>*</span></label>
            <input type="date" value={form.dob} onChange={e => update("dob")(e.target.value)}
              style={{ width:"100%", background:COLORS.surface, border:`1px solid ${form.dob && calcAge(form.dob)<18?"#ff4444":COLORS.border}`, borderRadius:10, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", colorScheme:"dark" }}
            />
            {form.dob && calcAge(form.dob) !== null && (
              <div style={{ marginTop:6, fontSize:12, color: calcAge(form.dob)>=18?COLORS.green:"#ff4444", fontWeight:600 }}>
                {calcAge(form.dob)>=18 ? `✓ Age verified — ${calcAge(form.dob)} years old` : `✗ You must be at least 18 years old`}
              </div>
            )}
          </div>
          {isStreamer && <Select label="Stream Category" value={form.category} onChange={update("category")} options={[{value:"female",label:"♀ Female"},{value:"male",label:"♂ Male"},{value:"couples",label:"♥ Couples"},{value:"trans",label:"⚧ Trans"}]} />}
          <div style={{ borderTop:`1px solid ${COLORS.border}`, paddingTop:16, marginTop:4, display:"flex", flexDirection:"column", gap:12 }}>
            {[{key:"age",state:agreedAge,setter:setAgreedAge,label:"I confirm I am 18 years of age or older"},{key:"tos",state:agreedToS,setter:setAgreedToS,label:"I agree to the Terms of Service and Privacy Policy"}].map(({key,state,setter,label}) => (
              <label key={key} style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", fontSize:13 }}>
                <div onClick={() => setter(s=>!s)} style={{ width:18,height:18,minWidth:18,borderRadius:5,border:`2px solid ${state?COLORS.accent:COLORS.border}`,background:state?COLORS.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,transition:"all 0.15s",cursor:"pointer" }}>
                  {state && <span style={{ color:"#fff",fontSize:11,lineHeight:1 }}>✓</span>}
                </div>
                <span style={{ color:COLORS.muted,lineHeight:1.5 }}>{label}</span>
              </label>
            ))}
          </div>
          {ageError && <div style={{ marginTop:12,padding:"10px 14px",background:"#ff444422",border:"1px solid #ff444444",borderRadius:8,fontSize:13,color:"#ff6666" }}>⚠️ Please enter your date of birth and tick both boxes to continue.</div>}
          <Btn onClick={handleContinue} style={{ width:"100%",marginTop:16 }}>Continue →</Btn>
        </>)}
        {step===2 && isStreamer && (<>
          <div style={{ padding:"10px 14px",background:COLORS.green+"18",border:`1px solid ${COLORS.green}44`,borderRadius:8,marginBottom:12,fontSize:13,color:COLORS.green }}>✓ Age verified — you're good to go!</div>
          <p style={{ color:COLORS.muted,fontSize:13,marginTop:0 }}>Your earnings are paid out via bank transfer. This info is encrypted and secure.</p>
          <Input label="Bank Name" value={form.bankName} onChange={update("bankName")} placeholder="e.g. Chase, Bank of America" />
          <Input label="Account Number" value={form.accountNum} onChange={update("accountNum")} placeholder="••••••••" />
          <Input label="Routing Number" value={form.routing} onChange={update("routing")} placeholder="9-digit routing number" />
          <Btn onClick={() => onNavigate("kyc-streamer")} variant="green" style={{ width:"100%",marginTop:8 }}>🛡️ Verify My Identity →</Btn>
        </>)}
        {step===2 && !isStreamer && (<>
          <div style={{ padding:"10px 14px",background:COLORS.green+"18",border:`1px solid ${COLORS.green}44`,borderRadius:8,marginBottom:12,fontSize:13,color:COLORS.green }}>✓ Age verified — you're good to go!</div>
          <p style={{ color:COLORS.muted,fontSize:13,marginTop:0 }}>Memberships include bonus tokens each month.</p>
          {[{name:"Free",price:"$0/mo",tokens:0,perks:["Watch streams","Public chat"],color:COLORS.border},{name:"Fan",price:"$9.99/mo",tokens:100,perks:["100 bonus tokens/mo ($10 value)","Priority chat badge"],color:COLORS.accentC},{name:"Super Fan",price:"$24.99/mo",tokens:250,perks:["250 bonus tokens/mo ($25 value)","Gold badge + emotes"],color:COLORS.gold}].map(plan => (
            <div key={plan.name} onClick={() => onNavigate("kyc-viewer")} style={{ border:`2px solid ${plan.color}`,borderRadius:12,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"all 0.2s",background:plan.color+"11" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}><span style={{ fontWeight:800,fontSize:16 }}>{plan.name}</span><span style={{ color:plan.color,fontWeight:700 }}>{plan.price}</span></div>
              {plan.perks.map(p => <div key={p} style={{ fontSize:12,color:COLORS.muted }}>✓ {p}</div>)}
            </div>
          ))}
        </>)}
      </Card>
    </div>
  );
}

// ── BROWSE ────────────────────────────────────────────────────────────────────
const CATS    = ["All", "Female", "Male", "Couples", "Trans"];
const REGIONS = ["All Regions", "North American", "Euro Russian", "Asian", "South American", "Other Region"];
const SORTS   = [
  { key: "featured",  label: "⭐ Featured"   },
  { key: "viewers",   label: "👁 Most Viewed" },
  { key: "new",       label: "✨ New"          },
  { key: "following", label: "♥ Following"    },
];

// Trending tags shown in the discovery row — hot:true gets a 🔥 badge
const TRENDING_TAGS = [
  { tag: "lovense",     hot: true  },
  { tag: "interactive", hot: true  },
  { tag: "couples",     hot: true  },
  { tag: "asmr",        hot: false },
  { tag: "fitness",     hot: false },
  { tag: "acoustic",    hot: false },
  { tag: "gaming",      hot: false },
  { tag: "yoga",        hot: false },
  { tag: "comedy",      hot: false },
  { tag: "tattoo",      hot: false },
  { tag: "rpg",         hot: false },
  { tag: "digital art", hot: false },
];

// ── FAN CLUB DATA ────────────────────────────────────────────────────────────
const TIER_RANK = { "Fan": 1, "Super Fan": 2, "VIP": 3 };
const FAN_CLUB_POSTS = [
  { id:1, streamerId:1, streamerName:"Luna Vex", streamerAvatar:"🎵", minTier:"Fan", type:"text",
    caption:"Just finished writing a new song 🎸 Can't wait to debut it in tonight's stream! You're all going to LOVE it 💕", timestamp:"2h ago", likes:147, comments:23, liked:false },
  { id:2, streamerId:1, streamerName:"Luna Vex", streamerAvatar:"🎵", minTier:"Fan", type:"photo",
    gradient:"linear-gradient(135deg,#1a0a2e,#2d1456)", caption:"Studio selfie 📸 Recording day vibes ✨", timestamp:"5h ago", likes:284, comments:47, liked:false },
  { id:3, streamerId:1, streamerName:"Luna Vex", streamerAvatar:"🎵", minTier:"Super Fan", type:"video",
    gradient:"linear-gradient(135deg,#0d1a3e,#1a3060)", duration:"5:24", caption:"🎬 Super Fan exclusive: 5-min preview of my new EP recording session!", timestamp:"1d ago", likes:512, comments:83, liked:false },
  { id:4, streamerId:1, streamerName:"Luna Vex", streamerAvatar:"🎵", minTier:"VIP", type:"photo",
    gradient:"linear-gradient(135deg,#2a1a0e,#4a2a0e)", caption:"👑 VIP only — backstage at the venue tonight 🎭", timestamp:"2d ago", likes:891, comments:124, liked:false },
  { id:5, streamerId:1, streamerName:"Luna Vex", streamerAvatar:"🎵", minTier:"Fan", type:"poll",
    caption:"What should I play in tonight's stream? 🎵",
    pollOptions:[{text:"Acoustic covers",votes:234},{text:"Original songs only",votes:186},{text:"Fan requests",votes:312},{text:"Mix of everything",votes:98}],
    timestamp:"3d ago", likes:203, comments:56, liked:false },
  { id:6, streamerId:7, streamerName:"Nova Blaze", streamerAvatar:"🎸", minTier:"Fan", type:"text",
    caption:"New guitar arrived 🎸🔥 Stream tonight is going to be ELECTRIC!! Can't wait to show you all!", timestamp:"1h ago", likes:445, comments:78, liked:false },
  { id:7, streamerId:7, streamerName:"Nova Blaze", streamerAvatar:"🎸", minTier:"Super Fan", type:"photo",
    gradient:"linear-gradient(135deg,#2e0a2e,#4a1a50)", caption:"Surprise — new merch drop coming! Super Fans get first dibs 👀", timestamp:"8h ago", likes:618, comments:101, liked:false },
  { id:8, streamerId:10, streamerName:"Mars Echo", streamerAvatar:"🎤", minTier:"Fan", type:"poll",
    caption:"Which improv scenario should I do this Friday? 😂",
    pollOptions:[{text:"Office party gone wrong",votes:156},{text:"Time traveller tourist",votes:289},{text:"Reality TV audition",votes:201}],
    timestamp:"4h ago", likes:332, comments:64, liked:false },
  { id:9, streamerId:4, streamerName:"Rex Nova", streamerAvatar:"💪", minTier:"Fan", type:"text",
    caption:"PR update: 3 reps at 225lbs bench 🏋️ New training plan dropping for subscribers only next week!", timestamp:"6h ago", likes:521, comments:89, liked:false },
];

// ── SCHEDULE DATA ─────────────────────────────────────────────────────────────
const SCHEDULE_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const SCHEDULE_EVENTS = [
  { id:1, streamerId:1, streamerName:"Luna Vex",   avatar:"🎵", day:1, startHour:20, duration:2.5, title:"Acoustic Friday Night",    color:"#ff2d55", isYours:true },
  { id:2, streamerId:7, streamerName:"Nova Blaze", avatar:"🎸", day:2, startHour:21, duration:2,   title:"Rock & Roll Saturday",    color:"#ff6b35" },
  { id:3, streamerId:2, streamerName:"Kai Storm",  avatar:"🎮", day:0, startHour:18, duration:3,   title:"FPS Marathon",            color:"#4a9edd" },
  { id:4, streamerId:10,streamerName:"Mars Echo",  avatar:"🎤", day:3, startHour:19, duration:1.5, title:"Stand-up Set",            color:"#9b59b6" },
  { id:5, streamerId:1, streamerName:"Luna Vex",   avatar:"🎵", day:3, startHour:20, duration:2,   title:"Covers & Requests",       color:"#ff2d55", isYours:true },
  { id:6, streamerId:9, streamerName:"Cleo Rivers",avatar:"🧘", day:4, startHour:7,  duration:1,   title:"Morning Yoga Flow",       color:"#00e5a0" },
  { id:7, streamerId:4, streamerName:"Rex Nova",   avatar:"💪", day:5, startHour:17, duration:2,   title:"HIIT Workout",            color:"#e74c3c" },
  { id:8, streamerId:1, streamerName:"Luna Vex",   avatar:"🎵", day:6, startHour:21, duration:3,   title:"Fan Appreciation Special",color:"#ff2d55", isYours:true },
  { id:9, streamerId:3, streamerName:"Mira Sol",   avatar:"🎨", day:1, startHour:14, duration:3,   title:"Digital Art Session",     color:"#27ae60" },
  { id:10,streamerId:6, streamerName:"Zeph Cross", avatar:"🍳", day:5, startHour:12, duration:2,   title:"Live Kitchen Special",    color:"#f39c12" },
  { id:11,streamerId:12,streamerName:"Remi & Jay", avatar:"💑", day:2, startHour:23, duration:1.5, title:"Couples Q&A",             color:"#00b894" },
  { id:12,streamerId:2, streamerName:"Kai Storm",  avatar:"🎮", day:4, startHour:20, duration:2.5, title:"Ranked Grind Live",       color:"#4a9edd" },
];

// ── LEADERBOARD DATA ──────────────────────────────────────────────────────────
const LEADERBOARD = {
  tippers: {
    today: [
      {rank:1,name:"darkwing99",  avatar:"🦇",tokens:8920, badge:"🥇"},
      {rank:2,name:"starfish22",  avatar:"⭐",tokens:6450, badge:"🥈"},
      {rank:3,name:"nightowl",    avatar:"🦉",tokens:4200, badge:"🥉"},
      {rank:4,name:"viewer_x",    avatar:"👤",tokens:2800},
      {rank:5,name:"cometgaze",   avatar:"☄️",tokens:1950},
      {rank:6,name:"neonrider",   avatar:"🌟",tokens:1200},
      {rank:7,name:"flashpulse",  avatar:"⚡",tokens:890},
      {rank:8,name:"crystalwave", avatar:"💎",tokens:650},
    ],
    weekly: [
      {rank:1,name:"starfish22",  avatar:"⭐",tokens:42100,badge:"🥇"},
      {rank:2,name:"darkwing99",  avatar:"🦇",tokens:38750,badge:"🥈"},
      {rank:3,name:"nightbird",   avatar:"🐦",tokens:21400,badge:"🥉"},
      {rank:4,name:"cometgaze",   avatar:"☄️",tokens:15200},
      {rank:5,name:"viewer_x",    avatar:"👤",tokens:9800},
      {rank:6,name:"neonrider",   avatar:"🌟",tokens:7400},
      {rank:7,name:"flashpulse",  avatar:"⚡",tokens:4200},
      {rank:8,name:"crystalwave", avatar:"💎",tokens:2900},
    ],
    alltime: [
      {rank:1,name:"starfish22",  avatar:"⭐",tokens:924000,badge:"🥇"},
      {rank:2,name:"darkwing99",  avatar:"🦇",tokens:756000,badge:"🥈"},
      {rank:3,name:"nightbird",   avatar:"🐦",tokens:512000,badge:"🥉"},
      {rank:4,name:"cometgaze",   avatar:"☄️",tokens:380000},
      {rank:5,name:"viewer_x",    avatar:"👤",tokens:241000},
    ],
  },
  streamers: {
    today: [
      {rank:1,name:"Kai Storm",   avatar:"🎮",tokens:23400,viewers:4521,badge:"🥇"},
      {rank:2,name:"Nova Blaze",  avatar:"🎸",tokens:15600,viewers:3211,badge:"🥈"},
      {rank:3,name:"Mars Echo",   avatar:"🎤",tokens:12800,viewers:2441,badge:"🥉"},
      {rank:4,name:"Rex Nova",    avatar:"💪",tokens:11200,viewers:2103},
      {rank:5,name:"Jade Wilder", avatar:"🕹️",tokens:9200, viewers:1893},
      {rank:6,name:"Luna Vex",    avatar:"🎵",tokens:8920, viewers:1284,isYours:true},
      {rank:7,name:"Mira Sol",    avatar:"🎨",tokens:5600, viewers:892},
      {rank:8,name:"Cleo Rivers", avatar:"🧘",tokens:4100, viewers:712},
    ],
    weekly: [
      {rank:1,name:"Kai Storm",   avatar:"🎮",tokens:184000,viewers:38200,badge:"🥇"},
      {rank:2,name:"Nova Blaze",  avatar:"🎸",tokens:142000,viewers:29100,badge:"🥈"},
      {rank:3,name:"Mars Echo",   avatar:"🎤",tokens:98400, viewers:21800,badge:"🥉"},
      {rank:4,name:"Rex Nova",    avatar:"💪",tokens:71600, viewers:15200},
      {rank:5,name:"Luna Vex",    avatar:"🎵",tokens:83200, viewers:18400,isYours:true},
      {rank:6,name:"Jade Wilder", avatar:"🕹️",tokens:64000, viewers:13100},
      {rank:7,name:"Mira Sol",    avatar:"🎨",tokens:38000, viewers:7800},
      {rank:8,name:"Cleo Rivers", avatar:"🧘",tokens:21000, viewers:4300},
    ],
    alltime: [
      {rank:1,name:"Kai Storm",   avatar:"🎮",tokens:9200000,viewers:1840000,badge:"🥇"},
      {rank:2,name:"Nova Blaze",  avatar:"🎸",tokens:7100000,viewers:1420000,badge:"🥈"},
      {rank:3,name:"Luna Vex",    avatar:"🎵",tokens:4800000,viewers:960000, badge:"🥉",isYours:true},
      {rank:4,name:"Mars Echo",   avatar:"🎤",tokens:3900000,viewers:780000},
      {rank:5,name:"Rex Nova",    avatar:"💪",tokens:2800000,viewers:560000},
    ],
  },
};

// ── ANALYTICS DATA ───────────────────────────────────────────────────────────
const ANALYTICS_DAILY = [
  {day:"May 6", tokens:3210,viewers:412},{day:"May 7", tokens:5820,viewers:680},
  {day:"May 8", tokens:2940,viewers:388},{day:"May 9", tokens:4100,viewers:524},
  {day:"May 10",tokens:6200,viewers:790},{day:"May 11",tokens:7800,viewers:1120},
  {day:"May 12",tokens:5500,viewers:710},{day:"May 13",tokens:4200,viewers:542},
  {day:"May 14",tokens:6100,viewers:840},{day:"May 15",tokens:7300,viewers:980},
  {day:"May 16",tokens:8100,viewers:1100},{day:"May 17",tokens:9200,viewers:1280},
  {day:"May 18",tokens:7600,viewers:1050},{day:"May 19",tokens:5900,viewers:780},
  {day:"May 20",tokens:4800,viewers:640},{day:"May 21",tokens:7100,viewers:940},
  {day:"May 22",tokens:8900,viewers:1210},{day:"May 23",tokens:10200,viewers:1420},
  {day:"May 24",tokens:9400,viewers:1300},{day:"May 25",tokens:8100,viewers:1120},
  {day:"May 26",tokens:7200,viewers:990},{day:"May 27",tokens:6500,viewers:880},
  {day:"May 28",tokens:8240,viewers:1140},{day:"May 29",tokens:9100,viewers:1260},
  {day:"May 30",tokens:10500,viewers:1460},{day:"May 31",tokens:11200,viewers:1580},
  {day:"Jun 1", tokens:9800,viewers:1380},{day:"Jun 2", tokens:8600,viewers:1200},
  {day:"Jun 3", tokens:7400,viewers:1020},{day:"Jun 4", tokens:8920,viewers:1284},
];
const ANALYTICS_STREAMS = [
  {title:"Luna Live 🎵",    date:"Jun 4", viewers:1284,tokens:8920, duration:"2h 14m"},
  {title:"Acoustic Night",   date:"Jun 2", viewers:1200,tokens:8600, duration:"1h 58m"},
  {title:"Late Night Vibes", date:"May 31",viewers:1580,tokens:11200,duration:"2h 45m"},
  {title:"Fan Requests",     date:"May 29",viewers:1260,tokens:9100, duration:"1h 32m"},
  {title:"Friday Hangout",   date:"May 24",viewers:1300,tokens:9400, duration:"2h 10m"},
  {title:"Open Mic",         date:"May 22",viewers:1420,tokens:10200,duration:"2h 05m"},
  {title:"Sunday Stream",    date:"May 19",viewers:940, tokens:7100, duration:"1h 20m"},
  {title:"Chill Afternoon",  date:"May 16",viewers:1100,tokens:8100, duration:"1h 45m"},
  {title:"Thursday Night",   date:"May 14",viewers:840, tokens:6100, duration:"1h 15m"},
  {title:"Quick Stream",     date:"May 11",viewers:1120,tokens:7800, duration:"1h 05m"},
];

// ── BROADCAST SETTINGS ────────────────────────────────────────────────────────
const QUALITY_PRESETS = [
  {id:"1080p",label:"1080p HD", sub:"Full HD",  bitrate:"4,500 kbps",fps:"30 fps",recommended:true, color:"#ff2d55"},
  {id:"720p", label:"720p",     sub:"HD Ready", bitrate:"2,500 kbps",fps:"30 fps",color:"#ff6b35"},
  {id:"480p", label:"480p SD",  sub:"Standard", bitrate:"1,000 kbps",fps:"30 fps",note:"Low bandwidth",color:"#aa8890"},
];
const CAMERA_DEVICES = [
  {id:"cam0",label:"Web Cam",              icon:"📷",res:"1080p",useDefault:true,note:"Auto-connects to your system camera"},
  {id:"cam2",label:"OBS Virtual Camera",   icon:"🎥",res:"1080p"},
  {id:"cam1",label:"iPhone (Continuity)",  icon:"📱",res:"4K"},
  {id:"cam3",label:"Android",              icon:"🤖",res:"1080p",note:"Connect via DroidCam or USB"},
];
const MIC_DEVICES = [
  {id:"mic0",label:"Built-in Microphone",     icon:"🎙️",type:"Built-in"},
  {id:"mic1",label:"Blue Yeti USB",           icon:"🎤",type:"USB"},
  {id:"mic2",label:"AirPods Pro",             icon:"🎧",type:"Wireless"},
  {id:"mic3",label:"Headset Mic (USB)",       icon:"🎙️",type:"USB"},
];

// ── DISCOVERY DATA ────────────────────────────────────────────────────────────
const DISCOVERY_CATS = [
  {name:"Female",   icon:"🌸",gradient:"linear-gradient(135deg,#ff2d55,#c0163a)", count:6240,hot:true},
  {name:"Male",     icon:"⚡",gradient:"linear-gradient(135deg,#4a9edd,#2d6ea8)", count:3180},
  {name:"Couples",  icon:"💑",gradient:"linear-gradient(135deg,#00e5a0,#00966a)", count:1840},
  {name:"Trans",    icon:"🦋",gradient:"linear-gradient(135deg,#b06fd8,#7040a8)", count:920},
  {name:"Gaming",   icon:"🎮",gradient:"linear-gradient(135deg,#6c5ce7,#4a3ea8)", count:2100,hot:true},
  {name:"Music",    icon:"🎵",gradient:"linear-gradient(135deg,#fd79a8,#c0163a)", count:1560},
  {name:"Fitness",  icon:"💪",gradient:"linear-gradient(135deg,#e17055,#c0392b)", count:840},
  {name:"Art",      icon:"🎨",gradient:"linear-gradient(135deg,#00b894,#007a60)", count:720},
  {name:"Cooking",  icon:"🍳",gradient:"linear-gradient(135deg,#fdcb6e,#e17055)", count:480},
  {name:"Comedy",   icon:"😂",gradient:"linear-gradient(135deg,#a29bfe,#6c5ce7)", count:390},
  {name:"ASMR",     icon:"🎙️",gradient:"linear-gradient(135deg,#74b9ff,#0984e3)", count:1240,hot:true},
  {name:"Wellness", icon:"🧘",gradient:"linear-gradient(135deg,#55efc4,#00b894)", count:560},
];
const DISCOVERY_TAGS = [
  {tag:"lovense",count:4820,hot:true},{tag:"interactive",count:3910,hot:true},{tag:"new",count:2100,hot:true},
  {tag:"ohmibod",count:2840,hot:true},{tag:"squirt",count:2120},{tag:"milf",count:1980},
  {tag:"teen",count:1760},{tag:"bbw",count:1540},{tag:"latina",count:1420},
  {tag:"asian",count:1380},{tag:"ebony",count:1290},{tag:"blonde",count:1180},
  {tag:"brunette",count:1050},{tag:"acoustic",count:980},{tag:"gaming",count:870},
  {tag:"fitness",count:760},{tag:"asmr",count:720},{tag:"yoga",count:640},
  {tag:"art",count:580},{tag:"cooking",count:520},{tag:"comedy",count:480},
  {tag:"hd",count:1800},{tag:"private",count:1650},{tag:"feet",count:980},
  {tag:"roleplay",count:860},{tag:"cosplay",count:740},{tag:"couples",count:440},
];

function BrowseScreen({ onNavigate, following, onFollow }) {
  const w = useWindowWidth(); const isMobile = w < 640; const isTablet = w < 960;
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1200); return () => clearTimeout(t); }, []);
  const [cat,        setCat]        = useState("All");
  const [sort,       setSort]       = useState("featured");
  const [region,     setRegion]     = useState("All Regions");
  const [search,     setSearch]     = useState("");
  const [activeTag,  setActiveTag]  = useState("");
  const [showSugg,   setShowSugg]   = useState(false);
  const viewerTokens = 350;

  // ── Filter + sort pipeline ────────────────────────────────────────────────
  let results = STREAMERS
    .filter(s => cat    === "All"        || s.category === cat)
    .filter(s => region === "All Regions"|| s.region   === region)
    .filter(s => !activeTag              || s.tags.includes(activeTag))
    .filter(s => !search.trim()          ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.includes(search.toLowerCase())));

  if (sort === "following") results = results.filter(s => following.has(s.id));
  if (sort === "new")       results = [...results].filter(s => s.isNew || s.live).sort((a,b) => Number(b.isNew)-Number(a.isNew));
  if (sort === "viewers" || sort === "featured")
    results = [...results].sort((a,b) => (b.live?1:0)-(a.live?1:0) || b.viewers-a.viewers);

  const featured  = sort === "featured" ? results.slice(0,3) : [];
  const grid      = sort === "featured" ? results.slice(3)   : results;
  const liveCount = STREAMERS.filter(s => s.live).length;
  const justLive  = STREAMERS.filter(s => s.live && s.isNew);

  // ── Search suggestions ────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const suggestions = q.length < 1 ? [] : [
    ...STREAMERS.filter(s => s.name.toLowerCase().includes(q)).slice(0,3)
      .map(s => ({ type:"streamer", label:s.name, id:s.id })),
    ...TRENDING_TAGS.filter(t => t.tag.includes(q)).slice(0,4)
      .map(t => ({ type:"tag", label:t.tag })),
  ];

  const clearAll = () => { setSearch(""); setActiveTag(""); setCat("All"); setRegion("All Regions"); };

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>

      {/* ── Search bar + wallet ──────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:COLORS.muted, pointerEvents:"none", fontSize:15 }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSugg(true); }}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 180)}
            placeholder="Search streamers, tags…"
            style={{ width:"100%", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"11px 38px 11px 38px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:16, lineHeight:1, padding:0 }}>✕</button>
          )}

          {/* Suggestions dropdown */}
          {showSugg && suggestions.length > 0 && (
            <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, zIndex:300, overflow:"hidden", boxShadow:"0 8px 28px #00000066" }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() => {
                    if (s.type === "tag") { setActiveTag(s.label); setSearch(""); }
                    else setSearch(s.label);
                    setShowSugg(false);
                  }}
                  style={{ padding:"10px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, borderBottom: i < suggestions.length-1 ? `1px solid ${COLORS.border}` : "none", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.surface}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize:13, color:COLORS.muted, width:16 }}>{s.type==="streamer" ? "👤" : "#"}</span>
                  <span style={{ fontSize:13, color:COLORS.text, flex:1 }}>{s.label}</span>
                  <span style={{ fontSize:11, color:COLORS.muted, background:COLORS.surface, borderRadius:4, padding:"1px 6px" }}>{s.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap" }}>
          <span style={{ color:COLORS.gold, fontWeight:800 }}>🪙 {viewerTokens}</span>
          <span style={{ color:COLORS.muted, fontSize:12 }}>tokens</span>
        </div>
        <Btn onClick={() => onNavigate("buy-tokens")} variant="gold" style={{ fontSize:13, padding:"10px 20px", whiteSpace:"nowrap" }}>+ Buy Tokens</Btn>
      </div>

      {/* ── Sort tabs ────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", borderBottom:`1px solid ${COLORS.border}`, marginBottom:16, overflowX:"auto" }}>
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSort(s.key)} style={{
            background:"none", border:"none",
            borderBottom:`2px solid ${sort===s.key ? COLORS.accent : "transparent"}`,
            color: sort===s.key ? COLORS.text : COLORS.muted,
            fontWeight: sort===s.key ? 700 : 400,
            padding:"10px 18px", cursor:"pointer", fontSize:14, marginBottom:-1, transition:"all 0.2s",
          }}>{s.label}</button>
        ))}
        <div style={{ flex:1 }} />
        <span style={{ fontSize:12, color:COLORS.muted, paddingRight:4 }}>
          <span style={{ color:COLORS.accent, fontWeight:800 }}>●</span> {liveCount} live now
        </span>
      </div>

      {/* ── Category + region filters ─────────────────────────────────── */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {CATS.map(c => {
          const col = CAT_COLOR[c] || COLORS.accent;
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              background: cat===c ? col : COLORS.card,
              color:       cat===c ? "#fff" : COLORS.muted,
              border:     `1px solid ${cat===c ? col : COLORS.border}`,
              borderRadius:99, padding:"5px 16px", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.18s",
            }}>{c}</button>
          );
        })}
        <div style={{ width:1, height:20, background:COLORS.border, margin:"0 2px" }} />
        {REGIONS.map(r => (
          <button key={r} onClick={() => setRegion(r)} style={{
            background: region===r ? COLORS.accentC+"33" : "transparent",
            color:       region===r ? COLORS.accentC      : COLORS.muted,
            border:     `1px solid ${region===r ? COLORS.accentC : COLORS.border}`,
            borderRadius:99, padding:"5px 14px", fontSize:12, fontWeight:600, cursor:"pointer",
          }}>{r}</button>
        ))}
      </div>

      {/* ── Trending tags row ─────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:20, padding:"12px 16px", background:COLORS.surface, borderRadius:12, border:`1px solid ${COLORS.border}` }}>
        <span style={{ fontSize:12, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, whiteSpace:"nowrap", marginRight:4 }}>🔥 Trending</span>
        {TRENDING_TAGS.map(({ tag, hot }) => {
          const isActive = activeTag === tag;
          return (
            <button key={tag} onClick={() => setActiveTag(isActive ? "" : tag)} style={{
              background: isActive ? COLORS.accentC+"33" : COLORS.card,
              border:    `1px solid ${isActive ? COLORS.accentC : COLORS.border}`,
              borderRadius: 99, padding:"4px 12px", fontSize:12, cursor:"pointer",
              color: isActive ? COLORS.accentC : COLORS.muted,
              display:"flex", alignItems:"center", gap:4, transition:"all 0.18s",
              fontWeight: isActive ? 700 : 400,
            }}>
              {hot && <span style={{ fontSize:9 }}>🔥</span>}#{tag}
            </button>
          );
        })}
        {activeTag && (
          <button onClick={() => setActiveTag("")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12, marginLeft:4, textDecoration:"underline" }}>
            clear ✕
          </button>
        )}
      </div>

      {/* ── Active search / tag indicator ──────────────────────────────── */}
      {(search.trim() || activeTag) && (
        <div style={{ marginBottom:16, padding:"9px 14px", background:COLORS.card, borderRadius:8, border:`1px solid ${COLORS.border}`, fontSize:13, color:COLORS.muted, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {search.trim() && <span>Results for "<span style={{ color:COLORS.text, fontWeight:600 }}>{search}</span>"</span>}
          {search.trim() && activeTag && <span>·</span>}
          {activeTag && <span>Tag: <span style={{ color:COLORS.accentC, fontWeight:700 }}>#{activeTag}</span></span>}
          <span style={{ color:COLORS.border }}>·</span>
          <span style={{ color: results.length > 0 ? COLORS.green : COLORS.accent, fontWeight:700 }}>{results.length} streamer{results.length !== 1 ? "s" : ""} found</span>
          <button onClick={clearAll} style={{ marginLeft:"auto", background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:12, textDecoration:"underline", padding:0 }}>Clear all</button>
        </div>
      )}

      {/* ── Just Went Live strip ────────────────────────────────────────── */}
      {justLive.length > 0 && !search.trim() && !activeTag && sort !== "following" && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, color:COLORS.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:COLORS.accent, display:"inline-block" }} />
            Just Went Live
          </div>
          <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:6 }}>
            {justLive.map(s => (
              <div key={s.id} onClick={() => onNavigate("stream-room")} style={{ cursor:"pointer", flexShrink:0, width:128 }}>
                <div style={{ width:128, height:72, background:s.preview, borderRadius:10, border:`2px solid ${COLORS.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:6, position:"relative" }}>
                  {s.avatar}
                  <div style={{ position:"absolute", top:5, left:5, background:COLORS.accent, color:"#fff", fontSize:8, fontWeight:800, borderRadius:4, padding:"2px 6px", letterSpacing:0.5 }}>NEW</div>
                  <div style={{ position:"absolute", bottom:5, right:7, fontSize:10, color:"#fff", fontWeight:700 }}>👁 {(s.viewers/1000).toFixed(1)}k</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{s.name}</div>
                <div style={{ fontSize:10, color:COLORS.muted }}>{s.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty states ─────────────────────────────────────────────────── */}
      {sort==="following" && results.length===0 && (
        <div style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>♡</div>
          <h3 style={{ margin:"0 0 8px" }}>No followed streamers yet</h3>
          <p style={{ color:COLORS.muted, fontSize:14 }}>Click ♡ on any card to follow a streamer.</p>
        </div>
      )}
      {results.length===0 && sort !== "following" && (search.trim() || activeTag) && (
        <div style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
          <h3 style={{ margin:"0 0 8px" }}>No streamers found</h3>
          <p style={{ color:COLORS.muted, fontSize:14, marginBottom:20 }}>Try a different search or clear your filters.</p>
          <Btn onClick={clearAll} variant="ghost">Clear All Filters</Btn>
        </div>
      )}

      {/* ── Skeleton loading ─────────────────────────────────────────────── */}
      {loading && (
        <div>
          <SkeletonBox height={12} width="140px" style={{ marginBottom:14 }} />
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)", gap:16, marginBottom:28 }}>
            {[0,1,2].map(i => <SkeletonStreamCard key={i} />)}
          </div>
          <SkeletonBox height={12} width="120px" style={{ marginBottom:14 }} />
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {[0,1,2,3,4,5,6,7].map(i => <SkeletonStreamCard key={i} />)}
          </div>
        </div>
      )}

      {/* ── Featured spotlight ─────────────────────────────────────────── */}
      {!loading && featured.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>⭐ Top Streamers</div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)", gap:16 }}>
            {featured.map(s => <StreamCard key={s.id} streamer={s} onNavigate={onNavigate} isFollowing={following.has(s.id)} onFollow={() => onFollow(s.id)} featured />)}
          </div>
        </div>
      )}

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      {!loading && grid.length > 0 && (
        <>
          {featured.length > 0 && (
            <div style={{ fontSize:12, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>All Live Streams</div>
          )}
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {grid.map(s => <StreamCard key={s.id} streamer={s} onNavigate={onNavigate} isFollowing={following.has(s.id)} onFollow={() => onFollow(s.id)} />)}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

// ── STREAM ROOM ───────────────────────────────────────────────────────────────
function StreamRoomScreen({ onNavigate, addToast, addNotification, subscriptions = {}, onSubscribe, viewerTokens = 350, onSpendTokens, selectedStreamerId = 1, following = new Set(), onFollow }) {
  const w = useWindowWidth(); const isMobile = w < 768;
  const tokens = viewerTokens; // Use real token balance from App
  const [tipAmount,  setTipAmount]  = useState(10);
  const [customTip,  setCustomTip]  = useState("");
  const [useCustom,  setUseCustom]  = useState(false);

  // Effective tip amount — either preset or custom
  const effectiveTip = useCustom ? (parseInt(customTip) || 0) : tipAmount;
  const [msgs,       setMsgs]       = useState(CHAT_MSGS);
  const [chatInput,  setChatInput]  = useState("");
  const [tipped,     setTipped]     = useState(false);
  const [goal,       setGoal]       = useState({ current: 720, target: 1000, label: "Acoustic guitar set 🎸" });
  const [spyMode,    setSpyMode]    = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [tipAlerts,  setTipAlerts]  = useState([]);
  const chatRef    = useRef();
  const nextTipRef = useRef(null);

  const addTipAlert = (user, amount, type="incoming") => {
    const id = Date.now() + Math.random();
    setTipAlerts(a => [...a.slice(-4), { id, user, amount, type }]); // cap at 5
  };
  const removeTipAlert = (id) => setTipAlerts(a => a.filter(x => x.id !== id));

  // Simulate incoming tips from other viewers
  useEffect(() => {
    const MOCK = [
      {user:"darkwing99",amount:50},{user:"starfish22",amount:200},
      {user:"nightowl",amount:10},{user:"cometgaze",amount:25},
      {user:"crystalwave",amount:500},{user:"neonrider",amount:100},
    ];
    let i = 0;
    const schedule = () => {
      nextTipRef.current = setTimeout(() => {
        const m = MOCK[i++ % MOCK.length];
        addTipAlert(m.user, m.amount, "incoming");
        setMsgs(ms => [...ms.slice(-30), { user:m.user, msg:`sent 🪙 ${m.amount}!`, tokens:m.amount }]);
        setGoal(g => ({ ...g, current: Math.min(g.target, g.current + Math.floor(m.amount/3)) }));
        schedule();
      }, 5000 + Math.random() * 7000);
    };
    const first = setTimeout(() => schedule(), 3000);
    return () => { clearTimeout(first); clearTimeout(nextTipRef.current); };
  }, []);
  const currentSub  = subscriptions[selectedStreamerId] || subscriptions[1] || null;
  const isFollowing = following?.has(selectedStreamerId) || following?.has(1);
  const streamerProfile = STREAMER_PROFILES[selectedStreamerId] || STREAMER_PROFILES[1];

  // Get streamer name for tip record
  const streamer = STREAMERS.find(s => s.id === selectedStreamerId);
  const streamerName = streamer?.name || "Streamer";

  // ── Viewer presence heartbeat ─────────────────────────────────────────────
  useEffect(() => {
    // Generate a stable session ID for this viewing session
    const sessionId = `viewer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // Use the streamer's email if available in their profile, otherwise fall back to id
    const streamId  = streamerProfile?.email
      ? encodeURIComponent(streamerProfile.email)
      : `id_${selectedStreamerId}`;

    const heartbeat = () => {
      fetch(`/api/user-profile?streamId=${streamId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sessionId }),
      }).catch(() => {});
    };

    heartbeat(); // register immediately on mount
    const iv = setInterval(heartbeat, 30_000); // refresh every 30 s

    return () => {
      clearInterval(iv);
      // Remove viewer on unmount (best-effort — sorted set TTL handles failures)
      fetch(`/api/user-profile?streamId=${streamId}`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sessionId }),
      }).catch(() => {});
    };
  }, [selectedStreamerId]);

  const sendTip = () => {
    if (tokens < effectiveTip || effectiveTip < 1) return;

    // Deduct from real token balance
    onSpendTokens && onSpendTokens(effectiveTip);

    setGoal(g => ({ ...g, current: Math.min(g.target, g.current + effectiveTip) }));
    setMsgs(m => [...m, { user: "You", msg: `sent ${effectiveTip} tokens! 🎉`, tokens: effectiveTip }]);
    setTipped(true);
    addTipAlert("You", effectiveTip, "own");
    addToast("tip", `🪙 ${effectiveTip} tokens sent to ${streamerName}!`);
    addNotification("tip", `viewer sent you 🪙 ${effectiveTip} tokens`);
    setTimeout(() => setTipped(false), 3000);
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;

    // Save tip to Upstash activity record
    const token = localStorage.getItem("steamr_token");
    if (token) {
      fetch("/api/user-profile", {
        method:  "POST",
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
        body:    JSON.stringify({
          token,
          action:   "tip",
          tip: {
            streamer:  streamerName,
            streamerId: selectedStreamerId,
            tokens:    effectiveTip,
            date:      new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMsgs(m => [...m, { user: "You", msg: chatInput, tokens: null }]);
    setChatInput("");
    if (chatRef.current) setTimeout(() => chatRef.current.scrollTop = chatRef.current.scrollHeight, 50);
  };

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: isMobile?"12px":"24px", display: "grid", gridTemplateColumns: isMobile?"1fr":"1fr 320px", gap: 20 }}>
      <div>
        <button onClick={() => onNavigate("viewer-browse")} style={{ background:"none",border:"none",color:COLORS.muted,cursor:"pointer",marginBottom:12,fontSize:13 }}>← Browse</button>

        {/* Video */}
        <div style={{ background:"linear-gradient(135deg,#1a0a2e,#0a1a2e)", borderRadius:16, height:400, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", border:`1px solid ${COLORS.border}`, position:"relative", marginBottom:14 }}>
          <span style={{ fontSize:72, marginBottom:8 }}>🎵</span>
          <div style={{ color:COLORS.muted, fontSize:14 }}>{spyMode ? "👁 Watching private show…" : "Camera Feed Active"}</div>
          <div style={{ position:"absolute", top:14, left:14 }}>
            {spyMode ? <Pill color={COLORS.gold}>🔍 SPY MODE</Pill> : <Pill color={COLORS.accent}>🔴 LIVE</Pill>}
          </div>

          {/* Tip alerts overlay */}
          <TipAlertsOverlay alerts={tipAlerts} onDone={removeTipAlert} />
        </div>

        {/* ── Action Bar — Follow, Tips, Spy, Private, Subscribe ── */}
        <div style={{ marginBottom:14, display:"flex", flexDirection:"column", gap:10 }}>

          {/* Row 1: Follow + Spy + Private + Subscribe */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {/* Follow button */}
            <button
              onClick={() => onFollow && onFollow(selectedStreamerId || 1)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                background: isFollowing ? COLORS.accent+"22" : "transparent",
                border: `1px solid ${isFollowing ? COLORS.accent : COLORS.border}`,
                borderRadius:10, padding:"9px 16px", cursor:"pointer",
                color: isFollowing ? COLORS.accent : COLORS.muted,
                fontSize:13, fontWeight:700, transition:"all 0.2s", flexShrink:0,
              }}>
              {isFollowing ? "❤️ Following" : "🤍 Follow"}
            </button>

            {/* Spy */}
            {!spyMode ? (
              <button onClick={() => setSpyMode(true)} style={{
                flex:1, background:"transparent", border:`1px solid ${COLORS.gold}44`,
                borderRadius:10, padding:"9px 10px", color:COLORS.gold,
                fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.2s",
              }}>👁 Spy · 🪙 30/min</button>
            ) : (
              <button onClick={() => setSpyMode(false)} style={{
                flex:1, background:COLORS.gold+"18", border:`1px solid ${COLORS.gold}`,
                borderRadius:10, padding:"9px 10px", color:COLORS.gold,
                fontSize:12, fontWeight:700, cursor:"pointer",
              }}>✕ Leave Spy Mode</button>
            )}

            {/* Private */}
            <button onClick={() => onNavigate("private-show")} style={{
              flex:1, background:"transparent", border:`1px solid ${COLORS.accent}55`,
              borderRadius:10, padding:"9px 10px", color:COLORS.accent,
              fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.2s",
            }}>🔒 Private</button>

            {/* Subscribe */}
            {currentSub ? (
              <button onClick={() => setShowSubModal(true)} style={{
                display:"flex", alignItems:"center", gap:6, flexShrink:0,
                background:currentSub.tierColor+"18", border:`1px solid ${currentSub.tierColor}44`,
                borderRadius:10, padding:"9px 12px", color:currentSub.tierColor,
                fontSize:12, fontWeight:700, cursor:"pointer",
              }}>{currentSub.tierBadge} {currentSub.tierName}</button>
            ) : (
              <button onClick={() => setShowSubModal(true)} style={{
                flex:1, background:`linear-gradient(135deg,${COLORS.gold}22,${COLORS.gold}11)`,
                border:`1px solid ${COLORS.gold}55`, borderRadius:10, padding:"9px 10px",
                color:COLORS.gold, fontSize:12, fontWeight:700, cursor:"pointer",
              }}>👑 Subscribe</button>
            )}
          </div>

          {/* Row 2: Send Tokens */}
          <div style={{ background:COLORS.surface, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:12, color:COLORS.muted, fontWeight:600, marginBottom:10 }}>
              💰 Send Tokens
              <span style={{ float:"right", color:COLORS.gold, fontWeight:700 }}>🪙 {tokens} balance</span>
            </div>

            {/* Preset amounts + custom */}
            <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
              {[10,25,50,100,200].map(t => (
                <button key={t} onClick={() => { setTipAmount(t); setUseCustom(false); setCustomTip(""); }} style={{
                  background: !useCustom && tipAmount===t ? COLORS.gold : COLORS.card,
                  color:       !useCustom && tipAmount===t ? "#000"      : COLORS.text,
                  border:     `1px solid ${!useCustom && tipAmount===t ? COLORS.gold : COLORS.border}`,
                  borderRadius:8, padding:"6px 12px", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s",
                }}>🪙 {t}</button>
              ))}
              <button onClick={() => { setUseCustom(true); setCustomTip(""); }} style={{
                background: useCustom ? COLORS.accentC+"33" : COLORS.card,
                color:       useCustom ? COLORS.accentC      : COLORS.muted,
                border:     `1px solid ${useCustom ? COLORS.accentC : COLORS.border}`,
                borderRadius:8, padding:"6px 12px", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s",
              }}>✏️ Custom</button>
            </div>

            {/* Custom input */}
            {useCustom && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10,
                background:COLORS.card, border:`1px solid ${COLORS.accentC}66`, borderRadius:10, padding:"8px 12px" }}>
                <span style={{ color:COLORS.muted, fontSize:16 }}>🪙</span>
                <input type="number" min="1" max={tokens} value={customTip}
                  onChange={e => setCustomTip(e.target.value.replace(/[^0-9]/g,""))}
                  placeholder="Enter any amount…" autoFocus
                  style={{ flex:1, background:"transparent", border:"none", outline:"none",
                    color:COLORS.gold, fontSize:16, fontWeight:800, width:"100%" }}
                />
                {customTip && parseInt(customTip) > tokens && (
                  <span style={{ fontSize:11, color:"#ff6666", whiteSpace:"nowrap" }}>Not enough 🪙</span>
                )}
              </div>
            )}

            <Btn onClick={sendTip} variant="gold"
              disabled={tokens < effectiveTip || effectiveTip < 1}
              style={{ width:"100%", fontWeight:900 }}>
              Send 🪙 {effectiveTip > 0 ? effectiveTip.toLocaleString() : "—"}
            </Btn>
          </div>
        </div>

        {/* Goal bar */}
        <Card style={{ marginBottom:14, padding:"14px 18px" }}>
          <GoalBar goal={goal} large />
        </Card>

        <Card>
          {/* Streamer header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:12 }}>
            <div>
              <h3
                onClick={() => onNavigate("profile", { streamerId: 1 })}
                style={{ margin:"0 0 6px", fontSize:20, fontWeight:800, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}
              >
                {STREAMER_PROFILES[1].name}
                <span style={{ fontSize:11, color:COLORS.muted, fontWeight:400 }}>👤 View profile</span>
              </h3>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Pill color={CAT_COLOR[STREAMER_PROFILES[1].category] || COLORS.accentB}>{STREAMER_PROFILES[1].category}</Pill>
                {STREAMER_PROFILES[1].tags.slice(0,3).map(tag => (
                  <span key={tag} style={{ fontSize:11, color:COLORS.muted, background:COLORS.surface, borderRadius:4, padding:"2px 6px" }}>#{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:COLORS.gold, fontWeight:700 }}>🪙 8,920 tokens today</div>
              {spyMode && <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>Spy rate: 🪙 30/min</div>}
            </div>
          </div>

          {/* Room subject */}
          {STREAMER_PROFILES[1].roomSubject && (
            <div style={{ fontSize:12, color:COLORS.muted, fontStyle:"italic", marginBottom:14, padding:"8px 12px", background:COLORS.surface, borderRadius:8, lineHeight:1.5 }}>
              {STREAMER_PROFILES[1].roomSubject}
            </div>
          )}

          {/* Tip menu from profile */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>💰 Tip Menu</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {STREAMER_PROFILES[1].tipMenu.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", background:COLORS.surface, borderRadius:7 }}>
                  <span style={{ minWidth:46, fontSize:11, fontWeight:800, color:COLORS.gold, background:COLORS.gold+"18", border:`1px solid ${COLORS.gold}33`, borderRadius:5, padding:"2px 5px", textAlign:"center" }}>🪙 {item.tokens}</span>
                  <span style={{ fontSize:12, color:COLORS.muted, flex:1 }}>{item.action}</span>
                </div>
              ))}
            </div>
          </div>

        </Card>
      </div>

      {/* Chat */}
      <Card style={{ display:"flex", flexDirection:"column", height:isMobile?400:620, padding:isMobile?10:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>💬 Live Chat</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:COLORS.surface,
            border:`1px solid ${COLORS.border}`, borderRadius:20, padding:"4px 10px", fontSize:12 }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:COLORS.accent,display:"inline-block",boxShadow:`0 0 6px ${COLORS.accent}` }}/>
            <span style={{ color:COLORS.muted }}>👁</span>
            <span style={{ fontWeight:700, color:COLORS.text }}>1,284</span>
            <span style={{ color:COLORS.muted }}>watching</span>
          </div>
        </div>
        <div ref={chatRef} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ fontSize:13 }}>
              <span style={{ fontWeight:700, color:m.tokens?COLORS.gold:COLORS.accentC }}>{m.user}</span>
              {m.user === "You" && currentSub && (
                <SubBadge tierName={currentSub.tierName} style={{ marginLeft:4 }} />
              )}
              {" "}
              <span style={{ color:m.tokens?COLORS.gold:COLORS.text }}>{m.msg}</span>
              {m.tokens && <span style={{ marginLeft:4, fontSize:11, background:COLORS.gold+"22", color:COLORS.gold, borderRadius:4, padding:"1px 6px" }}>+{m.tokens} 🪙</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, display:"flex", gap:8 }}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Say something…"
            style={{ flex:1, background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:"9px 12px", color:COLORS.text, fontSize:13, outline:"none" }}
          />
          <Btn onClick={sendChat} style={{ padding:"9px 14px" }}>→</Btn>
        </div>
      </Card>
      {/* Subscribe modal */}
      {showSubModal && (
        <SubscribeModal
          profile={STREAMER_PROFILES[1]}
          currentSub={currentSub}
          onSubscribe={(tier) => onSubscribe(1, tier)}
          onClose={() => setShowSubModal(false)}
        />
      )}
    </div>
  );
}

// ── BUY TOKENS ───────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// GIFT MODAL — viewer sends a wishlist item to a streamer
// ══════════════════════════════════════════════════════════════════════════════
function GiftModal({ item, viewerTokens, onConfirm, onClose }) {
  const [message, setMessage]   = useState("");
  const [sending, setSending]   = useState(false);
  const [sent,    setSent]      = useState(false);
  const canAfford = viewerTokens >= item.tokens;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1200);
  };

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",
        alignItems:"center",justifyContent:"center",zIndex:9000,padding:16 }}>
      <div style={{ background:COLORS.card,border:`1px solid ${COLORS.border}`,
        borderRadius:22,width:"100%",maxWidth:400,overflow:"hidden",
        boxShadow:"0 24px 60px #00000099" }}>

        {!sent ? (<>
          {/* Header */}
          <div style={{ padding:"20px 22px 16px",borderBottom:`1px solid ${COLORS.border}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontWeight:800,fontSize:16 }}>🎁 Send a Gift</div>
              <button onClick={onClose} style={{ background:"none",border:"none",
                color:COLORS.muted,cursor:"pointer",fontSize:20,lineHeight:1 }}>✕</button>
            </div>
          </div>

          <div style={{ padding:"20px 22px" }}>
            {/* Item card */}
            <div style={{ background:COLORS.surface,borderRadius:14,padding:"16px 18px",
              border:`1px solid ${COLORS.border}`,marginBottom:20,
              display:"flex",gap:14,alignItems:"center" }}>
              <div style={{ fontSize:36,lineHeight:1 }}>{item.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,fontSize:15,marginBottom:4 }}>{item.name}</div>
                <div style={{ fontSize:12,color:COLORS.muted,marginBottom:6 }}>{item.desc}</div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <span style={{ fontWeight:800,color:COLORS.gold,fontSize:14 }}>🪙 {item.tokens.toLocaleString()}</span>
                  <span style={{ fontSize:11,color:COLORS.muted }}>${fmtUSD(item.usd)} value</span>
                </div>
              </div>
            </div>

            {/* Balance check */}
            <div style={{ display:"flex",justifyContent:"space-between",
              background:canAfford?COLORS.green+"14":COLORS.accent+"14",
              border:`1px solid ${canAfford?COLORS.green+"44":COLORS.accent+"44"}`,
              borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13 }}>
              <span style={{ color:COLORS.muted }}>Your balance</span>
              <span style={{ fontWeight:800,color:canAfford?COLORS.green:COLORS.accent }}>
                🪙 {viewerTokens.toLocaleString()} {canAfford?"":"(not enough)"}
              </span>
            </div>

            {/* After-gift balance preview */}
            {canAfford && (
              <div style={{ fontSize:12,color:COLORS.muted,textAlign:"center",marginBottom:14 }}>
                After gift: <strong style={{ color:COLORS.text }}>🪙 {(viewerTokens - item.tokens).toLocaleString()}</strong> remaining
              </div>
            )}

            {/* Message */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block",fontSize:12,color:COLORS.muted,fontWeight:600,marginBottom:6 }}>
                Add a message <span style={{ fontWeight:400 }}>(optional)</span>
              </label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="e.g. Love your streams — enjoy the coffee! ☕"
                rows={2}
                style={{ width:"100%",background:COLORS.surface,border:`1px solid ${COLORS.border}`,
                  borderRadius:9,padding:"9px 12px",color:COLORS.text,fontSize:13,
                  outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit" }}
              />
            </div>

            {!canAfford ? (
              <div style={{ display:"flex",gap:10 }}>
                <Btn onClick={onClose} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
                <Btn onClick={() => { onClose(); }} style={{ flex:1 }}>Buy More Tokens 🪙</Btn>
              </div>
            ) : (
              <div style={{ display:"flex",gap:10 }}>
                <Btn onClick={onClose} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
                <Btn onClick={handleSend} variant="gold" style={{ flex:1,fontWeight:800 }}
                  disabled={sending}>
                  {sending ? "Sending…" : `🎁 Send Gift · 🪙 ${item.tokens.toLocaleString()}`}
                </Btn>
              </div>
            )}
          </div>
        </>) : (
          <div style={{ padding:"40px 28px",textAlign:"center" }}>
            <div style={{ fontSize:56,marginBottom:12 }}>🎉</div>
            <h3 style={{ margin:"0 0 8px",fontSize:20,fontWeight:900,color:COLORS.gold }}>Gift Sent!</h3>
            <p style={{ color:COLORS.muted,fontSize:13,lineHeight:1.7,marginBottom:8 }}>
              Your <strong style={{ color:COLORS.text }}>{item.emoji} {item.name}</strong> gift
              has been delivered!{message && ` Your message: "${message}"`}
            </p>
            <p style={{ color:COLORS.muted,fontSize:12,marginBottom:24 }}>
              🪙 {item.tokens.toLocaleString()} tokens deducted from your wallet.
            </p>
            <Btn onClick={() => { onConfirm(item); onClose(); }} style={{ width:"100%" }}>
              Done ✓
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── WISHLIST SECTION (shown on ProfileScreen) ─────────────────────────────────
function WishlistSection({ wishlist, viewerTokens, onGift, isOwn }) {
  const [giftItem, setGiftItem] = useState(null);
  const [gifted,   setGifted]   = useState(new Set()); // locally fulfilled

  if (!wishlist || !wishlist.length) return null;

  const handleGiftDone = (item) => {
    setGifted(g => new Set([...g, item.id]));
    onGift && onGift(item.tokens);
  };

  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:13,fontWeight:700,color:COLORS.muted,textTransform:"uppercase",
        letterSpacing:0.8,marginBottom:14 }}>🎁 Wishlist</div>

      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {wishlist.map(item => {
          const isFulfilled = item.fulfilled || gifted.has(item.id);
          return (
            <div key={item.id} style={{ display:"flex",alignItems:"center",gap:12,
              padding:"13px 16px",background:COLORS.surface,borderRadius:12,
              border:`1px solid ${isFulfilled?COLORS.green+"44":COLORS.border}`,
              opacity: isFulfilled ? 0.7 : 1,
              transition:"all 0.2s",
            }}>
              <div style={{ fontSize:28,lineHeight:1 }}>{item.emoji}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:13,marginBottom:2,
                  textDecoration:isFulfilled?"line-through":"none",color:isFulfilled?COLORS.muted:COLORS.text }}>
                  {item.name}
                </div>
                {item.desc && <div style={{ fontSize:11,color:COLORS.muted }}>{item.desc}</div>}
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontWeight:800,color:COLORS.gold,fontSize:13,marginBottom:4 }}>
                  🪙 {item.tokens.toLocaleString()}
                </div>
                <div style={{ fontSize:10,color:COLORS.muted }}>${fmtUSD(item.usd)}</div>
              </div>
              {!isOwn && (
                <div style={{ marginLeft:4,flexShrink:0 }}>
                  {isFulfilled ? (
                    <Pill color={COLORS.green}>✓ Gifted</Pill>
                  ) : (
                    <button onClick={() => setGiftItem(item)} style={{
                      background:`linear-gradient(135deg,${COLORS.gold},${COLORS.accentC})`,
                      color:"#000",border:"none",borderRadius:8,padding:"7px 12px",
                      fontWeight:800,fontSize:12,cursor:"pointer",transition:"opacity 0.15s",
                    }}>🎁 Gift</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {giftItem && (
        <GiftModal
          item={giftItem}
          viewerTokens={viewerTokens}
          onConfirm={handleGiftDone}
          onClose={() => setGiftItem(null)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VIEWER PROFILE SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ViewerProfileScreen({ onNavigate, subscriptions = {}, following, viewerTokens = 350, onCancelSub }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [tab,      setTab]     = useState("overview");
  const [profile,  setProfile] = useState(null);
  const [activity, setActivity]= useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");

  const subCount    = Object.keys(subscriptions).length;
  const followCount = following ? following.size : 0;
  const [confirmId, setConfirmId] = useState(null); // tracks which sub has cancel open

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }

    // Prefill from localStorage session immediately so UI shows instantly
    try {
      const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
      if (session?.name || session?.email) {
        setProfile(p => p || {
          name:        session.name  || "User",
          displayName: session.name  || "User",
          email:       session.email || "",
          username:    session.email?.split("@")[0] || "user",
          joinDate:    "Recently",
          verified:    false,
          bio:         "",
          avatarImg:   null,
          following:   [],
        });
        setActivity({ tokenBalance:350, totalSpent:0, tipsCount:0, tipHistory:[], giftsCount:0, achievements:[] });
        setLoading(false); // show screen immediately, then update below
      }
    } catch {}

    // Fetch real data from API in background
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        setProfile(data.profile);
        setActivity(data.activity);
      }
      setLoading(false);
    })
    .catch(() => {
      // API failed — profile already showing from localStorage fallback
      setLoading(false);
    });
  }, []);

  const TABS = [
    {key:"overview",  label:"Overview"},
    {key:"tips",      label:"🪙 Tips"},
    {key:"subs",      label:"⭐ Subs"},
    {key:"following", label:"❤️ Following"},
  ];

  if (loading) return (
    <div style={{ textAlign:"center", padding:"80px 24px", color:COLORS.muted }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
      <div>Loading your profile...</div>
    </div>
  );

  // Non-blocking error — shown as banner inside the screen if needed

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:isMobile?"20px 16px 60px":"32px 24px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button onClick={() => onNavigate("viewer-dashboard")}
          style={{ background:"none",border:"none",color:COLORS.muted,cursor:"pointer",fontSize:13,padding:0 }}>
          ← Dashboard
        </button>
        <Btn onClick={() => onNavigate("viewer-edit-profile")} variant="secondary" style={{ fontSize:12,padding:"7px 14px" }}>
          ✏️ Edit Profile
        </Btn>
      </div>

      <Card style={{ marginBottom:24, overflow:"visible", padding:0 }}>
        <div style={{ height:90, background:"linear-gradient(135deg,#1a0a2e,#2e0a1a,#0a1a2e)",
          position:"relative", overflow:"hidden", borderRadius:"14px 14px 0 0" }}>
          <div style={{ position:"absolute",inset:0,opacity:0.4,
            backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,45,85,0.05) 10px,rgba(255,45,85,0.05) 20px)" }}/>
        </div>
        <div style={{ padding:"0 22px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:14 }}>
            <div style={{ width:80, height:80, borderRadius:"50%",
              background:`linear-gradient(135deg,${COLORS.accent},${COLORS.accentC})`,
              border:`4px solid ${COLORS.bg}`, marginTop:-40,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:36,
              overflow:"hidden", flexShrink:0, position:"relative", zIndex:2 }}>
              {profile?.avatarImg
                ? <img src={profile.avatarImg} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : "🦇"}
            </div>
            {profile?.verified && (
              <div style={{ background:COLORS.green+"22", border:`1px solid ${COLORS.green}44`, borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:700, color:COLORS.green }}>
                ✅ Verified
              </div>
            )}
          </div>
          <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900 }}>
            {profile?.displayName || profile?.name || "Anonymous"}
          </h2>
          <div style={{ fontSize:13, color:COLORS.muted, marginBottom:4 }}>
            @{profile?.username || profile?.email?.split("@")[0]}
          </div>
          {profile?.bio && <div style={{ fontSize:13, color:COLORS.muted, marginBottom:8, lineHeight:1.5 }}>{profile.bio}</div>}
          <div style={{ fontSize:12, color:COLORS.muted, marginBottom:14 }}>Member since {profile?.joinDate || "Recently"}</div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {[
              {label:"Following",  value:followCount},
              {label:"Subscribed", value:subCount},
              {label:"Tips Sent",  value:activity?.tipsCount || 0},
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:20, fontWeight:900 }}>{s.value}</div>
                <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display:"flex", gap:4, marginBottom:20, overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background:tab===t.key?COLORS.accent:COLORS.surface,
            color:tab===t.key?"#fff":COLORS.muted,
            border:`1px solid ${tab===t.key?COLORS.accent:COLORS.border}`,
            borderRadius:8, padding:"7px 14px", cursor:"pointer",
            fontWeight:700, fontSize:12, whiteSpace:"nowrap", transition:"all 0.18s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="overview" && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14 }}>
          <Card style={{ padding:"18px" }}>
            <div style={{ fontSize:11,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.7,marginBottom:8 }}>🪙 Token Balance</div>
            <div style={{ fontSize:28,fontWeight:900,color:COLORS.gold }}>{viewerTokens.toLocaleString()}</div>
            <Btn onClick={() => onNavigate("buy-tokens")} variant="ghost" style={{ fontSize:12,marginTop:10,padding:"6px 12px" }}>+ Buy Tokens</Btn>
          </Card>
          <Card style={{ padding:"18px" }}>
            <div style={{ fontSize:11,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.7,marginBottom:8 }}>💸 Total Spent</div>
            <div style={{ fontSize:28,fontWeight:900,color:COLORS.accent }}>🪙 {(activity?.totalSpent||0).toLocaleString()}</div>
            <div style={{ fontSize:12,color:COLORS.muted,marginTop:6 }}>across {activity?.tipsCount||0} tips</div>
          </Card>
          <Card style={{ padding:"18px" }}>
            <div style={{ fontSize:11,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.7,marginBottom:8 }}>⭐ Subscriptions</div>
            <div style={{ fontSize:28,fontWeight:900,color:COLORS.accentC }}>{subCount}</div>
            <button onClick={() => setTab("subs")} style={{ background:"none",border:"none",color:COLORS.accent,cursor:"pointer",fontSize:12,marginTop:6,padding:0,fontWeight:700 }}>View all →</button>
          </Card>
          <Card style={{ padding:"18px" }}>
            <div style={{ fontSize:11,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.7,marginBottom:8 }}>❤️ Following</div>
            <div style={{ fontSize:28,fontWeight:900,color:COLORS.accent }}>{followCount}</div>
            <button onClick={() => setTab("following")} style={{ background:"none",border:"none",color:COLORS.accent,cursor:"pointer",fontSize:12,marginTop:6,padding:0,fontWeight:700 }}>View all →</button>
          </Card>
          <Card style={{ padding:"18px", gridColumn:isMobile?"auto":"span 2" }}>
            <div style={{ fontSize:11,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.7,marginBottom:12 }}>🏆 Achievements</div>
            {activity?.achievements?.length > 0 ? (
              <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                {activity.achievements.map((a,i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:28 }}>{a.icon}</div>
                    <div style={{ fontSize:10,color:COLORS.muted,marginTop:4 }}>{a.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color:COLORS.muted,fontSize:13,textAlign:"center",padding:"16px 0" }}>
                🎯 Start tipping and following to earn achievements!
              </div>
            )}
          </Card>
        </div>
      )}

      {tab==="tips" && (
        <Card>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:14 }}>Tip History</div>
          {activity?.tipHistory?.length > 0 ? activity.tipHistory.map((tip,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${COLORS.border}22` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:13 }}>{tip.streamer}</div>
                {tip.note && <div style={{ fontSize:11,color:COLORS.muted }}>{tip.note}</div>}
                <div style={{ fontSize:10,color:COLORS.muted }}>{new Date(tip.date).toLocaleDateString()}</div>
              </div>
              <div style={{ fontWeight:800,color:COLORS.gold }}>🪙 {tip.tokens}</div>
            </div>
          )) : (
            <div style={{ textAlign:"center",padding:"32px 0",color:COLORS.muted }}>
              <div style={{ fontSize:32,marginBottom:10 }}>🪙</div>
              <div style={{ fontWeight:700 }}>No tips yet</div>
              <div style={{ fontSize:12,marginTop:6 }}>Your tip history will appear here</div>
            </div>
          )}
        </Card>
      )}

      {tab==="subs" && (
        <Card>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:14 }}>Active Subscriptions</div>
          {subCount > 0 ? Object.entries(subscriptions).map(([id,sub]) => {
            const streamer  = STREAMERS.find(s => s.id===Number(id));
            const isConfirm = confirmId === id;
            return (
              <div key={id} style={{ padding:"14px 0", borderBottom:`1px solid ${COLORS.border}22` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div onClick={() => onNavigate("stream-room",{streamerId:Number(id)})}
                    style={{ width:44,height:44,borderRadius:"50%",background:COLORS.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`2px solid ${sub.tierColor}44`,cursor:"pointer",flexShrink:0 }}>
                    {streamer?.avatar||"🎭"}
                  </div>
                  <div style={{ flex:1,cursor:"pointer" }} onClick={() => onNavigate("stream-room",{streamerId:Number(id)})}>
                    <div style={{ fontWeight:700,fontSize:13 }}>{streamer?.name||"Streamer"}</div>
                    <div style={{ fontSize:11,color:COLORS.muted }}>Since {sub.since} · Auto-renews monthly</div>
                  </div>
                  <SubBadge tierName={sub.tierName} />
                  <button onClick={() => setConfirmId(isConfirm ? null : id)}
                    style={{ background:"none",border:`1px solid ${isConfirm?"#ff6666":COLORS.border}`,borderRadius:8,
                      color:isConfirm?"#ff6666":COLORS.muted,cursor:"pointer",fontSize:11,padding:"5px 10px",
                      fontWeight:600,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>
                    {isConfirm ? "Keep" : "Cancel"}
                  </button>
                </div>
                {isConfirm && (
                  <div style={{ marginTop:12,padding:"14px 16px",background:COLORS.surface,border:`1px solid #ff666644`,borderRadius:10 }}>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:6 }}>Cancel {streamer?.name||"Streamer"} subscription?</div>
                    <div style={{ fontSize:12,color:COLORS.muted,marginBottom:14,lineHeight:1.5 }}>
                      You'll lose access to their Fan Club and subscriber perks. This takes effect immediately.
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={() => setConfirmId(null)}
                        style={{ flex:1,padding:"8px",background:COLORS.card,border:`1px solid ${COLORS.border}`,borderRadius:8,color:COLORS.text,cursor:"pointer",fontSize:12,fontWeight:700 }}>
                        Keep Subscription
                      </button>
                      <button onClick={() => { onCancelSub && onCancelSub(Number(id)); setConfirmId(null); }}
                        style={{ flex:1,padding:"8px",background:"#ff4444",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{ textAlign:"center",padding:"32px 0",color:COLORS.muted }}>
              <div style={{ fontSize:32,marginBottom:10 }}>⭐</div>
              <div style={{ fontWeight:700 }}>No subscriptions yet</div>
              <div style={{ fontSize:12,marginTop:6 }}>Subscribe to streamers to support them monthly</div>
            </div>
          )}
        </Card>
      )}

      {tab==="following" && (
        <Card>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:14 }}>Streamers You Follow</div>
          {followCount > 0 ? STREAMERS.filter(s => following?.has(s.id)).map(s => (
            <div key={s.id} onClick={() => onNavigate("stream-room",{streamerId:s.id})}
              style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${COLORS.border}22`,cursor:"pointer" }}>
              <div style={{ width:44,height:44,borderRadius:"50%",background:s.preview||COLORS.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>
                {s.avatar}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:13 }}>{s.name}</div>
                <div style={{ fontSize:11,color:COLORS.muted }}>{s.tags?.slice(0,2).join(" · ")}</div>
              </div>
              {s.live && <Pill color={COLORS.accent} style={{ fontSize:10 }}>LIVE</Pill>}
            </div>
          )) : (
            <div style={{ textAlign:"center",padding:"32px 0",color:COLORS.muted }}>
              <div style={{ fontSize:32,marginBottom:10 }}>❤️</div>
              <div style={{ fontWeight:700 }}>Not following anyone yet</div>
              <div style={{ fontSize:12,marginTop:6 }}>Click the heart on any stream to follow</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function BuyTokensScreen({ onNavigate, viewerTokens = 350, onPurchase }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [selected,  setSelected]  = useState(2);
  const [step,      setStep]      = useState("packs"); // packs | success
  const [adding,    setAdding]    = useState(false);

  const selectedPack = TOKEN_PACKS.find(p => p.id === selected);
  const total        = selectedPack ? selectedPack.tokens + selectedPack.bonus : 0;

  const handleAddTokens = () => {
    setAdding(true);
    setTimeout(() => {
      onPurchase && onPurchase(total);
      setStep("success");
      setAdding(false);
    }, 800);
  };

  if (step === "success") return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
      <div style={{ width:80,height:80,borderRadius:"50%",background:COLORS.green+"22",
        border:`2px solid ${COLORS.green}44`,margin:"0 auto 20px",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:40 }}>✅</div>
      <h2 style={{ margin:"0 0 8px",fontSize:26,fontWeight:900,color:COLORS.green }}>Tokens Added!</h2>
      <p style={{ color:COLORS.muted,fontSize:14,marginBottom:8 }}>
        <strong style={{ color:COLORS.gold }}>🪙 {total.toLocaleString()} tokens</strong> have been added to your wallet.
      </p>
      <p style={{ color:COLORS.muted,fontSize:13,marginBottom:28 }}>
        New balance: <strong style={{ color:COLORS.gold }}>🪙 {(viewerTokens + total).toLocaleString()}</strong>
      </p>
      <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
        <Btn onClick={() => onNavigate("viewer-browse")} style={{ flex:1,maxWidth:200 }}>Browse Streams →</Btn>
        <Btn onClick={() => { setStep("packs"); }} variant="secondary" style={{ flex:1,maxWidth:200 }}>Add More Tokens</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:isMobile?"24px 16px 60px":"48px 24px" }}>
      <button onClick={() => onNavigate("viewer-browse")}
        style={{ background:"none",border:"none",color:COLORS.muted,cursor:"pointer",marginBottom:24,fontSize:13 }}>
        ← Back
      </button>
      <h2 style={{ margin:"0 0 6px",fontSize:isMobile?22:28,fontWeight:800 }}>Buy Tokens 🪙</h2>
      <p style={{ color:COLORS.muted,marginBottom:24,fontSize:14 }}>Support your favourite streamers. Tokens never expire.</p>

      {/* Pack selection */}
      {TOKEN_PACKS.map(pack => {
        const tot  = pack.tokens + pack.bonus;
        const isSel = selected === pack.id;
        return (
          <div key={pack.id} onClick={() => setSelected(pack.id)} style={{
            border:`2px solid ${isSel?COLORS.gold:COLORS.border}`,
            borderRadius:14,padding:"16px 20px",marginBottom:12,cursor:"pointer",
            background:isSel?COLORS.gold+"11":COLORS.card,
            display:"flex",justifyContent:"space-between",alignItems:"center",
            transition:"all 0.2s",position:"relative",
          }}>
            {pack.popular && (
              <div style={{ position:"absolute",top:-10,left:16,background:COLORS.accent,color:"#fff",fontSize:9,fontWeight:800,borderRadius:20,padding:"3px 10px" }}>MOST POPULAR</div>
            )}
            <div>
              <div style={{ fontWeight:800,fontSize:18 }}>🪙 {pack.tokens.toLocaleString()}</div>
              {pack.bonus > 0 && <div style={{ color:COLORS.green,fontSize:12,fontWeight:700 }}>+ {pack.bonus.toLocaleString()} bonus → {tot.toLocaleString()} total</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:22,fontWeight:900,color:isSel?COLORS.gold:COLORS.text }}>${fmtUSD(pack.price)}</div>
              <div style={{ fontSize:11,color:COLORS.muted }}>${(pack.price/tot).toFixed(3)}/token</div>
            </div>
          </div>
        );
      })}

      {/* Order summary */}
      <div style={{ background:COLORS.gold+"14",border:`1px solid ${COLORS.gold}44`,borderRadius:12,
        padding:"14px 18px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:700,fontSize:14 }}>🪙 {total.toLocaleString()} tokens</div>
          {selectedPack?.bonus > 0 && <div style={{ fontSize:11,color:COLORS.green }}>Includes {selectedPack.bonus} bonus tokens</div>}
          <div style={{ fontSize:11,color:COLORS.muted,marginTop:2 }}>Your balance after: 🪙 {(viewerTokens+total).toLocaleString()}</div>
        </div>
        <div style={{ fontSize:24,fontWeight:900,color:COLORS.gold }}>${fmtUSD(selectedPack?.price||0)}</div>
      </div>

      {/* Payment coming soon notice */}
      <div style={{ background:COLORS.surface,border:`1px solid ${COLORS.border}`,borderRadius:12,
        padding:"14px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start" }}>
        <div style={{ fontSize:20,flexShrink:0 }}>🔧</div>
        <div>
          <div style={{ fontWeight:700,fontSize:13,marginBottom:3 }}>Payment Processing Coming Soon</div>
          <div style={{ fontSize:12,color:COLORS.muted,lineHeight:1.5 }}>
            We're finalising our payment partner integration. Use the button below to add tokens for testing.
          </div>
        </div>
      </div>

      {/* Add tokens button */}
      <Btn
        onClick={handleAddTokens}
        disabled={adding}
        variant="gold"
        style={{ width:"100%",fontSize:16,padding:"16px",fontWeight:900 }}>
        {adding ? "Adding tokens…" : `🪙 Add ${total.toLocaleString()} Tokens`}
      </Btn>

      <div style={{ display:"flex",justifyContent:"center",gap:20,marginTop:16,flexWrap:"wrap" }}>
        {["🔒 Secure","🔄 Instant delivery","💳 Zen Payments coming soon"].map(b => (
          <span key={b} style={{ fontSize:11,color:COLORS.muted }}>{b}</span>
        ))}
      </div>
    </div>
  );
}


// ── KYC ─────────────────────────────────────────────────────────────────────
// ── KYC ───────────────────────────────────────────────────────────────────────
function KYCScreen({ role, onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const isStreamer = role === "streamer";

  const [kycStep,   setKycStep]   = useState(1);
  const [docType,   setDocType]   = useState("passport");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [idFront,   setIdFront]   = useState(null);  // base64
  const [idBack,    setIdBack]    = useState(null);
  const [selfie,    setSelfie]    = useState(null);
  const [submitting,setSubmitting]= useState(false);
  const [submitOk,  setSubmitOk]  = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const needsBack = docType !== "passport";
  const canStep3  = idFront && (!needsBack || idBack);

  // ── Compress + convert file to base64 ────────────────────────────────────
  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 1400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleFile = (setter) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setter(compressed);
    } catch { setter(null); }
    e.target.value = "";
  };

  // ── Upload zone component ─────────────────────────────────────────────────
  const UploadZone = ({ label, value, onFile, hint="" }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:600, color:COLORS.muted, marginBottom:8 }}>{label}</div>
      {value ? (
        <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:`2px solid ${COLORS.green}` }}>
          <img src={value} alt={label} style={{ width:"100%", maxHeight:200, objectFit:"cover", display:"block" }}/>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6 }}>
            <div style={{ fontSize:28 }}>✅</div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>Uploaded</div>
          </div>

          <label style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.7)", borderRadius:6, color:"#fff", cursor:"pointer", fontSize:11, padding:"5px 10px", fontWeight:700 }}>
            Retake
            <input type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={onFile}/>
          </label>
        </div>
      ) : (
        <label style={{ display:"block", cursor:"pointer" }}>
          <input type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={onFile}/>
          <div style={{ border:`2px dashed ${COLORS.border}`, borderRadius:12, padding:"32px 20px", textAlign:"center", background:COLORS.surface, transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=COLORS.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=COLORS.border}>
            <div style={{ fontSize:36, marginBottom:10 }}>📷</div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Tap to take photo or upload</div>
            {hint && <div style={{ fontSize:12, color:COLORS.muted }}>{hint}</div>}
          </div>
        </label>
      )}
    </div>
  );

  // ── Submit to API ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, role, docType,
          idFront, idBack: needsBack ? idBack : null, selfie,
          submittedAt: new Date().toLocaleString(),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitOk(true);
      setKycStep(6);
    } catch {
      setSubmitErr("Could not send verification. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 6 — Success ──────────────────────────────────────────────────────
  if (kycStep === 6) return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"48px 24px" }}>
      <Card style={{ textAlign:"center", padding:"40px 28px" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>📬</div>
        <h2 style={{ margin:"0 0 12px", fontWeight:900, color:COLORS.green }}>Verification Submitted!</h2>
        <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:8 }}>
          Your ID and selfie have been sent to the Steamr team for review.
        </p>
        <p style={{ color:COLORS.muted, fontSize:13, marginBottom:28 }}>
          We'll email <strong style={{ color:COLORS.text }}>{email}</strong> within 24–48 hours once your account is approved.
        </p>
        <Btn onClick={() => onNavigate(isStreamer ? "streamer-dashboard" : "viewer-dashboard")} style={{ width:"100%" }}>
          Back to Dashboard
        </Btn>
      </Card>
    </div>
  );

  // ── Step progress bar ─────────────────────────────────────────────────────
  const STEPS = ["Intro", "ID Type", "Upload ID", "Selfie", "Review"];

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:isMobile?"24px 16px 60px":"48px 24px" }}>
      <div style={{ marginBottom:8 }}><Pill color={isStreamer?COLORS.accent:COLORS.accentC}>Identity Verification</Pill></div>
      <h2 style={{ margin:"0 0 6px", fontSize:isMobile?20:26, fontWeight:800 }}>Verify Your Identity</h2>
      <p style={{ color:COLORS.muted, fontSize:14, marginBottom:24 }}>
        {isStreamer ? "Required to receive payouts." : "Required to confirm you are 18+."} Takes under 3 minutes.
      </p>

      {/* Progress */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:28, gap:0 }}>
        {STEPS.map((label, i) => {
          const s=i+1, done=s<kycStep, active=s===kycStep;
          return (
            <div key={label} style={{ display:"flex", alignItems:"center", flex:s<5?1:"none" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:done?COLORS.green:active?COLORS.accent:COLORS.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:done||active?"#fff":COLORS.muted, transition:"all 0.3s" }}>
                  {done?"✓":s}
                </div>
                <div style={{ fontSize:9, color:active?COLORS.text:COLORS.muted, whiteSpace:"nowrap", fontWeight:active?700:400 }}>{label}</div>
              </div>
              {s<5 && <div style={{ flex:1, height:2, background:done?COLORS.green:COLORS.border, margin:"0 4px", marginBottom:18, transition:"background 0.3s" }}/>}
            </div>
          );
        })}
      </div>

      <Card>
        {/* ── Step 1: Intro + Name/Email ── */}
        {kycStep===1 && (<>
          <div style={{ textAlign:"center", paddingBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛡️</div>
            <h3 style={{ margin:"0 0 8px" }}>What you'll need</h3>
            <p style={{ color:COLORS.muted, fontSize:13, lineHeight:1.6 }}>A valid government-issued photo ID and the ability to take a selfie.</p>
          </div>
          <Input label="Full Name" value={name} onChange={setName} placeholder="As it appears on your ID" />
          <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="We'll notify you here when approved" />
          <div style={{ background:COLORS.surface, borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:12, color:COLORS.muted, lineHeight:1.6 }}>
            🔒 Your documents are sent directly to the Steamr admin team and are never stored on our servers.
          </div>
          {(!name||!email) && (
            <div style={{ marginBottom:12, padding:"10px 14px", background:COLORS.gold+"18", border:`1px solid ${COLORS.gold}44`, borderRadius:8, fontSize:12, color:COLORS.gold }}>
              ⚠️ Please fill in your name and email above to continue
            </div>
          )}
          <Btn onClick={() => { if (!name||!email) return; setKycStep(2); }} style={{ width:"100%" }} disabled={!name||!email}>
            Start Verification →
          </Btn>
        </>)}

        {/* ── Step 2: Document type ── */}
        {kycStep===2 && (<>
          <p style={{ color:COLORS.muted, fontSize:13, marginTop:0 }}>Choose the ID document you want to use.</p>
          {[
            {value:"passport", label:"🛂 Passport",         desc:"Photo page only"},
            {value:"drivers",  label:"🚗 Driver's Licence", desc:"Front & back required"},
            {value:"national", label:"🪪 National ID Card",  desc:"Front & back required"},
          ].map(opt => (
            <div key={opt.value} onClick={() => setDocType(opt.value)} style={{ border:`2px solid ${docType===opt.value?COLORS.accent:COLORS.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, cursor:"pointer", background:docType===opt.value?COLORS.accent+"11":"transparent", transition:"all 0.2s" }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{opt.label}</div>
              <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>{opt.desc}</div>
            </div>
          ))}
          <Btn onClick={() => setKycStep(3)} style={{ width:"100%", marginTop:8 }}>Continue →</Btn>
        </>)}

        {/* ── Step 3: Upload ID ── */}
        {kycStep===3 && (<>
          <p style={{ color:COLORS.muted, fontSize:13, marginTop:0 }}>
            Upload a clear, well-lit photo. All four corners must be visible.
          </p>
          <UploadZone
            label={docType==="passport" ? "📄 Passport Photo Page" : "📄 Front of ID"}
            value={idFront}
            onFile={handleFile(setIdFront)}
            hint="Make sure all text is readable"
          />
          {needsBack && (
            <UploadZone
              label="📄 Back of ID"
              value={idBack}
              onFile={handleFile(setIdBack)}
              hint="Upload front first"
            />
          )}
          <Btn onClick={() => setKycStep(4)} disabled={!canStep3} style={{ width:"100%", marginTop:4 }}>
            Continue →
          </Btn>
        </>)}

        {/* ── Step 4: Selfie ── */}
        {kycStep===4 && (<>
          <p style={{ color:COLORS.muted, fontSize:13, marginTop:0 }}>
            Take a selfie <strong>holding your ID</strong> next to your face so we can confirm it's you.
          </p>
          <div style={{ background:COLORS.surface, borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:12, color:COLORS.muted, lineHeight:1.7 }}>
            💡 Face the camera directly · Good lighting · Hold ID so both your face and ID text are clearly visible
          </div>
          <UploadZone
            label="🤳 Selfie holding your ID"
            value={selfie}
            onFile={handleFile(setSelfie)}
            hint="Both your face and ID must be clearly visible"
          />
          <Btn onClick={() => setKycStep(5)} disabled={!selfie} style={{ width:"100%" }}>
            Continue →
          </Btn>
        </>)}

        {/* ── Step 5: Review + Submit ── */}
        {kycStep===5 && (<>
          <h3 style={{ margin:"0 0 16px" }}>Review & Submit</h3>

          {/* Thumbnail previews */}
          <div style={{ display:"grid", gridTemplateColumns:needsBack?"1fr 1fr 1fr":"1fr 1fr", gap:10, marginBottom:16 }}>
            {[
              { label: docType==="passport"?"Passport":"ID Front", img: idFront },
              ...(needsBack ? [{ label:"ID Back", img: idBack }] : []),
              { label:"Selfie with ID", img: selfie },
            ].map(item => (
              <div key={item.label} style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${COLORS.border}` }}>
                <img src={item.img} alt={item.label} style={{ width:"100%", height:90, objectFit:"cover", display:"block" }}/>
                <div style={{ padding:"6px 8px", fontSize:10, fontWeight:700, color:COLORS.muted, background:COLORS.surface }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {[
            { label:"Name",     value: name },
            { label:"Email",    value: email },
            { label:"Document", value: docType==="passport"?"Passport":docType==="drivers"?"Driver's Licence":"National ID Card" },
            { label:"Role",     value: isStreamer ? "Streamer" : "Viewer" },
          ].map(row => (
            <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${COLORS.border}22`, fontSize:13 }}>
              <span style={{ color:COLORS.muted }}>{row.label}</span>
              <span style={{ fontWeight:700 }}>{row.value}</span>
            </div>
          ))}

          {submitErr && (
            <div style={{ marginTop:14, padding:"10px 14px", background:"#ff444422", border:"1px solid #ff444444", borderRadius:8, fontSize:13, color:"#ff6666" }}>
              ⚠️ {submitErr}
            </div>
          )}

          <div style={{ marginTop:16, display:"flex", gap:10 }}>
            <Btn onClick={() => setKycStep(4)} variant="ghost" style={{ flex:1 }}>← Back</Btn>
            <Btn onClick={handleSubmit} variant="green" style={{ flex:2 }} disabled={submitting}>
              {submitting ? "Sending…" : "🛡️ Submit Verification"}
            </Btn>
          </div>
          <p style={{ textAlign:"center", color:COLORS.muted, fontSize:11, marginTop:12, lineHeight:1.6 }}>
            By submitting you consent to the Steamr team reviewing your documents for identity verification.
          </p>
        </>)}
      </Card>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// KYC STATUS SCREEN — shown when streamer clicks "ID Status"
// ══════════════════════════════════════════════════════════════════════════════
function KYCStatusScreen({ onNavigate }) {
  const [kycStatus, setKycStatus] = useState(null);
  const [verified,  setVerified]  = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        setKycStatus(data.profile.kycStatus);
        setVerified(data.profile.verified || false);
      }
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
      <div style={{ color:COLORS.muted }}>Checking verification status…</div>
    </div>
  );

  // ── Not submitted ──────────────────────────────────────────────────────────
  if (!kycStatus) return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"48px 24px" }}>
      <button onClick={() => onNavigate("streamer-dashboard")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:24, fontSize:13 }}>← Dashboard</button>
      <Card style={{ textAlign:"center", padding:"40px 28px" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🛡️</div>
        <h2 style={{ margin:"0 0 12px", fontWeight:900 }}>Identity Not Verified</h2>
        <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          You need to verify your identity before you can go live or receive payouts. The process takes under 2 minutes.
        </p>
        <Btn onClick={() => onNavigate("kyc-streamer")} style={{ width:"100%" }}>
          🛡️ Start Verification →
        </Btn>
      </Card>
    </div>
  );

  // ── Pending ────────────────────────────────────────────────────────────────
  if (kycStatus === "pending" && !verified) return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"48px 24px" }}>
      <button onClick={() => onNavigate("streamer-dashboard")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:24, fontSize:13 }}>← Dashboard</button>
      <Card style={{ textAlign:"center", padding:"40px 28px" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:COLORS.gold+"22", border:`1px solid ${COLORS.gold}44`, borderRadius:20, padding:"6px 16px", marginBottom:20 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:COLORS.gold, display:"inline-block" }}/>
          <span style={{ fontWeight:700, color:COLORS.gold, fontSize:13 }}>Pending Review</span>
        </div>
        <h2 style={{ margin:"0 0 12px", fontWeight:900 }}>Documents Under Review</h2>
        <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:8 }}>
          Your identity documents have been submitted and are currently being reviewed by the Steamr team.
        </p>
        <p style={{ color:COLORS.muted, fontSize:13, lineHeight:1.7, marginBottom:28 }}>
          You'll receive an email notification once your account is approved. This typically takes <strong style={{ color:COLORS.text }}>24–48 hours</strong>.
        </p>
        <div style={{ background:COLORS.surface, borderRadius:12, padding:"16px 20px", marginBottom:20, textAlign:"left" }}>
          {[
            { icon:"📄", label:"Documents", status:"Received ✓" },
            { icon:"🔍", label:"Review",    status:"In Progress…" },
            { icon:"✅", label:"Approval",  status:"Pending" },
          ].map(step => (
            <div key={step.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${COLORS.border}22` }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:18 }}>{step.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{step.label}</span>
              </div>
              <span style={{ fontSize:12, color:step.status.includes("✓")? COLORS.green : step.status.includes("In Progress") ? COLORS.gold : COLORS.muted, fontWeight:600 }}>{step.status}</span>
            </div>
          ))}
        </div>
        <Btn onClick={() => onNavigate("streamer-dashboard")} variant="secondary" style={{ width:"100%" }}>
          Back to Dashboard
        </Btn>
      </Card>
    </div>
  );

  // ── Verified ───────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"48px 24px" }}>
      <button onClick={() => onNavigate("streamer-dashboard")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:24, fontSize:13 }}>← Dashboard</button>
      <Card style={{ textAlign:"center", padding:"40px 28px" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:COLORS.green+"22", border:`1px solid ${COLORS.green}44`, borderRadius:20, padding:"6px 16px", marginBottom:20 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:COLORS.green, display:"inline-block" }}/>
          <span style={{ fontWeight:700, color:COLORS.green, fontSize:13 }}>Identity Verified</span>
        </div>
        <h2 style={{ margin:"0 0 12px", fontWeight:900, color:COLORS.green }}>You're Verified!</h2>
        <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Your identity has been confirmed. You can now go live, receive tips, and request payouts.
        </p>
        <Btn onClick={() => onNavigate("go-live")} style={{ width:"100%", marginBottom:10 }}>
          🔴 Go Live Now
        </Btn>
        <Btn onClick={() => onNavigate("streamer-dashboard")} variant="secondary" style={{ width:"100%" }}>
          Back to Dashboard
        </Btn>
      </Card>
    </div>
  );
}


function PendingKYC({ isStreamer, onNavigate, inline=false, verified=false, kycStatus=null }) {
  if (inline) return verified
    ? (<div style={{ padding:"12px 16px",background:COLORS.green+"18",border:`1px solid ${COLORS.green}44`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><div><div style={{ fontWeight:700,color:COLORS.green,fontSize:14 }}>✅ Identity Verified</div><div style={{ color:COLORS.muted,fontSize:12 }}>KYC complete — payouts enabled</div></div><Pill color={COLORS.green}>Verified</Pill></div>)
    : kycStatus === "pending"
    ? (<div style={{ padding:"12px 16px",background:"#f5c51822",border:`1px solid ${COLORS.gold}44`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,cursor:"pointer" }} onClick={() => onNavigate("kyc-status")}><div><div style={{ fontWeight:700,color:COLORS.gold,fontSize:14 }}>⏳ Verification Pending</div><div style={{ color:COLORS.muted,fontSize:12 }}>Under review — Go Live locked until approved</div></div><Pill color={COLORS.gold}>Pending</Pill></div>)
    : (<div style={{ padding:"12px 16px",background:COLORS.accent+"18",border:`1px solid ${COLORS.accent}44`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,cursor:"pointer" }} onClick={() => onNavigate("kyc-streamer")}><div><div style={{ fontWeight:700,color:COLORS.accent,fontSize:14 }}>🛡️ Identity Verification Required</div><div style={{ color:COLORS.muted,fontSize:12 }}>Verify your ID to go live and receive payouts</div></div><Btn variant="secondary" style={{ fontSize:11,padding:"4px 10px" }}>Start →</Btn></div>);
  return (
    <div style={{ textAlign:"center",padding:"16px 0" }}>
      {status==="checking"
        ? (<><div style={{ fontSize:52,marginBottom:16 }}>⏳</div><h3 style={{ margin:"0 0 8px",color:COLORS.gold }}>Verifying your identity…</h3><p style={{ color:COLORS.muted,fontSize:13,lineHeight:1.6 }}>Stripe Identity is processing your documents. This usually takes a few seconds.</p></>)
        : (<><div style={{ fontSize:52,marginBottom:16 }}>🎉</div><h3 style={{ margin:"0 0 8px",color:COLORS.green }}>Identity Verified!</h3><p style={{ color:COLORS.muted,fontSize:13,lineHeight:1.6,marginBottom:20 }}>{isStreamer?"You can now go live and request payouts.":"You're all set to watch and support streamers."}</p><Btn onClick={()=>(() => {
          try {
            // Session already saved during signup step — nothing extra needed
            const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
            if (!session) {
              // Fallback: session might not be set yet
              console.warn("No session found after KYC");
            }
          } catch {}
          onNavigate(isStreamer?"streamer-dashboard":"viewer-dashboard");
        })()} variant="green" style={{ width:"100%" }}>{isStreamer?"🚀 Go to Dashboard":"🎭 Browse Streams"}</Btn></>)
      }
    </div>
  );
}

// ── STREAMER DASHBOARD ────────────────────────────────────────────────────────
function StreamerDashboard({ onNavigate, addToast, addNotification }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [profile,    setProfile]    = useState(null);
  const [activity,   setActivity]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cashedOut,  setCashedOut]  = useState(false);
  const [cashoutAmt, setCashoutAmt] = useState("");

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok) { setProfile(data.profile); setActivity(data.activity); }
      setLoading(false);
    })
    .catch(() => setLoading(false));
    // Fallback from localStorage
    try {
      const s = JSON.parse(localStorage.getItem("steamr_session") || "null");
      if (s?.name) setProfile(p => p || { name: s.name, displayName: s.name, avatarImg: null, verified: false });
    } catch {}
  }, []);

  const name           = profile?.displayName || profile?.name || "Streamer";
  const avatarImg      = profile?.avatarImg || null;
  const verified       = profile?.verified || false;
  const joinDate       = profile?.joinDate || "";

  // Real earnings from activity
  const todayTokens    = activity?.todayTokens    || 0;
  const weekTokens     = activity?.weekTokens     || 0;
  const monthTokens    = activity?.monthTokens    || 0;
  const allTimeTokens  = activity?.allTimeTokens  || 0;
  const availableTokens = activity?.availableTokens || 0;
  const followers      = activity?.followers      || 0;
  const subscribers    = activity?.subscribers    || 0;
  const totalStreams    = activity?.totalStreams   || 0;
  const hoursStreamed   = activity?.hoursStreamed  || 0;
  const peakViewers    = activity?.peakViewers    || 0;
  const payoutHistory  = activity?.payoutHistory  || [];

  const availableUSD   = Number(tokensToStreamerUSD(availableTokens));

  const EARNINGS = [
    { label:"Today",      tokens:todayTokens,   usd:Number(tokensToStreamerUSD(todayTokens))   },
    { label:"This Week",  tokens:weekTokens,     usd:Number(tokensToStreamerUSD(weekTokens))   },
    { label:"This Month", tokens:monthTokens,    usd:Number(tokensToStreamerUSD(monthTokens))  },
    { label:"All Time",   tokens:allTimeTokens,  usd:Number(tokensToStreamerUSD(allTimeTokens)) },
  ];

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:COLORS.card, border:`2px solid ${COLORS.border}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, overflow:"hidden", flexShrink:0 }}>
            {avatarImg ? <img src={avatarImg} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : "🎭"}
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <h2 style={{ margin:0, fontSize:22, fontWeight:900 }}>{greeting}, {name} 👋</h2>
              {verified && <span style={{ fontSize:11, background:COLORS.green+"22", color:COLORS.green, border:`1px solid ${COLORS.green}44`, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>✅ Verified</span>}
            </div>
            <div style={{ color:COLORS.muted, fontSize:13, marginTop:2 }}>{joinDate && `Member since ${joinDate}`}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Btn onClick={() => onNavigate("edit-profile")} variant="secondary" style={{ fontSize:13 }}>✏️ Edit Profile</Btn>
          <Btn onClick={() => onNavigate("analytics")} variant="secondary" style={{ fontSize:13 }}>📊 Analytics</Btn>
          <Btn onClick={() => {
            const ks = profile?.kycStatus;
            const v  = profile?.verified;
            if (!ks) onNavigate("kyc-streamer");
            else     onNavigate("kyc-status");
          }} variant="secondary" style={{ fontSize:13 }}>
            {profile?.verified ? "✅ Verified" : profile?.kycStatus === "pending" ? "⏳ Pending" : "🛡️ ID Status"}
          </Btn>
          {profile?.verified ? (
            <Btn onClick={() => onNavigate("go-live")} style={{ fontSize:15 }}>🔴 Go Live</Btn>
          ) : (
            <Btn onClick={() => onNavigate("kyc-status")} variant="secondary" style={{ fontSize:15 }}
              title="Complete identity verification to go live">
              🔒 {profile?.kycStatus === "pending" ? "Verification Pending" : "Verify to Go Live"}
            </Btn>
          )}
        </div>
      </div>

      <PendingKYC isStreamer inline onNavigate={onNavigate} verified={profile?.verified} kycStatus={profile?.kycStatus} />

      {/* Earnings cards */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {EARNINGS.map(e => (
          <Card key={e.label} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:1 }}>{e.label}</div>
            <div style={{ fontSize:20, fontWeight:900, color:COLORS.gold, margin:"6px 0 2px" }}>🪙 {e.tokens.toLocaleString()}</div>
            <div style={{ color:COLORS.green, fontWeight:700, fontSize:15 }}>${fmtUSD(e.usd)}</div>
            <div style={{ color:COLORS.muted, fontSize:10, marginTop:1 }}>at $0.05/token</div>
          </Card>
        ))}
      </div>

      {/* Sparkline */}
      <Card style={{ marginBottom:20, padding:"16px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>📈 Earnings — Last 30 Days</div>
          <button onClick={() => onNavigate("analytics")} style={{ background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontSize:12, fontWeight:700, padding:0 }}>
            Full Analytics →
          </button>
        </div>
        {activity?.dailyEarnings?.length > 0 ? (
          <AreaChart data={activity.dailyEarnings.map(d => ({ label:d.day, value:d.tokens }))} color={COLORS.accent} height={70} />
        ) : (
          <div style={{ height:70, display:"flex", alignItems:"center", justifyContent:"center", color:COLORS.muted, fontSize:13 }}>
            📡 Earnings chart will appear once you start receiving tips
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:COLORS.muted }}>
          <span>30 days ago</span><span>Today</span>
        </div>
      </Card>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Followers",      value:followers.toLocaleString(),              color:COLORS.accent  },
          { label:"Subscribers",    value:subscribers.toLocaleString(),            color:COLORS.gold    },
          { label:"Total Streams",  value:totalStreams.toLocaleString(),            color:COLORS.accentC },
          { label:"Hours Streamed", value:`${hoursStreamed}h`,                     color:COLORS.green   },
        ].map(s => (
          <Card key={s.label} style={{ padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:COLORS.muted, marginTop:4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:20 }}>
        {/* Cash Out */}
        <Card>
          <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800 }}>💸 Cash Out</h3>
          <p style={{ color:COLORS.muted, fontSize:13, marginBottom:20 }}>Minimum $20. Sent within 2 business days.</p>
          <div style={{ background:COLORS.surface, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
            <div style={{ fontSize:11, color:COLORS.muted }}>Available Balance</div>
            <div style={{ fontSize:26, fontWeight:900, color:COLORS.green }}>${fmtUSD(availableUSD)}</div>
            <div style={{ fontSize:12, color:COLORS.muted }}>🪙 {availableTokens.toLocaleString()} tokens × $0.05</div>
          </div>
          {availableTokens === 0 ? (
            <div style={{ textAlign:"center", padding:"16px 0", color:COLORS.muted, fontSize:13 }}>
              💡 Go live and earn tokens to unlock payouts
            </div>
          ) : !cashedOut ? (<>
            <Input label="Amount to withdraw ($)" value={cashoutAmt} onChange={setCashoutAmt} placeholder={`e.g. ${fmtUSD(availableUSD)}`} />
            {Number(cashoutAmt) > 0 && Number(cashoutAmt) < 20 && (
              <div style={{ fontSize:11, color:COLORS.accent, marginBottom:8 }}>⚠️ Minimum withdrawal is $20.00</div>
            )}
            <Btn onClick={async () => {
              const requestedAmt = cashoutAmt ? Number(cashoutAmt) : availableUSD;
              if (requestedAmt < 20) {
                addToast("error", "Minimum payout is $20.00");
                return;
              }
              if (requestedAmt > availableUSD + 0.01) {
                addToast("error", "Amount exceeds your available balance");
                return;
              }
              const token = localStorage.getItem("steamr_token");
              try {
                const r = await fetch("/api/user-profile", {
                  method:  "POST",
                  headers: { "x-auth-token": token, "Content-Type": "application/json" },
                  body:    JSON.stringify({ token, action: "payout-request", amountUSD: requestedAmt }),
                });
                const data = await r.json();
                if (data.ok) {
                  setCashedOut(true);
                  // Refresh activity so balance updates immediately
                  fetch("/api/user-profile", { headers: { "x-auth-token": token } })
                    .then(r2 => r2.json())
                    .then(d2 => { if (d2.ok) setActivity(d2.activity); })
                    .catch(() => {});
                  addToast("payout", `Payout of $${fmtUSD(requestedAmt)} requested ✓`);
                  addNotification("payout", `Payout of $${fmtUSD(requestedAmt)} is processing — arrives in 1-2 business days`);
                } else {
                  addToast("error", data.error || "Payout request failed. Please try again.");
                }
              } catch {
                addToast("error", "Connection error. Please try again.");
              }
            }} variant="green" style={{ width:"100%" }}>Request Payout →</Btn>
          </>) : (
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
              <div style={{ fontWeight:700, color:COLORS.green }}>Payout Requested!</div>
              <div style={{ color:COLORS.muted, fontSize:13 }}>Arrives in 1-2 business days</div>
              <Btn onClick={() => { setCashedOut(false); setCashoutAmt(""); }} variant="ghost"
                style={{ marginTop:12, fontSize:12 }}>Request Another</Btn>
            </div>
          )}
        </Card>

        {/* Stats detail */}
        <Card>
          <h3 style={{ margin:"0 0 16px", fontSize:18, fontWeight:800 }}>📊 Your Stats</h3>
          {peakViewers === 0 && totalStreams === 0 ? (
            <div style={{ textAlign:"center", padding:"24px 0", color:COLORS.muted }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📡</div>
              <div style={{ fontWeight:700, marginBottom:6 }}>No streams yet</div>
              <div style={{ fontSize:13 }}>Your stats will appear here after your first live stream</div>
              <Btn onClick={() => onNavigate("go-live")} style={{ marginTop:16 }}>🔴 Go Live Now</Btn>
            </div>
          ) : (
            <>
              {[
                { label:"Total Hours Streamed", value:`${hoursStreamed} hrs` },
                { label:"Peak Viewers",          value:peakViewers.toLocaleString() },
                { label:"Total Followers",       value:followers.toLocaleString() },
                { label:"Active Subscribers",    value:subscribers.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                  <span style={{ color:COLORS.muted, fontSize:13 }}>{stat.label}</span>
                  <span style={{ fontWeight:700, fontSize:13 }}>{stat.value}</span>
                </div>
              ))}
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:12, color:COLORS.muted, marginBottom:8 }}>Payout History</div>
                {payoutHistory.length === 0 ? (
                  <div style={{ fontSize:12, color:COLORS.muted }}>No payouts yet</div>
                ) : payoutHistory.slice(0,3).map((p, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"6px 0", alignItems:"center" }}>
                    <span style={{ color:COLORS.muted }}>{p.date}</span>
                    <span style={{ fontWeight:700 }}>${fmtUSD(p.amount)}</span>
                    <Pill color={COLORS.green}>Paid</Pill>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── GO LIVE ───────────────────────────────────────────────────────────────────
function GoLiveScreen({ onNavigate, addToast, addNotification, onStreamingChange }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);

  // Check verification before allowing stream
  const [verified,    setVerified]    = useState(null); // null=loading
  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setVerified(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => setVerified(data.ok ? (data.profile?.verified || false) : false))
    .catch(() => setVerified(false));
  }, []);

  const [streaming,     setStreaming]     = useState(false);
  const [title,         setTitle]         = useState("Luna Vex Live 🎵");
  const [goalLabel,     setGoalLabel]     = useState("Acoustic guitar set 🎸");
  const [goalTarget,    setGoalTarget]    = useState(1000);
  const [seconds,       setSeconds]       = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [goal,          setGoal]          = useState(null);
  const [quality,       setQuality]       = useState("1080p");
  const [selectedCam,   setSelectedCam]   = useState("");
  const [selectedMic,   setSelectedMic]   = useState("");
  const [testingAudio,  setTestingAudio]  = useState(false);
  const [permStatus,    setPermStatus]    = useState("idle"); // idle | requesting | granted | denied
  const [realCameras,   setRealCameras]   = useState([]);
  const [realMics,      setRealMics]      = useState([]);
  const [cameraFacing,  setCameraFacing]  = useState("user"); // user | environment
  const [viewerCount,   setViewerCount]   = useState(0);
  const [peakCount,     setPeakCount]     = useState(0);
  const streamIdRef = useRef(null);

  // ── Cleanup stream on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => stopStream();
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // ── Enumerate real devices (after permission granted) ──────────────────────
  const enumerateDevices = async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setRealCameras(all.filter(d => d.kind === "videoinput"));
      setRealMics   (all.filter(d => d.kind === "audioinput"));
    } catch (_) {}
  };

  // ── Attach stream to video element only when permission is granted ──────────
  useEffect(() => {
    if (permStatus === "granted" && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [permStatus]);

  // ── Request camera + mic access ───────────────────────────────────────────
  const requestCamera = async (facingOverride) => {
    setPermStatus("requesting");
    const facing = facingOverride || cameraFacing;
    try {
      const videoConstraint = isMobile
        ? { facingMode: facing }
        : selectedCam ? { deviceId: { exact: selectedCam } } : true;
      const audioConstraint = selectedMic ? { deviceId: { exact: selectedMic } } : true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: audioConstraint,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setPermStatus("granted");
      await enumerateDevices();
    } catch (err) {
      setPermStatus(err.name === "NotAllowedError" ? "denied" : "error");
    }
  };

  // ── Switch front/back camera on mobile ────────────────────────────────────
  const flipCamera = async () => {
    const next = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(next);
    stopStream();
    await requestCamera(next);
  };

  // ── Switch device (desktop) ───────────────────────────────────────────────
  const switchDevice = async (type, deviceId) => {
    if (type === "cam") setSelectedCam(deviceId);
    else                setSelectedMic(deviceId);
    if (permStatus === "granted") {
      stopStream();
      await requestCamera();
    }
  };

  // ── Live timer + simulated tokens ─────────────────────────────────────────
  useEffect(() => {
    if (!streaming) return;
    const t = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [streaming]);

  // ── Real-time viewer count polling ────────────────────────────────────────
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
      streamIdRef.current = session?.email ? encodeURIComponent(session.email) : null;
    } catch {}
  }, []);

  useEffect(() => {
    if (!streaming || !streamIdRef.current) return;
    const poll = async () => {
      try {
        const r = await fetch(`/api/user-profile?streamId=${streamIdRef.current}`);
        const data = await r.json();
        if (data.ok) {
          setViewerCount(data.count);
          setPeakCount(p => Math.max(p, data.count));
        }
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => {
      clearInterval(iv);
      setViewerCount(0);
    };
  }, [streaming]);

  const startStream = () => {
    setGoal({ current: 0, target: goalTarget, label: goalLabel });
    setStreaming(true);
    onStreamingChange && onStreamingChange(true);
    addToast("live", "You're live! 🔴 Notifying your followers…");
    addNotification("live", `Your stream "${title}" started — goal: ${goalLabel}`);

    // Record stream start in Upstash
    const token = localStorage.getItem("steamr_token");
    if (token) {
      fetch("/api/user-profile", {
        method:  "POST",
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
        body:    JSON.stringify({ token, action: "stream-start", streamTitle: title }),
      }).catch(() => {});
    }

    // Email all followers
    try {
      const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
      fetch("/api/notify-followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamerId:    session?.id || 1,
          streamerEmail: session?.email || "streamer@steamr.app",
          streamerName:  session?.name  || "Your favourite streamer",
          streamTitle:   title,
          streamUrl:     typeof window !== "undefined" ? window.location.origin : "https://steamr.app",
        }),
      })
      .then(r => r.json())
      .then(d => { if (d.sent > 0) addToast("success", `📧 ${d.sent} follower${d.sent===1?"":"s"} notified!`); })
      .catch(() => {});
    } catch {}
  };

  const endStream = () => {
    // Save session stats to Upstash
    const token = localStorage.getItem("steamr_token");
    if (token && seconds > 0) {
      fetch("/api/user-profile", {
        method:  "POST",
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
        body:    JSON.stringify({
          token,
          action:        "stream-end",
          durationSecs:  seconds,
          tokensEarned:  sessionTokens,
          peakViewers:   peakCount,
          streamTitle:   title,
        }),
      }).catch(() => {});
    }
    stopStream();
    setStreaming(false);
    onStreamingChange && onStreamingChange(false);
    setSeconds(0);
    setSessionTokens(0);
    setGoal(null);
    setPermStatus("idle");
    addToast("success", `Stream ended · ${sessionTokens} tokens earned this session!`);
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── Verification gate ────────────────────────────────────────────────────
  if (verified === null) return (
    <div style={{ textAlign:"center", padding:"80px 24px", color:COLORS.muted }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
      <div>Checking verification status…</div>
    </div>
  );

  if (verified === false) return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"48px 24px" }}>
      <button onClick={() => onNavigate("streamer-dashboard")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:24, fontSize:13 }}>← Dashboard</button>
      <Card style={{ textAlign:"center", padding:"40px 28px" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🔒</div>
        <h2 style={{ margin:"0 0 12px", fontWeight:900 }}>Verification Required</h2>
        <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          You need to complete identity verification before you can go live. This protects both streamers and viewers on Steamr.
        </p>
        <Btn onClick={() => onNavigate("kyc-status")} style={{ width:"100%", marginBottom:10 }}>
          🛡️ Check Verification Status
        </Btn>
        <Btn onClick={() => onNavigate("streamer-dashboard")} variant="secondary" style={{ width:"100%" }}>
          Back to Dashboard
        </Btn>
      </Card>
    </div>
  );

  // ── Camera preview panel ─────────────────────────────────────────────────


  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:isMobile?"24px 16px 60px":"48px 24px" }}>
      <button onClick={() => { stopStream(); onNavigate("streamer-dashboard"); }}
        style={{ background:"none",border:"none",color:COLORS.muted,cursor:"pointer",marginBottom:20,fontSize:13 }}>
        ← Dashboard
      </button>
      <h2 style={{ margin:`0 0 ${isMobile?16:24}px`, fontSize:isMobile?20:26, fontWeight:800 }}>
        {streaming ? "🔴 You're Live!" : "🎙️ Start Your Stream"}
      </h2>

    <div style={{ background: streaming ? "linear-gradient(135deg,#1a0a2e,#0a1a2e)" : COLORS.surface,
      borderRadius:16, height:isMobile?220:300, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      border:`2px solid ${streaming ? COLORS.accent : permStatus==="granted" ? COLORS.green : COLORS.border}`,
      marginBottom:16, transition:"all 0.4s", position:"relative", overflow:"hidden" }}>

      {/* Actual camera video element */}
      <video ref={videoRef} autoPlay muted playsInline
        style={{ position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", borderRadius:14,
          transform:"scaleX(-1)",
          display: permStatus === "granted" ? "block" : "none" }}
      />

      {/* Overlay content on top of video */}
      {permStatus === "granted" && streaming && (
        <>
          <div style={{ position:"absolute",top:12,left:12,zIndex:2 }}>
            <Pill color={COLORS.accent}>🔴 LIVE {fmt(seconds)}</Pill>
          </div>
          <div style={{ position:"absolute",top:12,right:12,background:"#00000088",borderRadius:8,padding:"4px 10px",fontSize:13,zIndex:2 }}>
            👁 {viewerCount.toLocaleString()} watching
          </div>
        </>
      )}

      {permStatus === "granted" && !streaming && (
        <>
          <div style={{ position:"absolute",top:12,left:12,zIndex:2 }}>
            <Pill color={COLORS.green}>📷 Camera On</Pill>
          </div>
          {isMobile && (
            <button onClick={flipCamera}
              style={{ position:"absolute",top:12,right:12,zIndex:2,background:"#00000077",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:14 }}>
              🔄 Flip
            </button>
          )}
        </>
      )}

      {/* Idle state */}
      {permStatus === "idle" && (
        <div style={{ textAlign:"center", zIndex:2 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📷</div>
          <div style={{ color:COLORS.muted, fontSize:13, marginBottom:16 }}>
            {isMobile ? "Tap to enable your camera" : "Click to enable your webcam"}
          </div>
          <Btn onClick={() => requestCamera()} variant="secondary" style={{ fontSize:13 }}>
            Enable Camera & Mic
          </Btn>
        </div>
      )}

      {/* Requesting */}
      {permStatus === "requesting" && (
        <div style={{ textAlign:"center", color:COLORS.muted, zIndex:2 }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
          <div style={{ fontSize:13 }}>Requesting permission…</div>
        </div>
      )}

      {/* Denied */}
      {(permStatus === "denied" || permStatus === "error") && (
        <div style={{ textAlign:"center", zIndex:2, padding:"0 20px" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🚫</div>
          <div style={{ color:"#ff6666", fontWeight:700, fontSize:13, marginBottom:8 }}>
            Camera access {permStatus === "denied" ? "denied" : "unavailable"}
          </div>
          <div style={{ color:COLORS.muted, fontSize:11, marginBottom:14, lineHeight:1.5 }}>
            {permStatus === "denied"
              ? "Allow camera access in your browser settings, then try again."
              : "No camera found. Check your device and try again."}
          </div>
          <Btn onClick={() => setPermStatus("idle")} variant="ghost" style={{ fontSize:12 }}>Try Again</Btn>
        </div>
      )}
    </div>

      {/* Goal progress during stream */}
      {streaming && goal && (
        <Card style={{ marginBottom:14, padding:"14px 18px" }}>
          <GoalBar goal={goal} large />
        </Card>
      )}

      {/* Pre-stream settings */}
      {!streaming && (
        <Card style={{ marginBottom:16 }}>
          <Input label="Stream Title" value={title} onChange={setTitle} placeholder="What are you streaming today?" />
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 160px", gap:12 }}>
            <Input label="Goal Description" value={goalLabel} onChange={setGoalLabel} placeholder="e.g. Sing your requests 🎤" />
            <Input label="Token Target" type="number" value={String(goalTarget)} onChange={v => setGoalTarget(Number(v)||0)} placeholder="1000" />
          </div>
        </Card>
      )}

      {/* ── Broadcast Settings ── */}
      {!streaming && (
        <Card style={{ marginBottom:16 }}>
          <div style={{ fontSize:12,fontWeight:700,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:18 }}>📡 Broadcast Settings</div>

          {/* Quality */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12,color:COLORS.muted,fontWeight:600,marginBottom:10,textTransform:"uppercase",letterSpacing:0.6 }}>Video Quality</div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {QUALITY_PRESETS.map(q => {
                const active = quality === q.id;
                return (
                  <button key={q.id} onClick={() => setQuality(q.id)} style={{
                    flex:1, minWidth:80, textAlign:"left",
                    border:`2px solid ${active ? q.color : COLORS.border}`,
                    background: active ? q.color+"1a" : COLORS.surface,
                    borderRadius:12, padding:isMobile?"9px 10px":"11px 14px", cursor:"pointer",
                    position:"relative", transition:"all 0.18s",
                  }}>
                    {q.recommended && active && (
                      <div style={{ position:"absolute",top:-9,right:8,background:q.color,color:"#fff",fontSize:8,fontWeight:800,borderRadius:10,padding:"2px 7px" }}>BEST</div>
                    )}
                    <div style={{ fontWeight:800,fontSize:isMobile?12:14,color:active?q.color:COLORS.text }}>{q.label}</div>
                    <div style={{ fontSize:10,color:COLORS.muted,marginTop:2 }}>{q.bitrate} · {q.fps}</div>
                    {q.note && <div style={{ fontSize:10,color:COLORS.gold,marginTop:2 }}>⚠️ {q.note}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera + Mic */}
          <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,marginBottom:16 }}>

            {/* Camera — real devices if granted, fallback list otherwise */}
            <div>
              <div style={{ fontSize:12,color:COLORS.muted,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.6 }}>
                📷 Camera
                {isMobile && permStatus==="granted" && (
                  <button onClick={flipCamera} style={{ marginLeft:8,background:COLORS.surface,border:`1px solid ${COLORS.border}`,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:10,color:COLORS.muted,fontWeight:700 }}>
                    🔄 Flip
                  </button>
                )}
              </div>

              {permStatus !== "granted" ? (
                /* Not yet granted — show static fallback list */
                <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                  {CAMERA_DEVICES.map(cam => {
                    const sel = cam.useDefault ? selectedCam === "" : selectedCam === cam.id;
                    return (
                      <label key={cam.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel?COLORS.accent+"14":COLORS.surface,border:`1px solid ${sel?COLORS.accent:COLORS.border}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s" }}>
                        <input type="radio" checked={sel} onChange={() => setSelectedCam(cam.useDefault ? "" : cam.id)} style={{ accentColor:COLORS.accent,margin:0 }} />
                        <span style={{ fontSize:15 }}>{cam.icon}</span>
                        <div>
                          <div style={{ fontSize:12,fontWeight:700 }}>{cam.label}</div>
                          <div style={{ fontSize:10,color:COLORS.muted }}>{cam.res}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : realCameras.length > 0 ? (
                /* Granted + real devices found */
                <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                  {realCameras.map(cam => {
                    const sel = selectedCam === cam.deviceId;
                    const label = cam.label || `Camera ${realCameras.indexOf(cam)+1}`;
                    return (
                      <label key={cam.deviceId} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel?COLORS.accent+"14":COLORS.surface,border:`1px solid ${sel?COLORS.accent:COLORS.border}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s" }}>
                        <input type="radio" checked={sel} onChange={() => switchDevice("cam", cam.deviceId)} style={{ accentColor:COLORS.accent,margin:0 }} />
                        <span style={{ fontSize:15 }}>📷</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{label}</div>
                          <div style={{ fontSize:10,color:COLORS.green }}>✓ Connected</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                /* Granted but no real labels yet (browser privacy) */
                <div style={{ padding:"12px",background:COLORS.surface,borderRadius:9,border:`1px solid ${COLORS.green}44`,fontSize:12,color:COLORS.green }}>
                  ✓ Camera active
                </div>
              )}
            </div>

            {/* Microphone */}
            <div>
              <div style={{ fontSize:12,color:COLORS.muted,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.6 }}>🎤 Microphone</div>

              {permStatus !== "granted" ? (
                <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                  {MIC_DEVICES.map(mic => {
                    const sel = selectedMic === mic.id;
                    return (
                      <label key={mic.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel?COLORS.green+"14":COLORS.surface,border:`1px solid ${sel?COLORS.green:COLORS.border}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s" }}>
                        <input type="radio" checked={sel} onChange={() => setSelectedMic(mic.id)} style={{ accentColor:COLORS.green,margin:0 }} />
                        <span style={{ fontSize:15 }}>{mic.icon}</span>
                        <div>
                          <div style={{ fontSize:12,fontWeight:700 }}>{mic.label}</div>
                          <div style={{ fontSize:10,color:COLORS.muted }}>{mic.type}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : realMics.length > 0 ? (
                <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                  {realMics.map(mic => {
                    const sel = selectedMic === mic.deviceId;
                    const label = mic.label || `Microphone ${realMics.indexOf(mic)+1}`;
                    return (
                      <label key={mic.deviceId} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel?COLORS.green+"14":COLORS.surface,border:`1px solid ${sel?COLORS.green:COLORS.border}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s" }}>
                        <input type="radio" checked={sel} onChange={() => switchDevice("mic", mic.deviceId)} style={{ accentColor:COLORS.green,margin:0 }} />
                        <span style={{ fontSize:15 }}>🎤</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{label}</div>
                          <div style={{ fontSize:10,color:COLORS.green }}>✓ Connected</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding:"12px",background:COLORS.surface,borderRadius:9,border:`1px solid ${COLORS.green}44`,fontSize:12,color:COLORS.green }}>
                  ✓ Microphone active
                </div>
              )}

              {/* Audio level meter */}
              <div style={{ marginTop:8,padding:"8px 12px",background:COLORS.surface,border:`1px solid ${COLORS.border}`,borderRadius:9,display:"flex",alignItems:"center",gap:10 }}>
                <button onClick={() => setTestingAudio(a => !a)}
                  style={{ background:testingAudio?COLORS.green:COLORS.surface,border:`1px solid ${testingAudio?COLORS.green:COLORS.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,color:testingAudio?"#000":COLORS.muted,fontWeight:700 }}>
                  {testingAudio ? "⏹ Stop" : "▶ Test"}
                </button>
                <AudioMeter active={testingAudio} selectedMic={selectedMic} />
              </div>
            </div>
          </div>

          {/* Connection status */}
          <div style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:COLORS.surface,border:`1px solid ${COLORS.border}`,borderRadius:10,flexWrap:"wrap" }}>
            <ConnectionMeter strength={4} />
            <div style={{ fontSize:13,flex:1,minWidth:0 }}>
              <span style={{ fontWeight:700,color:COLORS.green }}>Excellent </span>
              <span style={{ color:COLORS.muted }}>· 95 Mbps · RTT 12ms</span>
            </div>
            <div style={{ background:COLORS.green+"22",border:`1px solid ${COLORS.green}44`,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800,color:COLORS.green,flexShrink:0 }}>
              ✓ Ready to stream
            </div>
          </div>

          {/* Camera not enabled warning */}
          {permStatus === "idle" && (
            <div style={{ marginTop:12,padding:"10px 14px",background:COLORS.gold+"14",border:`1px solid ${COLORS.gold}44`,borderRadius:9,fontSize:12,color:COLORS.gold,display:"flex",alignItems:"center",gap:8 }}>
              ⚠️ Enable your camera above before going live
            </div>
          )}
        </Card>
      )}

      {/* Go Live button */}
      <Btn
        onClick={() => {
          if (streaming) { endStream(); }
          else {
            if (permStatus !== "granted") {
              addToast("warning", "⚠️ Please enable your camera first");
              return;
            }
            startStream();
          }
        }}
        variant={streaming ? "ghost" : "primary"}
        style={{ width:"100%", fontSize:isMobile?14:16, padding:isMobile?"13px":"16px" }}
      >
        {streaming ? "⏹ End Stream" : "🔴 Go Live Now"}
      </Btn>

      {/* Live stats */}
      {streaming && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginTop:16 }}>
          {[["👁","Viewers",viewerCount.toLocaleString()],["🪙","Tokens",sessionTokens.toLocaleString()]].map(([icon,label,val]) => (
            <Card key={label} style={{ textAlign:"center",padding:"12px" }}>
              <div style={{ fontSize:20 }}>{icon}</div>
              <div style={{ fontSize:18,fontWeight:800 }}>{val}</div>
              <div style={{ color:COLORS.muted,fontSize:11 }}>{label}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SUBSCRIBE MODAL ───────────────────────────────────────────────────────────
function SubscribeModal({ profile, currentSub, onSubscribe, onClose }) {
  const tiers = profile.subscriptionTiers || SUBSCRIPTION_TIERS;
  const [selected, setSelected] = useState(
    (currentSub && tiers.find(t => t.name === currentSub.tierName)) || tiers[1]
  );
  const [step, setStep] = useState("select"); // "select" | "confirm" | "success"

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"#000000bb", display:"flex", alignItems:"center", justifyContent:"center", zIndex:8000, padding:20 }}
    >
      <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:20, width:"100%", maxWidth:460, boxShadow:"0 20px 60px #00000099", maxHeight:"90vh", overflowY:"auto" }}>

        {/* ── Step 1: Choose tier ── */}
        {step === "select" && (<>
          <div style={{ padding:"24px 24px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Subscribe to</div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:26 }}>{profile.avatar}</span>
                  <h2 style={{ margin:0, fontSize:20, fontWeight:900 }}>{profile.name}</h2>
                </div>
              </div>
              <button onClick={onClose} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:22, lineHeight:1, padding:4 }}>✕</button>
            </div>
            <p style={{ color:COLORS.muted, fontSize:13, margin:"0 0 20px", lineHeight:1.6 }}>
              Unlock exclusive perks and support {profile.name} directly. Cancel anytime.
            </p>
          </div>

          <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:10 }}>
            {tiers.map(tier => {
              const isSel = selected.name === tier.name;
              return (
                <div key={tier.name} onClick={() => setSelected(tier)} style={{
                  border: `2px solid ${isSel ? tier.color : COLORS.border}`,
                  borderRadius:14, padding:"14px 16px", cursor:"pointer",
                  background: isSel ? tier.color + "14" : COLORS.surface,
                  position:"relative", transition:"all 0.18s",
                }}>
                  {tier.popular && (
                    <div style={{ position:"absolute", top:-10, left:16, background:tier.color, color:"#fff", fontSize:9, fontWeight:800, borderRadius:20, padding:"3px 10px", letterSpacing:0.5 }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:18 }}>{tier.badge}</span>
                      <span style={{ fontWeight:800, fontSize:15, color: isSel ? tier.color : COLORS.text }}>{tier.name}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight:900, fontSize:18, color: isSel ? tier.color : COLORS.text }}>${tier.price}</span>
                      <span style={{ fontSize:11, color:COLORS.muted }}>/mo</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {tier.perks.map(p => (
                      <div key={p} style={{ fontSize:12, color:COLORS.muted, display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ color: isSel ? tier.color : COLORS.green, fontWeight:700, fontSize:11 }}>✓</span>{p}
                      </div>
                    ))}
                  </div>
                  {isSel && (
                    <div style={{ position:"absolute", top:12, right:14, width:18, height:18, borderRadius:"50%", background:tier.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding:"20px 24px 24px" }}>
            <Btn onClick={() => setStep("confirm")} style={{ width:"100%", fontSize:15, padding:"13px", background:`linear-gradient(135deg,${selected.color},${selected.color}bb)`, border:"none" }}>
              Continue → {selected.badge} {selected.name} at ${selected.price}/mo
            </Btn>
          </div>
        </>)}

        {/* ── Step 2: Confirm payment ── */}
        {step === "confirm" && (<>
          <div style={{ padding:"20px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={() => setStep("select")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:13, padding:0 }}>← Change tier</button>
            <button onClick={onClose} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:22, lineHeight:1, padding:4 }}>✕</button>
          </div>
          <div style={{ padding:"16px 24px 0" }}>
            <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:900 }}>Confirm Subscription</h3>
            <p style={{ margin:"0 0 20px", color:COLORS.muted, fontSize:13 }}>Review before subscribing.</p>

            <div style={{ background:selected.color+"14", border:`1px solid ${selected.color}44`, borderRadius:14, padding:16, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:24 }}>{selected.badge}</span>
                  <div>
                    <div style={{ fontWeight:900, fontSize:16, color:selected.color }}>{selected.name}</div>
                    <div style={{ fontSize:11, color:COLORS.muted }}>to {profile.name}</div>
                  </div>
                </div>
                <div>
                  <span style={{ fontWeight:900, fontSize:22, color:selected.color }}>${selected.price}</span>
                  <span style={{ fontSize:12, color:COLORS.muted }}>/mo</span>
                </div>
              </div>
              <div style={{ borderTop:`1px solid ${selected.color}33`, paddingTop:12, display:"flex", flexDirection:"column", gap:5 }}>
                {selected.perks.map(p => (
                  <div key={p} style={{ fontSize:12, color:COLORS.muted, display:"flex", gap:6 }}>
                    <span style={{ color:selected.color, fontWeight:700 }}>✓</span>{p}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"13px 16px", marginBottom:20 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:20 }}>💳</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>Card ending •••• 4242</div>
                  <div style={{ fontSize:11, color:COLORS.muted }}>Billed ${selected.price} monthly · Cancel anytime</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding:"0 24px 24px" }}>
            <Btn
              onClick={() => { onSubscribe(selected); setStep("success"); }}
              style={{ width:"100%", fontSize:15, padding:"13px", background:`linear-gradient(135deg,${selected.color},${selected.color}bb)`, border:"none" }}
            >
              {selected.badge} Subscribe for ${selected.price}/mo
            </Btn>
          </div>
        </>)}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <div style={{ padding:"40px 24px", textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:10 }}>🎉</div>
            <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:900 }}>You're subscribed!</h2>
            <p style={{ color:COLORS.muted, fontSize:14, lineHeight:1.7, margin:"0 0 24px" }}>
              Welcome to {profile.name}'s fan club.<br />Your perks activate immediately.
            </p>
            {/* Chat badge preview */}
            <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"14px 18px", marginBottom:24, display:"inline-block", textAlign:"left" }}>
              <div style={{ fontSize:11, color:COLORS.muted, marginBottom:8 }}>Your badge in chat:</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                <span style={{ fontWeight:700, color:COLORS.accentC }}>You</span>
                <SubBadge tierName={selected.name} />
                <span style={{ color:COLORS.text }}>: Hey! 👋</span>
              </div>
            </div>
            <Btn onClick={onClose} variant="green" style={{ width:"100%", fontSize:15, padding:"13px" }}>
              ✓ Done
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AVATAR & BANNER PRESETS ───────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  "🎵","🎸","🎤","🎨","💪","🎮","🧘","🎙️","🍳","💑",
  "✏️","🎭","🌟","🔥","💫","🎪","🌹","💎","🦋","🌙",
  "⭐","🎀","👑","🌺","🦊","🐱","🐰","🌊","🎆","🏆",
];
const BANNER_PRESETS = [
  "#1a0a2e","#0a1a2e","#1a2e0a","#2e1a0a","#2e0a1a",
  "#0a2e2e","#2e1a2e","#1a2e2e","#2e2e0a","#1a0a1a",
  "#2e0a0a","#0a1a0a","#0d1a2e","#2a0a20","#0a2a20",
  "#1a0a20","#20100a","#0a2010","#10200a","#200a10",
];

// ── PROFILE SCREEN ────────────────────────────────────────────────────────────
function ProfileScreen({ streamerId, profileData, isOwnProfile, onNavigate, following, onFollow, subscriptions = {}, onSubscribe, onCancelSub, isStreamerLive = false }) {
  const w = useWindowWidth(); const isMobile = w < 768;
  const profile = isOwnProfile ? profileData : (STREAMER_PROFILES[streamerId] || STREAMER_PROFILES[1]);
  const streamer = STREAMERS.find(s => s.id === profile.id) || STREAMERS[0];
  const isLiveNow = isOwnProfile ? isStreamerLive : streamer.live;
  const isFollowing = following.has(profile.id);
  const currentSub  = subscriptions[profile.id] || null;
  const [showModal, setShowModal] = useState(false);

  const backScreen = isOwnProfile ? "streamer-dashboard" : "viewer-browse";

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", paddingBottom: 60 }}>

      {/* ── Banner ── */}
      <div style={{
        height: 210,
        background: profile.bannerImg
          ? `url(${profile.bannerImg}) center/cover no-repeat`
          : `linear-gradient(135deg, ${profile.bannerColor} 0%, ${profile.bannerColor}bb 100%)`,
        position: "relative",
        marginBottom: 56,
      }}>
        {/* Back button */}
        <button
          onClick={() => onNavigate(backScreen || "viewer-browse")}
          style={{ position:"absolute", top:16, left:20, background:"#00000055", border:"none", color:"#fff", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer" }}
        >← Back</button>

        {/* Avatar circle — sits half over the banner bottom edge */}
        <div style={{
          position: "absolute", bottom: -44, left: 32,
          width: 90, height: 90, borderRadius: "50%",
          background: COLORS.card, border: `3px solid ${COLORS.surface}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 46, boxShadow: "0 4px 20px #00000066",
          overflow: "hidden",
        }}>
          {profile.avatarImg
            ? <img src={profile.avatarImg} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
            : profile.avatar}
          {/* Online dot */}
          {isLiveNow && (
            <div style={{ position:"absolute", bottom:3, right:3, width:16, height:16, borderRadius:"50%", background:COLORS.accent, border:`2px solid ${COLORS.card}`, animation:"pulse 1.4s ease-in-out infinite" }} />
          )}
        </div>

        {/* Action buttons — top right of banner */}
        <div style={{ position:"absolute", top:16, right:20, display:"flex", gap:8, alignItems:"center" }}>
          {isOwnProfile ? (
            <Btn onClick={() => onNavigate("edit-profile")} variant="secondary" style={{ fontSize:13, padding:"8px 16px" }}>✏️ Edit Profile</Btn>
          ) : (
            <>
              {isLiveNow && (
                <Btn onClick={() => onNavigate("stream-room")} style={{ fontSize:13, padding:"8px 16px" }}>🔴 Watch Live</Btn>
              )}
              <Btn
                onClick={() => onFollow(profile.id)}
                variant={isFollowing ? "ghost" : "secondary"}
                style={{ fontSize:13, padding:"8px 18px" }}
              >
                {isFollowing ? "♥ Following" : "♡ Follow"}
              </Btn>
              {currentSub ? (
                <div style={{ display:"flex", alignItems:"center", gap:6, background:currentSub.tierColor+"22", border:`1px solid ${currentSub.tierColor}55`, borderRadius:8, padding:"6px 12px" }}>
                  <SubBadge tierName={currentSub.tierName} />
                </div>
              ) : (
                <Btn
                  onClick={() => setShowModal(true)}
                  style={{ fontSize:13, padding:"8px 16px", background:`linear-gradient(135deg,${COLORS.gold},${COLORS.gold}bb)`, border:"none" }}
                >
                  👑 Subscribe
                </Btn>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Name & meta ── */}
      <div style={{ padding:isMobile?"0 16px":"0 28px", marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:12, flexWrap:"wrap", marginBottom:6 }}>
          <h2 style={{ margin:0, fontSize:26, fontWeight:900 }}>{profile.name}</h2>
          {isLiveNow
          ? <Pill color={COLORS.accent}>🔴 LIVE NOW</Pill>
          : (isOwnProfile && <Pill color={COLORS.muted}>⚫ Offline</Pill>)}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <Pill color={CAT_COLOR[profile.category] || COLORS.accentB}>{profile.category}</Pill>
          <Pill color={COLORS.muted + "99"}>{profile.region}</Pill>
        </div>
        {profile.roomSubject && (
          <div style={{ color:COLORS.muted, fontSize:14, fontStyle:"italic", maxWidth:560, lineHeight:1.6 }}>
            "{profile.roomSubject}"
          </div>
        )}
        {/* Stats */}
        <div style={{ display:"flex", gap:32, marginTop:16 }}>
          {[
            { label:"Followers", value: profile.followers.toLocaleString() },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize:22, fontWeight:900 }}>{stat.value}</div>
              <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.8, marginTop:2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ padding:isMobile?"0 16px":"0 28px", display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 300px", gap:24, alignItems:"start" }}>

        {/* LEFT — Bio, Social, History */}
        <div>
          {/* About */}
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>About</div>
            <p style={{ margin:"0 0 14px", color:COLORS.text, lineHeight:1.8, fontSize:14 }}>{profile.bio}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {profile.tags.map(tag => (
                <span key={tag} style={{ fontSize:11, color:COLORS.accentC, background:COLORS.accentC+"18", border:`1px solid ${COLORS.accentC}33`, borderRadius:20, padding:"2px 9px" }}>#{tag}</span>
              ))}
            </div>
          </Card>

          {/* Social links */}
          {Object.keys(profile.socialLinks).length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Social</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {Object.entries(profile.socialLinks).map(([platform, handle]) => {
                  const icon = platform === "twitter" ? "𝕏" : platform === "instagram" ? "📷" : platform === "tiktok" ? "🎵" : "🔗";
                  return (
                    <div key={platform} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:"7px 14px", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                      <span>{icon}</span>
                      <span style={{ color:COLORS.text, fontWeight:600 }}>{handle}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Welcome message */}
          {profile.welcomeMsg && (
            <Card style={{ marginBottom:16, background: COLORS.accent + "0a", border:`1px solid ${COLORS.accent}22` }}>
              <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>👋 Welcome Message</div>
              <p style={{ margin:0, fontSize:13, color:COLORS.text, lineHeight:1.7, fontStyle:"italic" }}>"{profile.welcomeMsg}"</p>
            </Card>
          )}

          {/* ── Wishlist ── */}
          {profile.wishlist && profile.wishlist.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:12,color:COLORS.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:14 }}>
                🎁 Wishlist
              </div>
              <WishlistSection
                wishlist={profile.wishlist}
                viewerTokens={350}
                isOwn={isOwnProfile}
                onGift={() => {}}
              />
            </div>
          )}

          {/* Stream history */}
          {profile.streamHistory.length > 0 && (
            <Card>
              <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>📼 Recent Streams</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {profile.streamHistory.map((s, i) => (
                  <div key={i} style={{ background:COLORS.surface, borderRadius:10, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:5 }}>{s.title}</div>
                      <div style={{ display:"flex", gap:14, fontSize:12, color:COLORS.muted }}>
                        <span>👁 {s.viewers.toLocaleString()}</span>
                        <span>🪙 {s.tokens.toLocaleString()}</span>
                        <span>⏱ {s.duration}</span>
                      </div>
                    </div>
                    <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", fontSize:11, color:COLORS.muted, whiteSpace:"nowrap", fontWeight:600 }}>
                      {s.date}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — Subscriptions, tip menu */}
        <div>
          {/* ── Subscription tiers (viewers only) ── */}
          {!isOwnProfile && (
            <Card style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>👑 Subscribe</div>

              {currentSub ? (
                // ── Active subscription ──
                <div>
                  <div style={{ background:currentSub.tierColor+"18", border:`1px solid ${currentSub.tierColor}44`, borderRadius:12, padding:"13px 14px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:22 }}>{currentSub.tierBadge}</span>
                        <span style={{ fontWeight:800, fontSize:14, color:currentSub.tierColor }}>{currentSub.tierName}</span>
                      </div>
                      <span style={{ fontWeight:700, color:currentSub.tierColor }}>${currentSub.tierPrice}/mo</span>
                    </div>
                    <div style={{ fontSize:11, color:COLORS.muted }}>Active since {currentSub.since}</div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn onClick={() => setShowModal(true)} variant="secondary" style={{ flex:1, fontSize:12, padding:"8px" }}>Change Tier</Btn>
                    <Btn onClick={() => onCancelSub(profile.id)} variant="ghost" style={{ flex:1, fontSize:12, padding:"8px", color:COLORS.muted }}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                // ── Tier selector (not yet subscribed) ──
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {(profile.subscriptionTiers || SUBSCRIPTION_TIERS).map(tier => (
                    <div
                      key={tier.name}
                      onClick={() => setShowModal(true)}
                      style={{ cursor:"pointer", background:COLORS.surface, border:`2px solid ${tier.popular ? tier.color+"66" : COLORS.border}`, borderRadius:12, padding:"11px 13px", position:"relative", transition:"border-color 0.18s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = tier.color + "99"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = tier.popular ? tier.color + "66" : COLORS.border}
                    >
                      {tier.popular && (
                        <div style={{ position:"absolute", top:-9, right:12, background:tier.color, color:"#fff", fontSize:9, fontWeight:800, borderRadius:20, padding:"2px 9px" }}>POPULAR</div>
                      )}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                        <span style={{ fontWeight:800, fontSize:13 }}>{tier.badge} {tier.name}</span>
                        <span style={{ color:tier.color, fontWeight:800 }}>${tier.price}<span style={{ fontSize:10, color:COLORS.muted, fontWeight:400 }}>/mo</span></span>
                      </div>
                      {tier.perks.slice(0, 2).map(p => (
                        <div key={p} style={{ fontSize:11, color:COLORS.muted, display:"flex", gap:5, marginBottom:2 }}>
                          <span style={{ color:tier.color, fontWeight:700 }}>✓</span>{p}
                        </div>
                      ))}
                      {tier.perks.length > 2 && <div style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>+{tier.perks.length - 2} more perks</div>}
                    </div>
                  ))}
                  <Btn
                    onClick={() => setShowModal(true)}
                    style={{ width:"100%", fontSize:13, background:`linear-gradient(135deg,${COLORS.gold},${COLORS.gold}bb)`, border:"none" }}
                  >
                    👑 Subscribe
                  </Btn>
                </div>
              )}
            </Card>
          )}

          {/* ── Tip menu ── */}
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>💰 Tip Menu</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {profile.tipMenu.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:COLORS.surface, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ minWidth:54, textAlign:"center", background:COLORS.gold+"22", border:`1px solid ${COLORS.gold}44`, borderRadius:6, padding:"4px 6px", fontSize:12, fontWeight:800, color:COLORS.gold }}>
                    🪙 {item.tokens}
                  </div>
                  <div style={{ fontSize:13, color:COLORS.text, flex:1 }}>{item.action}</div>
                </div>
              ))}
            </div>
          </Card>

          {isOwnProfile && (
            <Btn onClick={() => onNavigate("edit-profile")} variant="ghost" style={{ width:"100%", fontSize:13 }}>
              ✏️ Customise Profile
            </Btn>
          )}
        </div>
      </div>

      {/* ── Subscribe modal ── */}
      {showModal && !isOwnProfile && (
        <SubscribeModal
          profile={profile}
          currentSub={currentSub}
          onSubscribe={(tier) => onSubscribe(profile.id, tier)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ── EDIT PROFILE SCREEN ───────────────────────────────────────────────────────
function EditProfileScreen({ profileData, onSave, onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [form, setForm] = useState({
    avatar:          profileData.avatar,
    avatarImg:       profileData.avatarImg  || null,
    bannerColor:     profileData.bannerColor,
    bannerImg:       profileData.bannerImg  || null,
    bio:             profileData.bio,
    roomSubject:     profileData.roomSubject,
    welcomeMsg:      profileData.welcomeMsg,
    tags:            [...profileData.tags],
    tipMenu:         profileData.tipMenu.map(i => ({ ...i })),
    socialTwitter:   profileData.socialLinks.twitter   || "",
    socialInstagram: profileData.socialLinks.instagram || "",
    socialTikTok:    profileData.socialLinks.tiktok    || "",
    newTag: "",
  });

  // Load real avatar + bio from Upstash on mount
  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) return;
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        setForm(f => ({
          ...f,
          avatarImg: data.profile.avatarImg || f.avatarImg,
          bio:       data.profile.bio       || f.bio,
          ...(data.profile.streamerProfile || {}),
          tags:    data.profile.streamerProfile?.tags    || f.tags,
          tipMenu: data.profile.streamerProfile?.tipMenu || f.tipMenu,
          socialTwitter:   data.profile.streamerProfile?.socialLinks?.twitter   || f.socialTwitter,
          socialInstagram: data.profile.streamerProfile?.socialLinks?.instagram || f.socialInstagram,
          socialTikTok:    data.profile.streamerProfile?.socialLinks?.tiktok    || f.socialTikTok,
        }));
      }
    }).catch(() => {});
  }, []);
  const [saved,    setSaved]    = useState(false);
  const [dragIdx,  setDragIdx]  = useState(null);
  const [wishlist, setWishlist] = useState((profileData.wishlist || DEFAULT_WISHLIST).map(i=>({...i})));
  const addWishItem    = () => setWishlist(w => [...w, {id:Date.now(),emoji:"🎁",name:"",tokens:100,usd:10.00,fulfilled:false,desc:""}]);
  const removeWishItem = (id) => setWishlist(w => w.filter(i => i.id !== id));
  const updateWishItem = (id, field, val) => setWishlist(w => w.map(i => i.id===id ? {...i,[field]:field==="tokens"||field==="usd"?Number(val)||0:val} : i));
  const [dragOver, setDragOver] = useState(null);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const moveTipItem = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const next = [...form.tipMenu];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    update("tipMenu", next);
  };

  const addTag = () => {
    const tag = form.newTag.trim().toLowerCase().replace(/^#/, "");
    if (!tag || form.tags.includes(tag) || form.tags.length >= 5) return;
    update("tags", [...form.tags, tag]);
    update("newTag", "");
  };
  const removeTag = (tag) => update("tags", form.tags.filter(t => t !== tag));

  const addTipItem  = () => update("tipMenu", [...form.tipMenu, { tokens: 50, action: "" }]);
  const removeTipItem = (i) => update("tipMenu", form.tipMenu.filter((_, idx) => idx !== i));
  const updateTipItem = (i, field, val) =>
    update("tipMenu", form.tipMenu.map((item, idx) =>
      idx === i ? { ...item, [field]: field === "tokens" ? Number(val) || 0 : val } : item
    ));

  const handleSave = () => {
    const updated = {
      ...profileData,
      avatar:      form.avatar,
      avatarImg:   form.avatarImg,
      bannerColor: form.bannerColor,
      bannerImg:   form.bannerImg,
      bio:         form.bio,
      roomSubject: form.roomSubject,
      welcomeMsg:  form.welcomeMsg,
      tags:        form.tags,
      tipMenu:     form.tipMenu.filter(i => i.action.trim()),
      socialLinks: {
        ...(form.socialTwitter   ? { twitter:   form.socialTwitter   } : {}),
        ...(form.socialInstagram ? { instagram: form.socialInstagram } : {}),
        ...(form.socialTikTok    ? { tiktok:    form.socialTikTok    } : {}),
      },
    };
    onSave(updated);

    // Save to Upstash
    const token = localStorage.getItem("steamr_token");
    if (token) {
      fetch("/api/user-profile", {
        method:  "POST",
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          avatarImg:   form.avatarImg,
          bio:         form.bio,
          // Streamer-specific fields stored in account
          streamerProfile: {
            bannerColor: form.bannerColor,
            bannerImg:   form.bannerImg,
            roomSubject: form.roomSubject,
            welcomeMsg:  form.welcomeMsg,
            tags:        form.tags,
            tipMenu:     form.tipMenu.filter(i => i.action.trim()),
            socialLinks: updated.socialLinks,
          },
        }),
      }).catch(() => {});
    }

    setSaved(true);
    setTimeout(() => { setSaved(false); onNavigate("streamer-dashboard"); }, 1200);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px 60px" }}>
      <button onClick={() => onNavigate("profile", { streamerId: 1 })} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:16, fontSize:13 }}>← Back to Profile</button>
      <h2 style={{ margin:"0 0 24px", fontSize:24, fontWeight:800 }}>✏️ Edit Profile</h2>

      {/* Live preview */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Preview</div>
        <div style={{ height:110, background:form.bannerImg?`url(${form.bannerImg}) center/cover no-repeat`:form.bannerColor, borderRadius:14, display:"flex", alignItems:"flex-end", paddingBottom:14, paddingLeft:18, border:`1px solid ${COLORS.border}`, transition:"background 0.3s", position:"relative" }}>
          {form.bannerImg && <div style={{position:"absolute",inset:0,borderRadius:14,background:"rgba(0,0,0,0.18)"}}/>}
          <div style={{ position:"relative", width:64, height:64, borderRadius:"50%", background:COLORS.card, border:`2px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, overflow:"hidden" }}>
            {form.avatarImg
              ? <img src={form.avatarImg} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
              : form.avatar}
          </div>
          <div style={{ marginLeft:14 }}>
            <div style={{ fontWeight:800, fontSize:16 }}>{profileData.name}</div>
            <Pill color={CAT_COLOR[profileData.category] || COLORS.accentB}>{profileData.category}</Pill>
          </div>
        </div>
      </div>

      {/* Avatar upload */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:COLORS.muted, marginBottom:14 }}>PROFILE AVATAR</div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          {/* Current avatar preview */}
          <div style={{ width:80, height:80, borderRadius:"50%", background:COLORS.surface, border:`2px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, flexShrink:0, overflow:"hidden" }}>
            {form.avatarImg
              ? <img src={form.avatarImg} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span>{form.avatar}</span>}
          </div>
          {/* Upload zone */}
          <div style={{ flex:1 }}>
            <label style={{ display:"block", cursor:"pointer" }}>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display:"none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => update("avatarImg", ev.target.result);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <div style={{ border:`2px dashed ${COLORS.border}`, borderRadius:12, padding:"18px 20px", textAlign:"center", transition:"border-color 0.2s", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=COLORS.accent}
                onMouseLeave={e=>e.currentTarget.style.borderColor=COLORS.border}>
                <div style={{ fontSize:24, marginBottom:6 }}>📷</div>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>Upload Photo</div>
                <div style={{ fontSize:11, color:COLORS.muted }}>JPG, PNG, GIF or WEBP · Max 5 MB</div>
              </div>
            </label>
            {form.avatarImg && (
              <button onClick={() => update("avatarImg", null)} style={{ marginTop:8, background:"none", border:"none", color:"#ff6666", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                ✕ Remove photo
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Banner upload */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:COLORS.muted, marginBottom:14 }}>PROFILE BANNER</div>

        {/* Current banner preview */}
        <div style={{ height:90, borderRadius:12, marginBottom:14, background:form.bannerImg?`url(${form.bannerImg}) center/cover no-repeat`:form.bannerColor, border:`1px solid ${COLORS.border}`, position:"relative", overflow:"hidden" }}>
          {!form.bannerImg && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.3)", fontSize:12 }}>Banner Preview</div>}
        </div>

        {/* Upload zone */}
        <label style={{ display:"block", cursor:"pointer" }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => update("bannerImg", ev.target.result);
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
          <div style={{ border:`2px dashed ${COLORS.border}`, borderRadius:12, padding:"16px 20px", textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=COLORS.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=COLORS.border}>
            <div style={{ fontSize:22, marginBottom:6 }}>🖼️</div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{form.bannerImg?"Replace Banner":"Upload Banner"}</div>
            <div style={{ fontSize:11, color:COLORS.muted }}>JPG, PNG or WEBP · Recommended 1500×500 px</div>
          </div>
        </label>

        {form.bannerImg ? (
          <button onClick={() => update("bannerImg", null)} style={{ marginTop:8, background:"none", border:"none", color:"#ff6666", cursor:"pointer", fontSize:12, fontWeight:600 }}>
            ✕ Remove banner photo
          </button>
        ) : (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, color:COLORS.muted, marginBottom:8 }}>Or pick a colour</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {BANNER_PRESETS.map(color => (
                <button key={color} onClick={() => update("bannerColor", color)} style={{
                  width:28, height:28, borderRadius:6, background:color, cursor:"pointer",
                  border:`3px solid ${form.bannerColor===color?COLORS.accent:"transparent"}`,
                  transition:"border-color 0.15s",
                }} />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Bio & room info */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:COLORS.muted, marginBottom:16 }}>BIO & ROOM INFO</div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>About Me</label>
          <textarea value={form.bio} onChange={e => update("bio", e.target.value)} rows={4} placeholder="Tell viewers about yourself…"
            style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"10px 14px", color:COLORS.text, fontSize:14, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.6 }}
          />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>
            Room Subject <span style={{ color:COLORS.muted, fontWeight:400, fontSize:11 }}>(shown in stream room)</span>
          </label>
          <input value={form.roomSubject} onChange={e => update("roomSubject", e.target.value)} placeholder="e.g. ♪ Tip 🪙10 for a song request ♪"
            style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
          />
        </div>

        <div>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>
            Welcome Message <span style={{ color:COLORS.muted, fontWeight:400, fontSize:11 }}>(shown to new viewers entering the room)</span>
          </label>
          <textarea value={form.welcomeMsg} onChange={e => update("welcomeMsg", e.target.value)} rows={2} placeholder="Hey! Welcome to my room 👋"
            style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"10px 14px", color:COLORS.text, fontSize:14, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit" }}
          />
        </div>
      </Card>

      {/* Tags */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:COLORS.muted, marginBottom:4 }}>
          TAGS <span style={{ color:COLORS.muted, fontWeight:400 }}>(up to 5 — help viewers find you)</span>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", margin:"12px 0" }}>
          {form.tags.map(tag => (
            <span key={tag} style={{ display:"flex", alignItems:"center", gap:4, background:COLORS.accentC+"22", border:`1px solid ${COLORS.accentC}44`, borderRadius:20, padding:"4px 10px", fontSize:12, color:COLORS.accentC }}>
              #{tag}
              <button onClick={() => removeTag(tag)} style={{ background:"none", border:"none", color:COLORS.accentC, cursor:"pointer", padding:0, fontSize:15, lineHeight:1, marginLeft:2 }}>×</button>
            </span>
          ))}
        </div>
        {form.tags.length < 5 && (
          <div style={{ display:"flex", gap:8 }}>
            <input value={form.newTag} onChange={e => update("newTag", e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Type a tag and press Enter…"
              style={{ flex:1, background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:"8px 12px", color:COLORS.text, fontSize:13, outline:"none" }}
            />
            <Btn onClick={addTag} variant="secondary" style={{ padding:"8px 16px", fontSize:13 }}>Add</Btn>
          </div>
        )}
      </Card>

      {/* Tip menu — drag-to-reorder */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <div style={{ fontSize:13, fontWeight:700, color:COLORS.muted }}>💰 TIP MENU</div>
          <div style={{ fontSize:11, color:COLORS.muted }}>⠿ drag to reorder</div>
        </div>
        <div style={{ fontSize:12, color:COLORS.muted, marginBottom:14 }}>
          Set token amounts &amp; what viewers receive. Drag rows to reorder.
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
          {form.tipMenu.map((item, i) => {
            const isDragging = dragIdx === i;
            const isOver     = dragOver === i && dragIdx !== i;
            return (
              <div key={i}
                draggable
                onDragStart={e => {
                  setDragIdx(i);
                  e.dataTransfer.effectAllowed = "move";
                  // Slightly delay so browser can render the ghost
                  setTimeout(() => {}, 0);
                }}
                onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(i); }}
                onDrop={e => {
                  e.preventDefault();
                  moveTipItem(dragIdx, i);
                  setDragIdx(null); setDragOver(null);
                }}
                style={{
                  display:"flex", gap:8, alignItems:"center",
                  opacity: isDragging ? 0.35 : 1,
                  transform: isOver ? "translateY(-2px)" : "none",
                  transition:"opacity 0.15s, transform 0.15s",
                  background: isOver ? COLORS.accent+"14" : "transparent",
                  borderRadius:10, padding:"4px 2px",
                  borderTop: isOver ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                }}>

                {/* Drag handle */}
                <div style={{
                  cursor:"grab", color:COLORS.border, fontSize:19, lineHeight:1,
                  padding:"0 6px", userSelect:"none", letterSpacing:-1,
                  flexShrink:0,
                }} title="Drag to reorder">⠿</div>

                {/* Token amount */}
                <div style={{ position:"relative", width:84, flexShrink:0 }}>
                  <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)",
                    color:COLORS.gold, fontSize:12, pointerEvents:"none" }}>🪙</span>
                  <input type="number" value={item.tokens}
                    onChange={e => updateTipItem(i, "tokens", e.target.value)}
                    style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`,
                      borderRadius:8, padding:"9px 6px 9px 28px", color:COLORS.gold,
                      fontSize:13, fontWeight:700, outline:"none", boxSizing:"border-box" }}
                  />
                </div>

                {/* Action description */}
                <input value={item.action}
                  onChange={e => updateTipItem(i, "action", e.target.value)}
                  placeholder="What viewers get…"
                  style={{ flex:1, background:COLORS.surface, border:`1px solid ${COLORS.border}`,
                    borderRadius:8, padding:"9px 12px", color:COLORS.text,
                    fontSize:13, outline:"none" }}
                />

                {/* Sort rank badge */}
                <div style={{ flexShrink:0, minWidth:22, textAlign:"center",
                  fontSize:10, color:COLORS.muted, fontWeight:700 }}>
                  #{i+1}
                </div>

                {/* Remove */}
                <button onClick={() => removeTipItem(i)} style={{
                  background:"none", border:`1px solid ${COLORS.border}`, borderRadius:8,
                  color:COLORS.muted, cursor:"pointer", padding:"8px 10px",
                  fontSize:16, lineHeight:1, flexShrink:0,
                }}>×</button>
              </div>
            );
          })}
        </div>

        <Btn onClick={addTipItem} variant="ghost" style={{ fontSize:13, padding:"9px 16px" }}>+ Add Row</Btn>
      </Card>

      {/* ── Wishlist editor ── */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
          <div style={{ fontSize:13,fontWeight:700,color:COLORS.muted }}>🎁 WISHLIST</div>
          <div style={{ fontSize:11,color:COLORS.muted }}>viewers can gift these to you</div>
        </div>
        <div style={{ fontSize:12,color:COLORS.muted,marginBottom:14 }}>
          Add items you'd love — fans can send them as gifts with tokens.
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:12 }}>
          {wishlist.map(item => (
            <div key={item.id} style={{ display:"flex",gap:8,alignItems:"flex-start",
              padding:"12px",background:COLORS.surface,borderRadius:11,
              border:`1px solid ${item.fulfilled?COLORS.green+"44":COLORS.border}`,
              opacity:item.fulfilled?0.6:1 }}>
              {/* Emoji */}
              <input value={item.emoji} onChange={e => updateWishItem(item.id,"emoji",e.target.value)}
                style={{ width:44,background:"transparent",border:`1px solid ${COLORS.border}`,
                  borderRadius:8,padding:"7px 4px",fontSize:20,textAlign:"center",outline:"none" }}
              />
              <div style={{ flex:1,display:"flex",flexDirection:"column",gap:6 }}>
                <input value={item.name} onChange={e => updateWishItem(item.id,"name",e.target.value)}
                  placeholder="Item name…"
                  style={{ width:"100%",background:COLORS.card,border:`1px solid ${COLORS.border}`,
                    borderRadius:8,padding:"8px 12px",color:COLORS.text,fontSize:13,outline:"none",boxSizing:"border-box" }}
                />
                <div style={{ display:"flex",gap:8 }}>
                  <div style={{ position:"relative",flex:1 }}>
                    <span style={{ position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",
                      color:COLORS.gold,fontSize:12,pointerEvents:"none" }}>🪙</span>
                    <input type="number" value={item.tokens}
                      onChange={e => updateWishItem(item.id,"tokens",e.target.value)}
                      placeholder="Tokens"
                      style={{ width:"100%",background:COLORS.card,border:`1px solid ${COLORS.border}`,
                        borderRadius:8,padding:"8px 8px 8px 28px",color:COLORS.gold,
                        fontSize:13,fontWeight:700,outline:"none",boxSizing:"border-box" }}
                    />
                  </div>
                  <div style={{ position:"relative",flex:1 }}>
                    <span style={{ position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",
                      color:COLORS.green,fontSize:11,pointerEvents:"none" }}>$</span>
                    <input type="number" value={item.usd} step="0.01"
                      onChange={e => updateWishItem(item.id,"usd",e.target.value)}
                      placeholder="Value USD"
                      style={{ width:"100%",background:COLORS.card,border:`1px solid ${COLORS.border}`,
                        borderRadius:8,padding:"8px 8px 8px 18px",color:COLORS.green,
                        fontSize:13,fontWeight:700,outline:"none",boxSizing:"border-box" }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"center" }}>
                <button onClick={() => removeWishItem(item.id)} style={{
                  background:"none",border:`1px solid ${COLORS.border}`,borderRadius:8,
                  color:COLORS.muted,cursor:"pointer",padding:"7px 9px",fontSize:15,lineHeight:1 }}>×</button>
                <label style={{ display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:"pointer",fontSize:10,color:COLORS.green,gap:2 }}>
                  <input type="checkbox" checked={item.fulfilled}
                    onChange={e => updateWishItem(item.id,"fulfilled",e.target.checked)}
                    style={{ accentColor:COLORS.green }} />
                  Done
                </label>
              </div>
            </div>
          ))}
        </div>
        <Btn onClick={addWishItem} variant="ghost" style={{ fontSize:13,padding:"9px 16px" }}>+ Add Item</Btn>
      </Card>

      {/* Social links */}
      <Card style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:COLORS.muted, marginBottom:16 }}>🔗 SOCIAL LINKS</div>
        {[
          { key:"socialTwitter",   icon:"𝕏",  label:"Twitter / X",  placeholder:"@yourhandle" },
          { key:"socialInstagram", icon:"📷", label:"Instagram",    placeholder:"@yourhandle" },
          { key:"socialTikTok",    icon:"🎵", label:"TikTok",       placeholder:"@yourhandle" },
        ].map(({ key, icon, label, placeholder }) => (
          <div key={key} style={{ marginBottom:12 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>{icon} {label}</label>
            <input value={form[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder}
              style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box" }}
            />
          </div>
        ))}
      </Card>

      {/* Save */}
      {saved ? (
        <div style={{ background:COLORS.green+"22", border:`1px solid ${COLORS.green}44`, borderRadius:12, padding:"16px", textAlign:"center", color:COLORS.green, fontWeight:700, fontSize:15 }}>
          ✓ Profile saved — redirecting…
        </div>
      ) : (
        <Btn onClick={handleSave} variant="green" style={{ width:"100%", fontSize:16, padding:"14px" }}>
          Save Changes
        </Btn>
      )}
    </div>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────────────────────
function SettingsScreen({ onNavigate, addToast, isStreamer = true, isDark = true, onToggleTheme }) {

  // ── local state ───────────────────────────────────────────────────────────
  const [pw, setPw]         = useState({ current:"", next:"", confirm:"" });
  const [pwError, setPwErr] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const [bank, setBank]     = useState({ name:"Chase Bank", account:"", routing:"021000021" });
  const [bankSaved, setBankSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    tipAlerts:      true,
    followerAlerts: true,
    subAlerts:      true,
    payoutConfirm:  true,
    liveReminders:  true,
    emailDigest:    false,
  });

  const [twoFA, setTwoFA]           = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  // ── helpers ───────────────────────────────────────────────────────────────
  const upPw   = k => e => setPw(p => ({ ...p, [k]: e.target.value }));
  const upBank = k => e => setBank(b => ({ ...b, [k]: e.target.value }));

  const savePw = () => {
    setPwErr("");
    if (!pw.current)          { setPwErr("Enter your current password."); return; }
    if (pw.next.length < 8)   { setPwErr("New password must be at least 8 characters."); return; }
    if (pw.next !== pw.confirm){ setPwErr("New passwords don't match."); return; }
    setPw({ current:"", next:"", confirm:"" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
    addToast("success", "Password updated ✓");
  };

  const saveBank = () => {
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 2500);
    addToast("payout", "Bank info saved ✓");
  };

  const toggleNotif = (key, val) => {
    setNotifs(n => ({ ...n, [key]: val }));
    addToast("success", `${NOTIF_LABEL[key]} ${val ? "enabled" : "disabled"}`);
  };

  const NOTIF_LABEL = {
    tipAlerts:      "Tip alerts",
    followerAlerts: "Follower alerts",
    subAlerts:      "Subscriber alerts",
    payoutConfirm:  "Payout confirmations",
    liveReminders:  "Go-live reminders",
    emailDigest:    "Weekly email digest",
  };

  const NOTIF_ROWS = [
    { key:"tipAlerts",      icon:"🪙", label:"Token tip received",   desc:"When a viewer sends you tokens"           },
    { key:"followerAlerts", icon:"♥",  label:"New follower",         desc:"When someone follows your channel"         },
    { key:"subAlerts",      icon:"👑", label:"New subscriber",       desc:"When someone joins your fan club"          },
    { key:"payoutConfirm",  icon:"💸", label:"Payout confirmation",  desc:"When a payout is processed to your bank"  },
    { key:"liveReminders",  icon:"🔴", label:"Go-live reminders",    desc:"Prompt to go live at your usual times"    },
    { key:"emailDigest",    icon:"📧", label:"Weekly email digest",  desc:"Channel performance summary every Monday" },
  ];

  // ── section header helper ─────────────────────────────────────────────────
  const SectionHead = ({ children }) => (
    <div style={{ fontSize:11, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1.1, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${COLORS.border}` }}>
      {children}
    </div>
  );

  // ── labelled input helper ─────────────────────────────────────────────────
  const Field = ({ label, note, ...props }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <label style={{ fontSize:13, color:COLORS.muted, fontWeight:600 }}>{label}</label>
        {note && <span style={{ fontSize:11, color:COLORS.muted }}>{note}</span>}
      </div>
      <input {...props} style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
    </div>
  );

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"36px 24px 60px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:36 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:COLORS.card, border:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>⚙️</div>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:900 }}>Settings</h2>
          <div style={{ fontSize:13, color:COLORS.muted, marginTop:2 }}>Account, security and notification preferences</div>
        </div>
      </div>

      {/* ── Account summary ─────────────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <SectionHead>Account</SectionHead>
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:COLORS.surface, border:`2px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>🎵</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:17 }}>Luna Vex</div>
              <div style={{ color:COLORS.muted, fontSize:13, marginTop:1 }}>luna@steamr.com</div>
            </div>
            <Pill color={COLORS.accent}>Streamer</Pill>
          </div>
          <div style={{ display:"flex", gap:28, marginTop:16, paddingTop:16, borderTop:`1px solid ${COLORS.border}`, flexWrap:"wrap" }}>
            {[
              { label:"Member since", value:"March 2023" },
              { label:"Account ID",   value:"#LV-00001"  },
              { label:"Status",       value:"● Verified", color: COLORS.green },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color: color || COLORS.text }}>{value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Change password ─────────────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <SectionHead>🔐 Change Password</SectionHead>
        <Card>
          <Field label="Current Password" type="password" value={pw.current} onChange={upPw("current")} placeholder="Enter current password" />
          <Field label="New Password" type="password" value={pw.next} onChange={upPw("next")} placeholder="At least 8 characters" note="min 8 chars" />
          <Field label="Confirm New Password" type="password" value={pw.confirm} onChange={upPw("confirm")} placeholder="Repeat new password" />

          {pwError && (
            <div style={{ color:COLORS.accent, fontSize:12, marginBottom:14, padding:"9px 13px", background:COLORS.accent+"18", border:`1px solid ${COLORS.accent}33`, borderRadius:8 }}>
              ⚠ {pwError}
            </div>
          )}
          {pwSaved && (
            <div style={{ color:COLORS.green, fontSize:12, marginBottom:14, padding:"9px 13px", background:COLORS.green+"18", border:`1px solid ${COLORS.green}33`, borderRadius:8 }}>
              ✓ Password updated successfully
            </div>
          )}
          <Btn onClick={savePw} variant="secondary" style={{ width:"100%" }}>Update Password</Btn>
        </Card>
      </div>

      {/* ── Payout bank info (streamers only) ──────────────────────────── */}
      {isStreamer && (
        <div style={{ marginBottom:32 }}>
          <SectionHead>🏦 Payout Bank Info</SectionHead>
          <Card>
            <p style={{ margin:"0 0 18px", fontSize:13, color:COLORS.muted, lineHeight:1.7 }}>
              Earnings are paid to this account every Tuesday. Minimum payout is $50.
            </p>
            <Field label="Bank Name" value={bank.name} onChange={upBank("name")} placeholder="e.g. Chase, Wells Fargo" />
            <Field label="Account Number" value={bank.account} onChange={upBank("account")} placeholder="Account number" type="password" note="encrypted" />
            <Field label="Routing Number" value={bank.routing} onChange={upBank("routing")} placeholder="9-digit ABA routing number" />
            {bankSaved && (
              <div style={{ color:COLORS.green, fontSize:12, marginBottom:14, padding:"9px 13px", background:COLORS.green+"18", border:`1px solid ${COLORS.green}33`, borderRadius:8 }}>
                ✓ Bank info saved
              </div>
            )}
            <Btn onClick={saveBank} variant="secondary" style={{ width:"100%" }}>Save Bank Info</Btn>
          </Card>
        </div>
      )}

      {/* ── Appearance ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <SectionHead>🎨 Appearance</SectionHead>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>
                {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </div>
              <div style={{ fontSize:12, color:COLORS.muted }}>
                {isDark ? "Easy on the eyes at night" : "Classic bright interface"}
              </div>
            </div>
            <Toggle checked={isDark} onChange={() => onToggleTheme && onToggleTheme()} />
          </div>
        </Card>
      </div>

      {/* ── Notification preferences ────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <SectionHead>🔔 Notification Preferences</SectionHead>
        <Card style={{ padding:0, overflow:"hidden" }}>
          {NOTIF_ROWS.map(({ key, icon, label, desc }, i) => (
            <div key={key} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom: i < NOTIF_ROWS.length-1 ? `1px solid ${COLORS.border}` : "none", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.surface}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width:36, height:36, borderRadius:"50%", background:COLORS.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{label}</div>
                <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{desc}</div>
              </div>
              <Toggle checked={notifs[key]} onChange={v => toggleNotif(key, v)} />
            </div>
          ))}
          <div style={{ padding:"12px 20px", fontSize:12, color:COLORS.muted }}>Changes save automatically.</div>
        </Card>
      </div>

      {/* ── Security ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <SectionHead>🛡️ Security</SectionHead>
        <Card>
          {/* 2FA */}
          <div style={{ display:"flex", alignItems:"center", gap:14, paddingBottom:16, borderBottom:`1px solid ${COLORS.border}`, marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>Two-Factor Authentication</div>
              <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>Require a code from your authenticator app on login</div>
            </div>
            <Toggle checked={twoFA} onChange={v => { setTwoFA(v); addToast("success", `2FA ${v?"enabled":"disabled"}`); }} />
          </div>
          {/* Active session */}
          <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Active Sessions</div>
          <div style={{ background:COLORS.surface, borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Chrome · Las Vegas, NV</div>
              <div style={{ fontSize:11, color:COLORS.green, marginTop:2 }}>● Current session</div>
            </div>
            <span style={{ fontSize:11, color:COLORS.muted }}>Just now</span>
          </div>
        </Card>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <div>
        <SectionHead>⚠️ Danger Zone</SectionHead>
        <div style={{ background:COLORS.card, border:`1px solid #ff444433`, borderRadius:16, padding:22 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:6 }}>Disable Account</div>
          <p style={{ margin:"0 0 18px", fontSize:13, color:COLORS.muted, lineHeight:1.7 }}>
            Permanently disabling your account will remove your public profile, cancel all subscriptions, and stop all future payouts. This action cannot be undone.
          </p>
          {!showDisable ? (
            <Btn onClick={() => setShowDisable(true)} variant="ghost" style={{ color:"#ff6666", borderColor:"#ff666644", fontSize:13 }}>
              Disable My Account
            </Btn>
          ) : (
            <div style={{ background:"#ff444418", border:`1px solid #ff444444`, borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#ff7777", marginBottom:12 }}>Are you absolutely sure? This cannot be undone.</div>
              <div style={{ display:"flex", gap:10 }}>
                <Btn onClick={() => setShowDisable(false)} variant="ghost" style={{ flex:1, fontSize:13 }}>Cancel</Btn>
                <Btn
                  onClick={() => { setShowDisable(false); addToast("success", "Disable request received — our team will follow up by email."); }}
                  style={{ flex:1, fontSize:13, background:"#cc3333", border:"none" }}
                >
                  Yes, Disable
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
// ── FAN CLUB FEED ─────────────────────────────────────────────────────────────
function FanClubFeed({ subscriptions = {}, onNavigate, addToast }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [posts,      setPosts]      = useState(FAN_CLUB_POSTS);
  const [filter,     setFilter]     = useState("All");
  const [votedPolls, setVotedPolls] = useState({});

  const canView = (post) => {
    const sub = subscriptions[post.streamerId];
    if (!sub) return false;
    return (TIER_RANK[sub.tierName] || 0) >= (TIER_RANK[post.minTier] || 1);
  };
  const subscribedIds = Object.keys(subscriptions).map(Number);
  const hasSubs = subscribedIds.length > 0;
  const subscribedStreamers = STREAMERS.filter(s => subscribedIds.includes(s.id));
  const filtered = posts.filter(p => {
    if (filter === "Photos") return p.type === "photo";
    if (filter === "Videos") return p.type === "video";
    if (filter === "Polls")  return p.type === "poll";
    if (filter === "Text")   return p.type === "text";
    return true;
  });
  const toggleLike = (id) => setPosts(prev => prev.map(p => p.id===id ? { ...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1 } : p));
  const votePoll = (postId, idx) => {
    if (votedPolls[postId] !== undefined) return;
    setVotedPolls(v => ({ ...v, [postId]: idx }));
    setPosts(prev => prev.map(p => p.id===postId ? { ...p, pollOptions:p.pollOptions.map((o,i)=>i===idx?{...o,votes:o.votes+1}:o) } : p));
  };
  const tierColor = t => t==="VIP"?COLORS.gold:t==="Super Fan"?COLORS.accent:COLORS.accentC;
  const tierLabel = t => t==="VIP"?"👑 VIP":t==="Super Fan"?"⭐ Super Fan+":"🌟 Fan+";

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:isMobile?"16px":"24px 24px 48px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:"0 0 4px", fontSize:isMobile?20:24, fontWeight:900 }}>Fan Club</h2>
          <p style={{ margin:0, color:COLORS.muted, fontSize:13 }}>Exclusive content from your subscriptions</p>
        </div>
        <Btn onClick={() => onNavigate("viewer-browse")} variant="ghost" style={{ fontSize:12, padding:"6px 14px" }}>+ Find Streamers</Btn>
      </div>

      {subscribedStreamers.length > 0 && (
        <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:12, marginBottom:20 }}>
          {subscribedStreamers.map(s => (
            <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flexShrink:0, cursor:"pointer" }}
              onClick={() => onNavigate("profile", { streamerId:s.id })}>
              <div style={{ width:56, height:56, borderRadius:"50%", border:`3px solid ${COLORS.accent}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
                background:s.preview, position:"relative" }}>
                {s.avatar}
                {s.live && <div style={{ position:"absolute", bottom:1, right:1, width:12, height:12, borderRadius:"50%", background:COLORS.accent, border:`2px solid ${COLORS.bg}` }} />}
              </div>
              <span style={{ fontSize:10, color:COLORS.muted, maxWidth:60, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"flex", borderBottom:`1px solid ${COLORS.border}`, marginBottom:20 }}>
        {["All","Photos","Videos","Polls","Text"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background:"none", border:"none", borderBottom:`2px solid ${filter===f?COLORS.accent:"transparent"}`,
            color:filter===f?COLORS.text:COLORS.muted, fontWeight:filter===f?700:400,
            padding:"8px 14px", cursor:"pointer", fontSize:13, marginBottom:-1, transition:"all 0.2s" }}>{f}</button>
        ))}
      </div>

      {!hasSubs && (
        <div style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>👑</div>
          <h3 style={{ margin:"0 0 8px" }}>No subscriptions yet</h3>
          <p style={{ color:COLORS.muted, fontSize:14, marginBottom:24 }}>Subscribe to streamers to unlock exclusive Fan Club content.</p>
          <Btn onClick={() => onNavigate("viewer-browse")}>Browse Streamers</Btn>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {filtered.map(post => {
          const unlocked = canView(post);
          const sub = subscriptions[post.streamerId];
          const voted = votedPolls[post.id];
          const totalVotes = post.type==="poll" ? (post.pollOptions||[]).reduce((a,o)=>a+o.votes,0) : 0;
          return (
            <div key={post.id} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:COLORS.surface,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer",
                  border:`2px solid ${unlocked?COLORS.accent:COLORS.border}` }}
                  onClick={() => onNavigate("profile",{streamerId:post.streamerId})}>{post.streamerAvatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, cursor:"pointer" }}
                    onClick={() => onNavigate("profile",{streamerId:post.streamerId})}>{post.streamerName}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                    <span style={{ fontSize:11, color:COLORS.muted }}>{post.timestamp}</span>
                    <span style={{ fontSize:9, color:COLORS.border }}>·</span>
                    <span style={{ fontSize:10, background:tierColor(post.minTier)+"22", color:tierColor(post.minTier),
                      border:`1px solid ${tierColor(post.minTier)}44`, borderRadius:4, padding:"1px 6px", fontWeight:700 }}>
                      {tierLabel(post.minTier)}</span>
                  </div>
                </div>
                <span style={{ fontSize:15, color:COLORS.muted }}>{post.type==="photo"?"📷":post.type==="video"?"🎬":post.type==="poll"?"📊":"💬"}</span>
              </div>

              {(post.type==="photo"||post.type==="video") && (
                <div style={{ height:220, background:post.gradient||COLORS.surface, position:"relative",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {!unlocked ? (
                    <div style={{ position:"absolute", inset:0, backdropFilter:"blur(18px)", background:"rgba(0,0,0,0.55)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <div style={{ fontSize:28 }}>🔒</div>
                      <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{sub?"Upgrade Plan":"Subscribe to Unlock"}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>
                        {post.minTier==="Fan"?"from $4.99/mo":post.minTier==="Super Fan"?"from $9.99/mo":"from $19.99/mo"}</div>
                      <Btn onClick={() => onNavigate("stream-room")} style={{ fontSize:12, padding:"7px 18px" }}>{sub?"Upgrade Plan":"Subscribe"}</Btn>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize:52 }}>{post.streamerAvatar}</div>
                      {post.type==="video" && (
                        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.28)",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.2)",
                            border:"2px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>▶</div>
                          {post.duration && <div style={{ position:"absolute", bottom:10, right:12, background:"rgba(0,0,0,0.7)",
                            borderRadius:4, padding:"2px 8px", fontSize:11, color:"#fff", fontWeight:700 }}>{post.duration}</div>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div style={{ padding:"12px 18px" }}>
                <p style={{ margin:0, fontSize:14, lineHeight:1.7, color:(unlocked||post.type==="text")?COLORS.text:COLORS.muted }}>{post.caption}</p>
                {post.type==="poll" && unlocked && (
                  <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                    {post.pollOptions.map((opt,idx) => {
                      const pct = totalVotes>0?Math.round(opt.votes/totalVotes*100):0;
                      const isVoted=voted===idx, hasVoted=voted!==undefined;
                      return (
                        <div key={idx} onClick={() => !hasVoted && votePoll(post.id,idx)}
                          style={{ cursor:hasVoted?"default":"pointer", border:`2px solid ${isVoted?COLORS.accent:COLORS.border}`,
                            borderRadius:10, padding:"9px 14px", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}>
                          {hasVoted && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`,
                            background:isVoted?COLORS.accent+"33":COLORS.surface, transition:"width 0.5s ease" }} />}
                          <div style={{ position:"relative", display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:13, fontWeight:isVoted?700:400, color:isVoted?COLORS.accent:COLORS.text }}>{opt.text}</span>
                            {hasVoted && <span style={{ fontSize:12, fontWeight:800, color:isVoted?COLORS.accent:COLORS.muted }}>{pct}%</span>}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize:11, color:COLORS.muted }}>{totalVotes.toLocaleString()} votes · {voted!==undefined?"You voted":"Tap to vote"}</div>
                  </div>
                )}
                {post.type==="poll" && !unlocked && (
                  <div style={{ marginTop:12, padding:"10px 14px", background:COLORS.surface, borderRadius:10, textAlign:"center" }}>
                    <span style={{ fontSize:13, color:COLORS.muted }}>🔒 Subscribe to vote</span>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:18, padding:"10px 18px 14px", borderTop:`1px solid ${COLORS.border}` }}>
                <button onClick={() => unlocked && toggleLike(post.id)}
                  style={{ background:"none", border:"none", color:post.liked?COLORS.accent:COLORS.muted,
                    cursor:unlocked?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:6,
                    fontSize:13, fontWeight:post.liked?700:400, opacity:unlocked?1:0.5 }}>
                  {post.liked?"♥":"♡"} {post.likes.toLocaleString()}
                </button>
                <button style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:6, fontSize:13, opacity:unlocked?1:0.5 }}>
                  💬 {post.comments}
                </button>
                <div style={{ flex:1 }} />
                {sub && unlocked && <SubBadge tierName={sub.tierName} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PRIVATE SHOW SCREEN ────────────────────────────────────────────────────────
function PrivateShowScreen({ onNavigate, addToast }) {
  const [phase,     setPhase]     = useState("request");
  const [duration,  setDuration]  = useState(10);
  const [elapsed,   setElapsed]   = useState(0);
  const [balance,   setBalance]   = useState(350);
  const [spent,     setSpent]     = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs,  setChatMsgs]  = useState([
    { from:"Luna Vex", msg:"Hey! Your request just came in 😊 Ready when you are!", me:false }
  ]);
  const timerRef = useRef(null);
  const chatRef  = useRef(null);
  const streamer = STREAMERS.find(s => s.id === 1);
  const RATE = streamer?.privateRate || 30;
  const totalCost = RATE * duration;

  const startShow = () => {
    setPhase("waiting");
    setTimeout(() => {
      setPhase("active");
      addToast("live", `🔒 Private show started with ${streamer.name}!`);
      timerRef.current = setInterval(() => {
        setElapsed(e => { const ne=e+1; if(ne%2===0){setBalance(b=>Math.max(0,b-1));setSpent(s=>s+1);} return ne; });
      }, 1000);
    }, 2800);
  };
  const endShow = () => { if(timerRef.current)clearInterval(timerRef.current); setPhase("summary"); addToast("success",`Private show ended — 🪙 ${spent} tokens spent`); };
  useEffect(() => { if(phase==="active"&&balance<=0)endShow(); }, [balance, phase]);
  useEffect(() => () => { if(timerRef.current)clearInterval(timerRef.current); }, []);

  const sendChat = () => {
    if(!chatInput.trim())return;
    setChatMsgs(m=>[...m,{from:"You",msg:chatInput,me:true}]);
    setChatInput("");
    setTimeout(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},50);
  };
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 20px 48px" }}>
      <button onClick={() => { if(timerRef.current)clearInterval(timerRef.current); onNavigate("stream-room"); }}
        style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:24, fontSize:13 }}>
        ← Back to Stream
      </button>

      {phase==="request" && (
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:18, padding:28 }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>{streamer.avatar}</div>
            <h2 style={{ margin:"0 0 4px", fontWeight:900 }}>Private Show with {streamer.name}</h2>
            <p style={{ color:COLORS.muted, fontSize:13, margin:0 }}>One-on-one, encrypted session</p>
          </div>
          <div style={{ background:COLORS.surface, borderRadius:12, padding:16, marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ color:COLORS.muted, fontSize:13 }}>Rate</span>
              <span style={{ fontWeight:700, color:COLORS.gold }}>🪙 {RATE} tokens/min</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:COLORS.muted, fontSize:13 }}>Your balance</span>
              <span style={{ fontWeight:700 }}>🪙 {balance}</span>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, color:COLORS.muted, fontWeight:600, marginBottom:10 }}>Duration</div>
            <div style={{ display:"flex", gap:8 }}>
              {[5,10,15,30].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{ flex:1, background:duration===d?COLORS.accent:COLORS.surface,
                    border:`1px solid ${duration===d?COLORS.accent:COLORS.border}`,
                    color:duration===d?"#fff":COLORS.muted, borderRadius:10, padding:"10px 4px",
                    cursor:"pointer", fontWeight:700, fontSize:13, transition:"all 0.18s" }}>{d}m</button>
              ))}
            </div>
          </div>
          <div style={{ background:COLORS.accent+"18", border:`1px solid ${COLORS.accent}33`, borderRadius:12,
            padding:14, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:COLORS.accent, fontWeight:600 }}>Estimated cost</span>
            <span style={{ fontWeight:800, fontSize:18, color:COLORS.accent }}>🪙 {totalCost}</span>
          </div>
          {balance < totalCost && (
            <div style={{ background:COLORS.gold+"18", borderRadius:10, padding:12, marginBottom:16, fontSize:12, color:COLORS.gold, textAlign:"center" }}>
              ⚠️ Low balance — show will end early.{" "}
              <button onClick={() => onNavigate("buy-tokens")}
                style={{ background:"none", border:"none", color:COLORS.gold, cursor:"pointer", fontWeight:700, textDecoration:"underline" }}>Top up</button>
            </div>
          )}
          <Btn onClick={startShow} style={{ width:"100%", padding:"13px", fontSize:15, fontWeight:800 }}>🔒 Request Private Show</Btn>
        </div>
      )}

      {phase==="waiting" && (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:52, marginBottom:20 }}>⏳</div>
          <h3 style={{ margin:"0 0 10px" }}>Waiting for {streamer.name}…</h3>
          <p style={{ color:COLORS.muted, fontSize:14 }}>Usually accepts within 30 seconds.</p>
          <div style={{ width:40, height:40, border:`3px solid ${COLORS.border}`, borderTopColor:COLORS.accent,
            borderRadius:"50%", margin:"20px auto 0", animation:"spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </div>
      )}

      {phase==="active" && (
        <>
          <div style={{ background:`linear-gradient(135deg,${streamer.preview},#0a0a1a)`, borderRadius:16, height:240,
            display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
            marginBottom:16, border:`1px solid ${COLORS.border}` }}>
            <div style={{ fontSize:60 }}>{streamer.avatar}</div>
            <div style={{ position:"absolute", top:12, left:12, background:COLORS.accent, borderRadius:6,
              padding:"3px 10px", fontSize:11, fontWeight:800, color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#fff", animation:"blink 1s infinite" }} />PRIVATE
            </div>
            <div style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.7)",
              borderRadius:8, padding:"5px 12px", fontFamily:"monospace", fontWeight:800, fontSize:20, color:"#fff" }}>
              {fmtTime(elapsed)}
            </div>
            <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(0,0,0,0.7)",
              borderRadius:8, padding:"4px 12px", fontSize:12, color:COLORS.gold, fontWeight:700 }}>
              🪙 {balance} left · -{spent} spent
            </div>
          </div>
          <div style={{ background:COLORS.surface, borderRadius:6, height:4, marginBottom:16, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(100,(elapsed/(duration*60))*100)}%`,
              background:`linear-gradient(90deg,${COLORS.accent},${COLORS.accentC})`, transition:"width 1s linear" }} />
          </div>
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:COLORS.muted, padding:"10px 14px", borderBottom:`1px solid ${COLORS.border}` }}>🔒 Private Chat</div>
            <div ref={chatRef} style={{ height:130, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
              {chatMsgs.map((m,i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.me?"flex-end":"flex-start" }}>
                  <div style={{ background:m.me?COLORS.accent:COLORS.surface, color:m.me?"#fff":COLORS.text,
                    borderRadius:10, padding:"7px 12px", maxWidth:"80%", fontSize:13 }}>{m.msg}</div>
                  <span style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>{m.from}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, padding:"10px 12px", borderTop:`1px solid ${COLORS.border}` }}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Message…"
                style={{ flex:1, background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:"8px 12px", color:COLORS.text, fontSize:13, outline:"none" }} />
              <Btn onClick={sendChat} variant="secondary" style={{ fontSize:12, padding:"8px 14px" }}>Send</Btn>
            </div>
          </div>
          <Btn onClick={endShow} variant="secondary" style={{ width:"100%", padding:"12px", color:COLORS.accent, borderColor:COLORS.accent }}>⏹ End Show</Btn>
        </>
      )}

      {phase==="summary" && (
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:18, padding:32, textAlign:"center" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🎭</div>
          <h2 style={{ margin:"0 0 6px", fontWeight:900 }}>Show Complete!</h2>
          <p style={{ color:COLORS.muted, fontSize:14, marginBottom:28 }}>Great session with {streamer.name}!</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:28 }}>
            {[{label:"Duration",value:fmtTime(elapsed)},{label:"Tokens Spent",value:`🪙 ${spent}`},{label:"USD Value",value:`$${(spent*0.10).toFixed(2)}`}].map(s => (
              <div key={s.label} style={{ background:COLORS.surface, borderRadius:12, padding:14 }}>
                <div style={{ fontSize:11, color:COLORS.muted, marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:16, fontWeight:800 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={() => onNavigate("stream-room")} variant="ghost" style={{ flex:1 }}>← Stream Room</Btn>
            <Btn onClick={() => { setPhase("request"); setElapsed(0); setSpent(0); setBalance(350); }} style={{ flex:1 }}>Book Another</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SCHEDULE SCREEN ────────────────────────────────────────────────────────────
function ScheduleScreen({ onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [schedule,      setSchedule]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [showEditor,    setShowEditor]    = useState(false);
  const [editSlots,     setEditSlots]     = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const today = new Date().getDay();
  const HOURS = Array.from({ length: 20 }, (_, i) => i + 6); // 6am–1am
  const ROW_H = 48;

  const SLOT_COLORS = ["#ff2d55","#ff6b35","#4a9edd","#9b59b6","#00e5a0","#f39c12","#27ae60","#e74c3c"];

  const TIME_OPTIONS = Array.from({ length: 18 }, (_, i) => {
    const h = i + 6;
    const label = h > 12 ? `${h-12}:00 pm` : h === 12 ? "12:00 pm" : `${h}:00 am`;
    return { value: h, label };
  });

  const DURATION_OPTIONS = [
    { value: 0.5, label: "30 min" }, { value: 1, label: "1 hr" },
    { value: 1.5, label: "1.5 hrs"}, { value: 2, label: "2 hrs" },
    { value: 2.5, label: "2.5 hrs"}, { value: 3, label: "3 hrs" },
    { value: 4,   label: "4 hrs" }, { value: 5, label: "5 hrs" },
    { value: 6,   label: "6 hrs" },
  ];

  const fmtHour = h => {
    const w = Math.floor(h), m = h % 1 ? "30" : "00";
    return w > 12 ? `${w-12}:${m}pm` : w === 12 ? `12:${m}pm` : `${w}:${m}am`;
  };

  // ── Load schedule from API ─────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
      .then(r => r.json())
      .then(data => { if (data.ok) setSchedule(data.profile?.streamerSchedule || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Editor helpers ─────────────────────────────────────────────────────────
  const openEditor = () => {
    setEditSlots(schedule.map(s => ({ ...s })));
    setShowEditor(true);
  };

  const addSlot = () => setEditSlots(prev => [...prev, {
    id:        `slot_${Date.now()}`,
    day:       1,
    startHour: 20,
    duration:  2,
    title:     "My Stream",
    color:     SLOT_COLORS[prev.length % SLOT_COLORS.length],
  }]);

  const removeSlot = id => setEditSlots(prev => prev.filter(s => s.id !== id));
  const updateSlot = (id, key, val) =>
    setEditSlots(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s));

  const saveSchedule = async () => {
    setSaving(true);
    const token = localStorage.getItem("steamr_token");
    try {
      const r = await fetch("/api/user-profile", {
        method:  "POST",
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
        body:    JSON.stringify({ token, action: "schedule-update", schedule: editSlots }),
      });
      const data = await r.json();
      if (data.ok) { setSchedule(editSlots); setShowEditor(false); setSelectedEvent(null); }
    } catch {}
    setSaving(false);
  };

  // ── Select style helper ────────────────────────────────────────────────────
  const selStyle = { width:"100%", background:COLORS.card, border:`1px solid ${COLORS.border}`,
    borderRadius:8, padding:"8px 10px", color:COLORS.text, fontSize:12,
    outline:"none", cursor:"pointer" };

  if (loading) return (
    <div style={{ textAlign:"center", padding:"80px 24px", color:COLORS.muted }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⏳</div><div>Loading schedule…</div>
    </div>
  );

  return (
    <div style={{ padding:isMobile?"12px":"24px 24px 48px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ margin:"0 0 4px", fontSize:isMobile?20:24, fontWeight:900 }}>📅 Stream Schedule</h2>
            <p style={{ color:COLORS.muted, fontSize:13, margin:0 }}>Your recurring weekly stream times</p>
          </div>
          <Btn onClick={openEditor} style={{ fontSize:13 }}>
            ✏️ {schedule.length === 0 ? "Set Up Schedule" : "Edit Schedule"}
          </Btn>
        </div>

        {/* Empty state or calendar */}
        {schedule.length === 0 ? (
          <Card style={{ textAlign:"center", padding:"60px 24px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>No schedule set yet</div>
            <div style={{ color:COLORS.muted, fontSize:13, marginBottom:24, lineHeight:1.6 }}>
              Set your recurring stream times so followers always know when to tune in
            </div>
            <Btn onClick={openEditor}>✏️ Set Up Your Schedule</Btn>
          </Card>
        ) : (
          <>
            <div style={{ overflowX:"auto" }}>
              <div style={{ minWidth:isMobile?700:800 }}>
                <div style={{ display:"grid", gridTemplateColumns:`56px repeat(7,1fr)`,
                  border:`1px solid ${COLORS.border}`, borderRadius:14, overflow:"hidden", background:COLORS.card }}>

                  {/* Day headers */}
                  <div style={{ background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}` }} />
                  {SCHEDULE_DAYS.map((d, idx) => (
                    <div key={d} style={{ background:idx===today?COLORS.accent+"22":COLORS.surface,
                      borderBottom:`1px solid ${COLORS.border}`, borderLeft:`1px solid ${COLORS.border}`,
                      padding:"8px 4px", textAlign:"center" }}>
                      <div style={{ fontSize:10, color:COLORS.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{d}</div>
                      {idx===today && <div style={{ fontSize:10, color:COLORS.accent, fontWeight:700, marginTop:1 }}>Today</div>}
                    </div>
                  ))}

                  {/* Time rows */}
                  {HOURS.flatMap(hour => [
                    <div key={`tl-${hour}`} style={{ background:COLORS.surface, borderTop:`1px solid ${COLORS.border}`,
                      display:"flex", alignItems:"flex-start", padding:"3px 6px",
                      fontSize:9, color:COLORS.muted, height:ROW_H, boxSizing:"border-box" }}>
                      {hour>12?`${hour-12}pm`:hour===12?"12pm":`${hour}am`}
                    </div>,
                    ...SCHEDULE_DAYS.map((_, dayIdx) => {
                      const events = schedule.filter(e => e.day === dayIdx && Math.floor(e.startHour) === hour);
                      return (
                        <div key={`${hour}-${dayIdx}`}
                          style={{ borderTop:`1px solid ${COLORS.border}22`, borderLeft:`1px solid ${COLORS.border}`,
                            background:dayIdx===today?"rgba(255,45,85,0.04)":"transparent",
                            height:ROW_H, position:"relative", boxSizing:"border-box", padding:2 }}>
                          {events.map(ev => (
                            <div key={ev.id} onClick={() => setSelectedEvent(ev===selectedEvent?null:ev)}
                              style={{ background:ev.color+"dd", borderRadius:5, padding:"2px 5px",
                                cursor:"pointer", fontSize:9, fontWeight:700, color:"#fff",
                                height:`${Math.min(ev.duration*ROW_H-4, ROW_H-4)}px`,
                                overflow:"hidden", lineHeight:1.3,
                                border:"2px solid rgba(255,255,255,0.7)",
                                opacity:selectedEvent&&selectedEvent.id!==ev.id?0.55:1,
                                transition:"opacity 0.15s" }}>
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      );
                    }),
                  ])}
                </div>
              </div>
            </div>

            {/* Selected event detail */}
            {selectedEvent && (
              <div style={{ marginTop:20, background:COLORS.card, border:`1px solid ${selectedEvent.color}55`,
                borderRadius:16, padding:20, display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
                <div style={{ width:50, height:50, borderRadius:"50%", background:selectedEvent.color+"33",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>📅</div>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>{selectedEvent.title}</div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:COLORS.muted }}>🗓 Every {SCHEDULE_DAYS[selectedEvent.day]}</span>
                    <span style={{ fontSize:12, color:COLORS.muted }}>🕐 {fmtHour(selectedEvent.startHour)} · {selectedEvent.duration}h</span>
                    <Pill color={COLORS.accent}>Your Stream</Pill>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={openEditor} variant="secondary" style={{ fontSize:12, padding:"8px 14px" }}>✏️ Edit</Btn>
                  <button onClick={() => setSelectedEvent(null)}
                    style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:18 }}>✕</button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{ marginTop:14, display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.muted }}>
                <div style={{ width:14, height:14, borderRadius:3, border:"2px solid rgba(255,255,255,0.6)", background:"rgba(255,45,85,0.6)" }} />
                Recurring stream slots
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Schedule editor modal ───────────────────────────────────────────── */}
      {showEditor && (
        <div onClick={e => e.target===e.currentTarget && setShowEditor(false)}
          style={{ position:"fixed", inset:0, background:"#000000cc", display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:9000, padding:16, overflowY:"auto" }}>
          <div style={{ background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:20,
            padding:isMobile?20:28, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}>

            {/* Modal header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h3 style={{ margin:0, fontSize:20, fontWeight:800 }}>📅 Weekly Schedule</h3>
              <button onClick={() => setShowEditor(false)}
                style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:22 }}>✕</button>
            </div>

            {/* Slot list */}
            {editSlots.length === 0 ? (
              <div style={{ textAlign:"center", padding:"28px 0", color:COLORS.muted, marginBottom:16 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:13 }}>No time slots yet — add your first stream below</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:16 }}>
                {editSlots.map((slot, idx) => (
                  <div key={slot.id} style={{ background:COLORS.surface, borderRadius:14, padding:16,
                    border:`2px solid ${slot.color}44` }}>

                    {/* Slot header */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <div style={{ width:12, height:12, borderRadius:3, background:slot.color, flexShrink:0 }} />
                        <span style={{ fontWeight:700, fontSize:13, color:COLORS.muted }}>Slot {idx+1}</span>
                      </div>
                      <button onClick={() => removeSlot(slot.id)}
                        style={{ background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontSize:18, lineHeight:1 }}>✕</button>
                    </div>

                    {/* Title input */}
                    <input value={slot.title}
                      onChange={e => updateSlot(slot.id, "title", e.target.value)}
                      placeholder="Stream title…"
                      style={{ width:"100%", background:COLORS.card, border:`1px solid ${COLORS.border}`,
                        borderRadius:8, padding:"9px 12px", color:COLORS.text, fontSize:13,
                        outline:"none", boxSizing:"border-box", marginBottom:10 }} />

                    {/* Day / Time / Duration */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:10, color:COLORS.muted, marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Day</div>
                        <select value={slot.day} onChange={e => updateSlot(slot.id, "day", Number(e.target.value))} style={selStyle}>
                          {SCHEDULE_DAYS.map((d,i) => <option key={d} value={i}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:COLORS.muted, marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Start</div>
                        <select value={slot.startHour} onChange={e => updateSlot(slot.id, "startHour", Number(e.target.value))} style={selStyle}>
                          {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:COLORS.muted, marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Duration</div>
                        <select value={slot.duration} onChange={e => updateSlot(slot.id, "duration", Number(e.target.value))} style={selStyle}>
                          {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Color picker */}
                    <div>
                      <div style={{ fontSize:10, color:COLORS.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Color</div>
                      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                        {SLOT_COLORS.map(c => (
                          <button key={c} onClick={() => updateSlot(slot.id, "color", c)}
                            style={{ width:24, height:24, borderRadius:"50%", background:c, cursor:"pointer",
                              border:slot.color===c?"3px solid #fff":"2px solid transparent",
                              outline:"none", boxSizing:"border-box", transition:"border 0.15s" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add slot button */}
            <Btn onClick={addSlot} variant="secondary" style={{ width:"100%", marginBottom:14 }}>
              + Add Time Slot
            </Btn>

            {/* Save / Cancel */}
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={() => setShowEditor(false)} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
              <Btn onClick={saveSchedule} style={{ flex:2 }} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Schedule"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ── LEADERBOARD SCREEN ────────────────────────────────────────────────────────
function LeaderboardScreen({ onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [period,  setPeriod]  = useState("today");
  const [type,    setType]    = useState("tippers");
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  const data = LEADERBOARD[type][period];
  const PERIODS = [["today","Today"],["weekly","This Week"],["alltime","All Time"]];
  const TYPES   = [["tippers","Top Tippers 🪙"],["streamers","Top Streamers 📡"]];
  const medal = r => r===1?"🥇":r===2?"🥈":r===3?"🥉":"";
  const maxVal = data[0]?.tokens || 1;

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:isMobile?"16px":"24px 24px 48px" }}>
      <h2 style={{ margin:"0 0 4px", fontSize:isMobile?20:24, fontWeight:900 }}>🏆 Leaderboard</h2>
      <p style={{ color:COLORS.muted, fontSize:13, margin:"0 0 24px" }}>Top performers on Steamr</p>

      <div style={{ display:"flex", background:COLORS.surface, borderRadius:10, padding:4, gap:4, marginBottom:16 }}>
        {TYPES.map(([k,label]) => (
          <button key={k} onClick={() => setType(k)}
            style={{ flex:1, background:type===k?COLORS.card:"transparent",
              border:type===k?`1px solid ${COLORS.border}`:"1px solid transparent",
              color:type===k?COLORS.text:COLORS.muted, borderRadius:8, padding:"9px",
              cursor:"pointer", fontWeight:type===k?700:400, fontSize:isMobile?12:13, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      <div style={{ display:"flex", borderBottom:`1px solid ${COLORS.border}`, marginBottom:24 }}>
        {PERIODS.map(([k,label]) => (
          <button key={k} onClick={() => setPeriod(k)}
            style={{ background:"none", border:"none", borderBottom:`2px solid ${period===k?COLORS.gold:"transparent"}`,
              color:period===k?COLORS.gold:COLORS.muted, fontWeight:period===k?700:400,
              padding:"8px 16px", cursor:"pointer", fontSize:13, marginBottom:-1, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      {/* Skeleton */}
      {loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:"13px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <SkeletonBox width={34} height={22} radius={4} />
              <SkeletonBox width={42} height={42} radius={21} />
              <div style={{ flex:1 }}>
                <SkeletonBox height={14} width="50%" style={{ marginBottom:8 }} />
                <SkeletonBox height={4} radius={2} />
              </div>
              <SkeletonBox width={70} height={20} radius={6} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: loading ? "none" : "flex", flexDirection:"column", gap:10 }}>
        {data.map(entry => (
          <div key={entry.rank}
            style={{ background:entry.isYours?COLORS.accent+"18":entry.rank<=3?COLORS.gold+"0a":COLORS.card,
              border:`1px solid ${entry.isYours?COLORS.accent+"66":entry.rank<=3?COLORS.gold+"33":COLORS.border}`,
              borderRadius:14, padding:"13px 18px", transform:entry.rank===1?"scale(1.01)":"none", transition:"transform 0.2s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:34, textAlign:"center", flexShrink:0 }}>
                {medal(entry.rank)?<span style={{ fontSize:22 }}>{medal(entry.rank)}</span>
                  :<span style={{ fontSize:16, fontWeight:800, color:COLORS.muted }}>{entry.rank}</span>}
              </div>
              <div style={{ width:42, height:42, borderRadius:"50%", background:COLORS.surface,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{entry.avatar}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:15 }}>{entry.name}</span>
                  {entry.isYours&&<Pill color={COLORS.accent} style={{ fontSize:9 }}>You</Pill>}
                </div>
                <div style={{ background:COLORS.border, borderRadius:4, height:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(entry.tokens/maxVal)*100}%`,
                    background:entry.rank===1?`linear-gradient(90deg,${COLORS.gold},#ffd700)`:entry.rank===2?"linear-gradient(90deg,#c0c0c0,#aaa)":entry.rank===3?"linear-gradient(90deg,#cd7f32,#a05a20)":`linear-gradient(90deg,${COLORS.accent},${COLORS.accentC})`,
                    transition:"width 0.8s ease", borderRadius:4 }} />
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontWeight:800, fontSize:16, color:entry.rank===1?COLORS.gold:COLORS.text }}>🪙 {entry.tokens.toLocaleString()}</div>
                {type==="streamers"&&entry.viewers&&<div style={{ fontSize:11, color:COLORS.muted }}>👁 {entry.viewers.toLocaleString()}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:28, background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:20, textAlign:"center" }}>
        <p style={{ margin:"0 0 14px", color:COLORS.muted, fontSize:13 }}>
          {type==="tippers"?"Tip more to climb the leaderboard and earn exclusive badges!":"Go live more to grow your fanbase and rank up!"}
        </p>
        <Btn onClick={() => onNavigate(type==="tippers"?"viewer-browse":"go-live")} style={{ fontSize:13 }}>
          {type==="tippers"?"Browse Streams":"🔴 Go Live Now"}
        </Btn>
      </div>
    </div>
  );
}

// ── DISCOVERY SCREEN ──────────────────────────────────────────────────────────
function DiscoveryScreen({ onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [query, setQuery] = useState("");
  const filteredStreamers = query.trim()
    ? STREAMERS.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.tags.some(t=>t.includes(query.toLowerCase())) || s.category.toLowerCase().includes(query.toLowerCase()))
    : [];
  const featured = catName => STREAMERS.filter(s=>s.category===catName&&s.live).slice(0,3);
  const tagSize = count => count>3000?18:count>1500?15:count>800?13:11;

  return (
    <div style={{ padding:isMobile?"16px":"24px 24px 48px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ margin:"0 0 4px", fontSize:isMobile?20:24, fontWeight:900 }}>🔍 Discover</h2>
        <p style={{ color:COLORS.muted, fontSize:13, margin:"0 0 20px" }}>Explore categories, tags, and hidden gems</p>

        <div style={{ position:"relative", marginBottom:28 }}>
          <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:18, color:COLORS.muted, pointerEvents:"none" }}>🔍</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search streamers, tags, categories…"
            style={{ width:"100%", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14,
              padding:"14px 16px 14px 48px", color:COLORS.text, fontSize:16, outline:"none",
              boxSizing:"border-box", transition:"border-color 0.2s" }}
            onFocus={e=>e.target.style.borderColor=COLORS.accent}
            onBlur={e=>e.target.style.borderColor=COLORS.border} />
        </div>

        {query.trim() && (
          <div style={{ marginBottom:28 }}>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:800 }}>
              {filteredStreamers.length} result{filteredStreamers.length!==1?"s":""} for "{query}"
            </h3>
            {filteredStreamers.length===0 ? (
              <p style={{ color:COLORS.muted, fontSize:14 }}>No streams found. Try a different search.</p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
                {filteredStreamers.map(s => (
                  <div key={s.id} onClick={() => s.live?onNavigate("stream-room"):onNavigate("profile",{streamerId:s.id})}
                    style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:14, cursor:"pointer", transition:"all 0.2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=COLORS.accent;e.currentTarget.style.transform="translateY(-2px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=COLORS.border;e.currentTarget.style.transform="none"}}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{s.avatar}</div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:COLORS.muted, marginBottom:6 }}>{s.category}</div>
                    {s.live&&<Pill color={COLORS.accent} style={{ fontSize:9 }}>🔴 LIVE · {s.viewers.toLocaleString()}</Pill>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:800 }}>Browse Categories</h3>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:32 }}>
              {DISCOVERY_CATS.map(cat => (
                <div key={cat.name} onClick={() => onNavigate("viewer-browse")}
                  style={{ background:cat.gradient, borderRadius:14, padding:isMobile?"18px 14px":"22px 16px",
                    cursor:"pointer", position:"relative", overflow:"hidden", transition:"transform 0.2s",
                    boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px) scale(1.02)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{cat.icon}</div>
                  <div style={{ fontWeight:800, fontSize:14, color:"#fff", marginBottom:2 }}>{cat.name}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{cat.count.toLocaleString()} live</div>
                  {cat.hot&&<div style={{ position:"absolute", top:8, right:8, background:"rgba(255,255,255,0.25)", borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#fff" }}>🔥 HOT</div>}
                </div>
              ))}
            </div>

            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:800 }}>🏷️ Trending Tags</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:32 }}>
              {DISCOVERY_TAGS.map(({tag,count,hot}) => (
                <button key={tag} onClick={() => setQuery(tag)}
                  style={{ background:hot?COLORS.accent+"22":COLORS.surface, border:`1px solid ${hot?COLORS.accent+"55":COLORS.border}`,
                    color:hot?COLORS.accent:COLORS.muted, borderRadius:99, cursor:"pointer",
                    padding:`4px ${Math.floor(tagSize(count)/1.5)+8}px`, fontSize:tagSize(count),
                    fontWeight:hot?700:400, transition:"all 0.18s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=COLORS.accent;e.currentTarget.style.color=COLORS.text}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=hot?COLORS.accent+"55":COLORS.border;e.currentTarget.style.color=hot?COLORS.accent:COLORS.muted}}>
                  #{tag}
                </button>
              ))}
            </div>

            {DISCOVERY_CATS.slice(0,4).map(cat => {
              const fs = featured(cat.name); if(!fs.length) return null;
              return (
                <div key={cat.name} style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:800 }}>{cat.icon} {cat.name}</h3>
                    <button onClick={() => onNavigate("viewer-browse")} style={{ background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontSize:13, fontWeight:700 }}>See all →</button>
                  </div>
                  <div style={{ display:"flex", gap:10, overflowX:"auto" }}>
                    {fs.map(s => (
                      <div key={s.id} onClick={() => onNavigate("stream-room")}
                        style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12,
                          padding:12, cursor:"pointer", flexShrink:0, width:140, transition:"all 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=COLORS.accent}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=COLORS.border}>
                        <div style={{ height:65, background:s.preview, borderRadius:8, marginBottom:8,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, position:"relative" }}>
                          {s.avatar}
                          <div style={{ position:"absolute", top:4, left:4 }}><Pill color={COLORS.accent} style={{ fontSize:8 }}>🔴 LIVE</Pill></div>
                        </div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{s.name}</div>
                        <div style={{ fontSize:11, color:COLORS.muted }}>👁 {s.viewers.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES — keyframes for skeleton, tip alerts, onboarding
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// SVG CHART COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function AreaChart({ data, color, height = 120, label }) {
  if (!data || data.length < 2) return null;
  const W = 400, H = height;
  const PL = 6, PR = 6, PT = 8, PB = 6;
  const plotW = W - PL - PR, plotH = H - PT - PB;

  const vals  = data.map(d => d.value);
  const maxV  = Math.max(...vals);
  const minV  = Math.min(...vals) * 0.85;
  const range = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: PL + (i / (data.length - 1)) * plotW,
    y: PT + (1 - (d.value - minV) / range) * plotH,
  }));

  // Smooth cardinal spline
  const smooth = pts.map((p, i, a) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = a[i-1], next = a[i+1] || p;
    const cp1x = (prev.x + p.x) / 2, cp1y = prev.y;
    const cp2x = (prev.x + p.x) / 2, cp2y = p.y;
    return `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  const last  = pts[pts.length - 1];
  const first = pts[0];
  const areaClose = ` L ${last.x.toFixed(1)},${(H-PB).toFixed(1)} L ${first.x.toFixed(1)},${(H-PB).toFixed(1)} Z`;
  const gradId = `ag-${color.replace("#","")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Horizontal grid lines */}
      {[0.25,0.5,0.75].map(t => (
        <line key={t} x1={PL} x2={W-PR}
          y1={PT + (1-t)*plotH} y2={PT + (1-t)*plotH}
          stroke={COLORS.border} strokeWidth="0.6" strokeDasharray="3,3" />
      ))}
      {/* Area fill */}
      <path d={smooth + areaClose} fill={`url(#${gradId})`} />
      {/* Line */}
      <path d={smooth} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* End-point dot */}
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} stroke={COLORS.card} strokeWidth="1.5" />
    </svg>
  );
}

function BarChart({ data, color, height = 100 }) {
  if (!data || !data.length) return null;
  const W = 400, H = height;
  const PL = 6, PR = 6, PT = 8, PB = 6;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const maxV  = Math.max(...data.map(d => d.value));
  const barW  = plotW / data.length;
  const gap   = Math.max(2, barW * 0.18);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      {/* Grid */}
      {[0.33,0.66,1].map(t => (
        <line key={t} x1={PL} x2={W-PR}
          y1={PT + (1-t)*plotH} y2={PT + (1-t)*plotH}
          stroke={COLORS.border} strokeWidth="0.6" strokeDasharray="3,3" />
      ))}
      {data.map((d, i) => {
        const bH  = Math.max(2, (d.value / maxV) * plotH);
        const x   = PL + i * barW + gap;
        const w   = barW - gap * 2;
        const opacity = 0.55 + (d.value / maxV) * 0.45;
        return (
          <rect key={i}
            x={x.toFixed(1)} y={(PT + plotH - bH).toFixed(1)}
            width={Math.max(1,w).toFixed(1)} height={bH.toFixed(1)}
            fill={color} rx="3" opacity={opacity} />
        );
      })}
    </svg>
  );
}

// ── AUDIO METER ──────────────────────────────────────────────────────────────
function AudioMeter({ active, selectedMic }) {
  const [levels,  setLevels] = useState(Array.from({length:14}, () => 0));
  const [micErr,  setMicErr] = useState(false);
  const audioCtxRef          = useRef(null);
  const micStreamRef         = useRef(null);
  const rafRef               = useRef(null);

  useEffect(() => {
    if (!active) {
      // ── Tear down ────────────────────────────────────────────────────────
      if (rafRef.current)       { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
      if (audioCtxRef.current)  { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
      setLevels(Array.from({length:14}, () => 0));
      setMicErr(false);
      return;
    }

    // ── Start real mic analysis ──────────────────────────────────────────
    let cancelled = false;
    (async () => {
      try {
        // Ignore fake static-list IDs like "mic0", "mic1" — use real device IDs only
        const FAKE_IDS = new Set(["mic0","mic1","mic2","mic3"]);
        const audioConstraint = (selectedMic && !FAKE_IDS.has(selectedMic))
          ? { deviceId: { exact: selectedMic } }
          : true;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint, video: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        micStreamRef.current = stream;

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        const source   = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize              = 128;   // 64 frequency bins
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount); // 64 bins

        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(data);
          // Map 14 bars across the lower 48 bins (covers voice + music range)
          const newLevels = Array.from({length:14}, (_, i) => {
            const start = Math.floor(i * 48 / 14);
            const end   = Math.max(start + 1, Math.floor((i + 1) * 48 / 14));
            let sum = 0;
            for (let j = start; j < end; j++) sum += data[j];
            return (sum / (end - start)) / 255;
          });
          setLevels(newLevels);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (_) {
        if (!cancelled) setMicErr(true);
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current)       { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
      if (audioCtxRef.current)  { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    };
  }, [active]);

  if (micErr) return (
    <div style={{ fontSize:10, color:COLORS.accent, flex:1 }}>⚠️ Mic access denied — check browser settings</div>
  );

  return (
    <div style={{ display:"flex", gap:2, alignItems:"center", height:22, flex:1 }}>
      {levels.map((l, i) => (
        <div key={i} style={{
          flex:1, borderRadius:2,
          background: l > 0.75 ? COLORS.accent : COLORS.green,
          height: active ? `${Math.max(3, l * 22)}px` : "3px",
          transition:"height 0.06s ease, background 0.12s",
          opacity: active ? 1 : 0.3,
        }} />
      ))}
    </div>
  );
}

// ── CONNECTION METER ─────────────────────────────────────────────────────────
function ConnectionMeter({ strength = 4 }) {
  return (
    <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:18 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width:5, borderRadius:"2px 2px 0 0",
          height: `${(i+1)*4+2}px`,
          background: i < strength
            ? (strength >= 3 ? COLORS.green : strength >= 2 ? COLORS.gold : COLORS.accent)
            : COLORS.border,
          transition:"background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function AnalyticsScreen({ onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [period,   setPeriod]  = useState("30d");
  const [tab,      setTab]     = useState("earnings");
  const [activity, setActivity] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
      .then(r => r.json())
      .then(data => { if (data.ok) setActivity(data.activity); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Filter daily earnings by selected period ─────────────────────────────
  const allDaily     = activity?.dailyEarnings || [];
  const streamHistory = activity?.streamHistory || [];
  const cutoff       = new Date();
  cutoff.setDate(cutoff.getDate() - (period === "7d" ? 7 : 30));
  const cutoffStr    = cutoff.toISOString().split("T")[0];

  const data         = allDaily.filter(d => d.day >= cutoffStr);
  const streams      = streamHistory.filter(s => s.date >= cutoffStr);

  // ── Period stats ─────────────────────────────────────────────────────────
  const totalTokens  = data.reduce((s, d) => s + (d.tokens || 0), 0);
  const totalUSD     = totalTokens * 0.05;
  const avgTokens    = data.length ? Math.round(totalTokens / data.length) : 0;
  const peakDay      = data.reduce((max, d) => d.tokens > max ? d.tokens : max, 0);
  const streamCount  = streams.length;
  const peakViewers  = streams.reduce((max, s) => (s.peakViewers||0) > max ? (s.peakViewers||0) : max, 0);
  const totalViewers = streams.reduce((s, st) => s + (st.peakViewers || 0), 0);

  // Compare to previous period for delta
  const prevCutoff   = new Date(cutoff);
  prevCutoff.setDate(prevCutoff.getDate() - (period === "7d" ? 7 : 30));
  const prevCutoffStr = prevCutoff.toISOString().split("T")[0];
  const prevData     = allDaily.filter(d => d.day >= prevCutoffStr && d.day < cutoffStr);
  const prevTokens   = prevData.reduce((s, d) => s + (d.tokens || 0), 0);
  const tokenDelta   = prevTokens ? Math.round(((totalTokens - prevTokens) / prevTokens) * 100) : 0;

  // ── Chart data ───────────────────────────────────────────────────────────
  const earningsChartData = [...data].reverse().map(d => ({ label: d.day.slice(5), value: d.tokens }));
  const viewersChartData  = [...streams].reverse().map(s => ({ label: s.date.slice(5), value: s.peakViewers || 0 }));

  const STATS = [
    { label:"Earned",        value:`$${fmtUSD(totalUSD)}`,            sub: prevTokens ? `${tokenDelta >= 0 ? "↑" : "↓"} ${Math.abs(tokenDelta)}% vs prev` : "No prev data",  subColor:tokenDelta>=0?COLORS.green:COLORS.accent, color:COLORS.green,   icon:"💰" },
    { label:"Peak Viewers",  value:peakViewers.toLocaleString(),       sub:`${totalViewers.toLocaleString()} total`,        subColor:COLORS.muted,                              color:COLORS.accent,  icon:"👁" },
    { label:"Avg Daily",     value:`🪙 ${avgTokens.toLocaleString()}`, sub:`$${fmtUSD(avgTokens*0.05)} / day`,             subColor:COLORS.muted,                              color:COLORS.gold,    icon:"📈" },
    { label:"Streams",       value:streamCount.toLocaleString(),       sub:`${activity?.totalStreams||0} all time`,         subColor:COLORS.muted,                              color:COLORS.accentC, icon:"📡" },
  ];

  if (loading) return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"80px 24px", textAlign:"center", color:COLORS.muted }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
      <div>Loading analytics…</div>
    </div>
  );

  const isEmpty = allDaily.length === 0 && streamHistory.length === 0;

  return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"32px 24px 60px" }}>
      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <button onClick={() => onNavigate("streamer-dashboard")}
            style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", fontSize:13, padding:0, marginBottom:6 }}>
            ← Dashboard
          </button>
          <h2 style={{ margin:0, fontSize:24, fontWeight:800 }}>📊 Stream Analytics</h2>
        </div>
        <div style={{ display:"flex", background:COLORS.surface, borderRadius:10, padding:4, border:`1px solid ${COLORS.border}`, gap:2 }}>
          {["7d","30d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              background: period===p ? COLORS.accent : "transparent",
              color:      period===p ? "#fff"         : COLORS.muted,
              border:"none", borderRadius:7, padding:"7px 18px",
              cursor:"pointer", fontWeight:700, fontSize:13, transition:"all 0.18s",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <Card style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📡</div>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>No stream data yet</div>
          <div style={{ color:COLORS.muted, fontSize:13, marginBottom:24 }}>
            Go live and complete a stream to see your analytics here
          </div>
          <Btn onClick={() => onNavigate("go-live")}>🔴 Go Live Now</Btn>
        </Card>
      ) : (
        <>
          {/* ── Summary stat cards ── */}
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {STATS.map(stat => (
              <Card key={stat.label} style={{ padding:"16px 18px" }}>
                <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>
                  {stat.icon} {stat.label}
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:stat.color, marginBottom:4 }}>{stat.value}</div>
                <div style={{ fontSize:11, color:stat.subColor, fontWeight:600 }}>{stat.sub}</div>
              </Card>
            ))}
          </div>

          {/* ── Chart tabs ── */}
          <div style={{ display:"flex", gap:4, marginBottom:16 }}>
            {[["earnings","💰 Earnings"],["viewers","👁 Viewers"]].map(([key,lbl]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                background: tab===key ? COLORS.card  : "transparent",
                color:      tab===key ? COLORS.text  : COLORS.muted,
                border:`1px solid ${tab===key ? COLORS.border : "transparent"}`,
                borderRadius:8, padding:"7px 18px", cursor:"pointer",
                fontWeight:700, fontSize:13, transition:"all 0.18s",
              }}>{lbl}</button>
            ))}
          </div>

          {/* ── Earnings chart ── */}
          {tab === "earnings" && (
            <Card style={{ marginBottom:20, padding:"20px 20px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:16 }}>Earnings Over Time</div>
                  <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>Daily token earnings — {period}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:900, fontSize:20, color:COLORS.green }}>${fmtUSD(totalUSD)}</div>
                  <div style={{ fontSize:11, color:tokenDelta>=0?COLORS.green:COLORS.accent, fontWeight:700 }}>
                    {prevTokens ? `${tokenDelta>=0?"↑":"↓"} ${Math.abs(tokenDelta)}% vs prev period` : "First period"}
                  </div>
                </div>
              </div>

              {earningsChartData.length > 0 ? (
                <>
                  <AreaChart data={earningsChartData} color={COLORS.accent} height={140} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, padding:"0 4px" }}>
                    {[earningsChartData[0], earningsChartData[Math.floor(earningsChartData.length*0.33)],
                      earningsChartData[Math.floor(earningsChartData.length*0.66)], earningsChartData[earningsChartData.length-1]
                    ].filter(Boolean).map((d,i) => (
                      <div key={i} style={{ fontSize:10, color:COLORS.muted }}>{d.label}</div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:16, marginTop:14, paddingTop:14, borderTop:`1px solid ${COLORS.border}`, flexWrap:"wrap" }}>
                    {[
                      { label:"Peak day", value:`🪙 ${peakDay.toLocaleString()}`,          color:COLORS.gold  },
                      { label:"Best USD",  value:`$${fmtUSD(peakDay*0.05)}`,               color:COLORS.green },
                      { label:"Avg/day",   value:`🪙 ${avgTokens.toLocaleString()}`,        color:COLORS.muted },
                    ].map(x => (
                      <div key={x.label} style={{ fontSize:12 }}>
                        <div style={{ color:COLORS.muted, fontSize:10 }}>{x.label}</div>
                        <div style={{ fontWeight:800, color:x.color }}>{x.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height:140, display:"flex", alignItems:"center", justifyContent:"center", color:COLORS.muted, fontSize:13 }}>
                  No streams in this period
                </div>
              )}
            </Card>
          )}

          {/* ── Viewers chart ── */}
          {tab === "viewers" && (
            <Card style={{ marginBottom:20, padding:"20px 20px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:16 }}>Peak Viewers Per Stream</div>
                  <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>Last {streams.length} streams in period</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:900, fontSize:20, color:COLORS.accent }}>{peakViewers.toLocaleString()}</div>
                  <div style={{ fontSize:11, color:COLORS.muted }}>peak viewers</div>
                </div>
              </div>

              {viewersChartData.length > 0 ? (
                <>
                  <BarChart data={viewersChartData} color={COLORS.green} height={130} />
                  <div style={{ display:"flex", marginTop:8 }}>
                    {viewersChartData.map((d,i) => (
                      <div key={i} style={{ flex:1, textAlign:"center", fontSize:8.5, color:COLORS.muted,
                        overflow:"hidden", whiteSpace:"nowrap", padding:"0 1px" }}>
                        {d.label}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height:130, display:"flex", alignItems:"center", justifyContent:"center", color:COLORS.muted, fontSize:13 }}>
                  No streams in this period
                </div>
              )}

              <div style={{ display:"flex", gap:16, marginTop:14, paddingTop:14, borderTop:`1px solid ${COLORS.border}`, flexWrap:"wrap" }}>
                {[
                  { label:"Peak",        value:peakViewers.toLocaleString(),                                        color:COLORS.accent },
                  { label:"Avg/stream",  value:streams.length ? Math.round(totalViewers/streams.length).toLocaleString() : "0", color:COLORS.muted },
                  { label:"Streams",     value:streamCount.toLocaleString(),                                        color:COLORS.green  },
                ].map(x => (
                  <div key={x.label} style={{ fontSize:12 }}>
                    <div style={{ color:COLORS.muted, fontSize:10 }}>{x.label}</div>
                    <div style={{ fontWeight:800, color:x.color }}>{x.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Recent streams table ── */}
          <Card>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:16 }}>📋 Recent Streams</div>
            {streams.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px", color:COLORS.muted, fontSize:13 }}>
                No streams in this period
              </div>
            ) : isMobile ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {streams.map((s, i) => (
                  <div key={i} style={{ padding:"13px", background:COLORS.surface, borderRadius:10, border:`1px solid ${COLORS.border}` }}>
                    <div style={{ fontWeight:700, marginBottom:6 }}>{s.title}</div>
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:12, color:COLORS.muted }}>
                      <span>📅 {s.date}</span>
                      <span>👁 {(s.peakViewers||0).toLocaleString()}</span>
                      <span style={{ color:COLORS.gold }}>🪙 {(s.tokensEarned||0).toLocaleString()}</span>
                      <span>⏱ {s.duration || "—"}</span>
                      <span style={{ color:COLORS.green, fontWeight:700 }}>${fmtUSD((s.tokensEarned||0)*0.05)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"2.2fr 90px 90px 100px 75px 80px",
                  gap:12, padding:"8px 14px", background:COLORS.surface, borderRadius:8, marginBottom:6 }}>
                  {["Stream","Date","Viewers","Tokens","Duration","Earned"].map(h => (
                    <div key={h} style={{ fontSize:10, color:COLORS.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</div>
                  ))}
                </div>
                {streams.map((s, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"2.2fr 90px 90px 100px 75px 80px",
                    gap:12, padding:"11px 14px", borderBottom:`1px solid ${COLORS.border}22`, alignItems:"center" }}>
                    <div style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                    <div style={{ fontSize:12, color:COLORS.muted }}>{s.date}</div>
                    <div style={{ fontSize:13 }}>👁 {(s.peakViewers||0).toLocaleString()}</div>
                    <div style={{ fontSize:13, color:COLORS.gold, fontWeight:700 }}>🪙 {(s.tokensEarned||0).toLocaleString()}</div>
                    <div style={{ fontSize:12, color:COLORS.muted }}>{s.duration || "—"}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:COLORS.green }}>${fmtUSD((s.tokensEarned||0)*0.05)}</div>
                  </div>
                ))}
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// LIVE VIEWER MAP
// ══════════════════════════════════════════════════════════════════════════════
function LiveViewerMap({ viewerCount = 1284 }) {
  return (
    <div style={{background:COLORS.surface, borderRadius:14, border:`1px solid ${COLORS.border}`, overflow:"hidden"}}>
      <div style={{padding:"12px 16px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontWeight:700, fontSize:13}}>🌍 Live Viewers</div>
        <div style={{fontWeight:900, color:COLORS.accent, fontSize:15}}>👁 {viewerCount.toLocaleString()}</div>
      </div>
      {/* Stylized world map */}
      <div style={{position:"relative", height:180, background:"linear-gradient(180deg,#0d1a2e 0%,#071020 100%)"}}>
        <svg viewBox="0 0 800 350" style={{width:"100%", height:"100%", position:"absolute", inset:0}} preserveAspectRatio="xMidYMid meet">
          {/* Simplified continents */}
          <ellipse cx="185" cy="140" rx="88" ry="55" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="240" cy="235" rx="40" ry="48" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="437" cy="98" rx="52" ry="36" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="455" cy="142" rx="48" ry="32" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="475" cy="175" rx="28" ry="28" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="618" cy="144" rx="78" ry="46" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="714" cy="290" rx="52" ry="32" fill="#1a3a4a" opacity="0.7"/>
          <ellipse cx="540" cy="200" rx="28" ry="40" fill="#1a3a4a" opacity="0.5"/>
        </svg>
        {/* Viewer pulse dots */}
        {VIEWER_LOCATIONS.map((loc, i) => {
          const sz = Math.max(6, Math.min(14, loc.viewers / 28));
          return (
            <div key={i} title={`${loc.country}: ${loc.viewers}`} style={{
              position:"absolute",
              left:`${(loc.x/800)*100}%`, top:`${(loc.y/350)*100}%`,
              width:sz, height:sz, borderRadius:"50%",
              background:COLORS.accent,
              boxShadow:`0 0 ${sz+2}px ${COLORS.accent}cc`,
              transform:"translate(-50%,-50%)",
              animation:`pulse ${1.8 + i*0.15}s ease-in-out infinite`,
            }}/>
          );
        })}
      </div>
      {/* Country list */}
      <div style={{padding:"8px 16px"}}>
        {VIEWER_LOCATIONS.slice(0,5).map((loc,i) => (
          <div key={i} style={{display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:11}}>
            <span style={{color:COLORS.muted}}>{loc.country}</span>
            <span style={{fontWeight:700}}>{loc.viewers}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS CENTER SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function NotificationsCenterScreen({ onNavigate }) {
  const [tab,    setTab]    = useState("all");
  const [notifs, setNotifs] = useState([]);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState("");

  const TYPE_ICON  = {tip:"💰", follow:"❤️", sub:"⭐", payout:"💸", system:"⚙️", ppv:"🎬", gift:"🎁", verified:"✅", live:"🔴"};
  const TYPE_COLOR = {tip:COLORS.gold, follow:COLORS.accent, sub:COLORS.accentC, payout:COLORS.green, system:COLORS.muted, ppv:COLORS.accentB, gift:COLORS.gold, verified:COLORS.green, live:COLORS.accent};

  const TABS = [
    {key:"all",      label:"All"},
    {key:"tip",      label:"💰 Tips"},
    {key:"follow",   label:"❤️ Follows"},
    {key:"sub",      label:"⭐ Subs"},
    {key:"verified", label:"✅ Account"},
    {key:"system",   label:"⚙️ System"},
  ];

  // Load notifications from API
  const loadNotifications = () => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); setError("Please log in to view notifications."); return; }

    fetch("/api/notifications", {
      headers: { "x-auth-token": token },
    })
    .then(r => r.json())
    .then(data => {
      if (data.ok) { setNotifs(data.notifications); }
      else { setError(data.error || "Could not load notifications."); }
      setLoading(false);
    })
    .catch(() => { setError("Could not connect."); setLoading(false); });
  };

  useEffect(() => { loadNotifications(); }, []);

  const markAllRead = () => {
    const token = localStorage.getItem("steamr_token");
    fetch("/api/notifications", {
      method:  "PATCH",
      headers: { "x-auth-token": token, "Content-Type": "application/json" },
      body:    JSON.stringify({ token, markAllRead: true }),
    }).then(() => setNotifs(ns => ns.map(n => ({ ...n, read: true }))));
  };

  const markRead = (id) => {
    const token = localStorage.getItem("steamr_token");
    fetch("/api/notifications", {
      method:  "PATCH",
      headers: { "x-auth-token": token, "Content-Type": "application/json" },
      body:    JSON.stringify({ token, notificationId: id }),
    }).then(() => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n)));
  };

  const filtered = tab === "all" ? notifs : notifs.filter(n => n.type === tab);
  const unread   = notifs.filter(n => !n.read).length;

  // Group by date
  const groupNotif = (n) => {
    const d    = new Date(n.time);
    const now  = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff < 1)  return "Today";
    if (diff < 2)  return "Yesterday";
    if (diff < 7)  return "This Week";
    return "Earlier";
  };

  const groups = [...new Set(filtered.map(groupNotif))];

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:24, fontWeight:900 }}>
          Notifications
          {unread > 0 && <span style={{ marginLeft:8, fontSize:13, fontWeight:700, color:COLORS.accent, background:COLORS.accent+"22", borderRadius:12, padding:"2px 9px" }}>{unread}</span>}
        </h2>
        {unread > 0 && <button onClick={markAllRead} style={{ background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontSize:13, fontWeight:700 }}>Mark all read</button>}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, overflowX:"auto", paddingBottom:2 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background:tab===t.key?COLORS.accent:COLORS.surface,
            color:tab===t.key?"#fff":COLORS.muted,
            border:`1px solid ${tab===t.key?COLORS.accent:COLORS.border}`,
            borderRadius:8, padding:"7px 13px", cursor:"pointer",
            fontWeight:700, fontSize:12, whiteSpace:"nowrap", transition:"all 0.18s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:"center", padding:"48px 24px", color:COLORS.muted }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
          <div>Loading notifications...</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ textAlign:"center", padding:"48px 24px", color:COLORS.muted }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"64px 24px", color:COLORS.muted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
          <div style={{ fontWeight:700, fontSize:16 }}>All caught up!</div>
          <div style={{ fontSize:13, marginTop:6 }}>No notifications yet — activity will appear here</div>
        </div>
      )}

      {/* Grouped notifications */}
      {!loading && !error && groups.map(group => (
        <div key={group} style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:10 }}>{group}</div>
          {filtered.filter(n => groupNotif(n) === group).map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"13px 16px", marginBottom:6,
              background:n.read?COLORS.surface:COLORS.card,
              border:`1px solid ${n.read?COLORS.border:COLORS.accent+"33"}`,
              borderLeft:`3px solid ${n.read?"transparent":TYPE_COLOR[n.type]||COLORS.muted}`,
              borderRadius:12, cursor:"pointer", transition:"all 0.18s",
            }}>
              <div style={{
                width:40, height:40, borderRadius:"50%", flexShrink:0,
                background:(TYPE_COLOR[n.type]||COLORS.muted)+"22",
                border:`1px solid ${(TYPE_COLOR[n.type]||COLORS.muted)}44`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
              }}>{TYPE_ICON[n.type]||"📣"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:n.read?400:700, marginBottom:3, color:COLORS.text, lineHeight:1.4 }}>{n.message}</div>
                <div style={{ fontSize:11, color:COLORS.muted }}>{new Date(n.time).toLocaleString()}</div>
              </div>
              {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS.accent, flexShrink:0 }}/>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SEARCH RESULTS SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function SearchResultsScreen({ onNavigate, initialQuery = "" }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [query,  setQuery]  = useState(initialQuery);
  const [filter, setFilter] = useState("all");

  const FILTERS = ["all","live","music","gaming","asmr","fitness","couples"];

  const results = STREAMERS.filter(s => {
    const q  = query.toLowerCase().trim();
    const ok = !q || s.name.toLowerCase().includes(q) ||
      (s.tags  && s.tags.some (t => t.toLowerCase().includes(q))) ||
      (s.category && s.category.toLowerCase().includes(q));
    const lf = filter === "all"  ? true
             : filter === "live" ? s.live
             : (s.tags && s.tags.some(t => t.toLowerCase() === filter)) ||
               (s.category && s.category.toLowerCase() === filter);
    return ok && lf;
  });

  const TRENDING = TRENDING_TAGS?.slice(0,14) || ["music","asmr","gaming","chill","requests"];

  return (
    <div style={{maxWidth:960, margin:"0 auto", padding:"32px 24px 60px"}}>
      {/* Search bar */}
      <div style={{position:"relative", marginBottom:20}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:18,color:COLORS.muted,pointerEvents:"none"}}>🔍</span>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search streamers, categories, tags…"
          autoFocus
          style={{width:"100%",background:COLORS.surface,border:`2px solid ${COLORS.accent}`,borderRadius:14,padding:"14px 48px 14px 48px",color:COLORS.text,fontSize:15,outline:"none",boxSizing:"border-box",transition:"border 0.2s"}}
        />
        {query && <button onClick={() => setQuery("")} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:COLORS.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>}
      </div>

      {/* Trending tags (no query) */}
      {!query.trim() && (
        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:700,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>🔥 Trending</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {TRENDING.map(tag => (
              <button key={tag} onClick={() => setQuery(tag)} style={{background:COLORS.surface,border:`1px solid ${COLORS.border}`,borderRadius:20,padding:"7px 16px",cursor:"pointer",color:COLORS.text,fontSize:13,fontWeight:600,transition:"all 0.15s"}}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div style={{display:"flex",gap:4,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background:filter===f?COLORS.accent:COLORS.surface,
            color:filter===f?"#fff":COLORS.muted,
            border:`1px solid ${filter===f?COLORS.accent:COLORS.border}`,
            borderRadius:8,padding:"7px 14px",cursor:"pointer",
            fontWeight:700,fontSize:12,whiteSpace:"nowrap",transition:"all 0.18s",textTransform:"capitalize",
          }}>{f==="live"?"🔴 Live":f==="all"?"All":f}</button>
        ))}
      </div>

      {/* Count */}
      {query.trim() && <div style={{fontSize:13,color:COLORS.muted,marginBottom:14}}>{results.length} result{results.length!==1?"s":""} for "<strong style={{color:COLORS.text}}>{query}</strong>"</div>}

      {/* Grid */}
      {results.length > 0 ? (
        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?"160px":"260px"},1fr))`,gap:14}}>
          {results.map(s => <StreamCard key={s.id} streamer={s} onClick={() => onNavigate("stream-room",{streamerId:s.id})} />)}
        </div>
      ) : query.trim() ? (
        <div style={{textAlign:"center",padding:"56px 24px",color:COLORS.muted}}>
          <div style={{fontSize:40,marginBottom:12}}>🔍</div>
          <div style={{fontWeight:700,fontSize:16}}>No results for "{query}"</div>
          <div style={{fontSize:13,marginTop:8}}>Try different keywords or remove the filter</div>
        </div>
      ) : null}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EARNINGS SCREEN (Streamer)
// ══════════════════════════════════════════════════════════════════════════════
function EarningsScreen({ onNavigate }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [period,     setPeriod]     = useState("30d");
  const [showPayout, setShowPayout] = useState(false);
  const [payoutSent, setPayoutSent] = useState(false);
  const [activity,   setActivity]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cashoutAmt, setCashoutAmt] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
      .then(r => r.json())
      .then(data => { if (data.ok) setActivity(data.activity); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const daily          = activity?.dailyEarnings || [];
  const payoutHistory  = activity?.payoutHistory  || [];
  const availableTokens = activity?.availableTokens || 0;
  const subscribers    = activity?.subscribers     || 0;
  const availableUSD   = availableTokens * 0.05;

  // Period filter
  const cutoff    = new Date();
  cutoff.setDate(cutoff.getDate() - (period === "7d" ? 7 : period === "30d" ? 30 : 90));
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const filtered  = daily.filter(d => d.day >= cutoffStr);

  const periodUSD  = filtered.reduce((s, d) => s + (d.tokens || 0) * 0.05, 0);
  const totalEver  = daily.reduce((s, d) => s + (d.tokens || 0) * 0.05, 0);
  const chartData  = [...filtered].reverse().map(d => ({ label: d.day.slice(5), value: d.tokens * 0.05 }));

  const STATS = [
    { label:"Total Earned", value:`$${fmtUSD(totalEver)}`,      icon:"💸", color:COLORS.gold    },
    { label:"This Period",  value:`$${fmtUSD(periodUSD)}`,      icon:"📅", color:COLORS.green   },
    { label:"Available",    value:`$${fmtUSD(availableUSD)}`,   icon:"⏳", color:COLORS.accent  },
    { label:"Subscribers",  value:subscribers.toLocaleString(), icon:"⭐", color:COLORS.accentC },
  ];

  if (loading) return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"80px 24px",textAlign:"center",color:COLORS.muted}}>
      <div style={{fontSize:36,marginBottom:12}}>⏳</div>
      <div>Loading earnings…</div>
    </div>
  );

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px 60px"}}>      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <button onClick={() => onNavigate("streamer-dashboard")}
            style={{background:"none",border:"none",color:COLORS.muted,cursor:"pointer",fontSize:13,padding:0,marginBottom:6}}>
            ← Dashboard
          </button>
          <h2 style={{margin:0,fontSize:24,fontWeight:900}}>💰 Earnings & Payouts</h2>
        </div>
        <Btn onClick={()=>setShowPayout(true)} variant="green" style={{fontSize:13}}
          disabled={availableUSD < 20}>
          {availableUSD >= 20 ? "Request Payout" : `Need $${fmtUSD(20 - availableUSD)} more`}
        </Btn>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {STATS.map(s=>(
          <Card key={s.label} style={{padding:"16px"}}>
            <div style={{fontSize:11,color:COLORS.muted,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}}>{s.icon} {s.label}</div>
            <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card style={{marginBottom:24,padding:"20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14}}>Earnings Over Time</div>
          <div style={{display:"flex",gap:4}}>
            {["7d","30d","90d"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{background:period===p?COLORS.accent:COLORS.surface,color:period===p?"#fff":COLORS.muted,border:`1px solid ${period===p?COLORS.accent:COLORS.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700,transition:"all 0.18s"}}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <AreaChart data={chartData} color={COLORS.gold} height={130} label="USD" />
        ) : (
          <div style={{height:130,display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.muted,fontSize:13}}>
            No earnings in this period — go live to start earning!
          </div>
        )}
      </Card>

      {/* Payout history */}
      <Card>
        <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Payout History</div>
        {payoutHistory.length === 0 ? (
          <div style={{textAlign:"center",padding:"24px",color:COLORS.muted,fontSize:13}}>
            No payouts yet — reach $20 to request your first payout
          </div>
        ) : payoutHistory.map((p, i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${COLORS.border}22`}}>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{p.date}</div>
              <div style={{fontSize:11,color:COLORS.muted}}>Bank Transfer</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,color:COLORS.green,fontSize:15}}>${fmtUSD(p.amount)}</div>
              <div style={{fontSize:11,color:p.status==="pending"?COLORS.gold:COLORS.green}}>
                {p.status==="pending" ? "⏳ Processing" : "✓ Paid"}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Payout modal */}
      {showPayout && (
        <div onClick={e=>e.target===e.currentTarget&&setShowPayout(false)}
          style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000,padding:16}}>
          <Card style={{maxWidth:380,width:"100%",padding:"28px"}}>
            {!payoutSent ? (<>
              <h3 style={{margin:"0 0 16px",fontWeight:800}}>Request Payout</h3>
              <div style={{background:COLORS.green+"18",border:`1px solid ${COLORS.green}44`,borderRadius:12,padding:"16px",marginBottom:16}}>
                <div style={{fontSize:12,color:COLORS.muted}}>Available to withdraw</div>
                <div style={{fontSize:30,fontWeight:900,color:COLORS.green}}>${fmtUSD(availableUSD)}</div>
                <div style={{fontSize:11,color:COLORS.muted,marginTop:4}}>🪙 {availableTokens.toLocaleString()} tokens × $0.05</div>
              </div>
              <Input label="Amount ($)" value={cashoutAmt} onChange={setCashoutAmt}
                placeholder={`e.g. ${fmtUSD(availableUSD)}`} />
              {Number(cashoutAmt) > 0 && Number(cashoutAmt) < 20 && (
                <div style={{fontSize:11,color:COLORS.accent,marginBottom:8}}>⚠️ Minimum withdrawal is $20.00</div>
              )}
              <div style={{fontSize:12,color:COLORS.muted,lineHeight:1.7,marginBottom:16}}>
                Processed within 2–3 business days.
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn onClick={()=>setShowPayout(false)} variant="ghost" style={{flex:1}}>Cancel</Btn>
                <Btn onClick={async () => {
                  const requestedAmt = cashoutAmt ? Number(cashoutAmt) : availableUSD;
                  if (requestedAmt < 20) return;
                  const token = localStorage.getItem("steamr_token");
                  const r = await fetch("/api/user-profile", {
                    method:"POST",
                    headers:{"x-auth-token":token,"Content-Type":"application/json"},
                    body:JSON.stringify({token,action:"payout-request",amountUSD:requestedAmt}),
                  });
                  const data = await r.json();
                  if (data.ok) {
                    setPayoutSent(true);
                    // Refresh activity
                    fetch("/api/user-profile",{headers:{"x-auth-token":token}})
                      .then(r2=>r2.json()).then(d2=>{if(d2.ok)setActivity(d2.activity);}).catch(()=>{});
                  }
                }} variant="green" style={{flex:1}}>Confirm</Btn>
              </div>
            </>) : (<>
              <div style={{textAlign:"center",padding:"16px 0"}}>
                <div style={{fontSize:48,marginBottom:12}}>✅</div>
                <h3 style={{margin:"0 0 8px",color:COLORS.green}}>Payout Requested!</h3>
                <p style={{color:COLORS.muted,fontSize:13,marginBottom:20}}>
                  Your payout will arrive within 2–3 business days.
                </p>
                <Btn onClick={()=>{setShowPayout(false);setPayoutSent(false);setCashoutAmt("");}} style={{width:"100%"}}>Done</Btn>
              </div>
            </>)}
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PPV CONTENT SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function PPVContentScreen({ onNavigate, viewerTokens = 350, onSpendTokens }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [tab, setTab]             = useState("videos");
  const [buying, setBuying]       = useState(null);
  const [purchasedIds, setPurchased] = useState(new Set());
  const [loading, setLoading]     = useState(true);

  // Load purchased IDs from Upstash on mount
  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok && Array.isArray(data.activity?.ppvPurchased)) {
        setPurchased(new Set(data.activity.ppvPurchased));
      }
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  const confirmPurchase = (item) => {
    onSpendTokens && onSpendTokens(item.price);
    const newSet = new Set([...purchasedIds, `${tab}:${item.id}`]);
    setPurchased(newSet);
    setBuying(null);
    // Save to Upstash
    const token = localStorage.getItem("steamr_token");
    if (token) {
      fetch("/api/user-profile", {
        method: "POST",
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "ppv-purchase", itemId: `${tab}:${item.id}`, item: { id: item.id, tab, title: item.title, streamer: item.streamer, price: item.price, purchasedAt: new Date().toISOString() } }),
      }).catch(() => {});
    }
  };

  const isPurchased = (item) => purchasedIds.has(`${tab}:${item.id}`);

  const ContentCard = ({item, isMini=false}) => {
    const bought = isPurchased(item);
    return (
      <div style={{background:COLORS.card,border:`1px solid ${COLORS.border}`,borderRadius:16,overflow:"hidden",transition:"transform 0.2s",cursor:"pointer"}}>
        <div style={{height:isMini?80:148,background:`linear-gradient(135deg,${COLORS.surface},${COLORS.bg})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{fontSize:isMini?36:52}}>{item.thumbnail}</div>
          <div style={{position:"absolute",top:8,right:8,background:COLORS.green+"cc",borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:800,color:"#fff"}}>✓ Owned</div>
          {item.duration && <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.7)",borderRadius:4,padding:"2px 7px",fontSize:10,color:COLORS.muted}}>{item.duration}</div>}
        </div>
        <div style={{padding:"12px 14px"}}>
          <div style={{fontSize:11,color:COLORS.muted,marginBottom:4}}>{item.avatar} {item.streamer} · {item.category}</div>
          <div style={{fontWeight:700,fontSize:13,lineHeight:1.4,marginBottom:10}}>{item.title}</div>
          <Btn style={{width:"100%",fontSize:12}} variant="secondary">▶ Watch Now</Btn>
        </div>
      </div>
    );
  };

  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px 60px"}}>
      <h2 style={{margin:"0 0 4px",fontSize:24,fontWeight:900}}>🎬 My Content</h2>
      <p style={{color:COLORS.muted,fontSize:14,marginBottom:20}}>Videos and clips you own — purchased or unlocked via subscription.</p>

      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {[{k:"videos",l:"🎬 Videos"},{k:"clips",l:"✂️ Clips"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{background:tab===t.k?COLORS.accent:COLORS.surface,color:tab===t.k?"#fff":COLORS.muted,border:`1px solid ${tab===t.k?COLORS.accent:COLORS.border}`,borderRadius:8,padding:"8px 18px",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all 0.18s"}}>
            {t.l}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{fontSize:13,color:COLORS.muted,display:"flex",alignItems:"center"}}>Balance: <strong style={{color:COLORS.gold,marginLeft:4}}>🪙 {viewerTokens?.toLocaleString()}</strong></div>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:"60px 24px",color:COLORS.muted}}>
          <div style={{fontSize:32,marginBottom:12}}>⏳</div>
          <div>Loading your content…</div>
        </div>
      ) : (() => {
        const allItems   = tab==="videos" ? PPV_CONTENT : CLIP_PURCHASES;
        const ownedItems = allItems.filter(item => isPurchased(item));

        if (ownedItems.length === 0) return (
          <div style={{textAlign:"center",padding:"64px 24px",color:COLORS.muted}}>
            <div style={{fontSize:52,marginBottom:16}}>🎬</div>
            <div style={{fontWeight:800,fontSize:18,marginBottom:8,color:COLORS.text}}>
              No {tab==="videos"?"videos":"clips"} yet
            </div>
            <div style={{fontSize:14,color:COLORS.muted,lineHeight:1.7,marginBottom:24}}>
              {tab==="videos"
                ? "Subscribe to a streamer or purchase exclusive videos to see them here."
                : "Subscribe to a streamer or purchase exclusive clips to see them here."}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <Btn onClick={() => onNavigate("viewer-browse")} variant="secondary">Browse Streamers</Btn>
            </div>
          </div>
        );

        return (
          <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?"160px":"256px"},1fr))`,gap:14}}>
            {ownedItems.map(item=>(
              <ContentCard key={item.id} item={item} isMini={isMobile}/>
            ))}
          </div>
        );
      })()}

      {/* Purchase modal */}
      {buying && (
        <div onClick={e=>e.target===e.currentTarget&&setBuying(null)} style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000,padding:16}}>
          <Card style={{maxWidth:380,width:"100%",overflow:"hidden",padding:0}}>
            <div style={{height:100,background:`linear-gradient(135deg,${COLORS.surface},${COLORS.bg})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:50}}>{buying.thumbnail}</div>
            <div style={{padding:"20px 22px"}}>
              <div style={{fontSize:11,color:COLORS.muted,marginBottom:4}}>{buying.avatar} {buying.streamer}</div>
              <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>{buying.title}</div>
              <div style={{display:"flex",justifyContent:"space-between",background:COLORS.surface,borderRadius:10,padding:"11px 14px",marginBottom:10,fontSize:13}}>
                <span style={{color:COLORS.muted}}>Price</span><span style={{fontWeight:800,color:COLORS.gold}}>🪙 {buying.price}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:COLORS.muted,marginBottom:16}}>
                <span>Your balance</span>
                <span style={{fontWeight:700,color:viewerTokens>=buying.price?COLORS.green:"#ff4444"}}>🪙 {viewerTokens?.toLocaleString()}</span>
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn onClick={()=>setBuying(null)} variant="ghost" style={{flex:1}}>Cancel</Btn>
                <Btn onClick={()=>confirmPurchase(buying)} variant="gold" style={{flex:1}} disabled={viewerTokens<buying.price}>
                  {viewerTokens>=buying.price?"Unlock Now":"Need More Tokens"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GIFT CARD SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function GiftCardScreen({ onNavigate }) {
  const [selected, setSelected]  = useState(2);
  const [email, setEmail]        = useState("");
  const [message, setMessage]    = useState("");
  const [sent, setSent]          = useState(false);

  const pack = GIFT_CARD_AMOUNTS.find(g => g.id === selected);

  if (sent) return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>🎁</div>
      <h2 style={{margin:"0 0 10px",fontWeight:900,color:COLORS.gold}}>Gift Card Sent!</h2>
      <p style={{color:COLORS.muted,fontSize:14,marginBottom:28}}>
        🪙 {pack?.tokens.toLocaleString()} tokens sent to <strong style={{color:COLORS.text}}>{email}</strong>.
      </p>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={()=>onNavigate("viewer-browse")}>Browse Streams</Btn>
        <Btn onClick={()=>setSent(false)} variant="secondary">Send Another</Btn>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:540,margin:"0 auto",padding:"48px 24px 60px"}}>
      <button onClick={()=>onNavigate("viewer-browse")} style={{background:"none",border:"none",color:COLORS.muted,cursor:"pointer",marginBottom:24,fontSize:13}}>← Back</button>
      <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:900}}>🎁 Gift Cards</h2>
      <p style={{color:COLORS.muted,fontSize:14,marginBottom:24}}>Give the gift of tokens to a friend or loved one.</p>

      {/* Pack selection */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
        {GIFT_CARD_AMOUNTS.map(g=>(
          <div key={g.id} onClick={()=>setSelected(g.id)} style={{
            border:`2px solid ${selected===g.id?g.color:COLORS.border}`,
            borderRadius:14,padding:"16px",cursor:"pointer",position:"relative",
            background:selected===g.id?g.color+"14":COLORS.card,transition:"all 0.2s",
          }}>
            {g.popular && <div style={{position:"absolute",top:-10,right:12,background:COLORS.accent,color:"#fff",fontSize:9,fontWeight:800,borderRadius:20,padding:"3px 9px"}}>POPULAR</div>}
            <div style={{fontSize:28,marginBottom:8}}>{g.icon}</div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:COLORS.muted}}>{g.label}</div>
            <div style={{fontWeight:900,color:g.color,fontSize:20}}>🪙 {g.tokens.toLocaleString()}</div>
            <div style={{fontSize:12,color:COLORS.muted,marginTop:4}}>${fmtUSD(g.price)}</div>
          </div>
        ))}
      </div>

      {/* Recipient */}
      <Card style={{marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Recipient</div>
        <Input label="Email Address" value={email} onChange={setEmail} placeholder="friend@example.com" />
        <div>
          <label style={{display:"block",marginBottom:6,fontSize:13,color:COLORS.muted,fontWeight:600}}>Personal Message <span style={{fontWeight:400}}>(optional)</span></label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)}
            placeholder="Happy birthday! Enjoy the tokens 🎉"
            rows={2}
            style={{width:"100%",background:COLORS.surface,border:`1px solid ${COLORS.border}`,borderRadius:9,padding:"9px 12px",color:COLORS.text,fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}
          />
        </div>
      </Card>

      {/* Card preview */}
      <div style={{borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",marginBottom:20,boxShadow:"0 6px 28px rgba(0,0,0,0.4)"}}>
        <div style={{background:`linear-gradient(135deg,${COLORS.accent},${COLORS.accentB})`,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>💋 steamr</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",marginTop:2}}>Gift Card — {pack?.label}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:26,fontWeight:900,color:"#fff"}}>🪙 {pack?.tokens.toLocaleString()}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.65)"}}>${fmtUSD(pack?.price||0)} value</div>
          </div>
        </div>
        {message && (
          <div style={{background:"rgba(255,255,255,0.04)",padding:"12px 22px",fontSize:13,color:COLORS.muted,fontStyle:"italic"}}>"{message}"</div>
        )}
      </div>

      <Btn onClick={()=>email&&setSent(true)} variant="gold" style={{width:"100%",fontSize:15,padding:"14px",fontWeight:900}} disabled={!email}>
        🎁 Send Gift Card · ${fmtUSD(pack?.price||0)}
      </Btn>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// VIEWER DASHBOARD SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ViewerDashboardScreen({ onNavigate, viewerTokens = 350, following, subscriptions = {}, addToast }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [profile,  setProfile]  = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) return;
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok) { setProfile(data.profile); setActivity(data.activity); }
    })
    .catch(() => {});

    // Fallback: fill from localStorage immediately
    try {
      const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
      if (session?.name) setProfile(p => p || { name: session.name, displayName: session.name, username: session.email?.split("@")[0], avatarImg: null });
    } catch {}
  }, []);

  const name        = profile?.displayName || profile?.name || "Viewer";
  const username    = profile?.username    || "";
  const joinDate    = profile?.joinDate    || "";
  const avatarImg   = profile?.avatarImg   || null;
  const tipsCount   = activity?.tipsCount  || 0;
  const totalSpent  = activity?.totalSpent || 0;
  const tipHistory  = activity?.tipHistory || [];
  const achievements = activity?.achievements || [];

  const subCount    = Object.keys(subscriptions).length;
  const followCount = following?.size || 0;

  // Real live streamers — fetched from API
  const [liveFollowed,  setLiveFollowed]  = useState([]);
  const [recommended,   setRecommended]   = useState([]);
  const [subProfiles,   setSubProfiles]   = useState({});
  const [liveLoading,   setLiveLoading]   = useState(true);

  useEffect(() => {
    // Fetch live followed streamers
    const token = localStorage.getItem("steamr_token");
    const headers = token ? { "x-auth-token": token } : {};
    setLiveLoading(true);
    fetch("/api/live-streamers", { headers })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          const followedIds = following || new Set();
          setLiveFollowed((data.streamers || []).filter(s => followedIds.has(s.id)));
          setRecommended((data.streamers || []).filter(s => !followedIds.has(s.id)).slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLiveLoading(false));
  }, [following]);

  // Fetch profiles for subscribed streamers so we can show real names
  useEffect(() => {
    const ids = Object.keys(subscriptions);
    if (ids.length === 0) return;
    const token = localStorage.getItem("steamr_token");
    ids.forEach(id => {
      fetch(`/api/user-profile?id=${id}`, { headers: { "x-auth-token": token || "" } })
        .then(r => r.json())
        .then(data => {
          if (data.ok) setSubProfiles(prev => ({ ...prev, [id]: data.profile }));
        })
        .catch(() => {});
    });
  }, [subscriptions]);

  const STATS = [
    { label:"Token Balance", value:`🪙 ${viewerTokens.toLocaleString()}`, color:COLORS.gold,    action:() => onNavigate("buy-tokens"),    cta:"Top Up"  },
    { label:"Following",     value:followCount,                            color:COLORS.accent,  action:() => onNavigate("viewer-profile"), cta:"View"    },
    { label:"Subscriptions", value:subCount,                               color:COLORS.accentC, action:() => onNavigate("viewer-profile"), cta:"View"    },
    { label:"Tips Sent",     value:tipsCount,                              color:COLORS.green,   action:() => onNavigate("viewer-profile"), cta:"History" },
  ];

  return (
    <div style={{ maxWidth:980, margin:"0 auto", padding:isMobile?"20px 16px 60px":"32px 24px 60px" }}>

      {/* Greeting Hero */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:COLORS.card, border:`2px solid ${COLORS.border}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, overflow:"hidden", flexShrink:0 }}>
            {avatarImg ? <img src={avatarImg} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : "🦇"}
          </div>
          <div>
            <div style={{ fontSize:isMobile?18:22, fontWeight:900 }}>{greeting}, {name} 👋</div>
            <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>
              {username && `@${username}`}{joinDate && ` · Member since ${joinDate}`}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn onClick={() => onNavigate("viewer-edit-profile")} variant="secondary" style={{ fontSize:12, padding:"8px 14px" }}>✏️ Edit Profile</Btn>
          <Btn onClick={() => onNavigate("viewer-browse")} style={{ fontSize:12, padding:"8px 14px" }}>Browse Live →</Btn>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:10, marginBottom:28 }}>
        {STATS.map(s => (
          <div key={s.label} onClick={s.action} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`,
            borderRadius:14, padding:"16px", cursor:"pointer", transition:"transform 0.18s, box-shadow 0.18s" }}>
            <div style={{ fontSize:11, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:isMobile?20:24, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:s.color, marginTop:6, fontWeight:700 }}>{s.cta} →</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 320px", gap:20, alignItems:"start" }}>
        {/* Left column */}
        <div>

          {/* Live Now */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:16 }}>🔴 Live Now — People You Follow</div>
              <button onClick={() => onNavigate("viewer-browse")} style={{ background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontSize:12, fontWeight:700 }}>See all →</button>
            </div>
            {liveLoading ? (
              <div style={{ background:COLORS.surface, borderRadius:12, padding:"24px", textAlign:"center", color:COLORS.muted, fontSize:13 }}>
                Loading live streams…
              </div>
            ) : liveFollowed.length === 0 ? (
              <div style={{ background:COLORS.surface, borderRadius:12, padding:"24px", textAlign:"center", color:COLORS.muted }}>
                <div style={{ fontSize:32, marginBottom:8 }}>😴</div>
                <div style={{ fontSize:13 }}>None of your followed streamers are live right now</div>
                <Btn onClick={() => onNavigate("viewer-browse")} variant="ghost" style={{ marginTop:12, fontSize:12 }}>Discover new streamers</Btn>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                {liveFollowed.map(s => <StreamCard key={s.id} streamer={s} onNavigate={onNavigate} />)}
              </div>
            )}
          </div>

          {/* Subscriptions */}
          {subCount > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:12 }}>⭐ Your Subscriptions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {Object.entries(subscriptions).map(([id, sub]) => {
                  const profile = subProfiles[id];
                  const displayName = profile?.displayName || profile?.name || sub.streamerName || "Streamer";
                  const avatarImg   = profile?.avatarImg || null;
                  return (
                    <div key={id} onClick={() => onNavigate("stream-room", { streamerId:Number(id) })}
                      style={{ display:"flex", alignItems:"center", gap:14, background:COLORS.card,
                        border:`1px solid ${sub.tierColor}33`, borderRadius:12, padding:"14px 16px", cursor:"pointer" }}>
                      <div style={{ width:44, height:44, borderRadius:"50%", background:COLORS.surface,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0,
                        border:`2px solid ${sub.tierColor}44`, overflow:"hidden" }}>
                        {avatarImg
                          ? <img src={avatarImg} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                          : "🎭"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{displayName}</div>
                        <div style={{ fontSize:11, color:COLORS.muted }}>Since {sub.since}</div>
                      </div>
                      <SubBadge tierName={sub.tierName} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Tips */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:16 }}>🪙 Recent Tips</div>
              <button onClick={() => onNavigate("viewer-profile")} style={{ background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontSize:12, fontWeight:700 }}>Full history →</button>
            </div>
            {tipHistory.length > 0 ? (
              <Card style={{ padding:0, overflow:"hidden" }}>
                {tipHistory.slice(0,4).map((tip, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                    borderBottom: i < Math.min(tipHistory.length,4)-1 ? `1px solid ${COLORS.border}22` : "none" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:COLORS.surface,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🎭</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{tip.streamer}</div>
                      {tip.note && <div style={{ fontSize:11, color:COLORS.muted }}>{tip.note}</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, color:COLORS.gold }}>🪙 {tip.tokens}</div>
                      <div style={{ fontSize:10, color:COLORS.muted }}>{new Date(tip.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </Card>
            ) : (
              <Card style={{ textAlign:"center", padding:"28px" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🪙</div>
                <div style={{ fontSize:13, color:COLORS.muted }}>No tips yet — send your first tip in a live stream!</div>
                <Btn onClick={() => onNavigate("viewer-browse")} variant="ghost" style={{ marginTop:12, fontSize:12 }}>Browse Streams</Btn>
              </Card>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          {/* Achievements */}
          <Card style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:14 }}>🏆 Achievements</div>
              <div style={{ fontSize:11, color:COLORS.muted }}>{achievements.length} earned</div>
            </div>
            {achievements.length > 0 ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {achievements.map((a, i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:3 }}>{a.icon}</div>
                    <div style={{ fontSize:9, color:COLORS.muted, lineHeight:1.2 }}>{a.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:12, color:COLORS.muted, textAlign:"center", padding:"12px 0", lineHeight:1.6 }}>
                🎯 Tip streamers, follow creators and subscribe to earn achievements!
              </div>
            )}
          </Card>

          {/* Recommended */}
          <Card>
            <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>✨ Recommended for You</div>
            {liveLoading ? (
              <div style={{ fontSize:12, color:COLORS.muted, textAlign:"center", padding:"16px 0" }}>Loading…</div>
            ) : recommended.length === 0 ? (
              <div style={{ textAlign:"center", padding:"16px 8px" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
                <div style={{ fontSize:12, color:COLORS.muted, marginBottom:12, lineHeight:1.5 }}>
                  Discover streamers you'll love
                </div>
                <Btn onClick={() => onNavigate("viewer-browse")} variant="ghost" style={{ fontSize:12, width:"100%" }}>Browse Live Now →</Btn>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {recommended.map(s => (
                  <div key={s.id} onClick={() => onNavigate("stream-room", { streamerId:s.id })}
                    style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"8px", borderRadius:10, transition:"background 0.15s" }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:COLORS.surface, overflow:"hidden",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                      {s.avatarImg ? <img src={s.avatarImg} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "🎭"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.displayName || s.name}</div>
                      <div style={{ fontSize:10, color:COLORS.muted }}>{(s.viewers||0).toLocaleString()} viewers</div>
                    </div>
                    <Pill color={COLORS.accent} style={{ fontSize:9, padding:"2px 6px" }}>LIVE</Pill>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ViewerEditProfileScreen({ onNavigate, addToast }) {
  const w = useWindowWidth(); const isMobile = w < 640;
  const [form, setForm] = useState({
    displayName: "", username: "", bio: "", avatar: "🦇", avatarImg: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("steamr_token");
    if (!token) return;
    fetch("/api/user-profile", { headers: { "x-auth-token": token } })
    .then(r => r.json())
    .then(data => {
      if (data.ok) setForm(f => ({
        ...f,
        displayName: data.profile.displayName || data.profile.name || "",
        username:    data.profile.username    || data.profile.email?.split("@")[0] || "",
        bio:         data.profile.bio         || "",
        avatarImg:   data.profile.avatarImg   || null,
      }));
    }).catch(() => {});
  }, []);
  const [saved, setSaved] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const handleSave = () => {
    setSaved(true);
    const token = localStorage.getItem("steamr_token");
    fetch("/api/user-profile", {
      method:  "POST",
      headers: { "x-auth-token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ token, displayName: form.displayName, username: form.username, bio: form.bio, avatarImg: form.avatarImg }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        addToast && addToast("success", "Profile updated! ✓");
        setTimeout(() => { setSaved(false); onNavigate("viewer-profile"); }, 900);
      } else {
        addToast && addToast("error", "Could not save. Try again.");
        setSaved(false);
      }
    })
    .catch(() => { addToast && addToast("error", "Connection error."); setSaved(false); });
  };

  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:isMobile?"20px 16px 60px":"40px 24px 60px" }}>
      <button onClick={() => onNavigate("viewer-profile")} style={{ background:"none", border:"none", color:COLORS.muted, cursor:"pointer", marginBottom:20, fontSize:13 }}>← My Profile</button>
      <h2 style={{ margin:"0 0 24px", fontSize:isMobile?20:24, fontWeight:900 }}>✏️ Edit Profile</h2>

      {/* Avatar */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:COLORS.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:14 }}>Profile Picture</div>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          {/* Preview */}
          <div style={{ width:72, height:72, borderRadius:"50%", background:COLORS.surface, border:`2px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, flexShrink:0, overflow:"hidden" }}>
            {form.avatarImg
              ? <img src={form.avatarImg} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : form.avatar}
          </div>
          {/* Upload */}
          <div style={{ flex:1 }}>
            <label style={{ display:"block", cursor:"pointer" }}>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display:"none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => update("avatarImg", ev.target.result);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <div style={{ border:`2px dashed ${COLORS.border}`, borderRadius:12, padding:"16px", textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=COLORS.accent}
                onMouseLeave={e=>e.currentTarget.style.borderColor=COLORS.border}>
                <div style={{ fontSize:20, marginBottom:5 }}>📷</div>
                <div style={{ fontWeight:700, fontSize:12, marginBottom:3 }}>Upload Photo</div>
                <div style={{ fontSize:10, color:COLORS.muted }}>JPG, PNG, GIF or WEBP</div>
              </div>
            </label>
            {form.avatarImg && (
              <button onClick={() => update("avatarImg", null)} style={{ marginTop:6, background:"none", border:"none", color:"#ff6666", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                ✕ Remove photo
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Display Name + Username + Bio */}
      <Card style={{ marginBottom:20 }}>
        <Input label="Display Name" value={form.displayName} onChange={v => update("displayName", v)} placeholder="How should we call you?" />
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>Username</label>
          <div style={{ display:"flex", alignItems:"center", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:9, overflow:"hidden" }}>
            <span style={{ padding:"10px 12px", color:COLORS.muted, fontSize:13, borderRight:`1px solid ${COLORS.border}`, userSelect:"none" }}>@</span>
            <input
              value={form.username}
              onChange={e => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0,30))}
              placeholder="your_username"
              style={{ flex:1, background:"transparent", border:"none", padding:"10px 12px", color:COLORS.text, fontSize:13, outline:"none" }}
            />
          </div>
          <div style={{ fontSize:10, color:COLORS.muted, marginTop:4 }}>Letters, numbers and underscores only · Max 30 chars</div>
        </div>
        <div>
          <label style={{ display:"block", marginBottom:6, fontSize:13, color:COLORS.muted, fontWeight:600 }}>
            Bio <span style={{ fontWeight:400, color:form.bio.length>120?"#ff4444":COLORS.muted }}>{form.bio.length}/120</span>
          </label>
          <textarea value={form.bio} onChange={e => update("bio", e.target.value.slice(0,120))} rows={3}
            placeholder="Tell streamers a little about yourself…"
            style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:9, padding:"9px 12px", color:COLORS.text, fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.6 }}
          />
        </div>
      </Card>

      <Btn onClick={handleSave} style={{ width:"100%", fontSize:15, padding:"14px", fontWeight:900 }} disabled={saved}>
        {saved ? "✓ Saved!" : "Save Profile"}
      </Btn>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ADMIN SCREEN — Account cleanup (password protected)
// ══════════════════════════════════════════════════════════════════════════════
function AdminScreen({ onNavigate }) {
  const [adminKey,  setAdminKey]  = useState("");
  const [authed,    setAuthed]    = useState(false);
  const [accounts,  setAccounts]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [status,    setStatus]    = useState("");
  const [error,     setError]     = useState("");

  const fetchAccounts = async (key) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/admin-cleanup", {
        headers: { "x-admin-key": key, "Content-Type": "application/json" },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { setError(`Server returned: ${text.slice(0,200)}`); setLoading(false); return; }
      if (data.error) { setError(data.error); setAuthed(false); }
      else { setAccounts(data.accounts || []); setAuthed(true); }
    } catch (err) {
      setError(`Could not connect: ${err.message}`);
    }
    setLoading(false);
  };

  const deleteAccount = async (email) => {
    if (!window.confirm(`Delete account: ${email}?`)) return;
    try {
      const res  = await fetch("/api/admin-cleanup", {
        method: "DELETE",
        headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) { setStatus(`✅ Deleted ${email}`); fetchAccounts(adminKey); }
      else setError(data.error);
    } catch { setError("Delete failed."); }
  };

  const deleteAll = async () => {
    if (!window.confirm("Delete ALL accounts? This cannot be undone.")) return;
    try {
      const res  = await fetch("/api/admin-cleanup", {
        method: "POST",
        headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-all-test" }),
      });
      const data = await res.json();
      if (data.ok) { setStatus(`✅ Deleted ${data.deleted} records`); setAccounts([]); }
      else setError(data.error);
    } catch { setError("Delete failed."); }
  };

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 24px 60px" }}>
      <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:900 }}>🛡️ Admin Panel</h2>
      <p style={{ color:COLORS.muted, fontSize:13, marginBottom:24 }}>Manage Upstash accounts. Keep this page private.</p>

      {!authed ? (
        <Card>
          <Input label="Admin Secret Key" type="password" value={adminKey} onChange={setAdminKey} placeholder="Your ADMIN_SECRET_KEY" />
          {error && <div style={{ marginBottom:12, padding:"10px 14px", background:"#ff444422", border:"1px solid #ff444444", borderRadius:8, fontSize:13, color:"#ff6666" }}>❌ {error}</div>}
          <Btn onClick={() => fetchAccounts(adminKey)} style={{ width:"100%" }} disabled={!adminKey||loading}>
            {loading ? "Loading…" : "List All Accounts →"}
          </Btn>
        </Card>
      ) : (
        <>
          {status && <div style={{ marginBottom:12, padding:"10px 14px", background:COLORS.green+"22", border:`1px solid ${COLORS.green}44`, borderRadius:8, fontSize:13, color:COLORS.green }}>{status}</div>}
          {error  && <div style={{ marginBottom:12, padding:"10px 14px", background:"#ff444422", border:"1px solid #ff444444", borderRadius:8, fontSize:13, color:"#ff6666" }}>❌ {error}</div>}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:700 }}>{accounts.length} account{accounts.length!==1?"s":""} found</div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={() => fetchAccounts(adminKey)} variant="secondary" style={{ fontSize:12 }}>🔄 Refresh</Btn>
              <Btn onClick={deleteAll} variant="ghost" style={{ fontSize:12, color:"#ff6666" }}>🗑️ Delete All</Btn>
            </div>
          </div>

          <Card style={{ padding:0, overflow:"hidden" }}>
            {accounts.length === 0 ? (
              <div style={{ padding:"32px", textAlign:"center", color:COLORS.muted }}>No accounts found</div>
            ) : accounts.map((a, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:`1px solid ${COLORS.border}22` }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{a.email || a.key}</div>
                  <div style={{ fontSize:11, color:COLORS.muted, marginTop:2 }}>{a.name} · {a.role} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "unknown"}</div>
                </div>
                <Btn onClick={() => deleteAccount(a.email)} variant="ghost" style={{ fontSize:11, color:"#ff6666", padding:"5px 10px" }}>Delete</Btn>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}


function GlobalStyles() {
  const isDark = useIsDark();
  const sBase  = isDark ? "#2d1f28" : "#f0ccd8";
  const sShine = isDark ? "#3d2f3c" : "#ffe0eb";
  return (
    <style>{`
      @keyframes skeletonShimmer {
        0%   { background-position: -200% 0 }
        100% { background-position:  200% 0 }
      }
      @keyframes tipFlyUp {
        0%   { opacity:0; transform:translateY(0)     scale(0.8); }
        18%  { opacity:1; transform:translateY(-28px)  scale(1.12);}
        55%  { opacity:1; transform:translateY(-80px)  scale(1);   }
        85%  { opacity:.7;transform:translateY(-130px) scale(.95); }
        100% { opacity:0; transform:translateY(-170px) scale(.85); }
      }
      @keyframes hugeFlash {
        0%   { opacity:0; transform:scale(.5) rotate(-4deg); }
        25%  { opacity:1; transform:scale(1.1) rotate(2deg); }
        60%  { opacity:1; transform:scale(1) rotate(0deg);   }
        100% { opacity:0; transform:scale(.9) rotate(0deg);  }
      }
      @keyframes coinSpin {
        0%   { transform:rotateY(0deg);   }
        100% { transform:rotateY(360deg); }
      }
      @keyframes onboardingFadeIn {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0);     }
      }
      .skeleton-box {
        background: linear-gradient(90deg, ${sBase} 25%, ${sShine} 50%, ${sBase} 75%);
        background-size: 200% 100%;
        animation: skeletonShimmer 1.4s ease infinite;
      }
      @keyframes pulse {
        0%,100% { opacity:1; transform:translate(-50%,-50%) scale(1);    }
        50%      { opacity:0.6; transform:translate(-50%,-50%) scale(1.4);}
      }
      @keyframes slideInLeft {
        from { transform:translateX(-100%); }
        to   { transform:translateX(0);     }
      }
      @keyframes fadeInUp {
        from { opacity:0; transform:translateY(12px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      .steamr-card-hover {
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      }
      .steamr-card-hover:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 36px rgba(255,45,85,0.18) !important;
      }
      .steamr-link-hover { transition: color 0.15s; }
      .steamr-link-hover:hover { color: #ff2d55 !important; }
      .steamr-nav-btn {
        transition: background 0.15s, color 0.15s, opacity 0.15s;
      }
      .steamr-nav-btn:hover { opacity: 0.85; }
      input:focus, textarea:focus {
        box-shadow: 0 0 0 2px rgba(255,45,85,0.25) !important;
      }
      /* ── Mobile baseline ─────────────────────────────── */
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      html { -webkit-text-size-adjust: 100%; }
      button, a { touch-action: manipulation; }
      @media (max-width: 639px) {
        /* Ensure nothing overflows on mobile */
        img, video { max-width: 100%; }
        /* Slightly larger tap targets on mobile */
        button { min-height: 38px; }
      }
    `}</style>
  );
}

// ── SKELETON COMPONENTS ───────────────────────────────────────────────────────
function SkeletonBox({ width = "100%", height = 16, radius = 8, style = {} }) {
  return <div className="skeleton-box" style={{ width, height, borderRadius:radius, ...style }} />;
}

function SkeletonStreamCard() {
  return (
    <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:13, overflow:"hidden" }}>
      <div className="skeleton-box" style={{ height:155 }} />
      <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
        <SkeletonBox height={14} width="60%" />
        <div style={{ display:"flex", gap:6 }}>
          <SkeletonBox height={10} width="22%" radius={4} />
          <SkeletonBox height={10} width="20%" radius={4} />
          <SkeletonBox height={10} width="18%" radius={4} />
        </div>
        <SkeletonBox height={6} radius={3} />
      </div>
    </div>
  );
}

// ── TIP ALERTS ────────────────────────────────────────────────────────────────
function TipAlertItem({ alert, onDone }) {
  const xPos = useRef(10 + Math.random() * 55);
  useEffect(() => { const t = setTimeout(onDone, 3600); return () => clearTimeout(t); }, []);
  const isHuge = alert.amount >= 500;
  const isBig  = alert.amount >= 100;
  const color  = isHuge ? COLORS.gold : isBig ? COLORS.accent : COLORS.green;

  if (isHuge) return (
    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
      justifyContent:"center", pointerEvents:"none", zIndex:60 }}>
      <div style={{ animation:"hugeFlash 3.6s ease-out forwards", textAlign:"center",
        background:COLORS.gold, borderRadius:20, padding:"18px 32px",
        boxShadow:`0 0 60px ${COLORS.gold}88`, border:"3px solid #fff2" }}>
        <div style={{ fontSize:36, marginBottom:4 }}>💰💰💰</div>
        <div style={{ fontSize:20, fontWeight:900, color:"#000" }}>🪙 {alert.amount}</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#000" }}>{alert.user} just made it rain!</div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"absolute", bottom:24, left:`${xPos.current}%`,
      animation:"tipFlyUp 3.6s ease-out forwards", pointerEvents:"none", zIndex:55,
      background:color, color: isBig?"#fff":"#000",
      borderRadius:12, padding:isBig?"9px 18px":"6px 14px",
      fontWeight:800, fontSize:isBig?15:12,
      boxShadow:`0 4px 20px ${color}88`, whiteSpace:"nowrap",
      border:`2px solid ${color === COLORS.gold ? "rgba(255,255,255,0.4)" : "transparent"}` }}>
      {isBig?"💰":"🪙"} {alert.amount} — {alert.user}
    </div>
  );
}

function TipAlertsOverlay({ alerts, onDone }) {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      {alerts.map(a => <TipAlertItem key={a.id} alert={a} onDone={() => onDone(a.id)} />)}
    </div>
  );
}

// ── ONBOARDING MODAL ──────────────────────────────────────────────────────────
const ONBOARD_VIEWER = [
  { icon:"🎭", title:"Welcome to Steamr!", sub:"The world's premier live streaming platform.",
    body:"Connect with your favorite Steamr Fantasy — thousands of live streams are happening right now, just for you.",
    highlight:"✨ Your first 100 tokens are on us. Use them to say hello!" },
  { icon:"🔍", title:"Discover & Browse", sub:"Find your next obsession.",
    body:"Use the Browse and Discover screens to explore streamers by category, tags, or search. Filter by region, sort by viewers — there's always something live.",
    highlight:"💡 Tip: Click a category card on Discover to jump straight to that scene." },
  { icon:"🪙", title:"Token Economy", sub:"Tokens make magic happen.",
    body:"You buy tokens and use them to tip streamers, unlock private shows, or send a shout-out. 1 token = $0.10. Streamers earn half.",
    highlight:"🎯 Tip 🪙 10 to get a song request, or 🪙 500 for a full private show." },
  { icon:"👑", title:"Fan Club & Subscriptions", sub:"Go deeper with your favourites.",
    body:"Subscribe to streamers for exclusive Fan Club posts — behind-the-scenes photos, polls, videos, and more. Three tiers: Fan, Super Fan, VIP.",
    highlight:"🌟 Subscribers get priority in tip queue and early stream access." },
  { icon:"🛡️", title:"Stay Safe & Have Fun", sub:"We've got your back.",
    body:"All payments are encrypted and processed securely. You control your privacy. If you ever see something wrong, use the report button.",
    highlight:"🔒 Your identity is protected. No personal data is ever sold." },
];
const ONBOARD_STREAMER = [
  { icon:"🚀", title:"Welcome, Creator!", sub:"Your Page. Your rules. Your earnings.",
    body:"Steamr gives you everything you need to build your live streaming empire — from a fully featured go-live studio to detailed earnings analytics." },
  { icon:"🎬", title:"Go Live Instantly", sub:"One click and you're broadcasting.",
    body:"Hit Go Live from the nav bar. Set your goal, your stream title, and you're on air. Followers are notified immediately.",
    highlight:"💡 Pro tip: Set an achievable goal to motivate tippers and grow your earnings." },
  { icon:"📅", title:"Schedule Your Streams", sub:"Consistency builds fans.",
    body:"Use the Schedule screen to set recurring stream times. Your schedule shows on every follower's calendar so they never miss you.",
    highlight:"🗓 Streamers who schedule earn 3× more on average — fans plan around you." },
  { icon:"📊", title:"Dashboard & Payouts", sub:"Know your numbers. Get paid.",
    body:"The Dashboard shows your real-time earnings, payout history, and subscriber stats. Request a payout any time — funds arrive in 2-3 business days.",
    highlight:"💸 Payouts require identity verification (KYC) — it takes under 2 minutes." },
  { icon:"🌟", title:"Build Your Fan Club", sub:"Lock exclusive content for subscribers.",
    body:"Post photos, videos, and polls exclusively for your Fan, Super Fan, or VIP subscribers. It's your private community inside Steamr.",
    highlight:"👑 Fan Club creators earn 40% more per month than streamers who don't use it." },
];

function OnboardingModal({ role, onClose }) {
  const isDark  = useIsDark();
  const [step, setStep] = useState(0);
  const steps   = role === "streamer" ? ONBOARD_STREAMER : ONBOARD_VIEWER;
  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000,
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ animation:"onboardingFadeIn 0.35s ease",
        background: isDark ? COLORS.card : "#fff",
        border:`1px solid ${COLORS.border}`, borderRadius:24,
        maxWidth:460, width:"100%", overflow:"hidden",
        boxShadow:`0 32px 80px rgba(0,0,0,0.5)` }}>

        {/* Progress bar */}
        <div style={{ height:4, background:COLORS.border }}>
          <div style={{ height:"100%", width:`${((step+1)/steps.length)*100}%`,
            background:`linear-gradient(90deg,${COLORS.accent},${COLORS.accentC})`,
            transition:"width 0.4s ease", borderRadius:2 }} />
        </div>

        {/* Body */}
        <div style={{ padding:"32px 28px 24px" }}>
          {/* Illustration */}
          <div style={{ width:72, height:72, borderRadius:"50%",
            background:`linear-gradient(135deg,${COLORS.accent}33,${COLORS.accentC}22)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:36, marginBottom:20, border:`2px solid ${COLORS.accent}33` }}>
            {current.icon}
          </div>

          <div style={{ fontSize:11, fontWeight:700, color:COLORS.accent,
            textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>
            Step {step+1} of {steps.length}
          </div>
          <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900, color:COLORS.text }}>
            {current.title}
          </h2>
          <p style={{ margin:"0 0 16px", fontSize:13, color:COLORS.accent, fontWeight:600 }}>
            {current.sub}
          </p>
          <p style={{ margin:"0 0 20px", fontSize:14, color:COLORS.muted, lineHeight:1.7 }}>
            {current.body}
          </p>

          {/* Highlight box */}
          <div style={{ background:COLORS.accent+"15", border:`1px solid ${COLORS.accent}33`,
            borderRadius:12, padding:"12px 16px", marginBottom:28,
            fontSize:13, color:COLORS.text, lineHeight:1.6 }}>
            {current.highlight}
          </div>

          {/* Progress dots */}
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:24 }}>
            {steps.map((_,i) => (
              <div key={i} onClick={() => setStep(i)} style={{ cursor:"pointer",
                width: i===step?20:8, height:8, borderRadius:4,
                background: i===step?COLORS.accent:COLORS.border,
                transition:"all 0.3s ease" }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose}
              style={{ background:"none", border:`1px solid ${COLORS.border}`, color:COLORS.muted,
                borderRadius:10, padding:"11px 20px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              Skip
            </button>
            {!isLast && (
              <Btn onClick={() => setStep(s=>s+1)} style={{ flex:1, padding:"11px" }}>
                Next →
              </Btn>
            )}
            {isLast && (
              <Btn onClick={onClose} variant="green" style={{ flex:1, padding:"11px", fontWeight:800 }}>
                🚀 Let's Go!
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function Nav({ screen, onNavigate, onSignOut, userRole, notifications = [], onMarkRead, onMarkAllRead, isDark, onToggleTheme, isStreamerLive = false }) {
  const w          = useWindowWidth();
  const isMobile   = w < 640;
  const [open, setOpen] = useState(false);

  // Use logged-in role to determine nav side — never rely on screen name alone
  const ALL_AUTHED = ["viewer-browse","stream-room","buy-tokens","kyc-viewer","fan-club",
    "leaderboard","discovery","private-show","viewer-profile","ppv-content","gift-cards",
    "search","notifications","viewer-dashboard","viewer-edit-profile","streamer-dashboard",
    "go-live","kyc-streamer","profile","edit-profile","settings","schedule","analytics","earnings","login"];
  // Derive role from localStorage directly as fallback if userRole prop is null
  const storedRole  = (() => { try { return JSON.parse(localStorage.getItem("steamr_session")||"null")?.role||null; } catch { return null; } })();
  const activeRole  = userRole || storedRole;
  const isOnAuthed  = ALL_AUTHED.includes(screen);
  const isViewer    = (activeRole === "viewer")   && isOnAuthed;
  const isStreamer   = (activeRole === "streamer") && isOnAuthed;

  // Always show nav on authenticated screens — never return null
  if (!isOnAuthed) return null;

  // Close menu on navigation
  const go = (dest, opts) => { onNavigate(dest, opts); setOpen(false); };

  const STREAMER_LINKS = [
    { label:"Dashboard",    screen:"streamer-dashboard", onClick:() => go("streamer-dashboard") },
    { label:"📊 Analytics", screen:"analytics",          onClick:() => go("analytics")          },
    { label:isStreamerLive ? "🔴 Live Now ●" : "🔴 Go Live",  screen:"go-live", onClick:() => go("go-live") },
    { label:"📅 Schedule", screen:"schedule",           onClick:() => go("schedule")           },
    { label:"💰 Earnings", screen:"earnings",           onClick:() => go("earnings")           },
    { label:"👤 Profile",  screen:"profile",            onClick:() => go("profile",{streamerId:1}) },
  ];
  const VIEWER_LINKS = [
    { label:"🏠 Dashboard",   screen:"viewer-dashboard", onClick:() => go("viewer-dashboard") },
    { label:"Browse",          screen:"viewer-browse",   onClick:() => go("viewer-browse")    },
    { label:"🔍 Discover",    screen:"discovery",       onClick:() => go("discovery")         },
    { label:"👑 Fan Club",   screen:"fan-club",        onClick:() => go("fan-club")          },
    { label:"🏆 Rankings",   screen:"leaderboard",     onClick:() => go("leaderboard")       },
    { label:"🪙 Buy Tokens", screen:"buy-tokens",      onClick:() => go("buy-tokens")        },
    { label:"🎬 Exclusive",  screen:"ppv-content",     onClick:() => go("ppv-content")       },

    { label:"👤 Profile",    screen:"viewer-profile",  onClick:() => go("viewer-profile")    },
    { label:"🚪 Log Out",    screen:null,              onClick:() => onSignOut()              },
  ];
  const SHARED_LINKS = [
    { label:"🔍 Search",       screen:"search",        onClick:() => go("search")       },
    { label:"🔔 Notifications",screen:"notifications", onClick:() => go("notifications") },
    { label: isDark ? "☀️ Light Mode" : "🌙 Dark Mode", screen:null, onClick: onToggleTheme },
    { label:"⚙️ Settings", screen:"settings", onClick:() => go("settings") },
    { label:"🚪 Log Out", screen:null,        onClick:() => { onSignOut(); } },
  ];

  const links = [...(isStreamer ? STREAMER_LINKS : VIEWER_LINKS), ...SHARED_LINKS];

  // ── Mobile nav ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div style={{ borderBottom:`1px solid ${COLORS.border}`, background:COLORS.surface, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", position:"sticky", top:0, zIndex:200 }}>
          {/* Left: notification bell */}
          <button onClick={() => go("notifications")}
            style={{ position:"relative",background:"none",border:`1px solid ${COLORS.border}`,borderRadius:8,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:COLORS.text,fontSize:18,flexShrink:0 }}>
            🔔
            {notifications.filter(n=>!n.read).length > 0 && (
              <span style={{ position:"absolute",top:2,right:2,width:8,height:8,borderRadius:"50%",background:COLORS.accent,border:`2px solid ${COLORS.surface}` }}/>
            )}
          </button>
          {/* Centre: logo */}
          <SteamrLogo height={36} />
          {/* Right: hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background:"none", border:`1px solid ${COLORS.border}`, borderRadius:8, color:COLORS.text, fontSize:18, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Slide-down menu overlay */}
        {open && (
          <div style={{ position:"fixed", top:56, left:0, right:0, bottom:0, background:COLORS.bg, zIndex:190, overflowY:"auto" }}>
            <div style={{ padding:"12px 0" }}>
              {links.map(link => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  style={{
                    display:"block", width:"100%", textAlign:"left",
                    background: screen===link.screen ? COLORS.accent+"22" : "none",
                    borderLeft: `3px solid ${screen===link.screen ? COLORS.accent : "transparent"}`,
                    border:"none", borderLeftStyle:"solid", borderLeftWidth:3,
                    borderLeftColor: screen===link.screen ? COLORS.accent : "transparent",
                    color: screen===link.screen ? COLORS.text : COLORS.muted,
                    fontSize:16, fontWeight: screen===link.screen ? 700 : 400,
                    padding:"16px 24px", cursor:"pointer",
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Desktop nav (unchanged) ───────────────────────────────────────────────
  return (
    <div style={{ borderBottom:`1px solid ${COLORS.border}`,background:COLORS.surface,padding:"0 24px",display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",height:64,position:"sticky",top:0,zIndex:100 }}>
      <div style={{ display:"flex",gap:8 }}>
        {isViewer && <>
          <Btn onClick={() => onNavigate("viewer-dashboard")} variant={screen==="viewer-dashboard"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>🏠</Btn>
          <Btn onClick={() => onNavigate("viewer-browse")} variant={screen==="viewer-browse"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>Browse</Btn>
          <Btn onClick={() => onNavigate("discovery")} variant={screen==="discovery"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>🔍 Discover</Btn>
          <Btn onClick={() => onNavigate("fan-club")} variant={screen==="fan-club"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>👑 Fan Club</Btn>
          <Btn onClick={() => onNavigate("leaderboard")} variant={screen==="leaderboard"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>🏆</Btn>
          <Btn onClick={() => onNavigate("buy-tokens")} variant={screen==="buy-tokens"?"gold":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>🪙 Tokens</Btn>
          <Btn onClick={() => onNavigate("ppv-content")} variant={screen==="ppv-content"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>🎬</Btn>
        </>}
        {isStreamer && <>
          <Btn onClick={() => onNavigate("streamer-dashboard")} variant={screen==="streamer-dashboard"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>Dashboard</Btn>
          <Btn onClick={() => onNavigate("analytics")} variant={screen==="analytics"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>📊</Btn>
          <button onClick={() => onNavigate("go-live")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
              background:isStreamerLive ? COLORS.accent : screen==="go-live" ? COLORS.accent+"33" : "transparent",
              border:`1px solid ${isStreamerLive ? COLORS.accent : screen==="go-live" ? COLORS.accent : COLORS.border+"66"}`,
              borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:13,
              color:isStreamerLive ? "#fff" : COLORS.text, transition:"all 0.2s" }}>
            {isStreamerLive && (
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#fff",
                display:"inline-block", animation:"pulse 1.4s ease-in-out infinite" }} />
            )}
            {isStreamerLive ? "🔴 Live Now" : "🔴 Go Live"}
          </button>
          <Btn onClick={() => onNavigate("schedule")} variant={screen==="schedule"?"primary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>📅 Schedule</Btn>
          <Btn onClick={() => onNavigate("earnings")} variant={screen==="earnings"?"green":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>💰</Btn>
          <Btn onClick={() => onNavigate("profile", { streamerId:1 })} variant={["profile","edit-profile"].includes(screen)?"secondary":"ghost"} style={{ fontSize:13,padding:"7px 14px" }}>👤 Profile</Btn>
        </>}
      </div>
      <SteamrLogo height={44} />
      <div style={{ display:"flex",justifyContent:"flex-end",alignItems:"center",gap:6 }}>
        {/* Search — compact icon only */}
        <button onClick={() => onNavigate("search")} title="Search"
          style={{ background:"none",border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"7px 9px",cursor:"pointer",color:COLORS.text,fontSize:14,lineHeight:1 }}>
          🔍
        </button>

        {/* Notifications */}
        <button onClick={() => onNavigate("notifications")} title="Notifications"
          style={{ position:"relative",background:"none",border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"7px 9px",cursor:"pointer",color:COLORS.text,fontSize:14,lineHeight:1 }}>
          🔔
          {notifications.filter(n=>!n.read).length > 0 && (
            <span style={{ position:"absolute",top:2,right:2,width:7,height:7,borderRadius:"50%",background:COLORS.accent,border:`2px solid ${COLORS.surface}` }}/>
          )}
        </button>

        {/* Profile button — role aware */}
        {isViewer && (
          <Btn onClick={() => onNavigate("viewer-profile")}
            variant={screen==="viewer-profile"||screen==="viewer-edit-profile"?"secondary":"ghost"}
            style={{ fontSize:12,padding:"7px 12px" }}>👤 Profile</Btn>
        )}
        {isStreamer && (
          <Btn onClick={() => onNavigate("settings")} variant={screen==="settings"?"secondary":"ghost"} style={{ fontSize:12,padding:"7px 10px" }}>⚙️</Btn>
        )}

        {/* Log Out — always visible on any authenticated screen */}
        {(isViewer || isStreamer || ALL_AUTHED.includes(screen)) && (
          <Btn onClick={onSignOut} style={{ fontSize:12, padding:"7px 14px", background:COLORS.accent, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700 }}>
            🚪 Log Out
          </Btn>
        )}

        {/* Theme toggle */}
        <button onClick={onToggleTheme} title={isDark?"Light Mode":"Dark Mode"}
          style={{ background:"none",border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"7px 9px",cursor:"pointer",color:COLORS.text,fontSize:16,lineHeight:1 }}>
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
const AUTHED = ["viewer-browse","stream-room","buy-tokens","streamer-dashboard","go-live","kyc-streamer","kyc-viewer","profile","edit-profile","settings","fan-club","private-show","schedule","leaderboard","discovery","analytics","viewer-profile","notifications","search","earnings","ppv-content","gift-cards","viewer-dashboard","viewer-edit-profile"];

export default function App() {
  const [screen, setScreen] = useState(() => {
    try {
      const token       = localStorage.getItem("steamr_token");
      const session     = JSON.parse(localStorage.getItem("steamr_session") || "null");
      const savedScreen = localStorage.getItem("steamr_screen");
      if (token && session?.role) {
        return savedScreen || (session.role === "streamer" ? "streamer-dashboard" : "viewer-dashboard");
      }
    } catch {}
    return "landing";
  });
  const [selectedStreamerId, setSelectedStreamerId] = useState(1);
  const [profileData,        setProfileData]        = useState(STREAMER_PROFILES[1]);
  const [following,          setFollowing]          = useState(new Set());
  const [subscriptions,      setSubscriptions]      = useState({});
  const [notifications,      setNotifications]      = useState(INIT_NOTIFICATIONS);
  const [toasts,             setToasts]             = useState([]);
  const [isDark,             setIsDark]             = useState(true);
  const [showOnboarding,     setShowOnboarding]     = useState(false);
  const [onboardingRole,     setOnboardingRole]     = useState("viewer");
  const [viewerTokens,       setViewerTokens]       = useState(350);
  const [isStreamerLive,     setIsStreamerLive]      = useState(false);
  const [searchQuery,        setSearchQuery]        = useState("");

  const syncTokenBalance = (newBalance) => {
    const token = localStorage.getItem("steamr_token");
    if (!token) return;
    fetch("/api/user-profile", {
      method:  "PATCH",
      headers: { "x-auth-token": token, "Content-Type": "application/json" },
      body:    JSON.stringify({ tokenBalance: newBalance }),
    }).catch(() => {});
  };

  const onPurchase = (tokens) => setViewerTokens(t => {
    const next = t + tokens;
    syncTokenBalance(next);
    return next;
  });
  const onSpendTokens = (tokens) => setViewerTokens(t => {
    const next = Math.max(0, t - tokens);
    syncTokenBalance(next);
    return next;
  });

  // ── Theme toggle ──
  const toggleTheme = () => {
    setIsDark(d => {
      const next = !d;
      Object.assign(COLORS, next ? DARK_COLORS : LIGHT_COLORS);
      return next;
    });
  };

  // ── Toast helpers ──
  const addToast = (type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  // ── Notification helpers ──
  const addNotification = (type, message) => {
    setNotifications(prev => [
      { id: Date.now() + Math.random(), type, message, time: "just now", read: false },
      ...prev,
    ]);
  };
  const markNotifRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead   = ()   => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // ── Navigation ──
  // ── User role — read synchronously from localStorage on first render ──────────
  const [userRole, setUserRole] = useState(() => {
    try {
      const token   = localStorage.getItem("steamr_token");
      const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
      return (token && session?.role) ? session.role : null;
    } catch { return null; }
  });

  // ── Auto-login from localStorage — stays logged in until explicit sign out ────
  useEffect(() => {
    try {
      const token      = localStorage.getItem("steamr_token");
      const session    = JSON.parse(localStorage.getItem("steamr_session") || "null");
      const savedScreen = localStorage.getItem("steamr_screen");
      if (token && session?.role) {
        setUserRole(session.role);
        // Restore the last visited screen, fall back to dashboard
        const defaultScreen = session.role === "streamer" ? "streamer-dashboard" : "viewer-dashboard";
        setScreen(savedScreen || defaultScreen);
        // Load real following list, token balance + subscriptions from Upstash
        fetch("/api/user-profile", { headers: { "x-auth-token": token } })
        .then(r => r.json())
        .then(data => {
          if (data.ok) {
            if (Array.isArray(data.profile?.following)) {
              setFollowing(new Set(data.profile.following));
            }
            if (data.activity?.tokenBalance !== undefined) {
              setViewerTokens(data.activity.tokenBalance);
            }
            if (data.activity?.isLive !== undefined) {
              setIsStreamerLive(data.activity.isLive);
            }
            if (data.activity?.subscriptions) {
              setSubscriptions(data.activity.subscriptions);
            }
          }
        })
        .catch(() => {});
      }
    } catch {}
  }, []);

  // ── Handle login ──────────────────────────────────────────────────────────────
  const onLogin = (role, token, email, name) => {
    setUserRole(role);
    if (token) localStorage.setItem("steamr_token", token);
    if (email) localStorage.setItem("steamr_session", JSON.stringify({ email, name, role }));
    setScreen(role === "streamer" ? "streamer-dashboard" : "viewer-dashboard");
  };

  // ── Handle sign out ───────────────────────────────────────────────────────────
  const onSignOut = () => {
    setUserRole(null);
    try {
      localStorage.removeItem("steamr_token");
      localStorage.removeItem("steamr_session");
      localStorage.removeItem("steamr_accounts");
      localStorage.removeItem("steamr_screen");
    } catch {}
    setScreen("landing");
  };

  // ── URL param handlers (admin + password reset) ──────────────────────────────
  const [resetToken, setResetToken] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setScreen("admin");
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("reset")) {
      setResetToken(params.get("reset"));
      setScreen("reset-password");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── Stripe payment return handler ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const tokens  = parseInt(params.get("tokens") || "0", 10);
    if (payment === "success" && tokens > 0) {
      onPurchase(tokens);
      addToast("success", `🎉 ${tokens.toLocaleString()} tokens added to your account!`);
      setScreen("buy-tokens");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "cancelled") {
      addToast("warning", "Payment cancelled — no charge was made.");
      setScreen("buy-tokens");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const [seenOnboarding, setSeenOnboarding] = useState(false);
  const navigate = (s, opts = {}) => {
    setScreen(s);
    setShowOnboarding(false); // always close modal when navigating
    if (opts.streamerId != null) setSelectedStreamerId(opts.streamerId);
    // Save current screen so refresh restores it
    try { localStorage.setItem("steamr_screen", s); } catch {}
    // Trigger onboarding only on first visit to main home screens
    if (!seenOnboarding && (s === "viewer-browse" || s === "streamer-dashboard")) {
      setSeenOnboarding(true);
      setOnboardingRole(s === "streamer-dashboard" ? "streamer" : "viewer");
      setTimeout(() => setShowOnboarding(true), 800);
    }
  };

  // ── Follow — fires toast + notification ──
  const onFollow = (id) => {
    setFollowing(prev => {
      const next = new Set(prev);
      const wasFollowing = prev.has(id);
      wasFollowing ? next.delete(id) : next.add(id);
      if (!wasFollowing) {
        const s = STREAMERS.find(x => x.id === id);
        addToast("follow", `Now following ${s ? s.name : "streamer"} ♥`);
        addNotification("follow", `Someone new started following you`);
        // Save follow to Upstash user profile
        try {
          const token = localStorage.getItem("steamr_token");
          if (token) {
            // Update following list in user profile
            fetch("/api/user-profile", {
              method: "POST",
              headers: { "x-auth-token": token, "Content-Type": "application/json" },
              body: JSON.stringify({ streamerId: id, action: "follow" }),
            }).catch(() => {});
          }
        } catch {}
        // Save follow to Vercel KV so streamer can notify on go live
        try {
          const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
          if (session?.email && s) {
            fetch("/api/follow", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                streamerId:    id,
                streamerName:  s.name,
                streamerEmail: s.email || `streamer_${id}@steamr.app`,
                viewerEmail:   session.email,
                viewerName:    session.name || session.email,
              }),
            }).catch(() => {}); // fail silently — local state already updated
          }
        } catch {}
      } else {
        // Save unfollow to Upstash user profile
        try {
          const token = localStorage.getItem("steamr_token");
          if (token) {
            fetch("/api/user-profile", {
              method: "POST",
              headers: { "x-auth-token": token, "Content-Type": "application/json" },
              body: JSON.stringify({ streamerId: id, action: "unfollow" }),
            }).catch(() => {});
          }
        } catch {}
        // Remove follow from KV
        try {
          const session = JSON.parse(localStorage.getItem("steamr_session") || "null");
          if (session?.email) {
            fetch("/api/follow", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ streamerId: id, viewerEmail: session.email }),
            }).catch(() => {});
          }
        } catch {}
      }
      return next;
    });
  };

  // ── Subscribe — fires toast + notification ──
  const onSubscribe = (streamerId, tier) => {
    const newSub = {
      tierName:  tier.name,
      tierBadge: tier.badge,
      tierPrice: tier.price,
      tierColor: tier.color,
      since: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
    setSubscriptions(prev => {
      const updated = { ...prev, [streamerId]: newSub };
      // Save to Upstash
      const token = localStorage.getItem("steamr_token");
      if (token) {
        fetch("/api/user-profile", {
          method:  "POST",
          headers: { "x-auth-token": token, "Content-Type": "application/json" },
          body:    JSON.stringify({ token, action: "subscribe", streamerId, sub: newSub }),
        }).catch(() => {});
      }
      return updated;
    });
    const s = STREAMERS.find(x => x.id === streamerId);
    addToast("subscribe", `${tier.badge} Subscribed to ${s?.name || "streamer"} — ${tier.name}!`);
    addNotification("subscribe", `New ${tier.name} subscriber! ${tier.badge}`);
  };

  const onCancelSub = (streamerId) => {
    setSubscriptions(prev => {
      const updated = { ...prev };
      delete updated[streamerId];
      // Save to Upstash
      const token = localStorage.getItem("steamr_token");
      if (token) {
        fetch("/api/user-profile", {
          method:  "POST",
          headers: { "x-auth-token": token, "Content-Type": "application/json" },
          body:    JSON.stringify({ token, action: "unsubscribe", streamerId }),
        }).catch(() => {});
      }
      return updated;
    });
    addToast("success", "Subscription cancelled ✓");
  };

  const renderScreen = () => {
    switch (screen) {
      case "landing":            return <LandingScreen onNavigate={navigate} />;
      case "login":              return <LoginScreen onNavigate={navigate} onLogin={onLogin} />;
      case "forgot-password":    return <ForgotPasswordScreen onNavigate={navigate} />;
      case "reset-password":     return <ResetPasswordScreen resetToken={resetToken} onNavigate={navigate} />;
      case "admin":              return <AdminScreen onNavigate={navigate} />;
      case "signup-streamer":    return <SignupScreen role="streamer" onNavigate={navigate} />;
      case "signup-viewer":      return <SignupScreen role="viewer"   onNavigate={navigate} />;
      case "viewer-browse":      return <BrowseScreen onNavigate={navigate} following={following} onFollow={onFollow} />;
      case "stream-room":        return <StreamRoomScreen onNavigate={navigate} addToast={addToast} addNotification={addNotification} subscriptions={subscriptions} onSubscribe={onSubscribe} viewerTokens={viewerTokens} onSpendTokens={onSpendTokens} selectedStreamerId={selectedStreamerId} following={following} onFollow={onFollow} />;
      case "buy-tokens":         return <BuyTokensScreen onNavigate={navigate} viewerTokens={viewerTokens} onPurchase={onPurchase} />;
      case "kyc-streamer":       return <KYCScreen role="streamer" onNavigate={navigate} />;
      case "kyc-status":         return <KYCStatusScreen onNavigate={navigate} />;
      case "kyc-viewer":         return <KYCScreen role="viewer"   onNavigate={navigate} />;
      case "streamer-dashboard": return <StreamerDashboard onNavigate={navigate} addToast={addToast} addNotification={addNotification} />;
      case "go-live":            return <GoLiveScreen onNavigate={navigate} addToast={addToast} addNotification={addNotification} onStreamingChange={setIsStreamerLive} />;
      case "profile":            return <ProfileScreen streamerId={selectedStreamerId} profileData={profileData} isOwnProfile={selectedStreamerId === 1} onNavigate={navigate} following={following} onFollow={onFollow} subscriptions={subscriptions} onSubscribe={onSubscribe} onCancelSub={onCancelSub} isStreamerLive={isStreamerLive} />;
      case "edit-profile":       return <EditProfileScreen profileData={profileData} onSave={setProfileData} onNavigate={navigate} />;
      case "settings":           return <SettingsScreen onNavigate={navigate} addToast={addToast} isStreamer={true} isDark={isDark} onToggleTheme={toggleTheme} />;
      case "fan-club":           return <FanClubFeed subscriptions={subscriptions} onNavigate={navigate} addToast={addToast} />;
      case "private-show":       return <PrivateShowScreen onNavigate={navigate} addToast={addToast} addNotification={addNotification} />;
      case "schedule":           return <ScheduleScreen onNavigate={navigate} />;
      case "leaderboard":        return <LeaderboardScreen onNavigate={navigate} />;
      case "discovery":          return <DiscoveryScreen onNavigate={navigate} />;
      case "analytics":          return <AnalyticsScreen onNavigate={navigate} />;
      case "viewer-profile":       return <ViewerProfileScreen onNavigate={navigate} subscriptions={subscriptions} following={following} viewerTokens={viewerTokens} onCancelSub={onCancelSub} />;
      case "viewer-dashboard":    return <ViewerDashboardScreen onNavigate={navigate} viewerTokens={viewerTokens} following={following} subscriptions={subscriptions} addToast={addToast} />;
      case "viewer-edit-profile": return <ViewerEditProfileScreen onNavigate={navigate} addToast={addToast} />;
      case "notifications":     return <NotificationsCenterScreen onNavigate={navigate} />;
      case "search":            return <SearchResultsScreen onNavigate={navigate} initialQuery={searchQuery} />;
      case "earnings":          return <EarningsScreen onNavigate={navigate} />;
      case "ppv-content":       return <PPVContentScreen onNavigate={navigate} viewerTokens={viewerTokens} onSpendTokens={onSpendTokens} />;
      case "gift-cards":        return <GiftCardScreen onNavigate={navigate} />;
      default:                   return <LandingScreen onNavigate={navigate} />;
    }
  };

  return (
    <ThemeCtx.Provider value={isDark}>
      <GlobalStyles />
      <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.text,
        fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative", overflow:"hidden",
        transition:"background 0.35s ease, color 0.35s ease" }}>

        {/* Ambient glow orbs */}
        <div style={{ position:"fixed", borderRadius:"50%", filter:"blur(120px)",
          pointerEvents:"none", zIndex:0,
          width:600, height:600, background:COLORS.accent+"18", top:-200, right:-200 }} />
        <div style={{ position:"fixed", borderRadius:"50%", filter:"blur(120px)",
          pointerEvents:"none", zIndex:0,
          width:400, height:400, background:COLORS.accentC+"14", bottom:-100, left:-100 }} />

        {/* Pre-auth header */}
        {!AUTHED.includes(screen) && (
          <div style={{ position:"fixed",top:0,left:0,right:0,height:64,
            display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",
            padding:"0 24px",zIndex:100,
            borderBottom:`1px solid ${COLORS.border}`,
            background:COLORS.surface+"cc",backdropFilter:"blur(12px)" }}>
            <div />
            <SteamrLogo height={44} />
            <div style={{ display:"flex",justifyContent:"flex-end",gap:8 }}>
              <button onClick={toggleTheme}
                style={{ background:"none",border:`1px solid ${COLORS.border}`,borderRadius:10,
                  padding:"7px 10px",cursor:"pointer",color:COLORS.text,fontSize:16,lineHeight:1 }}>
                {isDark?"☀️":"🌙"}
              </button>
              <Btn onClick={() => navigate("signup-streamer")} variant="ghost" style={{ fontSize:13,padding:"7px 16px" }}>Streamer Login</Btn>
              <Btn onClick={() => navigate("signup-viewer")} style={{ fontSize:13,padding:"7px 16px" }}>Viewer Login</Btn>
            </div>
          </div>
        )}

        <Nav screen={screen} onNavigate={navigate} onSignOut={onSignOut} userRole={userRole}
          notifications={notifications} onMarkRead={markNotifRead} onMarkAllRead={markAllRead}
          isDark={isDark} onToggleTheme={toggleTheme} isStreamerLive={isStreamerLive} />
        <ToastContainer toasts={toasts} />

        <div style={{ position:"relative",zIndex:1,paddingTop:AUTHED.includes(screen)?0:64 }}>
          {renderScreen()}
        </div>

        {/* Onboarding modal */}
        {showOnboarding && (
          <OnboardingModal
            role={onboardingRole}
            onClose={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
