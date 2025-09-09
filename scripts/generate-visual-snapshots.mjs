import puppeteer from 'puppeteer';
import fs from 'fs';
import { exec } from 'child_process';

const VITE_PORT = 5173;
const BASE_URL = `http://localhost:${VITE_PORT}`;
const SNAPSHOT_DIR = './public/assets/visuals';

// The number of custom visuals to snapshot
const NUM_VISUALS = 76;

async function generateSnapshots() {
  // Create snapshot directory if it doesn't exist
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }

  // Start Vite dev server
  const viteServer = exec('npx vite --port 5173');
  console.log('Starting Vite dev server...');

  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for server to start

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512 });

  for (let i = 1; i <= NUM_VISUALS; i++) {
    const url = `${BASE_URL}/snapshot/${i}`;
    console.log(`Navigating to ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });

      // Set page background to transparent
      await page.evaluate(() => {
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
      });

      const element = await page.$('#snapshot-container');
      if (element) {
        await element.screenshot({ 
          path: `${SNAPSHOT_DIR}/${i}.png`,
          omitBackground: true 
        });
        console.log(`Saved snapshot for visual ${i}`);
      } else {
        console.error(`Could not find element #snapshot-container for visual ${i}`);
      }
    } catch (error) {
      console.error(`Failed to generate snapshot for visual ${i}:`, error);
    }
  }

  await browser.close();
  viteServer.kill();
  console.log('Finished generating snapshots.');
}

generateSnapshots();
