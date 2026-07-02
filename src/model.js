const DEFAULT_BEATS_PER_BAR = 4;
const DEFAULT_STEPS_PER_BEAT = 4;
const MAX_BARS = 4;
const MAX_BEATS_PER_BAR = 8;

const EMPTY_SYMBOL_ID = "empty";
const DEFAULT_SYMBOL_ID = "dot";
const DEFAULT_PLACEMENT_MODE = "cells";
const DEFAULT_EXPORT_FORMAT = "svg";

const SYMBOLS = Object.freeze([
  Object.freeze({ id: "dot", label: "Filled circle", mark: "dot" }),
  Object.freeze({ id: "ring", label: "Hollow circle", mark: "ring" }),
  Object.freeze({ id: "diamond", label: "Filled diamond", mark: "diamond" }),
  Object.freeze({ id: "hollow-diamond", label: "Hollow diamond", mark: "hollow-diamond" })
]);

const SYMBOL_BY_ID = new Map(SYMBOLS.map((symbol) => [symbol.id, symbol]));
const ROW_COLORS = Object.freeze(["#fcca96", "#ae99c9", "#c7dfa0", "#d9d9d9", "#fcca96", "#ae99c9", "#c7dfa0"]);
const BAR_OPTIONS = Object.freeze(Array.from({ length: MAX_BARS }, (_, index) => index + 1));
const BEAT_OPTIONS = Object.freeze(Array.from({ length: MAX_BEATS_PER_BAR }, (_, index) => index + 1));
const STEPS_PER_BEAT_OPTIONS = Object.freeze([
  Object.freeze({ id: 1, label: "1", tokens: Object.freeze([""]) }),
  Object.freeze({ id: 2, label: "2", tokens: Object.freeze(["", "&"]) }),
  Object.freeze({ id: 4, label: "4", tokens: Object.freeze(["", "e", "&", "a"]) })
]);

const LAYOUT = Object.freeze({
  cellSize: 28,
  gridGap: 2,
  rowLabelWidth: 82,
  rowActionWidth: 58,
  rowGap: 3,
  headerHeight: 28,
  rowHeight: 28,
  addRowHeight: 36
});

function resizeMarks(marks, length) {
  return marks.length > length
    ? marks.slice(0, length)
    : [...marks, ...Array(length - marks.length).fill(EMPTY_SYMBOL_ID)];
}

export class PatternRow {
  constructor({ id, name, color, cells, dividers }) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.cells = Object.freeze([...cells]);
    this.dividers = Object.freeze([...dividers]);
    Object.freeze(this);
  }

  resize(columnCount) {
    return new PatternRow({
      ...this,
      cells: resizeMarks(this.cells, columnCount),
      dividers: resizeMarks(this.dividers, Math.max(0, columnCount - 1))
    });
  }

  paint(collection, index, symbolId) {
    const marks = this[collection];
    if (!marks || index < 0 || index >= marks.length) return this;
    const nextMarks = [...marks];
    nextMarks[index] = symbolId;
    return new PatternRow({ ...this, [collection]: nextMarks });
  }

  rename(name) {
    return new PatternRow({ ...this, name });
  }

  recolor(color) {
    return new PatternRow({ ...this, color });
  }

  clear() {
    return new PatternRow({
      ...this,
      cells: Array(this.cells.length).fill(EMPTY_SYMBOL_ID),
      dividers: Array(this.dividers.length).fill(EMPTY_SYMBOL_ID)
    });
  }

  hasMarkAtCell(index) {
    return [this.cells[index], this.dividers[index - 1], this.dividers[index]]
      .some((symbolId) => symbolId && symbolId !== EMPTY_SYMBOL_ID);
  }
}

export class PatternData {
  constructor({
    bars = 1,
    beatsPerBar = DEFAULT_BEATS_PER_BAR,
    stepsPerBeat = DEFAULT_STEPS_PER_BEAT,
    rows,
    nextRowId = 1
  }) {
    this.bars = bars;
    this.beatsPerBar = beatsPerBar;
    this.stepsPerBeat = stepsPerBeat;
    this.rows = Object.freeze(rows.map((row) => row instanceof PatternRow ? row : new PatternRow(row)));
    this.rowCount = this.rows.length;
    this.nextRowId = nextRowId;
    this.columnCount = bars * beatsPerBar * stepsPerBeat;
    this.header = Object.freeze(this.#createHeader());
    this.symbols = SYMBOLS;
    this.rowColors = ROW_COLORS;
    this.barOptions = BAR_OPTIONS;
    this.beatOptions = BEAT_OPTIONS;
    this.stepsPerBeatOptions = STEPS_PER_BEAT_OPTIONS;
    this.layout = LAYOUT;
    this.emptySymbolId = EMPTY_SYMBOL_ID;
    Object.freeze(this);
  }

  static createDefault() {
    const columnCount = DEFAULT_BEATS_PER_BAR * DEFAULT_STEPS_PER_BEAT;
    const rows = ["Hi Hat", "Snare", "Kick"].map((name, index) => new PatternRow({
      id: `starter-row-${index}`,
      name,
      color: ROW_COLORS[index],
      cells: Array(columnCount).fill(EMPTY_SYMBOL_ID),
      dividers: Array(columnCount - 1).fill(EMPTY_SYMBOL_ID)
    }));
    return new PatternData({ rows });
  }

  getSymbol(symbolId) {
    return SYMBOL_BY_ID.get(symbolId) ?? null;
  }

  hasSymbol(symbolId) {
    return symbolId === EMPTY_SYMBOL_ID || SYMBOL_BY_ID.has(symbolId);
  }

  withBars(bars) {
    return this.#withGridShape(bars, this.beatsPerBar, this.stepsPerBeat);
  }

  withBeatsPerBar(beatsPerBar) {
    return this.#withGridShape(this.bars, beatsPerBar, this.stepsPerBeat);
  }

  withStepsPerBeat(stepsPerBeat) {
    return this.#withGridShape(this.bars, this.beatsPerBar, stepsPerBeat);
  }

  paintCell(rowId, index, symbolId) {
    if (!this.hasSymbol(symbolId)) return this;
    return this.#updateRow(rowId, (row) => row.paint("cells", index, symbolId));
  }

  paintDivider(rowId, index, symbolId) {
    if (!this.hasSymbol(symbolId)) return this;
    return this.#updateRow(rowId, (row) => row.paint("dividers", index, symbolId));
  }

  renameRow(rowId, name) {
    return this.#updateRow(rowId, (row) => row.rename(name));
  }

  recolorRow(rowId, color) {
    return this.#updateRow(rowId, (row) => row.recolor(color));
  }

  addRow() {
    const row = new PatternRow({
      id: `row-${this.nextRowId}`,
      name: `Row ${this.rows.length + 1}`,
      color: ROW_COLORS[this.rows.length % ROW_COLORS.length],
      cells: Array(this.columnCount).fill(EMPTY_SYMBOL_ID),
      dividers: Array(Math.max(0, this.columnCount - 1)).fill(EMPTY_SYMBOL_ID)
    });
    return this.#copy({ rows: [...this.rows, row], nextRowId: this.nextRowId + 1 });
  }

  removeRow(rowId) {
    if (this.rows.length <= 1) return this;
    const rows = this.rows.filter((row) => row.id !== rowId);
    return rows.length === this.rows.length ? this : this.#copy({ rows });
  }

  clear() {
    return this.#copy({ rows: this.rows.map((row) => row.clear()) });
  }

  #createHeader() {
    const option = STEPS_PER_BEAT_OPTIONS.find((item) => item.id === this.stepsPerBeat)
      ?? STEPS_PER_BEAT_OPTIONS.at(-1);
    return Array.from({ length: this.columnCount }, (_, index) => {
      const beat = (Math.floor(index / this.stepsPerBeat) % this.beatsPerBar) + 1;
      return option.tokens[index % this.stepsPerBeat] || `${beat}`;
    });
  }

  #withGridShape(bars, beatsPerBar, stepsPerBeat) {
    const nextBars = Math.min(MAX_BARS, Math.max(1, bars));
    const nextBeatsPerBar = Math.min(MAX_BEATS_PER_BAR, Math.max(1, beatsPerBar));
    const nextStepsPerBeat = STEPS_PER_BEAT_OPTIONS.some((option) => option.id === stepsPerBeat)
      ? stepsPerBeat
      : DEFAULT_STEPS_PER_BEAT;
    const columnCount = nextBars * nextBeatsPerBar * nextStepsPerBeat;
    return this.#copy({
      bars: nextBars,
      beatsPerBar: nextBeatsPerBar,
      stepsPerBeat: nextStepsPerBeat,
      rows: this.rows.map((row) => row.resize(columnCount))
    });
  }

  #updateRow(rowId, update) {
    let changed = false;
    const rows = this.rows.map((row) => {
      if (row.id !== rowId) return row;
      changed = true;
      return update(row);
    });
    return changed ? this.#copy({ rows }) : this;
  }

  #copy(overrides) {
    return new PatternData({
      bars: this.bars,
      beatsPerBar: this.beatsPerBar,
      stepsPerBeat: this.stepsPerBeat,
      rows: this.rows,
      nextRowId: this.nextRowId,
      ...overrides
    });
  }
}

export class RuntimeData {
  constructor({
    selectedSymbolId = DEFAULT_SYMBOL_ID,
    placementMode = DEFAULT_PLACEMENT_MODE,
    exportFormat = DEFAULT_EXPORT_FORMAT,
    exportError = "",
    isExportDialogOpen = false,
    isExporting = false
  } = {}) {
    this.selectedSymbolId = selectedSymbolId;
    this.placementMode = placementMode;
    this.exportFormat = exportFormat;
    this.exportError = exportError;
    this.isExportDialogOpen = isExportDialogOpen;
    this.isExporting = isExporting;
    Object.freeze(this);
  }

  selectSymbol(selectedSymbolId) {
    return this.#copy({ selectedSymbolId });
  }

  selectPlacementMode(placementMode) {
    return ["cells", "lines"].includes(placementMode) ? this.#copy({ placementMode }) : this;
  }

  selectExportFormat(exportFormat) {
    return ["svg", "pdf"].includes(exportFormat) ? this.#copy({ exportFormat }) : this;
  }

  openExportDialog() {
    return this.#copy({ exportError: "", isExportDialogOpen: true });
  }

  closeExportDialog() {
    return this.isExporting ? this : this.#copy({ exportError: "", isExportDialogOpen: false });
  }

  startExport() {
    return this.#copy({ exportError: "", isExporting: true });
  }

  finishExport(saved) {
    return this.#copy({ isExporting: false, isExportDialogOpen: saved ? false : this.isExportDialogOpen });
  }

  failExport(message) {
    return this.#copy({ exportError: message, isExporting: false });
  }

  #copy(overrides) {
    return new RuntimeData({ ...this, ...overrides });
  }
}

export class EditorModel {
  constructor(pattern, runtime) {
    this.pattern = pattern;
    this.runtime = runtime;
    Object.freeze(this);
  }

  static createDefault() {
    return new EditorModel(PatternData.createDefault(), new RuntimeData());
  }

  withBars(bars) { return this.#withPattern(this.pattern.withBars(bars)); }
  withBeatsPerBar(beatsPerBar) { return this.#withPattern(this.pattern.withBeatsPerBar(beatsPerBar)); }
  withStepsPerBeat(stepsPerBeat) { return this.#withPattern(this.pattern.withStepsPerBeat(stepsPerBeat)); }
  addRow() { return this.#withPattern(this.pattern.addRow()); }
  removeRow(rowId) { return this.#withPattern(this.pattern.removeRow(rowId)); }
  renameRow(rowId, name) { return this.#withPattern(this.pattern.renameRow(rowId, name)); }
  recolorRow(rowId, color) { return this.#withPattern(this.pattern.recolorRow(rowId, color)); }
  clearPattern() { return this.#withPattern(this.pattern.clear()); }

  paintCell(rowId, index) {
    return this.#withPattern(this.pattern.paintCell(rowId, index, this.runtime.selectedSymbolId));
  }

  paintDivider(rowId, index) {
    return this.#withPattern(this.pattern.paintDivider(rowId, index, this.runtime.selectedSymbolId));
  }

  selectSymbol(symbolId) {
    return this.pattern.hasSymbol(symbolId) ? this.#withRuntime(this.runtime.selectSymbol(symbolId)) : this;
  }

  selectPlacementMode(mode) { return this.#withRuntime(this.runtime.selectPlacementMode(mode)); }
  selectExportFormat(format) { return this.#withRuntime(this.runtime.selectExportFormat(format)); }
  openExportDialog() { return this.#withRuntime(this.runtime.openExportDialog()); }
  closeExportDialog() { return this.#withRuntime(this.runtime.closeExportDialog()); }
  startExport() { return this.#withRuntime(this.runtime.startExport()); }
  finishExport(saved) { return this.#withRuntime(this.runtime.finishExport(saved)); }
  failExport(message) { return this.#withRuntime(this.runtime.failExport(message)); }

  #withPattern(pattern) {
    return pattern === this.pattern ? this : new EditorModel(pattern, this.runtime);
  }

  #withRuntime(runtime) {
    return runtime === this.runtime ? this : new EditorModel(this.pattern, runtime);
  }
}
