/*
 * Generates cakes.json from the lists below.
 * Run `node scripts/seed-catalog.js` after editing the seed lists.
 * After it runs, also run `npm run sync-fallback` so app.js keeps its offline copy.
 */
const fs = require("node:fs");
const path = require("node:path");

// [code, name, price at minWeight, minWeight, tags, noEggless, flavourChoice]
const SEED = {
  signature: [
    ["SG01", "Pistachio Rose Cloud", 1450, 1, ["bestseller", "premium"], false, true],
    ["SG02", "Vanilla Bean Classic", 950, 1, ["bestseller"], false, true],
    ["SG03", "Belgian Chocolate Gâteau", 1350, 1, ["bestseller"], false, true],
    ["SG04", "Lemon & Thyme Loaf", 750, 0.5, [], false, true],
    ["SG05", "Strawberry Cream Bliss", 1150, 1, [], false, true],
    ["SG06", "Salted Caramel Crunch", 1250, 1, ["trending"], false, true],
    ["SG07", "Mango Cloud Mousse", 1200, 1, ["seasonal"], false, true],
    ["SG08", "Blackcurrant Velvet", 1250, 1, [], false, true],
  ],
  trending: [
    ["TR01", "Unicorn Cloud Cake", 1400, 1, ["trending", "kids"], false, true],
    ["TR02", "Vintage Piped Cake", 1600, 1, ["trending", "premium"], false, true],
    ["TR03", "Heart Bento Cake", 650, 0.5, ["trending", "new"], false, true],
    ["TR04", "Teddy Cloud Cake", 1350, 1, ["trending", "kids"], false, true],
    ["TR05", "Chrome Number Cake", 1800, 1, ["trending", "premium"], false, true],
    ["TR06", "Pressed Flower Cake", 1700, 1, ["trending", "premium"], false, true],
    ["TR07", "Broken Heart Cake", 1250, 1, ["trending", "new"], false, true],
    ["TR08", "Happy Pill Bento", 600, 0.5, ["trending", "new"], false, true],
  ],
  chocolate: [
    ["CH01", "Triple Choco Fudge", 1300, 1, ["bestseller"], false, true],
    ["CH02", "Belgian Truffle", 1450, 1, ["bestseller"], false, true],
    ["CH03", "Ferrero Crunch", 1550, 1, [], false, true],
    ["CH04", "Nutella Hazelnut", 1500, 1, ["kids"], false, true],
    ["CH05", "Dark 70% Ganache", 1600, 1, ["premium"], false, true],
    ["CH06", "Choco Lava", 1350, 1, [], false, true],
    ["CH07", "Oreo Overload", 1400, 1, ["kids"], false, true],
    ["CH08", "Mocha Walnut", 1450, 1, [], false, true],
  ],
  fruit: [
    ["FR01", "Fresh Mango Gateau", 1150, 1, ["seasonal", "bestseller"], false, true],
    ["FR02", "Strawberry Cream", 1150, 1, [], false, true],
    ["FR03", "Pineapple Sunshine", 950, 1, [], false, true],
    ["FR04", "Black Forest", 1050, 1, ["bestseller"], false, true],
    ["FR05", "White Forest", 1100, 1, [], false, true],
    ["FR06", "Mixed Fruit Basket", 1200, 1, [], false, true],
    ["FR07", "Peach & Cream", 1250, 1, ["seasonal"], false, true],
    ["FR08", "Lychee Rose", 1350, 1, ["new"], false, true],
  ],
  premium: [
    ["PR01", "Saffron Kesar Pista", 1900, 1, ["premium", "bestseller"], false, true],
    ["PR02", "Rasamalai Royale", 1950, 1, ["premium", "new"], false, true],
    ["PR03", "Honey Almond Praline", 1800, 1, ["premium"], false, true],
    ["PR04", "Blueberry Mascarpone", 1750, 1, ["premium"], false, true],
    ["PR05", "Hazelnut Opera", 1900, 1, ["premium"], true, true],
    ["PR06", "Tiramisu Classico", 1850, 1, ["premium"], true, true],
    ["PR07", "Chocolate Praline Trio", 1950, 1, ["premium"], false, true],
    ["PR08", "Pistachio & Berry", 2000, 1, ["premium", "bestseller"], false, true],
  ],
  cheesecakes: [
    ["CS01", "Classic New York", 1500, 1, ["bestseller"], false, false],
    ["CS02", "Biscoff Cheesecake", 1650, 1, ["trending"], false, false],
    ["CS03", "Mango Cheesecake", 1550, 1, ["seasonal"], false, false],
    ["CS04", "Blueberry Cheesecake", 1600, 1, [], false, false],
    ["CS05", "Strawberry Cheesecake", 1600, 1, [], false, false],
    ["CS06", "Dark Chocolate Cheesecake", 1750, 1, ["premium"], false, false],
    ["CS07", "Pistachio Cheesecake", 1800, 1, ["premium", "new"], false, false],
    ["CS08", "Basque Burnt Cheesecake", 1700, 1, [], true, false],
  ],
  "special-occasion": [
    ["SO01", "Engagement Blush", 3200, 1.5, ["premium"], false, true],
    ["SO02", "Anniversary Gold", 2600, 1.5, ["premium"], false, true],
    ["SO03", "Baby Shower Cloud", 2200, 1, ["new"], false, true],
    ["SO04", "Farewell Fiesta", 1800, 1, [], false, true],
    ["SO05", "Congratulations Cake", 1900, 1, [], false, true],
    ["SO06", "Housewarming Bloom", 2000, 1, [], false, true],
    ["SO07", "Retirement Days", 2100, 1, [], false, true],
    ["SO08", "Festival Special", 1850, 1, ["seasonal"], false, true],
  ],
  "birthday-boy": [
    ["BB01", "Dino Adventure", 1450, 1, ["kids", "bestseller"], false, true],
    ["BB02", "Space Explorer", 1500, 1, ["kids"], false, true],
    ["BB03", "Football Fever", 1400, 1, ["kids"], false, true],
    ["BB04", "Racing Car", 1450, 1, ["kids"], false, true],
    ["BB05", "Superhero Cape", 1500, 1, ["kids"], false, true],
    ["BB06", "Jungle Safari", 1550, 1, ["kids", "new"], false, true],
    ["BB07", "Video Game", 1600, 1, ["kids", "trending"], false, true],
    ["BB08", "Robot Buddy", 1450, 1, ["kids"], false, true],
  ],
  "birthday-girl": [
    ["BD01", "Unicorn Dream Cake", 1450, 1, ["kids", "bestseller"], false, true],
    ["BD02", "Butterfly Meadow", 1450, 1, ["kids"], false, true],
    ["BD03", "Mermaid Tail", 1550, 1, ["kids", "trending"], false, true],
    ["BD04", "Ballet Shoes", 1450, 1, ["kids"], false, true],
    ["BD05", "Princess Crown", 1500, 1, ["kids"], false, true],
    ["BD06", "Flower Garden", 1400, 1, ["kids"], false, true],
    ["BD07", "Rainbow Cloud", 1450, 1, ["kids", "new"], false, true],
    ["BD08", "Teddy Picnic", 1400, 1, ["kids"], false, true],
  ],
  "wedding-anniversary": [
    ["WA01", "Two-Tier Ivory", 3800, 2, ["premium", "bestseller"], false, true],
    ["WA02", "Minimal Heart", 2800, 1.5, ["premium", "new"], false, true],
    ["WA03", "Gold Leaf Romance", 3500, 2, ["premium"], false, true],
    ["WA04", "Floral Arch", 3600, 2, ["premium", "trending"], false, true],
    ["WA05", "Red Velvet Duo", 3200, 1.5, ["premium"], false, true],
    ["WA06", "Pearl Cascade", 3700, 2, ["premium"], false, true],
    ["WA07", "Vintage Lace", 3400, 1.5, ["premium"], false, true],
    ["WA08", "Ever After", 3900, 2, ["premium", "bestseller"], false, true],
  ],
  "brownies-cupcakes": [
    ["BC01", "Fudge Brownie Box", 550, 0.5, ["bestseller"], false, false],
    ["BC02", "Walnut Brownie Box", 600, 0.5, [], false, false],
    ["BC03", "Blondie Box", 650, 0.5, ["new"], false, false],
    ["BC04", "Cupcake Box of Six", 700, 0.5, ["kids"], false, false],
    ["BC05", "Red Velvet Cupcakes", 750, 0.5, [], false, false],
    ["BC06", "Vanilla Confetti Cupcakes", 700, 0.5, ["kids"], false, false],
    ["BC07", "Chocolate Truffle Cupcakes", 750, 0.5, [], false, false],
    ["BC08", "Brownie & Cupcake Combo", 900, 1, ["bestseller"], false, false],
  ],
};

const cakes = [];
let order = 0;

for (const [category, rows] of Object.entries(SEED)) {
  for (const [code, name, price, minWeight, tags, noEggless, flavourChoice] of rows) {
    order += 1;
    cakes.push({
      code,
      name,
      category,
      price,
      minWeight,
      image: `images/cakes/${code}.webp`,
      flavourChoice,
      noEggless,
      tags,
      order,
    });
  }
}

const target = path.join(__dirname, "..", "cakes.json");
fs.writeFileSync(target, JSON.stringify(cakes, null, 2) + "\n");
console.log(`Wrote ${cakes.length} cakes to ${path.relative(process.cwd(), target)}`);
