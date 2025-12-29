
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DRIVE_FOLDER = path.join(rootDir, 'drive-download-20251228T043919Z-1-001');

async function analyze() {
    console.log('Analyzing properties in:', DRIVE_FOLDER);

    if (!fs.existsSync(DRIVE_FOLDER)) {
        console.error(`Folder not found: ${DRIVE_FOLDER}`);
        return;
    }

    const entries = fs.readdirSync(DRIVE_FOLDER, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());

    const report = {
        eligible: [] as any[],
        ineligible: [] as any[],
        videosToUpload: [] as any[]
    };

    for (const folder of folders) {
        const folderPath = path.join(DRIVE_FOLDER, folder.name);
        const name = folder.name;

        const subFolders = fs.readdirSync(folderPath, { withFileTypes: true }).filter(e => e.isDirectory());
        const findFolder = (regex: RegExp) => subFolders.find(f => regex.test(f.name))?.name;

        // 1. Check Description
        const descFolderName = findFolder(/^descripci[oó]n.*$/i);
        let hasDescription = false;
        if (descFolderName) {
            const descDir = path.join(folderPath, descFolderName);
            const docx = fs.readdirSync(descDir).filter(f => f.endsWith('.docx'));
            if (docx.length > 0) hasDescription = true;
        }

        // 2. Count Images
        let imageCount = 0;
        const imgExts = /\.(jpg|jpeg|png|webp|jfif)$/i;

        const renderFolderName = findFolder(/^render.*$/i);
        if (renderFolderName) {
            const renderDir = path.join(folderPath, renderFolderName);
            imageCount += fs.readdirSync(renderDir).filter(f => imgExts.test(f)).length;
        }

        const fotosFolderName = findFolder(/^fotos.*$/i);
        if (fotosFolderName) {
            const fotosDir = path.join(folderPath, fotosFolderName);
            imageCount += fs.readdirSync(fotosDir).filter(f => imgExts.test(f)).length;
        }

        // 3. Videos
        let videos = [] as string[];
        const videoFolderName = findFolder(/^video.*$/i);
        if (videoFolderName) {
            const videoDir = path.join(folderPath, videoFolderName);
            videos = fs.readdirSync(videoDir).filter(f => /\.(mp4|webm|ogg|mov)$/i.test(f));
        }

        const criteria = {
            hasDescription,
            imageCount,
            validImageCount: imageCount >= 5
        };

        const isEligible = criteria.hasDescription && criteria.validImageCount;

        const propertyData = {
            name,
            ...criteria,
            videoCount: videos.length
        };

        if (isEligible) {
            report.eligible.push(propertyData);
            if (videos.length > 0) {
                report.videosToUpload.push({
                    propertyName: name,
                    videos
                });
            }
        } else {
            report.ineligible.push({
                ...propertyData,
                reason: !criteria.hasDescription ? 'Missing Description' : 'Invalid Image Count'
            });
        }
    }

    console.log('\n--- ANALYSIS REPORT ---\n');
    console.log(`Total Folders Scanned: ${folders.length}`);
    console.log(`Eligible Properties: ${report.eligible.length}`);
    console.log(`Ineligible Properties: ${report.ineligible.length}`);

    console.log('\n--- ELIGIBLE PROPERTIES ---');
    report.eligible.forEach(p => console.log(`[PASS] ${p.name} (Images: ${p.imageCount}, Videos: ${p.videoCount})`));

    console.log('\n--- INELIGIBLE PROPERTIES ---');
    report.ineligible.forEach(p => console.log(`[FAIL] ${p.name} - Reason: ${p.reason} (Images: ${p.imageCount}, Desc: ${p.hasDescription})`));

    // Save logs
    fs.writeFileSync(path.join(rootDir, 'analysis_report.json'), JSON.stringify(report, null, 2));
    if (report.videosToUpload.length > 0) {
        fs.writeFileSync(path.join(rootDir, 'videos_to_upload.json'), JSON.stringify(report.videosToUpload, null, 2));
        console.log(`\n[INFO] Generated 'videos_to_upload.json' with ${report.videosToUpload.length} entries.`);
    }
}

analyze().catch(console.error);
