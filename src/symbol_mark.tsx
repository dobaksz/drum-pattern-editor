import { CSSProperties } from "react";
import { getSymbolColor } from "./color";
import { PatternData } from "./pattern_data";
import { SymbolId } from "./types";

interface SymbolMarkProps {
  color: string;
  pattern: PatternData;
  symbolId: SymbolId;
}

export function SymbolMark({ color, pattern, symbolId }: SymbolMarkProps) {
  if (symbolId === pattern.emptySymbolId) return null;
  const symbol = pattern.getSymbol(symbolId);
  if (!symbol) return null;

  return (
    <span
      className={`symbol ${symbol.mark}`}
      style={{ "--symbol-color": getSymbolColor(color) } as CSSProperties}
    />
  );
}
