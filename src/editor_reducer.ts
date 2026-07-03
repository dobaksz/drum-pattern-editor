import { PatternData } from "./pattern_data";
import { RowDetails } from "./pattern_config";
import { ExportFormat, GridParameter, PlacementMode, SymbolId } from "./types";

export enum EditorActionType {
  RequestGridChange = "request-grid-change",
  CancelGridChange = "cancel-grid-change",
  ConfirmGridChange = "confirm-grid-change",
  PaintMark = "paint-mark",
  UpdateRowDetails = "update-row-details",
  AddRow = "add-row",
  RemoveRow = "remove-row",
  MoveRow = "move-row",
  ClearPattern = "clear-pattern",
  SelectSymbol = "select-symbol",
  SelectPlacementMode = "select-placement-mode",
  SelectExportFormat = "select-export-format",
  OpenExport = "open-export",
  CloseExport = "close-export",
  ExportStarted = "export-started",
  ExportFinished = "export-finished",
  ExportFailed = "export-failed"
}

export interface ExportState {
  format: ExportFormat;
  error: string;
  isOpen: boolean;
  isRunning: boolean;
}

export interface EditorState {
  pattern: PatternData;
  selectedSymbolId: SymbolId;
  placementMode: PlacementMode;
  exportState: ExportState;
  pendingGridChange: PendingGridChange | null;
}

export interface PendingGridChange {
  parameter: GridParameter;
  value: number;
}

export type EditorAction =
  | { type: EditorActionType.RequestGridChange; change: PendingGridChange }
  | { type: EditorActionType.CancelGridChange }
  | { type: EditorActionType.ConfirmGridChange }
  | { type: EditorActionType.PaintMark; rowId: string; index: number; mode: PlacementMode }
  | { type: EditorActionType.UpdateRowDetails; rowId: string; details: RowDetails }
  | { type: EditorActionType.AddRow; details: RowDetails }
  | { type: EditorActionType.RemoveRow; rowId: string }
  | { type: EditorActionType.MoveRow; rowId: string; targetIndex: number }
  | { type: EditorActionType.ClearPattern }
  | { type: EditorActionType.SelectSymbol; symbolId: SymbolId }
  | { type: EditorActionType.SelectPlacementMode; mode: PlacementMode }
  | { type: EditorActionType.SelectExportFormat; format: ExportFormat }
  | { type: EditorActionType.OpenExport }
  | { type: EditorActionType.CloseExport }
  | { type: EditorActionType.ExportStarted }
  | { type: EditorActionType.ExportFinished; saved: boolean }
  | { type: EditorActionType.ExportFailed; error: string };

export function createEditorState(): EditorState {
  return {
    pattern: PatternData.createDefault(),
    selectedSymbolId: SymbolId.Dot,
    placementMode: PlacementMode.CellCenter,
    exportState: {
      format: ExportFormat.Svg,
      error: "",
      isOpen: false,
      isRunning: false
    },
    pendingGridChange: null
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case EditorActionType.RequestGridChange:
      if (getGridValue(state.pattern, action.change.parameter) === action.change.value) return state;
      return state.pattern.isEmpty()
        ? withPattern(state, applyGridChange(state.pattern, action.change))
        : { ...state, pendingGridChange: action.change };
    case EditorActionType.CancelGridChange:
      return state.pendingGridChange ? { ...state, pendingGridChange: null } : state;
    case EditorActionType.ConfirmGridChange:
      return confirmGridChange(state);
    case EditorActionType.PaintMark:
      return withPattern(
        state,
        state.pattern.paint(action.rowId, action.index, action.mode, state.selectedSymbolId)
      );
    case EditorActionType.UpdateRowDetails:
      return withPattern(state, state.pattern.updateRowDetails(action.rowId, action.details));
    case EditorActionType.AddRow:
      return withPattern(state, state.pattern.addRow(action.details));
    case EditorActionType.RemoveRow:
      return withPattern(state, state.pattern.removeRow(action.rowId));
    case EditorActionType.MoveRow:
      return withPattern(state, state.pattern.moveRow(action.rowId, action.targetIndex));
    case EditorActionType.ClearPattern:
      return withPattern(state, state.pattern.clear());
    case EditorActionType.SelectSymbol:
      return state.pattern.hasSymbol(action.symbolId)
        ? { ...state, selectedSymbolId: action.symbolId }
        : state;
    case EditorActionType.SelectPlacementMode:
      return { ...state, placementMode: action.mode };
    case EditorActionType.SelectExportFormat:
      return withExportState(state, { format: action.format });
    case EditorActionType.OpenExport:
      return withExportState(state, { error: "", isOpen: true });
    case EditorActionType.CloseExport:
      return state.exportState.isRunning
        ? state
        : withExportState(state, { error: "", isOpen: false });
    case EditorActionType.ExportStarted:
      return withExportState(state, { error: "", isRunning: true });
    case EditorActionType.ExportFinished:
      return withExportState(state, {
        isOpen: action.saved ? false : state.exportState.isOpen,
        isRunning: false
      });
    case EditorActionType.ExportFailed:
      return withExportState(state, { error: action.error, isRunning: false });
    default:
      return state;
  }
}

function withPattern(state: EditorState, pattern: PatternData): EditorState {
  return pattern === state.pattern ? state : { ...state, pattern };
}

function getGridValue(pattern: PatternData, parameter: GridParameter): number {
  switch (parameter) {
    case GridParameter.Bars: return pattern.bars;
    case GridParameter.BeatsPerBar: return pattern.beatsPerBar;
    case GridParameter.StepsPerBeat: return pattern.stepsPerBeat;
  }
}

function confirmGridChange(state: EditorState): EditorState {
  const change = state.pendingGridChange;
  if (!change) return state;

  return {
    ...state,
    pattern: applyGridChange(state.pattern, change),
    pendingGridChange: null
  };
}

function applyGridChange(pattern: PatternData, change: PendingGridChange): PatternData {
  switch (change.parameter) {
    case GridParameter.Bars:
      return pattern.withBars(change.value);
    case GridParameter.BeatsPerBar:
      return pattern.withBeatsPerBar(change.value);
    case GridParameter.StepsPerBeat:
      return pattern.withStepsPerBeat(change.value);
  }
}

function withExportState(state: EditorState, updates: Partial<ExportState>): EditorState {
  return { ...state, exportState: { ...state.exportState, ...updates } };
}
