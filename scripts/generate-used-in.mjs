import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../src/data');
const ITEMS_FILE = path.join(DATA_DIR, 'arc_raiders_all_items.json');
const OUT_FILE = path.join(DATA_DIR, 'arc_raiders_all_items_augmented.json');

async function main() {
  try {
    const raw = await fs.readFile(ITEMS_FILE, 'utf8');
    const items = JSON.parse(raw);

    // Build map of id -> item
    const itemMap = new Map(items.map((it) => [it.id, it]));

    // Accumulate usedIn data
    const usedIn = {};

    for (const it of items) {
      if (it.recipe && typeof it.recipe === 'object') {
        const bench = it.craftBench || null;
        // recipe can be { itemId: qty } or an array in some datasets, but here it's object
        for (const ingredientId of Object.keys(it.recipe)) {
          const qty = typeof it.recipe[ingredientId] === 'number' ? it.recipe[ingredientId] : null;
          if (!usedIn[ingredientId]) usedIn[ingredientId] = [];
          usedIn[ingredientId].push({
            id: it.id,
            // store full name object so UI can render localized names
            name: it.name || { en: it.id },
            bench: bench,
            quantity: qty
          });
        }
      }
      // Some items may have 'craft' or other structures in future; extend here if needed
    }

    // Attach usedIn arrays to items
    const augmented = items.map((it) => {
      const copy = { ...it };
      if (usedIn[it.id]) {
        copy.usedIn = usedIn[it.id];
      }
      return copy;
    });

    await fs.writeFile(OUT_FILE, JSON.stringify(augmented, null, 2));
    console.log(`Wrote augmented items to ${OUT_FILE}`);
  } catch (err) {
    console.error('Error generating usedIn data:', err);
    process.exit(1);
  }
}

main();
