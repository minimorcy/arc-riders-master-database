
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/arc_raiders_all_items.json', 'utf8'));

const benches = new Set();
data.forEach(item => {
    if (item.craftBench) {
        benches.add(item.craftBench);
    }
});

console.log('Found benches:', Array.from(benches));
