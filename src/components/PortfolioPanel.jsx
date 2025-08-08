import React from "react";

export default function PortfolioPanel({ holdings, avgCost, market }) {
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
                  {units} units &nbsp;·&nbsp; @ ${avg ? avg.toFixed(2) : "0.00"}
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
