import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BetweenVerticalStart,
  Download,
  Eraser,
  Grid2X2,
  Plus,
  RotateCcw,
  SquareDot,
  Trash2
} from "lucide-react";
import "./styles.css";
import { getSymbolColor } from "./color";
import { ExportDialog } from "./export_dialog";
import { EditorModel } from "./model";
import { PatternExporter } from "./pattern_export";

function ShapeMark({ color, pattern, shapeId }) {
  if (shapeId === pattern.emptySymbolId) return null;
  const shape = pattern.getSymbol(shapeId);
  if (!shape) return null;
  return <span className={`symbol ${shape.mark}`} style={{ "--symbol-color": getSymbolColor(color) }} />;
}

function Brand() {
  return (
    <div className="brand">
      <Grid2X2 size={22} />
      <h1>Drum Pattern Editor</h1>
    </div>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="39" height="39" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

function BuyMeACoffeeMark() {
  return (
    <svg viewBox="0 0 24 24" width="39" height="39" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 5.5h12.5v2H19a3.5 3.5 0 0 1 0 7h-1.68A6.5 6.5 0 0 1 5 12V5.5Zm12.5 4V12c0 .17-.01.34-.02.5H19a1.5 1.5 0 0 0 0-3h-1.5ZM7 7.5V12a4.5 4.5 0 0 0 9 0V7.5H7Zm-1 10h12a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2ZM9 1.5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function RhythmControls({ pattern, onBarsChange, onBeatsPerBarChange, onStepsPerBeatChange }) {
  return (
    <div className="control-group" aria-label="Rhythm settings">
      <label>
        Bars
        <select value={pattern.bars} onChange={(event) => onBarsChange(Number(event.target.value))}>
          {pattern.barOptions.map((barCount) => (
            <option key={barCount} value={barCount}>
              {barCount}
            </option>
          ))}
        </select>
      </label>
      <label>
        Beats
        <select value={pattern.beatsPerBar} onChange={(event) => onBeatsPerBarChange(Number(event.target.value))}>
          {pattern.beatOptions.map((beatCount) => (
            <option key={beatCount} value={beatCount}>
              {beatCount}
            </option>
          ))}
        </select>
      </label>
      <label>
        Steps per beat
        <select value={pattern.stepsPerBeat} onChange={(event) => onStepsPerBeatChange(Number(event.target.value))}>
          {pattern.stepsPerBeatOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
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
          <button
            className={runtime.placementMode === "cells" ? "placement-option active" : "placement-option"}
            type="button"
            aria-pressed={runtime.placementMode === "cells"}
            aria-label="Place marks in cells"
            title="Place marks in cells"
            onClick={() => onSelectPlacementMode("cells")}
          >
            <SquareDot size={17} />
          </button>
          <button
            className={runtime.placementMode === "lines" ? "placement-option active" : "placement-option"}
            type="button"
            aria-pressed={runtime.placementMode === "lines"}
            aria-label="Place marks between cells"
            title="Place marks between cells"
            onClick={() => onSelectPlacementMode("lines")}
          >
            <BetweenVerticalStart size={17} />
          </button>
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

function ActionBar({ onClearGrid, onOpenExport }) {
  return (
    <div className="actions">
      <button type="button" onClick={onOpenExport} title="Export diagram">
        <Download size={18} />
        Export…
      </button>
      <button type="button" onClick={onClearGrid} title="Clear grid">
        <RotateCcw size={18} />
        Clear
      </button>
    </div>
  );
}

function EditorToolbar({
  pattern,
  onBarsChange,
  onBeatsPerBarChange,
  onClearGrid,
  onOpenExport,
  onStepsPerBeatChange
}) {
  return (
    <section className="editor-toolbar" aria-label="Pattern controls">
      <div className="editor-topbar">
        <Brand />
        <ActionBar onClearGrid={onClearGrid} onOpenExport={onOpenExport} />
      </div>
      <div className="editor-ribbon">
        <RhythmControls
          pattern={pattern}
          onBarsChange={onBarsChange}
          onBeatsPerBarChange={onBeatsPerBarChange}
          onStepsPerBeatChange={onStepsPerBeatChange}
        />
      </div>
    </section>
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
  const symbolColor = row.color;

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
            <ShapeMark color={symbolColor} pattern={pattern} shapeId={cell} />
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
              <ShapeMark color={symbolColor} pattern={pattern} shapeId={divider} />
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
      <RowLabel
        row={row}
        rowHandlers={rowHandlers}
      />
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

function PatternGrid({
  pattern,
  placementMode,
  onAddRow,
  rowHandlers
}) {
  return (
    <div className="pattern-card" style={{ "--columns": pattern.columnCount }}>
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

function PatternEditor({
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

function App() {
  const [model, setModel] = useState(() => EditorModel.createDefault());
  const { pattern, runtime } = model;

  function updateModel(update) {
    setModel((current) => update(current));
  }

  async function exportDiagram() {
    const patternToExport = pattern;
    const formatToExport = runtime.exportFormat;
    updateModel((current) => current.startExport());

    try {
      const exporter = PatternExporter.create(formatToExport, patternToExport);
      const saved = await exporter.export();
      updateModel((current) => current.finishExport(saved));
    } catch (error) {
      console.error(error);
      updateModel((current) => current.failExport("The diagram could not be exported. Please try again."));
    }
  }

  const rowHandlers = {
    paintCell: (rowId, index) => updateModel((current) => current.paintCell(rowId, index)),
    paintDivider: (rowId, index) => updateModel((current) => current.paintDivider(rowId, index)),
    removeRow: (rowId) => updateModel((current) => current.removeRow(rowId)),
    updateColor: (rowId, color) => updateModel((current) => current.recolorRow(rowId, color)),
    updateName: (rowId, name) => updateModel((current) => current.renameRow(rowId, name))
  };

  return (
    <main className="app-shell">
      <EditorToolbar
        pattern={pattern}
        onBarsChange={(bars) => updateModel((current) => current.withBars(bars))}
        onBeatsPerBarChange={(beats) => updateModel((current) => current.withBeatsPerBar(beats))}
        onClearGrid={() => updateModel((current) => current.clearPattern())}
        onOpenExport={() => updateModel((current) => current.openExportDialog())}
        onStepsPerBeatChange={(steps) => updateModel((current) => current.withStepsPerBeat(steps))}
      />
      <PatternEditor
        pattern={pattern}
        runtime={runtime}
        onAddRow={() => updateModel((current) => current.addRow())}
        onSelectPlacementMode={(mode) => updateModel((current) => current.selectPlacementMode(mode))}
        onSelectShape={(symbolId) => updateModel((current) => current.selectSymbol(symbolId))}
        rowHandlers={rowHandlers}
      />
      <ExportDialog
        error={runtime.exportError}
        format={runtime.exportFormat}
        isExporting={runtime.isExporting}
        isOpen={runtime.isExportDialogOpen}
        onClose={() => updateModel((current) => current.closeExportDialog())}
        onExport={exportDiagram}
        onFormatChange={(format) => updateModel((current) => current.selectExportFormat(format))}
      />
      <div className="footer-links">
        <a
          className="footer-link"
          href="https://buymeacoffee.com/dobaksz"
          target="_blank"
          rel="noreferrer"
          aria-label="Buy me a coffee"
          title="Buy me a coffee"
        >
          <BuyMeACoffeeMark />
        </a>
        <a
          className="footer-link"
          href="https://github.com/dobaksz/drum-pattern-editor"
          target="_blank"
          rel="noreferrer"
          aria-label="View this project on GitHub"
          title="View on GitHub"
        >
          <GitHubMark />
        </a>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
