import React, { useRef } from "react";
import MiniChart from "./MiniChart.jsx";

export default function MarketPanel({ coins, market, onBuy, onSell }) {
  const qtyRefs = useRef({});

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Market</h2>
      <div className="space-y-3">
        {coins.map((c) => (
          <div key={c.symbol} className="rounded-xl p-3 bg-slate-800/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {c.name} <span className="opacity-70">({c.symbol})</span>
                </div>
                <div className="text-sm opacity-80">${market[c.symbol]?.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={(el) => (qtyRefs.current[c.symbol] = el)}
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="Qty"
                  className="w-24 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-right"
                />
                <button
                  onClick={() => onBuy(c.symbol, qtyRefs.current[c.symbol]?.value || "0")}
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                  Buy
                </button>
                <button
                  onClick={() => onSell(c.symbol, qtyRefs.current[c.symbol]?.value || "0")}
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
