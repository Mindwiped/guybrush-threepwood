import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

// ── MITRE ATT&CK Mobile knowledge base ──────────────────────────────────────
const MITRE_DB = {
  T1603: { name: "Scheduled Task/Job", desc: "Adversaries may abuse task scheduling functionality to facilitate initial or recurring execution of malicious code. On Android, the AlarmManager API allows apps to schedule code execution.", url: "https://attack.mitre.org/techniques/T1603/", risk: "high" },
  T1453: { name: "Abuse Elevation Control Mechanism", desc: "Adversaries may circumvent mechanisms designed to control elevated privileges to gain higher-level permissions. On Android this can involve abusing accessibility services.", url: "https://attack.mitre.org/techniques/T1453/", risk: "critical" },
  T1646: { name: "Exfiltration Over C2 Channel", desc: "Adversaries may steal data by exfiltrating it over an existing command and control channel. Stolen data is encoded into the normal communications channel using the same protocol.", url: "https://attack.mitre.org/techniques/T1646/", risk: "high" },
  T1616: { name: "Call Control", desc: "Adversaries may make, forward, or block phone calls without user authorization. This can be used to perform toll fraud or intercept communications.", url: "https://attack.mitre.org/techniques/T1616/", risk: "medium" },
  T1517: { name: "Access Notifications", desc: "Adversaries may collect data within notifications sent by the operating system or other applications. Notifications may contain sensitive data such as one-time authentication codes.", url: "https://attack.mitre.org/techniques/T1517/", risk: "high" },
  T1398: { name: "Boot or Logon Initialization Scripts", desc: "Adversaries may use scripts automatically executed at boot or logon initialization to establish persistence. On Android, receivers registered for BOOT_COMPLETED fire at device startup.", url: "https://attack.mitre.org/techniques/T1398/", risk: "high" },
  T1575: { name: "Native API", desc: "Adversaries may interact with the native OS layer to execute behaviors. On Android, the NDK allows apps to call C/C++ functions and bypass Java-layer security checks.", url: "https://attack.mitre.org/techniques/T1575/", risk: "high" },
  T1541: { name: "Foreground Persistence", desc: "Adversaries may abuse Android's foreground service mechanism to maintain persistence while avoiding being killed by the OS. Foreground services show a persistent notification.", url: "https://attack.mitre.org/techniques/T1541/", risk: "medium" },
  T1429: { name: "Audio Capture", desc: "Adversaries may capture audio to collect information. On Android, apps can record microphone audio using the MediaRecorder or AudioRecord APIs.", url: "https://attack.mitre.org/techniques/T1429/", risk: "critical" },
  T1437: { name: "Application Layer Protocol", desc: "Adversaries may communicate using OSI application layer protocols to avoid detection/network filtering. Commands are embedded in legitimate protocol traffic.", url: "https://attack.mitre.org/techniques/T1437/", risk: "medium" },
  T1513: { name: "Screen Capture", desc: "Adversaries may use screen capture to collect information. On Android, the MediaProjection API can capture the screen, but requires user consent via a prompt.", url: "https://attack.mitre.org/techniques/T1513/", risk: "high" },
  T1430: { name: "Location Tracking", desc: "Adversaries may track a device's physical location through use of standard telemetry APIs (GPS, network triangulation) without the user's knowledge.", url: "https://attack.mitre.org/techniques/T1430/", risk: "high" },
  T1617: { name: "Hooking", desc: "Adversaries may use hooking to conceal artifacts and modify app behavior at runtime. On Android, frameworks like Xposed or Frida can hook Java/native methods.", url: "https://attack.mitre.org/techniques/T1617/", risk: "critical" },
  T1420: { name: "File and Directory Discovery", desc: "Adversaries may enumerate files and directories to find interesting content. Mobile apps have varying levels of filesystem access depending on permissions and sandbox.", url: "https://attack.mitre.org/techniques/T1420/", risk: "low" },
  T1624: { name: "Event Triggered Execution", desc: "Adversaries may establish persistence using system mechanisms that trigger execution based on specific events. Android BroadcastReceivers respond to system-wide intents.", url: "https://attack.mitre.org/techniques/T1624/", risk: "high" },
  T1512: { name: "Video Capture", desc: "Adversaries may capture video to collect information. On Android, the Camera API can capture video. RECORD_AUDIO and CAMERA permissions are required.", url: "https://attack.mitre.org/techniques/T1512/", risk: "critical" },
  T1533: { name: "Data from Local System", desc: "Adversaries may search local system sources to find files of interest, including databases, configuration files, browser data, and other stored credentials.", url: "https://attack.mitre.org/techniques/T1533/", risk: "high" },
  T1426: { name: "System Information Discovery", desc: "Adversaries may attempt to get detailed information about the OS and hardware, including OS version, device model, IMEI, installed apps, and network configuration.", url: "https://attack.mitre.org/techniques/T1426/", risk: "low" },
  T1532: { name: "Archive Collected Data", desc: "Adversaries may compress and/or encrypt data that is collected prior to exfiltration. This makes detection harder and reduces data size for transmission.", url: "https://attack.mitre.org/techniques/T1532/", risk: "medium" },
  T1521: { name: "Encrypted Channel", desc: "Adversaries may employ a known encryption algorithm to conceal command and control traffic rather than relying on any inherent protections provided by a communication protocol.", url: "https://attack.mitre.org/techniques/T1521/", risk: "medium" },
  T1655: { name: "Input Injection", desc: "Adversaries may inject input to the OS from a compromised application to control the device. Android accessibility services can inject touch, swipe, and key events.", url: "https://attack.mitre.org/techniques/T1655/", risk: "critical" },
  T1628: { name: "Hide Artifacts", desc: "Adversaries may attempt to hide artifacts associated with their behaviors to evade detection. On Android this includes hiding icons, obfuscating code, or using native libraries.", url: "https://attack.mitre.org/techniques/T1628/", risk: "high" },
  T1406: { name: "Obfuscated Files or Information", desc: "Adversaries may attempt to make an executable or file difficult to discover or analyze by encrypting, encoding, or otherwise obfuscating its contents.", url: "https://attack.mitre.org/techniques/T1406/", risk: "medium" },
  T1407: { name: "Download New Code at Runtime", desc: "Adversaries may attempt to download and execute code at runtime to evade static analysis.", url: "https://attack.mitre.org/techniques/T1407/", risk: "high" },
  T1412: { name: "Capture SMS Messages", desc: "Adversaries may capture SMS messages to obtain authentication codes or other sensitive information.", url: "https://attack.mitre.org/techniques/T1412/", risk: "critical" },
  T1418: { name: "Software Discovery", desc: "Adversaries may attempt to get a listing of applications that are installed on a device.", url: "https://attack.mitre.org/techniques/T1418/", risk: "low" },
  T1422: { name: "System Network Configuration Discovery", desc: "Adversaries may look for details about the network configuration and settings of systems.", url: "https://attack.mitre.org/techniques/T1422/", risk: "low" },
  T1424: { name: "Process Discovery", desc: "Adversaries may attempt to get information about running processes on a system.", url: "https://attack.mitre.org/techniques/T1424/", risk: "low" },
  T1433: { name: "Access Call Log", desc: "Adversaries may utilize call logs to identify targets or for other malicious purposes.", url: "https://attack.mitre.org/techniques/T1433/", risk: "medium" },
  T1444: { name: "Masquerade as Legitimate Application", desc: "Adversaries may attempt to make their malicious application appear legitimate.", url: "https://attack.mitre.org/techniques/T1444/", risk: "high" },
  T1448: { name: "Carrier Billing Fraud", desc: "Adversaries may subscribe victims to premium services to generate revenue.", url: "https://attack.mitre.org/techniques/T1448/", risk: "medium" },
  T1456: { name: "Drive-by Compromise", desc: "Adversaries may gain access to a system through a user visiting a website over the normal course of browsing.", url: "https://attack.mitre.org/techniques/T1456/", risk: "high" },
  T1461: { name: "Lockscreen Bypass", desc: "Adversaries may attempt to bypass the lockscreen to gain access to a device.", url: "https://attack.mitre.org/techniques/T1461/", risk: "critical" },
  T1474: { name: "Supply Chain Compromise", desc: "Adversaries may manipulate products or delivery mechanisms prior to receipt by a final consumer.", url: "https://attack.mitre.org/techniques/T1474/", risk: "critical" },
  T1476: { name: "Deliver Malicious App via Authorized App Store", desc: "Adversaries may deliver malicious applications through official app stores.", url: "https://attack.mitre.org/techniques/T1476/", risk: "high" },
  T1481: { name: "Web Service", desc: "Adversaries may use an existing, legitimate external Web service as a means for relaying data.", url: "https://attack.mitre.org/techniques/T1481/", risk: "medium" },
  T1582: { name: "SMS Control", desc: "Adversaries may delete, alter, or send SMS messages without user authorization.", url: "https://attack.mitre.org/techniques/T1582/", risk: "high" },
  T1623: { name: "Command and Scripting Interpreter", desc: "Adversaries may abuse command and script interpreters to execute commands and scripts.", url: "https://attack.mitre.org/techniques/T1623/", risk: "high" },
  T1625: { name: "Hijack Execution Flow", desc: "Adversaries may execute their own malicious payloads by hijacking the way an app loads code.", url: "https://attack.mitre.org/techniques/T1625/", risk: "critical" },
  T1629: { name: "Impair Defenses", desc: "Adversaries may maliciously modify components of a victim's environment to hinder or disable defensive mechanisms.", url: "https://attack.mitre.org/techniques/T1629/", risk: "high" },
  T1631: { name: "Process Injection", desc: "Adversaries may inject code into processes in order to evade process-based defenses.", url: "https://attack.mitre.org/techniques/T1631/", risk: "critical" },
  T1632: { name: "Subvert Trust Controls", desc: "Adversaries may undermine security controls that will warn users of untrusted activity.", url: "https://attack.mitre.org/techniques/T1632/", risk: "high" },
  T1633: { name: "Virtualization/Sandbox Evasion", desc: "Adversaries may employ various means to detect and avoid virtualization and analysis environments.", url: "https://attack.mitre.org/techniques/T1633/", risk: "medium" },
  T1636: { name: "Protected User Data", desc: "Adversaries may access data protected by the Android permission model.", url: "https://attack.mitre.org/techniques/T1636/", risk: "high" },
  T1638: { name: "Adversary-in-the-Middle", desc: "Adversaries may attempt to position themselves between two or more networked devices.", url: "https://attack.mitre.org/techniques/T1638/", risk: "critical" },
  T1639: { name: "Exfiltration Over Alternative Protocol", desc: "Adversaries may steal data by exfiltrating it over a different protocol than that of the existing C2 channel.", url: "https://attack.mitre.org/techniques/T1639/", risk: "high" },
  T1641: { name: "Data Manipulation", desc: "Adversaries may insert, delete, or manipulate data in order to manipulate external outcomes.", url: "https://attack.mitre.org/techniques/T1641/", risk: "high" },
};

const TACTIC_META = {
  execution:              { label: "Execution",           color: "#f97316", icon: "⚡" },
  persistence:            { label: "Persistence",          color: "#a855f7", icon: "🔒" },
  collection:             { label: "Collection",           color: "#06b6d4", icon: "📡" },
  "credential-access":    { label: "Credential Access",   color: "#ef4444", icon: "🔑" },
  exfiltration:           { label: "Exfiltration",         color: "#f59e0b", icon: "📤" },
  "defense-evasion":      { label: "Defense Evasion",      color: "#84cc16", icon: "🛡" },
  discovery:              { label: "Discovery",            color: "#3b82f6", icon: "🔍" },
  "command-and-control":  { label: "C2",                   color: "#ec4899", icon: "📡" },
  impact:                 { label: "Impact",               color: "#14b8a6", icon: "💥" },
  "initial-access":       { label: "Initial Access",       color: "#f43f5e", icon: "🚪" },
  "privilege-escalation": { label: "Privilege Escalation", color: "#fb923c", icon: "⬆" },
  "lateral-movement":     { label: "Lateral Movement",     color: "#22d3ee", icon: "↔" },
};

const RISK_CONFIG = {
  critical: { color: "#ef4444", label: "Critical" },
  high:     { color: "#f97316", label: "High" },
  medium:   { color: "#f59e0b", label: "Medium" },
  low:      { color: "#84cc16", label: "Low" },
};

const KARA_DEFAULT = {
  name: "Kara", domain: "mobile-attack", filters: { platforms: ["Android"] },
  techniques: [
    { techniqueID: "T1603", tactic: "execution" }, { techniqueID: "T1603", tactic: "persistence" },
    { techniqueID: "T1453", tactic: "collection" }, { techniqueID: "T1453", tactic: "credential-access" },
    { techniqueID: "T1646", tactic: "exfiltration" }, { techniqueID: "T1616", tactic: "collection" },
    { techniqueID: "T1616", tactic: "impact" }, { techniqueID: "T1616", tactic: "command-and-control" },
    { techniqueID: "T1517", tactic: "collection" }, { techniqueID: "T1517", tactic: "credential-access" },
    { techniqueID: "T1398", tactic: "persistence" }, { techniqueID: "T1575", tactic: "defense-evasion" },
    { techniqueID: "T1575", tactic: "execution" }, { techniqueID: "T1541", tactic: "defense-evasion" },
    { techniqueID: "T1541", tactic: "persistence" }, { techniqueID: "T1429", tactic: "collection" },
    { techniqueID: "T1437", tactic: "command-and-control" }, { techniqueID: "T1513", tactic: "collection" },
    { techniqueID: "T1430", tactic: "collection" }, { techniqueID: "T1430", tactic: "discovery" },
    { techniqueID: "T1617", tactic: "defense-evasion" }, { techniqueID: "T1420", tactic: "discovery" },
    { techniqueID: "T1624", tactic: "persistence" }, { techniqueID: "T1512", tactic: "collection" },
    { techniqueID: "T1533", tactic: "collection" }, { techniqueID: "T1426", tactic: "discovery" },
    { techniqueID: "T1532", tactic: "collection" }, { techniqueID: "T1521", tactic: "command-and-control" },
    { techniqueID: "T1655", tactic: "defense-evasion" }, { techniqueID: "T1628", tactic: "defense-evasion" },
  ],
};

// ── GitHub version check ──────────────────────────────────────────────────────
const GITHUB_CONTENTS_API =
  "https://api.github.com/repos/mitre-attack/attack-stix-data/contents/mobile-attack";

async function fetchLatestVersion() {
  try {
    const res = await fetch(GITHUB_CONTENTS_API, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!res.ok) return null;
    const files = await res.json();
    const versionFiles = files
      .filter((f) => f.name.match(/^mobile-attack-[\d.]+\.json$/))
      .map((f) => {
        const match = f.name.match(/mobile-attack-([\d.]+)\.json/);
        const parts = match[1].split(".").map(Number);
        return { version: match[1], major: parts[0], minor: parts[1] || 0 };
      })
      .sort((a, b) => b.major - a.major || b.minor - a.minor);
    return versionFiles[0]?.version || null;
  } catch {
    return null;
  }
}

// ── Load MITRE data from public/mitre-data.json ───────────────────────────────
async function loadMitreData() {
  try {
    const res = await fetch("/mitre-data.json");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function buildGraph(data, db = MITRE_DB) {
  const techniqueMap = {};
  data.techniques.forEach((t) => {
    if (!techniqueMap[t.techniqueID]) {
      techniqueMap[t.techniqueID] = {
        id: t.techniqueID, tactics: [], enabled: t.enabled,
        ...(db[t.techniqueID] || {
          name: t.techniqueID,
          desc: "Tecnica non presente nel database locale. Consulta MITRE ATT&CK per i dettagli.",
          url: `https://attack.mitre.org/techniques/${t.techniqueID}/`,
          risk: "medium",
        }),
      };
    }
    if (!techniqueMap[t.techniqueID].tactics.includes(t.tactic)) {
      techniqueMap[t.techniqueID].tactics.push(t.tactic);
    }
  });
  const tactics = [...new Set(data.techniques.map((t) => t.tactic))];
  const nodes = [];
  const links = [];
  tactics.forEach((tactic) => {
    nodes.push({ id: `tactic_${tactic}`, type: "tactic", tactic, label: TACTIC_META[tactic]?.label || tactic, color: TACTIC_META[tactic]?.color || "#6366f1" });
  });
  Object.values(techniqueMap).forEach((tech) => {
    nodes.push({ ...tech, type: "technique" });
    tech.tactics.forEach((tactic) => {
      links.push({ source: `tactic_${tactic}`, target: tech.id, tactic });
    });
  });
  return { nodes, links, techniqueMap, tactics };
}

// ── Import Modal ──────────────────────────────────────────────────────────────
function ImportModal({ onImport, onClose, loadedFiles }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const parseFile = (file) => {
    if (!file.name.endsWith(".json")) { setError("Il file deve essere in formato .json"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.techniques || !Array.isArray(parsed.techniques)) {
          setError("JSON non valido: manca il campo 'techniques'.");
          return;
        }
        onImport({ data: parsed, filename: file.name });
        onClose();
      } catch {
        setError("Errore nel parsing del JSON. Verifica che il file sia valido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 16, padding: "32px", width: 500, maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, letterSpacing: "0.15em" }}>MITRE ATT&CK NAVIGATOR</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9" }}>Importa Layer JSON</h2>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Drag & drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? "#06b6d4" : "#334155"}`, borderRadius: 12, padding: "40px 20px",
            textAlign: "center", cursor: "pointer", transition: "all 0.2s",
            background: dragOver ? "#06b6d422" : "#0a101c", marginBottom: 16,
          }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6 }}>{dragOver ? "Rilascia il file qui" : "Trascina qui il tuo file JSON"}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>oppure clicca per selezionarlo</div>
          <input ref={fileRef} type="file" accept=".json" onChange={(e) => { const f = e.target.files[0]; if (f) parseFile(f); }} style={{ display: "none" }} />
        </div>

        {error && (
          <div style={{ background: "#ef444422", border: "1px solid #ef444455", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ef4444" }}>⚠️ {error}</div>
        )}

        {/* Layer già caricati */}
        {loadedFiles.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, letterSpacing: "0.1em" }}>LAYER CARICATI IN SESSIONE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
              {loadedFiles.map((f, i) => (
                <div key={i} onClick={() => { onImport(f); onClose(); }} style={{
                  background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px",
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "background 0.15s",
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#e2e8f0" }}>{f.data.name || f.filename}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{f.filename} · {f.data.techniques?.length} tecniche</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#06b6d4" }}>→ carica</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Update Modal ──────────────────────────────────────────────────────────────
function UpdateModal({ localVersion, latestVersion, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 16, padding: "32px", width: 480, maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, letterSpacing: "0.15em" }}>MITRE ATT&CK MOBILE</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9" }}>Update Available 🍺</h2>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Version comparison */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>CURRENT VERSION</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: localVersion ? "#94a3b8" : "#475569", fontFamily: "'Syne', sans-serif" }}>
              {localVersion || "built-in"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#06b6d4", fontSize: 20 }}>→</div>
          <div style={{ flex: 1, background: "#06b6d422", border: "1px solid #06b6d455", borderRadius: 10, padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>LATEST VERSION</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#06b6d4", fontFamily: "'Syne', sans-serif" }}>{latestVersion}</div>
          </div>
        </div>

        <div style={{ background: "#0a101c", border: "1px solid #1e293b", borderRadius: 10, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 10, letterSpacing: "0.1em" }}>HOW TO UPDATE</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, lineHeight: 1.6 }}>
            Open Terminal, vai nella cartella del progetto e lancia:
          </div>
          <div style={{ background: "#080c14", border: "1px solid #334155", borderRadius: 8, padding: "12px 16px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#06b6d4" }}>
            cd ~/Desktop/kara-viz<br />
            node update.js
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 10, lineHeight: 1.6 }}>
            Lo script scaricherà ~3-4 MB da GitHub, analizzerà tutte le tecniche MITRE ATT&CK Mobile e aggiornerà il database locale. Poi ricarica il browser.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f59e0b11", border: "1px solid #f59e0b33", borderRadius: 8 }}>
          <span>⚡</span>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>L'aggiornamento non tocca i tuoi file JSON — cambia solo il database delle descrizioni.</span>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const svgRef = useRef(null);
  const [rawData, setRawData] = useState(KARA_DEFAULT);
  const [layerName, setLayerName] = useState(KARA_DEFAULT.name);
  const [mitreDB, setMitreDB] = useState(MITRE_DB);
  const [localVersion, setLocalVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [dataSource, setDataSource] = useState("builtin"); // "builtin" | "local"
  const [selected, setSelected] = useState(null);
  const [filterTactic, setFilterTactic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("graph");
  const [showImport, setShowImport] = useState(false);
  const [loadedFiles, setLoadedFiles] = useState([{ data: KARA_DEFAULT, filename: "Kara_attack_matrix.json" }]);

  const handleImport = ({ data, filename }) => {
    setRawData(data);
    setLayerName(filename.replace("_attack_matrix.json", ""));
    setSelected(null);
    setFilterTactic(null);
    setSearchTerm("");
    setLoadedFiles((prev) => prev.find((f) => f.filename === filename) ? prev : [...prev, { data, filename }]);
  };

  // ── Load MITRE data + check for updates on mount ──────────────────────────
  useEffect(() => {
    async function init() {
      // 1. Try to load local mitre-data.json
      const local = await loadMitreData();
      if (local?.techniques) {
        setMitreDB({ ...MITRE_DB, ...local.techniques });
        setLocalVersion(local.version);
        setDataSource("local");
        console.log(`🍺 Loaded MITRE data v${local.version} — ${local.techniqueCount} techniques`);
      }

      // 2. Check GitHub for latest version (non-blocking)
      const latest = await fetchLatestVersion();
      if (latest) {
        setLatestVersion(latest);
        const currentVer = local?.version || null;
        if (!currentVer || compareVersions(latest, currentVer) > 0) {
          setUpdateAvailable(true);
        }
      }
    }
    init();
  }, []);

  function compareVersions(a, b) {
    const [aMaj, aMin = 0] = a.split(".").map(Number);
    const [bMaj, bMin = 0] = b.split(".").map(Number);
    return aMaj !== bMaj ? aMaj - bMaj : aMin - bMin;
  }

  const { nodes, links, techniqueMap, tactics } = buildGraph(rawData, mitreDB);
  const platforms = rawData.filters?.platforms || [];
  const domain = rawData.domain || "mobile-attack";

  // ── D3 graph ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== "graph") return;
    const el = svgRef.current;
    if (!el) return;
    const w = el.clientWidth || 900;
    const h = el.clientHeight || 600;
    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el).attr("viewBox", `0 0 ${w} ${h}`);
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const container = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.3, 3]).on("zoom", (e) => container.attr("transform", e.transform)));

    const filteredNodes = filterTactic
      ? nodes.filter((n) => n.type === "tactic" ? n.tactic === filterTactic : n.tactics?.includes(filterTactic))
      : nodes;
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = links.filter((l) => filteredNodeIds.has(l.source?.id || l.source) && filteredNodeIds.has(l.target?.id || l.target));

    const sim = d3.forceSimulation(filteredNodes)
      .force("link", d3.forceLink(filteredLinks).id((d) => d.id).distance(110).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-320))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius((d) => d.type === "tactic" ? 55 : 35));

    const link = container.append("g").selectAll("line").data(filteredLinks).join("line")
      .attr("stroke", (d) => TACTIC_META[d.tactic]?.color || "#4b5563")
      .attr("stroke-opacity", 0.35).attr("stroke-width", 1.5);

    const tacticGroup = container.append("g").selectAll("g").data(filteredNodes.filter((n) => n.type === "tactic")).join("g")
      .attr("cursor", "pointer").call(drag(sim))
      .on("click", (e, d) => { e.stopPropagation(); setFilterTactic((p) => p === d.tactic ? null : d.tactic); });
    tacticGroup.append("circle").attr("r", 40).attr("fill", (d) => d.color + "22").attr("stroke", (d) => d.color).attr("stroke-width", 2).style("filter", "url(#glow)");
    tacticGroup.append("text").attr("text-anchor", "middle").attr("dy", "-6px").attr("font-size", "18px").text((d) => TACTIC_META[d.tactic]?.icon || "▸");
    tacticGroup.append("text").attr("text-anchor", "middle").attr("dy", "12px").attr("font-size", "9px").attr("fill", (d) => d.color).attr("font-family", "'Space Mono', monospace").attr("font-weight", "bold").text((d) => d.label);

    const tooltip = d3.select(el.parentElement).append("div")
      .style("position", "absolute").style("background", "#0f172a").style("border", "1px solid #334155")
      .style("color", "#e2e8f0").style("padding", "6px 10px").style("border-radius", "6px")
      .style("font-size", "11px").style("pointer-events", "none").style("opacity", 0).style("z-index", 999);

    const techGroup = container.append("g").selectAll("g").data(filteredNodes.filter((n) => n.type === "technique")).join("g")
      .attr("cursor", "pointer").call(drag(sim))
      .on("click", (e, d) => { e.stopPropagation(); setSelected(d); });
    techGroup.append("circle").attr("r", 22)
      .attr("fill", (d) => (TACTIC_META[d.tactics?.[0]]?.color || "#6366f1") + "33")
      .attr("stroke", (d) => (RISK_CONFIG[d.risk] || RISK_CONFIG.medium).color)
      .attr("stroke-width", (d) => d.risk === "critical" ? 2.5 : 1.5)
      .style("filter", (d) => d.risk === "critical" ? "url(#glow)" : "none")
      .on("mouseover", function (e, d) { d3.select(this).attr("r", 26); tooltip.style("opacity", 1).html(`<strong>${d.id}</strong><br/>${d.name}`); })
      .on("mousemove", (e) => { tooltip.style("left", (e.offsetX + 12) + "px").style("top", (e.offsetY - 24) + "px"); })
      .on("mouseout", function () { d3.select(this).attr("r", 22); tooltip.style("opacity", 0); });
    techGroup.append("text").attr("text-anchor", "middle").attr("dy", "3px").attr("font-size", "8.5px")
      .attr("fill", "#e2e8f0").attr("font-family", "'Space Mono', monospace").attr("pointer-events", "none").text((d) => d.id);

    svg.on("click", () => setSelected(null));
    sim.on("tick", () => {
      link.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      tacticGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
      techGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); d3.select(el.parentElement).select("div").remove(); };
  }, [view, filterTactic, rawData]);

  function drag(sim) {
    return d3.drag()
      .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
  }

  const filteredTechs = Object.values(techniqueMap).filter((t) => {
    const q = searchTerm.toLowerCase();
    return (!filterTactic || t.tactics.includes(filterTactic)) && (!q || t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
  });

  const tacticColumns = tactics.map((tactic) => ({
    tactic,
    meta: TACTIC_META[tactic] || { label: tactic, color: "#6366f1", icon: "▸" },
    techs: Object.values(techniqueMap).filter((t) => t.tactics.includes(tactic)),
  }));

  const stats = {
    total: Object.keys(techniqueMap).length,
    critical: Object.values(techniqueMap).filter((t) => t.risk === "critical").length,
    tactics: tactics.length,
    multiTactic: Object.values(techniqueMap).filter((t) => t.tactics.length > 1).length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "'Space Mono', monospace", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .btn { cursor: pointer; border: none; outline: none; transition: all 0.2s; }
        .btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
        .tech-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s; }
        .tech-card:hover { border-color: #334155; background: #162032; transform: translateY(-2px); }
        .panel-enter { animation: slideIn 0.25s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .matrix-cell { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 8px 10px; cursor: pointer; transition: all 0.15s; font-size: 10px; }
        .matrix-cell:hover { background: #162032; border-color: #334155; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 32px 32px; }
        .import-btn:hover { background: #06b6d4 !important; color: #080c14 !important; border-color: #06b6d4 !important; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "16px 28px", display: "flex", alignItems: "center", gap: 20, background: "#0a101c" }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.15em", marginBottom: 2 }}>
            MITRE ATT&CK · {domain.toUpperCase()} · {platforms.join(", ").toUpperCase() || "ALL PLATFORMS"}
          </div>
          <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#06b6d4" }}>GUYBRUSH THREEPWOOD</span>
            <span style={{ color: "#f59e0b", margin: "0 8px", fontWeight: 400, fontSize: 14 }}>—</span>
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 14 }}>Grog like MITRE visualizer</span>
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>
            Layer: <span style={{ color: "#06b6d4" }}>{layerName}</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search technique…"
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "7px 14px", fontSize: 12, outline: "none", width: 200 }} />
          {["graph", "matrix", "list"].map((v) => (
            <button key={v} className="btn" onClick={() => setView(v)} style={{
              background: view === v ? "#06b6d4" : "#1e293b", color: view === v ? "#080c14" : "#94a3b8",
              border: "1px solid #334155", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontFamily: "'Space Mono', monospace",
            }}>{v.toUpperCase()}</button>
          ))}
          <button className="btn import-btn" onClick={() => setShowImport(true)} style={{
            background: "#1e293b", color: "#06b6d4", border: "1px solid #06b6d455",
            borderRadius: 8, padding: "7px 16px", fontSize: 11, fontFamily: "'Space Mono', monospace",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>📂</span> IMPORT JSON
          </button>
          {updateAvailable && (
            <button className="btn" onClick={() => setShowUpdateModal(true)} style={{
              background: "#f59e0b22", color: "#f59e0b", border: "1px solid #f59e0b55",
              borderRadius: 8, padding: "7px 16px", fontSize: 11, fontFamily: "'Space Mono', monospace",
              display: "flex", alignItems: "center", gap: 6, animation: "pulse 2s infinite",
            }}>
              <span>⬆</span> UPDATE v{latestVersion}
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0a101c" }}>
        {[
          { label: "Techniques", value: stats.total, color: "#06b6d4" },
          { label: "Tactics", value: stats.tactics, color: "#a855f7" },
          { label: "Critical Risk", value: stats.critical, color: "#ef4444" },
          { label: "Multi-tactic", value: stats.multiTactic, color: "#f59e0b" },
          { label: "Platform", value: platforms.join(", ") || "All", color: "#84cc16" },
          { label: "DB Source", value: dataSource === "local" ? `v${localVersion}` : "built-in", color: dataSource === "local" ? "#06b6d4" : "#475569" },
        ].map(({ label, value, color }, i) => (
          <div key={i} style={{ padding: "10px 24px", borderRight: "1px solid #1e293b", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Syne', sans-serif" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tactic pills */}
      <div style={{ padding: "10px 28px", borderBottom: "1px solid #1e293b", display: "flex", gap: 6, flexWrap: "wrap", background: "#0a101c" }}>
        <button className="btn" onClick={() => setFilterTactic(null)} style={{
          background: !filterTactic ? "#1e293b" : "transparent", border: `1px solid ${!filterTactic ? "#475569" : "#1e293b"}`,
          color: !filterTactic ? "#e2e8f0" : "#475569", borderRadius: 99, padding: "4px 12px", fontSize: 10, fontFamily: "'Space Mono', monospace",
        }}>ALL</button>
        {tactics.map((t) => {
          const m = TACTIC_META[t] || { label: t, color: "#6366f1", icon: "▸" };
          const active = filterTactic === t;
          return (
            <button key={t} className="btn" onClick={() => setFilterTactic(active ? null : t)} style={{
              background: active ? m.color + "33" : "transparent", border: `1px solid ${active ? m.color : "#1e293b"}`,
              color: active ? m.color : "#475569", borderRadius: 99, padding: "4px 12px", fontSize: 10, fontFamily: "'Space Mono', monospace",
            }}>{m.icon} {m.label.toUpperCase()}</button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {view === "graph" && (
          <div className="grid-bg" style={{ flex: 1, position: "relative" }}>
            <svg ref={svgRef} style={{ width: "100%", height: "100%", minHeight: 600 }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, background: "#0a101ccc", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>RISK LEVEL</div>
              {Object.entries(RISK_CONFIG).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.color }} />
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{v.label}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 10, color: "#475569" }}>⬤ Tactic · ○ Technique<br />Scroll zoom · Drag pan</div>
            </div>
          </div>
        )}

        {view === "matrix" && (
          <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", padding: "20px 28px" }}>
            <div style={{ display: "flex", gap: 12, minWidth: "max-content" }}>
              {tacticColumns.filter((c) => !filterTactic || c.tactic === filterTactic).map(({ tactic, meta, techs }) => (
                <div key={tactic} style={{ width: 180 }}>
                  <div style={{ background: meta.color + "22", border: `1px solid ${meta.color}55`, borderRadius: "8px 8px 0 0", padding: "10px 12px", marginBottom: 4, textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{meta.icon}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: meta.color, letterSpacing: "0.1em" }}>{meta.label.toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{techs.length} techniques</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {techs.filter((t) => !searchTerm || t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((tech) => {
                        const rc = RISK_CONFIG[tech.risk] || RISK_CONFIG.medium;
                        return (
                          <div key={tech.id} className="matrix-cell" onClick={() => setSelected(tech)} style={{ borderLeft: `3px solid ${rc.color}` }}>
                            <div style={{ fontSize: 9, color: "#475569", marginBottom: 3 }}>{tech.id}</div>
                            <div style={{ fontSize: 10, color: "#cbd5e1", lineHeight: 1.3 }}>{tech.name}</div>
                            <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                              <span className="tag" style={{ background: rc.color + "33", color: rc.color }}>{rc.label}</span>
                              {tech.tactics.length > 1 && <span className="tag" style={{ background: "#f59e0b33", color: "#f59e0b" }}>×{tech.tactics.length}</span>}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "list" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {filteredTechs.map((tech) => {
                const rc = RISK_CONFIG[tech.risk] || RISK_CONFIG.medium;
                return (
                  <div key={tech.id} className="tech-card" onClick={() => setSelected(tech)} style={{ borderLeft: `3px solid ${rc.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, color: "#475569" }}>{tech.id} </span>
                        <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>{tech.name}</span>
                      </div>
                      <span className="tag" style={{ background: rc.color + "33", color: rc.color, flexShrink: 0, marginLeft: 8 }}>{rc.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6, marginBottom: 10 }}>{tech.desc.slice(0, 120)}…</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {tech.tactics.map((t) => {
                        const m = TACTIC_META[t] || { label: t, color: "#6366f1" };
                        return <span key={t} className="tag" style={{ background: m.color + "22", color: m.color }}>{m.label}</span>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <div className="panel-enter" style={{ width: 380, borderLeft: "1px solid #1e293b", background: "#0a101c", overflowY: "auto", flexShrink: 0, padding: "24px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>TECHNIQUE DETAIL</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>{selected.id}</div>
              </div>
              <button className="btn" onClick={() => setSelected(null)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", fontSize: 14 }}>✕</button>
            </div>
            <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16, color: "#f1f5f9" }}>{selected.name}</h2>
            {(() => {
              const rc = RISK_CONFIG[selected.risk] || RISK_CONFIG.medium;
              return (
                <div style={{ background: rc.color + "15", border: `1px solid ${rc.color}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: rc.color, flexShrink: 0 }} className={selected.risk === "critical" ? "pulse" : ""} />
                  <div>
                    <div style={{ fontSize: 10, color: "#475569" }}>RISK LEVEL</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: rc.color }}>{rc.label.toUpperCase()}</div>
                  </div>
                </div>
              );
            })()}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, letterSpacing: "0.1em" }}>DESCRIPTION</div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>{selected.desc}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, letterSpacing: "0.1em" }}>MAPPED TACTICS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.tactics?.map((t) => {
                  const m = TACTIC_META[t] || { label: t, color: "#6366f1", icon: "▸" };
                  return (
                    <div key={t} style={{ background: m.color + "22", border: `1px solid ${m.color}55`, borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{m.icon}</span><span style={{ fontSize: 11, color: m.color }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, letterSpacing: "0.1em" }}>MITRE ATT&CK REFERENCE</div>
              <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", textDecoration: "none" }}>
                <span style={{ fontSize: 18 }}>🔗</span>
                <div>
                  <div style={{ fontSize: 11, color: "#e2e8f0" }}>attack.mitre.org</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{selected.url}</div>
                </div>
              </a>
            </div>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: selected.enabled ? "#22c55e" : "#ef4444" }} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                Status: <strong style={{ color: selected.enabled ? "#22c55e" : "#ef4444" }}>{selected.enabled ? "ENABLED" : "DISABLED"}</strong> in this layer
              </span>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {platforms.map((p) => <span key={p} className="tag" style={{ background: "#84cc1622", color: "#84cc16" }}>🤖 {p}</span>)}
              <span className="tag" style={{ background: "#3b82f622", color: "#3b82f6" }}>{domain}</span>
            </div>
          </div>
        )}
      </div>

      {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} loadedFiles={loadedFiles} />}
      {showUpdateModal && <UpdateModal localVersion={localVersion} latestVersion={latestVersion} onClose={() => setShowUpdateModal(false)} />}
    </div>
  );
}
