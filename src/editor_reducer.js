import { PatternData } from "./model";

export function createEditorState() {
  return {
    pattern: PatternData.createDefault(),
    selectedSymbolId: "dot",
    placementMode: "cells",
    exportState: {
      format: "svg",
      error: "",
      isOpen: false,
      isRunning: false
    }
  };
}

export function editorReducer(state, action) {
  switch (action.type) {
    case "set-bars":
      return withPattern(state, state.pattern.withBars(action.value));
    case "set-beats-per-bar":
      return withPattern(state, state.pattern.withBeatsPerBar(action.value));
    case "set-steps-per-beat":
      return withPattern(state, state.pattern.withStepsPerBeat(action.value));
    case "paint-cell":
      return withPattern(
        state,
        state.pattern.paintCell(action.rowId, action.index, state.selectedSymbolId)
      );
    case "paint-divider":
      return withPattern(
        state,
        state.pattern.paintDivider(action.rowId, action.index, state.selectedSymbolId)
      );
    case "rename-row":
      return withPattern(state, state.pattern.renameRow(action.rowId, action.name));
    case "recolor-row":
      return withPattern(state, state.pattern.recolorRow(action.rowId, action.color));
    case "add-row":
      return withPattern(state, state.pattern.addRow());
    case "remove-row":
      return withPattern(state, state.pattern.removeRow(action.rowId));
    case "clear-pattern":
      return withPattern(state, state.pattern.clear());
    case "select-symbol":
      return state.pattern.hasSymbol(action.symbolId)
        ? { ...state, selectedSymbolId: action.symbolId }
        : state;
    case "select-placement-mode":
      return ["cells", "lines"].includes(action.mode)
        ? { ...state, placementMode: action.mode }
        : state;
    case "select-export-format":
      return ["svg", "pdf"].includes(action.format)
        ? withExportState(state, { format: action.format })
        : state;
    case "open-export":
      return withExportState(state, { error: "", isOpen: true });
    case "close-export":
      return state.exportState.isRunning
        ? state
        : withExportState(state, { error: "", isOpen: false });
    case "export-started":
      return withExportState(state, { error: "", isRunning: true });
    case "export-finished":
      return withExportState(state, {
        isOpen: action.saved ? false : state.exportState.isOpen,
        isRunning: false
      });
    case "export-failed":
      return withExportState(state, { error: action.error, isRunning: false });
    default:
      return state;
  }
}

function withPattern(state, pattern) {
  return pattern === state.pattern ? state : { ...state, pattern };
}

function withExportState(state, updates) {
  return { ...state, exportState: { ...state.exportState, ...updates } };
}
