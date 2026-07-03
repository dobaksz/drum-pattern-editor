import { CSSProperties, DragEvent, ReactNode, useState } from "react";
import { BetweenVerticalStart, Eraser, Menu, Plus, SquareDot, Trash2 } from "lucide-react";
import { getSymbolColor } from "./color";
import { PatternData, PatternRow } from "./model";
import { PlacementMode, SymbolId } from "./types";

interface ShapeMarkProps {
  color: string;
  pattern: PatternData;
  shapeId: SymbolId;
}

interface PlacementButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  mode: PlacementMode;
  onSelect: (mode: PlacementMode) => void;
}

interface PaintControlsProps {
  pattern: PatternData;
  placementMode: PlacementMode;
  selectedSymbolId: SymbolId;
  onSelectPlacementMode: (mode: PlacementMode) => void;
  onSelectShape: (symbolId: SymbolId) => void;
}

interface RowHandlers {
  paintCell: (rowId: string, index: number) => void;
  paintDivider: (rowId: string, index: number) => void;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, targetIndex: number) => void;
  updateColor: (rowId: string, color: string) => void;
  updateName: (rowId: string, name: string) => void;
}

interface RowDragHandlers {
  onDragStart: (event: DragEvent<HTMLButtonElement>, row: PatternRow) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, rowId: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, targetIndex: number) => void;
}

interface PatternEditorProps extends PaintControlsProps {
  onAddRow: () => void;
  rowHandlers: RowHandlers;
}

function ShapeMark({ color, pattern, shapeId }: ShapeMarkProps) {
  if (shapeId === pattern.emptySymbolId) return null;
  const shape = pattern.getSymbol(shapeId);
  if (!shape) return null;
  return (
    <span
      className={`symbol ${shape.mark}`}
      style={{ "--symbol-color": getSymbolColor(color) } as CSSProperties}
    />
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

function PaintControls({
  pattern,
  placementMode,
  selectedSymbolId,
  onSelectPlacementMode,
  onSelectShape
}: PaintControlsProps) {
  return (
    <div className="pattern-tools" aria-label="Paint tools">
      <div className="pattern-tools-cluster">
        {pattern.symbols.map((shape) => (
          <button
            className={shape.id === selectedSymbolId ? "swatch active" : "swatch"}
            key={shape.id}
            title={shape.label}
            type="button"
            onClick={() => onSelectShape(shape.id)}
          >
            <ShapeMark color="#555555" pattern={pattern} shapeId={shape.id} />
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
          onClick={() => onSelectShape(pattern.emptySymbolId)}
        >
          <Eraser size={16} />
        </button>
      </div>
    </div>
  );
}

function HeaderRow({ header, stepsPerBeat }: { header: readonly string[]; stepsPerBeat: number }) {
  return (
    <div className="header-row">
      <div className="drag-corner-cell" />
      <div className="corner-cell" />
      <div className="cell-strip">
        {header.map((label, index) => (
          <div
            className={index % stepsPerBeat === 0 ? "header-cell beat" : "header-cell step"}
            key={`header-${index}`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="action-corner-cell" />
    </div>
  );
}

function RowDragHandle({
  row,
  onDragStart,
  onDragEnd
}: {
  row: PatternRow;
  onDragStart: RowDragHandlers["onDragStart"];
  onDragEnd: RowDragHandlers["onDragEnd"];
}) {
  return (
    <button
      className="row-drag-handle"
      draggable
      tabIndex={-1}
      type="button"
      aria-label={`Drag ${row.name} row to reorder`}
      title="Drag to reorder"
      onDragStart={(event) => onDragStart(event, row)}
      onDragEnd={onDragEnd}
    >
      <Menu size={16} />
    </button>
  );
}

function RowLabel({ row, rowHandlers }: { row: PatternRow; rowHandlers: RowHandlers }) {
  return (
    <div className="row-label" style={{ "--row-color": row.color } as CSSProperties}>
      <input
        aria-label="Row name"
        value={row.name}
        onChange={(event) => rowHandlers.updateName(row.id, event.target.value)}
      />
    </div>
  );
}

function RowActions({
  canRemove,
  row,
  rowHandlers
}: { canRemove: boolean; row: PatternRow; rowHandlers: RowHandlers }) {
  return (
    <div className="row-actions">
      <label className="row-color-control" title="Row color">
        <span style={{ "--row-chip-color": row.color } as CSSProperties} />
        <input
          aria-label={`${row.name} row color`}
          type="color"
          value={row.color}
          onChange={(event) => rowHandlers.updateColor(row.id, event.target.value)}
        />
      </label>
      {canRemove && (
        <button className="row-remove-button" type="button" onClick={() => rowHandlers.removeRow(row.id)} title="Remove row">
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function GridCells({
  pattern,
  placementMode,
  row,
  rowHandlers
}: { pattern: PatternData; placementMode: PlacementMode; row: PatternRow; rowHandlers: RowHandlers }) {
  return (
    <div className={`cell-strip grid-cells placement-${placementMode}`}>
      {row.cells.map((cell, cellIndex) => {
        const hasMark = row.hasMarkAtCell(cellIndex);

        return (
          <button
            className={hasMark ? "grid-cell occupied" : "grid-cell"}
            disabled={placementMode !== PlacementMode.Cells}
            key={`${row.id}-${cellIndex}`}
            type="button"
            onClick={() => rowHandlers.paintCell(row.id, cellIndex)}
            aria-label={`${row.name} column ${cellIndex + 1}`}
          >
            <ShapeMark color={row.color} pattern={pattern} shapeId={cell} />
          </button>
        );
      })}
      <div className="divider-layer" aria-hidden={placementMode !== PlacementMode.Lines}>
        {row.dividers.map((divider, dividerIndex) => (
          <div
            className="divider-slot"
            key={`${row.id}-divider-${dividerIndex}`}
            style={{
              left: `${(dividerIndex + 1) * (pattern.layout.cellSize + pattern.layout.gridGap)
                - pattern.layout.gridGap / 2}px`
            }}
          >
            <div className="divider-mark" aria-hidden="true">
              <ShapeMark color={row.color} pattern={pattern} shapeId={divider} />
            </div>
            <button
              className="divider-target"
              disabled={placementMode !== PlacementMode.Lines}
              type="button"
              onClick={() => rowHandlers.paintDivider(row.id, dividerIndex)}
              aria-label={`${row.name} divider after column ${dividerIndex + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternRowView({
  canRemove,
  dragHandlers,
  index,
  isDragging,
  isDropTarget,
  pattern,
  placementMode,
  row,
  rowHandlers
}: {
  canRemove: boolean;
  dragHandlers: RowDragHandlers;
  index: number;
  isDragging: boolean;
  isDropTarget: boolean;
  pattern: PatternData;
  placementMode: PlacementMode;
  row: PatternRow;
  rowHandlers: RowHandlers;
}) {
  return (
    <div
      className={`pattern-row${isDragging ? " dragging" : ""}${isDropTarget ? " drop-target" : ""}`}
      onDragOver={(event) => dragHandlers.onDragOver(event, row.id)}
      onDrop={(event) => dragHandlers.onDrop(event, index)}
    >
      <RowDragHandle
        row={row}
        onDragStart={dragHandlers.onDragStart}
        onDragEnd={dragHandlers.onDragEnd}
      />
      <RowLabel row={row} rowHandlers={rowHandlers} />
      <GridCells pattern={pattern} placementMode={placementMode} row={row} rowHandlers={rowHandlers} />
      <RowActions canRemove={canRemove} row={row} rowHandlers={rowHandlers} />
    </div>
  );
}

function AddRowControl({ onAddRow }: { onAddRow: () => void }) {
  return (
    <div className="add-row-row">
      <div className="add-row-drag-spacer" />
      <div className="add-row-spacer" />
      <button className="add-row-button" type="button" onClick={onAddRow} title="Add row" aria-label="Add row">
        <Plus size={15} />
      </button>
      <div className="add-row-action-spacer" />
    </div>
  );
}

function PatternGrid({
  pattern,
  placementMode,
  onAddRow,
  rowHandlers
}: {
  pattern: PatternData;
  placementMode: PlacementMode;
  onAddRow: () => void;
  rowHandlers: RowHandlers;
}) {
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  function clearDragState(): void {
    setDraggedRowId(null);
    setDropTargetId(null);
  }

  const dragHandlers: RowDragHandlers = {
    onDragStart: (event, row) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.id);
      const rowElement = event.currentTarget.closest<HTMLElement>(".pattern-row");
      if (rowElement) event.dataTransfer.setDragImage(rowElement, 14, 14);
      setDraggedRowId(row.id);
    },
    onDragEnd: clearDragState,
    onDragOver: (event, rowId) => {
      if (!draggedRowId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDropTargetId(draggedRowId === rowId ? null : rowId);
    },
    onDrop: (event, targetIndex) => {
      event.preventDefault();
      const rowId = draggedRowId ?? event.dataTransfer.getData("text/plain");
      if (rowId) rowHandlers.moveRow(rowId, targetIndex);
      clearDragState();
    }
  };

  return (
    <div className="pattern-card">
      <HeaderRow header={pattern.header} stepsPerBeat={pattern.stepsPerBeat} />
      {pattern.rows.map((row, index) => (
        <PatternRowView
          canRemove={pattern.rowCount > 1}
          dragHandlers={dragHandlers}
          index={index}
          isDragging={draggedRowId === row.id}
          isDropTarget={dropTargetId === row.id}
          key={row.id}
          pattern={pattern}
          placementMode={placementMode}
          row={row}
          rowHandlers={rowHandlers}
        />
      ))}
      <AddRowControl onAddRow={onAddRow} />
    </div>
  );
}

export function PatternEditor({
  pattern,
  placementMode,
  selectedSymbolId,
  onAddRow,
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
        <PaintControls
          pattern={pattern}
          placementMode={placementMode}
          selectedSymbolId={selectedSymbolId}
          onSelectPlacementMode={onSelectPlacementMode}
          onSelectShape={onSelectShape}
        />
        <PatternGrid
          pattern={pattern}
          placementMode={placementMode}
          onAddRow={onAddRow}
          rowHandlers={rowHandlers}
        />
      </div>
    </section>
  );
}
