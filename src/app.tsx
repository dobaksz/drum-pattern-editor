import { useReducer } from "react";
import { createEditorState, EditorActionType, editorReducer } from "./editor_reducer";
import { EditorToolbar } from "./editor_toolbar";
import { ExportDialog } from "./export_dialog";
import { FooterLinks } from "./footer_links";
import { GridChangeDialog } from "./grid_change_dialog";
import { RowDetails } from "./pattern_config";
import { PatternEditor } from "./pattern_editor";
import { GridParameter } from "./types";
import { usePatternExport } from "./use_pattern_export";

export function App() {
  const [state, dispatch] = useReducer(editorReducer, undefined, createEditorState);
  const { exportState, pattern, pendingGridChange, placementMode, selectedSymbolId } = state;
  const exportPattern = usePatternExport(pattern, exportState.format, dispatch);

  const rowHandlers = {
    addRow: (details: RowDetails) => dispatch({ type: EditorActionType.AddRow, details }),
    paintCell: (rowId: string, index: number) => dispatch({ type: EditorActionType.PaintCell, rowId, index }),
    paintDivider: (rowId: string, index: number) => dispatch({ type: EditorActionType.PaintDivider, rowId, index }),
    removeRow: (rowId: string) => dispatch({ type: EditorActionType.RemoveRow, rowId }),
    moveRow: (rowId: string, targetIndex: number) => dispatch({ type: EditorActionType.MoveRow, rowId, targetIndex }),
    updateDetails: (rowId: string, details: RowDetails) => dispatch({
      type: EditorActionType.UpdateRowDetails,
      rowId,
      details
    })
  };

  return (
    <main className="app-shell">
      <EditorToolbar
        pattern={pattern}
        onBarsChange={(value) => dispatch({
          type: EditorActionType.RequestGridChange,
          change: { parameter: GridParameter.Bars, value }
        })}
        onBeatsPerBarChange={(value) => dispatch({
          type: EditorActionType.RequestGridChange,
          change: { parameter: GridParameter.BeatsPerBar, value }
        })}
        onClearGrid={() => dispatch({ type: EditorActionType.ClearPattern })}
        onOpenExport={() => dispatch({ type: EditorActionType.OpenExport })}
        onStepsPerBeatChange={(value) => dispatch({
          type: EditorActionType.RequestGridChange,
          change: { parameter: GridParameter.StepsPerBeat, value }
        })}
      />
      <PatternEditor
        pattern={pattern}
        placementMode={placementMode}
        selectedSymbolId={selectedSymbolId}
        onSelectPlacementMode={(mode) => dispatch({ type: EditorActionType.SelectPlacementMode, mode })}
        onSelectShape={(symbolId) => dispatch({ type: EditorActionType.SelectSymbol, symbolId })}
        rowHandlers={rowHandlers}
      />
      <ExportDialog
        error={exportState.error}
        format={exportState.format}
        isExporting={exportState.isRunning}
        isOpen={exportState.isOpen}
        onClose={() => dispatch({ type: EditorActionType.CloseExport })}
        onExport={exportPattern}
        onFormatChange={(format) => dispatch({ type: EditorActionType.SelectExportFormat, format })}
      />
      <GridChangeDialog
        change={pendingGridChange}
        onCancel={() => dispatch({ type: EditorActionType.CancelGridChange })}
        onConfirm={() => dispatch({ type: EditorActionType.ConfirmGridChange })}
      />
      <FooterLinks />
    </main>
  );
}
