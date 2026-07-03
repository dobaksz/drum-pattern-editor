import {
  BAR_OPTIONS,
  BEAT_OPTIONS,
  DEFAULT_BEATS_PER_BAR,
  DEFAULT_STEPS_PER_BEAT,
  getRowPreset,
  MAX_BARS,
  MAX_BEATS_PER_BAR,
  PATTERN_LAYOUT,
  PatternLayout,
  RowDetails,
  STEPS_PER_BEAT_OPTIONS,
  StepOption,
  SYMBOL_BY_ID,
  SYMBOLS,
  SymbolDefinition
} from "./pattern_config";
import { emptyBetweenCells, emptySymbols, PatternRow, PatternRowInit } from "./pattern_row";
import { PlacementMode, SymbolId } from "./types";

interface PatternDataInit {
  bars?: number;
  beatsPerBar?: number;
  stepsPerBeat?: number;
  rows: readonly (PatternRow | PatternRowInit)[];
  nextRowId?: number;
}

export class PatternData {
  readonly bars: number;
  readonly beatsPerBar: number;
  readonly stepsPerBeat: number;
  readonly rows: readonly PatternRow[];
  readonly nextRowId: number;
  readonly columnCount: number;
  readonly header: readonly string[];

  readonly symbols: readonly SymbolDefinition[] = SYMBOLS;
  readonly barOptions: readonly number[] = BAR_OPTIONS;
  readonly beatOptions: readonly number[] = BEAT_OPTIONS;
  readonly stepsPerBeatOptions: readonly StepOption[] = STEPS_PER_BEAT_OPTIONS;
  readonly layout: PatternLayout = PATTERN_LAYOUT;
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
    this.nextRowId = nextRowId;
    this.columnCount = bars * beatsPerBar * stepsPerBeat;
    this.header = Object.freeze(this.createHeader());
    Object.freeze(this);
  }

  static createDefault(): PatternData {
    const columnCount = DEFAULT_BEATS_PER_BAR * DEFAULT_STEPS_PER_BEAT;
    const rows = ["Hi Hat", "Snare", "Kick"].map((name, index) => new PatternRow({
      id: `starter-row-${index}`,
      ...getRowPreset(name),
      cells: emptySymbols(columnCount),
      betweenCells: emptyBetweenCells(columnCount - 1)
    }));
    return new PatternData({ rows });
  }

  get rowCount(): number {
    return this.rows.length;
  }

  getSymbol(symbolId: SymbolId): SymbolDefinition | null {
    return SYMBOL_BY_ID.get(symbolId) ?? null;
  }

  hasSymbol(symbolId: SymbolId): boolean {
    return symbolId === SymbolId.Empty || SYMBOL_BY_ID.has(symbolId);
  }

  isEmpty(): boolean {
    return this.rows.every((row) => row.isEmpty());
  }

  withBars(bars: number): PatternData {
    return this.withGridShape(bars, this.beatsPerBar, this.stepsPerBeat);
  }

  withBeatsPerBar(beatsPerBar: number): PatternData {
    return this.withGridShape(this.bars, beatsPerBar, this.stepsPerBeat);
  }

  withStepsPerBeat(stepsPerBeat: number): PatternData {
    return this.withGridShape(this.bars, this.beatsPerBar, stepsPerBeat);
  }

  paint(rowId: string, index: number, mode: PlacementMode, symbolId: SymbolId): PatternData {
    if (!this.hasSymbol(symbolId)) return this;
    return this.updateRow(rowId, (row) => row.paint(index, mode, symbolId));
  }

  updateRowDetails(rowId: string, details: RowDetails): PatternData {
    return this.updateRow(rowId, (row) => row.updateDetails(details));
  }

  addRow(details: RowDetails): PatternData {
    const row = new PatternRow({
      id: `row-${this.nextRowId}`,
      ...details,
      cells: emptySymbols(this.columnCount),
      betweenCells: emptyBetweenCells(Math.max(0, this.columnCount - 1))
    });
    return this.copy({ rows: [...this.rows, row], nextRowId: this.nextRowId + 1 });
  }

  removeRow(rowId: string): PatternData {
    if (this.rows.length <= 1) return this;
    const rows = this.rows.filter((row) => row.id !== rowId);
    return rows.length === this.rows.length ? this : this.copy({ rows });
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
    return this.copy({ rows });
  }

  clear(): PatternData {
    return this.copy({ rows: this.rows.map((row) => row.clear()) });
  }

  private createHeader(): string[] {
    const option = STEPS_PER_BEAT_OPTIONS.find((item) => item.id === this.stepsPerBeat)
      ?? STEPS_PER_BEAT_OPTIONS.at(-1)!;
    return Array.from({ length: this.columnCount }, (_, index) => {
      const beat = (Math.floor(index / this.stepsPerBeat) % this.beatsPerBar) + 1;
      return option.tokens[index % this.stepsPerBeat] || `${beat}`;
    });
  }

  private withGridShape(bars: number, beatsPerBar: number, stepsPerBeat: number): PatternData {
    const nextBars = Math.min(MAX_BARS, Math.max(1, bars));
    const nextBeatsPerBar = Math.min(MAX_BEATS_PER_BAR, Math.max(1, beatsPerBar));
    const nextStepsPerBeat = STEPS_PER_BEAT_OPTIONS.some((option) => option.id === stepsPerBeat)
      ? stepsPerBeat
      : DEFAULT_STEPS_PER_BEAT;
    const columnCount = nextBars * nextBeatsPerBar * nextStepsPerBeat;
    return this.copy({
      bars: nextBars,
      beatsPerBar: nextBeatsPerBar,
      stepsPerBeat: nextStepsPerBeat,
      rows: this.rows.map((row) => row.reset(columnCount))
    });
  }

  private updateRow(rowId: string, update: (row: PatternRow) => PatternRow): PatternData {
    const rowIndex = this.rows.findIndex((row) => row.id === rowId);
    if (rowIndex < 0) return this;
    const rows = [...this.rows];
    rows[rowIndex] = update(rows[rowIndex]!);
    return this.copy({ rows });
  }

  private copy(overrides: Partial<PatternDataInit>): PatternData {
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
