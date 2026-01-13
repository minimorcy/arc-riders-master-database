
import https from 'https';

const url = 'https://github.com/RaidTheory/arcraiders-data/tree/main/hideout';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        // Look for links ending in .json
        // Pattern: href="/RaidTheory/arcraiders-data/blob/main/hideout/xyz.json"
        const regex = /href="\/RaidTheory\/arcraiders-data\/blob\/main\/hideout\/([^"]+\.json)"/g;
        let match;
        const files = new Set();
        while ((match = regex.exec(data)) !== null) {
            files.add(match[1]);
        }
        console.log('Found files:', Array.from(files));
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
