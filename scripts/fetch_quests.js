import fs from 'fs/promises';
import path from 'path';

const REPO_OWNER = 'RaidTheory';
const REPO_NAME = 'arcraiders-data';
const QUESTS_PATH = 'quests';
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'quests.json');

async function fetchQuests() {
    try {
        console.log(`Fetching file list from ${REPO_OWNER}/${REPO_NAME}...`);
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${QUESTS_PATH}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch file list: ${response.statusText}`);
        }

        const files = await response.json();
        const jsonFiles = files.filter(file => file.name.endsWith('.json'));

        console.log(`Found ${jsonFiles.length} quest files. Downloading...`);

        const quests = [];

        // Process in chunks to avoid hitting rate limits too hard/fast
        const CHUNK_SIZE = 5;
        for (let i = 0; i < jsonFiles.length; i += CHUNK_SIZE) {
            const chunk = jsonFiles.slice(i, i + CHUNK_SIZE);
            const promises = chunk.map(async (file) => {
                const fileRes = await fetch(file.download_url);
                if (!fileRes.ok) {
                    console.error(`Failed to fetch ${file.name}: ${fileRes.statusText}`);
                    return null;
                }
                return fileRes.json();
            });

            const results = await Promise.all(promises);
            quests.push(...results.filter(q => q !== null));
            console.log(`Processed ${Math.min(i + CHUNK_SIZE, jsonFiles.length)}/${jsonFiles.length}`);
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(quests, null, 2));
        console.log(`Successfully saved ${quests.length} quests to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error fetching quests:', error);
    }
}

fetchQuests();
