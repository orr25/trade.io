import React from "react";

export default function CoinInfoModal({ coin, market, holdings, onClose }) {
  if (!coin) return null;
  const data = market[coin.symbol];
  const price = data?.price || 0;
  const series = data?.series || [];
  const first = series[0]?.p ?? price;
  const last = series[series.length - 1]?.p ?? price;
  const changeAbs = last - first;
  const changePct = first ? (changeAbs / first) * 100 : 0;

  const owned = Math.floor(holdings[coin.symbol] || 0);
  const value = owned * price;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[28rem] max-w-[95vw] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">
            {coin.name} <span className="opacity-70">({coin.symbol})</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
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
            <div className="opacity-80 text-sm">Your Value</div>
            <div className="text-xl font-mono">${value.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-4 text-xs opacity-70">
          Data is simulated for gameplay. (We’re using the price series in memory to approximate a “24h” change.)
        </div>
      </div>
    </div>
  );
}
