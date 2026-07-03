import { MarkCollection, SymbolId } from "./types";

export interface PatternRowInit {
  id: string;
  name: string;
  color: string;
  cells: readonly SymbolId[];
  dividers: readonly SymbolId[];
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
    return this.copy({
      cells: resizeMarks(this.cells, columnCount),
      dividers: resizeMarks(this.dividers, Math.max(0, columnCount - 1))
    });
  }

  paint(collection: MarkCollection, index: number, symbolId: SymbolId): PatternRow {
    const marks = this[collection];
    if (index < 0 || index >= marks.length) return this;
    const nextMarks = [...marks];
    nextMarks[index] = symbolId;
    return this.copy({ [collection]: nextMarks });
  }

  rename(name: string): PatternRow {
    return this.copy({ name });
  }

  recolor(color: string): PatternRow {
    return this.copy({ color });
  }

  clear(): PatternRow {
    return this.copy({
      cells: emptyMarks(this.cells.length),
      dividers: emptyMarks(this.dividers.length)
    });
  }

  isEmpty(): boolean {
    return this.cells.every(isEmptyMark) && this.dividers.every(isEmptyMark);
  }

  hasMarkAtCell(index: number): boolean {
    return [this.cells[index], this.dividers[index - 1], this.dividers[index]]
      .some((symbolId) => symbolId !== undefined && !isEmptyMark(symbolId));
  }

  private copy(overrides: Partial<PatternRowInit>): PatternRow {
    return new PatternRow({ ...this, ...overrides });
  }
}

function emptyMarks(length: number): SymbolId[] {
  return Array<SymbolId>(length).fill(SymbolId.Empty);
}

function isEmptyMark(symbolId: SymbolId): boolean {
  return symbolId === SymbolId.Empty;
}

function resizeMarks(marks: readonly SymbolId[], length: number): SymbolId[] {
  return marks.length > length
    ? marks.slice(0, length)
    : [...marks, ...emptyMarks(length - marks.length)];
}
