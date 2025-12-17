# OrbitMarks

OrbitMarks is a Chrome bookmarks side panel that blends soft Material cards with terminal-inspired typography. It turns your messy collection of saved links into a curated launchpad with live search, nested folders, and multilingual onboarding.

## ✨ Key Features

- **Unified command board** – Pin OrbitMarks next to the toolbar to reveal a distraction-free canvas for your most important bookmarks.
- **Live, folder-aware search** – Type to instantly filter the current folder without leaving the keyboard or losing context.
- **Nested tree navigation** – Expand/collapse folders in the sidebar, remember the last opened section, and dive into deep bookmark stacks with one click.
- **International-ready copy** – Ship to the Chrome Web Store with English copy plus 10 additional languages and a “follow system” option.
- **One-tap theming** – Switch between light and dark palettes; icons, gradients, and particles all adapt automatically.
- **Built-in feedback lane** – A lightweight CTA keeps the support email one click away so early adopters can reach out.

## 📸 Product Preview

<table>
  <tr>
    <td align="center">
      <strong>Dark popup</strong><br>
      <img src="docs/screenshots/panel-dark-640x400.png" alt="OrbitMarks dark popup" width="320">
    </td>
    <td align="center">
      <strong>Light popup</strong><br>
      <img src="docs/screenshots/panel-light-640x400.png" alt="OrbitMarks light popup" width="320">
    </td>
  </tr>
</table>

## 🚀 Installation

1. Go to `chrome://extensions` and enable **Developer mode** in the top-right corner.
2. Click **Load unpacked** and choose this repository folder (the one containing `manifest.json`).
3. Pin the OrbitMarks icon so the popup is always available from the toolbar.

> Need branding tweaks? Replace the PNGs in `icons/`. Need new languages? Extend `TRANSLATIONS` inside `popup.js`.

## 🛠 Development

```bash
# Install dependencies if you plan to extend the toolchain
pnpm install

# Load the extension in Chrome for live debugging
pnpm dev
```

Key files:
- `popup.html`, `styles.css`, `popup.js` – UI layout, theming, and bookmark rendering logic.
- `manifest.json` – Extension declaration (only uses the `bookmarks` permission).
- `icons/` – Multi-size OrbitMarks logos for Chrome.
- `docs/screenshots/` – Assets used on the Chrome Web Store listing and README.

## 💬 Support

Questions or feature ideas? Email [support@btman.net](mailto:support@btman.net) and we’ll get back to you soon.

---
Made with ❤️ for an organized browsing orbit.
