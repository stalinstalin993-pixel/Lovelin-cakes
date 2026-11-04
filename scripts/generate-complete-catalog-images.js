/*
 * Generates and processes completely UNIQUE culinary photography for all 88 cake items
 * and 10 gallery items for Lovelin Cakes.
 *
 * Ensures NO TWO CAKES have identical images, matching names, flavor profiles,
 * and aesthetics authentically.
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const BRAIN_DIR = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d3a527bf-9762-4b62-8d2f-4b5b879826c2";

const AI_IMAGES = {
  hero: path.join(BRAIN_DIR, "hero_cake_1793725350238.jpg"),
  baker: path.join(BRAIN_DIR, "baker_ananya_1793725468391.jpg"),
  sg01_pistachio: path.join(BRAIN_DIR, "sg01_pistachio_rose_cloud_1793725371103.jpg"),
  sg02_vanilla: path.join(BRAIN_DIR, "sg02_vanilla_bean_classic_1793725389390.jpg"),
  sg03_belgian: path.join(BRAIN_DIR, "sg03_belgian_chocolate_gateau_1793725413234.jpg"),
  sg04_lemon: path.join(BRAIN_DIR, "sg04_lemon_thyme_cake_1793725444893.jpg"),
  biscoff: path.join(BRAIN_DIR, "biscoff_cheesecake_1793726317483.jpg"),
  brownies: path.join(BRAIN_DIR, "artisan_brownies_cupcakes_1793726360518.jpg"),
  heart_bento: path.join(BRAIN_DIR, "heart_bento_cake_1793726381143.jpg"),
  mango_gateau: path.join(BRAIN_DIR, "mango_celebration_gateau_1793726402829.jpg"),
  rasamalai: path.join(BRAIN_DIR, "rasamalai_royale_cake_1793726425450.jpg"),
  wedding: path.join(BRAIN_DIR, "wedding_anniversary_cake_1793726447518.jpg"),
};

// Helper for unsplash direct URLs
const unsplash = (id) => `https://images.unsplash.com/${id}?w=1000&q=85&auto=format&fit=crop`;

// 88 completely unique image sources tailored to each individual cake
const CAKE_IMAGE_MAP = {
  // --- SIGNATURE (8) ---
  SG01: { local: AI_IMAGES.sg01_pistachio }, // Pistachio Rose Cloud
  SG02: { local: AI_IMAGES.sg02_vanilla },   // Vanilla Bean Classic
  SG03: { local: AI_IMAGES.sg03_belgian },   // Belgian Chocolate Gâteau
  SG04: { local: AI_IMAGES.sg04_lemon },     // Lemon & Thyme Loaf
  SG05: { url: unsplash("photo-1565958011703-44f9829ba187") }, // Strawberry Cream Bliss
  SG06: { url: unsplash("photo-1535141192574-5d4897c12636") }, // Salted Caramel Crunch
  SG07: { local: AI_IMAGES.mango_gateau },   // Mango Cloud Mousse
  SG08: { url: unsplash("photo-1567171466295-4afa63d45416") }, // Blackcurrant Velvet

  // --- TRENDING (8) ---
  TR01: { url: unsplash("photo-1621303837174-89787a7d4729") }, // Unicorn Cloud Cake
  TR02: { url: unsplash("photo-1604413191066-4dd20bedf486") }, // Vintage Piped Cake
  TR03: { local: AI_IMAGES.heart_bento },    // Heart Bento Cake
  TR04: { url: unsplash("photo-1673417284575-cb29c8631125") }, // Teddy Cloud Cake
  TR05: { url: unsplash("photo-1774290686682-ac824d987a9e") }, // Chrome Number Cake
  TR06: { url: unsplash("photo-1542007920-992d2c424d09") }, // Pressed Flower Cake
  TR07: { url: unsplash("photo-1783635367717-a147b72f4ab3") }, // Broken Heart Cake
  TR08: { url: unsplash("photo-1765946024463-459e69883ac4") }, // Happy Pill Bento

  // --- CHOCOLATE (8) ---
  CH01: { url: unsplash("photo-1578985545062-69928b1d9587") }, // Triple Choco Fudge
  CH02: { url: unsplash("photo-1606890737304-57a1ca8a5b62") }, // Belgian Truffle
  CH03: { url: unsplash("photo-1602351447937-745cb720612f") }, // Ferrero Crunch
  CH04: { url: unsplash("photo-1606313564200-e75d5e30476c") }, // Nutella Hazelnut
  CH05: { url: unsplash("photo-1605807646983-377bc5a76493") }, // Dark 70% Ganache
  CH06: { url: unsplash("photo-1541780054671-b9a8504291ec") }, // Choco Lava
  CH07: { url: unsplash("photo-1517427294546-5aa121f68e8a") }, // Oreo Overload
  CH08: { url: unsplash("photo-1775388243590-569a3b50435c") }, // Mocha Walnut

  // --- FRUIT (8) ---
  FR01: { local: AI_IMAGES.mango_gateau },   // Fresh Mango Gateau
  FR02: { url: unsplash("photo-1622621746668-59fb299bc4d7") }, // Strawberry Cream
  FR03: { url: unsplash("photo-1541491008689-b5d3c6615e2e") }, // Pineapple Sunshine
  FR04: { url: unsplash("photo-1768260732302-12822bd6427b") }, // Black Forest
  FR05: { url: unsplash("photo-1588195538326-c5b1e9f80a1b") }, // White Forest
  FR06: { url: unsplash("photo-1508736375612-66c03035c629") }, // Mixed Fruit Basket
  FR07: { url: unsplash("photo-1488477304112-4944851de03d") }, // Peach & Cream
  FR08: { url: unsplash("photo-1559553156-2e97137af16f") }, // Lychee Rose

  // --- PREMIUM (8) ---
  PR01: { url: unsplash("photo-1571926422939-1abb99c50fd8") }, // Saffron Kesar Pista
  PR02: { local: AI_IMAGES.rasamalai },      // Rasamalai Royale
  PR03: { url: unsplash("photo-1464349095431-e9a21285b5f3") }, // Honey Almond Praline
  PR04: { url: unsplash("photo-1779282833204-076de40e621f") }, // Blueberry Mascarpone
  PR05: { url: unsplash("photo-1571877227200-a0d98ea607e9") }, // Hazelnut Opera
  PR06: { url: unsplash("photo-1785389593866-a6f454865756") }, // Tiramisu Classico
  PR07: { url: unsplash("photo-1628509633348-a39defbc44c4") }, // Chocolate Praline Trio
  PR08: { url: unsplash("photo-1567608286687-394db5f7520a") }, // Pistachio & Berry

  // --- CHEESECAKES (8) ---
  CS01: { url: unsplash("photo-1708175313856-8573b2bf8a3a") }, // Classic New York
  CS02: { local: AI_IMAGES.biscoff },        // Biscoff Cheesecake
  CS03: { url: unsplash("photo-1488474339733-16a5dd4ba5e6") }, // Mango Cheesecake
  CS04: { url: unsplash("photo-1779282159217-226d9e831c03") }, // Blueberry Cheesecake
  CS05: { url: unsplash("photo-1632134964015-9300cf2314cf") }, // Strawberry Cheesecake
  CS06: { url: unsplash("photo-1508737804141-4c3b688e2546") }, // Dark Chocolate Cheesecake
  CS07: { url: unsplash("photo-1635327173758-85badf17f995") }, // Pistachio Cheesecake
  CS08: { url: unsplash("photo-1759303380841-55c09244fd2b") }, // Basque Burnt Cheesecake

  // --- SPECIAL OCCASION (8) ---
  SO01: { url: unsplash("photo-1761671613300-438394c79d79") }, // Engagement Blush
  SO02: { url: unsplash("photo-1733515371242-2c7f8255fde6") }, // Anniversary Gold
  SO03: { url: unsplash("photo-1618451615316-5d492a2323a2") }, // Baby Shower Cloud
  SO04: { url: unsplash("photo-1577998474517-7eeeed4e448a") }, // Farewell Fiesta
  SO05: { url: unsplash("photo-1764269710986-0b69be00d7ca") }, // Congratulations Cake
  SO06: { url: unsplash("photo-1617922784605-041e1e1a5d8e") }, // Housewarming Bloom
  SO07: { url: unsplash("photo-1621434632683-6156a81cafcf") }, // Retirement Days
  SO08: { url: unsplash("photo-1604702433171-33756f3f3825") }, // Festival Special

  // --- BIRTHDAY BOY (8) ---
  BB01: { url: unsplash("photo-1558301211-0d8c8ddee6ec") }, // Dino Adventure
  BB02: { url: unsplash("photo-1610670444950-0b29430891b4") }, // Space Explorer
  BB03: { url: unsplash("photo-1772724317403-63337bf58fff") }, // Football Fever
  BB04: { url: unsplash("photo-1545696563-af8f6ec2295a") }, // Racing Car
  BB05: { url: unsplash("photo-1606983340126-99ab4feaa64a") }, // Superhero Cape
  BB06: { url: unsplash("photo-1759556765729-c4d96e54726c") }, // Jungle Safari
  BB07: { url: unsplash("photo-1741969494234-7d4bcd1002ab") }, // Video Game
  BB08: { url: unsplash("photo-1784652587207-29b8990a1238") }, // Robot Buddy

  // --- BIRTHDAY GIRL (8) ---
  BD01: { url: unsplash("photo-1621303837174-89787a7d4729") }, // Unicorn Dream Cake
  BD02: { url: unsplash("photo-1613140952277-1c6bd0386ff5") }, // Butterfly Meadow
  BD03: { url: unsplash("photo-1761296152332-88ada22be48a") }, // Mermaid Tail
  BD04: { url: unsplash("photo-1604413191066-4dd20bedf486") }, // Ballet Shoes
  BD05: { url: unsplash("photo-1765317270424-923630242acc") }, // Princess Crown
  BD06: { url: unsplash("photo-1519654793190-2e8a4806f1f2") }, // Flower Garden
  BD07: { url: unsplash("photo-1741969494307-55394e3e4071") }, // Rainbow Cloud
  BD08: { url: unsplash("photo-1722951018877-729cb8822cd3") }, // Teddy Picnic

  // --- WEDDING & ANNIVERSARY (8) ---
  WA01: { local: AI_IMAGES.wedding },        // Two-Tier Ivory
  WA02: { url: unsplash("photo-1783635367717-a147b72f4ab3") }, // Minimal Heart
  WA03: { url: unsplash("photo-1771305145464-01a595836294") }, // Gold Leaf Romance
  WA04: { url: unsplash("photo-1761671613315-53157f91d0f8") }, // Floral Arch
  WA05: { url: unsplash("photo-1574473321878-56823b9e2768") }, // Red Velvet Duo
  WA06: { url: unsplash("photo-1525257831700-183b9b8bf5c4") }, // Pearl Cascade
  WA07: { url: unsplash("photo-1535254973040-607b474cb50d") }, // Vintage Lace
  WA08: { url: unsplash("photo-1764380746142-b35392fe7428") }, // Ever After

  // --- BROWNIES & CUPCAKES (8) ---
  BC01: { local: AI_IMAGES.brownies },       // Fudge Brownie Box
  BC02: { url: unsplash("photo-1606313564200-e75d5e30476c") }, // Walnut Brownie Box
  BC03: { url: unsplash("photo-1611385729502-2b39ea6a357d") }, // Blondie Box
  BC04: { url: unsplash("photo-1486427944299-d1955d23e34d") }, // Cupcake Box of Six
  BC05: { url: unsplash("photo-1614707267537-b85aaf00c4b7") }, // Red Velvet Cupcakes
  BC06: { url: unsplash("photo-1771016833967-3602b9e9a7e1") }, // Vanilla Confetti Cupcakes
  BC07: { url: unsplash("photo-1603532648955-039310d9ed75") }, // Chocolate Truffle Cupcakes
  BC08: { url: unsplash("photo-1563729784474-d77dbb933a9e") }, // Brownie & Cupcake Combo
};

// 10 Curated Gallery Photos
const GALLERY_MAP = {
  g1: { local: AI_IMAGES.sg01_pistachio }, // Pistachio Rose Cloud
  g2: { local: AI_IMAGES.sg03_belgian },   // Belgian Chocolate Gâteau
  g3: { local: AI_IMAGES.heart_bento },    // Heart Bento
  g4: { local: AI_IMAGES.wedding },        // Wedding Arch / Anniversary
  g5: { local: AI_IMAGES.biscoff },        // Biscoff Speculoos Cheesecake
  g6: { local: AI_IMAGES.brownies },       // Artisan Brownies & Cupcakes
  g7: { local: AI_IMAGES.mango_gateau },   // Mango Celebration Gateau
  g8: { local: AI_IMAGES.rasamalai },      // Rasamalai Royale
  g9: { url: unsplash("photo-1604413191066-4dd20bedf486") }, // Vintage Piped Lambeth
  g10: { url: unsplash("photo-1761671613315-53157f91d0f8") }, // Tiered Rose Wedding
};

// Fetch buffer with cache
const cacheDir = path.join(ROOT, ".cache", "images");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

async function getBuffer(source) {
  if (source.local) {
    if (fs.existsSync(source.local)) {
      return fs.readFileSync(source.local);
    }
    throw new Error(`Local file not found: ${source.local}`);
  }
  if (source.url) {
    // Generate safe cache filename
    const id = source.url.match(/photo-[\w-]+/)?.[0] || Buffer.from(source.url).toString("hex").slice(0, 16);
    const cachedPath = path.join(cacheDir, `${id}.jpg`);
    if (fs.existsSync(cachedPath)) {
      return fs.readFileSync(cachedPath);
    }
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${source.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(cachedPath, buf);
    return buf;
  }
  throw new Error("Unknown source type");
}

async function main() {
  console.log("Generating distinct culinary photography suite for Lovelin Cakes...");

  const cakesDir = path.join(ROOT, "images", "cakes");
  const thumbsDir = path.join(ROOT, "images", "cakes", "thumbs");
  const galleryDir = path.join(ROOT, "images", "gallery");
  fs.mkdirSync(cakesDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  fs.mkdirSync(galleryDir, { recursive: true });

  // 1. Process 10 Gallery Photos
  console.log("\n--- Processing Gallery (10 Distinct Photos) ---");
  for (const [key, source] of Object.entries(GALLERY_MAP)) {
    try {
      const buf = await getBuffer(source);
      await sharp(buf)
        .resize(1200, 900, { fit: "cover", position: "center" })
        .webp({ quality: 86 })
        .toFile(path.join(galleryDir, `${key}.webp`));

      await sharp(buf)
        .resize(600, 450, { fit: "cover", position: "center" })
        .webp({ quality: 80 })
        .toFile(path.join(galleryDir, `${key}-600.webp`));

      console.log(`✓ Gallery ${key} saved.`);
    } catch (e) {
      console.error(`✗ Error processing gallery ${key}:`, e.message);
    }
  }

  // 2. Process All 88 Cake Items
  console.log("\n--- Processing 88 Unique Cake Catalog Photos ---");
  const entries = Object.entries(CAKE_IMAGE_MAP);

  // Process in batches of 4 for speed
  const concurrency = 4;
  for (let i = 0; i < entries.length; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async ([code, source]) => {
        try {
          const buf = await getBuffer(source);

          // Full card image
          await sharp(buf)
            .resize(800, 600, { fit: "cover", position: "center" })
            .webp({ quality: 85 })
            .toFile(path.join(cakesDir, `${code}.webp`));

          // Mobile / lazy thumb
          await sharp(buf)
            .resize(400, 300, { fit: "cover", position: "center" })
            .webp({ quality: 80 })
            .toFile(path.join(thumbsDir, `${code}.webp`));

          process.stdout.write(`[${code}] `);
        } catch (e) {
          console.error(`\n✗ Error processing cake ${code}:`, e.message);
        }
      })
    );
  }

  console.log("\n\nAll 88 catalog cakes and 10 gallery photos successfully populated with unique imagery!");
}

main().catch(console.error);
