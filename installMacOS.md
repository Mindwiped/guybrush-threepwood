### Installation Guide for Mac — idiot proof step by step guide (as I'm an idiot first)

---

## What is this?
A visual tool to explore MITRE ATT&CK attack matrices for mobile devices (Android).
You can load any `.json` layer file and navigate techniques, tactics, and risk levels interactively.

---

## What you need before starting
You need **two things** installed on your Mac: **Homebrew** and **Node.js**.
Don't worry, we'll check and install them step by step.

---

## STEP 1 — Open Terminal
Terminal is the black window where you type commands.

1. Press **Cmd + Space** on your keyboard
2. Type `Terminal`
3. Press **Enter**

A window with a blinking cursor will open. That's your Terminal. Leave it open.

---

## STEP 2 — Check if Homebrew is installed
Type this in Terminal and press Enter:

```
brew --version
```

- If you see something like `Homebrew 4.x.x` → **skip to Step 4**
- If you see `command not found` → **continue to Step 3**

---

## STEP 3 — Install Homebrew (skip if already installed)
Copy and paste this entire line into Terminal, then press Enter:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

It will ask for your **Mac password** (the one you use to log in).
You won't see the password as you type — that's normal. Just type it and press Enter.

Wait for it to finish. It may take a few minutes.

---

## STEP 4 — Install Node.js
Type this in Terminal and press Enter:

```
brew install node
```

Wait for it to finish. Then verify it worked:

```
node --version
npm --version
```

You should see version numbers (e.g. `v20.x.x` and `10.x.x`). Any numbers are fine.

---

## STEP 5 — Create the project
Run these commands **one at a time**, pressing Enter after each:

```
cd ~/Desktop
```

```
npm create vite@latest guybrush-threepwood -- --template react
```

If it asks `Ok to proceed? (y)` → type `y` and press Enter.

```
cd guybrush-threepwood
```

```
npm install
```

```
npm install d3
```

---

## STEP 6 — Add the app code
Copy the file `guybrush-threepwood.jsx` into the project.
Run this in Terminal (make sure both files are in your Downloads folder first):

```
cp ~/Downloads/guybrush-threepwood.jsx ~/Desktop/guybrush-threepwood/src/App.jsx
```

Also copy the `update.js` script into the project root:

```
cp ~/Downloads/update.js ~/Desktop/guybrush-threepwood/update.js
```

---

## STEP 7 — Download the full MITRE ATT&CK database
This step downloads the complete MITRE ATT&CK Mobile dataset (~3-4 MB) from GitHub.
It gives the app full descriptions for all techniques instead of just the built-in ones.

```
cd ~/Desktop/guybrush-threepwood
node update.js
```

You will see a progress log in Terminal ending with something like:
`🍺 Done! MITRE ATT&CK Mobile v18.1 — 120 techniques loaded.`

---

## STEP 8 — Launch the app
```
npm run dev
```

Now open your browser (Safari, Chrome, Firefox — any) and go to:

```
http://localhost:5173
```

The app will appear. 🎉
The stats bar at the top will show **DB Source: v18.x** confirming the full database is loaded.

---

## How to use the app

| Feature | How |
|---|---|
| **Load a JSON file** | Click the 📂 IMPORT JSON button (top right) |
| **Switch views** | Click GRAPH / MATRIX / LIST buttons |
| **Filter by tactic** | Click any tactic pill below the header |
| **Search a technique** | Type in the search box (top right) |
| **See technique details** | Click any node or card |
| **Zoom / Pan the graph** | Scroll to zoom, click and drag to move |
| **Update MITRE database** | If the ⬆ UPDATE button appears, run `node update.js` in Terminal |

---

## How to update the MITRE ATT&CK database
When MITRE releases a new version of the framework, the app will show a pulsing
**⬆ UPDATE vX.x** button in the top right corner. To update:

1. Open Terminal
2. Run:
```
cd ~/Desktop/guybrush-threepwood
node update.js
```
3. Reload the browser when it finishes

---

## How to open the app next time
Every time you want to use the app again:

1. Open Terminal
2. Run:
```
cd ~/Desktop/guybrush-threepwood
npm run dev
```
3. Go to `http://localhost:5173` in your browser
4. When done, press **Ctrl + C** in Terminal to stop it

---

## Something went wrong?

| Problem | Solution |
|---|---|
| `command not found: brew` | Go back to Step 3 and install Homebrew |
| `command not found: node` | Go back to Step 4 and install Node.js |
| Browser shows blank page | Make sure `npm run dev` is still running in Terminal |
| Port already in use | Close other Terminal windows and try again |
| File not found when copying | Check that the files are in your Downloads folder |
| `node update.js` fails | Check your internet connection and try again |
| DB Source still shows "built-in" | Make sure `update.js` is in the project root and run `node update.js` again |

---

*Built with React + D3 + Vite · MITRE ATT&CK Mobile Framework*

From your friendly neighbor Fish
