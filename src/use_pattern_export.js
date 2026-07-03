import { useCallback } from "react";
import { PatternExporter } from "./pattern_export";

const EXPORT_ERROR = "The diagram could not be exported. Please try again.";

export function usePatternExport(pattern, format, dispatch) {
  return useCallback(async () => {
    dispatch({ type: "export-started" });

    try {
      const saved = await PatternExporter.create(format, pattern).export();
      dispatch({ type: "export-finished", saved });
    } catch (error) {
      console.error(error);
      dispatch({ type: "export-failed", error: EXPORT_ERROR });
    }
  }, [dispatch, format, pattern]);
}
