import fs from 'fs/promises';
import path from 'path';

const inputFile = path.resolve(process.cwd(), 'src/components/custom-visuals/AllVisuals.tsx');
const outputDir = path.resolve(process.cwd(), 'src/components/custom-visuals/v2');

async function splitFile() {
  try {
    console.log(`Reading from ${inputFile}...`);
    const content = await fs.readFile(inputFile, 'utf-8');
    
        const chunks = content.split(/\/\/ --- Start of /).slice(1);
    let count = 0;

    for (const chunk of chunks) {
      const lines = chunk.split('\n');
      const fileName = lines[0].replace(' ---', '').trim();
      let fileContent = lines.slice(1, -2).join('\n').trim(); // Remove start/end markers

      const outputPath = path.join(outputDir, fileName);

      // Add imports if they are not present
      if (!fileContent.includes('import React')) {
        fileContent = `import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';\n\n` + fileContent;
      }
      if (fileContent.includes('THREE.') && !fileContent.includes('import * as THREE')) {
        fileContent = `import * as THREE from 'three';\n` + fileContent;
      }
      fileContent = fileContent.replace(/interface VisualProps {[^}]*}\n\n/g, '');

      if (fileContent.includes(': React.FC<VisualProps>') && !fileContent.includes('import type { VisualProps }')) {
        fileContent = `import type { VisualProps } from '../../../types';\n` + fileContent;
      }

      const componentName = fileName.replace('.tsx', '');
      fileContent += `\n\nexport default ${componentName};`;

      await fs.writeFile(outputPath, fileContent);
      console.log(`Created ${outputPath}`);
      count++;
    }

    if (count > 0) {
      console.log(`\nSuccessfully split ${count} components into ${outputDir}`);
    } else {
      console.log('No components found to split.');
    }

  } catch (error) {
    console.error('Error during file splitting:', error);
  }
}

splitFile();
