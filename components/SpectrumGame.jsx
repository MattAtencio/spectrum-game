"use client";

// ============================================================
//  SPECTRUM — Daily Ordering Puzzle Game
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
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

// ─── Font constants ──────────────────────────────────────────
const F_OUT = "var(--font-outfit, 'Outfit', sans-serif)";
const F_SER = "var(--font-dm-serif, 'DM Serif Display', serif)";

// ─── Drag threshold (px) — below this is a tap ──────────────
const DRAG_THRESHOLD = 8;

// ─── Onboarding Modal ────────────────────────────────────────
function OnboardingModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:36, fontWeight:400, fontStyle:"italic", color:"#fff", lineHeight:1 }}>Spectrum</div>
          <div style={{ fontFamily:F_OUT, fontSize:11, color:"#555577", marginTop:6 }}>Daily word ordering puzzle</div>
        </div>

        <div style={{ fontFamily:F_OUT, fontSize:13, color:"#c8c8e0", lineHeight:1.6, marginBottom:16 }}>
          Sort the 8 words from <span style={{ color:"#93c5fd" }}>low</span> to <span style={{ color:"#f97316" }}>high</span> along the gradient.
        </div>

        {/* Animated demo — card sliding into position */}
        <div style={{ background:"#07070f", borderRadius:14, padding:"12px 10px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, padding:"0 4px" }}>
            <span style={{ fontFamily:F_OUT, fontSize:8, color:"#93c5fd", fontWeight:600, letterSpacing:1 }}>COLDEST</span>
            <span style={{ fontFamily:F_OUT, fontSize:8, color:"#ef4444", fontWeight:600, letterSpacing:1 }}>HOTTEST</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <div className={styles.demoCard}>
              <div style={{ width:22, height:22, borderRadius:6, background:"#93c5fd12", border:"1px solid #93c5fd33", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F_OUT, fontWeight:700, fontSize:9, color:"#93c5fd" }}>1</div>
              <span style={{ fontFamily:F_SER, fontSize:13, color:"#c8c8e0" }}>Frost</span>
            </div>
            <div className={styles.demoCardActive}>
              <div style={{ width:22, height:22, borderRadius:6, background:"#7c3aed22", border:"1px solid #7c3aed55", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F_OUT, fontWeight:700, fontSize:9, color:"#a78bfa" }}>2</div>
              <span style={{ fontFamily:F_SER, fontSize:13, color:"#fff" }}>Warm</span>
              <div style={{ marginLeft:"auto", display:"flex", flexDirection:"column", gap:1.5, opacity:0.4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:12, height:1.5, background:"#a78bfa", borderRadius:1 }} />)}
              </div>
            </div>
            <div className={styles.demoCardShifted}>
              <div style={{ width:22, height:22, borderRadius:6, background:"#f9731612", border:"1px solid #f9731633", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F_OUT, fontWeight:700, fontSize:9, color:"#f97316" }}>3</div>
              <span style={{ fontFamily:F_SER, fontSize:13, color:"#c8c8e0" }}>Scorching</span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily:F_OUT, fontSize:12, color:"#555577", lineHeight:1.6, marginBottom:6 }}>
          <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
            <span style={{ color:"#a78bfa", fontSize:14, lineHeight:1 }}>{"\u2195"}</span>
            <span><span style={{ color:"#c8c8e0" }}>Drag</span> cards to reorder, or <span style={{ color:"#c8c8e0" }}>tap</span> two cards to swap</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
            <span style={{ color:"#22c55e", fontSize:14, lineHeight:1 }}>{"\u2713"}</span>
            <span>Closer to the correct position = more points</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <span style={{ color:"#ffd166", fontSize:14, lineHeight:1 }}>{"\ud83d\udd25"}</span>
            <span>Play daily to build your streak and earn XP</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ width:"100%", padding:"14px", marginTop:16, background:"linear-gradient(135deg,#3b0764,#6d28d9)", border:"none", borderRadius:14, color:"#fff", fontFamily:F_OUT, fontWeight:700, fontSize:13, letterSpacing:2, cursor:"pointer", boxShadow:"0 6px 24px #6d28d955" }}
        >
          PLAY
        </button>
      </div>
    </div>
  );
}

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
  const [showOnboarding, setShowOnboarding] = useState(() => !loadStorage("spectrum-onboarded", false));

  // Drag state (refs for performance — no re-renders during drag)
  const [dragState, setDragState] = useState(null); // { idx, startY, currentY }
  const cardsAreaRef = useRef(null);
  const cardRectsRef = useRef([]);

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

  // ── Measure card positions for drag calculations ───────────
  const measureCards = () => {
    if (!cardsAreaRef.current) return;
    const cardEls = cardsAreaRef.current.children;
    cardRectsRef.current = Array.from(cardEls).map(el => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, height: rect.height, mid: rect.top + rect.height / 2 };
    });
  };

  // ── Determine target index from current pointer Y ──────────
  const getTargetIdx = (pointerY) => {
    const rects = cardRectsRef.current;
    if (!rects.length) return 0;
    for (let i = 0; i < rects.length; i++) {
      if (pointerY < rects[i].mid) return i;
    }
    return rects.length - 1;
  };

  // ── Tap interaction (fallback) ─────────────────────────────
  const handleTap = (idx) => {
    if (phase !== "play") return;
    if (selected === null)   { setSelected(idx); return; }
    if (selected === idx)    { setSelected(null); return; }
    const next = [...cards];
    [next[selected], next[idx]] = [next[idx], next[selected]];
    setCards(next);
    setSelected(null);
  };

  // ── Pointer events for drag ────────────────────────────────
  const handlePointerDown = (e, idx) => {
    if (phase !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    measureCards();
    setDragState({ idx, startY: e.clientY, currentY: e.clientY, isDragging: false });
  };

  const handlePointerMove = (e) => {
    if (!dragState) return;
    const deltaY = Math.abs(e.clientY - dragState.startY);
    const isDragging = dragState.isDragging || deltaY > DRAG_THRESHOLD;
    if (isDragging && selected !== null) setSelected(null); // cancel tap-select if dragging
    setDragState(prev => ({ ...prev, currentY: e.clientY, isDragging }));
  };

  const handlePointerUp = (e) => {
    if (!dragState) return;
    if (!dragState.isDragging) {
      // It was a tap, not a drag
      handleTap(dragState.idx);
    } else {
      // Complete the drag — reorder cards
      const targetIdx = getTargetIdx(dragState.currentY);
      if (targetIdx !== dragState.idx) {
        const next = [...cards];
        const [moved] = next.splice(dragState.idx, 1);
        next.splice(targetIdx, 0, moved);
        setCards(next);
      }
    }
    setDragState(null);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTap(idx);
    }
  };

  // ── Game actions ───────────────────────────────────────────
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

  // ── Compute drag visual offsets ────────────────────────────
  const getDragTransform = (idx) => {
    if (!dragState || !dragState.isDragging) return {};
    const rects = cardRectsRef.current;
    if (!rects.length) return {};

    if (idx === dragState.idx) {
      // The card being dragged — follow the pointer
      const deltaY = dragState.currentY - dragState.startY;
      return {
        transform: `translateY(${deltaY}px) scale(1.03)`,
        zIndex: 10,
        boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
        opacity: 0.95,
        transition: "none",
      };
    }

    // Other cards — shift to make room
    const targetIdx = getTargetIdx(dragState.currentY);
    const dragIdx = dragState.idx;
    const cardHeight = rects[0] ? rects[0].height + 6 : 52; // height + gap

    let shift = 0;
    if (dragIdx < targetIdx && idx > dragIdx && idx <= targetIdx) {
      shift = -cardHeight; // shift up
    } else if (dragIdx > targetIdx && idx < dragIdx && idx >= targetIdx) {
      shift = cardHeight; // shift down
    }

    return shift !== 0 ? {
      transform: `translateY(${shift}px)`,
      transition: "transform 0.2s ease",
    } : {};
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className={styles.container} style={{ fontFamily: F_SER }}>

      {/* Onboarding modal for new users */}
      {showOnboarding && (
        <OnboardingModal onClose={() => {
          setShowOnboarding(false);
          saveStorage("spectrum-onboarded", true);
        }} />
      )}

      {/* Ambient background glow */}
      <div className={styles.ambientGlow} style={{ position:"fixed", top:-80, left:"50%", transform:"translateX(-50%)", width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle, ${puzzle.colorB}18 0%, transparent 70%)`, pointerEvents:"none" }} />

      {/* XP Pop Overlay */}
      {xpPop && (
        <div className={styles.xpPop} role="status" aria-live="assertive" style={{ position:"fixed", top:"50%", left:"50%", zIndex:100, textAlign:"center", pointerEvents:"none" }}>
          <div style={{ background:"linear-gradient(135deg,#1a1a3e,#2a1a5e)", border:"1px solid #4c3a9a", borderRadius:24, padding:"16px 32px", boxShadow:"0 12px 60px #7c3aed66" }}>
            <div style={{ fontFamily:F_OUT, fontSize:44, fontWeight:800, color:"#ffd166", lineHeight:1 }}>+{xpPop}</div>
            <div style={{ fontFamily:F_OUT, fontSize:10, color:"#a78bfa", letterSpacing:3, marginTop:4 }}>XP EARNED</div>
            {streak > 1 && <div style={{ fontFamily:F_OUT, fontSize:11, color:"#ffd16688", marginTop:6 }}>{"\ud83d\udd25"} {streak} day streak!</div>}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ paddingTop:16, paddingBottom:8, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
        <div>
          <div style={{ fontSize:28, fontWeight:400, letterSpacing:"-1px", color:"#fff", lineHeight:1, fontStyle:"italic" }}>Spectrum</div>
          <div style={{ fontFamily:F_OUT, fontSize:9, color:"#33334a", letterSpacing:3, marginTop:3 }}>DAILY &middot; #{seed % 365}</div>
        </div>
        <div style={{ display:"flex", gap:14, alignItems:"center", paddingTop:2 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:F_OUT, fontWeight:700, fontSize:16, color:"#ffd166" }}>{"\ud83d\udd25"} {streak}</div>
            <div style={{ fontFamily:F_OUT, fontSize:7, color:"#33334a", letterSpacing:1.5 }}>STREAK</div>
          </div>
          <div style={{ textAlign:"center", minWidth:48 }}>
            <div style={{ fontFamily:F_OUT, fontWeight:700, fontSize:13, color:"#a78bfa" }}>Lv {level}</div>
            <div style={{ width:48, height:3, background:"#12122a", borderRadius:2, marginTop:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(xpInLevel / 200) * 100}%`, background:"linear-gradient(90deg,#6d28d9,#a78bfa)", borderRadius:2, transition:"width 1s cubic-bezier(.22,1,.36,1)" }} />
            </div>
            <div style={{ fontFamily:F_OUT, fontSize:7, color:"#33334a", marginTop:2 }}>{xpInLevel}/200 XP</div>
          </div>
        </div>
      </div>

      {/* ── Puzzle Header ── */}
      <div style={{ background:"#0d0d1e", border:"1px solid #1c1c35", borderRadius:16, padding:"10px 14px", marginBottom:8, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <span style={{ fontSize:20 }}>{puzzle.emoji}</span>
          <span style={{ fontFamily:F_OUT, fontWeight:700, fontSize:16, color:"#fff" }}>{puzzle.theme}</span>
          {phase === "reveal" && revealed && (
            <span className={styles.slideIn} style={{ marginLeft:"auto", fontFamily:F_OUT, fontWeight:700, fontSize:13, color:label.color }}>
              {label.text}
            </span>
          )}
        </div>
        <div style={{ height:6, borderRadius:3, background:`linear-gradient(to right, ${puzzle.colorA}, ${puzzle.colorB})`, boxShadow:`0 0 16px ${puzzle.colorB}55`, marginBottom:4 }} />
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:F_OUT, fontSize:9, color:puzzle.colorA, fontWeight:600, letterSpacing:1 }}>{puzzle.low.toUpperCase()}</span>
          <span style={{ fontFamily:F_OUT, fontSize:9, color:puzzle.colorB, fontWeight:600, letterSpacing:1 }}>{puzzle.high.toUpperCase()}</span>
        </div>
      </div>

      {/* ── Instruction / Score Bar ── */}
      <div style={{ flexShrink:0, minHeight:20, marginBottom:4 }}>
        {phase === "play" && (
          <div style={{ fontFamily:F_OUT, fontSize:11, color:"#33334a", textAlign:"center" }}>
            {dragState?.isDragging ? "Drop to reorder" : selected !== null ? "Tap another card to swap \u2195" : "Drag to reorder or tap to swap"}
          </div>
        )}
        {phase === "reveal" && revealed && (
          <div className={styles.fadeUp} aria-live="polite" style={{ fontFamily:F_OUT, display:"flex", justifyContent:"center", gap:16, fontSize:12, color:"#555577" }}>
            <span style={{ color:"#22c55e" }}>{"\u2713"} {results.filter(r => r === "perfect").length} perfect</span>
            <span style={{ color:"#fbbf24" }}>~ {results.filter(r => r === "close").length} close</span>
            <span style={{ color:"#ef4444" }}>{"\u2717"} {results.filter(r => r === "off" || r === "near").length} off</span>
          </div>
        )}
      </div>

      {/* ── Cards ── */}
      <div className={styles.cardsArea} ref={cardsAreaRef}>
        {cards.map((word, idx) => {
          const isSelected  = selected === idx;
          const slotColor   = gradColor(puzzle.colorA, puzzle.colorB, idx / (cards.length - 1));
          const res         = phase === "reveal" && revealed ? results[idx] : null;
          const rc          = res ? RESULT_COLOR[res] : null;
          const correctIdx  = puzzle.answer.indexOf(word);
          const dragTransform = getDragTransform(idx);
          const isDragged   = dragState?.isDragging && dragState.idx === idx;

          return (
            <div
              key={word}
              className={styles.card}
              role="button"
              tabIndex={0}
              aria-label={`Position ${idx + 1}: ${word}.${isSelected ? " Selected." : ""}`}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                background:   isSelected ? "#13133a" : rc ? `${rc}0d` : "#0d0d1e",
                border:       `1.5px solid ${isSelected ? "#7c3aed" : rc ? `${rc}55` : "#1c1c35"}`,
                borderRadius: 12,
                padding:      "0 12px",
                display:      "flex",
                alignItems:   "center",
                gap:          10,
                cursor:       phase === "play" ? "grab" : "default",
                boxShadow:    isSelected ? `0 0 0 2px #7c3aed44, 0 4px 16px #7c3aed22` : res === "perfect" ? `0 0 12px ${rc}22` : "none",
                position:     "relative",
                ...dragTransform,
                ...(isSelected && !isDragged ? { transform: "scale(1.02)" } : {}),
              }}
            >
              {/* Position badge */}
              <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:rc ? `${rc}15` : `${slotColor}12`, border:`1px solid ${rc ? `${rc}44` : `${slotColor}33`}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F_OUT, fontWeight:700, fontSize:11, color: rc ?? slotColor }}>
                {idx + 1}
              </div>

              {/* Word */}
              <span style={{ flex:1, fontFamily:F_SER, fontSize:15, color: rc ?? (isSelected ? "#fff" : "#c8c8e0"), fontWeight:400, letterSpacing:0.3 }}>
                {word}
              </span>

              {/* Result */}
              {res && (
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {res !== "perfect" && (
                    <span style={{ fontFamily:F_OUT, fontSize:9, color:"#33334a" }}>{"\u2192"} #{correctIdx + 1}</span>
                  )}
                  <div style={{ width:24, height:24, borderRadius:6, background:`${rc}22`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F_OUT, fontWeight:700, fontSize:12, color: rc }}>
                    {RESULT_EMOJI[res]}
                  </div>
                </div>
              )}

              {/* Drag handle */}
              {!res && !isSelected && (
                <div style={{ display:"flex", flexDirection:"column", gap:2, opacity:0.18 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:14, height:2, background:"#8888aa", borderRadius:1 }} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div style={{ paddingTop:10, paddingBottom:12, flexShrink:0 }}>
        {phase === "play" ? (
          <button onClick={submit}
            style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#3b0764,#6d28d9)", border:"none", borderRadius:14, color:"#fff", fontFamily:F_OUT, fontWeight:700, fontSize:13, letterSpacing:2, cursor:"pointer", boxShadow:"0 6px 24px #6d28d955" }}
          >
            LOCK IN ANSWER {"\u2192"}
          </button>
        ) : (
          <div className={styles.fadeUp} style={{ display:"flex", gap:8 }}>
            <button onClick={retry}
              style={{ flex:1, padding:"13px", background:"#0d0d1e", border:"1px solid #1c1c35", borderRadius:14, color:"#555577", fontFamily:F_OUT, fontWeight:600, fontSize:12, cursor:"pointer" }}>
              {"\u21ba"} Retry
            </button>
            <button onClick={share}
              style={{ flex:2, padding:"13px", background:"linear-gradient(135deg,#064e3b,#059669)", border:"none", borderRadius:14, color:"#fff", fontFamily:F_OUT, fontWeight:700, fontSize:12, cursor:"pointer", boxShadow:"0 4px 16px #05966944" }}>
              Share Result {"\ud83d\udce4"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
