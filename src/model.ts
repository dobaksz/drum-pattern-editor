import { MarkCollection, SymbolId, SymbolShape } from "./types";

const DEFAULT_BEATS_PER_BAR = 4;
const DEFAULT_STEPS_PER_BEAT = 4;
const MAX_BARS = 4;
const MAX_BEATS_PER_BAR = 8;

export interface SymbolDefinition {
  readonly id: SymbolId;
  readonly label: string;
  readonly mark: SymbolShape;
}

export interface PatternLayout {
  readonly rowDragWidth: number;
  readonly cellSize: number;
  readonly gridGap: number;
  readonly rowLabelWidth: number;
  readonly rowActionWidth: number;
  readonly rowGap: number;
  readonly headerHeight: number;
  readonly rowHeight: number;
  readonly addRowHeight: number;
}

interface StepOption {
  readonly id: number;
  readonly label: string;
  readonly tokens: readonly string[];
}

interface PatternRowInit {
  id: string;
  name: string;
  color: string;
  cells: readonly SymbolId[];
  dividers: readonly SymbolId[];
}

interface PatternDataInit {
  bars?: number;
  beatsPerBar?: number;
  stepsPerBeat?: number;
  rows: readonly (PatternRow | PatternRowInit)[];
  nextRowId?: number;
}

const SYMBOLS: readonly SymbolDefinition[] = Object.freeze([
  Object.freeze({ id: SymbolId.Dot, label: "Filled circle", mark: SymbolShape.Dot }),
  Object.freeze({ id: SymbolId.Ring, label: "Hollow circle", mark: SymbolShape.Ring }),
  Object.freeze({ id: SymbolId.Diamond, label: "Filled diamond", mark: SymbolShape.Diamond }),
  Object.freeze({ id: SymbolId.HollowDiamond, label: "Hollow diamond", mark: SymbolShape.HollowDiamond })
]);

const SYMBOL_BY_ID = new Map<SymbolId, SymbolDefinition>(SYMBOLS.map((symbol) => [symbol.id, symbol]));
const ROW_COLORS = Object.freeze(["#fcca96", "#ae99c9", "#c7dfa0", "#d9d9d9", "#fcca96", "#ae99c9", "#c7dfa0"]);
const BAR_OPTIONS = Object.freeze(Array.from({ length: MAX_BARS }, (_, index) => index + 1));
const BEAT_OPTIONS = Object.freeze(Array.from({ length: MAX_BEATS_PER_BAR }, (_, index) => index + 1));
const STEPS_PER_BEAT_OPTIONS: readonly StepOption[] = Object.freeze([
  Object.freeze({ id: 1, label: "1", tokens: Object.freeze([""]) }),
  Object.freeze({ id: 2, label: "2", tokens: Object.freeze(["", "&"]) }),
  Object.freeze({ id: 4, label: "4", tokens: Object.freeze(["", "e", "&", "a"]) })
]);

const LAYOUT: PatternLayout = Object.freeze({
  rowDragWidth: 28,
  cellSize: 28,
  gridGap: 2,
  rowLabelWidth: 82,
  rowActionWidth: 58,
  rowGap: 3,
  headerHeight: 28,
  rowHeight: 28,
  addRowHeight: 36
});

function resizeMarks(marks: readonly SymbolId[], length: number): SymbolId[] {
  return marks.length > length
    ? marks.slice(0, length)
    : [...marks, ...Array<SymbolId>(length - marks.length).fill(SymbolId.Empty)];
}

function getRowColor(index: number): string {
  return ROW_COLORS[index % ROW_COLORS.length]!;
}

export class PatternRow {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly cells: readonly SymbolId[];
  readonly dividers: readonly SymbolId[];

  constructor({ id, name, color, cells, dividers }: PatternRowInit) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.cells = Object.freeze([...cells]);
    this.dividers = Object.freeze([...dividers]);
    Object.freeze(this);
  }

  resize(columnCount: number): PatternRow {
    return this.#copy({
      cells: resizeMarks(this.cells, columnCount),
      dividers: resizeMarks(this.dividers, Math.max(0, columnCount - 1))
    });
  }

  paint(collection: MarkCollection, index: number, symbolId: SymbolId): PatternRow {
    const marks = this[collection];
    if (!marks || index < 0 || index >= marks.length) return this;
    const nextMarks = [...marks];
    nextMarks[index] = symbolId;
    return this.#copy({ [collection]: nextMarks });
  }

  rename(name: string): PatternRow {
    return this.#copy({ name });
  }

  recolor(color: string): PatternRow {
    return this.#copy({ color });
  }

  clear(): PatternRow {
    return this.#copy({
      cells: Array<SymbolId>(this.cells.length).fill(SymbolId.Empty),
      dividers: Array<SymbolId>(this.dividers.length).fill(SymbolId.Empty)
    });
  }

  hasMarkAtCell(index: number): boolean {
    return [this.cells[index], this.dividers[index - 1], this.dividers[index]]
      .some((symbolId) => symbolId !== undefined && symbolId !== SymbolId.Empty);
  }

  #copy(overrides: Partial<PatternRowInit>): PatternRow {
    return new PatternRow({ ...this, ...overrides });
  }
}

export class PatternData {
  readonly bars: number;
  readonly beatsPerBar: number;
  readonly stepsPerBeat: number;
  readonly rows: readonly PatternRow[];
  readonly rowCount: number;
  readonly nextRowId: number;
  readonly columnCount: number;
  readonly header: readonly string[];
  readonly symbols: readonly SymbolDefinition[];
  readonly barOptions: readonly number[];
  readonly beatOptions: readonly number[];
  readonly stepsPerBeatOptions: readonly StepOption[];
  readonly layout: PatternLayout;
  readonly emptySymbolId = SymbolId.Empty;

  constructor({
    bars = 1,
    beatsPerBar = DEFAULT_BEATS_PER_BAR,
    stepsPerBeat = DEFAULT_STEPS_PER_BEAT,
    rows,
    nextRowId = 1
  }: PatternDataInit) {
    this.bars = bars;
    this.beatsPerBar = beatsPerBar;
    this.stepsPerBeat = stepsPerBeat;
    this.rows = Object.freeze(rows.map((row) => row instanceof PatternRow ? row : new PatternRow(row)));
    this.rowCount = this.rows.length;
    this.nextRowId = nextRowId;
    this.columnCount = bars * beatsPerBar * stepsPerBeat;
    this.header = Object.freeze(this.#createHeader());
    this.symbols = SYMBOLS;
    this.barOptions = BAR_OPTIONS;
    this.beatOptions = BEAT_OPTIONS;
    this.stepsPerBeatOptions = STEPS_PER_BEAT_OPTIONS;
    this.layout = LAYOUT;
    Object.freeze(this);
  }

  static createDefault(): PatternData {
    const columnCount = DEFAULT_BEATS_PER_BAR * DEFAULT_STEPS_PER_BEAT;
    const rows = ["Hi Hat", "Snare", "Kick"].map((name, index) => new PatternRow({
      id: `starter-row-${index}`,
      name,
      color: getRowColor(index),
      cells: Array<SymbolId>(columnCount).fill(SymbolId.Empty),
      dividers: Array<SymbolId>(columnCount - 1).fill(SymbolId.Empty)
    }));
    return new PatternData({ rows });
  }

  getSymbol(symbolId: SymbolId): SymbolDefinition | null {
    return SYMBOL_BY_ID.get(symbolId) ?? null;
  }

  hasSymbol(symbolId: SymbolId): boolean {
    return symbolId === SymbolId.Empty || SYMBOL_BY_ID.has(symbolId);
  }

  isEmpty(): boolean {
    return this.rows.every((row) =>
      [...row.cells, ...row.dividers].every((symbolId) => symbolId === SymbolId.Empty)
    );
  }

  withBars(bars: number): PatternData {
    return this.#withGridShape(bars, this.beatsPerBar, this.stepsPerBeat);
  }

  withBeatsPerBar(beatsPerBar: number): PatternData {
    return this.#withGridShape(this.bars, beatsPerBar, this.stepsPerBeat);
  }

  withStepsPerBeat(stepsPerBeat: number): PatternData {
    return this.#withGridShape(this.bars, this.beatsPerBar, stepsPerBeat);
  }

  paintCell(rowId: string, index: number, symbolId: SymbolId): PatternData {
    return this.#paint(rowId, "cells", index, symbolId);
  }

  paintDivider(rowId: string, index: number, symbolId: SymbolId): PatternData {
    return this.#paint(rowId, "dividers", index, symbolId);
  }

  renameRow(rowId: string, name: string): PatternData {
    return this.#updateRow(rowId, (row) => row.rename(name));
  }

  recolorRow(rowId: string, color: string): PatternData {
    return this.#updateRow(rowId, (row) => row.recolor(color));
  }

  addRow(): PatternData {
    const row = new PatternRow({
      id: `row-${this.nextRowId}`,
      name: `Row ${this.rows.length + 1}`,
      color: getRowColor(this.rows.length),
      cells: Array<SymbolId>(this.columnCount).fill(SymbolId.Empty),
      dividers: Array<SymbolId>(Math.max(0, this.columnCount - 1)).fill(SymbolId.Empty)
    });
    return this.#copy({ rows: [...this.rows, row], nextRowId: this.nextRowId + 1 });
  }

  removeRow(rowId: string): PatternData {
    if (this.rows.length <= 1) return this;
    const rows = this.rows.filter((row) => row.id !== rowId);
    return rows.length === this.rows.length ? this : this.#copy({ rows });
  }

  moveRow(rowId: string, targetIndex: number): PatternData {
    const sourceIndex = this.rows.findIndex((row) => row.id === rowId);
    if (sourceIndex < 0 || !Number.isFinite(targetIndex)) return this;

    const boundedIndex = Math.min(this.rows.length - 1, Math.max(0, Math.trunc(targetIndex)));
    if (sourceIndex === boundedIndex) return this;

    const rows = [...this.rows];
    const [row] = rows.splice(sourceIndex, 1);
    if (!row) return this;
    rows.splice(boundedIndex, 0, row);
    return this.#copy({ rows });
  }

  clear(): PatternData {
    return this.#copy({ rows: this.rows.map((row) => row.clear()) });
  }

  #paint(rowId: string, collection: MarkCollection, index: number, symbolId: SymbolId): PatternData {
    if (!this.hasSymbol(symbolId)) return this;
    return this.#updateRow(rowId, (row) => row.paint(collection, index, symbolId));
  }

  #createHeader(): string[] {
    const option = STEPS_PER_BEAT_OPTIONS.find((item) => item.id === this.stepsPerBeat)
      ?? STEPS_PER_BEAT_OPTIONS.at(-1)!;
    return Array.from({ length: this.columnCount }, (_, index) => {
      const beat = (Math.floor(index / this.stepsPerBeat) % this.beatsPerBar) + 1;
      return option.tokens[index % this.stepsPerBeat] || `${beat}`;
    });
  }

  #withGridShape(bars: number, beatsPerBar: number, stepsPerBeat: number): PatternData {
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

  #updateRow(rowId: string, update: (row: PatternRow) => PatternRow): PatternData {
    let changed = false;
    const rows = this.rows.map((row) => {
      if (row.id !== rowId) return row;
      changed = true;
      return update(row);
    });
    return changed ? this.#copy({ rows }) : this;
  }

  #copy(overrides: Partial<PatternDataInit>): PatternData {
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
