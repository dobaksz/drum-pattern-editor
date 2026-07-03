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

export interface RowDetails {
  readonly name: string;
  readonly color: string;
}

export interface RowPresetGroup {
  readonly label: string;
  readonly presets: readonly RowDetails[];
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

export const ROW_PRESET_GROUPS: readonly RowPresetGroup[] = Object.freeze([
  Object.freeze({
    label: "Hi-hats",
    presets: Object.freeze([
      Object.freeze({ name: "Hi Hat", color: "#fcca96" }),
      Object.freeze({ name: "Open HH", color: "#9fd4f0" })
    ])
  }),
  Object.freeze({
    label: "Cymbals",
    presets: Object.freeze([
      Object.freeze({ name: "Ride Bell", color: "#fbabb8" }),
      Object.freeze({ name: "Cymbal A", color: "#fdeaa7" }),
      Object.freeze({ name: "Cymbal B", color: "#f8ca9d" })
    ])
  }),
  Object.freeze({
    label: "Toms",
    presets: Object.freeze([
      Object.freeze({ name: "High Tom", color: "#c7df7d" }),
      Object.freeze({ name: "Mid Tom", color: "#94c588" }),
      Object.freeze({ name: "Low Tom", color: "#4dc09e" })
    ])
  }),
  Object.freeze({
    label: "Other",
    presets: Object.freeze([
      Object.freeze({ name: "Snare", color: "#ae99c9" }),
      Object.freeze({ name: "Sidestick", color: "#f878fc" }),
      Object.freeze({ name: "Clap", color: "#f6b3fb" }),
      Object.freeze({ name: "Kick", color: "#c7dfa0" })
    ])
  })
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

export function getRowPreset(name: string): RowDetails {
  for (const group of ROW_PRESET_GROUPS) {
    const preset = group.presets.find((item) => item.name === name);
    if (preset) return preset;
  }
  throw new Error(`Unknown row preset: ${name}`);
}
