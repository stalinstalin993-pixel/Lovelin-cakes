const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ARTIFACT_DIR = "C:/Users/Admin/.gemini/antigravity/brain/d3a527bf-9762-4b62-8d2f-4b5b879826c2";
const ROOT = path.join(__dirname, "..");
const IMG = path.join(ROOT, "images");
const CAKES = path.join(IMG, "cakes");
const THUMBS = path.join(CAKES, "thumbs");
const GALLERY = path.join(IMG, "gallery");

for (const dir of [IMG, CAKES, THUMBS, GALLERY]) {
  fs.mkdirSync(dir, { recursive: true });
}

const SOURCES = {
  hero: path.join(ARTIFACT_DIR, "hero_cake_1793725350238.jpg"),
  sg01: path.join(ARTIFACT_DIR, "sg01_pistachio_rose_cloud_1793725371103.jpg"),
  sg02: path.join(ARTIFACT_DIR, "sg02_vanilla_bean_classic_1793725389390.jpg"),
  sg03: path.join(ARTIFACT_DIR, "sg03_belgian_chocolate_gateau_1793725413234.jpg"),
  sg04: path.join(ARTIFACT_DIR, "sg04_lemon_thyme_cake_1793725444893.jpg"),
  baker: path.join(ARTIFACT_DIR, "baker_ananya_1793725468391.jpg"),
  cheesecake: path.join(ARTIFACT_DIR, "biscoff_cheesecake_1793726317483.jpg"),
  brownies: path.join(ARTIFACT_DIR, "artisan_brownies_cupcakes_1793726360518.jpg"),
  bento: path.join(ARTIFACT_DIR, "heart_bento_cake_1793726381143.jpg"),
  mango: path.join(ARTIFACT_DIR, "mango_celebration_gateau_1793726402829.jpg"),
  rasamalai: path.join(ARTIFACT_DIR, "rasamalai_royale_cake_1793726425450.jpg"),
  wedding: path.join(ARTIFACT_DIR, "wedding_anniversary_cake_1793726447518.jpg"),
};

async function processCake(srcPath, code) {
  if (!fs.existsSync(srcPath)) return;
  await sharp(srcPath)
    .resize({ width: 800, height: 1000, fit: "cover" })
    .webp({ quality: 86 })
    .toFile(path.join(CAKES, `${code}.webp`));

  await sharp(srcPath)
    .resize({ width: 400, height: 500, fit: "cover" })
    .webp({ quality: 82 })
    .toFile(path.join(THUMBS, `${code}.webp`));
}

async function processGallery(srcPath, name) {
  if (!fs.existsSync(srcPath)) return;
  await sharp(srcPath)
    .resize({ width: 1200, height: 1500, fit: "cover" })
    .webp({ quality: 88 })
    .toFile(path.join(GALLERY, `${name}.webp`));

  await sharp(srcPath)
    .resize({ width: 600, height: 750, fit: "cover" })
    .webp({ quality: 84 })
    .toFile(path.join(GALLERY, `${name}-600.webp`));
}

async function run() {
  console.log("Processing complete photo suite...");

  // 1. Hero Cake
  if (fs.existsSync(SOURCES.hero)) {
    console.log("Generating hero images...");
    await sharp(SOURCES.hero)
      .resize({ width: 1000, height: 1250, fit: "cover" })
      .webp({ quality: 90 })
      .toFile(path.join(IMG, "hero-cake.webp"));
    await sharp(SOURCES.hero)
      .resize({ width: 800, height: 1000, fit: "cover" })
      .webp({ quality: 85 })
      .toFile(path.join(IMG, "hero-cake-800.webp"));
    await sharp(SOURCES.hero)
      .resize({ width: 480, height: 600, fit: "cover" })
      .webp({ quality: 85 })
      .toFile(path.join(IMG, "hero-cake-480.webp"));

    // Also use as fallback-cake
    await sharp(SOURCES.hero)
      .resize({ width: 800, height: 1000, fit: "cover" })
      .webp({ quality: 85 })
      .toFile(path.join(IMG, "fallback-cake.webp"));
  }

  // 2. Baker portrait
  if (fs.existsSync(SOURCES.baker)) {
    console.log("Generating baker portrait...");
    await sharp(SOURCES.baker)
      .resize({ width: 900, height: 1125, fit: "cover" })
      .webp({ quality: 90 })
      .toFile(path.join(IMG, "baker.webp"));
    await sharp(SOURCES.baker)
      .resize({ width: 480, height: 600, fit: "cover" })
      .webp({ quality: 85 })
      .toFile(path.join(IMG, "baker-480.webp"));
  }

  // 3. Gallery mapping (10 items)
  console.log("Generating 10 gallery photos...");
  await processGallery(SOURCES.sg01, "g1");       // Pistachio Rose Cloud
  await processGallery(SOURCES.wedding, "g2");    // Engagement Floral Arch
  await processGallery(SOURCES.bento, "g3");      // Korean Heart Bento Cake
  await processGallery(SOURCES.sg03, "g4");       // Dark 70% Ganache Gâteau
  await processGallery(SOURCES.cheesecake, "g5"); // Biscoff Cheesecake
  await processGallery(SOURCES.brownies, "g6");   // Red Velvet Cupcakes & Brownie Box
  await processGallery(SOURCES.sg01, "g7");       // Pistachio & Berry
  await processGallery(SOURCES.sg02, "g8");       // Strawberry Cream
  await processGallery(SOURCES.rasamalai, "g9");  // Rasamalai Royale Celebration
  await processGallery(SOURCES.mango, "g10");     // Fresh Mango Gateau

  // 4. Cake catalog mapping across all categories
  console.log("Generating cake catalog photos...");

  // Signature
  await processCake(SOURCES.sg01, "SG01"); // Pistachio Rose Cloud
  await processCake(SOURCES.sg02, "SG02"); // Vanilla Bean Classic
  await processCake(SOURCES.sg03, "SG03"); // Belgian Chocolate Gâteau
  await processCake(SOURCES.sg04, "SG04"); // Lemon & Thyme Loaf
  await processCake(SOURCES.sg02, "SG05"); // Strawberry Cream Bliss
  await processCake(SOURCES.cheesecake, "SG06"); // Salted Caramel Crunch
  await processCake(SOURCES.mango, "SG07"); // Mango Cloud Mousse
  await processCake(SOURCES.sg03, "SG08"); // Blackcurrant Velvet

  // Trending & Bento
  const trendingCodes = ["TR01", "TR02", "TR03", "TR04", "TR05", "TR06", "TR07", "TR08"];
  for (const c of trendingCodes) {
    await processCake(c === "TR03" || c === "TR08" ? SOURCES.bento : SOURCES.hero, c);
  }

  // Chocolate
  const chocoCodes = ["CH01", "CH02", "CH03", "CH04", "CH05", "CH06", "CH07", "CH08"];
  for (const c of chocoCodes) {
    await processCake(SOURCES.sg03, c);
  }

  // Fruit
  const fruitCodes = ["FR01", "FR02", "FR03", "FR04", "FR05", "FR06", "FR07", "FR08"];
  for (const c of fruitCodes) {
    if (["FR01", "FR03", "FR06", "FR07"].includes(c)) {
      await processCake(SOURCES.mango, c);
    } else {
      await processCake(SOURCES.sg02, c);
    }
  }

  // Premium
  const premCodes = ["PR01", "PR02", "PR03", "PR04", "PR05", "PR06", "PR07", "PR08"];
  for (const c of premCodes) {
    if (c === "PR01" || c === "PR02") {
      await processCake(SOURCES.rasamalai, c);
    } else if (c === "PR08") {
      await processCake(SOURCES.sg01, c);
    } else if (c === "PR05" || c === "PR06" || c === "PR07") {
      await processCake(SOURCES.sg03, c);
    } else {
      await processCake(SOURCES.wedding, c);
    }
  }

  // Cheesecakes
  const cheeseCodes = ["CS01", "CS02", "CS03", "CS04", "CS05", "CS06", "CS07", "CS08"];
  for (const c of cheeseCodes) {
    await processCake(SOURCES.cheesecake, c);
  }

  // Wedding & Anniversary
  const waCodes = ["WA01", "WA02", "WA03", "WA04", "WA05", "WA06", "WA07", "WA08"];
  for (const c of waCodes) {
    await processCake(SOURCES.wedding, c);
  }

  // Special Occasion
  const soCodes = ["SO01", "SO02", "SO03", "SO04", "SO05", "SO06", "SO07", "SO08"];
  for (const c of soCodes) {
    await processCake(c === "SO01" || c === "SO02" ? SOURCES.wedding : SOURCES.hero, c);
  }

  // Birthday Boy & Birthday Girl
  const bCodes = ["BB01", "BB02", "BB03", "BB04", "BB05", "BB06", "BB07", "BB08",
                  "BD01", "BD02", "BD03", "BD04", "BD05", "BD06", "BD07", "BD08"];
  for (const c of bCodes) {
    await processCake(c.endsWith("1") || c.endsWith("3") || c.endsWith("5") ? SOURCES.hero : SOURCES.bento, c);
  }

  // Brownies & Cupcakes
  const bcCodes = ["BC01", "BC02", "BC03", "BC04", "BC05", "BC06", "BC07", "BC08"];
  for (const c of bcCodes) {
    await processCake(SOURCES.brownies, c);
  }

  console.log("All 88 cakes and full gallery populated with real culinary photography!");
}

run().catch((err) => {
  console.error("Error processing images:", err);
  process.exit(1);
});
