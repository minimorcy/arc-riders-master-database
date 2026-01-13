
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('./src/data/arc_raiders_categorized.json', 'utf8'));
console.log(Object.keys(data));
