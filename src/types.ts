export enum SymbolId {
  Empty = "empty",
  Dot = "dot",
  Ring = "ring",
  Diamond = "diamond",
  HollowDiamond = "hollow-diamond"
}

export enum SymbolShape {
  Dot = "dot",
  Ring = "ring",
  Diamond = "diamond",
  HollowDiamond = "hollow-diamond"
}

export enum PlacementMode {
  CellCenter = "cell-center",
  IntervalBefore = "interval-before",
  IntervalCenter = "interval-center",
  IntervalAfter = "interval-after"
}

export enum BetweenCellPosition {
  Before = "before",
  Center = "center",
  After = "after"
}

export enum ExportFormat {
  Svg = "svg",
  Pdf = "pdf"
}

export enum GridParameter {
  Bars = "bars",
  BeatsPerBar = "beats-per-bar",
  StepsPerBeat = "steps-per-beat"
}

export const BETWEEN_CELL_FRACTIONS: Readonly<Record<BetweenCellPosition, number>> = Object.freeze({
  [BetweenCellPosition.Before]: 1 / 4,
  [BetweenCellPosition.Center]: 1 / 2,
  [BetweenCellPosition.After]: 3 / 4
});

export const BETWEEN_CELL_POSITIONS: readonly BetweenCellPosition[] = Object.freeze([
  BetweenCellPosition.Before,
  BetweenCellPosition.Center,
  BetweenCellPosition.After
]);

export function getBetweenCellPosition(mode: PlacementMode): BetweenCellPosition | null {
  switch (mode) {
    case PlacementMode.CellCenter: return null;
    case PlacementMode.IntervalBefore: return BetweenCellPosition.Before;
    case PlacementMode.IntervalCenter: return BetweenCellPosition.Center;
    case PlacementMode.IntervalAfter: return BetweenCellPosition.After;
  }
}
