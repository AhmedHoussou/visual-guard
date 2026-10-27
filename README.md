# 👁️ visual-guard

[![CI](https://github.com/AhmedHoussou/visual-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/AhmedHoussou/visual-guard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Perceptual Visual Regression & Smart Masking Engine powered by Playwright and Pixelmatch.

`visual-guard` captures web UI states, masks volatile dynamic regions (timestamps, avatars, session IDs) to eliminate false positives, computes perceptual color differences, and generates high-visibility diff artifacts to block unexpected UI regressions in CI pipelines.

---

## 🎯 The Problem

Standard pixel-diff engines are notoriously brittle. Flaky visual failures frequently occur when:
* Real-time timestamps update every second.
* User session tokens, randomized IDs, or dynamic counters change values.
* Third-party avatars or live widgets load slightly altered assets.

`visual-guard` resolves this by integrating automated CSS locator masking directly into the screenshot capture pipeline, ensuring only genuine layout and stylistic regressions trigger build failures.

---

## 🏗️ Architecture

```text
[Target Web Page / Staging URL]
               │
               ▼
     [visual-guard Engine]
               │
               ├─► Launches Headless Chromium
               ├─► Resolves & masks dynamic selectors (.session-id, .sync-time)
               ├─► Captures viewport PNG buffer with neutral mask fills
               │
               ▼
     [Pixelmatch Differ]
               │
               ├─► Compares current PNG against baselines/<name>.png
               ├─► Computes diff percentage: (diffPixels / totalPixels) * 100
               │
               ▼
     [Pipeline Decision]
        ├── Diff <= Max Allowed (0.05%) ──► [PASS: Exit Code 0]
        └── Diff >  Max Allowed ──────────► [FAIL: Saves diffs/<name>-diff.png, Exit Code 1]
```

---

## 🚀 Quick Start

### Installation

```bash
git clone [https://github.com/AhmedHoussou/visual-guard.git](https://github.com/AhmedHoussou/visual-guard.git)
cd visual-guard
npm install
npx playwright install chromium
npm run build
```

### Local Execution with Built-in Mock Server

```bash
# Initialize reference baseline snapshot
node dist/cli.js --mock --update-baseline

# Run comparison against dynamic UI with smart masking (PASS)
node dist/cli.js --mock --dynamic

# Run comparison against layout regression (SAVES DIFF ARTIFACT & FAILS)
node dist/cli.js --mock --regression
```

### Running Against Live Applications

```bash
node dist/cli.js \
  --url [https://staging.example.com/dashboard](https://staging.example.com/dashboard) \
  --name dashboard-view \
  --mask ".user-avatar,.timestamp,.live-badge" \
  --threshold 0.1 \
  --max-diff 0.05
```

---

## ⚙️ CLI Options

| Flag | Argument | Description | Default |
| :--- | :--- | :--- | :--- |
| `-u, --url` | `<url>` | Target web page URL to capture | `http://localhost:9090` |
| `-n, --name` | `<name>` | Unique snapshot identifier | `account-dashboard` |
| `-m, --mask` | `<selectors>` | Comma-separated CSS selectors to mask | `.session-id,.sync-time` |
| `-t, --threshold` | `<number>` | Perceptual sensitivity threshold (0.0 - 1.0) | `0.1` |
| `--max-diff` | `<percent>` | Maximum allowable visual diff percentage | `0.05` (%) |
| `--update-baseline` | *None* | Captures and updates reference baseline image | `false` |
| `--mock` | *None* | Runs built-in mock server for zero-setup execution | `false` |
| `--dynamic` | *None* | Routes mock server to page with volatile dynamic fields | `false` |
| `--regression` | *None* | Routes mock server to page with layout & color bugs | `false` |

---

## 📄 License

MIT