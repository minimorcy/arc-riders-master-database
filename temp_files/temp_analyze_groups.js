
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

// Analyze Workshop Items
const categorized = JSON.parse(fs.readFileSync('./src/data/arc_raiders_categorized.json', 'utf8'));
const workshopItems = categorized.workshop || [];

const types = new Set();
const benches = new Set();

workshopItems.forEach(item => {
    if (item.type) types.add(item.type);
    if (item.craftBench) benches.add(item.craftBench);
});

console.log('Workshop Item Types:', Array.from(types));
console.log('Workshop Item Benches:', Array.from(benches));

// Re-verify all benches from all items
const allItems = JSON.parse(fs.readFileSync('./src/data/arc_raiders_all_items.json', 'utf8'));
const allBenches = new Set();
allItems.forEach(item => {
    if (item.craftBench) allBenches.add(item.craftBench);
});
console.log('ALL Benches in DB:', Array.from(allBenches));
