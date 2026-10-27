#!/usr/bin/env node
import { Command } from 'commander';
import { compareSnapshot } from './differ.js';
import { printVisualReport } from './reporter.js';
import { startDemoServer } from './fixtures.js';
import * as http from 'http';

const program = new Command();

program
  .name('visual-guard')
  .description('Perceptual Visual Regression & Smart Masking Engine')
  .version('1.0.0')
  .option('-u, --url <url>', 'Target URL to compare', 'http://localhost:9090')
  .option('-n, --name <name>', 'Snapshot test identifier', 'account-dashboard')
  .option('-m, --mask <selectors>', 'Comma-separated CSS selectors to mask volatile elements', '.session-id,.sync-time')
  .option('-t, --threshold <number>', 'Perceptual sensitivity threshold (0.0 to 1.0)', '0.1')
  .option('--max-diff <percent>', 'Maximum allowable visual diff percentage', '0.05')
  .option('--update-baseline', 'Captures and saves current page as reference baseline', false)
  .option('--mock', 'Starts internal mock server for local testing', false)
  .option('--dynamic', 'When using --mock, routes to page with dynamic volatile fields', false)
  .option('--regression', 'When using --mock, routes to page with visual regressions', false)
  .action(async (options) => {
    let demoServer: http.Server | null = null;

    try {
      let targetUrl = options.url;

      if (options.mock) {
        demoServer = startDemoServer(9090);
        if (options.regression) {
          targetUrl = 'http://localhost:9090/regression';
        } else if (options.dynamic) {
          targetUrl = 'http://localhost:9090/dynamic';
        } else {
          targetUrl = 'http://localhost:9090';
        }
      }

      console.log(`[visual-guard] Capturing: ${targetUrl}...`);

      const masks = options.mask ? options.mask.split(',').map((s: string) => s.trim()) : [];

      const result = await compareSnapshot({
        url: targetUrl,
        snapshotName: options.name,
        masks,
        threshold: Number(options.threshold),
        maxDiffPercent: Number(options.maxDiff),
        updateBaseline: Boolean(options.updateBaseline),
      });

      printVisualReport(result);

      if (demoServer) demoServer.close();
      process.exit(result.passed ? 0 : 1);
    } catch (err: any) {
      if (demoServer) demoServer.close();
      console.error(`[visual-guard] Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);