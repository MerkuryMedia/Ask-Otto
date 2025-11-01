# Ask Otto Fitness Prototype

This repository hosts a mobile-first single-page application that builds daily fitness challenges from a weekly training plan using Google Gemini 1.5 Flash. The prototype persists all data in browser `localStorage` and is optimized for GitHub Pages hosting.

## Features

- Hash-based routing between Home and Profile views.
- Weekly schedule builder with hierarchical Field 1/2/3 dropdowns per day.
- Automatic on-open Gemini prompt that produces a short JSON challenge for the current day.
- SVG radial slider for 1–10 completion scores with accessible range input fallback.
- Exponential moving average progress bar that updates after each submission.
- Local persistence for the weekly plan, generated challenges, and results.
- Inline reset option to clear stored data during testing.

## Local setup

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/).
2. Copy `config.js` and replace `REPLACE_WITH_KEY` with your key. Optionally adjust the API URL or model ID.
3. Serve the repository with any static file server (for example `npx serve .`) or push to GitHub Pages with the repository root as the publish directory.

## Usage

1. Open the app in a mobile browser (or responsive emulator).
2. Visit the Profile tab and configure each day’s Field 1/2/3 selections.
3. Return to Home. If today’s selections are complete, the app will call Gemini and display the generated challenge.
4. Drag the radial slider or use the keyboard-accessible range input to select a 1–10 completion score, then submit to update the progress metric.
5. Use the **Reset App** link in the Profile view to clear stored data during testing.

## Verification before deploying

- Run `node --check app.js`, `node --check deps.js`, and `node --check prompts.js` to ensure the modules parse correctly.
- Review `config.js` and confirm the Gemini API key is present before publishing to GitHub Pages.

## Deployment

Enable GitHub Pages for the `main` branch at the repository root so the SPA resolves from `/index.html`. All assets are relative URLs for compatibility with static hosting.

## Disclaimer

This client-side prototype exposes the Gemini API key to end users. Treat the key as temporary and rotate or restrict it as needed. A production deployment should proxy Gemini requests through a secure backend.
