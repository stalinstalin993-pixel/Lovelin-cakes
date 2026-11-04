/*
 * Builds every image asset used by the site from lightweight SVG art.
 * Replace the generated cake photos with real photography before launch —
 * keep the same file names (or update cakes.json) and re-run `npm run build`.
 *
 * Usage: node scripts/generate-assets.js
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const QRCode = require("qrcode");
const cakes = require("../cakes.json");
const SITE = (() => {
  global.window = {};
  require("../site.config.js");
  return global.window.SITE;
})();

const ROOT = path.join(__dirname, "..");
const IMG = path.join(ROOT, "images");
const CAKES = path.join(IMG, "cakes");
const THUMBS = path.join(CAKES, "thumbs");
const GALLERY = path.join(IMG, "gallery");
for (const dir of [IMG, CAKES, THUMBS, GALLERY]) fs.mkdirSync(dir, { recursive: true });

const C = {
  ink: "#1F2A24",
  pistachio: "#A8C69F",
  sage: "#F3F7F1",
  butter: "#F6E7B4",
  berry: "#8E3B5A",
  white: "#FFFFFF",
};

const PALETTES = {
  signature: { bg: "#EAF2E4", arch: "#DCEAD4", plate: "#F9FBF5", cake: "#F2E2A8", frosting: "#FFFDF6", accent: C.pistachio, detail: C.berry, crumb: "#D8C48A" },
  trending: { bg: "#F7EFD9", arch: "#EFE2BA", plate: "#FFFDF6", cake: C.pistachio, frosting: "#FFFDF8", accent: C.berry, detail: C.ink, crumb: "#C9D8C1" },
  chocolate: { bg: "#E9EEE5", arch: "#D8E3D2", plate: "#FBFCF8", cake: "#4A2F35", frosting: "#5C3A40", accent: C.pistachio, detail: C.butter, crumb: "#3A2328" },
  fruit: { bg: "#EDF4E7", arch: "#DCEAD2", plate: "#FCFDF8", cake: C.butter, frosting: "#FFFDF7", accent: C.berry, detail: C.pistachio, crumb: "#E3D3A2" },
  premium: { bg: "#F6EDCF", arch: "#EDDFB4", plate: "#FFFDF7", cake: C.butter, frosting: "#FFFDF6", accent: C.berry, detail: C.pistachio, crumb: "#E4D19B" },
  cheesecakes: { bg: "#EFF5EA", arch: "#DFEBD7", plate: "#FBFCF7", cake: "#F3E3B8", frosting: "#FFF7DC", accent: C.berry, detail: C.pistachio, crumb: "#4B3438" },
  "special-occasion": { bg: "#EAF1E4", arch: "#DAE8D2", plate: "#FCFDF8", cake: C.pistachio, frosting: "#FFFDF7", accent: C.berry, detail: C.butter, crumb: "#C8D9BF" },
  "birthday-boy": { bg: "#EDF3E8", arch: "#DDEAD5", plate: "#FCFDF8", cake: C.pistachio, frosting: "#FFFDF7", accent: C.berry, detail: C.ink, crumb: "#CBDBc2" },
  "birthday-girl": { bg: "#F3EEE0", arch: "#E9E0C4", plate: "#FFFDF8", cake: C.butter, frosting: "#FFFDF7", accent: C.berry, detail: C.pistachio, crumb: "#DFCE9F" },
  "wedding-anniversary": { bg: "#F7F2E4", arch: "#EFE7CD", plate: "#FFFEFA", cake: "#FFFDF7", frosting: "#FFFFFF", accent: C.pistachio, detail: C.berry, crumb: "#E7DBB9" },
  "brownies-cupcakes": { bg: "#EDF4E7", arch: "#DBE9D3", plate: "#FBFCF8", cake: "#432A31", frosting: "#EBD9AC", accent: C.pistachio, detail: C.berry, crumb: "#352025" },
};

function rng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const n = (v) => Math.round(v * 10) / 10;

function leaves(x, y, color, count = 2, size = 26) {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += `<ellipse cx="${x}" cy="${y}" rx="${size}" ry="${size * 0.42}" fill="${color}" transform="rotate(${-35 + i * 55} ${x} ${y})"/>`;
  }
  return out;
}

function flower(x, y, petal, center, r = 26) {
  let out = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    out += `<circle cx="${n(x + Math.cos(a) * r)}" cy="${n(y + Math.sin(a) * r)}" r="${n(r * 0.72)}" fill="${petal}"/>`;
  }
  out += `<circle cx="${x}" cy="${y}" r="${n(r * 0.55)}" fill="${center}"/>`;
  return out;
}

function cherry(x, y, color, r = 15) {
  return `<path d="M${x} ${y - r} q4 -24 20 -34" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>
    <circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="${C.white}" opacity=".5"/>`;
}

function sprinkle(x, y, color, angle) {
  return `<rect x="${x}" y="${y}" width="5" height="16" rx="2.5" fill="${color}" transform="rotate(${angle} ${x} ${y})"/>`;
}

function scatter(rand, count, color, yMin = 420, yMax = 545) {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += sprinkle(n(180 + rand() * 440), n(yMin + rand() * (yMax - yMin)), color, n(rand() * 180));
  }
  return out;
}

function roundCake(p, rand, tall = false) {
  const top = tall ? 500 : 560;
  const height = 850 - top;
  return `
  <ellipse cx="400" cy="866" rx="246" ry="24" fill="#1F2A24" opacity=".08"/>
  <ellipse cx="400" cy="852" rx="238" ry="20" fill="${p.plate}"/>
  <rect x="222" y="${top}" width="356" height="${height}" rx="28" fill="${p.cake}"/>
  <path d="M222 610 Q222 ${top - 8} 400 ${top - 8} Q578 ${top - 8} 578 610 V655 q-34 34 -68 0 t-68 0 t-68 0 t-68 0 t-68 0 t-68 0 Z" fill="${p.frosting}"/>
  <path d="M222 838 q89 18 178 10 q89 8 178 -10 v18 H222 Z" fill="${p.detail}" opacity=".85"/>
  <g opacity=".8">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${252 + i * 50}" cy="795" r="7" fill="${p.frosting}"/>`).join("")}</g>
  ${flower(300, 565, p.accent, p.detail, 25)}
  ${flower(500, 590, p.accent, p.detail, 19)}
  ${leaves(345, 548, p.detail, 2, 20)}
  ${cherry(420, 545, p.detail, 16)}
  ${scatter(rand, 12, p.detail, top + 20, top + 120)}
  ${scatter(rand, 6, p.accent, top + 140, top + 230)}`;
}

function tierCake(p, rand) {
  return `
  <ellipse cx="400" cy="868" rx="262" ry="24" fill="#1F2A24" opacity=".08"/>
  <ellipse cx="400" cy="854" rx="252" ry="20" fill="${p.plate}"/>
  <rect x="176" y="640" width="448" height="212" rx="26" fill="${p.cake}"/>
  <path d="M176 690 Q176 630 400 630 Q624 630 624 690 V724 q-48 36 -96 0 t-96 0 t-96 0 t-96 0 t-96 0 Z" fill="${p.frosting}"/>
  <rect x="268" y="458" width="264" height="192" rx="22" fill="${p.cake}"/>
  <path d="M268 500 Q268 450 400 450 Q532 450 532 500 V528 q-33 32 -66 0 t-66 0 t-66 0 t-66 0 Z" fill="${p.frosting}"/>
  <rect x="176" y="816" width="448" height="30" rx="15" fill="${p.detail}" opacity=".9"/>
  <rect x="268" y="618" width="264" height="26" rx="13" fill="${p.detail}" opacity=".9"/>
  <g opacity=".85">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${212 + i * 76}" cy="782" r="8" fill="${p.frosting}"/>`).join("")}</g>
  ${flower(320, 455, p.accent, p.detail, 27)}
  ${flower(402, 440, p.butter || C.butter, p.detail, 21)}
  ${flower(474, 462, p.accent, p.detail, 24)}
  ${cherry(400, 415, p.detail, 15)}
  ${leaves(360, 430, p.detail, 2, 24)}
  ${scatter(rand, 10, p.detail, 685, 790)}
  ${scatter(rand, 6, p.accent, 730, 815)}`;
}

function bentoCake(p, rand) {
  return `
  <ellipse cx="400" cy="862" rx="250" ry="22" fill="#1F2A24" opacity=".08"/>
  <rect x="196" y="596" width="408" height="258" rx="22" fill="${p.plate}"/>
  <rect x="226" y="624" width="348" height="200" rx="80" fill="${p.cake}"/>
  <path d="M226 690 Q226 624 400 624 Q574 624 574 690 V716 q-43 32 -86 0 t-86 0 t-86 0 t-86 0 Z" fill="${p.frosting}"/>
  <path d="M400 738 c-42 -38 -74 -58 -74 -94 a42 42 0 0 1 74 -26 a42 42 0 0 1 74 26 c0 36 -32 56 -74 94 Z" fill="${p.detail}" opacity=".92"/>
  ${leaves(302, 660, p.accent, 2, 20)}
  ${flower(500, 668, p.accent, p.detail, 18)}
  ${scatter(rand, 10, p.detail, 780, 822)}
  <path d="M196 596 L160 566 q-16 -12 -6 -30 q10 -18 30 -8 L226 560" fill="${p.arch}" stroke="${C.ink}" stroke-opacity=".2" stroke-width="3"/>`;
}

function cheesecake(p, rand) {
  return `
  <ellipse cx="400" cy="866" rx="248" ry="22" fill="#1F2A24" opacity=".08"/>
  <ellipse cx="400" cy="852" rx="240" ry="20" fill="${p.plate}"/>
  <rect x="208" y="640" width="384" height="208" rx="34" fill="${p.crumb}"/>
  <rect x="216" y="620" width="368" height="180" rx="30" fill="${p.cake}"/>
  <ellipse cx="400" cy="620" rx="184" ry="34" fill="${p.frosting}"/>
  <path d="M226 618 q37 -34 86 -10 q44 -32 88 -6 q45 -36 90 -4 q47 -22 74 8 v28 H226 Z" fill="${p.detail}" opacity=".85"/>
  <path d="M226 640 q174 40 348 0 v20 q-174 34 -348 0 Z" fill="${p.detail}" opacity=".25"/>
  ${[280, 340, 400, 460, 520].map((x, i) => `<circle cx="${x}" cy="${608 + (i % 2) * 8}" r="13" fill="${p.detail}"/><circle cx="${x - 4}" cy="${604 + (i % 2) * 8}" r="4" fill="#fff" opacity=".55"/>`).join("")}
  ${leaves(400, 664, p.accent, 2, 24)}
  ${scatter(rand, 8, p.accent, 690, 760)}`;
}

function slabCake(p, rand) {
  return `
  <ellipse cx="400" cy="866" rx="236" ry="22" fill="#1F2A24" opacity=".08"/>
  <rect x="236" y="760" width="322" height="98" rx="14" fill="${p.crumb}" transform="rotate(-2 400 810)"/>
  <rect x="250" y="680" width="312" height="96" rx="14" fill="${p.cake}" transform="rotate(2 400 730)"/>
  <rect x="240" y="598" width="318" height="96" rx="14" fill="${p.cake}" transform="rotate(-1.5 400 646)"/>
  <rect x="240" y="598" width="318" height="26" rx="12" fill="${p.frosting}" opacity=".9"/>
  <path d="M264 622 q60 30 120 6 q62 24 122 -4" stroke="${p.frosting}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
  ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${300 + i * 48}" cy="${712 + (i % 2) * 8}" r="9" fill="${p.accent}" opacity=".9"/>`).join("")}
  ${scatter(rand, 12, p.detail, 740, 800)}
  ${leaves(500, 580, p.accent, 2, 22)}`;
}

function cupcake(x, y, p, scale, rand) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="0" cy="150" rx="80" ry="12" fill="#1F2A24" opacity=".07"/>
    <path d="M-72 0 L72 0 L52 132 Q0 146 -52 132 Z" fill="${p.detail}" opacity=".92"/>
    <path d="M-62 10 L62 10 M-56 44 L56 44 M-49 78 L49 78" stroke="${p.frosting}" stroke-width="6" opacity=".28"/>
    <circle cx="-26" cy="-26" r="42" fill="${p.frosting}"/>
    <circle cx="26" cy="-26" r="42" fill="${p.frosting}"/>
    <circle cx="0" cy="-52" r="44" fill="${p.frosting}"/>
    ${cherry(4, -94, p.accent, 14)}
    ${scatter(rand, 5, p.detail, -60, 0)}
  </g>`;
}

function cupcakes(p, rand) {
  return `
  <ellipse cx="400" cy="858" rx="252" ry="22" fill="#1F2A24" opacity=".08"/>
  ${cupcake(250, 690, p, 1, rand)}
  ${cupcake(550, 690, p, 1, rand)}
  ${cupcake(400, 650, { ...p, frosting: p.butter || p.frosting }, 1.08, rand)}`;
}

function sheetCake(p, rand) {
  return `
  <ellipse cx="400" cy="864" rx="242" ry="22" fill="#1F2A24" opacity=".08"/>
  <ellipse cx="400" cy="850" rx="234" ry="18" fill="${p.plate}"/>
  <rect x="206" y="620" width="388" height="228" rx="24" fill="${p.cake}"/>
  <path d="M206 668 Q206 600 400 600 Q594 600 594 668 V690 q-48 40 -97 0 t-97 0 t-97 0 t-97 0 Z" fill="${p.frosting}"/>
  <rect x="206" y="820" width="388" height="28" rx="14" fill="${p.detail}" opacity=".9"/>
  <g opacity=".9">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${234 + i * 48}" cy="792" r="7" fill="${p.frosting}"/>`).join("")}</g>
  <path d="M290 560 h220 v58 h-220 Z" fill="${p.accent}" opacity=".25"/>
  <text x="400" y="604" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="${p.detail}">25</text>
  ${flower(248, 632, p.accent, p.detail, 18)}
  ${flower(552, 640, p.accent, p.detail, 20)}
  ${scatter(rand, 12, p.detail, 700, 790)}`;
}

const VARIANTS = {
  round: roundCake,
  tallRound: (p, r) => roundCake(p, r, true),
  tier: tierCake,
  bento: bentoCake,
  cheesecake: cheesecake,
  slab: slabCake,
  cupcakes: cupcakes,
  sheet: sheetCake,
};

const CATEGORY_VARIANT = {
  signature: ["tier", "round", "sheet", "round", "tallRound", "round", "tallRound", "round"],
  trending: ["bento", "sheet", "bento", "round", "sheet", "tier", "tallRound", "bento"],
  chocolate: ["round", "tier", "tallRound", "round", "sheet", "round", "tallRound", "round"],
  fruit: ["round", "tallRound", "round", "tier", "round", "tallRound", "round", "tallRound"],
  premium: ["tier", "tallRound", "tier", "round", "tier", "tallRound", "sheet", "tier"],
  cheesecakes: ["cheesecake", "cheesecake", "cheesecake", "cheesecake", "cheesecake", "cheesecake", "cheesecake", "cheesecake"],
  "special-occasion": ["tier", "tier", "round", "sheet", "tallRound", "tier", "round", "tier"],
  "birthday-boy": ["sheet", "tallRound", "round", "sheet", "tier", "round", "sheet", "tallRound"],
  "birthday-girl": ["tier", "round", "tier", "bento", "tallRound", "tier", "round", "bento"],
  "wedding-anniversary": ["tier", "tier", "tier", "tier", "tier", "tier", "tier", "tier"],
  "brownies-cupcakes": ["slab", "slab", "slab", "cupcakes", "cupcakes", "cupcakes", "cupcakes", "slab"],
};

function archPath(w, h, padX = 0.08, top = 0.11, bottom = 0.97) {
  const left = w * padX;
  const right = w * (1 - padX);
  const r = (right - left) / 2;
  const yTop = h * top;
  const yBottom = h * bottom;
  return `M${n(left)} ${n(yBottom)} V${n(yTop + r)} A${n(r)} ${n(r)} 0 0 1 ${n(right)} ${n(yTop + r)} V${n(yBottom)} Z`;
}

function background(w, h, p, seed) {
  const rand = rng(seed);
  let dots = "";
  for (let i = 0; i < 90; i++) {
    dots += `<circle cx="${n(rand() * w)}" cy="${n(rand() * h)}" r="${n(1 + rand() * 2)}" fill="${C.ink}" opacity="${n(0.04 + rand() * 0.05)}"/>`;
  }
  const arch = `<path d="${archPath(w, h)}" fill="${p.arch}"/>`;
  const archLine = `<path d="${archPath(w, h)}" fill="none" stroke="${C.ink}" stroke-opacity=".1" stroke-width="3"/>`;
  const petal = `<g opacity=".5" transform="translate(${n(w * 0.12)} ${n(h * 0.18)}) rotate(-18)">
    <ellipse cx="0" cy="0" rx="46" ry="86" fill="${p.accent}" opacity=".45"/>
    <ellipse cx="38" cy="28" rx="38" ry="70" fill="${p.detail}" opacity=".18" transform="rotate(34 38 28)"/>
  </g>`;
  return `rect width="${w}" height="${h}" fill="${p.bg}"/>${arch}${archLine}${dots}${petal}`;
}

function sceneSvg(w, h, p, art) {
  const scale = Math.min(w / 800, h / 1000);
  const tx = n((w - 800 * scale) / 2);
  const ty = n((h - 1000 * scale) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${background(w, h, p, Math.round(w + h))}
    <g transform="translate(${tx} ${ty}) scale(${n(scale)})">${art}</g>
  </svg>`;
}

function cakeArt(cake) {
  const p = PALETTES[cake.category] || PALETTES.signature;
  const variantList = CATEGORY_VARIANT[cake.category] || ["round"];
  const idx = (hash(cake.code) % variantList.length) | 0;
  const variant = variantList[idx];
  const draw = VARIANTS[variant] || roundCake;
  return draw(p, rng(hash(cake.code)));
}

async function toWebp(svg, file, width, height, quality = 84) {
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(width, height, { fit: "fill" })
    .webp({ quality, effort: 5 })
    .toFile(file);
}

async function main() {
  // --- Cake photos ---------------------------------------------------------
  let count = 0;
  for (const cake of cakes) {
    const p = PALETTES[cake.category] || PALETTES.signature;
    const svg = sceneSvg(800, 1000, p, cakeArt(cake));
    const fullPath = path.join(CAKES, `${cake.code}.webp`);
    await toWebp(svg, fullPath, 800, 1000);
    await sharp(fullPath)
      .resize(400, 500)
      .webp({ quality: 80, effort: 5 })
      .toFile(path.join(THUMBS, `${cake.code}.webp`));
    count++;
  }
  console.log(`Generated ${count} cake images.`);

  // --- Hero ----------------------------------------------------------------
  const heroPalette = {
    ...PALETTES.signature,
    bg: "#E7F0E1",
    arch: "#D8E7CF",
    cake: "#EFE0AC",
    frosting: "#FFFDF6",
  };
  const heroSvg = sceneSvg(1000, 1250, heroPalette, tierCake(heroPalette, rng(99)));
  await toWebp(heroSvg, path.join(IMG, "hero-cake.webp"), 1000, 1250, 88);
  await toWebp(heroSvg, path.join(IMG, "hero-cake-800.webp"), 800, 1000, 86);
  await toWebp(heroSvg, path.join(IMG, "hero-cake-480.webp"), 480, 600, 84);

  // --- Gallery -------------------------------------------------------------
  const galleryPicks = ["SG01", "WA04", "TR03", "CH05", "CS02", "BC05", "PR08", "FR02", "BD01", "BB07"];
  const sizes = [
    [1200, 1500], [1600, 1200], [1200, 1500], [1400, 1050], [1200, 1500],
    [1500, 1125], [1200, 1500], [1400, 1050], [1200, 1500], [1600, 1200],
  ];
  for (let i = 0; i < galleryPicks.length; i++) {
    const cake = cakes.find((c) => c.code === galleryPicks[i]);
    const p = PALETTES[cake.category];
    const [w, h] = sizes[i];
    const svg = sceneSvg(w, h, p, cakeArt(cake));
    const galleryPath = path.join(GALLERY, `g${i + 1}.webp`);
    await toWebp(svg, galleryPath, w, h, 84);
    await sharp(galleryPath)
      .resize({ width: 600 })
      .webp({ quality: 80, effort: 5 })
      .toFile(path.join(GALLERY, `g${i + 1}-600.webp`));
  }
  console.log(`Generated ${galleryPicks.length} gallery images.`);

  // --- Fallback cake image -------------------------------------------------
  const fallbackSvg = sceneSvg(800, 1000, PALETTES.signature, roundCake(PALETTES.signature, rng(4)));
  fs.writeFileSync(path.join(IMG, "fallback-cake.svg"), fallbackSvg);
  await toWebp(fallbackSvg, path.join(IMG, "fallback-cake.webp"), 800, 1000);

  // --- Baker portrait ------------------------------------------------------
  const baker = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
    <rect width="900" height="1125" fill="#E7F0E1"/>
    <path d="M90 1080 V520 A360 360 0 0 1 810 520 V1080 Z" fill="#D6E6CD"/>
    <path d="M90 1080 V520 A360 360 0 0 1 810 520 V1080 Z" fill="none" stroke="#1F2A24" stroke-opacity=".12" stroke-width="3"/>
    <g opacity=".55">
      <circle cx="180" cy="300" r="46" fill="#A8C69F"/>
      <ellipse cx="232" cy="258" rx="24" ry="45" fill="#8E3B5A" opacity=".25" transform="rotate(38 232 258)"/>
      <circle cx="760" cy="330" r="30" fill="#F6E7B4"/>
      <circle cx="706" cy="286" r="10" fill="#8E3B5A" opacity=".4"/>
    </g>
    <!-- shelf -->
    <rect x="560" y="470" width="260" height="16" rx="8" fill="#1F2A24" opacity=".18"/>
    <rect x="590" y="400" width="60" height="70" rx="10" fill="#F6E7B4"/>
    <rect x="676" y="420" width="50" height="50" rx="8" fill="#A8C69F"/>
    <rect x="748" y="386" width="46" height="84" rx="10" fill="#FFFDF6"/>
    <!-- body -->
    <path d="M270 1080 q0 -260 180 -260 q180 0 180 260 Z" fill="#8E3B5A"/>
    <path d="M360 852 q90 60 180 0 l34 154 q-124 76 -248 0 Z" fill="#FFFDF6"/>
    <path d="M360 852 q90 60 180 0" fill="none" stroke="#1F2A24" stroke-opacity=".15" stroke-width="4"/>
    <!-- neck -->
    <rect x="404" y="740" width="92" height="98" rx="44" fill="#E5C09B"/>
    <!-- head -->
    <ellipse cx="450" cy="642" rx="112" ry="130" fill="#EBCBA6"/>
    <!-- hair -->
    <path d="M338 632 q-10 -150 112 -160 q122 10 112 160 q-16 -84 -112 -84 q-96 0 -112 84 Z" fill="#1F2A24"/>
    <circle cx="450" cy="452" r="58" fill="#1F2A24"/>
    <path d="M512 500 q46 60 18 112" fill="none" stroke="#1F2A24" stroke-width="28" stroke-linecap="round"/>
    <!-- face -->
    <circle cx="410" cy="650" r="7" fill="#1F2A24"/>
    <circle cx="490" cy="650" r="7" fill="#1F2A24"/>
    <path d="M424 690 q26 20 52 0" stroke="#8E3B5A" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="368" cy="690" r="13" fill="#8E3B5A" opacity=".28"/>
    <circle cx="532" cy="690" r="13" fill="#8E3B5A" opacity=".28"/>
    <circle cx="344" cy="704" r="10" fill="#F6E7B4"/>
    <circle cx="556" cy="704" r="10" fill="#F6E7B4"/>
    <!-- apron details -->
    <path d="M450 884 v130" stroke="#A8C69F" stroke-width="6" opacity=".7"/>
    <path d="M398 944 h104 v82 h-104 Z" fill="#A8C69F" opacity=".55" rx="12"/>
    <!-- arms + cake -->
    <path d="M300 930 q-70 54 -6 128 q62 74 120 20" fill="#8E3B5A"/>
    <path d="M600 930 q70 54 6 128 q-62 74 -120 20" fill="#8E3B5A"/>
    <ellipse cx="450" cy="1010" rx="150" ry="24" fill="#FFFDF6"/>
    <rect x="352" y="960" width="196" height="60" rx="18" fill="#F6E7B4"/>
    <path d="M352 976 q98 34 196 0 v-12 q-98 30 -196 0 Z" fill="#FFFDF6"/>
    <circle cx="392" cy="958" r="10" fill="#8E3B5A"/>
    <circle cx="450" cy="954" r="10" fill="#8E3B5A"/>
    <circle cx="508" cy="958" r="10" fill="#8E3B5A"/>
    <!-- counter -->
    <rect x="0" y="1060" width="900" height="65" fill="#1F2A24" opacity=".14"/>
  </svg>`;
  await sharp(Buffer.from(baker), { density: 144 }).resize(900, 1125).webp({ quality: 86, effort: 5 }).toFile(path.join(IMG, "baker.webp"));
  await sharp(path.join(IMG, "baker.webp"))
    .resize({ width: 480 })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(IMG, "baker-480.webp"));

  // --- Logo mark + favicons ------------------------------------------------
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="62" fill="#1F2A24"/>
    <path d="M64 34 q26 12 26 38 q0 26 -26 34 q-26 -8 -26 -34 q0 -26 26 -38 Z" fill="#A8C69F"/>
    <path d="M64 52 q14 8 14 24 q0 14 -14 20 q-14 -6 -14 -20 q0 -16 14 -24 Z" fill="#F6E7B4"/>
    <circle cx="64" cy="82" r="8" fill="#8E3B5A"/>
    <path d="M64 41 v10 M50 47 q8 6 9 14 M78 47 q-8 6 -9 14" stroke="#F3F7F1" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
  </svg>`;
  fs.writeFileSync(path.join(IMG, "logo.svg"), logo);
  fs.writeFileSync(path.join(IMG, "favicon.svg"), logo);

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="28" fill="#F3F7F1"/>
    <circle cx="64" cy="64" r="52" fill="#1F2A24"/>
    <path d="M64 34 q26 12 26 38 q0 26 -26 34 q-26 -8 -26 -34 q0 -26 26 -38 Z" fill="#A8C69F"/>
    <path d="M64 52 q14 8 14 24 q0 14 -14 20 q-14 -6 -14 -20 q0 -16 14 -24 Z" fill="#F6E7B4"/>
    <circle cx="64" cy="82" r="8" fill="#8E3B5A"/>
  </svg>`;

  await sharp(Buffer.from(iconSvg), { density: 300 }).resize(512, 512).png().toFile(path.join(IMG, "icon-512.png"));
  await sharp(Buffer.from(iconSvg), { density: 300 }).resize(192, 192).png().toFile(path.join(IMG, "icon-192.png"));
  await sharp(Buffer.from(iconSvg), { density: 300 }).resize(180, 180).png().toFile(path.join(IMG, "apple-touch-icon.png"));
  await sharp(Buffer.from(iconSvg), { density: 300 }).resize(32, 32).png().toFile(path.join(IMG, "favicon-32.png"));
  await sharp(Buffer.from(iconSvg), { density: 300 }).resize(16, 16).png().toFile(path.join(IMG, "favicon-16.png"));

  // --- Open Graph cover ----------------------------------------------------
  const ogPalette = { ...PALETTES.signature, bg: "#F3F7F1", arch: "#DCEAD4" };
  const ogArt = tierCake(ogPalette, rng(12));
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#F3F7F1"/>
    <path d="M760 590 V260 A210 210 0 0 1 1180 260 V590 Z" fill="#DCEAD4"/>
    <path d="M760 590 V260 A210 210 0 0 1 1180 260 V590 Z" fill="none" stroke="#1F2A24" stroke-opacity=".12" stroke-width="2"/>
    <g transform="translate(766 116) scale(.46)">${ogArt}</g>
    <text x="76" y="118" font-family="Arial, sans-serif" font-size="20" letter-spacing="4" fill="#8E3B5A">HOME BAKERY · ${SITE.town.toUpperCase()}</text>
    <text x="72" y="246" font-family="Georgia, serif" font-size="86" fill="#1F2A24">Pistachio</text>
    <text x="72" y="332" font-family="Georgia, serif" font-style="italic" font-size="86" fill="#1F2A24">&amp; Petal</text>
    <text x="76" y="394" font-family="Arial, sans-serif" font-size="26" fill="#1F2A24" opacity=".8">${SITE.tagline}</text>
    <g font-family="Arial, sans-serif" font-size="16" fill="#1F2A24">
      <rect x="76" y="438" width="192" height="44" rx="22" fill="#F6E7B4"/>
      <text x="104" y="466">Eggless available</text>
      <rect x="282" y="438" width="188" height="44" rx="22" fill="#FFFFFF"/>
      <text x="308" y="466">Fresh to order</text>
      <rect x="484" y="438" width="172" height="44" rx="22" fill="#FFFFFF"/>
      <text x="510" y="466">★ 4.9 Google</text>
    </g>
    <circle cx="1080" cy="94" r="30" fill="#A8C69F" opacity=".65"/>
    <circle cx="710" cy="560" r="14" fill="#8E3B5A" opacity=".5"/>
  </svg>`;
  await sharp(Buffer.from(og), { density: 144 }).resize(1200, 630).png().toFile(path.join(IMG, "og-cover.png"));

  // --- WhatsApp QR ---------------------------------------------------------
  const waUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    `Hi ${SITE.name}! I'd like to ask about a cake.`
  )}`;
  await QRCode.toFile(path.join(IMG, "whatsapp-qr.png"), waUrl, {
    width: 560,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1F2A24", light: "#FFFFFF" },
  });
  fs.writeFileSync(path.join(IMG, "whatsapp-qr-target.txt"), waUrl + "\n");

  console.log("Generated hero, gallery, baker, logo, icons, OG cover and WhatsApp QR.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
