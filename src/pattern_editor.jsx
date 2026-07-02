import { BetweenVerticalStart, Eraser, Plus, SquareDot, Trash2 } from "lucide-react";
import { getSymbolColor } from "./color";

function ShapeMark({ color, pattern, shapeId }) {
  if (shapeId === pattern.emptySymbolId) return null;
  const shape = pattern.getSymbol(shapeId);
  if (!shape) return null;
  return <span className={`symbol ${shape.mark}`} style={{ "--symbol-color": getSymbolColor(color) }} />;
}

function PlacementButton({ active, icon, label, mode, onSelect }) {
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

function PaintControls({ pattern, runtime, onSelectPlacementMode, onSelectShape }) {
  return (
    <div className="pattern-tools" aria-label="Paint tools">
      <div className="pattern-tools-cluster">
        {pattern.symbols.map((shape) => (
          <button
            className={shape.id === runtime.selectedSymbolId ? "swatch active" : "swatch"}
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
            active={runtime.placementMode === "cells"}
            icon={<SquareDot size={17} />}
            label="Place marks in cells"
            mode="cells"
            onSelect={onSelectPlacementMode}
          />
          <PlacementButton
            active={runtime.placementMode === "lines"}
            icon={<BetweenVerticalStart size={17} />}
            label="Place marks between cells"
            mode="lines"
            onSelect={onSelectPlacementMode}
          />
        </div>
        <span className="tool-divider" aria-hidden="true" />
        <button
          className={runtime.selectedSymbolId === pattern.emptySymbolId ? "swatch active" : "swatch"}
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

function HeaderRow({ header, stepsPerBeat }) {
  return (
    <div className="header-row">
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

function RowLabel({ row, rowHandlers }) {
  return (
    <div className="row-label" style={{ "--row-color": row.color }}>
      <input
        aria-label="Row name"
        value={row.name}
        onChange={(event) => rowHandlers.updateName(row.id, event.target.value)}
      />
    </div>
  );
}

function RowActions({ canRemove, row, rowHandlers }) {
  return (
    <div className="row-actions">
      <label className="row-color-control" title="Row color">
        <span style={{ "--row-chip-color": row.color }} />
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

function GridCells({ pattern, placementMode, row, rowHandlers }) {
  return (
    <div className={`cell-strip grid-cells placement-${placementMode}`}>
      {row.cells.map((cell, cellIndex) => {
        const hasMark = row.hasMarkAtCell(cellIndex);

        return (
          <button
            className={hasMark ? "grid-cell occupied" : "grid-cell"}
            disabled={placementMode !== "cells"}
            key={`${row.id}-${cellIndex}`}
            type="button"
            onClick={() => rowHandlers.paintCell(row.id, cellIndex)}
            aria-label={`${row.name} column ${cellIndex + 1}`}
          >
            <ShapeMark color={row.color} pattern={pattern} shapeId={cell} />
          </button>
        );
      })}
      <div className="divider-layer" aria-hidden={placementMode !== "lines"}>
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
              disabled={placementMode !== "lines"}
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

function PatternRow({ canRemove, pattern, placementMode, row, rowHandlers }) {
  return (
    <div className="pattern-row">
      <RowLabel row={row} rowHandlers={rowHandlers} />
      <GridCells pattern={pattern} placementMode={placementMode} row={row} rowHandlers={rowHandlers} />
      <RowActions canRemove={canRemove} row={row} rowHandlers={rowHandlers} />
    </div>
  );
}

function AddRowControl({ onAddRow }) {
  return (
    <div className="add-row-row">
      <div className="add-row-spacer" />
      <button className="add-row-button" type="button" onClick={onAddRow} title="Add row" aria-label="Add row">
        <Plus size={15} />
      </button>
      <div className="add-row-action-spacer" />
    </div>
  );
}

function PatternGrid({ pattern, placementMode, onAddRow, rowHandlers }) {
  return (
    <div className="pattern-card">
      <HeaderRow header={pattern.header} stepsPerBeat={pattern.stepsPerBeat} />
      {pattern.rows.map((row) => (
        <PatternRow
          canRemove={pattern.rowCount > 1}
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
  runtime,
  onAddRow,
  onSelectPlacementMode,
  onSelectShape,
  rowHandlers
}) {
  const { layout } = pattern;
  return (
    <section className="canvas-area">
      <div
        className="pattern-stage"
        style={{
          "--columns": pattern.columnCount,
          "--cell-size": `${layout.cellSize}px`,
          "--grid-gap": `${layout.gridGap}px`,
          "--add-row-height": `${layout.addRowHeight}px`,
          "--row-action-width": `${layout.rowActionWidth}px`,
          "--header-height": `${layout.headerHeight}px`,
          "--row-label-width": `${layout.rowLabelWidth}px`,
          "--row-gap": `${layout.rowGap}px`,
          "--row-height": `${layout.rowHeight}px`
        }}
      >
        <PaintControls
          pattern={pattern}
          runtime={runtime}
          onSelectPlacementMode={onSelectPlacementMode}
          onSelectShape={onSelectShape}
        />
        <PatternGrid
          pattern={pattern}
          placementMode={runtime.placementMode}
          onAddRow={onAddRow}
          rowHandlers={rowHandlers}
        />
      </div>
    </section>
  );
}
