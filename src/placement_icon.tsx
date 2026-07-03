import { PlacementMode } from "./types";

export function PlacementIcon({ mode }: { mode: PlacementMode }) {
  if (mode === PlacementMode.CellCenter) {
    return (
      <svg className="placement-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle className="placement-icon-dot" cx="12" cy="12" r="2" />
      </svg>
    );
  }

  const dotX = {
    [PlacementMode.IntervalBefore]: 8,
    [PlacementMode.IntervalCenter]: 12,
    [PlacementMode.IntervalAfter]: 16
  }[mode];

  return (
    <svg className="placement-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="5" width="9" height="14" rx="1.5" />
      <rect x="14" y="5" width="9" height="14" rx="1.5" />
      <circle className="placement-icon-dot" cx={dotX} cy="12" r="2" />
    </svg>
  );
}
