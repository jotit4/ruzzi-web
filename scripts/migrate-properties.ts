
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';

// Load environment variables from .env and .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key. Please check .env or .env.local');
    console.error('REQUIRED: SUPABASE_SERVICE_ROLE_KEY for admin operations (deleting/inserting).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

// Helper to find folder case-insensitive
function findFolder(parentDir: string, regex: RegExp): string | undefined {
    if (!fs.existsSync(parentDir)) return undefined;
    const sub = fs.readdirSync(parentDir, { withFileTypes: true });
    return sub.find(d => d.isDirectory() && regex.test(d.name))?.name;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (err) {
        console.error(`Error reading docx ${filePath}:`, err);
        return '';
    }
}

async function uploadImage(filePath: string, fileName: string): Promise<string | null> {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const { data, error } = await supabase.storage
            .from('property-images')
            .upload(`migration/${Date.now()}_${fileName}`, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            console.error(`Failed to upload ${fileName}:`, error.message);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error(`Error uploading ${fileName}:`, err);
        return null;
    }
}

const DRIVE_FOLDER = path.join(rootDir, 'drive-download-20251228T043919Z-1-001');

async function migrate() {
    console.log('Starting migration...');

    // 1. Wipe existing properties
    console.log('Deleting existing properties...');
    const { error: deleteError } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (deleteError) {
        console.error('Error deleting properties:', deleteError.message);
        console.warn('Continuing... maybe table is empty or permissions failed.');
    }

    // 2. Iterate folders
    if (!fs.existsSync(DRIVE_FOLDER)) {
        console.error(`Drive folder not found: ${DRIVE_FOLDER}`);
        return;
    }

    const entries = fs.readdirSync(DRIVE_FOLDER, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());

    // Clear previous video log
    const videoLogPath = path.join(rootDir, 'videos_to_upload.txt');
    if (fs.existsSync(videoLogPath)) {
        fs.unlinkSync(videoLogPath);
    }

    for (const folder of folders) {
        const folderPath = path.join(DRIVE_FOLDER, folder.name);
        const title = folder.name;

        // 1. Description
        let description = '';
        const descFolderName = findFolder(folderPath, /^descripci[oó]n.*$/i);

        if (descFolderName) {
            const descDir = path.join(folderPath, descFolderName);
            const docxFiles = fs.readdirSync(descDir).filter(f => f.endsWith('.docx'));
            if (docxFiles.length > 0) {
                description = await extractTextFromDocx(path.join(descDir, docxFiles[0]));
            }
        }

        // 2. Attributes extraction from description
        const extractAttr = (regex: RegExp) => {
            const match = description.match(regex);
            return match ? (match[1].includes(',') || match[1].includes('.') ? parseFloat(match[1].replace(',', '.')) : parseInt(match[1])) : null;
        };

        const bedrooms = extractAttr(/(\d+)\s*(?:dorm|hab|recám|bed)/i);
        const bathrooms = extractAttr(/(\d+)\s*(?:bañ|bath)/i);
        const area_total = extractAttr(/(\d+(?:[.,]\d+)?)\s*(?:m2|mts|met|m²)/i);
        const parking_spaces = extractAttr(/(\d+)\s*(?:coch|estac|park|garaje)/i);

        let price = 0;
        const priceMatch = description.match(/(?:USD|U\$D|\$)\s*([\d,.]+)/i);
        if (priceMatch) {
            const cleanPrice = priceMatch[1].replace(/,/g, '').replace(/\.$/, '');
            price = parseFloat(cleanPrice) || 0;
        }

        // 3. Selective Migration Filter
        let imageCount = 0;
        const imgExts = /\.(jpg|jpeg|png|webp|jfif)$/i;

        const renderFolderName = findFolder(folderPath, /^render.*$/i);
        const fotosFolderName = findFolder(folderPath, /^fotos.*$/i);

        if (renderFolderName) imageCount += fs.readdirSync(path.join(folderPath, renderFolderName)).filter(f => imgExts.test(f)).length;
        if (fotosFolderName) imageCount += fs.readdirSync(path.join(folderPath, fotosFolderName)).filter(f => imgExts.test(f)).length;

        const hasDescription = description.trim().length > 0;
        const hasEnoughImages = imageCount >= 5;

        if (!hasDescription || !hasEnoughImages) {
            console.log(`[SKIP] ${title} - Missing Description or Not enough images (${imageCount})`);
            continue;
        }

        console.log(`Processing ${title}...`);

        // Insert Property
        const { data: property, error: insertError } = await supabase
            .from('properties')
            .insert({
                title: title,
                description: description,
                price: price,
                status: title.toLowerCase().includes('vendido') ? 'sold' : 'available',
                is_published: true,
                bedrooms,
                bathrooms,
                area_total,
                parking_spaces
            })
            .select()
            .single();

        if (insertError) {
            console.error(`Failed to insert property ${title}:`, insertError.message);
            continue;
        }

        console.log(`Created property: ${title} (ID: ${property.id})`);

        // 4. Log Videos
        const videoFolderName = findFolder(folderPath, /^video.*$/i);
        if (videoFolderName) {
            const vPath = path.join(folderPath, videoFolderName);
            const vFiles = fs.readdirSync(vPath).filter(f => /\.(mp4|webm|ogg|mov)$/i.test(f));
            if (vFiles.length > 0) {
                fs.appendFileSync(videoLogPath, `Property: ${title} | Videos: ${vFiles.join(', ')}\n`);
            }
        }

        // 5. Upload Images
        const mediaDirs = [
            { folderName: renderFolderName, type: 'image', name: 'Render' },
            { folderName: fotosFolderName, type: 'image', name: 'Fotos' }
        ];

        let displayOrder = 0;

        for (const dir of mediaDirs) {
            if (!dir.folderName) continue;

            const dirPath = path.join(folderPath, dir.folderName);
            const extensions = /\.(jpg|jpeg|png|webp|jfif)$/i;
            const files = fs.readdirSync(dirPath).filter(f => extensions.test(f));

            for (const file of files) {
                console.log(`  Uploading [${dir.type}] ${file}...`);
                const fileName = `${property.id}_${dir.name}_${file}`;
                const publicUrl = await uploadImage(path.join(dirPath, file), fileName);

                if (publicUrl) {
                    await supabase.from('property_images').insert({
                        property_id: property.id,
                        image_url: publicUrl,
                        display_order: displayOrder++,
                        is_primary: displayOrder === 1 && dir.type === 'image'
                    });
                }
            }
        }
    }

    console.log('Migration complete.');
}

migrate().catch(console.error);
