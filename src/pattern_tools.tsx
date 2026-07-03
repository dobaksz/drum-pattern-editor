import { ReactNode } from "react";
import { BetweenVerticalStart, Eraser, SquareDot } from "lucide-react";
import { PatternData } from "./pattern_data";
import { SymbolMark } from "./symbol_mark";
import { PlacementMode, SymbolId } from "./types";

interface PatternToolsProps {
  pattern: PatternData;
  placementMode: PlacementMode;
  selectedSymbolId: SymbolId;
  onSelectPlacementMode: (mode: PlacementMode) => void;
  onSelectSymbol: (symbolId: SymbolId) => void;
}

interface PlacementButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  mode: PlacementMode;
  onSelect: (mode: PlacementMode) => void;
}

export function PatternTools({
  pattern,
  placementMode,
  selectedSymbolId,
  onSelectPlacementMode,
  onSelectSymbol
}: PatternToolsProps) {
  return (
    <div className="pattern-tools" aria-label="Paint tools">
      <div className="pattern-tools-cluster">
        {pattern.symbols.map((symbol) => (
          <button
            className={symbol.id === selectedSymbolId ? "swatch active" : "swatch"}
            key={symbol.id}
            title={symbol.label}
            type="button"
            onClick={() => onSelectSymbol(symbol.id)}
          >
            <SymbolMark color="#555555" pattern={pattern} symbolId={symbol.id} />
          </button>
        ))}
        <span className="tool-divider" aria-hidden="true" />
        <div className="placement-tools-cluster" role="group" aria-label="Mark placement">
          <PlacementButton
            active={placementMode === PlacementMode.Cells}
            icon={<SquareDot size={17} />}
            label="Place marks in cells"
            mode={PlacementMode.Cells}
            onSelect={onSelectPlacementMode}
          />
          <PlacementButton
            active={placementMode === PlacementMode.Lines}
            icon={<BetweenVerticalStart size={17} />}
            label="Place marks between cells"
            mode={PlacementMode.Lines}
            onSelect={onSelectPlacementMode}
          />
        </div>
        <span className="tool-divider" aria-hidden="true" />
        <button
          className={selectedSymbolId === pattern.emptySymbolId ? "swatch active" : "swatch"}
          title="Erase"
          type="button"
          onClick={() => onSelectSymbol(pattern.emptySymbolId)}
        >
          <Eraser size={16} />
        </button>
      </div>
    </div>
  );
}

function PlacementButton({ active, icon, label, mode, onSelect }: PlacementButtonProps) {
  return (
    <button
      className={active ? "placement-option active" : "placement-option"}
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => onSelect(mode)}
    >
      {icon}
    </button>
  );
}
