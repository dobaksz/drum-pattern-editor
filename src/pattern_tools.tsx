import { ReactNode } from "react";
import { Eraser } from "lucide-react";
import { PatternData } from "./pattern_data";
import { PlacementIcon } from "./placement_icon";
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
            active={placementMode === PlacementMode.CellCenter}
            icon={<PlacementIcon mode={PlacementMode.CellCenter} />}
            label="Place at cell center"
            mode={PlacementMode.CellCenter}
            onSelect={onSelectPlacementMode}
          />
          <PlacementButton
            active={placementMode === PlacementMode.IntervalBefore}
            icon={<PlacementIcon mode={PlacementMode.IntervalBefore} />}
            label="Place before the midpoint between cells"
            mode={PlacementMode.IntervalBefore}
            onSelect={onSelectPlacementMode}
          />
          <PlacementButton
            active={placementMode === PlacementMode.IntervalCenter}
            icon={<PlacementIcon mode={PlacementMode.IntervalCenter} />}
            label="Place midway between cells"
            mode={PlacementMode.IntervalCenter}
            onSelect={onSelectPlacementMode}
          />
          <PlacementButton
            active={placementMode === PlacementMode.IntervalAfter}
            icon={<PlacementIcon mode={PlacementMode.IntervalAfter} />}
            label="Place after the midpoint between cells"
            mode={PlacementMode.IntervalAfter}
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
