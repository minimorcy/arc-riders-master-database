import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../src/data');
const HIDEOUT_DIR = path.join(DATA_DIR, 'hideout');
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/data');

const BASE_URL = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main';

const BENCHES = [
  'weapon_bench',
  'med_station',
  'utility_bench',
  'explosives_bench',
  'equipment_bench',
  'scrappy',
  'refiner',
  'workbench',
];

async function getItemFilesList() {
  try {
    console.log('  → Fetching list of item files from GitHub...');
    const response = await fetch(
      'https://api.github.com/repos/RaidTheory/arcraiders-data/contents/items?ref=main'
    );
    if (!response.ok) {
      console.log('    ✗ Could not fetch items list');
      return [];
    }
    const files = await response.json();
    return files
      .filter(f => f.name.endsWith('.json'))
      .map(f => f.name)
      .sort();
  } catch (error) {
    console.log(`    ✗ Error: ${error.message}`);
    return [];
  }
}

async function fetchAndConsolidateItems(itemFiles) {
  console.log(`📥 Fetching ${itemFiles.length} individual item files...\n`);
  
  const allItems = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < itemFiles.length; i++) {
    const filename = itemFiles[i];
    const url = `${BASE_URL}/items/${filename}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const itemData = await response.json();
        allItems.push(itemData);
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      failCount++;
    }

    // Show progress every 50 items
    if ((i + 1) % 50 === 0 || i === itemFiles.length - 1) {
      const percent = Math.round(((i + 1) / itemFiles.length) * 100);
      console.log(`  → Progress: ${i + 1}/${itemFiles.length} (${percent}%) - ${successCount} ✓, ${failCount} ✗`);
    }
  }

  console.log(`\n✓ Successfully fetched ${successCount} items\n`);
  return allItems;
}

async function addUsedInRelationships(items) {
  console.log('🔗 Building usedIn relationships...');
  
  // Create item map for quick lookup
  const itemMap = new Map();
  items.forEach(item => {
    if (item.id) itemMap.set(item.id, item);
  });

  let totalUsages = 0;

  // Add usedIn relationships
  for (const item of items) {
    item.usedIn = [];
    
    // Find all items that use this item in their recipe
    for (const otherItem of items) {
      if (otherItem.recipe && typeof otherItem.recipe === 'object') {
        for (const [ingredientId, quantity] of Object.entries(otherItem.recipe)) {
          if (ingredientId === item.id) {
            const benchName = otherItem.craftBench || 'Unknown';
            item.usedIn.push({
              id: otherItem.id,
              name: otherItem.name,
              bench: benchName,
              quantity: quantity
            });
            totalUsages++;
          }
        }
      }
    }
  }

  console.log(`✓ Added ${totalUsages} usedIn relationships\n`);
  return items;
}

async function saveUpdateMetadata() {
  const now = new Date();
  const metadata = {
    lastUpdated: now.toISOString(),
    lastUpdatedDate: now.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    timestamp: now.getTime()
  };
  
  const metadataPath = path.join(DATA_DIR, 'update-metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  // Also write to public so the dev server can serve it at /data/update-metadata.json
  try {
    await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
    const publicPath = path.join(PUBLIC_DATA_DIR, 'update-metadata.json');
    await fs.writeFile(publicPath, JSON.stringify(metadata, null, 2));
  } catch (err) {
    console.warn('Could not write metadata to public folder:', err.message);
  }
  
  return metadata;
}

async function main() {
  try {
    console.log('🚀 Starting Arc Raiders data update...\n');

    // Ensure directories exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(HIDEOUT_DIR, { recursive: true });
    console.log('✓ Data directories ready\n');

    // === FETCH AND CONSOLIDATE ITEMS ===
    console.log('📦 Fetching item files...');
    const itemFiles = await getItemFilesList();
    
    let allItems = [];
    if (itemFiles.length > 0) {
      allItems = await fetchAndConsolidateItems(itemFiles);
      
      // Add usedIn relationships
      allItems = await addUsedInRelationships(allItems);

      // Save consolidated file
      const itemsPath = path.join(DATA_DIR, 'arc_raiders_all_items.json');
      await fs.writeFile(itemsPath, JSON.stringify(allItems, null, 2));
      console.log(`✓ Saved ${allItems.length} items to arc_raiders_all_items.json\n`);
    } else {
      console.log('✗ Could not fetch items from GitHub\n');
    }

    // === FETCH HIDEOUT BENCHES ===
    console.log('🏗️  Fetching hideout bench files...');
    let benchSuccess = 0;
    for (const bench of BENCHES) {
      const url = `${BASE_URL}/hideout/${bench}.json`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const filepath = path.join(HIDEOUT_DIR, `${bench}.json`);
          await fs.writeFile(filepath, JSON.stringify(data, null, 2));
          console.log(`  → ${bench}: ✓`);
          benchSuccess++;
        } else {
          console.log(`  → ${bench}: ✗ (${response.status})`);
        }
      } catch (error) {
        console.log(`  → ${bench}: ✗`);
      }
    }
    console.log(`✓ Updated ${benchSuccess}/${BENCHES.length} benches\n`);

    // === SAVE UPDATE METADATA ===
    const metadata = await saveUpdateMetadata();

    // === SUMMARY ===
    console.log('═══════════════════════════════════════');
    console.log('✅ Data update completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   • Items: ${allItems.length} with usedIn relationships`);
    console.log(`   • Benches: ${benchSuccess}/${BENCHES.length}`);
    console.log(`\n⏰ Last Updated: ${metadata.lastUpdatedDate}`);
    console.log(`\nRun 'npm run update-data' to update periodically!`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
