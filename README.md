# Devon Days Out

> A pitch-ready demo showing how a digital member pass for **Visit South Devon** could live in Apple Wallet and Google Wallet — with live deal counters, geofenced lock-screen alerts, and a digital-to-physical bridge.

**Live pass:** [`PASS-JMBGA2HH`](https://www.passqr.com/p/PASS-JMBGA2HH) · **Holder:** Lucy Pengelly · **Tier:** Resident Explorer

---

## What this is

A single-page GitHub Pages site that serves as a sales demo for the "Devon Days Out" membership scheme. It addresses every requirement from the original blueprint:

- **Coastal aesthetic** — teal `#00797f` lead, warm bone background, Fraunces serif display, editorial layout
- **Front-of-pass architecture** — member name, tier, pass ID, live deals counter (4/10), QR code
- **Living back-of-pass** — integration link, seasonal spotlight, validation instructions
- **Three "wow" capabilities** — Resident Proximity Trigger, Push Update, Digital-Physical Bridge
- **Honest push-notification explainer** — clarifies what Apple Wallet & Google Wallet can and cannot do

The "Add to Apple Wallet" and "Add to Google Wallet" buttons resolve to a real PassQR pass. On an iPhone, they install into Apple Wallet; on Android, into Google Wallet.

## Project structure

```
DevonDays/
├── index.html          # Single-page demo
├── assets/
│   ├── style.css       # Editorial coastal stylesheet
│   └── main.js         # Scroll reveal, pass tilt, deal-counter demo
├── geofences.json      # 8-location geofence config (machine-readable)
├── TEMPLATE.md         # PassQR template authoring spec
├── README.md
├── LICENSE
└── .nojekyll           # Tells GitHub Pages to skip Jekyll
```

No build step. No dependencies (Google Fonts and the QR code image are loaded over the network).

## Deploy to GitHub Pages

Enable Pages in repo settings → Pages → Source: `main` branch, `/` root.

The site goes live at `https://dasecure.github.io/DevonDays/`.

## Replacing the demo pass with your own

The wallet buttons in `index.html` reference the demo pass code `PASS-JMBGA2HH`. To point them at a different pass:

1. In your PassQR dashboard, create a pass under the appropriate template.
2. Find/replace the four occurrences of `PASS-JMBGA2HH` in `index.html`.
3. Update the holder name, tier, pass ID, and `deals_redeemed` numbers to match.

## Production checklist (before pitching)

This repo is a demo. For a polished pitch, the following items should be addressed:

- [ ] **Custom PassQR template** — Author the `Devon Days Out — Resident Explorer` template per [`TEMPLATE.md`](./TEMPLATE.md). The current demo pass uses the existing `MCP Gym` template as backbone; the wallet pass that gets installed will inherit that template's branding, not the on-site mockup styling.
- [x] **Geofence locations** — 8 pins (6 town centres + 2 named partner venues) wired into pass `PASS-JMBGA2HH`. Config exported to [`geofences.json`](./geofences.json). One backend touch-up still needed: confirm PassQR's `pass.json` renderer passes `pass.data.locations` through to the top-level `locations` key.
- [ ] **Domain** — Point `devondaysout.co.uk` at the GitHub Pages site or a Cloudflare Pages deployment.
- [ ] **Imagery** — Replace the SVG strip-image placeholder with licensed photography of Dartmouth Harbour, Salcombe Estuary, or a Dartmoor tor.
- [ ] **Copy approval** — Have Visit South Devon CIC approve the partner spotlight, tone, and tier names.

## How the push question actually works

The site has a full section on this, but the short version:

| Use case | Mechanism | Lock-screen result |
|---|---|---|
| "Welcome to Dartmouth" when a member arrives | **Geofence** in pass `locations` array | Pass auto-surfaces on lock screen with `relevantText` — **no server push needed** |
| "New summer offer added" across all members | **APNs** push update via PassQR API | iOS pulls the new pass JSON, banner shows the changed field's value |
| Free-form marketing message on Android | **Google Wallet messages** array | Banner appears on Android, more flexible than Apple |

Apple Wallet does **not** support arbitrary push notifications the way a regular app does. The lock-screen text is always tied to a pass field's change, or a geofence's `relevantText`. That's a constraint, but it's also why these notifications feel premium — they're never spam.

## Built with

- [PassQR](https://passqr.com) — Pass infrastructure (Apple Wallet + Google Wallet)
- [Fraunces](https://fonts.google.com/specimen/Fraunces) & [Manrope](https://fonts.google.com/specimen/Manrope) — Typography
- GitHub Pages — Hosting

## License

MIT — see [LICENSE](LICENSE).

> Not affiliated with Visit South Devon CIC. Demo only. Built by [dasecure.com](https://dasecure.com).
