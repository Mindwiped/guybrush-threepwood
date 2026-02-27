<<<<<<< HEAD
# ⚓ Guybrush Threepwood — Grog like MITRE Visualizer

> *"I'm selling these fine leather jackets."*
> — Guybrush Threepwood, Mighty Pirate™ and now, apparently, Threat Intelligence Analyst

---

## 🗺️ What is this?

**Guybrush Threepwood** is an interactive visualization tool for **MITRE ATT&CK Mobile** attack matrices.

Just like Guybrush navigating the treacherous seas of the Caribbean, security analysts often find themselves lost in a sea of techniques, tactics, and threat data. This tool gives you a map.

Load any MITRE ATT&CK Navigator `.json` layer file and instantly explore it as an interactive force graph, a classic matrix, or a searchable list — all with full technique descriptions pulled directly from the official MITRE ATT&CK framework.

No monkey business. Just clean threat intelligence visualization.

---

## 🍺 Features

### 🗺️ Three views, one map
- **Graph view** — force-directed D3 graph where tactics are cluster nodes and techniques orbit around them. Drag, zoom, and pan your way through the threat landscape.
- **Matrix view** — classic MITRE Navigator-style column layout, color-coded by tactic.
- **List view** — searchable card grid with risk levels, tactic tags, and descriptions at a glance.

### 📂 Dynamic JSON import
Drop any MITRE ATT&CK Navigator `.json` layer file into the app and watch it come to life. Drag & drop or click to browse. The app auto-detects the layer name from the filename — no configuration needed.

### 🔗 Full MITRE ATT&CK mapping
Every technique links directly to its official MITRE ATT&CK page. Descriptions, tactic mappings, risk levels, and platform tags are all available in a slide-in detail panel.

### ⚡ Risk classification
Techniques are classified by risk level — **Critical**, **High**, **Medium**, **Low** — with visual indicators throughout all three views. Critical techniques literally pulse on the graph. Because they deserve the attention.

### 🔍 Filter & search
Filter the entire visualization by tactic with one click. Search techniques by ID or name across all views in real time.

### 🌐 Live MITRE database — always up to date
The app ships with a built-in technique database, but you can upgrade to the **full official MITRE ATT&CK Mobile dataset** (800+ techniques) with a single command:

```bash
node update.js
```

This downloads the latest STIX data directly from the [MITRE ATT&CK GitHub repository](https://github.com/mitre-attack/attack-stix-data) and stores it locally. The app checks for new versions on every launch and shows an **⬆ UPDATE** badge when a newer version is available.

---

## 🎯 Who is this for?

- **Threat Intelligence analysts** who work with MITRE ATT&CK Mobile layers and need a faster, more visual way to explore them
- **Red & Blue Teams** mapping adversary behavior to the ATT&CK framework
- **Security researchers** studying mobile attack patterns on Android
- **Anyone** who finds the official MITRE Navigator a bit... dry

---

## 🏴‍☠️ Getting started

### Requirements
- Node.js v18 or higher
- npm
- An internet connection (for the first database download)

### Installation

```bash
# Clone the repo
=======
⚓ Guybrush Threepwood — Grog like MITRE Visualizer

"I'm selling these fine leather jackets."
— Guybrush Threepwood, Mighty Pirate™ and now, apparently, Threat Intelligence Analyst


🗺️ What is this?
Guybrush Threepwood is an interactive visualization tool for MITRE ATT&CK Mobile attack matrices.
Just like Guybrush navigating the treacherous seas of the Caribbean, security analysts often find themselves lost in a sea of techniques, tactics, and threat data. This tool gives you a map.
Load any MITRE ATT&CK Navigator .json layer file and instantly explore it as an interactive force graph, a classic matrix, or a searchable list — all with full technique descriptions pulled directly from the official MITRE ATT&CK framework.
No monkey business. Just clean threat intelligence visualization.

🍺 Features
🗺️ Three views, one map

Graph view — force-directed D3 graph where tactics are cluster nodes and techniques orbit around them. Drag, zoom, and pan your way through the threat landscape.
Matrix view — classic MITRE Navigator-style column layout, color-coded by tactic.
List view — searchable card grid with risk levels, tactic tags, and descriptions at a glance.

📂 Dynamic JSON import
Drop any MITRE ATT&CK Navigator .json layer file into the app and watch it come to life. Drag & drop or click to browse. The app auto-detects the layer name from the filename — no configuration needed.
🔗 Full MITRE ATT&CK mapping
Every technique links directly to its official MITRE ATT&CK page. Descriptions, tactic mappings, risk levels, and platform tags are all available in a slide-in detail panel.
⚡ Risk classification
Techniques are classified by risk level — Critical, High, Medium, Low — with visual indicators throughout all three views. Critical techniques literally pulse on the graph. Because they deserve the attention.
🔍 Filter & search
Filter the entire visualization by tactic with one click. Search techniques by ID or name across all views in real time.
🌐 Live MITRE database — always up to date
The app ships with a built-in technique database, but you can upgrade to the full official MITRE ATT&CK Mobile dataset (800+ techniques) with a single command:
bashnode update.js
This downloads the latest STIX data directly from the MITRE ATT&CK GitHub repository and stores it locally. The app checks for new versions on every launch and shows an ⬆ UPDATE badge when a newer version is available.

🎯 Who is this for?

Threat Intelligence analysts who work with MITRE ATT&CK Mobile layers and need a faster, more visual way to explore them
Red & Blue Teams mapping adversary behavior to the ATT&CK framework
Security researchers studying mobile attack patterns on Android
Anyone who finds the official MITRE Navigator a bit... dry


🏴‍☠️ Getting started
Requirements

Node.js v18 or higher
npm
An internet connection (for the first database download)

Installation
bash# Clone the repo
>>>>>>> 6ce809b8d7d70716b4ea370ee0eb94d89418193c
git clone https://github.com/Mindwiped/guybrush-threepwood.git
cd guybrush-threepwood

# Install dependencies
npm install
npm install d3

# Download the full MITRE ATT&CK Mobile database
node update.js

# Launch the app
npm run dev
<<<<<<< HEAD
```

Open your browser at `http://localhost:5173` and set sail. ⚓

> Full step-by-step installation guides for Mac and Windows are included in the repo:
> `README_MAC.md` and `README_WINDOWS.txt`

---

## 🗂️ Loading your own layer files

The app accepts any `.json` file exported from the [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) for the **mobile-attack** domain.

Click the **📂 IMPORT JSON** button in the top right corner, drop your file, and the visualization updates instantly. Files follow the naming convention `LayerName_attack_matrix.json` — the app extracts the layer name automatically.

---

## 🔄 Keeping the database fresh

When MITRE releases a new version of ATT&CK, the app will show a pulsing **⬆ UPDATE vX.x** button in the header. To update:

```bash
node update.js
```

Then reload the browser. That's it.

---

## 🛠️ Built with

- [React](https://react.dev/) — UI framework
- [D3.js](https://d3js.org/) — force graph visualization
- [Vite](https://vitejs.dev/) — build tool
- [MITRE ATT&CK STIX data](https://github.com/mitre-attack/attack-stix-data) — technique database

---

## 📜 License

MIT — use it, fork it, improve it. Just don't use it to actually become a pirate.

---

*"You fight like a dairy farmer."*
*"How appropriate. You fight like a cow."*

— and somewhere in between those two lines, a threat actor just moved laterally across your mobile fleet.

**Stay frosty. Keep mapping.** 🍺
=======
Open your browser at http://localhost:5173 and set sail. ⚓

Full step-by-step installation guides for Mac and Windows are included in the repo:
README_MAC.md and README_WINDOWS.txt


🗂️ Loading your own layer files
The app accepts any .json file exported from the MITRE ATT&CK Navigator for the mobile-attack domain.
Click the 📂 IMPORT JSON button in the top right corner, drop your file, and the visualization updates instantly. Files follow the naming convention LayerName_attack_matrix.json — the app extracts the layer name automatically.

🔄 Keeping the database fresh
When MITRE releases a new version of ATT&CK, the app will show a pulsing ⬆ UPDATE vX.x button in the header. To update:
bashnode update.js
Then reload the browser. That's it.

🛠️ Built with

React — UI framework
D3.js — force graph visualization
Vite — build tool
MITRE ATT&CK STIX data — technique database


📜 License
MIT — use it, fork it, improve it. Just don't use it to actually become a pirate.

"You fight like a dairy farmer."
"How appropriate. You fight like a cow."
— and somewhere in between those two lines, a threat actor just moved laterally across your mobile fleet.
Stay frosty. Keep mapping. 🍺
>>>>>>> 6ce809b8d7d70716b4ea370ee0eb94d89418193c
