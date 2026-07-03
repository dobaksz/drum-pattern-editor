import { CSSProperties, DragEvent, useState } from "react";
import { Menu, Pencil, Trash2 } from "lucide-react";
import { AddRowMenu } from "./add_row_menu";
import { PatternData } from "./pattern_data";
import { RowDetails } from "./pattern_config";
import { PatternRow } from "./pattern_row";
import { RowDetailsDialog, RowDialogRequest } from "./row_details_dialog";
import { SymbolMark } from "./symbol_mark";
import {
  BETWEEN_CELL_FRACTIONS,
  BETWEEN_CELL_POSITIONS,
  getBetweenCellPosition,
  PlacementMode
} from "./types";

export interface PatternRowHandlers {
  addRow: (details: RowDetails) => void;
  paintMark: (rowId: string, index: number, mode: PlacementMode) => void;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, targetIndex: number) => void;
  updateDetails: (rowId: string, details: RowDetails) => void;
}

interface PatternGridProps {
  pattern: PatternData;
  placementMode: PlacementMode;
  rowHandlers: PatternRowHandlers;
}

interface DragState {
  draggedRowId: string | null;
  dropTargetId: string | null;
}

const EMPTY_DRAG_STATE: DragState = { draggedRowId: null, dropTargetId: null };

export function PatternGrid({ pattern, placementMode, rowHandlers }: PatternGridProps) {
  const [dragState, setDragState] = useState<DragState>(EMPTY_DRAG_STATE);
  const [rowDialog, setRowDialog] = useState<RowDialogRequest>(null);

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

  function saveRowDetails(details: RowDetails): void {
    if (rowDialog?.mode === "edit") {
      rowHandlers.updateDetails(rowDialog.row.id, details);
    } else {
      rowHandlers.addRow(details);
    }
    setRowDialog(null);
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
          onEdit={() => setRowDialog({ mode: "edit", row })}
        />
      ))}
      <AddRowControl
        onAddPreset={rowHandlers.addRow}
        onCreateCustom={() => setRowDialog({ mode: "create" })}
      />
      <RowDetailsDialog
        request={rowDialog}
        onClose={() => setRowDialog(null)}
        onSubmit={saveRowDetails}
      />
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
  onEdit: () => void;
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
  onDrop,
  onEdit
}: PatternRowViewProps) {
  return (
    <div
      className={`pattern-row${isDragging ? " dragging" : ""}${isDropTarget ? " drop-target" : ""}`}
      onDragOver={(event) => onDragOver(event, row.id)}
      onDrop={(event) => onDrop(event, index)}
    >
      <RowDragHandle row={row} onDragEnd={onDragEnd} onDragStart={onDragStart} />
      <RowLabel row={row} />
      <GridCells pattern={pattern} placementMode={placementMode} row={row} rowHandlers={rowHandlers} />
      <RowActions canRemove={canRemove} row={row} rowHandlers={rowHandlers} onEdit={onEdit} />
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

function RowLabel({ row }: { row: PatternRow }) {
  return (
    <div className="row-label" style={{ "--row-color": row.color } as CSSProperties} title={row.name}>
      <span>{row.name}</span>
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
  const activeBetweenPosition = getBetweenCellPosition(placementMode);
  const stride = pattern.layout.cellSize + pattern.layout.gridGap;

  return (
    <div className={`cell-strip grid-cells placement-${placementMode}`}>
      {row.cells.map((symbolId, cellIndex) => (
        <button
          className={row.hasMarkAtCell(cellIndex) ? "grid-cell occupied" : "grid-cell"}
          disabled={placementMode !== PlacementMode.CellCenter}
          key={`${row.id}-${cellIndex}`}
          type="button"
          onClick={() => rowHandlers.paintMark(row.id, cellIndex, PlacementMode.CellCenter)}
          aria-label={`${row.name} column ${cellIndex + 1}`}
        >
          <SymbolMark color={row.color} pattern={pattern} symbolId={symbolId} />
        </button>
      ))}
      <div className="between-cell-layer">
        {row.betweenCells.flatMap((marks, intervalIndex) =>
          BETWEEN_CELL_POSITIONS.map((position) => (
            <div
              className="between-cell-slot"
              key={`${row.id}-${intervalIndex}-${position}`}
              style={{
                left: `${pattern.layout.cellSize / 2
                  + (intervalIndex + BETWEEN_CELL_FRACTIONS[position]) * stride}px`
              }}
            >
              <div className="between-cell-mark" aria-hidden="true">
                <SymbolMark color={row.color} pattern={pattern} symbolId={marks[position]} />
              </div>
              <button
                className={activeBetweenPosition === position ? "between-cell-target active" : "between-cell-target"}
                disabled={activeBetweenPosition !== position}
                type="button"
                onClick={() => rowHandlers.paintMark(row.id, intervalIndex, placementMode)}
                aria-label={`${row.name}, ${position} position between columns ${intervalIndex + 1} and ${intervalIndex + 2}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RowActions({
  canRemove,
  row,
  rowHandlers,
  onEdit
}: {
  canRemove: boolean;
  row: PatternRow;
  rowHandlers: PatternRowHandlers;
  onEdit: () => void;
}) {
  return (
    <div className="row-actions">
      <button
        className="row-edit-button"
        type="button"
        aria-label={`Edit ${row.name}`}
        onClick={onEdit}
        title={`Edit ${row.name}`}
      >
        <Pencil size={14} />
      </button>
      {canRemove && (
        <button
          className="row-remove-button"
          type="button"
          aria-label={`Remove ${row.name}`}
          onClick={() => rowHandlers.removeRow(row.id)}
          title="Remove row"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function AddRowControl({
  onAddPreset,
  onCreateCustom
}: {
  onAddPreset: (details: RowDetails) => void;
  onCreateCustom: () => void;
}) {
  return (
    <div className="add-row-row">
      <div className="add-row-drag-spacer" />
      <div className="add-row-spacer" />
      <AddRowMenu onAddPreset={onAddPreset} onCreateCustom={onCreateCustom} />
      <div className="add-row-action-spacer" />
    </div>
  );
}
