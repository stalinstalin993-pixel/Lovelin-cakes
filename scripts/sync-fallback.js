/*
 * Keeps the embedded offline catalog in app.js in sync with cakes.json.
 * Runs automatically before every production CSS build.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const cakes = JSON.parse(fs.readFileSync(path.join(root, "cakes.json"), "utf8"));
const appPath = path.join(root, "app.js");

if (!Array.isArray(cakes) || !cakes.length) {
  console.error("cakes.json is empty; refusing to overwrite the fallback.");
  process.exit(1);
}

const rows = cakes
  .map((cake) =>
    `    ${JSON.stringify([
      cake.code,
      cake.name,
      cake.category,
      cake.price,
      cake.minWeight,
      cake.flavourChoice ? 1 : 0,
      cake.noEggless ? 1 : 0,
      cake.tags,
      cake.order,
    ])},`
  )
  .join("\n");

const block = `  // >>> FALLBACK_CATALOG
  // Compact offline copy: code, name, category, price, minWeight,
  // flavourChoice (1/0), noEggless (1/0), tags, order.
  const FALLBACK_ROWS = [
${rows}
  ];
  const FALLBACK_CATALOG = FALLBACK_ROWS.map(
    ([code, name, category, price, minWeight, flavourChoice, noEggless, tags, order]) => ({
      code,
      name,
      category,
      price,
      minWeight,
      image: \`images/cakes/\${code}.webp\`,
      flavourChoice: Boolean(flavourChoice),
      noEggless: Boolean(noEggless),
      tags,
      order,
    })
  );
  // <<< FALLBACK_CATALOG`;

const source = fs.readFileSync(appPath, "utf8");
const pattern = / {2}\/\/ >>> FALLBACK_CATALOG[\s\S]*?\/\/ <<< FALLBACK_CATALOG/;

if (!pattern.test(source)) {
  console.error("Fallback markers not found in app.js.");
  process.exit(1);
}

fs.writeFileSync(appPath, source.replace(pattern, block));
console.log(`Synced ${cakes.length} cakes into app.js fallback.`);
