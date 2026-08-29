<div align="center">

# 📖 Leatherbound Notebook 2.0

### *A Private, Local-First, Encrypted 3D Skeuomorphic Notebook & Interactive Workspace*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r165-black.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Repository: Private](https://img.shields.io/badge/Repository-Private-black.svg?style=flat-square)](https://github.com/gochalamvinod/LeatherBound-Notebook)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat-square)](#-license)

<p align="center">
  <b>Experience the tactile warmth of a classic leatherbound journal combined with modern digital productivity.</b><br>
  Self-hosted, zero-cloud data leakage, military-grade client encryption, and hardware-accelerated 3D interactions.
</p>

</div>

---

## 🌟 Highlights & Key Features

### 🖋️ 3D Golden Fountain Pen Morphing Lifecycle
- **60 FPS Three.js Procedural Pen**: Features a 24K gold nib, fluted grip, midnight lacquer barrel, and radiant nib tip glow.
- **Symmetrical Wing Expansion**: When unlocking or creating a notebook, the golden pen aligns with the center axis and expands smoothly into the open leatherbound book spread.
- **Direct 1ms Lock Transition**: On closing, the notebook folds symmetrically inwards into the golden pen, presents an elegant *"Thank You for Writing"* plaque, and transitions directly to the Lock Screen.

### 👤 Identity & Compulsory Username Book Title System
- **Compulsory Prefix Enforcement**: Every notebook created, setup, renamed, or saved strictly and compulsorily starts with `{username}_` (e.g. `vinod_notebook` or `vinod_trading_journal`).
- **Smart Auto-Redirect On Sign-In**: Attempting to sign in with an unregistered username instantly transitions to the **Create Account** tab with the username and password automatically pre-filled.

### 📚 Tactile Skeuomorphic Aesthetic & Custom Covers
- **5 Premium Leather Finishes**: Emerald Pine, Classic Brown, Midnight Navy, Royal Burgundy, and Obsidian Noir.
- **Authentic Journal Ambiance**: Subtle parchment ruled lines, physical paper depth, embossed brass clasps, and realistic page curling.
- **Dynamic Aspect Ratio Engine**: Choose from 1:1 Square, 1:1.2 Classic Journal, 1:1.4 Golden Ratio, 1:1.6 Widescreen, or Custom proportions with optimal screen space utilization.

### 📝 Comprehensive Rich-Text & Media Suite
- **Full Typography Controls**: Font family selection (Georgia, Garamond, Merriweather, Playfair Display, Cinzel, JetBrains Mono), sizes, colors, highlights, text alignment, and emoji picker.
- **Unified 8-Handle Circular Resizer**: Effortlessly drag, scale, and reposition images, videos, audio players, tables, code blocks, and live web embeds.
- **⚡ Instant Random-Access Video Streaming Engine**: `#EXT-X-INDEPENDENT-SEGMENTS` standalone keyframe decoding and smart window-based chunk eviction allows instant (<100ms) jumping to any hour (e.g. Hour 29 of a 30-Hour video) without loading intermediate chunks.
- **Document & Spreadsheet Embeds**:
  - **Spreadsheets (`.xlsx`, `.xls`, `.csv`, `.tsv`, `.ods`)**: Powered by SheetJS with interactive spreadsheet previews, formula bars, and dynamic chart visualization.
  - **Documents (`.docx`, `.pptx`, `.pdf`)**: Native embedded parchment viewers with multi-page navigation and slide decks.
  - **Code Blocks**: Syntax-highlighted code viewer supporting over 20 programming languages.

### 🌐 Live Web Windows & Search
- **DuckDuckGo Live Search**: Search the web and embed live interactive browser frames or rich bookmark cards directly into your notes.
- **Interactive Web Embeds**: Built-in address bar, navigation buttons (Back, Forward, Refresh, Home, Open in Tab), and height resizers.

### 🔒 Zero-Knowledge Local Vault Security
- **AES-GCM-256 Encryption**: Your notebooks, pages, and media attachments are encrypted locally on your machine.
- **Single-Device Active Session Protection**: Automatically detects and handles superseded sessions.
- **Security Lockout Defense**: 30-minute lockout after 5 consecutive failed login attempts.
- **Multi-Tier Quota Management**: Built-in tier architecture supporting Free (Classic), VIP (Premium), and completely unlimited Sovereign (Ultimate) user quotas.

---

## 🏗️ Tech Stack Architecture

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 (TypeScript, Strict Mode) |
| **3D Graphics & Animations** | Three.js (r165), WebGL, ACESFilmic Tone Mapping |
| **Document & Spreadsheet Engine** | SheetJS (`xlsx`), `fflate`, `html2canvas` |
| **Media Streaming** | HLS.js, Progressive MP4/WebM/Audio Streamers |
| **Bundler & Dev Server** | Vite 7.3 with Rollup manual chunking |
| **Backend & Storage** | Node.js, Express 4.19, SQLite / Encrypted JSON Vault |

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (Version **18.0.0** or higher)
- `npm` (Version **9.0.0** or higher)

---

### 🚀 Option A: One-Click Instant Start (Windows)

Simply double-click **`STARTER.bat`** (or run `.\STARTER.bat` in your terminal).

> **`STARTER.bat` automatically:**
> 1. Verifies Node.js & npm environment
> 2. Auto-installs missing dependencies (`npm install`)
> 3. Auto-builds client production assets (`npm run build`) if not already compiled
> 4. Automatically launches `http://localhost:3000` in your default browser
> 5. Starts the high-performance local server (`npm start`)

---

### 🛠️ Option B: Manual CLI Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/gochalamvinod/LeatherBound-Notebook.git
cd LeatherBound-Notebook
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Development Mode (Hot Reload)
```bash
# Runs both the backend Express server and Vite frontend concurrently
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

#### 4. Build and Run Production Server
```bash
# Typecheck and compile optimized client bundle
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
notebook-app/
├── STARTER.bat             # One-click Windows launcher (auto-install, build & launch)
├── public/                 # Static assets, fallback templates, favicon
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard & user tier management
│   │   ├── auth/           # Skeuomorphic lock & authentication screens
│   │   ├── book/           # 3D BookRoom, PageSlot, and canvas renders
│   │   ├── document/       # SpreadsheetEditor & Chart viewers
│   │   ├── embeds/         # DuckDuckGo search & live web embed modals
│   │   ├── media/          # Resizable image/video overlays & toasts
│   │   ├── modals/         # Bookshelf, settings drawer, upgrade modal
│   │   ├── toolbar/        # Header skeuomorphic toolbar & controls
│   │   ├── transitions/    # 3D Golden Fountain Pen morphing system
│   │   └── ui/             # Reusable UI primitives
│   ├── context/            # AuthContext, VaultContext, EditorContext
│   ├── hooks/              # Custom React hooks (usePageFlip, etc.)
│   ├── lib/
│   │   ├── api/            # Client API bridge & network requests
│   │   ├── crypto/         # Client-side cryptographic helpers
│   │   ├── editor/         # Rich text commands, link classifier, embeds
│   │   ├── flip3d/         # 3D page curl & vertex transformation math
│   │   └── media/          # Image resizer, video poster extractor, HLS
│   ├── types/              # TypeScript definitions & API models
│   ├── App.tsx             # Main application state machine & coordinator
│   └── App.css             # Skeuomorphic styling, textures & animations
├── server.js               # Express API, auth security, local storage vault
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build & chunking configuration
└── package.json            # Dependencies and scripts
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Toggle **Bold** text formatting |
| <kbd>Ctrl</kbd> + <kbd>I</kbd> | Toggle *Italic* text formatting |
| <kbd>Ctrl</kbd> + <kbd>U</kbd> | Toggle <u>Underline</u> text formatting |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Force save active notebook pages |
| <kbd>←</kbd> / <kbd>→</kbd> | Flip to Previous / Next page spread |
| <kbd>Esc</kbd> | Dismiss active media resizer or close modals |

---

## 👑 Tier Feature Matrix

| Feature | Classic (Free) | Premium (VIP) | Ultimate (Sovereign) |
|---|:---:|:---:|:---:|
| **Notebooks** | Up to 5 | Up to 100 | **Completely Unlimited (∞)** |
| **Pages per Notebook** | 20 Pages | 1,000 Pages | **Completely Unlimited (∞)** |
| **Total Vault Storage** | 5.0 GB | 100.0 GB | **Completely Unlimited (∞)** |
| **Media Upload Size** | 200 MB Video / 50 MB Docs | 2.0 GB Video / 500 MB Docs | **Completely Unlimited (∞)** |
| **Page Aspect Ratio Changes** | 5 per Book | 20 per Book | **Completely Unlimited (∞)** |
| **Leather Covers & Themes** | Standard 3 | Premium 6 | **All Covers & Custom Themes** |
| **AI God Mode & Voice** | ❌ | ✨ Standard | **⚡ Unlimited Access** |
| **Office & Excel Suite** | Full Access | Full Access | **⚡ Unlimited Access** |

---

## 📜 License & Intellectual Property
 
**PROPRIETARY & CONFIDENTIAL — ALL RIGHTS RESERVED**

This source code, visual designs, 3D animations, skeuomorphic assets, and architectures are proprietary and confidential to **Gochalam Vinod**. 

- **Private Repository**: This software is not open-source and is strictly **not free to use**.
- **No Unauthorized Use**: No part of this software, codebase, or associated design elements may be reproduced, distributed, copied, reverse-engineered, sublicensed, hosted, or publicly deployed in any form or by any means without explicit, prior written authorization from the copyright holder.

---

<div align="center">
  <sub>© 2026 Gochalam Vinod. All rights reserved.</sub>
</div>
