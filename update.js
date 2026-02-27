/**
 * Guybrush Threepwood — MITRE Data Updater
 * Run with: node update.js
 * Downloads the latest MITRE ATT&CK Mobile dataset from GitHub
 * and saves it to public/mitre-data.json
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_CONTENTS_API =
  "https://api.github.com/repos/mitre-attack/attack-stix-data/contents/mobile-attack";
const RAW_BASE =
  "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/mobile-attack/";
const OUTPUT_PATH = path.join(__dirname, "public", "mitre-data.json");

// ── Risk override map (MITRE doesn't have risk levels in STIX) ───────────────
const RISK_OVERRIDES = {
  T1429: "critical", T1453: "critical", T1461: "critical", T1474: "critical",
  T1512: "critical", T1617: "critical", T1625: "critical", T1631: "critical",
  T1638: "critical", T1655: "critical", T1412: "critical",
  T1398: "high", T1407: "high", T1411: "high", T1430: "high", T1437: "high",
  T1444: "high", T1456: "high", T1476: "high", T1478: "high", T1513: "high",
  T1517: "high", T1533: "high", T1541: "high", T1575: "high", T1582: "high",
  T1603: "high", T1623: "high", T1624: "high", T1628: "high", T1629: "high",
  T1632: "high", T1636: "high", T1639: "high", T1641: "high", T1646: "high",
  T1516: "high", T1481: "high",
  T1406: "medium", T1416: "medium", T1424: "medium", T1432: "medium",
  T1433: "medium", T1435: "medium", T1437: "medium", T1448: "medium",
  T1521: "medium", T1532: "medium", T1541: "medium", T1604: "medium",
  T1616: "medium", T1630: "medium", T1633: "medium", T1637: "medium",
  T1640: "medium", T1642: "medium",
  T1418: "low", T1420: "low", T1422: "low", T1426: "low", T1519: "low",
};

// ── HTTP helper ───────────────────────────────────────────────────────────────
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "guybrush-threepwood-mitre-visualizer" } }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

// ── Find latest version on GitHub ────────────────────────────────────────────
async function getLatestVersion() {
  console.log("🔍 Checking latest MITRE ATT&CK Mobile version on GitHub...");
  const { body, statusCode } = await httpsGet(GITHUB_CONTENTS_API);

  if (statusCode !== 200) {
    throw new Error(`GitHub API returned status ${statusCode}. Check your internet connection.`);
  }

  const files = JSON.parse(body);
  const versionFiles = files
    .filter((f) => f.name.match(/^mobile-attack-[\d.]+\.json$/))
    .map((f) => {
      const match = f.name.match(/mobile-attack-([\d.]+)\.json/);
      const parts = match[1].split(".").map(Number);
      return { version: match[1], name: f.name, major: parts[0], minor: parts[1] || 0 };
    })
    .sort((a, b) => b.major - a.major || b.minor - a.minor);

  if (!versionFiles.length) throw new Error("No mobile-attack files found on GitHub.");
  return versionFiles[0];
}

// ── Parse STIX bundle into simple technique map ───────────────────────────────
function parseStix(stixBundle) {
  const techniques = {};

  stixBundle.objects.forEach((obj) => {
    // Only process non-revoked, non-deprecated attack patterns
    if (obj.type !== "attack-pattern" || obj.revoked || obj.x_mitre_deprecated) return;

    const extRef = obj.external_references?.find((r) => r.source_name === "mitre-attack");
    if (!extRef) return;

    const id = extRef.external_id;
    // Include both techniques (T1234) and subtechniques (T1234.001)

    const tactics = obj.kill_chain_phases
      ?.filter((p) => p.kill_chain_name === "mitre-mobile-attack")
      .map((p) => p.phase_name) || [];

    if (!tactics.length) return;

    // Clean up description: remove citations and excessive whitespace
    const desc = (obj.description || "")
      .replace(/\(Citation:[^)]+\)/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    techniques[id] = {
      id,
      name: obj.name,
      desc: desc || "No description available.",
      url: extRef.url || `https://attack.mitre.org/techniques/${id}/`,
      tactics,
      risk: RISK_OVERRIDES[id] || "medium",
      platforms: obj.x_mitre_platforms || [],
    };
  });

  return techniques;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🍺 Guybrush Threepwood — MITRE Data Updater\n");

  try {
    // Check current version if file already exists
    let currentVersion = null;
    if (fs.existsSync(OUTPUT_PATH)) {
      try {
        const current = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
        currentVersion = current.version;
        console.log(`📂 Current local version: ${currentVersion}`);
      } catch {
        console.log("⚠️  Could not read current data file, will re-download.");
      }
    }

    // Get latest version from GitHub
    const latest = await getLatestVersion();
    console.log(`🌐 Latest available version: ${latest.version}`);

    if (currentVersion === latest.version) {
      console.log("\n✅ Already up to date! Nothing to do.\n");
      process.exit(0);
    }

    // Download the STIX file
    console.log(`\n⬇️  Downloading mobile-attack-${latest.version}.json...`);
    console.log("   (This file is ~3-4 MB, please wait...)\n");

    const url = RAW_BASE + latest.name;
    const { body, statusCode } = await httpsGet(url);

    if (statusCode !== 200) {
      throw new Error(`Failed to download STIX file: HTTP ${statusCode}`);
    }

    // Parse STIX
    console.log("⚙️  Parsing STIX data...");
    const stix = JSON.parse(body);
    const techniques = parseStix(stix);

    const count = Object.keys(techniques).length;
    console.log(`✅ Parsed ${count} techniques from MITRE ATT&CK Mobile`);

    // Make sure public folder exists
    const publicDir = path.join(__dirname, "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
      console.log("📁 Created public/ folder");
    }

    // Save output
    const output = {
      version: latest.version,
      updated: new Date().toISOString(),
      source: "https://github.com/mitre-attack/attack-stix-data",
      techniqueCount: count,
      techniques,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));
    console.log(`💾 Saved to public/mitre-data.json`);
    console.log(`\n🍺 Done! MITRE ATT&CK Mobile v${latest.version} — ${count} techniques loaded.`);
    console.log("   Reload the app in your browser to use the new data.\n");

  } catch (err) {
    console.error("\n❌ Error:", err.message);
    console.error("   Make sure you have an internet connection and try again.\n");
    process.exit(1);
  }
}

main();
