import React from "react";

export default function PortfolioPanel({ holdings, market }) {
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
          const units = holdings[sym] || 0;
          const price = market[sym]?.price || 0;
          const value = units * price;
          return (
            <div key={sym} className="flex items-center justify-between bg-slate-800/60 rounded-xl p-3">
              <div>
                <div className="font-medium">{sym}</div>
                <div className="text-xs opacity-70">{units} units</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">@ ${price.toFixed(2)}</div>
                <div className="font-mono">${value.toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
