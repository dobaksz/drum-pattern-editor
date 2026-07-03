import { PatternData } from "./model";
import { ExportFormat, PlacementMode, SymbolId } from "./types";

export enum EditorActionType {
  SetBars = "set-bars",
  SetBeatsPerBar = "set-beats-per-bar",
  SetStepsPerBeat = "set-steps-per-beat",
  PaintCell = "paint-cell",
  PaintDivider = "paint-divider",
  RenameRow = "rename-row",
  RecolorRow = "recolor-row",
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
}

export type EditorAction =
  | { type: EditorActionType.SetBars; value: number }
  | { type: EditorActionType.SetBeatsPerBar; value: number }
  | { type: EditorActionType.SetStepsPerBeat; value: number }
  | { type: EditorActionType.PaintCell; rowId: string; index: number }
  | { type: EditorActionType.PaintDivider; rowId: string; index: number }
  | { type: EditorActionType.RenameRow; rowId: string; name: string }
  | { type: EditorActionType.RecolorRow; rowId: string; color: string }
  | { type: EditorActionType.AddRow }
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
    placementMode: PlacementMode.Cells,
    exportState: {
      format: ExportFormat.Svg,
      error: "",
      isOpen: false,
      isRunning: false
    }
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case EditorActionType.SetBars:
      return withPattern(state, state.pattern.withBars(action.value));
    case EditorActionType.SetBeatsPerBar:
      return withPattern(state, state.pattern.withBeatsPerBar(action.value));
    case EditorActionType.SetStepsPerBeat:
      return withPattern(state, state.pattern.withStepsPerBeat(action.value));
    case EditorActionType.PaintCell:
      return withPattern(
        state,
        state.pattern.paintCell(action.rowId, action.index, state.selectedSymbolId)
      );
    case EditorActionType.PaintDivider:
      return withPattern(
        state,
        state.pattern.paintDivider(action.rowId, action.index, state.selectedSymbolId)
      );
    case EditorActionType.RenameRow:
      return withPattern(state, state.pattern.renameRow(action.rowId, action.name));
    case EditorActionType.RecolorRow:
      return withPattern(state, state.pattern.recolorRow(action.rowId, action.color));
    case EditorActionType.AddRow:
      return withPattern(state, state.pattern.addRow());
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

function withExportState(state: EditorState, updates: Partial<ExportState>): EditorState {
  return { ...state, exportState: { ...state.exportState, ...updates } };
}
