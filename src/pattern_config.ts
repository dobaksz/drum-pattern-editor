import { SymbolId, SymbolShape } from "./types";

export const DEFAULT_BEATS_PER_BAR = 4;
export const DEFAULT_STEPS_PER_BEAT = 4;
export const MAX_BARS = 4;
export const MAX_BEATS_PER_BAR = 8;

export interface SymbolDefinition {
  readonly id: SymbolId;
  readonly label: string;
  readonly mark: SymbolShape;
}

export interface StepOption {
  readonly id: number;
  readonly label: string;
  readonly tokens: readonly string[];
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

export const SYMBOLS: readonly SymbolDefinition[] = Object.freeze([
  Object.freeze({ id: SymbolId.Dot, label: "Filled circle", mark: SymbolShape.Dot }),
  Object.freeze({ id: SymbolId.Ring, label: "Hollow circle", mark: SymbolShape.Ring }),
  Object.freeze({ id: SymbolId.Diamond, label: "Filled diamond", mark: SymbolShape.Diamond }),
  Object.freeze({ id: SymbolId.HollowDiamond, label: "Hollow diamond", mark: SymbolShape.HollowDiamond })
]);

export const SYMBOL_BY_ID = new Map<SymbolId, SymbolDefinition>(
  SYMBOLS.map((symbol) => [symbol.id, symbol])
);

export const ROW_COLORS = Object.freeze([
  "#fcca96", "#ae99c9", "#c7dfa0", "#d9d9d9", "#fcca96", "#ae99c9", "#c7dfa0"
]);

export const BAR_OPTIONS = Object.freeze(
  Array.from({ length: MAX_BARS }, (_, index) => index + 1)
);

export const BEAT_OPTIONS = Object.freeze(
  Array.from({ length: MAX_BEATS_PER_BAR }, (_, index) => index + 1)
);

export const STEPS_PER_BEAT_OPTIONS: readonly StepOption[] = Object.freeze([
  Object.freeze({ id: 1, label: "1", tokens: Object.freeze([""]) }),
  Object.freeze({ id: 2, label: "2", tokens: Object.freeze(["", "&"]) }),
  Object.freeze({ id: 4, label: "4", tokens: Object.freeze(["", "e", "&", "a"]) })
]);

export const PATTERN_LAYOUT: PatternLayout = Object.freeze({
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

export function getRowColor(index: number): string {
  return ROW_COLORS[index % ROW_COLORS.length]!;
}
