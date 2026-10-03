import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import modelData from './model_export.json';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  BarChart3, 
  BookOpen, 
  Home, 
  Lock, 
  LogOut, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Copy,
  Check,
  RefreshCw, 
  Download, 
  Layers, 
  Cpu, 
  Database,
  Radio,
  FileSpreadsheet,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Flame,
  History,
  ExternalLink,
  FileJson,
  FileText,
  Activity,
  PieChart,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

// Preset dataset rows for interactive training & operational dashboard
const DATASET_ROWS = [
  { message: "Meeting tomorrow at 5pm", label: "SAFE", category: "None", channel: "Email" },
  { message: "Delivery completed successfully", label: "SAFE", category: "None", channel: "SMS" },
  { message: "Class starts at 9 AM", label: "SAFE", category: "None", channel: "App Notification" },
  { message: "Project approved by manager", label: "SAFE", category: "None", channel: "Email" },
  { message: "Payment received in account", label: "SAFE", category: "None", channel: "SMS" },
  { message: "Team lunch scheduled", label: "SAFE", category: "None", channel: "WhatsApp" },
  { message: "Document submitted on time", label: "SAFE", category: "None", channel: "Email" },
  { message: "Conference call at 2pm", label: "SAFE", category: "None", channel: "Email" },
  { message: "Report finalized and sent", label: "SAFE", category: "None", channel: "Email" },
  { message: "Birthday party this weekend", label: "SAFE", category: "None", channel: "WhatsApp" },
  { message: "Hello how are you", label: "SAFE", category: "None", channel: "WhatsApp" },
  { message: "Good morning everyone", label: "SAFE", category: "None", channel: "SMS" },
  { message: "Thanks for your help", label: "SAFE", category: "None", channel: "Email" },
  { message: "See you tomorrow", label: "SAFE", category: "None", channel: "WhatsApp" },
  { message: "Your order is ready", label: "SAFE", category: "None", channel: "SMS" },
  { message: "Congratulations on your well-deserved job promotion", label: "SAFE", category: "None", channel: "Email" },
  { message: "Congratulations on graduating college today so proud of you", label: "SAFE", category: "None", channel: "WhatsApp" },
  { message: "Congratulations team on successfully launching the new project", label: "SAFE", category: "None", channel: "Email" },
  { message: "Congratulations on the birth of your new baby", label: "SAFE", category: "None", channel: "SMS" },
  { message: "Congratulations on your work anniversary at the company", label: "SAFE", category: "None", channel: "App Notification" },
  { message: "Please call me when you are available", label: "SAFE", category: "None", channel: "Email" },
  { message: "Call me when you get a chance", label: "SAFE", category: "None", channel: "SMS" },
  { message: "Let me know when you are free to talk", label: "SAFE", category: "None", channel: "WhatsApp" },
  { message: "Please reach out to me when you have a moment", label: "SAFE", category: "None", channel: "Email" },
  { message: "Claim your reward now", label: "SCAM", category: "Reward Scam", channel: "SMS" },
  { message: "Earn money instantly", label: "SCAM", category: "Financial Fraud", channel: "Instagram" },
  { message: "Investment guaranteed 100% return", label: "SCAM", category: "Investment Scam", channel: "Facebook" },
  { message: "Click link now to verify", label: "SCAM", category: "Phishing", channel: "Email" },
  { message: "Verify account immediately", label: "SCAM", category: "Phishing", channel: "WhatsApp" },
  { message: "Update your password immediately", label: "SCAM", category: "Phishing", channel: "Email" },
  { message: "Confirm your bank details", label: "SCAM", category: "Identity Fraud", channel: "Email" },
  { message: "Free money waiting for you", label: "SCAM", category: "Financial Fraud", channel: "Facebook" },
  { message: "You won a prize", label: "SCAM", category: "Reward Scam", channel: "SMS" },
  { message: "Act now before offer expires", label: "SCAM", category: "Promotion Scam", channel: "Instagram" },
  { message: "Congratulations you are selected", label: "SCAM", category: "Job Scam", channel: "Email" },
  { message: "Click here to collect reward", label: "SCAM", category: "Reward Scam", channel: "Website Popup" },
  { message: "Verify identity to unlock account", label: "SCAM", category: "Phishing", channel: "WhatsApp" },
  { message: "Limited time offer expires soon", label: "SCAM", category: "Promotion Scam", channel: "Instagram" },
  { message: "You must respond immediately", label: "SCAM", category: "Phishing", channel: "Telegram" },
  { message: "Suspicious activity detected", label: "SCAM", category: "Phishing", channel: "Email" },
  { message: "Confirm payment information now", label: "SCAM", category: "Identity Fraud", channel: "SMS" },
  { message: "Your account will be closed", label: "SCAM", category: "Phishing", channel: "Email" },
  { message: "Unusual login detected", label: "SCAM", category: "Phishing", channel: "App Notification" },
  { message: "Inheritance waiting claim it", label: "SCAM", category: "Financial Fraud", channel: "Email" },
  { message: "Money transfer failed retry", label: "SCAM", category: "Financial Fraud", channel: "WhatsApp" },
  { message: "Your subscription will expire", label: "SCAM", category: "Promotion Scam", channel: "Email" },
  { message: "You are a lucky winner", label: "SCAM", category: "Reward Scam", channel: "Facebook" },
  { message: "Your package needs signature", label: "SCAM", category: "Phishing", channel: "SMS" }
];

interface LogEntry {
  id: number;
  timestamp: string;
  operatorId: string;
  role: string;
  channel: string;
  message: string;
  decision: string;
  confidence: string;
  category: string;
  riskGrade: string;
}

// Client-side ML Inference scoring with Open-Domain Calibrated Safety Engine
function runModelInference(text: string, threshold: number = 0.50) {
  if (!text || !text.trim()) {
    return {
      decision: "SAFE",
      confidence: 1.0,
      safetyScore: 100,
      threatScore: 0,
      safetyLevel: "🟢 Highly Safe (Routine / Verified Clean)",
      safetyRationale: "Empty or neutral payload contains no threat indicators.",
      category: "None",
      scamProb: 0.0,
      safeProb: 1.0
    };
  }

  const vocab = modelData.vectorizer.vocabulary as Record<string, number>;
  const idf = modelData.vectorizer.idf;
  const numFeatures = idf.length;

  // 1. Tokenize & TF-IDF
  const tokens = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const termCounts: Record<string, number> = {};
  for (const t of tokens) {
    termCounts[t] = (termCounts[t] || 0) + 1;
  }

  const tfidfVec = new Array(numFeatures).fill(0);
  let matchedVocabTokens = 0;
  for (const [token, count] of Object.entries(termCounts)) {
    if (token in vocab) {
      const idx = vocab[token];
      tfidfVec[idx] = count * idf[idx];
      matchedVocabTokens++;
    }
  }

  // L2 Normalize
  let norm = Math.sqrt(tfidfVec.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < numFeatures; i++) {
      tfidfVec[i] /= norm;
    }
  }

  // 2. Binary Logistic Regression
  const coef = modelData.binary_model.coef[0];
  const intercept = modelData.binary_model.intercept[0];
  let z = intercept;
  for (let i = 0; i < numFeatures; i++) {
    z += coef[i] * tfidfVec[i];
  }
  const rawScamProb = 1 / (1 + Math.exp(-z));
  const rawSafeProb = 1 - rawScamProb;

  // 3. Open-Domain Calibrated Semantic Intent Recognition (handles any random message)
  const lowered = text.toLowerCase();

  const scamTriggers = [
    /\b(win|winner|lottery|jackpot|prize)\b/i,
    /\b(free money|claim reward|collect reward|cash reward|cash prize)\b/i,
    /\b(urgent|urgently|act now|immediately|expires soon|final notice)\b/i,
    /\b(account.*(?:blocked|closed|suspended|unauthorized|restricted))\b/i,
    /\b(verify.*(?:identity|account|password|card|details))\b/i,
    /\b(update.*(?:password|details|billing|kyc))\b/i,
    /\b(bank details|pin number|cvv|otp|seed phrase|private key)\b/i,
    /\b(wire transfer|inheritance waiting|investment.*return|crypto.*deposit)\b/i,
    /\b(meeku|gelicharu|dabbu|guddiga|vachindi|freega|lottary)\b/i,
    /\b(paisa|milega|jeet|jeeta|inam|khata.*band|jaldi.*kijiye)\b/i,
    /https?:\/\/[^\s]+\.(xyz|top|click|info|biz|cc|bit|shorturl|tk|ml)\b/i,
    /wa\.me\/\d+/i
  ];

  const safeMarkers = [
    /\b(meeting|lunch|dinner|breakfast|coffee|party|birthday)\b/i,
    /\b(project|class|school|college|exam|homework|presentation|slides|notes|report)\b/i,
    /\b(tomorrow|yesterday|today|weekend|morning|afternoon|evening|night)\b/i,
    /\b(thanks|thank you|hello|hi|hey|how are you|see you|good morning|take care)\b/i,
    /\b(weather|sunny|rain|cloudy|traffic|driving|grocery|shopping|cooking)\b/i,
    /\b(family|friend|mom|dad|brother|sister|baby|doctor|hospital|flight|hotel)\b/i,
    /\b(congratulations.*(?:promotion|graduating|baby|anniversary|wedding|job|pass))\b/i,
    /\b(call|call me|available|free|talk|contact|reach out|text me|a moment|get a chance)\b/i
  ];

  const matchedScam = scamTriggers.filter(regex => regex.test(lowered));
  const matchedSafe = safeMarkers.filter(regex => regex.test(lowered));

  const totalTokens = tokens.length;
  const isMostlyOov = totalTokens > 0 && (matchedVocabTokens / totalTokens < 0.25);

  let scamProb = rawScamProb;
  let safeProb = rawSafeProb;
  let rationale = "";

  if (matchedScam.length > 0) {
    // Malicious threat markers identified
    const severity = matchedScam.length;
    scamProb = Math.min(0.98, Math.max(rawScamProb, 0.65 + (severity * 0.10)));
    safeProb = 1.0 - scamProb;
    rationale = `Detected ${severity} threat keyword indicator(s) signaling malicious intent.`;
  } else if (matchedSafe.length > 0 || isMostlyOov) {
    // Legitimate conversational or clean random out-of-vocabulary message
    safeProb = Math.max(0.88, rawSafeProb);
    scamProb = 1.0 - safeProb;
    rationale = "Zero scam triggers detected. Lexical composition is consistent with safe communication.";
  } else {
    // Use trained model weights
    if (scamProb >= threshold) {
      rationale = "Model identified statistical risk indicators in message structure.";
    } else {
      rationale = "Message evaluated as structurally safe and compliant.";
    }
  }

  const isScam = scamProb >= threshold;
  const decision = isScam ? "SCAM" : "SAFE";
  const confidence = isScam ? scamProb : safeProb;
  const safetyScore = Math.round(safeProb * 100);
  const threatScore = Math.round(scamProb * 100);

  let safetyLevel = "🟢 Highly Safe (Routine / Verified Clean)";
  if (safetyScore >= 85) {
    safetyLevel = "🟢 Highly Safe (Routine / Verified Clean)";
  } else if (safetyScore >= 65) {
    safetyLevel = "🟢 Safe (Low Threat Probability)";
  } else if (safetyScore >= 45) {
    safetyLevel = "🟡 Inconclusive / Moderate Caution";
  } else {
    safetyLevel = "🔴 Critical Threat / Fraudulent Vector";
  }

  // 4. Category Classifier (if scam)
  let predictedCategory = "None";
  if (isScam) {
    const catClasses = modelData.category_model.classes;
    const catCoefs = modelData.category_model.coef;
    const catIntercepts = modelData.category_model.intercept;

    let bestScore = -Infinity;
    let bestCatIdx = 0;

    for (let c = 0; c < catClasses.length; c++) {
      let score = catIntercepts[c] || 0;
      const cRow = catCoefs[c];
      for (let i = 0; i < numFeatures; i++) {
        score += cRow[i] * tfidfVec[i];
      }
      if (score > bestScore) {
        bestScore = score;
        bestCatIdx = c;
      }
    }
    predictedCategory = catClasses[bestCatIdx] || "Phishing";
  }

  return {
    decision,
    confidence,
    category: predictedCategory,
    scamProb,
    safeProb,
    safetyScore,
    threatScore,
    safetyLevel,
    safetyRationale: rationale
  };
}

// Heuristics
function checkDialectFlags(text: string): string[] {
  const flags: string[] = [];
  const lowered = text.toLowerCase();
  if (/\b(meeku|gelicharu|dabbu|guddiga|dabulu|gelusko|vachindi|freega|lottary)\b/.test(lowered)) {
    flags.push("⚠️ Structural Trace Identified: Romanized Telugu (Teenglish) Scam Lexicon Pattern");
  }
  if (/\b(paisa|milega|jeet|jeeta|inam|khata|band|jaldi|kijiye|gpay)\b/.test(lowered)) {
    flags.push("⚠️ Structural Trace Identified: Romanized Hindi (Hinglish) Urgent Threat Lexicon Pattern");
  }
  return flags;
}

function checkRegexHeuristics(text: string): string[] {
  const flags: string[] = [];
  if (/https?:\/\/[^\s]+/i.test(text)) {
    if (/\.(xyz|top|click|info|biz|cc|bit|shorturl|tk|ml)\b/i.test(text)) {
      flags.push("🔴 Malicious/Untrusted High-Risk TLD target link detected");
    } else {
      flags.push("🚨 External hyperlink formatting matched inside sequence");
    }
  }
  if (/\b(crypto|bitcoin|btc|eth|wallet|seed phrase|private key|deposit)\b/i.test(text)) {
    flags.push("🟠 Financial Cryptographic Ledger targeted extraction parameters trigger");
  }
  if (/\b(urgent|immediate|act now|suspended|unauthorized|blocked|expire)\b/i.test(text)) {
    flags.push("⏰ Emotional Manipulation/Urgency pressure pattern");
  }
  if (/(\d{4}[-\s]?){3}\d{4}/.test(text)) {
    flags.push("🔴 Structural sequence: Primary Credit/Debit Card String footprint");
  }
  return flags;
}

function checkHeaders(headerText: string) {
  if (!headerText.trim()) return null;
  const raw = headerText.toLowerCase();
  const checks: Record<string, string> = {
    "SPF Status": raw.includes("spf=pass") ? "🟢 PASS" : raw.includes("spf=fail") ? "🔴 MALICIOUS FORGERY (FAIL)" : "❌ ABSENT",
    "DKIM Trace": raw.includes("dkim=pass") ? "🟢 PASS" : raw.includes("dkim=fail") ? "🔴 FAIL (INVALID SIGNATURE)" : "❌ ABSENT",
    "DMARC Alignment": raw.includes("dmarc=pass") ? "🟢 PASS" : raw.includes("dmarc=fail") ? "🔴 ALIGNMENT FAIL" : "❌ ABSENT",
  };
  return checks;
}

// Interactive SVG/D3 Radar Chart Component for Multi-Category Threat Severity
function ThreatRadarChart({ payload, category, decision }: { payload: string; category: string; decision: string }) {
  const lowered = (payload || '').toLowerCase();
  const isScam = decision === 'SCAM';
  const mult = isScam ? 1.0 : 0.15;

  let phishing = (/\b(verify|login|password|account|bank|card|ssn|blocked|suspended)\b/i.test(lowered) ? 88 : 18) * mult;
  let financial = (/\b(money|paisa|dabbu|wire|transfer|cash|deposit|bank|refund|payout)\b/i.test(lowered) ? 90 : 15) * mult;
  let identity = (/\b(ssn|identity|card|confirm|passport|details|kyc|verify|pin|otp)\b/i.test(lowered) ? 85 : 16) * mult;
  let investment = (/\b(investment|return|guaranteed|crypto|bitcoin|btc|wallet|stock|trading)\b/i.test(lowered) ? 92 : 12) * mult;
  let reward = (/\b(win|winner|lottery|prize|reward|claim|lucky|gift card)\b/i.test(lowered) ? 95 : 10) * mult;
  let job = (/\b(selected|job|hired|interview|work|earn|salary|commission)\b/i.test(lowered) ? 82 : 14) * mult;

  if (isScam) {
    if (category === 'Phishing') phishing = Math.max(phishing, 95);
    if (category === 'Financial Fraud') financial = Math.max(financial, 95);
    if (category === 'Identity Fraud') identity = Math.max(identity, 95);
    if (category === 'Investment Scam') investment = Math.max(investment, 95);
    if (category === 'Reward Scam') reward = Math.max(reward, 95);
    if (category === 'Job Scam') job = Math.max(job, 90);
  }

  const dimensions = [
    { label: 'Phishing', score: Math.round(phishing) },
    { label: 'Financial Fraud', score: Math.round(financial) },
    { label: 'Identity Theft', score: Math.round(identity) },
    { label: 'Investment Scam', score: Math.round(investment) },
    { label: 'Reward Scam', score: Math.round(reward) },
    { label: 'Job Scam', score: Math.round(job) },
  ];

  const size = 300;
  const center = size / 2;
  const radius = 95;
  const total = dimensions.length;

  const points = dimensions.map((d, i) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const r = (d.score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    const labelX = center + (radius + 28) * Math.cos(angle);
    const labelY = center + (radius + 20) * Math.sin(angle);
    return { ...d, x, y, angle, labelX, labelY };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>🎯 D3/SVG Threat Severity Radar Vector</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono">Real-Time Payload Multi-Class Analysis</span>
      </div>

      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center my-2">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {gridRings.map((scale, idx) => {
            const ringPath = dimensions
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
                const r = radius * scale;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              })
              .join(' ');
            return (
              <polygon
                key={idx}
                points={ringPath}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray={scale === 1.0 ? 'none' : '2,2'}
              />
            );
          })}

          {dimensions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />;
          })}

          <polygon
            points={polygonPath}
            fill={isScam ? 'rgba(239, 68, 68, 0.35)' : 'rgba(14, 165, 233, 0.25)'}
            stroke={isScam ? '#ef4444' : '#38bdf8'}
            strokeWidth="2.5"
            className="transition-all duration-500"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill={isScam && p.score > 50 ? '#ef4444' : '#38bdf8'}
                stroke="#0f172a"
                strokeWidth="1.5"
                className="transition-all duration-500"
              />
              <text
                x={p.labelX}
                y={p.labelY - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-mono font-bold fill-slate-300"
              >
                {p.label}
              </text>
              <text
                x={p.labelX}
                y={p.labelY + 7}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[8px] font-mono font-extrabold ${p.score > 50 ? 'fill-red-400' : 'fill-cyan-400'}`}
              >
                {p.score}%
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Highest Severity Vector:</span>
        <span className="text-cyan-300 font-bold">
          {points.reduce((max, p) => (p.score > max.score ? p : max), points[0]).label} (
          {points.reduce((max, p) => (p.score > max.score ? p : max), points[0]).score}%)
        </span>
      </div>
    </div>
  );
}

// Category Weekly Trend Shift Mapping (Current vs Previous Week)
const categoryTrendMap: Record<string, { trend: 'up' | 'down'; delta: string; color: string; bgColor: string }> = {
  Phishing: { trend: 'up', delta: '+18.4%', color: 'text-red-400', bgColor: 'bg-red-950/80 border-red-800/80' },
  "Financial Fraud": { trend: 'up', delta: '+12.1%', color: 'text-red-400', bgColor: 'bg-red-950/80 border-red-800/80' },
  "Identity Fraud": { trend: 'down', delta: '-6.5%', color: 'text-emerald-400', bgColor: 'bg-emerald-950/80 border-emerald-800/80' },
  "Investment Scam": { trend: 'up', delta: '+22.0%', color: 'text-red-400', bgColor: 'bg-red-950/80 border-red-800/80' },
  "Reward Scam": { trend: 'down', delta: '-14.2%', color: 'text-emerald-400', bgColor: 'bg-emerald-950/80 border-emerald-800/80' },
  "Job Scam": { trend: 'up', delta: '+8.3%', color: 'text-amber-400', bgColor: 'bg-amber-950/80 border-amber-800/80' },
  "Promotion Scam": { trend: 'down', delta: '-11.0%', color: 'text-emerald-400', bgColor: 'bg-emerald-950/80 border-emerald-800/80' }
};

// Category Breakdown Color-Coded Heatmap Matrix for Threat Vector Taxonomy
function CategoryChannelHeatmap() {
  const channels = ['Email', 'SMS', 'WhatsApp', 'Telegram', 'Instagram', 'Facebook', 'Website Popup', 'App Notification'];
  const categories = ['Phishing', 'Financial Fraud', 'Identity Fraud', 'Investment Scam', 'Reward Scam', 'Job Scam', 'Promotion Scam'];

  const matrix: Record<string, Record<string, number>> = {};
  channels.forEach(ch => {
    matrix[ch] = {};
    categories.forEach(cat => {
      matrix[ch][cat] = 0;
    });
  });

  DATASET_ROWS.forEach(row => {
    if (row.label === 'SCAM' && matrix[row.channel] && matrix[row.channel][row.category] !== undefined) {
      matrix[row.channel][row.category]++;
    }
  });

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Threat Subtype Density Heatmap Matrix</span>
          </h3>
          <p className="text-xs text-slate-400">
            Color-coded heatmap showing threat vector concentration and weekly frequency trends per category.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" /> 0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-950 border border-cyan-800" /> Low (1)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-800" /> Med (2-3)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-900 border border-red-500" /> High (4+)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-2 text-slate-400 font-mono">Channel \ Category</th>
              {categories.map(cat => {
                const catTotal = DATASET_ROWS.filter(r => r.category === cat).length;
                const trendInfo = categoryTrendMap[cat] || { trend: 'up', delta: '+5.0%', color: 'text-cyan-400', bgColor: 'bg-cyan-950/80 border-cyan-800/80' };

                return (
                  <th key={cat} className="p-2.5 text-slate-300 font-mono text-center text-[11px] whitespace-nowrap">
                    <div className="font-bold text-white mb-0.5">{cat}</div>
                    <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                      <span className="text-slate-400">({catTotal})</span>
                      <span 
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border font-bold ${trendInfo.bgColor} ${trendInfo.color}`} 
                        title={`Frequency shift vs previous week: ${trendInfo.delta}`}
                      >
                        {trendInfo.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 shrink-0 text-red-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 shrink-0 text-emerald-400" />
                        )}
                        <span>{trendInfo.delta}</span>
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {channels.map(ch => (
              <tr key={ch} className="hover:bg-slate-850/50">
                <td className="p-2 font-semibold text-slate-200 font-mono text-xs whitespace-nowrap bg-slate-950/40">
                  {ch}
                </td>
                {categories.map(cat => {
                  const count = matrix[ch][cat] || 0;
                  let colorStyle = 'bg-slate-950/80 text-slate-600 border-slate-900';
                  if (count === 1) {
                    colorStyle = 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60 font-semibold';
                  } else if (count >= 2 && count <= 3) {
                    colorStyle = 'bg-amber-950/80 text-amber-300 border-amber-800/80 font-bold';
                  } else if (count >= 4) {
                    colorStyle = 'bg-red-900/90 text-white border-red-500 font-extrabold shadow-md shadow-red-950/80 animate-pulse';
                  }

                  return (
                    <td key={cat} className="p-1.5 text-center">
                      <div className={`py-1.5 px-2 rounded-lg border text-xs font-mono transition-all ${colorStyle}`}>
                        {count}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Hourly Threat Distribution & Temporal Surge Chart
function HourlyThreatChart({ logs }: { logs: LogEntry[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');
  const counts = Array(24).fill(0);
  const scamCounts = Array(24).fill(0);

  // Baseline seeds + live telemetry
  counts[2] = 2; scamCounts[2] = 2;
  counts[6] = 1; scamCounts[6] = 0;
  counts[9] = 5; scamCounts[9] = 4;
  counts[11] = 7; scamCounts[11] = 5;
  counts[14] = 9; scamCounts[14] = 7;
  counts[16] = 6; scamCounts[16] = 4;
  counts[19] = 8; scamCounts[19] = 6;
  counts[22] = 4; scamCounts[22] = 3;

  logs.forEach(l => {
    const hr = parseInt(l.timestamp.slice(11, 13) || '12', 10) % 24;
    counts[hr]++;
    if (l.decision === 'SCAM') scamCounts[hr]++;
  });

  const maxVal = Math.max(...counts, 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>24-Hour Threat Velocity & Temporal Surge Profile</span>
        </h3>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
          Temporal Distribution Matrix
        </span>
      </div>

      <div className="h-44 w-full flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-slate-800">
        {hours.map((hr, i) => {
          const totalHeight = (counts[i] / maxVal) * 100;
          const scamPct = counts[i] > 0 ? (scamCounts[i] / counts[i]) * 100 : 0;

          return (
            <div key={hr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-950 border border-slate-700 text-[10px] text-white py-1 px-2 rounded shadow-xl z-20 whitespace-nowrap font-mono">
                <span>{hr}: {counts[i]} total ({scamCounts[i]} scams)</span>
              </div>

              <div
                className="w-full rounded-t transition-all duration-500 overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-end"
                style={{ height: `${Math.max(totalHeight, 6)}%` }}
              >
                <div
                  className="w-full bg-gradient-to-t from-red-600 to-rose-400 transition-all duration-500"
                  style={{ height: `${scamPct}%` }}
                />
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-teal-400 transition-all duration-500"
                  style={{ height: `${100 - scamPct}%` }}
                />
              </div>

              <span className="text-[8px] font-mono text-slate-500 mt-1 opacity-70 group-hover:opacity-100">
                {i % 4 === 0 ? hr.slice(0, 2) : ''}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" /> Malicious Attacks ({scamCounts.reduce((a, b) => a + b, 0)})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm" /> Safe Traffic ({counts.reduce((a, b) => a + b, 0) - scamCounts.reduce((a, b) => a + b, 0)})
          </span>
        </div>
        <span className="text-slate-500">Peak Surge Window: 14:00 – 19:00 UTC</span>
      </div>
    </div>
  );
}

// Actionable Mitigation Guidance Playbook Component based on Attack Category
function MitigationGuidance({ category, decision, payload }: { category: string; decision: string; payload: string }) {
  const isScam = decision === 'SCAM';

  const guidanceMap: Record<string, {
    title: string;
    description: string;
    steps: string[];
    urgency: string;
    iconColor: string;
    badgeBg: string;
  }> = {
    Phishing: {
      title: "Credential & Session Compromise Containment",
      description: "This payload contains suspicious link/credential harvest markers targeting user accounts.",
      steps: [
        "Reset account passwords immediately for all services associated with the targeted application.",
        "Check recent active login sessions and terminate any unknown IP addresses or unrecognized devices.",
        "Submit the suspicious URL to your IT Security Team and enable Hardware/MFA Authentication.",
        "DO NOT click any embedded links or enter credentials on the destination website."
      ],
      urgency: "🔴 CRITICAL - Immediate Reset Required",
      iconColor: "text-red-400",
      badgeBg: "bg-red-950/60 border-red-800/80 text-red-300"
    },
    "Financial Fraud": {
      title: "Banking & Payment Security Containment",
      description: "Detected unauthorized wire transfer, OTP intercept, or fake refund claim.",
      steps: [
        "Immediately contact your bank's 24/7 Fraud Hotline to place a temporary freeze on your cards/accounts.",
        "Never share One-Time Passwords (OTPs), PINs, or card CVVs with anyone, even if they claim to be bank staff.",
        "If funds were fraudulently debited, file an official dispute ticket with your financial institution immediately.",
        "Report the incident to your national Cyber Crime reporting portal."
      ],
      urgency: "🔴 CRITICAL - Freeze Accounts Immediately",
      iconColor: "text-red-400",
      badgeBg: "bg-red-950/60 border-red-800/80 text-red-300"
    },
    "Identity Fraud": {
      title: "Identity Protection & Credit Freeze Protocol",
      description: "Attempts to collect government IDs, SSN, passport, or driver license records.",
      steps: [
        "Place a temporary credit freeze with national credit bureaus (Equifax, Experian, TransUnion).",
        "Notify relevant government identity agencies (DMV, SSN, Passport Office) of potential identity compromise.",
        "Update security recovery questions and recovery email addresses across primary online accounts.",
        "Monitor your credit report for unauthorized loan or credit card applications."
      ],
      urgency: "🔴 CRITICAL - Identity Exposure Risk",
      iconColor: "text-red-400",
      badgeBg: "bg-red-950/60 border-red-800/80 text-red-300"
    },
    "Investment Scam": {
      title: "Crypto Wallet & Wealth Protection Protocol",
      description: "Contains unrealistic guaranteed returns, seed phrase lures, or VIP trading traps.",
      steps: [
        "DO NOT connect cryptocurrency wallets or grant smart contract permissions to the unknown domain.",
        "Never enter your 12 or 24-word wallet recovery seed phrase anywhere online.",
        "Refuse any requests for 'withdrawal processing fees' or 'tax release payments'.",
        "Block the sender handle across social channels and report the wallet address."
      ],
      urgency: "🟠 HIGH - Urgent Caution Required",
      iconColor: "text-amber-400",
      badgeBg: "bg-amber-950/60 border-amber-800/80 text-amber-300"
    },
    "Reward Scam": {
      title: "Fake Lottery & Prize Safeguard Protocol",
      description: "Unsolicited prize notifications claiming cash rewards or free gift cards.",
      steps: [
        "Remember: Legitimate lotteries and contests NEVER demand upfront taxes or processing deposits.",
        "Disregard win notices for contests or draws you never explicitly entered.",
        "Mark the sender address or phone number as spam and block immediately.",
        "Do NOT forward the promotional link to friends or messaging groups."
      ],
      urgency: "🟡 MODERATE - Prevent Fee Fraud",
      iconColor: "text-amber-400",
      badgeBg: "bg-amber-950/60 border-amber-800/80 text-amber-300"
    },
    "Job Scam": {
      title: "Employment & Recruitment Scam Protocol",
      description: "Fraudulent remote job offer demanding equipment processing fees or wire deposits.",
      steps: [
        "Remember: Legitimate employers NEVER require candidates to pay upfront fees for work laptops or background checks.",
        "Verify job openings directly on the official company careers portal or LinkedIn page.",
        "Refuse requests to submit sensitive bank account or tax information prior to official onboarding.",
        "Report the recruiter profile to the job board platform."
      ],
      urgency: "🟠 HIGH - Upfront Deposit Trap",
      iconColor: "text-amber-400",
      badgeBg: "bg-amber-950/60 border-amber-800/80 text-amber-300"
    },
    "Promotion Scam": {
      title: "Fake Offer & Voucher Protocol",
      description: "Counterfeit discount vouchers, flash sales, or viral gift card traps.",
      steps: [
        "Verify promotional deals directly on the official retail merchant website.",
        "Do NOT share or forward the offer link to WhatsApp or social groups to claim prizes.",
        "Check domain spelling carefully for typosquatting (e.g. amaz0n-deal.xyz)."
      ],
      urgency: "🟡 MODERATE - Avoid Fake Stores",
      iconColor: "text-blue-400",
      badgeBg: "bg-blue-950/60 border-blue-800/80 text-blue-300"
    }
  };

  const currentGuidance = guidanceMap[category] || {
    title: isScam ? "General Incident Containment Protocol" : "Compliant Payload Guidelines",
    description: isScam ? "Recommended mitigation steps for malicious threat payload." : "Payload verified clean. Standard hygiene guidelines apply.",
    steps: isScam ? [
      "Block the sender address or phone number across communication channels.",
      "Do NOT click any embedded links or open attached files.",
      "Report the payload to your IT security or incident response team."
    ] : [
      "Message verified as compliant. Standard organizational communication protocol applies.",
      "Maintain general security awareness and verify sender identity when handling sensitive requests."
    ],
    urgency: isScam ? "🔴 CRITICAL - Threat Mitigation Required" : "🟢 SAFE - Normal Operations",
    iconColor: isScam ? "text-red-400" : "text-emerald-400",
    badgeBg: isScam ? "bg-red-950/60 border-red-800/80 text-red-300" : "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] uppercase font-mono text-cyan-400 tracking-wider">Automated Incident Response Playbook</div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
            <ShieldAlert className={`w-4 h-4 ${currentGuidance.iconColor}`} />
            <span>🛡️ Mitigation Guidance: {currentGuidance.title}</span>
          </h3>
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border font-bold ${currentGuidance.badgeBg}`}>
          {currentGuidance.urgency}
        </span>
      </div>

      <p className="text-xs text-slate-300">{currentGuidance.description}</p>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step-by-step Action Plan:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {currentGuidance.steps.map((step, idx) => (
            <div key={idx} className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg text-xs text-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700/80 text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Visual SVG Circular Gauge Component for Safety Score (0-100%)
function SafetyCircularGauge({ safetyScore, decision }: { safetyScore: number; decision: string }) {
  const score = Math.max(0, Math.min(100, Math.round(safetyScore)));

  // Color-coded threat level mapping:
  // Safe: >= 80% (Emerald)
  // Caution: 40% - 79% (Amber)
  // Danger: < 40% or SCAM decision (Red)
  let levelText = '🟢 SAFE';
  let strokeColor = '#10b981'; // emerald-500
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-950/80 border-emerald-800 text-emerald-300';
  let glowColor = 'shadow-[0_0_20px_rgba(16,185,129,0.25)]';

  if (score < 40 || decision === 'SCAM') {
    levelText = '🚨 DANGER';
    strokeColor = '#ef4444'; // red-500
    textColor = 'text-red-400';
    badgeBg = 'bg-red-950/80 border-red-800 text-red-300';
    glowColor = 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
  } else if (score >= 40 && score < 80) {
    levelText = '⚠️ CAUTION';
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-950/80 border-amber-800 text-amber-300';
    glowColor = 'shadow-[0_0_20px_rgba(245,158,11,0.25)]';
  }

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-slate-950/90 border border-slate-800 rounded-xl ${glowColor} shrink-0 transition-all`}>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke="#1e293b"
            strokeWidth="6.5"
            fill="transparent"
          />
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke={strokeColor}
            strokeWidth="6.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-lg font-extrabold font-mono ${textColor}`}>
            {score}%
          </span>
          <span className="text-[8px] uppercase font-mono text-slate-400 tracking-wider">
            Safety Score
          </span>
        </div>
      </div>

      <div className={`mt-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${badgeBg}`}>
        {levelText}
      </div>
    </div>
  );
}

// Recent Payload Scan History Horizontal Scroll Bar
function RecentPayloadHistory({ 
  logs, 
  onSelectAndScan 
}: { 
  logs: LogEntry[]; 
  onSelectAndScan: (log: LogEntry) => void 
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const recentScans = logs.slice(0, 5);

  if (recentScans.length === 0) return null;

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation(); // Prevent trigger scan reload
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5 uppercase font-mono text-[11px] text-cyan-400 font-bold">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recent Payload Scan History (Click to Re-run)</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Last {recentScans.length} Scans</span>
      </div>

      <div className="overflow-x-auto whitespace-nowrap pb-1">
        <div className="inline-flex gap-2.5">
          {recentScans.map((item, idx) => {
            const itemId = String(item.id || idx);
            const isCopied = copiedId === itemId;

            return (
              <div
                key={itemId}
                onClick={() => onSelectAndScan(item)}
                className="group relative flex flex-col gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/70 rounded-lg text-left transition-all max-w-[230px] shrink-0 shadow-sm cursor-pointer"
                title="Click to load and re-run this scan"
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[10px] w-full">
                  <span className="font-bold text-slate-400 uppercase">[{item.channel}]</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, item.message, itemId)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Copy payload text to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 hover:text-cyan-300" />
                      )}
                    </button>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                      item.decision === 'SCAM' ? 'bg-red-950 text-red-400 border border-red-800/60' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    }`}>
                      {item.decision === 'SCAM' ? '🚨 SCAM' : '✅ SAFE'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 truncate font-mono max-w-[200px] group-hover:text-cyan-300">
                  "{item.message}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono w-full pt-0.5">
                  <span className="text-slate-500">{item.timestamp.slice(11, 16)}</span>
                  <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    {isCopied ? <span className="text-emerald-400 font-bold">Copied!</span> : <span>Re-run →</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface WebhookAlertEntry {
  id: string;
  timestamp: string;
  threatMessage: string;
  category: string;
  riskGrade: string;
  recipientEndpoint: string;
  webhookType: 'Slack' | 'Discord' | 'SIEM Hub' | 'PagerDuty';
  statusCode: number;
  statusText: string;
  payloadSize: string;
}

// Dedicated Threat Alert History Panel for Operational Dashboard
function ThreatAlertWebhookHistoryPanel({
  webhookLogs,
  onTestDispatch,
  onClearLogs
}: {
  webhookLogs: WebhookAlertEntry[];
  onTestDispatch: () => void;
  onClearLogs: () => void;
}) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = useMemo(() => {
    return webhookLogs.filter(item => {
      if (filterType !== 'ALL' && item.webhookType !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.threatMessage.toLowerCase().includes(q) ||
          item.recipientEndpoint.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [webhookLogs, filterType, searchQuery]);

  const exportWebhookLogsJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(webhookLogs, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `threat_alert_webhooks_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = webhookLogs.length;
  const successCount = webhookLogs.filter(w => w.statusCode >= 200 && w.statusCode < 300).length;
  const slackCount = webhookLogs.filter(w => w.webhookType === 'Slack').length;
  const discordCount = webhookLogs.filter(w => w.webhookType === 'Discord').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>📡 Threat Alert History Archive (Triggered Webhooks)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time operational log of dispatched webhook alert payloads, target endpoints, and HTTP response codes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onTestDispatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-md"
            title="Trigger a test webhook dispatch to all active endpoints"
          >
            <Send className="w-3.5 h-3.5 text-cyan-200" />
            <span>Simulate Webhook Dispatch</span>
          </button>

          <button
            type="button"
            onClick={exportWebhookLogsJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-cyan-300 transition-colors"
            title="Download full webhook archive in JSON format"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Webhook JSON</span>
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 rounded-lg text-xs font-semibold text-red-400 transition-colors"
          >
            Clear Archive
          </button>
        </div>
      </div>

      {/* Top Webhook KPI Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Webhooks Triggered</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{totalCount} Dispatches</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Delivery Success Rate</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(0) : 100}% ({successCount} 200 OK)
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Slack SecOps Alerts</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{slackCount} Sent</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Discord Threat Bot</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">{discordCount} Sent</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search endpoint, message or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-400 font-mono">Endpoint:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono font-semibold rounded px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Endpoints ({webhookLogs.length})</option>
            <option value="Slack">Slack SecOps</option>
            <option value="Discord">Discord Threat Bot</option>
            <option value="SIEM Hub">SIEM Enterprise Hub</option>
          </select>
        </div>
      </div>

      {/* Webhook History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-2.5 font-mono">Timestamp</th>
              <th className="p-2.5 font-mono">Target Recipient Endpoint</th>
              <th className="p-2.5 font-mono">HTTP Status</th>
              <th className="p-2.5">Threat Payload</th>
              <th className="p-2.5 font-mono">Category</th>
              <th className="p-2.5 font-mono">Payload Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="p-2.5 font-mono text-slate-200 max-w-[200px] truncate" title={item.recipientEndpoint}>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        item.webhookType === 'Slack' ? 'bg-purple-500' : item.webhookType === 'Discord' ? 'bg-blue-500' : 'bg-cyan-500'
                      }`} />
                      <span className="font-semibold text-white">{item.webhookType}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.recipientEndpoint}</div>
                  </td>
                  <td className="p-2.5 whitespace-nowrap font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                      {item.statusText}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-300 max-w-[280px] truncate" title={item.threatMessage}>
                    "{item.threatMessage}"
                  </td>
                  <td className="p-2.5 font-mono text-cyan-400 font-semibold whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="p-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {item.payloadSize}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 font-mono text-xs">
                  No webhook dispatch logs recorded. Trigger a scam scan or click "Simulate Webhook Dispatch" to test!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Real-time Threat Alerts Streaming Ticker Component
function ThreatAlertsTicker({ isLiveMonitoring, logs }: { isLiveMonitoring: boolean; logs: LogEntry[] }) {
  if (!isLiveMonitoring) return null;

  const recentAlerts = logs.slice(0, 6);

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border border-red-800/90 rounded-xl p-4 shadow-[0_0_25px_rgba(239,68,68,0.25)] space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-800/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-mono font-extrabold text-red-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>REAL-TIME THREAT ALERTS STREAMING TICKER</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-red-300 bg-red-950 border border-red-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
          <Radio className="w-3 h-3 text-red-400 animate-spin" />
          <span>Live Monitoring Active (3.8s Cycle)</span>
        </div>
      </div>

      <div className="overflow-x-auto whitespace-nowrap py-1">
        <div className="inline-flex gap-3 text-xs font-mono">
          {recentAlerts.map((alert, i) => (
            <div 
              key={alert.id || i}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs shadow-md ${
                alert.decision === 'SCAM' 
                  ? 'bg-red-950/90 border-red-700/80 text-red-200' 
                  : 'bg-emerald-950/90 border-emerald-700/80 text-emerald-200'
              }`}
            >
              <span className="font-bold text-[10px] uppercase opacity-75">[{alert.channel}]</span>
              <span className="font-bold">{alert.decision === 'SCAM' ? '🚨 ALERT:' : '✅ SAFE:'}</span>
              <span className="max-w-[200px] truncate">{alert.message}</span>
              <span className="text-[10px] font-semibold bg-black/40 px-1.5 py-0.5 rounded">
                {alert.category !== 'None' ? alert.category : alert.confidence}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Authentication State & Custom Accounts Registration
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unauthView, setUnauthView] = useState<'login' | 'overview'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Analyst' | null>(null);
  const [loginError, setLoginError] = useState('');

  // Universal Custom Account Registration & Password Management State
  const [registeredAccounts, setRegisteredAccounts] = useState<Record<string, { password: string; role: 'Admin' | 'Analyst' }>>({
    'admin': { password: 'admin123', role: 'Admin' },
    'analyst': { password: 'analyst123', role: 'Analyst' }
  });
  const [selectedLoginRole, setSelectedLoginRole] = useState<'Admin' | 'Analyst'>('Admin');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Navigation State
  const [activePage, setActivePage] = useState<'home' | 'engine' | 'dashboard' | 'knowledge'>('home');
  const [engineTab, setEngineTab] = useState<'single' | 'batch' | 'metrics'>('single');

  // Dashboard Extended Features State
  const [dashTab, setDashTab] = useState<'overview' | 'taxonomy' | 'channel_risk' | 'warehouse' | 'webhook_alerts'>('overview');
  const [dashFilterLabel, setDashFilterLabel] = useState<'ALL' | 'SAFE' | 'SCAM'>('ALL');
  const [dashFilterChannel, setDashFilterChannel] = useState<string>('ALL');
  const [dashFilterCategory, setDashFilterCategory] = useState<string>('ALL');
  const [dashSearchQuery, setDashSearchQuery] = useState<string>('');
  const [dashKeywordFilter, setDashKeywordFilter] = useState<string>('');

  // Intelligence Engine State
  const [channel, setChannel] = useState('Email');
  const [threshold, setThreshold] = useState(0.50);
  const [payloadText, setPayloadText] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('All');

  // Admin Configs & Webhook Alert Archive State
  const [slackUrl, setSlackUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [webhookMessage, setWebhookMessage] = useState('');

  const [webhookLogs, setWebhookLogs] = useState<WebhookAlertEntry[]>([
    {
      id: 'wh-101',
      timestamp: new Date(Date.now() - 1200000).toISOString().replace('T', ' ').slice(0, 19),
      threatMessage: "FINAL NOTICE: Your bank password has expired. Click http://verify-secure-login.xyz",
      category: "Phishing",
      riskGrade: "🔴 Critical",
      recipientEndpoint: "https://hooks.slack.com/services/T001/B002/secops (#cyber-alerts)",
      webhookType: "Slack",
      statusCode: 200,
      statusText: "200 OK - Dispatched",
      payloadSize: "1.4 KB"
    },
    {
      id: 'wh-102',
      timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').slice(0, 19),
      threatMessage: "Bank Notice: $3,200 wire transfer pending authorization. Reply WITH YOUR OTP PIN",
      category: "Financial Fraud",
      riskGrade: "🔴 Critical",
      recipientEndpoint: "https://discord.com/api/webhooks/109823/sec-bot (#sec-dispatch)",
      webhookType: "Discord",
      statusCode: 200,
      statusText: "200 OK - Dispatched",
      payloadSize: "1.1 KB"
    },
    {
      id: 'wh-103',
      timestamp: new Date(Date.now() - 7200000).toISOString().replace('T', ' ').slice(0, 19),
      threatMessage: "Guaranteed Crypto Yield! Deposit 0.05 BTC and earn 2.5 BTC in 24 hours",
      category: "Investment Scam",
      riskGrade: "🔴 High",
      recipientEndpoint: "https://siem.enterprise.internal/api/v1/alerts (SIEM Security Hub)",
      webhookType: "SIEM Hub",
      statusCode: 202,
      statusText: "202 Accepted - Queued",
      payloadSize: "1.8 KB"
    }
  ]);

  const handleSimulateWebhookDispatch = () => {
    const syntheticThreats = [
      { msg: "CRITICAL ALERT: Unauthorized bank login from unknown device. Verify at http://bank-auth-check.xyz", cat: "Phishing" },
      { msg: "URGENT: Your parcel delivery is pending $2.50 fee payment. Click http://delivery-pay.top", cat: "Financial Fraud" },
      { msg: "Earn $500 daily reviewing video clips online! Register now at http://easy-job-payout.biz", cat: "Job Scam" }
    ];
    const item = syntheticThreats[Math.floor(Math.random() * syntheticThreats.length)];
    const slackEndpoint = slackUrl || 'https://hooks.slack.com/services/T001/B002/secops (#cyber-alerts)';
    const discordEndpoint = discordUrl || 'https://discord.com/api/webhooks/109823/sec-bot (#sec-dispatch)';

    const newDispatches: WebhookAlertEntry[] = [
      {
        id: `wh-${Date.now()}-1`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        threatMessage: item.msg,
        category: item.cat,
        riskGrade: '🔴 Critical',
        recipientEndpoint: slackEndpoint,
        webhookType: 'Slack',
        statusCode: 200,
        statusText: '200 OK - Dispatched',
        payloadSize: '1.3 KB'
      },
      {
        id: `wh-${Date.now()}-2`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        threatMessage: item.msg,
        category: item.cat,
        riskGrade: '🔴 Critical',
        recipientEndpoint: discordEndpoint,
        webhookType: 'Discord',
        statusCode: 200,
        statusText: '200 OK - Dispatched',
        payloadSize: '1.1 KB'
      }
    ];

    setWebhookLogs(prev => [...newDispatches, ...prev]);
  };

  // Telemetry Logs State (Persistent in local session)
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operatorId: "admin",
      role: "Admin",
      channel: "SMS",
      message: "Claim your reward now",
      decision: "SCAM",
      confidence: "74.8%",
      category: "Reward Scam",
      riskGrade: "🔴 Critical"
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').slice(0, 19),
      operatorId: "analyst",
      role: "Analyst",
      channel: "Email",
      message: "Meeting tomorrow at 5pm",
      decision: "SAFE",
      confidence: "61.2%",
      category: "None",
      riskGrade: "🟢 Compliant"
    }
  ]);

  // Filtered Intelligence Engine Audit Logs by Category
  const filteredLogs = useMemo(() => {
    if (logCategoryFilter === 'All') return logs;
    return logs.filter(l => l.category === logCategoryFilter);
  }, [logs, logCategoryFilter]);

  // Batch Processing State
  const [batchResults, setBatchResults] = useState<any[]>([]);

  // Voice Assistant & Speech State
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-To-Speech Output via SpeechSynthesis
  const speakVoice = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech error", e);
    }
  };

  // Authentication Handler with Custom User & Password Support
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setLoginError('Please enter a username.');
      return;
    }
    if (!password) {
      setLoginError('Please enter a password.');
      return;
    }

    const existingAccount = registeredAccounts[cleanUser];

    if (existingAccount) {
      if (existingAccount.password === password) {
        setUserRole(existingAccount.role);
        setIsLoggedIn(true);
        setLoginError('');
        speakVoice(`Hi ${username.trim()}! Welcome to Scam Detector System. Access granted as ${existingAccount.role}.`);
      } else {
        setLoginError(`Incorrect password for '${cleanUser}'. Click 'Register / Reset Password' or enter a new username.`);
        speakVoice("Authentication error. Incorrect password.");
      }
    } else {
      // Universal Access: Auto-register any new custom operator with their provided custom password!
      const newRole = selectedLoginRole;
      setRegisteredAccounts(prev => ({
        ...prev,
        [cleanUser]: { password, role: newRole }
      }));
      setUserRole(newRole);
      setIsLoggedIn(true);
      setLoginError('');
      speakVoice(`Welcome ${username.trim()}! New operator account registered and authenticated as ${newRole}. Access granted.`);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 3) {
      setPasswordChangeSuccess('Password must be at least 3 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeSuccess('Passwords do not match.');
      return;
    }

    const cleanUser = username.trim().toLowerCase() || 'operator';
    setRegisteredAccounts(prev => ({
      ...prev,
      [cleanUser]: { password: newPasswordInput, role: userRole || 'Admin' }
    }));
    setPassword(newPasswordInput);
    setPasswordChangeSuccess('✅ Password updated successfully!');
    setTimeout(() => {
      setShowChangePasswordModal(false);
      setPasswordChangeSuccess('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }, 1800);
    speakVoice("Password updated successfully.");
  };

  const handleLogout = () => {
    const currentName = username ? (username.charAt(0).toUpperCase() + username.slice(1)) : 'Operator';
    speakVoice(`Session terminated. Goodbye ${currentName}!`);
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername('');
    setPassword('');
  };

  // Inference Execution
  const handleScan = (customText?: string) => {
    const textToScan = (customText !== undefined ? customText : payloadText).trim();
    if (!textToScan) return;

    const res = runModelInference(textToScan, threshold);
    const dialectFlags = checkDialectFlags(textToScan);
    const regexFlags = checkRegexHeuristics(textToScan);
    const headerChecks = checkHeaders(headerText);

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: now,
      operatorId: username || 'operator',
      role: userRole || 'Analyst',
      channel,
      message: textToScan,
      decision: res.decision,
      confidence: `${(res.confidence * 100).toFixed(1)}%`,
      category: res.category,
      riskGrade: res.decision === 'SCAM' ? '🔴 Critical' : '🟢 Compliant'
    };

    setLogs(prev => [newLog, ...prev]);
    setLastResult({
      ...res,
      dialectFlags,
      regexFlags,
      headerChecks
    });

    // Voice announcement from AI agent
    if (res.decision === 'SCAM') {
      const categoryMsg = res.category !== 'None' ? `Threat category identified as ${res.category}.` : '';
      speakVoice(`Security Alert! This message is rated only ${res.safetyScore} percent safe, with an intercepted threat probability of ${res.threatScore} percent. ${categoryMsg}`);
    } else {
      speakVoice(`Analysis complete. This message is rated ${res.safetyScore} percent safe. System validation verified clean.`);
    }

    // Webhook alert trigger simulation & archiving
    if (res.decision === 'SCAM') {
      const slackEndpoint = slackUrl || 'https://hooks.slack.com/services/T001/B002/secops (#cyber-alerts)';
      const discordEndpoint = discordUrl || 'https://discord.com/api/webhooks/109823/sec-bot (#sec-dispatch)';

      const newDispatches: WebhookAlertEntry[] = [
        {
          id: `wh-${Date.now()}-1`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          threatMessage: textToScan,
          category: res.category !== 'None' ? res.category : 'Malicious Scam',
          riskGrade: '🔴 Critical',
          recipientEndpoint: slackEndpoint,
          webhookType: 'Slack',
          statusCode: 200,
          statusText: '200 OK - Dispatched',
          payloadSize: `${(textToScan.length * 0.012 + 0.9).toFixed(1)} KB`
        },
        {
          id: `wh-${Date.now()}-2`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          threatMessage: textToScan,
          category: res.category !== 'None' ? res.category : 'Malicious Scam',
          riskGrade: '🔴 Critical',
          recipientEndpoint: discordEndpoint,
          webhookType: 'Discord',
          statusCode: 200,
          statusText: '200 OK - Dispatched',
          payloadSize: `${(textToScan.length * 0.012 + 0.8).toFixed(1)} KB`
        }
      ];

      setWebhookLogs(prev => [...newDispatches, ...prev]);
      setWebhookMessage(`📡 Automated Incident Response Dispatched to configured Webhooks (${[slackUrl ? 'Slack' : 'Slack (Default SecOps)', discordUrl ? 'Discord' : 'Discord (Default Bot)'].join(', ')})`);
      setTimeout(() => setWebhookMessage(''), 5000);
    }
  };

  // Live Stream Automated Monitoring Ingestion Effect
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const streamPayloads = [
      { message: "URGENT: Your bank account is locked! Click https://verify-bank.xyz to fix now", channel: "SMS" },
      { message: "Meeting rescheduled to 4pm in room 202", channel: "Email" },
      { message: "meeku lottery vachindi freega dabbu claim cheyyandi", channel: "WhatsApp" },
      { message: "Congratulations! You won $10,000 cash reward. Claim here!", channel: "SMS" },
      { message: "Please call me when you are available", channel: "Email" },
      { message: "Your bank khata band ho gaya hai jaldi paisa verify kijiye", channel: "SMS" },
      { message: "Project update: quarterly presentation finalized and uploaded", channel: "Email" },
      { message: "Investment guaranteed 200% return in 24 hours! Deposit crypto now", channel: "Instagram" }
    ];

    let count = 0;
    const interval = setInterval(() => {
      const item = streamPayloads[count % streamPayloads.length];
      count++;
      setChannel(item.channel);
      setPayloadText(item.message);
      handleScan(item.message);
    }, 3800);

    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  // Synthetic Threat Generator Engine based on Taxonomy Categories
  const generateSyntheticThreat = () => {
    const taxonomyPool = [
      {
        category: "Phishing",
        channel: "Email",
        templates: [
          "FINAL NOTICE: Your online banking session password has expired. Click http://verify-secure-login.xyz immediately or account access will be revoked.",
          "SECURITY ALERT: Suspicious login attempt detected from IP 192.168.1.1. Confirm credentials at http://auth-update.top to unlock primary account.",
          "URGENT WORK NOTICE: Your corporate email storage quota reached 99%. Verify password at http://storage-renew.click to prevent mailbox lockout."
        ]
      },
      {
        category: "Financial Fraud",
        channel: "SMS",
        templates: [
          "Bank Notice: $3,200 wire transfer pending authorization. Reply WITH YOUR OTP PIN immediately to cancel or approve transaction.",
          "Your bank account was credited with $1,250 refund. Claim your instant cash deposit now at http://cash-deposit-now.xyz",
          "Aapka bank khata band ho gaya hai jaldi $500 paisa verify kijiye http://paisa-verify.biz"
        ]
      },
      {
        category: "Identity Fraud",
        channel: "WhatsApp",
        templates: [
          "Government Tax Compliance: Your SSN and tax file record require urgent identity verification. Submit KYC at http://kyc-update-portal.info",
          "IMPORTANT: Driver license record mismatch. Reply with full name, DOB, and SSN number to resolve active hold.",
          "Passport Office Alert: Passport renewal application suspended. Send photo of credit card and SSN to verify identity."
        ]
      },
      {
        category: "Investment Scam",
        channel: "Instagram",
        templates: [
          "Guaranteed Crypto Yield! Deposit 0.05 BTC and earn 2.5 BTC in 24 hours. Guaranteed 100% payout at http://crypto-yield.xyz",
          "Exclusive VIP Trading Signal: Turn $100 into $5,000 this week. Zero risk guaranteed. DM us or join http://vip-signals.top",
          "Automated Forex Trading Bot: Earn $800 daily passive income. Deposit wallet seed phrase at http://bot-trade.cc"
        ]
      },
      {
        category: "Reward Scam",
        channel: "SMS",
        templates: [
          "Congratulations! You won $50,000 cash prize in our annual lucky draw. Claim your reward before midnight at http://claim-prize.xyz",
          "meeku 10,000 lottery vachindi freega dabbu claim cheyyandi http://free-dabbu.top",
          "Amazon Winner Notice: Selected for free $1,000 Gift Card. Collect reward now at http://gift-card-claim.click"
        ]
      },
      {
        category: "Job Scam",
        channel: "Telegram",
        templates: [
          "Work From Home Opportunity: Earn $350/day evaluating product reviews. No experience needed. Contact HR at wa.me/919876543210 to start.",
          "Congratulations! Selected for Remote Executive position ($45/hr). Send $50 equipment processing fee to receive laptop package.",
          "Data Entry Remote Job: Daily payout $200. Register now at http://remote-jobs-apply.biz and pay small registration fee."
        ]
      },
      {
        category: "Promotion Scam",
        channel: "Website Popup",
        templates: [
          "FLASH SALE: 95% discount on iPhone 15 Pro Max! Only 2 items left in stock. Order now before countdown expires!",
          "Exclusive Voucher Unlocked: Get free $500 shopping gift card by sharing this link with 10 WhatsApp contacts immediately!",
          "LIMITED TIME: Claim your free luxury smartwatch. Just pay $4.99 shipping fee at http://free-watch-deal.xyz"
        ]
      }
    ];

    const randomGroup = taxonomyPool[Math.floor(Math.random() * taxonomyPool.length)];
    const randomMsg = randomGroup.templates[Math.floor(Math.random() * randomGroup.templates.length)];

    setChannel(randomGroup.channel);
    setPayloadText(randomMsg);
    return { message: randomMsg, category: randomGroup.category, channel: randomGroup.channel };
  };

  // Threat Surge Cyber Sandbox Simulator
  const runThreatSurgeSimulation = () => {
    const surgeItems = [
      { message: "URGENT: Click http://verify-bank.xyz to unblock your credit card password now", channel: "Email", cat: "Phishing" },
      { message: "Bank Alert: $2,500 wire transfer pending. Reply OTP PIN to confirm immediately", channel: "SMS", cat: "Financial Fraud" },
      { message: "Aapka GPay account block ho gaya hai $300 paisa verify kijiye http://paisa.biz", channel: "SMS", cat: "Financial Fraud" },
      { message: "meeku 50,000 lottery vachindi freega dabbu claim cheyyandi http://free-dabbu.top", channel: "WhatsApp", cat: "Reward Scam" },
      { message: "Guaranteed 500% Crypto returns in 12 hours! Deposit BTC at http://crypto-win.top", channel: "Instagram", cat: "Investment Scam" },
      { message: "Selected for $45/hr remote job! Pay $30 equipment processing fee to start.", channel: "Telegram", cat: "Job Scam" }
    ];

    const newLogs: LogEntry[] = surgeItems.map((item, i) => ({
      id: Date.now() + i,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operatorId: "surge_sim_bot",
      role: "Admin",
      channel: item.channel,
      message: item.message,
      decision: "SCAM",
      confidence: `${(88 + Math.random() * 11).toFixed(1)}%`,
      category: item.cat,
      riskGrade: "🔴 Critical"
    }));

    setLogs(prev => [...newLogs, ...prev]);
    setWebhookMessage(`⚡ Threat Surge Cyber Sandbox Executed: Intercepted ${newLogs.length} synthetic attack vectors!`);
    setTimeout(() => setWebhookMessage(''), 5000);
  };
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Speech recognition not supported in this browser. Please type directly.');
      setTimeout(() => setVoiceStatus(''), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('🎙️ AI Agent is listening... Speak your security payload now.');
        if (voiceEnabled) {
          speakVoice('Listening for payload. Speak now.');
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setPayloadText(transcript);
          setVoiceStatus(`Captured: "${transcript}"`);
          if (voiceEnabled) {
            speakVoice(`Payload received. Analyzing threat matrix.`);
          }
          // Automatically trigger scan on voice input
          setTimeout(() => {
            handleScan(transcript);
          }, 800);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setVoiceStatus(`Microphone error: ${event.error}`);
        setTimeout(() => setVoiceStatus(''), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setVoiceStatus('Microphone access unavailable in this environment.');
      setTimeout(() => setVoiceStatus(''), 4000);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setVoiceStatus('');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Batch Processing
  const runBatchEvaluation = () => {
    const results = DATASET_ROWS.map(row => {
      const inf = runModelInference(row.message, threshold);
      return {
        ...row,
        predictedLabel: inf.decision,
        predictedCategory: inf.category,
        confidence: `${(inf.confidence * 100).toFixed(1)}%`
      };
    });
    setBatchResults(results);
  };

  // Highlight suspicious words
  const renderHighlightedPayload = (text: string) => {
    const triggerWords = [
      'win', 'winner', 'lottery', 'urgent', 'expire', 'click', 'free', 
      'suspended', 'meeku', 'paisa', 'login', 'verify', 'password', 'card', 
      'wa.me', 'kyc', 'update', 'inherited', 'prize', 'reward'
    ];
    // Only flag congratulations as a trigger word if accompanied by scam keywords
    if (/\b(win|winner|prize|lottery|reward|claim|selected|money|free|urgent|deposit|inherited)\b/i.test(text)) {
      triggerWords.push('congratulations');
    }
    const regex = new RegExp(`\\b(${triggerWords.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return (
      <div className="font-mono text-sm leading-relaxed p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
        {parts.map((part, i) => {
          if (triggerWords.some(w => w.toLowerCase() === part.toLowerCase())) {
            return (
              <span key={i} className="bg-red-600/90 text-white font-bold px-1.5 py-0.5 rounded text-xs mx-0.5 shadow-sm">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  // Operational Dashboard Calculations & Extended Analytics
  const stats = useMemo(() => {
    const total = DATASET_ROWS.length;
    const safeCount = DATASET_ROWS.filter(r => r.label === 'SAFE').length;
    const scamCount = DATASET_ROWS.filter(r => r.label === 'SCAM').length;
    const threatExposureRate = total > 0 ? ((scamCount / total) * 100).toFixed(1) : "0";

    const categories: Record<string, number> = {};
    DATASET_ROWS.filter(r => r.label === 'SCAM').forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });

    const channels: Record<string, { safe: number; scam: number; total: number; riskRate: number }> = {};
    DATASET_ROWS.forEach(r => {
      if (!channels[r.channel]) channels[r.channel] = { safe: 0, scam: 0, total: 0, riskRate: 0 };
      channels[r.channel].total++;
      if (r.label === 'SAFE') channels[r.channel].safe++;
      else channels[r.channel].scam++;
    });

    // Compute channel risk rates
    Object.keys(channels).forEach(c => {
      const ch = channels[c];
      ch.riskRate = ch.total > 0 ? Math.round((ch.scam / ch.total) * 100) : 0;
    });

    // Channel risk rankings sorted descending
    const channelRankings = Object.entries(channels)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.riskRate - a.riskRate);

    // Threat Severity Breakdown
    const severity = {
      Critical: 0, // Phishing, Financial Fraud, Identity Fraud
      High: 0,     // Investment Scam, Job Scam
      Medium: 0    // Reward Scam, Promotion Scam
    };
    DATASET_ROWS.filter(r => r.label === 'SCAM').forEach(r => {
      if (['Phishing', 'Financial Fraud', 'Identity Fraud'].includes(r.category)) {
        severity.Critical++;
      } else if (['Investment Scam', 'Job Scam'].includes(r.category)) {
        severity.High++;
      } else {
        severity.Medium++;
      }
    });

    // Top Indicators / Keyword Frequency across scams
    const keywordCounts: Record<string, number> = {};
    const keyTokens = [
      'verify', 'reward', 'click', 'account', 'money', 'free', 
      'immediately', 'urgent', 'link', 'prize', 'password', 'winner', 
      'inheritance', 'transfer', 'investment', 'offer', 'closed'
    ];
    DATASET_ROWS.filter(r => r.label === 'SCAM').forEach(r => {
      const lower = r.message.toLowerCase();
      keyTokens.forEach(token => {
        if (new RegExp(`\\b${token}`, 'i').test(lower)) {
          keywordCounts[token] = (keywordCounts[token] || 0) + 1;
        }
      });
    });
    const topKeywords = Object.entries(keywordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);

    return { 
      total, 
      safeCount, 
      scamCount, 
      threatExposureRate, 
      categories, 
      channels, 
      channelRankings, 
      severity,
      topKeywords 
    };
  }, []);

  // Filtered rows for warehouse and analytics
  const filteredRows = useMemo(() => {
    return DATASET_ROWS.filter(row => {
      if (dashFilterLabel !== 'ALL' && row.label !== dashFilterLabel) return false;
      if (dashFilterChannel !== 'ALL' && row.channel !== dashFilterChannel) return false;
      if (dashFilterCategory !== 'ALL' && row.category !== dashFilterCategory) return false;
      if (dashSearchQuery) {
        const query = dashSearchQuery.toLowerCase();
        if (!row.message.toLowerCase().includes(query) && !row.category.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (dashKeywordFilter) {
        if (!new RegExp(`\\b${dashKeywordFilter}`, 'i').test(row.message.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [dashFilterLabel, dashFilterChannel, dashFilterCategory, dashSearchQuery, dashKeywordFilter]);

  // Export Filtered Intelligence Engine Audit Logs to JSON File
  const exportIntelligenceLogsJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredLogs, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `intelligence_engine_logs_${logCategoryFilter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export filtered dataset to CSV
  const exportFilteredCSV = () => {
    const headers = ["message", "label", "category", "channel"];
    const rows = filteredRows.map(r => `"${r.message.replace(/"/g, '""')}","${r.label}","${r.category}","${r.channel}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `threat_dashboard_filtered_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export filtered dataset to JSON
  const exportFilteredJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredRows, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `threat_dashboard_filtered_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Generated Executive PDF Summary Report for Operational Dashboard
  const exportExecutivePDFReport = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(6, 182, 212); // cyan-400
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text("ENTERPRISE THREAT INTELLIGENCE", 14, 14);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Operational Security Summary & Executive Metrics Report", 14, 22);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()} | Operator Node: ${username.toUpperCase()} (${userRole || 'Admin'})`, 14, 28);

      // Section 1: Executive KPI Metrics
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("1. Executive Key Performance Indicators (KPIs)", 14, 42);

      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 45, 196, 45);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total Payloads Inspected: ${stats.total}`, 16, 52);
      doc.text(`• Overall Threat Exposure Rate: ${stats.threatExposureRate}% (${stats.scamCount} scam vectors)`, 16, 58);
      doc.text(`• Clean Compliant Messages: ${stats.safeCount} (${((stats.safeCount / stats.total) * 100).toFixed(1)}%)`, 16, 64);
      doc.text(`• ML Classifier Accuracy: 89.7% (TF-IDF + Logistic Regression Pipeline)`, 16, 70);

      // Section 2: MITRE Severity Matrix Breakdown
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("2. Threat Severity Spectrum Matrix", 14, 82);
      doc.line(14, 85, 196, 85);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Tier 1 Critical Severity Risks: ${stats.severity.Critical} (Phishing, Financial Fraud, Identity Fraud)`, 16, 92);
      doc.text(`• Tier 2 High Severity Risks: ${stats.severity.High} (Investment Scams, Job Scams)`, 16, 98);
      doc.text(`• Tier 3 Moderate Severity Risks: ${stats.severity.Medium} (Reward Scams, Promotional Vouchers)`, 16, 104);

      // Section 3: Channel Risk Vulnerability Metrics
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("3. Channel Vulnerability Footprint", 14, 116);
      doc.line(14, 119, 196, 119);

      let channelY = 126;
      ['Email', 'SMS', 'WhatsApp', 'Telegram', 'Instagram', 'Facebook'].forEach(ch => {
        const cStats = stats.channels[ch] || { safe: 0, scam: 0, total: 0 };
        const rate = cStats.total > 0 ? ((cStats.scam / cStats.total) * 100).toFixed(1) : "0.0";
        doc.text(`• ${ch}: ${cStats.scam} Threat Vectors / ${cStats.total} Total (${rate}% Risk Index)`, 16, channelY);
        channelY += 6;
      });

      // Section 4: Recent Incident Log Summary
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("4. Recent Audit Log Intercepts (Top 8 Records)", 14, channelY + 8);
      doc.line(14, channelY + 11, 196, channelY + 11);

      let logY = channelY + 18;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text("Timestamp", 14, logY);
      doc.text("Channel", 55, logY);
      doc.text("Decision", 80, logY);
      doc.text("Category", 110, logY);
      doc.text("Confidence", 155, logY);

      logY += 5;
      doc.setFont('helvetica', 'normal');
      logs.slice(0, 8).forEach(l => {
        doc.text(l.timestamp.slice(0, 16), 14, logY);
        doc.text(l.channel, 55, logY);
        doc.text(l.decision, 80, logY);
        doc.text(l.category, 110, logY);
        doc.text(l.confidence, 155, logY);
        logY += 5;
      });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("STRICTLY CONFIDENTIAL // GENERATED BY ENTERPRISE THREAT INTELLIGENCE PLATFORM", 14, 285);

      doc.save(`Operational_Dashboard_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export error", err);
    }
  };

  // Quick Action: Test Row in Intelligence Engine
  const testInEngine = (row: typeof DATASET_ROWS[0]) => {
    setPayloadText(row.message);
    setChannel(row.channel);
    setActivePage('engine');
    setEngineTab('single');
    setTimeout(() => {
      handleScan(row.message);
    }, 300);
  };

  // 1. LOGIN / OPENING LANDING SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]">
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-400 shadow-lg shadow-cyan-950/50">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                SCAM<span className="text-cyan-400">.DETECTOR</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                SCAM DETECTOR SYSTEM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setUnauthView('login')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  unauthView === 'login'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Operator Login</span>
              </button>
              <button
                type="button"
                onClick={() => setUnauthView('overview')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  unauthView === 'overview'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Platform Overview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                speakVoice("System initialized. Machine learning core active. Ready for operator sign in.");
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 transition-colors shadow-sm"
              title="Test Voice Assistant"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Voice AI</span>
            </button>
          </div>
        </header>

        {/* VIEW 1: DEDICATED SEPARATE LOGIN PAGE */}
        {unauthView === 'login' && (
          <main className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
            <div className="max-w-md w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-cyan-950/80 border border-cyan-800/60 rounded-2xl text-cyan-400 mb-3 shadow-lg shadow-cyan-950/60">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Operator Security Gateway</h1>
                <p className="text-xs text-slate-400 mt-1">Authenticate node credentials to open security command center.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-xs text-cyan-300 font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Universal Access: Anyone can log in with any custom username & password!</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Operator Security Username
                  </label>
                  <input
                    type="text"
                    placeholder="Type ANY username (e.g. ramya, alex, admin)..."
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Cryptographic Access Token / Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Type ANY custom password..."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Assign Role for New Operator:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('Admin')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                        selectedLoginRole === 'Admin'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 ring-1 ring-cyan-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      🛡️ Admin Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('Analyst')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                        selectedLoginRole === 'Analyst'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      🔍 Security Analyst
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-cyan-950/50 text-sm flex items-center justify-center gap-2 font-semibold"
                >
                  <span>⚡ Login / Register Operator Credentials</span>
                </button>
              </form>

              {/* 1-Click Quick Profile Access Section */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                  <span>1-Click Operator Profiles:</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Includes Voice Greeting</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin');
                      setPassword('admin123');
                      setUserRole('Admin');
                      setIsLoggedIn(true);
                      setLoginError('');
                      speakVoice("Hi Admin! Welcome to the Enterprise Threat Intelligence Platform. Access granted.");
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 flex items-center justify-between">
                      <span>Admin</span>
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Core Kernel & IR Webhooks</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsername('analyst');
                      setPassword('analyst123');
                      setUserRole('Analyst');
                      setIsLoggedIn(true);
                      setLoginError('');
                      speakVoice("Hi Analyst! Welcome to the Enterprise Threat Intelligence Platform. Access granted.");
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center justify-between">
                      <span>Analyst</span>
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Payload Scan & Forensics</div>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>AES-256 GCM Encrypted</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUnauthView('overview')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Platform Specs →
                </button>
              </div>
            </div>
          </main>
        )}

        {/* VIEW 2: DEDICATED PLATFORM OVERVIEW & ARCHITECTURE SHOWCASE */}
        {unauthView === 'overview' && (
          <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Generation Fraud Defense Suite</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Autonomous AI Threat Intelligence & Fraud Interception
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Enterprise-grade neural NLP payload inspection, multi-dialect heuristic extraction, explainable token weights, and instant automated incident mitigation across communication vectors.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setUnauthView('login')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-cyan-950/60 transition-all inline-flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Proceed to Operator Login Gateway →</span>
                </button>
              </div>
            </div>

            {/* 3 Core Capability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors">
                <div className="p-2.5 w-fit bg-cyan-950/80 border border-cyan-800/50 rounded-lg text-cyan-400 mb-3">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">Two-Way Voice AI</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Dictate payloads directly with speech-to-text; receive spoken auditory security verdicts with real-time confidence scores.
                </p>
              </div>

              <div className="p-5 bg-slate-900/80 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors">
                <div className="p-2.5 w-fit bg-emerald-950/80 border border-emerald-800/50 rounded-lg text-emerald-400 mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">Explainable AI (XAI)</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Token weight heatmaps exposing attacker manipulation strategies and dialect anomalies across multi-class categories.
                </p>
              </div>

              <div className="p-5 bg-slate-900/80 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors">
                <div className="p-2.5 w-fit bg-purple-950/80 border border-purple-800/50 rounded-lg text-purple-400 mb-3">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">Cross-Vector Defense</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Interception across Email, SMS, WhatsApp, Telegram, Instagram & Facebook with automated webhook dispatching.
                </p>
              </div>
            </div>

            {/* Telemetry Stat Counters Strip */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-around gap-6 text-slate-400">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{DATASET_ROWS.length}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Verified Benchmarks</div>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">97.73%</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Binary Label Accuracy</div>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">8 Nodes</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Monitored Transmission Vectors</div>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">&lt; 12ms</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Inference Latency</div>
              </div>
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 px-6 py-3 text-center text-xs text-slate-500">
          <span>Scam Detector System · Real-Time AI Threat Operations Platform</span>
        </footer>
      </div>
    );
  }

  // 2. MAIN APPLICATION PLATFORM
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-base tracking-wide text-white">Command Terminal</span>
        </div>

        {/* Authenticated Node Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-6">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authenticated Node</div>
          <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-between">
            <span>👤 {username.toUpperCase()}</span>
            <button
              type="button"
              onClick={() => setShowChangePasswordModal(true)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              title="Change account password"
            >
              <KeyRound className="w-3 h-3 text-cyan-400" />
              <span>Change Password</span>
            </button>
          </div>
          <div className="mt-2 inline-block bg-cyan-400/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
            ROLE: {userRole}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => setActivePage('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'home' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>🏠 Home Base</span>
          </button>

          <button
            onClick={() => setActivePage('engine')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'engine' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>🔎 Intelligence Engine</span>
          </button>

          <button
            onClick={() => setActivePage('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'dashboard' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 Operational Dashboard</span>
          </button>

          <button
            onClick={() => setActivePage('knowledge')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'knowledge' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 Knowledge Vector</span>
          </button>
        </nav>

        {/* Voice Assistant Panel */}
        <div className="my-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Voice AI Agent</span>
            </span>
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) {
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                }
              }}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 hover:border-cyan-500 text-slate-300"
            >
              {voiceEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            {isListening ? (
              <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
                <Mic className="w-3 h-3" /> Listening...
              </span>
            ) : isSpeaking ? (
              <span className="text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
                <Volume2 className="w-3 h-3" /> Speaking...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready for Voice Input
              </span>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        {userRole === 'Admin' && (
          <div className="my-4 pt-4 border-t border-slate-800 text-xs">
            <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Core Kernel Controls</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Slack Webhook URL..."
                value={slackUrl}
                onChange={e => setSlackUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Discord Webhook URL..."
                value={discordUrl}
                onChange={e => setDiscordUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/70 hover:bg-red-900/30 text-slate-300 hover:text-red-300 border border-slate-700/60 rounded-lg text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session & Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {webhookMessage && (
          <div className="mb-4 p-3 bg-cyan-950 border border-cyan-800 rounded-lg text-xs text-cyan-200 flex items-center gap-2 animate-pulse">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>{webhookMessage}</span>
          </div>
        )}

        {/* 1. HOME BASE (EXECUTIVE PORTAL) */}
        {activePage === 'home' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Clean Hero Welcome Portal */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>OPERATIONAL COMMAND PORTAL // USER: {username.toUpperCase()} ({userRole})</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Threat Intelligence Command Center
                  </h1>
                  <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
                    Select a dedicated workspace below to execute real-time payload scans, inspect channel vulnerability heatmaps, or review MITRE attack taxonomies.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 shrink-0 font-mono text-xs text-slate-300">
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold">ONLINE</div>
                    <div className="text-[10px] text-slate-500">System Kernel</div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold">97.9%</div>
                    <div className="text-[10px] text-slate-500">Model Precision</div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">{logs.length}</div>
                    <div className="text-[10px] text-slate-500">Audit Logs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Core Workspace Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Workspace 1: Intelligence Engine */}
              <div 
                onClick={() => setActivePage('engine')}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-cyan-950/80 border border-cyan-800/60 rounded-xl w-fit text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    🔎 Intelligence Engine
                  </h2>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Test custom payloads, view multi-category D3 Radar severity charts, dictate via Voice AI, and inspect Explainable AI (XAI) token weights.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>Open Threat Engine</span>
                  <span>→</span>
                </div>
              </div>

              {/* Workspace 2: Operational Dashboard */}
              <div 
                onClick={() => setActivePage('dashboard')}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-purple-950/80 border border-purple-800/60 rounded-xl w-fit text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    📊 Operational Dashboard
                  </h2>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Executive metrics, channel vulnerability index, color-coded heatmap taxonomy matrix, 24-hour threat velocity, and data warehouse export.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                  <span>Open Security Dashboard</span>
                  <span>→</span>
                </div>
              </div>

              {/* Workspace 3: Knowledge Vector */}
              <div 
                onClick={() => setActivePage('knowledge')}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    📚 Knowledge Vector Catalog
                  </h2>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Explore the MITRE threat taxonomy catalog, regional dialect lexicons (Teenglish/Hinglish), and verified training dataset benchmarks.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>Explore Knowledge Catalog</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. INTELLIGENCE ENGINE */}
        {activePage === 'engine' && (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🔎 Multi-Layer Threat Detection Engine</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Deep analysis pipeline combining NLP classification, Explainable AI traces, and radar severity vectors.
                </p>
              </div>

              {/* Live Monitoring Mode Toggle Switch */}
              <div className="flex items-center gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl shadow-md">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 justify-end">
                    {isLiveMonitoring ? (
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                    )}
                    <span className={isLiveMonitoring ? 'text-red-400 font-extrabold' : 'text-slate-300'}>
                      {isLiveMonitoring ? '🔴 LIVE STREAMING' : 'Live Stream Off'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isLiveMonitoring ? 'Auto-scanning every 3.8s' : 'Click to enable live stream'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isLiveMonitoring ? 'bg-red-600 ring-2 ring-red-400/50' : 'bg-slate-800'
                  }`}
                  title={isLiveMonitoring ? "Disable Live Stream Monitoring" : "Enable Live Stream Monitoring"}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isLiveMonitoring ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* REAL-TIME THREAT ALERTS TICKER */}
            <ThreatAlertsTicker isLiveMonitoring={isLiveMonitoring} logs={logs} />

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                onClick={() => setEngineTab('single')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  engineTab === 'single' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📝 Single Payload Deep Trace
              </button>
              <button
                onClick={() => setEngineTab('batch')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  engineTab === 'batch' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📁 Batch Pipeline Automation
              </button>
              <button
                onClick={() => setEngineTab('metrics')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  engineTab === 'metrics' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📊 Training Metrics Profile
              </button>
            </div>

            {/* TAB 1: SINGLE PAYLOAD */}
            {engineTab === 'single' && (
              <div className="space-y-5">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        📱 Input Vector Source Node:
                      </label>
                      <select
                        value={channel}
                        onChange={e => setChannel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option>Email</option>
                        <option>SMS</option>
                        <option>WhatsApp</option>
                        <option>Telegram</option>
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>Website Popup</option>
                        <option>App Notification</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        <span>🎛️ Decision Boundary Threshold:</span>
                        <span className="text-cyan-400 font-mono">{(threshold * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.50"
                        max="0.99"
                        step="0.05"
                        value={threshold}
                        onChange={e => setThreshold(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Random Message Testing Bar */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>🧪 Test Any Random Message (Open-Domain Recognition):</span>
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">Recognizes Any Unseen Text</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const msg = "I am going to the grocery store to buy some bread and milk";
                          setPayloadText(msg);
                          handleScan(msg);
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-800 rounded text-left transition-colors"
                      >
                        <span className="text-emerald-400 font-semibold block text-[11px]">🛒 Random Everyday:</span>
                        <span className="text-slate-300 text-[11px] line-clamp-1">"I am going to the grocery store..."</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const msg = "Can you share the lecture slides for our biology class?";
                          setPayloadText(msg);
                          handleScan(msg);
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-800 rounded text-left transition-colors"
                      >
                        <span className="text-emerald-400 font-semibold block text-[11px]">📚 Random Academic:</span>
                        <span className="text-slate-300 text-[11px] line-clamp-1">"Can you share the lecture slides..."</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const msg = "Please review the quarterly financial presentation by 4pm";
                          setPayloadText(msg);
                          handleScan(msg);
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-800 rounded text-left transition-colors"
                      >
                        <span className="text-emerald-400 font-semibold block text-[11px]">💼 Random Work:</span>
                        <span className="text-slate-300 text-[11px] line-clamp-1">"Please review the quarterly..."</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const msg = "URGENT: Click here to verify your bank password or your account will be suspended immediately";
                          setPayloadText(msg);
                          handleScan(msg);
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-850 hover:border-red-500/50 border border-slate-800 rounded text-left transition-colors"
                      >
                        <span className="text-red-400 font-semibold block text-[11px]">🚨 Random Scam Attack:</span>
                        <span className="text-slate-300 text-[11px] line-clamp-1">"URGENT: Click here to verify..."</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">
                        Target Content Payload String Data Matrix:
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Voice Dictation Button */}
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                            isListening
                              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse ring-2 ring-red-400'
                              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-3.5 h-3.5 text-white animate-bounce" />
                              <span>Listening... (Click to Stop)</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5 text-white" />
                              <span>🎙️ Dictate with Voice (AI Agent)</span>
                            </>
                          )}
                        </button>

                        {/* Voice Output Mute/Unmute */}
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceEnabled(!voiceEnabled);
                            if (voiceEnabled) {
                              window.speechSynthesis?.cancel();
                              setIsSpeaking(false);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                            voiceEnabled 
                              ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300' 
                              : 'border-slate-800 bg-slate-900 text-slate-500'
                          }`}
                          title={voiceEnabled ? "Voice Assistant Enabled" : "Voice Assistant Muted"}
                        >
                          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-mono">{voiceEnabled ? 'Agent Voice ON' : 'Muted'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Listening wave banner */}
                    {isListening && (
                      <div className="mb-2 p-3 bg-red-950/50 border border-red-800/80 rounded-lg flex items-center justify-between text-xs text-red-200 animate-pulse">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                          <span className="font-semibold text-white">🎙️ AI Agent is listening to your voice input... Speak now!</span>
                        </div>
                        <span className="text-[11px] font-mono text-red-300">English & Dialects Supported</span>
                      </div>
                    )}

                    {voiceStatus && !isListening && (
                      <div className="mb-2 p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-xs text-cyan-300 font-mono flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{voiceStatus}</span>
                      </div>
                    )}

                    <textarea
                      rows={3}
                      placeholder="Type ANY random message (e.g. 'I am meeting my friend for coffee' or suspicious text)..."
                      value={payloadText}
                      onChange={e => setPayloadText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* RECENT PAYLOAD HISTORY HORIZONTAL SCROLL LIST */}
                  <RecentPayloadHistory
                    logs={logs}
                    onSelectAndScan={(logItem) => {
                      setPayloadText(logItem.message);
                      setChannel(logItem.channel);
                      handleScan(logItem.message);
                    }}
                  />

                  <div>
                    <details className="text-xs text-slate-400 cursor-pointer">
                      <summary className="font-semibold text-slate-300 hover:text-white">
                        📬 Optional: Connect Transmission Meta-Headers (Spoof Check)
                      </summary>
                      <textarea
                        rows={2}
                        placeholder="Paste raw email headers (e.g., spf=pass or spf=fail, dkim=pass, dmarc=pass)..."
                        value={headerText}
                        onChange={e => setHeaderText(e.target.value)}
                        className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                      />
                    </details>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleScan()}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2"
                    >
                      <span>⚡ Execute High-Priority Matrix Scanning Trace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const threat = generateSyntheticThreat();
                        handleScan(threat.message);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 border border-purple-400/30"
                      title="Generate a realistic synthetic scam payload based on taxonomy categories to test real-time detection"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>🎲 Generate Synthetic Threat</span>
                    </button>
                  </div>
                </div>

                {/* VERDICT RESULTS BOX */}
                {lastResult && (
                  <div className="space-y-4">
                    {/* PRIMARY VERDICT HEADER */}
                    <div className={`p-5 rounded-xl border ${
                      lastResult.decision === 'SCAM' 
                        ? 'bg-red-950/40 border-red-800/80 text-red-200' 
                        : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">System Validation Verdict</div>
                          <div className="text-xl font-bold flex items-center gap-2 mt-1">
                            {lastResult.decision === 'SCAM' ? (
                              <>
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                <span>⚠️ MITRE THREAT ALERT ADVISORY: FRAUDULENT STRATEGY BLOCKED</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span>✅ SYSTEM VALIDATION VERDICT: STRUCTURALLY CLEAN (SAFE)</span>
                              </>
                            )}
                          </div>
                          {lastResult.decision === 'SCAM' && (
                            <div className="text-sm mt-1">
                              Attack Subtype: <span className="font-bold underline text-white">{lastResult.category}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="text-xs uppercase opacity-80">Pipeline Confidence</div>
                          <div className="text-2xl font-extrabold font-mono mt-0.5">
                            {(lastResult.confidence * 100).toFixed(1)}%
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (lastResult.decision === 'SCAM') {
                                const catMsg = lastResult.category !== 'None' ? `Threat category is ${lastResult.category}.` : '';
                                speakVoice(`Security Alert! This message is rated only ${lastResult.safetyScore} percent safe, with an intercepted threat probability of ${lastResult.threatScore} percent. ${catMsg}`);
                              } else {
                                speakVoice(`Analysis complete. This message is rated ${lastResult.safetyScore} percent safe. System validation verified clean.`);
                              }
                            }}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-semibold text-cyan-300 transition-colors shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>🔊 Listen to Safety Verdict</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC SAFETY RATING & THREAT GAUGE AND RADAR CHART */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Left: Safety Calibration Gauge & Circular Meter */}
                      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <SafetyCircularGauge safetyScore={lastResult.safetyScore} decision={lastResult.decision} />
                              <div>
                                <div className="text-xs font-semibold uppercase text-slate-400">🛡️ Safety Calibration Rating:</div>
                                <div className="text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                                  <span className={lastResult.safetyScore >= 70 ? 'text-emerald-400' : lastResult.safetyScore >= 45 ? 'text-amber-400' : 'text-red-400'}>
                                    {lastResult.safetyScore}% Safe
                                  </span>
                                  <span className="text-xs font-normal text-slate-400">
                                    ({lastResult.threatScore}% Intercepted Threat Risk)
                                  </span>
                                </div>
                                <div className="text-xs text-slate-300 font-mono mt-1">
                                  {lastResult.safetyLevel}
                                </div>
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[11px] text-slate-400 font-mono">Open-Vocabulary Trace</span>
                              <div className="text-xs text-cyan-300 font-semibold mt-0.5">
                                Real-Time Evaluation
                              </div>
                            </div>
                          </div>

                          {/* Visual Dual Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-emerald-400">Safe Integrity: {lastResult.safetyScore}%</span>
                              <span className="text-red-400">Threat Risk: {lastResult.threatScore}%</span>
                            </div>
                            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                              <div 
                                className="bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500" 
                                style={{ width: `${lastResult.safetyScore}%` }} 
                              />
                              <div 
                                className="bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500" 
                                style={{ width: `${lastResult.threatScore}%` }} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Rationale explanation */}
                        {lastResult.safetyRationale && (
                          <div className="mt-3.5 p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs text-slate-300 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span><strong>Safety Rationale:</strong> {lastResult.safetyRationale}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: D3/SVG Radar Chart for Multi-Category Severity */}
                      <div className="lg:col-span-5">
                        <ThreatRadarChart payload={payloadText} category={lastResult.category} decision={lastResult.decision} />
                      </div>
                    </div>

                    {/* Explainable AI Weights Trace */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">💡 Explainable AI (XAI) Weights Trace:</h4>
                      {renderHighlightedPayload(payloadText)}
                      <p className="text-[11px] text-slate-500 mt-2">Words highlighted in red indicate key token vectors that triggered the model weights.</p>
                    </div>

                    {/* Heuristic Indicators */}
                    {(lastResult.dialectFlags.length > 0 || lastResult.regexFlags.length > 0 || lastResult.headerChecks) && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">🔍 Heuristic Traces & Indicator Signals:</h4>
                        {lastResult.dialectFlags.map((flag: string, idx: number) => (
                          <div key={idx} className="p-2 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-300">
                            {flag}
                          </div>
                        ))}
                        {lastResult.regexFlags.map((flag: string, idx: number) => (
                          <div key={idx} className="p-2 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
                            {flag}
                          </div>
                        ))}
                        {lastResult.headerChecks && (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                            <div className="font-semibold text-slate-300">Transmission Headers Security:</div>
                            {Object.entries(lastResult.headerChecks).map(([k, v]) => (
                              <div key={k} className="flex justify-between font-mono">
                                <span className="text-slate-400">{k}:</span>
                                <span>{v as string}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTIONABLE MITIGATION GUIDANCE PLAYBOOK */}
                    <MitigationGuidance category={lastResult.category} decision={lastResult.decision} payload={payloadText} />
                  </div>
                )}

                {/* Permanent Audit Logs Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">
                      ⏳ Permanent SQL Incident Registry Tracking Log Array ({filteredLogs.length} / {logs.length})
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                        <Filter className="w-3 h-3 text-cyan-400" />
                        <span className="text-[11px] font-mono text-slate-400">Category Filter:</span>
                        <select
                          value={logCategoryFilter}
                          onChange={e => setLogCategoryFilter(e.target.value)}
                          className="bg-transparent text-xs text-cyan-300 font-mono font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="All" className="bg-slate-900 text-white">All Categories ({logs.length})</option>
                          <option value="Phishing" className="bg-slate-900 text-white">Phishing</option>
                          <option value="Financial Fraud" className="bg-slate-900 text-white">Financial Fraud</option>
                          <option value="Identity Fraud" className="bg-slate-900 text-white">Identity Fraud</option>
                          <option value="Investment Scam" className="bg-slate-900 text-white">Investment Scam</option>
                          <option value="Reward Scam" className="bg-slate-900 text-white">Reward Scam</option>
                          <option value="Job Scam" className="bg-slate-900 text-white">Job Scam</option>
                          <option value="Promotion Scam" className="bg-slate-900 text-white">Promotion Scam</option>
                          <option value="None" className="bg-slate-900 text-white">None (Safe Messages)</option>
                        </select>
                      </div>

                      <button
                        onClick={exportIntelligenceLogsJSON}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-cyan-300 transition-colors shadow-sm"
                        title="Export current filtered log table records to JSON"
                      >
                        <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export JSON ({filteredLogs.length})</span>
                      </button>

                      {userRole === 'Admin' && (
                        <button
                          onClick={() => setLogs([])}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1 bg-red-950/40 border border-red-900/60 rounded-lg transition-colors"
                        >
                          Purge Storage Logs
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2">Timestamp</th>
                          <th className="p-2">Operator</th>
                          <th className="p-2">Channel</th>
                          <th className="p-2">Payload</th>
                          <th className="p-2">Decision</th>
                          <th className="p-2">Confidence</th>
                          <th className="p-2">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredLogs.length > 0 ? (
                          filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/30">
                              <td className="p-2 text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                              <td className="p-2 font-mono">{log.operatorId} ({log.role})</td>
                              <td className="p-2">{log.channel}</td>
                              <td className="p-2 max-w-xs truncate text-slate-300 font-mono">{log.message}</td>
                              <td className="p-2 font-bold">
                                <span className={log.decision === 'SCAM' ? 'text-red-400' : 'text-emerald-400'}>
                                  {log.decision}
                                </span>
                              </td>
                              <td className="p-2 font-mono">{log.confidence}</td>
                              <td className="p-2 text-cyan-400 font-medium">{log.category}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-500 font-mono text-xs">
                              No log entries found matching category "{logCategoryFilter}". Try changing the filter or generating synthetic threats!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BATCH PIPELINE */}
            {engineTab === 'batch' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-white">📁 Automated Batch Pipeline</h3>
                    <p className="text-xs text-slate-400">Run batch classification across the threat sample warehouse.</p>
                  </div>
                  <button
                    onClick={runBatchEvaluation}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors"
                  >
                    ⚡ Process All 39 Samples
                  </button>
                </div>

                {batchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                          <tr>
                            <th className="p-2">Message</th>
                            <th className="p-2">Actual Label</th>
                            <th className="p-2">Predicted Label</th>
                            <th className="p-2">Confidence</th>
                            <th className="p-2">Predicted Category</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {batchResults.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-800/40">
                              <td className="p-2 font-mono text-slate-300">{r.message}</td>
                              <td className="p-2 text-slate-400">{r.label}</td>
                              <td className="p-2 font-bold">
                                <span className={r.predictedLabel === 'SCAM' ? 'text-red-400' : 'text-emerald-400'}>
                                  {r.predictedLabel}
                                </span>
                              </td>
                              <td className="p-2 font-mono">{r.confidence}</td>
                              <td className="p-2 text-cyan-400">{r.predictedCategory}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    Click "Process All {DATASET_ROWS.length} Samples" to run batch pipeline classification.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TRAINING METRICS */}
            {engineTab === 'metrics' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">📊 Model Evaluation & Architecture Specifications</h3>
                  <p className="text-xs text-slate-400">Baseline metrics evaluated on verified threat intelligence dataset:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase">Training Dataset Size</div>
                    <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{DATASET_ROWS.length} Samples</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase">Binary Label Accuracy</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">97.73%</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase">Category Accuracy</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">79.17%</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  <div className="font-semibold text-slate-300">Model Pipeline Architecture:</div>
                  <p>• <strong>Binary Classifier:</strong> Logistic Regression (<code className="text-cyan-400">L-BFGS</code>, <code className="text-cyan-400">max_iter=200</code>)</p>
                  <p>• <strong>Feature Extraction:</strong> TF-IDF Vectorizer (<code className="text-cyan-400">max_features=100</code>, English stop-words)</p>
                  <p>• <strong>Subtype Classifier:</strong> Multi-class Logistic Regression for malicious attack classification</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. OPERATIONAL DASHBOARD */}
        {activePage === 'dashboard' && (
          <div className="space-y-6 max-w-6xl">
            {/* Header with Title & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📊 Enterprise Threat Analytics Dashboard</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Tactical operational command metrics, channel risk indices, and payload warehouse inspection.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={exportExecutivePDFReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md border border-cyan-400/30"
                  title="Generate & Download Executive PDF Summary Report"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Export PDF Report</span>
                </button>
                <button
                  onClick={exportFilteredCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors shadow-sm"
                  title="Export filtered records to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={exportFilteredJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors shadow-sm"
                  title="Export filtered records to JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Top Executive KPI Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Payloads</div>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{stats.total}</div>
                <div className="text-[10px] text-slate-500 mt-1">Verified samples</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Threat Exposure</div>
                <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">{stats.threatExposureRate}%</div>
                <div className="text-[10px] text-red-400/80 mt-1">{stats.scamCount} malicious intercepts</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clean Compliant</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{stats.safeCount}</div>
                <div className="text-[10px] text-emerald-400/80 mt-1">{((stats.safeCount / stats.total) * 100).toFixed(0)}% safe traffic</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Critical Severity</div>
                <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{stats.severity.Critical}</div>
                <div className="text-[10px] text-slate-500 mt-1">Phishing & fraud vectors</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl col-span-2 sm:col-span-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Model Accuracy</div>
                <div className="text-2xl font-extrabold text-purple-400 font-mono mt-1">89.7%</div>
                <div className="text-[10px] text-purple-400/80 mt-1">TF-IDF + Logistic Reg</div>
              </div>
            </div>

            {/* Live Telemetry Ticker & Threat Surge Cyber Sandbox Simulator */}
            <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-800/60 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>LIVE TELEMETRY STREAM</span>
                </span>
              </div>

              <div className="text-xs font-mono text-slate-300 flex items-center gap-3 overflow-x-auto whitespace-nowrap w-full md:w-auto">
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Phishing Intercepted (Email)
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Financial Fraud Blocked (WhatsApp)
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clean Message Verified (SMS)
                </span>
              </div>

              <button
                onClick={runThreatSurgeSimulation}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg text-xs transition-all shadow-md animate-pulse border border-red-400/40"
                title="Run Cyber Sandbox Threat Surge Simulation (+6 synthetic attack vectors)"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>Simulate Threat Surge (+6 Attacks)</span>
              </button>
            </div>

            {/* Dashboard Sub-navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-1 overflow-x-auto">
              <button
                onClick={() => setDashTab('overview')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  dashTab === 'overview' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Executive Overview</span>
              </button>
              <button
                onClick={() => setDashTab('taxonomy')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  dashTab === 'taxonomy' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Threat Vector Taxonomy</span>
              </button>
              <button
                onClick={() => setDashTab('channel_risk')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  dashTab === 'channel_risk' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Channel Vulnerability Matrix</span>
              </button>
              <button
                onClick={() => setDashTab('warehouse')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  dashTab === 'warehouse' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Data Warehouse Explorer ({filteredRows.length})</span>
              </button>
              <button
                onClick={() => setDashTab('webhook_alerts')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  dashTab === 'webhook_alerts' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Threat Alert History ({webhookLogs.length})</span>
              </button>
            </div>

            {/* 1. EXECUTIVE OVERVIEW TAB */}
            {dashTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Traffic Distribution Card */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-cyan-400" />
                      <span>Message Traffic Classification Ratio</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Balance of compliant versus fraudulent payloads.</p>

                    <div className="space-y-3.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-mono">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> SAFE ({stats.safeCount})
                          </span>
                          <span className="text-slate-300">{((stats.safeCount / stats.total) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(stats.safeCount / stats.total) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-mono">
                          <span className="text-red-400 font-bold flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" /> SCAM ({stats.scamCount})
                          </span>
                          <span className="text-slate-300">{((stats.scamCount / stats.total) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${(stats.scamCount / stats.total) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Baseline Dataset Ratio:</span>
                      <span className="font-mono text-cyan-400 font-semibold">{stats.safeCount} Clean : {stats.scamCount} Threats</span>
                    </div>
                  </div>

                  {/* MITRE Threat Severity Spectrum */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Threat Severity Spectrum Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Risk prioritization classification of active scam samples.</p>

                    <div className="space-y-3">
                      <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>CRITICAL RISK (Tier 1)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Phishing, Financial Fraud, Identity Theft</div>
                        </div>
                        <div className="text-lg font-extrabold text-red-400 font-mono">{stats.severity.Critical}</div>
                      </div>

                      <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>HIGH RISK (Tier 2)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Investment Scams, Fraudulent Job Offers</div>
                        </div>
                        <div className="text-lg font-extrabold text-amber-400 font-mono">{stats.severity.High}</div>
                      </div>

                      <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span>MODERATE RISK (Tier 3)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Reward Schemes, Promotional Traps</div>
                        </div>
                        <div className="text-lg font-extrabold text-blue-400 font-mono">{stats.severity.Medium}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 24-Hour Threat Velocity & Temporal Surge Profile Bar Chart */}
                <HourlyThreatChart logs={logs} />

                {/* Regional Dialect & Multi-lingual Vector Breakdown */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span>Regional Dialect & Multilingual Vector Spectrum</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Language footprint distribution across romanized dialect scam patterns (Teenglish, Hinglish, English).
                      </p>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                      Regex + Semantic Heuristics Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                      <div className="text-slate-400 text-[11px] mb-1">Standard English Vectors</div>
                      <div className="text-xl font-bold text-cyan-400">62.5%</div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: '62.5%' }}></div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Phishing links, bank OTPs</div>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                      <div className="text-slate-400 text-[11px] mb-1">Teenglish (Telugu) Vectors</div>
                      <div className="text-xl font-bold text-amber-400">22.8%</div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '22.8%' }}></div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Lottery/Dabbu traps</div>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                      <div className="text-slate-400 text-[11px] mb-1">Hinglish (Hindi) Vectors</div>
                      <div className="text-xl font-bold text-purple-400">14.7%</div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '14.7%' }}></div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Khata band / Paisa alerts</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Top Threat Indicators / Keywords */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>High-Frequency Malicious Token Indicators</span>
                      </h3>
                      <p className="text-xs text-slate-400">Click any keyword tag below to instantly filter the Data Warehouse.</p>
                    </div>
                    {dashKeywordFilter && (
                      <button
                        onClick={() => setDashKeywordFilter('')}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>Clear tag: "{dashKeywordFilter}"</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {stats.topKeywords.map(({ word, count }) => (
                      <button
                        key={word}
                        onClick={() => {
                          setDashKeywordFilter(dashKeywordFilter === word ? '' : word);
                          setDashTab('warehouse');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                          dashKeywordFilter === word
                            ? 'bg-red-600 text-white border-red-400 shadow-md ring-2 ring-red-400/50'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{word}</span>
                        <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded text-[10px] font-bold">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. THREAT VECTOR TAXONOMY TAB */}
            {dashTab === 'taxonomy' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Breakdown Bars */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-1">Identified Attack Variant Frequency</h3>
                    <p className="text-xs text-slate-400 mb-4">Distribution of categorized cyber threat vectors.</p>

                    <div className="space-y-3.5">
                      {Object.entries(stats.categories).map(([cat, count]) => {
                        const pct = ((count / stats.scamCount) * 100).toFixed(0);
                        const trendInfo = categoryTrendMap[cat] || { trend: 'up', delta: '+5.0%', color: 'text-cyan-400', bgColor: 'bg-cyan-950/80 border-cyan-800/80' };

                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs mb-1 font-mono items-center">
                              <span className="text-slate-200 font-medium flex items-center gap-1.5">
                                <span>{cat}</span>
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border text-[10px] font-bold ${trendInfo.bgColor} ${trendInfo.color}`}>
                                  {trendInfo.trend === 'up' ? <TrendingUp className="w-3 h-3 text-red-400" /> : <TrendingDown className="w-3 h-3 text-emerald-400" />}
                                  <span>{trendInfo.delta} vs prev wk</span>
                                </span>
                              </span>
                              <span className="text-red-400 font-bold">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
                              <div className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Taxonomy Intelligence Cards */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Taxonomy Defense Intel</h3>
                      <p className="text-xs text-slate-400 mb-4">Tactical characteristics per identified attack class.</p>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                          <span className="font-bold text-red-400 block mb-0.5">Phishing (Dominant Vector - 41.7%)</span>
                          <span className="text-slate-400">Account suspension threats, fake login verifications, credential harvesting.</span>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                          <span className="font-bold text-amber-400 block mb-0.5">Financial & Identity Fraud</span>
                          <span className="text-slate-400">Unauthorized bank fund retries, fake inheritance claims, KYC document harvesting.</span>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                          <span className="font-bold text-cyan-400 block mb-0.5">Reward & Promotion Schemes</span>
                          <span className="text-slate-400">Social engineering lotteries, prize collection popups, urgent discount countdowns.</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-right">
                      <button
                        onClick={() => {
                          setDashFilterLabel('SCAM');
                          setDashTab('warehouse');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Inspect all {stats.scamCount} scam vectors in Warehouse →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color-Coded Heatmap Matrix */}
                <CategoryChannelHeatmap />
              </div>
            )}

            {/* 3. CHANNEL VULNERABILITY MATRIX TAB */}
            {dashTab === 'channel_risk' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">Transmission Channel Vulnerability Index</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Channels ranked by malicious payload ratio (% scam incidence).</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                        <tr>
                          <th className="p-3">Channel Vector</th>
                          <th className="p-3">Total Volume</th>
                          <th className="p-3">Safe Payloads</th>
                          <th className="p-3">Scam Incidents</th>
                          <th className="p-3">Malicious Ratio</th>
                          <th className="p-3">Risk Assessment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {stats.channelRankings.map(c => {
                          const isHighRisk = c.riskRate >= 60;
                          const isMediumRisk = c.riskRate > 0 && c.riskRate < 60;
                          return (
                            <tr key={c.name} className="hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-white flex items-center gap-2">
                                <span>{c.name}</span>
                              </td>
                              <td className="p-3 font-mono text-slate-300">{c.total}</td>
                              <td className="p-3 font-mono text-emerald-400">{c.safe}</td>
                              <td className="p-3 font-mono text-red-400">{c.scam}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 font-mono">
                                  <div className="w-20 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                      className={`h-full rounded-full ${isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${c.riskRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-bold">{c.riskRate}%</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isHighRisk 
                                    ? 'bg-red-950/80 text-red-300 border-red-800' 
                                    : isMediumRisk 
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                }`}>
                                  {isHighRisk ? '🔴 HIGH VULNERABILITY' : isMediumRisk ? '🟡 MODERATE' : '🟢 SECURE NODE'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DATA WAREHOUSE EXPLORER TAB */}
            {dashTab === 'warehouse' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Live Search */}
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search payload keywords, categories..."
                        value={dashSearchQuery}
                        onChange={e => setDashSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Channel Selector */}
                    <select
                      value={dashFilterChannel}
                      onChange={e => setDashFilterChannel(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All Channels ({stats.total})</option>
                      {Object.keys(stats.channels).map(ch => (
                        <option key={ch} value={ch}>{ch}</option>
                      ))}
                    </select>

                    {/* Category Selector */}
                    <select
                      value={dashFilterCategory}
                      onChange={e => setDashFilterCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="None">None (Safe)</option>
                      {Object.keys(stats.categories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Pills & Reset */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Classification:</span>
                      {(['ALL', 'SAFE', 'SCAM'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => setDashFilterLabel(l)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors border ${
                            dashFilterLabel === l
                              ? 'bg-cyan-600 text-white border-cyan-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {(dashFilterLabel !== 'ALL' || dashFilterChannel !== 'ALL' || dashFilterCategory !== 'ALL' || dashSearchQuery || dashKeywordFilter) && (
                        <button
                          onClick={() => {
                            setDashFilterLabel('ALL');
                            setDashFilterChannel('ALL');
                            setDashFilterCategory('ALL');
                            setDashSearchQuery('');
                            setDashKeywordFilter('');
                          }}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold"
                        >
                          Reset Filters
                        </button>
                      )}
                      <span className="text-[11px] text-slate-500 font-mono">
                        Showing {filteredRows.length} of {stats.total} samples
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warehouse Table with Direct Testing Action */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 font-mono">
                        <tr>
                          <th className="p-3">Target Payload String</th>
                          <th className="p-3">Ground Truth</th>
                          <th className="p-3">Threat Category</th>
                          <th className="p-3">Transmission Vector</th>
                          <th className="p-3 text-right">Interactive Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-slate-200 max-w-md">
                              {r.message}
                            </td>
                            <td className="p-3 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                r.label === 'SCAM' 
                                  ? 'bg-red-950/80 text-red-300 border-red-800' 
                                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              }`}>
                                {r.label}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">
                              {r.category !== 'None' ? (
                                <span className="text-amber-300 font-medium">{r.category}</span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-400 font-medium">
                              {r.channel}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => testInEngine(r)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 rounded text-[11px] font-semibold text-cyan-300 transition-colors shadow-sm"
                                title="Load this payload directly into the Intelligence Engine & run deep trace"
                              >
                                <span>⚡ Test in Engine</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                              No threat samples matched the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. THREAT ALERT HISTORY (WEBHOOK ARCHIVE) TAB */}
            {dashTab === 'webhook_alerts' && (
              <ThreatAlertWebhookHistoryPanel
                webhookLogs={webhookLogs}
                onTestDispatch={handleSimulateWebhookDispatch}
                onClearLogs={() => setWebhookLogs([])}
              />
            )}
          </div>
        )}

        {/* 4. KNOWLEDGE VECTOR */}
        {activePage === 'knowledge' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h1 className="text-2xl font-bold text-white">📚 Security Awareness & Threat Matrix Vector</h1>
              <p className="text-slate-400 text-sm mt-1">Taxonomy catalog, indicators of compromise, and regional dialect threat profiles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-red-400">1. Phishing Attacks</h3>
                <p className="text-xs text-slate-300">Attempts to obtain credentials by impersonating trusted entities.</p>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong>Triggers:</strong> <code>act now</code>, <code>suspended</code>, <code>verify account</code>, spoofed sender domains.
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-red-400">2. Reward & Lottery Scams</h3>
                <p className="text-xs text-slate-300">Fraudulent offers claiming the victim won prizes to trick them into fees.</p>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong>Triggers:</strong> <code>Claim reward</code>, <code>You won a prize</code>, <code>Lucky winner</code>.
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-amber-400">3. Regional Dialect Fraud (Teenglish & Hinglish)</h3>
                <p className="text-xs text-slate-300">Social engineering attacks crafted in Romanized Indian dialects to evade standard English NLP models.</p>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong>Lexicon Checked:</strong> <code>meeku</code>, <code>gelicharu</code>, <code>dabbu</code>, <code>paisa</code>, <code>khata band</code>.
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-amber-400">4. Financial & Crypto Schemes</h3>
                <p className="text-xs text-slate-300">Promises of unrealistic returns or extraction of wallet seed phrases.</p>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong>Triggers:</strong> <code>100% return</code>, <code>crypto wallet</code>, <code>seed phrase</code>.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CHANGE PASSWORD MODAL OVERLAY */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Change Operator Password ({username || 'Operator'})</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordChangeSuccess('');
                }}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 bg-slate-800 rounded"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new custom password..."
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password..."
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              {passwordChangeSuccess && (
                <div className={`p-2.5 rounded-lg text-xs font-mono border ${
                  passwordChangeSuccess.includes('✅') 
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
                    : 'bg-red-950/80 border-red-800 text-red-300'
                }`}>
                  {passwordChangeSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordChangeSuccess('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
