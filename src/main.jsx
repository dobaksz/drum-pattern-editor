import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Download,
  Grid2X2,
  MousePointer2,
  Plus,
  RotateCcw,
  Trash2
} from "lucide-react";
import "./styles.css";
import { createPatternSvg } from "./svgExport";

const DEFAULT_BEATS_PER_BAR = 4;
const DEFAULT_STEPS_PER_BEAT = 4;
const MAX_BARS = 4;
const MAX_BEATS_PER_BAR = 8;
const CELL_SIZE = 28;
const GRID_GAP = 2;
const ROW_LABEL_WIDTH = 82;
const ROW_ACTION_WIDTH = 58;
const ROW_GAP = 3;
const HEADER_HEIGHT = 28;
const ROW_HEIGHT = 28;
const ADD_ROW_HEIGHT = 36;

const shapeOptions = [
  { id: "dot", label: "Filled circle", mark: "dot" },
  { id: "ring", label: "Hollow circle", mark: "ring" },
  { id: "diamond", label: "Filled diamond", mark: "diamond" },
  { id: "hollow-diamond", label: "Hollow diamond", mark: "hollow-diamond" }
];

const shapeById = Object.fromEntries(shapeOptions.map((shape) => [shape.id, shape]));

const rowColors = ["#fcca96", "#ae99c9", "#c7dfa0", "#d9d9d9", "#fcca96", "#ae99c9", "#c7dfa0"];
const barOptions = Array.from({ length: MAX_BARS }, (_, index) => index + 1);
const beatOptions = Array.from({ length: MAX_BEATS_PER_BAR }, (_, index) => index + 1);

const stepsPerBeatOptions = [
  { id: 1, label: "1", tokens: [""] },
  { id: 2, label: "2", tokens: ["", "&"] },
  { id: 4, label: "4", tokens: ["", "e", "&", "a"] }
];

const starterRows = ["Hi Hat", "Snare", "Kick"].map((name, index) => ({
  id: `starter-row-${index}`,
  name,
  color: rowColors[index],
  cells: Array(DEFAULT_BEATS_PER_BAR * DEFAULT_STEPS_PER_BEAT).fill("empty")
}));

function ShapeMark({ color, shapeId }) {
  if (shapeId === "empty") return null;
  const shape = shapeById[shapeId];
  if (!shape) return null;
  return <span className={`symbol ${shape.mark}`} style={{ "--symbol-color": color }} />;
}

function Brand() {
  return (
    <div className="brand">
      <Grid2X2 size={22} />
      <h1>Drum Pattern Editor</h1>
    </div>
  );
}

function RhythmControls({
  bars,
  beatsPerBar,
  stepsPerBeat,
  onBarsChange,
  onBeatsPerBarChange,
  onStepsPerBeatChange
}) {
  return (
    <div className="control-group rhythm-controls" aria-label="Rhythm settings">
      <label>
        Bars
        <select value={bars} onChange={(event) => onBarsChange(Number(event.target.value))}>
          {barOptions.map((barCount) => (
            <option key={barCount} value={barCount}>
              {barCount}
            </option>
          ))}
        </select>
      </label>
      <label>
        Beats
        <select value={beatsPerBar} onChange={(event) => onBeatsPerBarChange(Number(event.target.value))}>
          {beatOptions.map((beatCount) => (
            <option key={beatCount} value={beatCount}>
              {beatCount}
            </option>
          ))}
        </select>
      </label>
      <label>
        Steps per beat
        <select value={stepsPerBeat} onChange={(event) => onStepsPerBeatChange(Number(event.target.value))}>
          {stepsPerBeatOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function PaintControls({ selectedShape, onSelectShape }) {
  return (
    <div className="pattern-tools" aria-label="Paint tools">
      <div className="pattern-tools-cluster">
        {shapeOptions.map((shape) => (
          <button
            className={shape.id === selectedShape ? "swatch active" : "swatch"}
            key={shape.id}
            title={shape.label}
            type="button"
            onClick={() => onSelectShape(shape.id)}
          >
            <ShapeMark color="#555555" shapeId={shape.id} />
          </button>
        ))}
        <span className="tool-divider" aria-hidden="true" />
        <button
          className={selectedShape === "empty" ? "swatch active" : "swatch"}
          title="Erase"
          type="button"
          onClick={() => onSelectShape("empty")}
        >
          <MousePointer2 size={16} />
        </button>
      </div>
    </div>
  );
}

function ActionBar({ onClearGrid, onExportSvg }) {
  return (
    <div className="actions">
      <button type="button" onClick={() => void onExportSvg()} title="Export SVG">
        <Download size={18} />
        SVG
      </button>
      <button type="button" onClick={onClearGrid} title="Clear grid">
        <RotateCcw size={18} />
        Clear
      </button>
    </div>
  );
}

function EditorToolbar({
  bars,
  beatsPerBar,
  stepsPerBeat,
  onBarsChange,
  onBeatsPerBarChange,
  onClearGrid,
  onExportSvg,
  onStepsPerBeatChange
}) {
  return (
    <section className="editor-toolbar" aria-label="Pattern controls">
      <div className="editor-topbar">
        <Brand />
        <ActionBar onClearGrid={onClearGrid} onExportSvg={onExportSvg} />
      </div>
      <div className="editor-ribbon">
        <RhythmControls
          bars={bars}
          beatsPerBar={beatsPerBar}
          stepsPerBeat={stepsPerBeat}
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

function GridCells({ row, rowHandlers }) {
  const symbolColor = row.color;

  return (
    <div className="cell-strip">
      {row.cells.map((cell, cellIndex) => (
        <button
          className="grid-cell"
          key={`${row.id}-${cellIndex}`}
          type="button"
          onClick={() => rowHandlers.paintCell(row.id, cellIndex)}
          aria-label={`${row.name} column ${cellIndex + 1}`}
        >
          <ShapeMark color={symbolColor} shapeId={cell} />
        </button>
      ))}
    </div>
  );
}

function PatternRow({ canRemove, row, rowHandlers }) {
  return (
    <div className="pattern-row">
      <RowLabel
        row={row}
        rowHandlers={rowHandlers}
      />
      <GridCells row={row} rowHandlers={rowHandlers} />
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
  columnCount,
  header,
  rows,
  stepsPerBeat,
  onAddRow,
  rowHandlers
}) {
  return (
    <div className="pattern-card" style={{ "--columns": columnCount }}>
      <HeaderRow header={header} stepsPerBeat={stepsPerBeat} />
      {rows.map((row) => (
        <PatternRow
          canRemove={rows.length > 1}
          key={row.id}
          row={row}
          rowHandlers={rowHandlers}
        />
      ))}
      <AddRowControl onAddRow={onAddRow} />
    </div>
  );
}

function PatternEditor({
  columnCount,
  header,
  rows,
  selectedShape,
  stepsPerBeat,
  onAddRow,
  onSelectShape,
  rowHandlers
}) {
  return (
    <section className="canvas-area">
      <div
        className="pattern-stage"
        style={{
          "--columns": columnCount,
          "--cell-size": `${CELL_SIZE}px`,
          "--grid-gap": `${GRID_GAP}px`,
          "--add-row-height": `${ADD_ROW_HEIGHT}px`,
          "--row-action-width": `${ROW_ACTION_WIDTH}px`,
          "--header-height": `${HEADER_HEIGHT}px`,
          "--row-label-width": `${ROW_LABEL_WIDTH}px`,
          "--row-gap": `${ROW_GAP}px`,
          "--row-height": `${ROW_HEIGHT}px`
        }}
      >
        <PaintControls selectedShape={selectedShape} onSelectShape={onSelectShape} />
        <div className="pattern-zoom">
          <PatternGrid
            columnCount={columnCount}
            header={header}
            rows={rows}
            stepsPerBeat={stepsPerBeat}
            onAddRow={onAddRow}
            rowHandlers={rowHandlers}
          />
        </div>
      </div>
    </section>
  );
}

function App() {
  const [bars, setBars] = useState(1);
  const [beatsPerBar, setBeatsPerBar] = useState(DEFAULT_BEATS_PER_BAR);
  const [stepsPerBeat, setStepsPerBeat] = useState(DEFAULT_STEPS_PER_BEAT);
  const [rows, setRows] = useState(starterRows);
  const [selectedShape, setSelectedShape] = useState("dot");
  const columnCount = beatsPerBar * bars * stepsPerBeat;
  const header = useMemo(() => {
    const option = stepsPerBeatOptions.find((item) => item.id === stepsPerBeat) ?? stepsPerBeatOptions[2];
    return Array.from({ length: columnCount }, (_, index) => {
      const beat = (Math.floor(index / stepsPerBeat) % beatsPerBar) + 1;
      const token = option.tokens[index % stepsPerBeat];
      return token || `${beat}`;
    });
  }, [beatsPerBar, columnCount, stepsPerBeat]);

  function setGridShape(nextBars, nextBeatsPerBar, nextStepsPerBeat) {
    const cappedBars = Math.min(MAX_BARS, Math.max(1, nextBars));
    const cappedBeatsPerBar = Math.min(MAX_BEATS_PER_BAR, Math.max(1, nextBeatsPerBar));
    const cappedStepsPerBeat = stepsPerBeatOptions.some((option) => option.id === nextStepsPerBeat)
      ? nextStepsPerBeat
      : DEFAULT_STEPS_PER_BEAT;
    const nextLength = cappedBeatsPerBar * cappedBars * cappedStepsPerBeat;
    setBars(cappedBars);
    setBeatsPerBar(cappedBeatsPerBar);
    setStepsPerBeat(cappedStepsPerBeat);
    setRows((current) =>
      current.map((row) => ({
        ...row,
        cells:
          row.cells.length > nextLength
            ? row.cells.slice(0, nextLength)
            : [...row.cells, ...Array(nextLength - row.cells.length).fill("empty")]
      }))
    );
  }

  function updateBars(nextBars) {
    setGridShape(nextBars, beatsPerBar, stepsPerBeat);
  }

  function updateBeatsPerBar(nextBeatsPerBar) {
    setGridShape(bars, nextBeatsPerBar, stepsPerBeat);
  }

  function updateStepsPerBeat(nextStepsPerBeat) {
    setGridShape(bars, beatsPerBar, nextStepsPerBeat);
  }

  function paintCell(rowId, cellIndex) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const cells = [...row.cells];
        cells[cellIndex] = selectedShape;
        return { ...row, cells };
      })
    );
  }

  function updateName(rowId, name) {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, name } : row)));
  }

  function updateRowColor(rowId, color) {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, color } : row)));
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: `row-${Math.max(0, ...current.map((row) => Number(row.id.replace("row-", "")) || 0)) + 1}`,
        name: `Row ${current.length + 1}`,
        color: rowColors[current.length % rowColors.length],
        cells: Array(columnCount).fill("empty")
      }
    ]);
  }

  function removeRow(rowId) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== rowId) : current));
  }

  function clearGrid() {
    setRows((current) =>
      current.map((row) => ({
        ...row,
        cells: Array(columnCount).fill("empty")
      }))
    );
  }

  async function exportSvg() {
    const svg = createPatternSvg({
      columnCount,
      header,
      layout: {
        cellSize: CELL_SIZE,
        gridGap: GRID_GAP,
        headerHeight: HEADER_HEIGHT,
        rowGap: ROW_GAP,
        rowHeight: ROW_HEIGHT,
        rowLabelWidth: ROW_LABEL_WIDTH
      },
      rows,
      shapeById,
      stepsPerBeat
    });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "drum-pattern.svg",
          types: [{ description: "SVG image", accept: { "image/svg+xml": [".svg"] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "drum-pattern.svg";
    link.target = "_blank";
    document.body.append(link);
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const rowHandlers = {
    paintCell,
    removeRow,
    updateColor: updateRowColor,
    updateName
  };

  return (
    <main className="app-shell">
      <EditorToolbar
        bars={bars}
        beatsPerBar={beatsPerBar}
        onBarsChange={updateBars}
        onBeatsPerBarChange={updateBeatsPerBar}
        onClearGrid={clearGrid}
        onExportSvg={exportSvg}
        onStepsPerBeatChange={updateStepsPerBeat}
        stepsPerBeat={stepsPerBeat}
      />
      <PatternEditor
        columnCount={columnCount}
        header={header}
        rows={rows}
        selectedShape={selectedShape}
        stepsPerBeat={stepsPerBeat}
        onAddRow={addRow}
        onSelectShape={setSelectedShape}
        rowHandlers={rowHandlers}
      />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
