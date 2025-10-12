import puppeteer from 'puppeteer';
import fs from 'fs';
import { exec } from 'child_process';

const VITE_PORT = 5173;
const BASE_URL = `http://localhost:${VITE_PORT}`;
const SNAPSHOT_DIR = './public/assets/visuals';

// Dynamically determine the number of visuals
const mathVisualsContent = fs.readFileSync('./src/components/MathVisual.tsx', 'utf8');
const customVisualsMatch = mathVisualsContent.match(/export const customVisuals = \[([\s\S]*?)\];/);

if (!customVisualsMatch || !customVisualsMatch[1]) {
  throw new Error('Could not find or parse customVisuals array in MathVisual.tsx');
}

const args = process.argv.slice(2);
const visualArg = args.find(arg => arg.startsWith('--visual='));
let targetVisual = null;

if (visualArg) {
  const value = Number.parseInt(visualArg.split('=')[1], 10);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid value provided for --visual: ${visualArg}`);
  }
  targetVisual = value;
}

// Time to wait for canvas to render before capturing (ms)
const CANVAS_SETTLE_MS = 2000;
const EXTRA_WAIT_MS = {
  28: 10000,
  42: 12000,
  48: 10000,
  71: 3200,
  92: 1500,
  219: 15000,
  232: 500,
  231: 1000,
  333: 5000,
  340: 1
};

const NAVIGATION_WAIT_UNTIL = 'domcontentloaded';
const BASE_NAVIGATION_TIMEOUT_MS = 30000;
const EXTRA_NAVIGATION_TIMEOUT_MS = {
  12: 30000,
};

const visualsArrayContent = customVisualsMatch[1];
const NUM_VISUALS = visualsArrayContent
  .split('\n')
  .map(line => line.trim())
  .map(line => line.replace(/\/\/.*$/, ''))
  .map(line => line.replace(/\/\*.*?\*\//g, ''))
  .map(line => line.replace(/,$/, '').trim())
  .filter(line => line.length > 0).length;

console.log(`Found ${NUM_VISUALS} custom visuals to snapshot.`);

if (targetVisual !== null) {
  if (targetVisual < 1 || targetVisual > NUM_VISUALS) {
    throw new Error(`Requested visual ${targetVisual} is outside the valid range 1-${NUM_VISUALS}.`);
  }
  console.log(`Limiting snapshot generation to visual ${targetVisual}.`);
}

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

  const visualsToCapture =
    targetVisual !== null
      ? [targetVisual]
      : Array.from({ length: NUM_VISUALS }, (_, index) => index + 1);

  for (const i of visualsToCapture) {
    const url = `${BASE_URL}/snapshot/${i}?bg=white`;
    console.log(`Navigating to ${url}`);
    try {
      const navigationTimeout = BASE_NAVIGATION_TIMEOUT_MS + (EXTRA_NAVIGATION_TIMEOUT_MS[i] ?? 0);
      await page.goto(url, { waitUntil: NAVIGATION_WAIT_UNTIL, timeout: navigationTimeout });

      // Ensure the snapshot container is visible and give canvas time to render
      await page.waitForSelector('#snapshot-container', { visible: true, timeout: 30000 });

      const extraDelay = EXTRA_WAIT_MS[i] ?? 0;
      const totalDelay = CANVAS_SETTLE_MS + extraDelay;
      if (totalDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }

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
  process.exit(0);
}

generateSnapshots();
