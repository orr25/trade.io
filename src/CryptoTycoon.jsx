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

/* =========================
   Avatar (desk view)
========================= */
function PlayerAvatar({ name = "Guest" }) {
  const hue = hashToHue(name || "Guest");
  const shirt = `hsl(${(hue + 210) % 360} 70% 55%)`;
  const chair = `hsl(${(hue + 30) % 360} 15% 35%)`;
  const hair = `hsl(${(hue + 300) % 360} 25% 20%)`;

  return (
    <svg viewBox="0 0 220 220" className="w-full h-full drop-shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
      <defs>
        <radialGradient id="glow" cx="60%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* background glow + desk edge */}
      <rect x="0" y="0" width="220" height="220" fill="url(#glow)" />
      <rect x="0" y="170" width="220" height="18" fill="#cbd5e1" />

      {/* dual screens */}
      <g filter="url(#shadow)">
        {/* Main monitor */}
        <rect x="120" y="76" width="78" height="52" rx="7" fill="#1f2937" />
        <rect x="125" y="81" width="68" height="42" rx="5" className="fill-slate-900" />
        {/* --- label on main monitor --- */}
        <text x="159" y="107" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="8" fill="#38bdf8" opacity="0.9" letterSpacing="1.5">
          TRADER.IO
        </text>

        {/* Side screen */}
        <rect x="38" y="84" width="70" height="44" rx="6" fill="#111827" />
        <rect x="42" y="88" width="62" height="36" rx="4" className="fill-slate-900" />
      </g>

      {/* chair back */}
      <rect x="25" y="112" width="18" height="48" rx="4" fill={chair} />

      {/* head + hair */}
      <path d="M66 56 q18 -18 36 0 v10 h-36 z" fill={hair} />
      <circle cx="84" cy="68" r="20" fill="#fcd34d" />
      <g>
        <rect x="74" y="66" width="6" height="2" className="fill-slate-900 animate-[blink_4s_infinite]" />
        <rect x="92" y="66" width="6" height="2" className="fill-slate-900 animate-[blink_4s_infinite_0.2s]" />
      </g>
      <path d="M78 77 q6 5 12 0" stroke="#7c2d12" strokeWidth="2" fill="none" />

      {/* torso + arms */}
      <rect x="64" y="88" width="40" height="46" rx="10" fill={shirt} />
      <g className="origin-[84px_122px] animate-[tap_0.6s_ease-in-out_infinite]">
        <rect x="56" y="112" width="28" height="10" rx="5" fill="#fcd34d" />
      </g>
      <g className="origin-[98px_122px] animate-[tap2_0.6s_ease-in-out_infinite]">
        <rect x="84" y="112" width="28" height="10" rx="5" fill="#fcd34d" />
      </g>

      {/* keyboard + coffee */}
      <rect x="102" y="156" width="60" height="10" rx="4" fill="#94a3b8" />
      <g>
        <rect x="168" y="156" width="14" height="10" rx="2" fill="#e5e7eb" />
        <rect x="180" y="158" width="4" height="6" rx="1" fill="#e5e7eb" />
        <path d="M172 152 q2 -6 6 0" stroke="#e5e7eb" strokeWidth="1.5" fill="none" className="animate-[steam_2.5s_ease-in-out_infinite]" />
      </g>
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
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700">
            Close
          </button>
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

        <div className="mt-4 text-xs opacity-70">
          Data is simulated for gameplay. (Using the in-memory price series to approximate a “24h” change.)
        </div>
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
      <h2 className="text-lg font-semibold mb-2">Market</h2>
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
                <button
                  onClick={() => setMax(c.symbol)}
                  className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600"
                  title="Max you can afford"
                >
                  MAX
                </button>
                <button
                  onClick={() => onBuy(c.symbol, Math.floor(Number(qtyRefs.current[c.symbol]?.value || 0)))}
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                  Buy
                </button>
                <button
                  onClick={() => onSell(c.symbol, Math.floor(Number(qtyRefs.current[c.symbol]?.value || 0)))}
                  className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500"
                >
                  Sell
                </button>
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
    return (
      <>
        <h2 className="text-lg font-semibold mb-2">Portfolio</h2>
        <div className="text-sm opacity-80">No holdings yet. Buy something on the left!</div>
      </>
    );
  }
  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Portfolio</h2>
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
                <div className="text-xs opacity-70">
                  {units} units · @ ${avg ? avg.toFixed(2) : "0.00"}
                </div>
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
    </>
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
  const [tab, setTab] = useState("market"); // 'market' | 'portfolio'
  const [name, setName] = useState("");

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

  // net worth
  const netWorth = useMemo(() => {
    const holdingsValue = Object.entries(player.holdings).reduce((sum, [sym, units]) => {
      const px = market[sym]?.price || 0;
      return sum + units * px;
    }, 0);
    return parseFloat((player.cash + holdingsValue).toFixed(2));
  }, [player.cash, player.holdings, market]);

  // history
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
    setTab("market");
    setName("");
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
    // Make the avatar fill most of the browser: square container sized by the smaller viewport side
    // Percentage overlay for the monitor click zone is calculated from the SVG viewBox (220x220):
    // left 118/220=53.64%, top 74/220=33.64%, width 84/220=38.18%, height 58/220=26.36%
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg opacity-90 mb-3">Welcome, <span className="font-semibold">{name}</span></div>

          <div
            className="relative"
            style={{ width: "min(92vw, 92vh)", height: "min(92vw, 92vh)" }}
          >
            <PlayerAvatar name={name} />
            {/* Responsive monitor click zone (percent-based) */}
            <button
              onClick={() => setStage("computer")}
              className="absolute rounded-md ring-2 ring-cyan-400/40 hover:ring-cyan-300/80 transition"
              title="Open computer"
              style={{
                left: "53.64%",
                top: "33.64%",
                width: "38.18%",
                height: "26.36%",
              }}
            />
          </div>

          <div className="text-xs opacity-70 mt-3">Click the in-game monitor to use it</div>
        </div>

        {/* subtle vignette for drama */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_30%,rgba(0,0,0,0.4)_100%)]" />
        <style>{`
          @keyframes tap { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(12deg); } }
          @keyframes tap2 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg); } }
          @keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 94%, 98% { transform: scaleY(0.1); } }
          @keyframes steam { 0% { opacity: .3; transform: translateY(0); } 50% { opacity: .8; } 100% { opacity: 0; transform: translateY(-10px); } }
        `}</style>
      </div>
    );
  }

  // COMPUTER: zoomed-in monitor with tabs
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
          <div className="p-3 md:p-4">
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTab("market")}
                className={`px-3 py-1.5 rounded-lg ${tab === "market" ? "bg-cyan-600" : "bg-slate-800 hover:bg-slate-700"}`}
              >
                Market
              </button>
              <button
                onClick={() => setTab("portfolio")}
                className={`px-3 py-1.5 rounded-lg ${tab === "portfolio" ? "bg-cyan-600" : "bg-slate-800 hover:bg-slate-700"}`}
              >
                Portfolio
              </button>
            </div>

            {/* Content */}
            {tab === "market" ? (
              <div className="grid md:grid-cols-2 gap-4">
                <section className="bg-slate-900/50 rounded-2xl p-3 shadow-lg">
                  <MarketPanel
                    coins={COINS}
                    market={market}
                    cash={player.cash}
                    onBuy={buy}
                    onSell={sell}
                    onOpenCoin={setSelectedCoin}
                  />
                </section>

                <section className="bg-slate-900/50 rounded-2xl p-3 shadow-lg">
                  <div className="text-lg font-semibold mb-2">Overview</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <div className="opacity-80">Cash</div>
                      <div className="text-xl font-mono">${player.cash.toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <div className="opacity-80">Net Worth</div>
                      <div className="text-xl font-mono">${netWorth.toFixed(2)}</div>
                    </div>
                  </div>
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
                </section>
              </div>
            ) : (
              <section className="bg-slate-900/50 rounded-2xl p-3 shadow-lg">
                <PortfolioPanel holdings={player.holdings} avgCost={player.avgCost} market={market} />
              </section>
            )}
          </div>
        </div>

        {/* Base/stand */}
        <div className="mx-auto h-4 w-40 bg-slate-800/70 rounded-b-3xl mt-2" />
      </div>

      {/* Modal */}
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
