import fs from 'fs/promises';
import path from 'path';

const visualsDir = path.resolve(process.cwd(), 'src/components/custom-visuals');
const outputFile = path.resolve(visualsDir, 'AllVisuals.tsx');

async function concatenateFiles() {
  try {
    const files = await fs.readdir(visualsDir);
    let concatenatedContent = '';

    console.log(`Reading files from: ${visualsDir}`);

    for (const file of files) {
      if (file.endsWith('.tsx') && path.resolve(visualsDir, file) !== outputFile) {
        const filePath = path.join(visualsDir, file);
        console.log(`Processing ${file}...`);
        const content = await fs.readFile(filePath, 'utf-8');
        concatenatedContent += `// --- Start of ${file} ---\n`;
        concatenatedContent += content;
        concatenatedContent += `\n// --- End of ${file} ---\n\n`;
      }
    }

    if (concatenatedContent) {
      await fs.writeFile(outputFile, concatenatedContent);
      console.log(`Successfully concatenated files into ${outputFile}`);
    } else {
      console.log('No .tsx files found to concatenate.');
    }

  } catch (error) {
    console.error('Error during file concatenation:', error);
  }
}

concatenateFiles();
