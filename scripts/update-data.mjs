import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../src/data');

// URLs for the raw JSON data from RaidTheory GitHub
const BASE_URL = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main';
const FILES = {
    'arc_raiders_all_items.json': `${BASE_URL}/items.json`, // Assuming items.json is the main one, we might need to adjust based on actual repo structure
    // We might need to process the data to resemble 'categorized' or just fetch what is available.
    // Let's assume we fetch the main 'items.json' and 'categories.json' if it exists, or just items.
};

// Check if raw URL is correct. The search result said 'RaidTheory/arcraiders-data'.
// Let's try to fetch 'items.json' first.

const BENCHES = [
    'weapon_bench',
    'med_station',
    'utility_bench',
    'explosives_bench',
    'equipment_bench',
    'gear_bench', // Trying 'gear' just in case equipment is not it
    'scrappy'
];

async function updateData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Ensure data directory exists: ${DATA_DIR}`);

        // Fetch known files
        const FETCH_FILES = {
            'arc_raiders_all_items.json': 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/items.json',
            'arc_raiders_categorized.json': 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/categorized.json'
        };

        for (const [localName, url] of Object.entries(FETCH_FILES)) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    await fs.writeFile(path.join(DATA_DIR, localName), JSON.stringify(data, null, 2));
                    console.log(`Fetched ${localName}`);
                } else {
                    console.warn(`Failed to fetch ${url}: ${response.status}`);
                }
            } catch (e) {
                console.warn(`Error fetching ${localName}, using local fallback if available.`);
            }
        }

        // Fetch Hideout Data
        const hideoutDir = path.join(DATA_DIR, 'hideout');
        await fs.mkdir(hideoutDir, { recursive: true });

        for (const bench of BENCHES) {
            const url = `https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/hideout/${bench}.json`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    await fs.writeFile(path.join(hideoutDir, `${bench}.json`), JSON.stringify(data, null, 2));
                    console.log(`Fetched hideout/${bench}.json`);
                } else {
                    console.warn(`Failed to fetch ${bench}: ${response.status}`);
                }
            } catch (e) {
                console.warn(`Error fetching hideout bench ${bench}`);
            }
        }

    } catch (error) {
        console.error('Error updating data:', error);
        process.exit(1);
    }
}

updateData();
