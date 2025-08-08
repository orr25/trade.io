import React, { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/* =========================
   Small helpers
========================= */
function useClockTick(intervalMs) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}

function randomWalkPrice(prev, drift = 0.0005, vol = 0.012) {
  const shock = (Math.random() * 2 - 1) * vol;
  const step = 1 + drift + shock;
  return parseFloat(Math.max(0.01, prev * step).toFixed(2));
}

function hashToHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function formatClock(d = new Date()) {
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

/* =========================
   Cyberpunk Desk Scene (widescreen)
   - character viewed from behind
   - neon skyline, rain, scanlines
========================= */
function CyberpunkDesk({ name = "Guest" }) {
  const hue = hashToHue(name || "Guest");
  const jacket = `hsl(${(hue + 290) % 360} 90% 55%)`; // neon magenta jacket
  const hair = `hsl(${(hue + 210) % 360} 30% 15%)`;

  return (
    <svg viewBox="0 0 800 450" className="w-full h-full select-none">
      <defs>
        {/* Gradients */}
        <linearGradient id="bgGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0b0f1c" />
          <stop offset="60%" stopColor="#0b1120" />
          <stop offset="100%" stopColor="#070b14" />
        </linearGradient>
        <linearGradient id="neon" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="signGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
        </linearGradient>

        {/* Rain pattern */}
        <pattern id="rain" width="6" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="#6ee7faff" strokeOpacity="0.14" strokeWidth="1" />
        </pattern>

        {/* Scanlines */}
        <pattern id="scan" width="2" height="4" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="rgba(0,0,0,0.22)" />
          <rect y="2" width="2" height="2" fill="rgba(0,0,0,0)" />
        </pattern>

        {/* Soft shadow */}
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.6" />
        </filter>

        {/* Neon outer glow for the sign */}
        <filter id="neonGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky + distant city */}
      <rect x="0" y="0" width="800" height="450" fill="url(#bgGrad)" />
      <rect x="0" y="0" width="800" height="450" fill="url(#rain)" opacity="0.25" />

      {/* City blocks */}
      <g opacity="0.35">
        <rect x="40" y="200" width="80" height="160" fill="#0ea5e9" opacity="0.25" />
        <rect x="140" y="230" width="60" height="130" fill="#a855f7" opacity="0.25" />
        <rect x="220" y="210" width="110" height="150" fill="#22d3ee" opacity="0.22" />
        <rect x="360" y="220" width="90" height="140" fill="#a78bfa" opacity="0.22" />
        <rect x="470" y="205" width="130" height="155" fill="#06b6d4" opacity="0.2" />
        <rect x="620" y="235" width="70" height="125" fill="#22d3ee" opacity="0.22" />
        <rect x="710" y="215" width="50" height="145" fill="#a855f7" opacity="0.22" />
      </g>

      {/* Neon sign TRADER.IO */}
      <g transform="translate(560,60)" filter="url(#neonGlow)">
        <rect x="-10" y="-22" width="220" height="54" rx="10" fill="url(#signGlow)" opacity="0.35" />
        <text
          x="100"
          y="16"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="28"
          fill="url(#neon)"
          letterSpacing="2"
        >
          TRADER.IO
        </text>
      </g>

      {/* Window reflections */}
      <g opacity="0.14">
        <rect x="0" y="0" width="800" height="450" fill="url(#scan)" />
      </g>

      {/* Desk top */}
      <rect x="0" y="330" width="800" height="50" fill="#0b1324" />
      <rect x="0" y="330" width="800" height="50" fill="url(#neon)" opacity="0.06" />

      {/* Monitors + glow */}
      <g filter="url(#softShadow)">
        {/* main monitor */}
        <rect x="330" y="120" width="260" height="150" rx="10" fill="#060a12" stroke="#172038" />
        <rect x="340" y="130" width="240" height="130" rx="8" fill="#0b1424" />
        <rect x="340" y="130" width="240" height="130" rx="8" fill="url(#scan)" opacity="0.3" />
        {/* glow rim */}
        <rect x="340" y="130" width="240" height="130" rx="8" fill="none" stroke="url(#neon)" strokeWidth="2" opacity="0.7">
          <animate attributeName="opacity" values="0.35;0.7;0.35" dur="3.5s" repeatCount="indefinite" />
        </rect>
        {/* screen brand text */}
        <text x="460" y="200" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="18" fill="#67e8f9" opacity="0.85">
          TRADER.IO
        </text>

        {/* side monitor */}
        <rect x="200" y="140" width="110" height="90" rx="8" fill="#060a12" stroke="#172038" />
        <rect x="206" y="146" width="98" height="78" rx="6" fill="#101a2e" />
        <rect x="206" y="146" width="98" height="78" rx="6" fill="url(#scan)" opacity="0.3" />
        <rect x="206" y="146" width="98" height="78" rx="6" fill="none" stroke="#22d3ee" opacity="0.4" />
      </g>

      {/* Keyboard + desk items */}
      <rect x="350" y="290" width="220" height="16" rx="6" fill="#334155" opacity="0.9" />
      <rect x="585" y="282" width="26" height="18" rx="4" fill="#94a3b8" />
      <circle cx="612" cy="276" r="3" fill="#94a3b8" />

      {/* Character (from behind) */}
      {/* chair back */}
      <rect x="300" y="242" width="200" height="96" rx="18" fill="#0f172a" />
      {/* shoulders / jacket */}
      <path d="M360 260 q40 -40 80 0 v60 h-160 v-40 q40 -20 80 -20 z" fill={jacket} opacity="0.95" />
      {/* head */}
      <circle cx="400" cy="240" r="28" fill={hair} />
      {/* neck glow */}
      <rect x="392" y="252" width="16" height="8" rx="3" fill="#22d3ee" opacity="0.5" />
      {/* subtle rimlight */}
      <path d="M376 220 q24 -18 48 0" stroke="#22d3ee" strokeOpacity="0.6" strokeWidth="2" fill="none" />

      {/* subtle foreground vignette */}
      <rect x="0" y="0" width="800" height="450" fill="url(#scan)" opacity="0.12" />
    </svg>
  );
}

/* =========================
   Tiny chart
========================= */
function MiniChart({ data }) {
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip formatter={(v) => `$${v}`} />
          <Line type="monotone" dataKey="p" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* =========================
   Coin modal
========================= */
function CoinInfoModal({ coin, market, holdings, avgCost, onClose }) {
  if (!coin) return null;
  const data = market[coin.symbol];
  const price = data?.price || 0;
  const series = data?.series || [];
  const first = series[0]?.p ?? price;
  const last = series[series.length - 1]?.p ?? price;
  const changeAbs = last - first;
  const changePct = first ? (changeAbs / first) * 100 : 0;

  const owned = Math.floor(holdings[coin.symbol] || 0);
  const avg = avgCost[coin.symbol] ?? 0;
  const value = owned * price;
  const plPct = avg > 0 ? ((price - avg) / avg) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[28rem] max-w-[95vw] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">
            {coin.name} <span className="opacity-70">({coin.symbol})</span>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700">Close</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="opacity-80 text-sm">Current Price</div>
            <div className="text-xl font-mono">${price.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="opacity-80 text-sm">Simulated 24h Change</div>
            <div className={`text-xl font-mono ${changeAbs >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {changeAbs >= 0 ? "+" : ""}{changeAbs.toFixed(2)} ({changePct.toFixed(2)}%)
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="opacity-80 text-sm">Your Holdings</div>
            <div className="text-xl font-mono">{owned} coins</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="opacity-80 text-sm">Your Avg Cost</div>
            <div className="text-xl font-mono">@ ${avg ? avg.toFixed(2) : "0.00"}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3 col-span-2">
            <div className="opacity-80 text-sm">Current Value</div>
            <div className="text-xl font-mono">
              ${value.toFixed(2)}{" "}
              <span className={`text-sm ${plPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {plPct >= 0 ? "▲" : "▼"} {plPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs opacity-70">Data is simulated for gameplay.</div>
      </div>
    </div>
  );
}

/* =========================
   Market panel (integer qty + MAX)
========================= */
function MarketPanel({ coins, market, cash, onBuy, onSell, onOpenCoin }) {
  const qtyRefs = useRef({});

  function setMax(sym) {
    const price = market[sym]?.price || 0;
    if (price <= 0) return;
    const max = Math.floor(cash / price);
    if (qtyRefs.current[sym]) qtyRefs.current[sym].value = max;
  }

  return (
    <>
      <div className="space-y-3">
        {coins.map((c) => (
          <div key={c.symbol} className="rounded-xl p-3 bg-slate-800/60">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => onOpenCoin?.(c)} className="text-left" title="More info">
                <div className="font-medium">
                  {c.name} <span className="opacity-70">({c.symbol})</span>
                </div>
                <div className="text-sm opacity-80">${market[c.symbol]?.price.toFixed(2)}</div>
              </button>
              <div className="flex items-center gap-2">
                <input
                  ref={(el) => (qtyRefs.current[c.symbol] = el)}
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Qty"
                  className="w-24 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-right"
                />
                <button onClick={() => setMax(c.symbol)} className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600" title="Max you can afford">MAX</button>
                <button onClick={() => onBuy(c.symbol, Math.floor(Number(qtyRefs.current[c.symbol]?.value || 0)))} className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500">Buy</button>
                <button onClick={() => onSell(c.symbol, Math.floor(Number(qtyRefs.current[c.symbol]?.value || 0)))} className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500">Sell</button>
              </div>
            </div>
            <MiniChart data={market[c.symbol]?.series || []} />
          </div>
        ))}
      </div>
    </>
  );
}

/* =========================
   Portfolio panel (Avg cost + P/L%)
========================= */
function PortfolioPanel({ holdings, avgCost, market }) {
  const symbols = Object.keys(holdings);
  if (symbols.length === 0) {
    return <div className="text-sm opacity-80">No holdings yet. Buy something on the Market app!</div>;
  }
  return (
    <div className="space-y-2">
      {symbols.map((sym) => {
        const units = Math.floor(holdings[sym] || 0);
        const price = market[sym]?.price || 0;
        const value = units * price;
        const avg = avgCost[sym] ?? 0;
        const plPct = avg > 0 ? ((price - avg) / avg) * 100 : 0;
        const up = plPct >= 0;

        return (
          <div key={sym} className="flex items-center justify-between bg-slate-800/60 rounded-xl p-3">
            <div>
              <div className="font-medium">{sym}</div>
              <div className="text-xs opacity-70">{units} units · @ ${avg ? avg.toFixed(2) : "0.00"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">@ ${price.toFixed(2)}</div>
              <div className="font-mono">${value.toFixed(2)}</div>
              <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${up ? "bg-emerald-900/40 text-emerald-300" : "bg-rose-900/40 text-rose-300"}`}>
                {up ? "▲" : "▼"} {plPct.toFixed(2)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   Game config
========================= */
const COINS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "ADA", name: "Cardano" },
];
const STARTING_CASH = 10000;
const TICK_MS = 900;

/* =========================
   Main App
========================= */
export default function CryptoTycoon() {
  // stages: start → desk → computer
  const [stage, setStage] = useState("start");
  const [tab, setTab] = useState(null); // null shows desktop; 'market' or 'portfolio' opens window
  const [name, setName] = useState("");
  const [clock, setClock] = useState(formatClock());
  const [zooming, setZooming] = useState(false);

  const tick = useClockTick(TICK_MS);

  const [player, setPlayer] = useState({
    id: Math.random().toString(36).slice(2, 9),
    cash: STARTING_CASH,
    holdings: {}, // {SYM: int}
    avgCost: {},  // {SYM: number}
    history: [],  // [{t, value}]
  });

  const [market, setMarket] = useState(() => {
    const m = {};
    for (const c of COINS) {
      const start = parseFloat((100 + Math.random() * 1000).toFixed(2));
      m[c.symbol] = { price: start, series: [{ t: 0, p: start }] };
    }
    return m;
  });

  const [selectedCoin, setSelectedCoin] = useState(null);

  // fake OS clock updates when on computer
  useEffect(() => {
    if (stage !== "computer") return;
    const id = setInterval(() => setClock(formatClock()), 1000);
    return () => clearInterval(id);
  }, [stage]);

  // advance market when on computer (active play)
  useEffect(() => {
    if (stage !== "computer") return;
    setMarket((prev) => {
      const next = { ...prev };
      for (const sym of Object.keys(next)) {
        const price = randomWalkPrice(next[sym].price);
        const series = next[sym].series.slice(-120);
        series.push({ t: tick, p: price });
        next[sym] = { price, series };
      }
      return next;
    });
  }, [tick, stage]);

  // net worth & history
  const netWorth = useMemo(() => {
    const holdingsValue = Object.entries(player.holdings).reduce((sum, [sym, units]) => {
      const px = market[sym]?.price || 0;
      return sum + units * px;
    }, 0);
    return parseFloat((player.cash + holdingsValue).toFixed(2));
  }, [player.cash, player.holdings, market]);

  useEffect(() => {
    if (stage !== "computer") return;
    setPlayer((p) => ({
      ...p,
      history: [...p.history.slice(-300), { t: Date.now(), value: netWorth }],
    }));
  }, [netWorth, stage]);

  /* ===== Trading (ints + avg cost) ===== */
  function buy(sym, qty) {
    const q = Math.max(0, Math.floor(Number(qty)));
    if (!q) return;
    const price = market[sym]?.price || 0;
    const cost = q * price;

    setPlayer((p) => {
      if (p.cash < cost) return p;
      const prevUnits = Math.floor(p.holdings[sym] || 0);
      const prevAvg = p.avgCost[sym] ?? 0;
      const newUnits = prevUnits + q;
      const newAvg = prevUnits > 0 ? (prevAvg * prevUnits + price * q) / newUnits : price;

      return {
        ...p,
        cash: parseFloat((p.cash - cost).toFixed(2)),
        holdings: { ...p.holdings, [sym]: newUnits },
        avgCost: { ...p.avgCost, [sym]: parseFloat(newAvg.toFixed(2)) },
      };
    });
  }

  function sell(sym, qty) {
    const q = Math.max(0, Math.floor(Number(qty)));
    if (!q) return;

    setPlayer((p) => {
      const owned = Math.floor(p.holdings[sym] || 0);
      const sellQty = Math.min(owned, q);
      if (sellQty <= 0) return p;

      const price = market[sym]?.price || 0;
      const proceeds = sellQty * price;

      const newUnits = owned - sellQty;
      const newHoldings = { ...p.holdings };
      const newAvgCost = { ...p.avgCost };

      if (newUnits <= 0) {
        delete newHoldings[sym];
        delete newAvgCost[sym];
      } else {
        newHoldings[sym] = newUnits;
      }

      return {
        ...p,
        cash: parseFloat((p.cash + proceeds).toFixed(2)),
        holdings: newHoldings,
        avgCost: newAvgCost,
      };
    });
  }

  function resetGame() {
    setPlayer({
      id: Math.random().toString(36).slice(2, 9),
      cash: STARTING_CASH,
      holdings: {},
      avgCost: {},
      history: [],
    });
    setMarket(() => {
      const m = {};
      for (const c of COINS) {
        const start = parseFloat((100 + Math.random() * 1000).toFixed(2));
        m[c.symbol] = { price: start, series: [{ t: 0, p: start }] };
      }
      return m;
    });
    setSelectedCoin(null);
    setStage("start");
    setTab(null);
    setName("");
  }

  function goToComputer() {
    setZooming(true);
    setTimeout(() => {
      setStage("computer");
      setZooming(false);
    }, 450);
  }

  /* ===== STAGES ===== */
  if (stage === "start") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-3xl font-semibold text-center mb-1">Crypto Tycoon .io</h1>
          <p className="text-center text-sm opacity-80 mb-6">Enter a name to begin</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name && setStage("desk")}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          />
          <button
            disabled={!name}
            onClick={() => setStage("desk")}
            className="w-full px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Play
          </button>
          <div className="mt-4 text-xs opacity-70 text-center">Prototype build · prices simulated</div>
        </div>
      </div>
    );
  }

  if (stage === "desk") {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-[#070B14] to-[#050811] text-slate-100 overflow-hidden">
        <div className={`absolute inset-0 flex items-center justify-center transition-[transform,filter,opacity] duration-500 ease-out ${zooming ? "scale-[1.08] blur-[1px] opacity-85" : "scale-100"}`}>
          {/* Responsive canvas */}
          <div className="relative w-full max-w-[1200px] aspect-[16/9]">
            <CyberpunkDesk name={name} />
            {/* monitor click zone (based on 800x450 viewBox): x=330 y=120 w=260 h=150 */}
            <button
              onClick={goToComputer}
              className="absolute rounded-md ring-2 ring-cyan-400/40 hover:ring-cyan-300/80 transition"
              title="Open computer"
              style={{
                left: "41.25%",
                top: "26.666%",
                width: "32.5%",
                height: "33.333%",
              }}
            />
          </div>
        </div>
        {/* neon vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06)_0%,rgba(168,85,247,0.04)_35%,rgba(0,0,0,0.5)_100%)]" />
      </div>
    );
  }

  // COMPUTER: OS-like UI inside monitor
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Player: <span className="font-mono">{name}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setStage("desk")} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700">Back</button>
          <button onClick={resetGame} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700">Reset</button>
        </div>
      </header>

      {/* Monitor shell */}
      <div className="relative mx-auto mt-4 max-w-5xl">
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 shadow-2xl overflow-hidden">
          {/* Faux bezel */}
          <div className="h-3 bg-slate-800/80" />
          {/* Screen area */}
          <div className="p-0 md:p-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%230b1220%22/><path d=%22M0 20h40M20 0v40%22 stroke=%22%2313243c%22 stroke-opacity=%220.4%22/></svg>')] bg-repeat">
            {/* Top status bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <div className="px-2 py-1 rounded bg-slate-700/60">☰</div>
                <div className="opacity-80">TRADER OS</div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80"><path fill="currentColor" d="M12 18.5q-.425 0-.712-.288T11 17.5q0-.425.288-.712T12 16.5q.425 0 .713.288T13 17.5q0 .425-.288.712T12 18.5Zm-3-3q-.425 0-.713-.288T8 14.5q0-.425.288-.712T9 13.5q1.25 0 2.375.45T13.5 15q.3.3.3.725t-.3.725q-.3.3-.725.3t-.725-.3q-.7-.575-1.55-.913T9 15.5Zm-3-3q-.425 0-.712-.288T5 11.5q0-.425.288-.712T6 10.5q2.45 0 4.6.938T14.5 14q.3.3.3.725t-.3.725q-.3.3-.725.3t-.725-.3q-1.65-1.35-3.55-2.15T6 12.5Zm-3-3q-.425 0-.713-.288T2 8.5q0-.425.288-.712T3 7.5q3.65 0 6.85 1.388T17.5 13q.3.3.3.725t-.3.725q-.3.3-.725.3t-.725-.3q-2.6-2.1-5.675-3.175T3 9.5Z"/></svg>
                <div className="flex items-center gap-1 opacity-80">
                  <div className="w-8 h-3 rounded-sm border border-slate-400 relative">
                    <div className="h-full bg-emerald-500" style={{ width: "78%" }} />
                    <div className="absolute -right-1 top-1 h-1 w-1.5 bg-slate-400 rounded-sm" />
                  </div>
                  <span>78%</span>
                </div>
                <div className="font-mono opacity-90">{clock}</div>
              </div>
            </div>

            {/* Desktop area */}
            <div className="relative p-4 min-h-[420px]">
              {/* Desktop icons */}
              {!tab && (
                <div className="grid grid-cols-6 gap-4">
                  <button onClick={() => setTab("market")} className="flex flex-col items-center text-xs opacity-90 hover:opacity-100">
                    <div className="w-14 h-14 rounded-xl bg-cyan-600/80 grid place-items-center text-2xl shadow">🪙</div>
                    <div className="mt-1">Market</div>
                  </button>
                  <button onClick={() => setTab("portfolio")} className="flex flex-col items-center text-xs opacity-90 hover:opacity-100">
                    <div className="w-14 h-14 rounded-xl bg-emerald-600/80 grid place-items-center text-2xl shadow">📁</div>
                    <div className="mt-1">Portfolio</div>
                  </button>
                </div>
              )}

              {/* App windows */}
              {tab === "market" && (
                <Window title="Market" onClose={() => setTab(null)}>
                  <MarketPanel
                    coins={COINS}
                    market={market}
                    cash={player.cash}
                    onBuy={buy}
                    onSell={sell}
                    onOpenCoin={setSelectedCoin}
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <div className="opacity-80">Cash</div>
                      <div className="text-xl font-mono">${player.cash.toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <div className="opacity-80">Net Worth</div>
                      <div className="text-xl font-mono">${netWorth.toFixed(2)}</div>
                    </div>
                  </div>
                </Window>
              )}

              {tab === "portfolio" && (
                <Window title="Portfolio" onClose={() => setTab(null)}>
                  <PortfolioPanel holdings={player.holdings} avgCost={player.avgCost} market={market} />
                  <div className="mt-4">
                    <div className="text-sm opacity-80 mb-2">Net Worth (live)</div>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={player.history} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="t" hide />
                          <YAxis domain={["auto", "auto"]} hide />
                          <Tooltip formatter={(v) => `$${v}`} />
                          <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Window>
              )}
            </div>

            {/* Bottom dock */}
            <div className="px-3 py-2 bg-slate-800/80 border-t border-slate-700 flex items-center gap-3">
              <button onClick={() => setTab("market")} className={`px-3 py-1.5 rounded ${tab === "market" ? "bg-cyan-600" : "bg-slate-700/70 hover:bg-slate-700"}`}>🪙 Market</button>
              <button onClick={() => setTab("portfolio")} className={`px-3 py-1.5 rounded ${tab === "portfolio" ? "bg-cyan-600" : "bg-slate-700/70 hover:bg-slate-700"}`}>📁 Portfolio</button>
              <div className="ml-auto text-xs opacity-70">TRADER OS</div>
            </div>
          </div>
        </div>

        {/* Base/stand */}
        <div className="mx-auto h-4 w-40 bg-slate-800/70 rounded-b-3xl mt-2" />
      </div>

      {/* Modal for coin details */}
      {selectedCoin && (
        <CoinInfoModal
          coin={selectedCoin}
          market={market}
          holdings={player.holdings}
          avgCost={player.avgCost}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}

/* =========================
   Window component (inside OS screen)
========================= */
function Window({ title, children, onClose }) {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="ml-2 text-sm font-medium">{title}</div>
        </div>
        <button onClick={onClose} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs">Close</button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
