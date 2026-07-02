import { useState } from "react";
import { EditorToolbar } from "./editor_toolbar";
import { ExportDialog } from "./export_dialog";
import { FooterLinks } from "./footer_links";
import { EditorModel } from "./model";
import { PatternEditor } from "./pattern_editor";
import { PatternExporter } from "./pattern_export";

export function App() {
  const [model, setModel] = useState(() => EditorModel.createDefault());
  const { pattern, runtime } = model;

  function updateModel(update) {
    setModel((current) => update(current));
  }

  async function exportDiagram() {
    const patternToExport = pattern;
    const formatToExport = runtime.exportFormat;
    updateModel((current) => current.startExport());

    try {
      const exporter = PatternExporter.create(formatToExport, patternToExport);
      const saved = await exporter.export();
      updateModel((current) => current.finishExport(saved));
    } catch (error) {
      console.error(error);
      updateModel((current) => current.failExport("The diagram could not be exported. Please try again."));
    }
  }

  const rowHandlers = {
    paintCell: (rowId, index) => updateModel((current) => current.paintCell(rowId, index)),
    paintDivider: (rowId, index) => updateModel((current) => current.paintDivider(rowId, index)),
    removeRow: (rowId) => updateModel((current) => current.removeRow(rowId)),
    updateColor: (rowId, color) => updateModel((current) => current.recolorRow(rowId, color)),
    updateName: (rowId, name) => updateModel((current) => current.renameRow(rowId, name))
  };

  return (
    <main className="app-shell">
      <EditorToolbar
        pattern={pattern}
        onBarsChange={(bars) => updateModel((current) => current.withBars(bars))}
        onBeatsPerBarChange={(beats) => updateModel((current) => current.withBeatsPerBar(beats))}
        onClearGrid={() => updateModel((current) => current.clearPattern())}
        onOpenExport={() => updateModel((current) => current.openExportDialog())}
        onStepsPerBeatChange={(steps) => updateModel((current) => current.withStepsPerBeat(steps))}
      />
      <PatternEditor
        pattern={pattern}
        runtime={runtime}
        onAddRow={() => updateModel((current) => current.addRow())}
        onSelectPlacementMode={(mode) => updateModel((current) => current.selectPlacementMode(mode))}
        onSelectShape={(symbolId) => updateModel((current) => current.selectSymbol(symbolId))}
        rowHandlers={rowHandlers}
      />
      <ExportDialog
        error={runtime.exportError}
        format={runtime.exportFormat}
        isExporting={runtime.isExporting}
        isOpen={runtime.isExportDialogOpen}
        onClose={() => updateModel((current) => current.closeExportDialog())}
        onExport={exportDiagram}
        onFormatChange={(format) => updateModel((current) => current.selectExportFormat(format))}
      />
      <FooterLinks />
    </main>
  );
}
