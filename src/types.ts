export interface VisualDiffResult {
  testName: string;
  baselinePath: string;
  diffPath?: string;
  totalPixels: number;
  diffPixels: number;
  diffPercentage: number;
  threshold: number;
  maxDiffPercentAllowed: number;
  passed: boolean;
  isNewBaseline: boolean;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface CaptureOptions {
  url: string;
  snapshotName: string;
  masks?: string[];
  viewport?: { width: number; height: number };
  threshold?: number;
  maxDiffPercent?: number;
  updateBaseline?: boolean;
}