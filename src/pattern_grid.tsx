import { CSSProperties, DragEvent, useState } from "react";
import { Menu, Plus, Trash2 } from "lucide-react";
import { PatternData } from "./pattern_data";
import { PatternRow } from "./pattern_row";
import { SymbolMark } from "./symbol_mark";
import { PlacementMode } from "./types";

export interface PatternRowHandlers {
  paintCell: (rowId: string, index: number) => void;
  paintDivider: (rowId: string, index: number) => void;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, targetIndex: number) => void;
  updateColor: (rowId: string, color: string) => void;
  updateName: (rowId: string, name: string) => void;
}

interface PatternGridProps {
  pattern: PatternData;
  placementMode: PlacementMode;
  onAddRow: () => void;
  rowHandlers: PatternRowHandlers;
}

interface DragState {
  draggedRowId: string | null;
  dropTargetId: string | null;
}

const EMPTY_DRAG_STATE: DragState = { draggedRowId: null, dropTargetId: null };

export function PatternGrid({ pattern, placementMode, onAddRow, rowHandlers }: PatternGridProps) {
  const [dragState, setDragState] = useState<DragState>(EMPTY_DRAG_STATE);

  function startDragging(event: DragEvent<HTMLButtonElement>, rowId: string): void {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", rowId);
    const rowElement = event.currentTarget.closest<HTMLElement>(".pattern-row");
    if (rowElement) event.dataTransfer.setDragImage(rowElement, 14, 14);
    setDragState({ draggedRowId: rowId, dropTargetId: null });
  }

  function dragOver(event: DragEvent<HTMLDivElement>, rowId: string): void {
    if (!dragState.draggedRowId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragState((current) => ({
      ...current,
      dropTargetId: current.draggedRowId === rowId ? null : rowId
    }));
  }

  function dropRow(event: DragEvent<HTMLDivElement>, targetIndex: number): void {
    event.preventDefault();
    const rowId = dragState.draggedRowId ?? event.dataTransfer.getData("text/plain");
    if (rowId) rowHandlers.moveRow(rowId, targetIndex);
    setDragState(EMPTY_DRAG_STATE);
  }

  return (
    <div className="pattern-card">
      <HeaderRow pattern={pattern} />
      {pattern.rows.map((row, index) => (
        <PatternRowView
          canRemove={pattern.rowCount > 1}
          index={index}
          isDragging={dragState.draggedRowId === row.id}
          isDropTarget={dragState.dropTargetId === row.id}
          key={row.id}
          pattern={pattern}
          placementMode={placementMode}
          row={row}
          rowHandlers={rowHandlers}
          onDragEnd={() => setDragState(EMPTY_DRAG_STATE)}
          onDragOver={dragOver}
          onDragStart={startDragging}
          onDrop={dropRow}
        />
      ))}
      <AddRowControl onAddRow={onAddRow} />
    </div>
  );
}

function HeaderRow({ pattern }: { pattern: PatternData }) {
  return (
    <div className="header-row">
      <div className="drag-corner-cell" />
      <div className="corner-cell" />
      <div className="cell-strip">
        {pattern.header.map((label, index) => (
          <div
            className={index % pattern.stepsPerBeat === 0 ? "header-cell beat" : "header-cell step"}
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

interface PatternRowViewProps {
  canRemove: boolean;
  index: number;
  isDragging: boolean;
  isDropTarget: boolean;
  pattern: PatternData;
  placementMode: PlacementMode;
  row: PatternRow;
  rowHandlers: PatternRowHandlers;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, rowId: string) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>, rowId: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, targetIndex: number) => void;
}

function PatternRowView({
  canRemove,
  index,
  isDragging,
  isDropTarget,
  pattern,
  placementMode,
  row,
  rowHandlers,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop
}: PatternRowViewProps) {
  return (
    <div
      className={`pattern-row${isDragging ? " dragging" : ""}${isDropTarget ? " drop-target" : ""}`}
      onDragOver={(event) => onDragOver(event, row.id)}
      onDrop={(event) => onDrop(event, index)}
    >
      <RowDragHandle row={row} onDragEnd={onDragEnd} onDragStart={onDragStart} />
      <RowLabel row={row} rowHandlers={rowHandlers} />
      <GridCells pattern={pattern} placementMode={placementMode} row={row} rowHandlers={rowHandlers} />
      <RowActions canRemove={canRemove} row={row} rowHandlers={rowHandlers} />
    </div>
  );
}

function RowDragHandle({
  row,
  onDragEnd,
  onDragStart
}: {
  row: PatternRow;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>, rowId: string) => void;
}) {
  return (
    <button
      className="row-drag-handle"
      draggable
      tabIndex={-1}
      type="button"
      aria-label={`Drag ${row.name} row to reorder`}
      title="Drag to reorder"
      onDragStart={(event) => onDragStart(event, row.id)}
      onDragEnd={onDragEnd}
    >
      <Menu size={16} />
    </button>
  );
}

function RowLabel({ row, rowHandlers }: { row: PatternRow; rowHandlers: PatternRowHandlers }) {
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

function GridCells({
  pattern,
  placementMode,
  row,
  rowHandlers
}: {
  pattern: PatternData;
  placementMode: PlacementMode;
  row: PatternRow;
  rowHandlers: PatternRowHandlers;
}) {
  return (
    <div className={`cell-strip grid-cells placement-${placementMode}`}>
      {row.cells.map((symbolId, cellIndex) => (
        <button
          className={row.hasMarkAtCell(cellIndex) ? "grid-cell occupied" : "grid-cell"}
          disabled={placementMode !== PlacementMode.Cells}
          key={`${row.id}-${cellIndex}`}
          type="button"
          onClick={() => rowHandlers.paintCell(row.id, cellIndex)}
          aria-label={`${row.name} column ${cellIndex + 1}`}
        >
          <SymbolMark color={row.color} pattern={pattern} symbolId={symbolId} />
        </button>
      ))}
      <div className="divider-layer" aria-hidden={placementMode !== PlacementMode.Lines}>
        {row.dividers.map((symbolId, dividerIndex) => (
          <div
            className="divider-slot"
            key={`${row.id}-divider-${dividerIndex}`}
            style={{
              left: `${(dividerIndex + 1) * (pattern.layout.cellSize + pattern.layout.gridGap)
                - pattern.layout.gridGap / 2}px`
            }}
          >
            <div className="divider-mark" aria-hidden="true">
              <SymbolMark color={row.color} pattern={pattern} symbolId={symbolId} />
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

function RowActions({
  canRemove,
  row,
  rowHandlers
}: {
  canRemove: boolean;
  row: PatternRow;
  rowHandlers: PatternRowHandlers;
}) {
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
        <button
          className="row-remove-button"
          type="button"
          onClick={() => rowHandlers.removeRow(row.id)}
          title="Remove row"
        >
          <Trash2 size={15} />
        </button>
      )}
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
