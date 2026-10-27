import pc from 'picocolors';
import { VisualDiffResult } from './types.js';

export function printVisualReport(result: VisualDiffResult): void {
  console.log('\n' + pc.bold(pc.cyan('━'.repeat(80))));
  console.log(pc.bold(pc.cyan(' 👁️  VISUAL-GUARD: Perceptual Visual Regression Report')));
  console.log(pc.bold(pc.cyan('━'.repeat(80))) + '\n');

  console.log(` ${pc.bold('Snapshot:')} ${pc.white(result.testName)}`);
  console.log(` ${pc.bold('Resolution:')} ${pc.dim(`${result.dimensions.width}x${result.dimensions.height}`)}`);
  console.log(` ${pc.bold('Perceptual Threshold:')} ${pc.dim(String(result.threshold))}`);

  if (result.isNewBaseline) {
    console.log(`\n ${pc.bgBlue(pc.white(pc.bold(' BASELINE INITIALIZED ')))} Saved new reference to: ${pc.dim(result.baselinePath)}`);
  } else {
    const badge = result.passed
      ? pc.bgGreen(pc.black(pc.bold(' PIXEL DIFF PASS ')))
      : pc.bgRed(pc.white(pc.bold(' VISUAL REGRESSION DETECTED ')));

    const diffDisplay = result.passed
      ? pc.green(`${result.diffPercentage}% (${result.diffPixels} px)`)
      : pc.red(`${result.diffPercentage}% (${result.diffPixels} px)`);

    console.log(`\n ${badge} Diff: ${diffDisplay} | Max Allowed: ${pc.yellow(`${result.maxDiffPercentAllowed}%`)}`);

    if (!result.passed && result.diffPath) {
      console.log(`    ${pc.red('↳ Visual Diff Artifact:')} ${pc.bold(pc.yellow(result.diffPath))}`);
    }
  }

  console.log('\n' + pc.bold(pc.cyan('━'.repeat(80))));
  const verdictBadge = result.passed
    ? pc.bgGreen(pc.black(pc.bold(' OVERALL STATUS: PASSED ')))
    : pc.bgRed(pc.white(pc.bold(' OVERALL STATUS: FAILED (REGRESSION EXCEEDS THRESHOLD) ')));

  console.log(` ${verdictBadge}`);
  console.log(pc.bold(pc.cyan('━'.repeat(80))) + '\n');
}