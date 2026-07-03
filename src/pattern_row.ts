import { RowDetails } from "./pattern_config";
import { getBetweenCellPosition, PlacementMode, SymbolId } from "./types";

export interface BetweenCellMarks {
  readonly before: SymbolId;
  readonly center: SymbolId;
  readonly after: SymbolId;
}

export interface PatternRowInit {
  id: string;
  name: string;
  color: string;
  cells: readonly SymbolId[];
  betweenCells: readonly BetweenCellMarks[];
}

export class PatternRow {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly cells: readonly SymbolId[];
  readonly betweenCells: readonly BetweenCellMarks[];

  constructor({ id, name, color, cells, betweenCells }: PatternRowInit) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.cells = Object.freeze([...cells]);
    this.betweenCells = Object.freeze(betweenCells.map((marks) => Object.freeze({ ...marks })));
    Object.freeze(this);
  }

  reset(columnCount: number): PatternRow {
    return this.copy({
      cells: emptySymbols(columnCount),
      betweenCells: emptyBetweenCells(Math.max(0, columnCount - 1))
    });
  }

  paint(index: number, mode: PlacementMode, symbolId: SymbolId): PatternRow {
    const position = getBetweenCellPosition(mode);
    if (!position) {
      if (index < 0 || index >= this.cells.length) return this;
      const cells = [...this.cells];
      cells[index] = symbolId;
      return this.copy({ cells });
    }

    if (index < 0 || index >= this.betweenCells.length) return this;
    const betweenCells = [...this.betweenCells];
    betweenCells[index] = { ...betweenCells[index]!, [position]: symbolId };
    return this.copy({ betweenCells });
  }

  updateDetails({ name, color }: RowDetails): PatternRow {
    return this.copy({ name, color });
  }

  clear(): PatternRow {
    return this.reset(this.cells.length);
  }

  isEmpty(): boolean {
    return this.cells.every(isEmptySymbol)
      && this.betweenCells.every((marks) => Object.values(marks).every(isEmptySymbol));
  }

  hasMarkAtCell(index: number): boolean {
    return !isEmptySymbol(this.cells[index] ?? SymbolId.Empty)
      || hasBetweenMark(this.betweenCells[index - 1])
      || hasBetweenMark(this.betweenCells[index]);
  }

  private copy(overrides: Partial<PatternRowInit>): PatternRow {
    return new PatternRow({ ...this, ...overrides });
  }
}

export function emptySymbols(length: number): SymbolId[] {
  return Array<SymbolId>(length).fill(SymbolId.Empty);
}

export function emptyBetweenCells(length: number): BetweenCellMarks[] {
  return Array.from({ length }, () => ({
    before: SymbolId.Empty,
    center: SymbolId.Empty,
    after: SymbolId.Empty
  }));
}

function isEmptySymbol(symbolId: SymbolId): boolean {
  return symbolId === SymbolId.Empty;
}

function hasBetweenMark(marks: BetweenCellMarks | undefined): boolean {
  return marks !== undefined && Object.values(marks).some((symbolId) => !isEmptySymbol(symbolId));
}
