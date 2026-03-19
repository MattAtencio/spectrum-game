"use client";

import Link from "next/link";

const F_OUT = "var(--font-outfit, 'Outfit', sans-serif)";
const F_SER = "var(--font-dm-serif, 'DM Serif Display', serif)";

export default function HelpPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#07070f",
        color: "#e8e8f0",
        maxWidth: 430,
        margin: "0 auto",
        padding: "0 16px",
        fontFamily: F_SER,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              letterSpacing: "-1px",
              color: "#fff",
              lineHeight: 1,
              fontStyle: "italic",
            }}
          >
            Spectrum
          </div>
          <div
            style={{
              fontFamily: F_OUT,
              fontSize: 9,
              color: "#33334a",
              letterSpacing: 3,
              marginTop: 3,
            }}
          >
            HOW TO PLAY
          </div>
        </div>
        <Link
          href="/"
          style={{
            fontFamily: F_OUT,
            fontSize: 12,
            fontWeight: 600,
            color: "#a78bfa",
            textDecoration: "none",
            padding: "8px 16px",
            border: "1px solid #1c1c35",
            borderRadius: 10,
            background: "#0d0d1e",
          }}
        >
          {"\u2190"} Back to Game
        </Link>
      </div>

      {/* How to Play */}
      <Section title="How to Play">
        <P>
          Each day you get a new puzzle with <Strong>8 words</Strong> that
          belong on a spectrum — for example, coldest to hottest, smallest to
          largest, or slowest to fastest.
        </P>
        <P>
          The words start in a random order. Your goal is to{" "}
          <Strong>sort them into the correct position</Strong> along the
          gradient from low to high.
        </P>
        <BulletList
          items={[
            <><Strong>Drag</Strong> a card up or down to reorder it.</>,
            <><Strong>Tap</Strong> two cards to swap their positions.</>,
            <>When you are confident, press <Strong>LOCK IN ANSWER</Strong> to submit.</>,
          ]}
        />
        <P>
          After submitting, each card is scored based on how close it is to its
          correct position:
        </P>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <ScoreBadge color="#22c55e" symbol={"\u2713"} label="Perfect" desc="Exactly right" />
          <ScoreBadge color="#fbbf24" symbol="~" label="Close" desc="Off by one" />
          <ScoreBadge color="#f97316" symbol={"\u2195"} label="Near" desc="Off by 2-3" />
          <ScoreBadge color="#ef4444" symbol={"\u2717"} label="Off" desc="Off by 4+" />
        </div>
      </Section>

      {/* Tips */}
      <Section title="Tips">
        <BulletList
          items={[
            <>Start by identifying the <Strong>extremes</Strong> — the words that clearly belong at the very top or bottom of the spectrum.</>,
            <>Work <Strong>inward</Strong> from both ends to narrow down the middle positions.</>,
            <>If two words feel similar, don't stress — being off by one still earns you <Strong>"Close"</Strong> points.</>,
            <>Play every day to build your <Strong>streak</Strong> and earn bonus XP.</>,
            <>Use the <Strong>Share</Strong> button to challenge your friends with your results.</>,
          ]}
        />
      </Section>

      {/* About */}
      <Section title="About">
        <P>
          <Strong>Spectrum</Strong> is a daily word ordering puzzle. A new
          puzzle is available every day at midnight. Your progress, XP, and
          streak are saved locally on your device.
        </P>
        <P>
          Earn XP by playing daily. Level up by accumulating 200 XP per level.
          Longer streaks give you bonus XP on each puzzle.
        </P>
      </Section>

      {/* Back button */}
      <div style={{ padding: "24px 0 32px" }}>
        <Link
          href="/"
          style={{
            display: "block",
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #3b0764, #6d28d9)",
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontFamily: F_OUT,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 2,
            cursor: "pointer",
            boxShadow: "0 6px 24px #6d28d955",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          BACK TO GAME
        </Link>
      </div>
    </div>
  );
}

/* ── Reusable styled sub-components ── */

function Section({ title, children }) {
  return (
    <div
      style={{
        background: "#0d0d1e",
        border: "1px solid #1c1c35",
        borderRadius: 16,
        padding: "16px 16px",
        marginBottom: 12,
      }}
    >
      <h2
        style={{
          fontFamily: F_OUT,
          fontWeight: 700,
          fontSize: 14,
          color: "#a78bfa",
          letterSpacing: 1,
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return (
    <p
      style={{
        fontFamily: F_OUT,
        fontSize: 13,
        color: "#c8c8e0",
        lineHeight: 1.7,
        marginBottom: 10,
      }}
    >
      {children}
    </p>
  );
}

function Strong({ children }) {
  return <span style={{ color: "#fff", fontWeight: 600 }}>{children}</span>;
}

function BulletList({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "8px 0" }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontFamily: F_OUT,
            fontSize: 13,
            color: "#c8c8e0",
            lineHeight: 1.7,
            marginBottom: 6,
            paddingLeft: 16,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              color: "#6d28d9",
              fontWeight: 700,
            }}
          >
            {"\u2022"}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScoreBadge({ color, symbol, label, desc }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F_OUT,
          fontWeight: 700,
          fontSize: 13,
          color,
        }}
      >
        {symbol}
      </div>
      <div>
        <span style={{ fontFamily: F_OUT, fontSize: 13, fontWeight: 600, color }}>{label}</span>
        <span style={{ fontFamily: F_OUT, fontSize: 12, color: "#555577", marginLeft: 8 }}>{desc}</span>
      </div>
    </div>
  );
}
