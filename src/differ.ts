import * as fs from 'fs';
import * as path from 'path';
import { chromium, Locator } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatchModule from 'pixelmatch';
import { CaptureOptions, VisualDiffResult } from './types.js';

const pixelmatch = (pixelmatchModule as any).default || pixelmatchModule;

export async function compareSnapshot(options: CaptureOptions): Promise<VisualDiffResult> {
  const {
    url,
    snapshotName,
    masks = [],
    viewport = { width: 1280, height: 720 },
    threshold = 0.1,
    maxDiffPercent = 0.05,
    updateBaseline = false,
  } = options;

  const baselineDir = path.resolve(process.cwd(), 'baselines');
  const diffsDir = path.resolve(process.cwd(), 'diffs');

  if (!fs.existsSync(baselineDir)) fs.mkdirSync(baselineDir, { recursive: true });
  if (!fs.existsSync(diffsDir)) fs.mkdirSync(diffsDir, { recursive: true });

  const baselinePath = path.join(baselineDir, `${snapshotName}.png`);
  const diffPath = path.join(diffsDir, `${snapshotName}-diff.png`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  let currentPng: PNG;

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Resolve mask locators
    const maskLocators: Locator[] = [];
    for (const selector of masks) {
      const locator = page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        maskLocators.push(locator);
      }
    }

    // Capture screenshot with native Playwright masking
    const screenshotBuffer = await page.screenshot({
      mask: maskLocators.length > 0 ? maskLocators : undefined,
      maskColor: '#1e293b', // Matches card background
      animations: 'disabled',
    });

    currentPng = PNG.sync.read(screenshotBuffer);
  } finally {
    await context.close();
    await browser.close();
  }

  // If updateBaseline flag or baseline does not exist, save current snapshot as baseline
  if (updateBaseline || !fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, PNG.sync.write(currentPng));
    return {
      testName: snapshotName,
      baselinePath,
      totalPixels: currentPng.width * currentPng.height,
      diffPixels: 0,
      diffPercentage: 0,
      threshold,
      maxDiffPercentAllowed: maxDiffPercent,
      passed: true,
      isNewBaseline: true,
      dimensions: { width: currentPng.width, height: currentPng.height },
    };
  }

  const baselinePng = PNG.sync.read(fs.readFileSync(baselinePath));

  if (baselinePng.width !== currentPng.width || baselinePng.height !== currentPng.height) {
    throw new Error(
      `Image dimension mismatch: Baseline (${baselinePng.width}x${baselinePng.height}) vs Current (${currentPng.width}x${currentPng.height})`
    );
  }

  const { width, height } = baselinePng;
  const diffPng = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baselinePng.data,
    currentPng.data,
    diffPng.data,
    width,
    height,
    {
      threshold,
      diffColor: [255, 0, 110], // High-visibility pink for visual diffs
    }
  );

  const totalPixels = width * height;
  const diffPercentage = Math.round((diffPixels / totalPixels) * 10000) / 100;
  const passed = diffPercentage <= maxDiffPercent;

  if (!passed) {
    fs.writeFileSync(diffPath, PNG.sync.write(diffPng));
  } else if (fs.existsSync(diffPath)) {
    fs.unlinkSync(diffPath);
  }

  return {
    testName: snapshotName,
    baselinePath,
    diffPath: passed ? undefined : diffPath,
    totalPixels,
    diffPixels,
    diffPercentage,
    threshold,
    maxDiffPercentAllowed: maxDiffPercent,
    passed,
    isNewBaseline: false,
    dimensions: { width, height },
  };
}