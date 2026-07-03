import { useReducer } from "react";
import { createEditorState, editorReducer } from "./editor_reducer";
import { EditorToolbar } from "./editor_toolbar";
import { ExportDialog } from "./export_dialog";
import { FooterLinks } from "./footer_links";
import { PatternEditor } from "./pattern_editor";
import { usePatternExport } from "./use_pattern_export";

export function App() {
  const [state, dispatch] = useReducer(editorReducer, undefined, createEditorState);
  const { exportState, pattern, placementMode, selectedSymbolId } = state;
  const exportPattern = usePatternExport(pattern, exportState.format, dispatch);

  const rowHandlers = {
    paintCell: (rowId, index) => dispatch({ type: "paint-cell", rowId, index }),
    paintDivider: (rowId, index) => dispatch({ type: "paint-divider", rowId, index }),
    removeRow: (rowId) => dispatch({ type: "remove-row", rowId }),
    updateColor: (rowId, color) => dispatch({ type: "recolor-row", rowId, color }),
    updateName: (rowId, name) => dispatch({ type: "rename-row", rowId, name })
  };

  return (
    <main className="app-shell">
      <EditorToolbar
        pattern={pattern}
        onBarsChange={(value) => dispatch({ type: "set-bars", value })}
        onBeatsPerBarChange={(value) => dispatch({ type: "set-beats-per-bar", value })}
        onClearGrid={() => dispatch({ type: "clear-pattern" })}
        onOpenExport={() => dispatch({ type: "open-export" })}
        onStepsPerBeatChange={(value) => dispatch({ type: "set-steps-per-beat", value })}
      />
      <PatternEditor
        pattern={pattern}
        placementMode={placementMode}
        selectedSymbolId={selectedSymbolId}
        onAddRow={() => dispatch({ type: "add-row" })}
        onSelectPlacementMode={(mode) => dispatch({ type: "select-placement-mode", mode })}
        onSelectShape={(symbolId) => dispatch({ type: "select-symbol", symbolId })}
        rowHandlers={rowHandlers}
      />
      <ExportDialog
        error={exportState.error}
        format={exportState.format}
        isExporting={exportState.isRunning}
        isOpen={exportState.isOpen}
        onClose={() => dispatch({ type: "close-export" })}
        onExport={exportPattern}
        onFormatChange={(format) => dispatch({ type: "select-export-format", format })}
      />
      <FooterLinks />
    </main>
  );
}
