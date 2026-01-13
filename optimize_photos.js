const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const optimizePhotos = async () => {
    const dirs = ['2024', '2025'];
    const baseDir = path.join(__dirname, 'photos');

    for (const year of dirs) {
        const yearDir = path.join(baseDir, year);
        if (!fs.existsSync(yearDir)) continue;

        const files = await fs.readdir(yearDir);

        for (const file of files) {
            if (file.toLowerCase().endsWith('.jpg')) {
                const filePath = path.join(yearDir, file);

                try {
                    // Read metadata to check current size
                    const metadata = await sharp(filePath).metadata();

                    // Only optimize if width is > 1600 or it's potentially huge
                    if (metadata.width > 1600 || metadata.size > 500000) { // arbitrary 500kb check if metadata had size, but mostly using width
                        console.log(`Optimizing ${file}...`);

                        // Create a temporary buffer
                        const buffer = await sharp(filePath)
                            .resize(1600, 1600, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .jpeg({ quality: 80, mozjpeg: true })
                            .toBuffer();

                        // Overwrite original
                        await fs.writeFile(filePath, buffer);
                        console.log(`Optimized ${file}`);
                    } else {
                        console.log(`Skipping ${file} (already small enough)`);
                    }
                } catch (error) {
                    console.error(`Error optimizing ${file}:`, error);
                }
            }
        }
    }
};

optimizePhotos();
