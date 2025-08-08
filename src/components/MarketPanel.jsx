import React, { useRef } from "react";
import MiniChart from "./MiniChart.jsx";

export default function MarketPanel({ coins, market, cash, onBuy, onSell, onOpenCoin }) {
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
              {/* Clickable name/price to open details */}
              <button
                type="button"
                onClick={() => onOpenCoin?.(c)}
                className="text-left"
                title="More info"
              >
                <div className="font-medium">
                  {c.name} <span className="opacity-70">({c.symbol})</span>
                </div>
                <div className="text-sm opacity-80">${market[c.symbol]?.price.toFixed(2)}</div>
              </button>

              {/* Quantity + actions */}
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
