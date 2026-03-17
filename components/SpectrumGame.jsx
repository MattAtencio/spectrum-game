"use client";

// ============================================================
//  SPECTRUM — Daily Ordering Puzzle Game
// ============================================================

import { useState, useEffect, useCallback } from "react";
import PUZZLES from "../data/puzzles";
import styles from "./SpectrumGame.module.css";

// ─── Utilities ────────────────────────────────────────────────
function seededRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 17), 0x45d9f3b) >>> 0;
    s ^= s >>> 15;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  const rand = seededRand(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function gradColor(colorA, colorB, t) {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${lerp(r1, r2)},${lerp(g1, g2)},${lerp(b1, b2)})`;
}

function getScoreLabel(pct) {
  if (pct === 1)    return { text: "\ud83c\udfaf Perfect!",   color: "#22c55e" };
  if (pct >= 0.75)  return { text: "\u2b50 Great!",      color: "#86efac" };
  if (pct >= 0.5)   return { text: "\ud83d\udc4d Good!",       color: "#fbbf24" };
  return              { text: "\ud83d\udcda Keep Going!", color: "#f97316" };
}

const RESULT_COLOR = { perfect: "#22c55e", close: "#fbbf24", near: "#f97316", off: "#ef4444" };
const RESULT_EMOJI = { perfect: "\u2713", close: "~", near: "\u2195", off: "\u2717" };
const RESULT_SHARE = { perfect: "\ud83d\udfe2", close: "\ud83d\udfe1", near: "\ud83d\udfe0", off: "\ud83d\udd34" };

// ─── localStorage helpers ────────────────────────────────────
function loadStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded
  }
}

// ─── Shared inline style fragments ──────────────────────────
const FONT_OUTFIT = "var(--font-outfit, 'Outfit', sans-serif)";
const FONT_SERIF = "var(--font-dm-serif, 'DM Serif Display', serif)";

// ─── Component ────────────────────────────────────────────────
export default function SpectrumGame() {
  const seed    = getDailySeed();
  const puzzle  = PUZZLES[seed % PUZZLES.length];

  const [savedState] = useState(() => {
    const saved = loadStorage("spectrum-state", null);
    if (saved && saved.seed === seed) return saved;
    return null;
  });

  const [cards,     setCards]     = useState(() => savedState ? savedState.cards : seededShuffle(puzzle.answer, seed));
  const [selected,  setSelected]  = useState(null);
  const [phase,     setPhase]     = useState(savedState ? "reveal" : "play");
  const [revealed,  setRevealed]  = useState(!!savedState);
  const [animating, setAnimating] = useState(false);
  const [xp,        setXp]        = useState(() => loadStorage("spectrum-xp", 0));
  const [streak,    setStreak]    = useState(() => {
    const data = loadStorage("spectrum-streak", { count: 0, lastDate: null });
    if (!data.lastDate) return data.count;
    const last = new Date(data.lastDate + "T00:00:00");
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
    const diffDays = Math.round((today - last) / 86400000);
    if (diffDays > 1) return 0;
    return data.count;
  });
  const [xpPop,     setXpPop]     = useState(null);

  const level      = Math.floor(xp / 200) + 1;
  const xpInLevel  = xp % 200;

  useEffect(() => { saveStorage("spectrum-xp", xp); }, [xp]);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    saveStorage("spectrum-streak", { count: streak, lastDate: today });
  }, [streak]);

  const getResult = useCallback((word, idx) => {
    const diff = Math.abs(puzzle.answer.indexOf(word) - idx);
    if (diff === 0) return "perfect";
    if (diff === 1) return "close";
    if (diff <= 3)  return "near";
    return "off";
  }, [puzzle.answer]);

  const results  = cards.map((w, i) => getResult(w, i));
  const score    = results.reduce((s, r) => s + (r === "perfect" ? 2 : r === "close" ? 1 : 0), 0);
  const maxScore = cards.length * 2;
  const pct      = score / maxScore;
  const label    = getScoreLabel(pct);

  // ── Interaction ──────────────────────────────────────────────
  const handleTap = (idx) => {
    if (phase !== "play" || animating) return;
    if (selected === null)   { setSelected(idx); return; }
    if (selected === idx)    { setSelected(null); return; }
    const next = [...cards];
    [next[selected], next[idx]] = [next[idx], next[selected]];
    setAnimating(true);
    setCards(next);
    setSelected(null);
    setTimeout(() => setAnimating(false), 200);
  };

  const handleCardKeyDown = (e, idx) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTap(idx);
    }
  };

  const submit = () => {
    const earned = Math.max(10, Math.round(pct * 80) + 10 + streak * 2);
    setPhase("reveal");
    setTimeout(() => {
      setRevealed(true);
      setXp(x  => x + earned);
      setStreak(s => s + 1);
      setXpPop(earned);
      saveStorage("spectrum-state", { seed, cards });
      setTimeout(() => setXpPop(null), 2200);
    }, 300);
  };

  const retry = () => {
    setCards(seededShuffle(puzzle.answer, seed + Date.now()));
    setSelected(null);
    setPhase("play");
    setRevealed(false);
    setXpPop(null);
    saveStorage("spectrum-state", null);
  };

  const share = () => {
    const emojiRow = results.map(r => RESULT_SHARE[r]).join("");
    const earned   = Math.max(10, Math.round(pct * 80) + 10 + streak * 2);
    const text     = `Spectrum #${seed % 365} \u2014 ${puzzle.theme} ${puzzle.emoji}\n${emojiRow}\nScore: ${score}/${maxScore}  +${earned}xp  \ud83d\udd25${streak + 1}`;
    if (navigator.share) { navigator.share({ text }); }
    else { navigator.clipboard?.writeText(text); alert("Copied to clipboard!"); }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#07070f", color:"#e8e8f0", fontFamily:FONT_SERIF, maxWidth:430, margin:"0 auto", padding:"0 16px 40px", userSelect:"none", WebkitTapHighlightColor:"transparent", position:"relative", overflowX:"hidden" }}>

      {/* Ambient background glow */}
      <div className={styles.ambientGlow} style={{ position:"fixed", top:-80, left:"50%", transform:"translateX(-50%)", width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle, ${puzzle.colorB}18 0%, transparent 70%)`, pointerEvents:"none" }} />

      {/* XP Pop Overlay */}
      {xpPop && (
        <div className={styles.xpPop} role="status" aria-live="assertive" style={{ position:"fixed", top:"50%", left:"50%", zIndex:100, textAlign:"center", pointerEvents:"none" }}>
          <div style={{ background:"linear-gradient(135deg,#1a1a3e,#2a1a5e)", border:"1px solid #4c3a9a", borderRadius:24, padding:"20px 36px", boxShadow:"0 12px 60px #7c3aed66" }}>
            <div style={{ fontFamily:FONT_OUTFIT, fontSize:52, fontWeight:800, color:"#ffd166", lineHeight:1 }}>+{xpPop}</div>
            <div style={{ fontFamily:FONT_OUTFIT, fontSize:11, color:"#a78bfa", letterSpacing:3, marginTop:4 }}>XP EARNED</div>
            {streak > 1 && <div style={{ fontFamily:FONT_OUTFIT, fontSize:12, color:"#ffd16688", marginTop:8 }}>{"\ud83d\udd25"} {streak} day streak!</div>}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ paddingTop:24, paddingBottom:12, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:32, fontWeight:400, letterSpacing:"-1px", color:"#fff", lineHeight:1, fontStyle:"italic" }}>Spectrum</div>
          <div style={{ fontFamily:FONT_OUTFIT, fontSize:10, color:"#33334a", letterSpacing:3, marginTop:4 }}>DAILY &middot; #{seed % 365}</div>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center", paddingTop:4 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:18, color:"#ffd166" }}>{"\ud83d\udd25"} {streak}</div>
            <div style={{ fontFamily:FONT_OUTFIT, fontSize:8, color:"#33334a", letterSpacing:1.5 }}>STREAK</div>
          </div>
          <div style={{ textAlign:"center", minWidth:52 }}>
            <div style={{ fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:14, color:"#a78bfa" }}>Lv {level}</div>
            <div style={{ width:52, height:4, background:"#12122a", borderRadius:2, marginTop:5, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(xpInLevel / 200) * 100}%`, background:"linear-gradient(90deg,#6d28d9,#a78bfa)", borderRadius:2, transition:"width 1s cubic-bezier(.22,1,.36,1)" }} />
            </div>
            <div style={{ fontFamily:FONT_OUTFIT, fontSize:8, color:"#33334a", marginTop:3 }}>{xpInLevel}/200 XP</div>
          </div>
        </div>
      </div>

      {/* ── Puzzle Header ── */}
      <div style={{ background:"#0d0d1e", border:"1px solid #1c1c35", borderRadius:20, padding:"14px 18px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:22 }}>{puzzle.emoji}</span>
          <span style={{ fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:18, color:"#fff" }}>{puzzle.theme}</span>
          {phase === "reveal" && revealed && (
            <span className={styles.slideIn} style={{ marginLeft:"auto", fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:14, color:label.color }}>
              {label.text}
            </span>
          )}
        </div>
        <div style={{ height:8, borderRadius:4, background:`linear-gradient(to right, ${puzzle.colorA}, ${puzzle.colorB})`, boxShadow:`0 0 20px ${puzzle.colorB}55`, marginBottom:6 }} />
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:FONT_OUTFIT, fontSize:10, color:puzzle.colorA, fontWeight:600, letterSpacing:1 }}>{puzzle.low.toUpperCase()}</span>
          <span style={{ fontFamily:FONT_OUTFIT, fontSize:10, color:puzzle.colorB, fontWeight:600, letterSpacing:1 }}>{puzzle.high.toUpperCase()}</span>
        </div>
      </div>

      {/* ── Instruction / Score Bar ── */}
      {phase === "play" && (
        <div style={{ fontFamily:FONT_OUTFIT, fontSize:12, color:"#33334a", textAlign:"center", marginBottom:12 }}>
          {selected !== null ? "Tap another card to swap \u2195" : "Tap a card to select, then tap another to swap"}
        </div>
      )}
      {phase === "reveal" && revealed && (
        <div className={styles.fadeUp} aria-live="polite" style={{ fontFamily:FONT_OUTFIT, display:"flex", justifyContent:"center", gap:20, marginBottom:12, fontSize:13, color:"#555577" }}>
          <span style={{ color:"#22c55e" }}>{"\u2713"} {results.filter(r => r === "perfect").length} perfect</span>
          <span style={{ color:"#fbbf24" }}>~ {results.filter(r => r === "close").length} close</span>
          <span style={{ color:"#ef4444" }}>{"\u2717"} {results.filter(r => r === "off" || r === "near").length} off</span>
        </div>
      )}

      {/* ── Cards ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {cards.map((word, idx) => {
          const isSelected  = selected === idx;
          const slotColor   = gradColor(puzzle.colorA, puzzle.colorB, idx / (cards.length - 1));
          const res         = phase === "reveal" && revealed ? results[idx] : null;
          const rc          = res ? RESULT_COLOR[res] : null;
          const correctIdx  = puzzle.answer.indexOf(word);

          return (
            <div
              key={word}
              className={styles.card}
              role="button"
              tabIndex={0}
              aria-label={`Position ${idx + 1}: ${word}.${isSelected ? " Selected." : ""}`}
              onClick={() => handleTap(idx)}
              onKeyDown={(e) => handleCardKeyDown(e, idx)}
              style={{
                background:   isSelected ? "#13133a" : rc ? `${rc}0d` : "#0d0d1e",
                border:       `1.5px solid ${isSelected ? "#7c3aed" : rc ? `${rc}55` : "#1c1c35"}`,
                borderRadius: 14,
                padding:      "12px 14px",
                display:      "flex",
                alignItems:   "center",
                gap:          12,
                cursor:       "pointer",
                boxShadow:    isSelected ? `0 0 0 2px #7c3aed44, 0 6px 24px #7c3aed22` : res === "perfect" ? `0 0 16px ${rc}22` : "none",
                transform:    isSelected ? "scale(1.02)" : "scale(1)",
                animation:    `fadeUp 0.25s ${idx * 0.04}s ease both`,
              }}
            >
              {/* Position badge */}
              <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:rc ? `${rc}15` : `${slotColor}12`, border:`1px solid ${rc ? `${rc}44` : `${slotColor}33`}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:12, color: rc ?? slotColor }}>
                {idx + 1}
              </div>

              {/* Word */}
              <span style={{ flex:1, fontFamily:FONT_SERIF, fontSize:17, color: rc ?? (isSelected ? "#fff" : "#c8c8e0"), fontWeight:400, letterSpacing:0.3 }}>
                {word}
              </span>

              {/* Result */}
              {res && (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {res !== "perfect" && (
                    <span style={{ fontFamily:FONT_OUTFIT, fontSize:10, color:"#33334a" }}>{"\u2192"} #{correctIdx + 1}</span>
                  )}
                  <div style={{ width:26, height:26, borderRadius:7, background:`${rc}22`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:13, color: rc }}>
                    {RESULT_EMOJI[res]}
                  </div>
                </div>
              )}

              {/* Drag handle */}
              {!res && !isSelected && (
                <div style={{ display:"flex", flexDirection:"column", gap:3, opacity:0.18 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:16, height:2, background:"#8888aa", borderRadius:1 }} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div style={{ marginTop:20 }}>
        {phase === "play" ? (
          <button onClick={submit}
            style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#3b0764,#6d28d9)", border:"none", borderRadius:16, color:"#fff", fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:14, letterSpacing:2, cursor:"pointer", boxShadow:"0 8px 32px #6d28d955" }}
          >
            LOCK IN ANSWER {"\u2192"}
          </button>
        ) : (
          <div className={styles.fadeUp} style={{ display:"flex", gap:10 }}>
            <button onClick={retry}
              style={{ flex:1, padding:"15px", background:"#0d0d1e", border:"1px solid #1c1c35", borderRadius:16, color:"#555577", fontFamily:FONT_OUTFIT, fontWeight:600, fontSize:13, cursor:"pointer" }}>
              {"\u21ba"} Retry
            </button>
            <button onClick={share}
              style={{ flex:2, padding:"15px", background:"linear-gradient(135deg,#064e3b,#059669)", border:"none", borderRadius:16, color:"#fff", fontFamily:FONT_OUTFIT, fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:"0 6px 24px #05966944" }}>
              Share Result {"\ud83d\udce4"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
