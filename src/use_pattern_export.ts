import { Dispatch, useCallback } from "react";
import { EditorAction, EditorActionType } from "./editor_reducer";
import { PatternData } from "./pattern_data";
import { PatternExporter } from "./pattern_export";
import { ExportFormat } from "./types";

const EXPORT_ERROR = "The diagram could not be exported. Please try again.";

export function usePatternExport(
  pattern: PatternData,
  format: ExportFormat,
  dispatch: Dispatch<EditorAction>
): () => Promise<void> {
  return useCallback(async () => {
    dispatch({ type: EditorActionType.ExportStarted });

    try {
      const saved = await PatternExporter.create(format, pattern).export();
      dispatch({ type: EditorActionType.ExportFinished, saved });
    } catch (error) {
      console.error(error);
      dispatch({ type: EditorActionType.ExportFailed, error: EXPORT_ERROR });
    }
  }, [dispatch, format, pattern]);
}
