import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PlayerAvatar from "./components/PlayerAvatar.jsx";
import MarketPanel from "./components/MarketPanel.jsx";
import PortfolioPanel from "./components/PortfolioPanel.jsx";
import CoinInfoModal from "./components/CoinInfoModal.jsx";

// ===== Game Config =====
const COINS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "ADA", name: "Cardano" },
];

const STARTING_CASH = 10000;
const TICK_MS = 900;

// ===== Utils =====
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

// ===== Main App =====
export default function CryptoTycoon() {
  const [screen, setScreen] = useState("start"); // 'start' | 'avatar' | 'market'
  const [name, setName] = useState("");
  const tick = useClockTick(TICK_MS);

  const [player, setPlayer] = useState({
    id: Math.random().toString(36).slice(2, 9),
    cash: STARTING_CASH,
    holdings: {},   // {SYM: integer units}
    avgCost: {},    // {SYM: average cost per unit}
    history: [],    // [{t, value}]
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

  // Advance market only while on market screen
  useEffect(() => {
    if (screen !== "market") return;
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
  }, [tick, screen]);

  // Net worth calc
  const netWorth = useMemo(() => {
    const holdingsValue = Object.entries(player.holdings).reduce((sum, [sym, units]) => {
      const px = market[sym]?.price || 0;
      return sum + units * px;
    }, 0);
    return parseFloat((player.cash + holdingsValue).toFixed(2));
  }, [player.cash, player.holdings, market]);

  // Track history while on market
  useEffect(() => {
    if (screen !== "market") return;
    setPlayer((p) => ({
      ...p,
      history: [...p.history.slice(-300), { t: Date.now(), value: netWorth }],
    }));
  }, [netWorth, screen]);

  // ===== Trading handlers (integers + average cost) =====
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
        delete newAvgCost[sym]; // reset avg cost when you fully exit
      } else {
        newHoldings[sym] = newUnits;
        // avg cost stays the same on sell (unless fully exited)
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
    setScreen("start");
    setName("");
  }

  // Screens
  if (screen === "start") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-3xl font-semibold text-center mb-1">Crypto Tycoon .io</h1>
          <p className="text-center text-sm opacity-80 mb-6">Enter a name to begin</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name && setScreen("avatar")}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          />
          <button
            disabled={!name}
            onClick={() => setScreen("avatar")}
            className="w-full px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Play
          </button>
          <div className="mt-4 text-xs opacity-70 text-center">Prototype build · prices simulated</div>
        </div>
      </div>
    );
  }

  if (screen === "avatar") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
        <div className="text-lg opacity-90 mb-3">
          Welcome, <span className="font-semibold">{name}</span>
        </div>
        <PlayerAvatar name={name} onClick={() => setScreen("market")} />
      </div>
    );
  }

  // Market screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Market — Player: <span className="font-mono">{name}</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-sm opacity-80">
            ID <span className="font-mono">{player.id}</span>
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="grid md:grid-cols-3 gap-4 mt-4">
        {/* Market & Charts */}
        <section className="md:col-span-1 bg-slate-900/50 rounded-2xl p-3 shadow-lg">
          <MarketPanel
            coins={COINS}
            market={market}
            cash={player.cash}
            onBuy={buy}
            onSell={sell}
            onOpenCoin={setSelectedCoin}
          />
        </section>

        {/* Avatar + Stats */}
        <section className="md:col-span-1 bg-slate-900/50 rounded-2xl p-3 flex flex-col items-center justify-between shadow-lg">
          <div className="text-lg font-semibold">Your Station</div>
          <PlayerAvatar name={name} onClick={() => {}} />
          <div className="w-full grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="opacity-80">Cash</div>
              <div className="text-xl font-mono">${player.cash.toFixed(2)}</div>
            </div>
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="opacity-80">Net Worth</div>
              <div className="text-xl font-mono">${netWorth.toFixed(2)}</div>
            </div>
          </div>
        </section>

        {/* Portfolio + Net Worth chart */}
        <section className="md:col-span-1 bg-slate-900/50 rounded-2xl p-3 shadow-lg">
          <PortfolioPanel
            holdings={player.holdings}
            avgCost={player.avgCost}
            market={market}
          />
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Net Worth</h3>
            <div className="h-32 w-full">
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
          <div className="mt-4 text-xs opacity-70">Prices are simulated. Prototype for gameplay only.</div>
        </section>
      </main>

      {/* Coin details modal */}
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
