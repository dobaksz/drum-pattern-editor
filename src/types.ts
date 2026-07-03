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
  Cells = "cells",
  Lines = "lines"
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

export type MarkCollection = "cells" | "dividers";
