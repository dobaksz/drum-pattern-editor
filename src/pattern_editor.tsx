import { CSSProperties } from "react";
import { PatternData } from "./pattern_data";
import { PatternGrid, PatternRowHandlers } from "./pattern_grid";
import { PatternTools } from "./pattern_tools";
import { PlacementMode, SymbolId } from "./types";

interface PatternEditorProps {
  pattern: PatternData;
  placementMode: PlacementMode;
  selectedSymbolId: SymbolId;
  onSelectPlacementMode: (mode: PlacementMode) => void;
  onSelectShape: (symbolId: SymbolId) => void;
  rowHandlers: PatternRowHandlers;
}

export function PatternEditor({
  pattern,
  placementMode,
  selectedSymbolId,
  onSelectPlacementMode,
  onSelectShape,
  rowHandlers
}: PatternEditorProps) {
  const { layout } = pattern;

  return (
    <section className="canvas-area">
      <div
        className="pattern-stage"
        style={{
          "--columns": pattern.columnCount,
          "--row-drag-width": `${layout.rowDragWidth}px`,
          "--cell-size": `${layout.cellSize}px`,
          "--grid-gap": `${layout.gridGap}px`,
          "--add-row-height": `${layout.addRowHeight}px`,
          "--row-action-width": `${layout.rowActionWidth}px`,
          "--header-height": `${layout.headerHeight}px`,
          "--row-label-width": `${layout.rowLabelWidth}px`,
          "--row-gap": `${layout.rowGap}px`,
          "--row-height": `${layout.rowHeight}px`
        } as CSSProperties}
      >
        <PatternTools
          pattern={pattern}
          placementMode={placementMode}
          selectedSymbolId={selectedSymbolId}
          onSelectPlacementMode={onSelectPlacementMode}
          onSelectSymbol={onSelectShape}
        />
        <PatternGrid
          pattern={pattern}
          placementMode={placementMode}
          rowHandlers={rowHandlers}
        />
      </div>
    </section>
  );
}
