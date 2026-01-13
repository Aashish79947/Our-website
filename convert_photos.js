const fs = require('fs-extra');
const heicConvert = require('heic-convert');
const path = require('path');

const convertPhotos = async () => {
  const dirs = ['2024', '2025'];
  const baseDir = path.join(__dirname, 'photos');

  for (const year of dirs) {
    const yearDir = path.join(baseDir, year);
    if (!fs.existsSync(yearDir)) {
      console.log(`Directory ${yearDir} does not exist, skipping.`);
      continue;
    }

    const files = await fs.readdir(yearDir);
    const convertedFiles = [];

    for (const file of files) {
      if (file.toLowerCase().endsWith('.heic')) {
        const inputPath = path.join(yearDir, file);
        const outputPath = path.join(yearDir, file.replace(/\.heic$/i, '.jpg'));
        
        // Skip if jpg already exists to save time on re-runs
        if (fs.existsSync(outputPath)) {
             console.log(`Skipping ${file}, JPG already exists.`);
             convertedFiles.push(path.basename(outputPath));
             continue;
        }

        console.log(`Converting ${file}...`);
        try {
          const inputBuffer = await fs.readFile(inputPath);
          const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 1
          });
          await fs.writeFile(outputPath, outputBuffer);
          convertedFiles.push(path.basename(outputPath));
        } catch (error) {
          console.error(`Error converting ${file}:`, error);
        }
      }
    }
    console.log(`Finished converting ${year}. JPEGs:`, convertedFiles);
  }
};

convertPhotos();
