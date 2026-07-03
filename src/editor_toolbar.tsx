import { Download, Grid2X2, RotateCcw } from "lucide-react";
import { PatternData } from "./model";

interface RhythmControlsProps {
  pattern: PatternData;
  onBarsChange: (value: number) => void;
  onBeatsPerBarChange: (value: number) => void;
  onStepsPerBeatChange: (value: number) => void;
}

interface ActionBarProps {
  onClearGrid: () => void;
  onOpenExport: () => void;
}

interface EditorToolbarProps extends RhythmControlsProps, ActionBarProps {}

function Brand() {
  return (
    <div className="brand">
      <Grid2X2 size={22} />
      <h1>Drum Pattern Editor</h1>
    </div>
  );
}

function RhythmControls({ pattern, onBarsChange, onBeatsPerBarChange, onStepsPerBeatChange }: RhythmControlsProps) {
  return (
    <div className="control-group" aria-label="Rhythm settings">
      <label>
        Bars
        <select value={pattern.bars} onChange={(event) => onBarsChange(Number(event.target.value))}>
          {pattern.barOptions.map((barCount) => (
            <option key={barCount} value={barCount}>
              {barCount}
            </option>
          ))}
        </select>
      </label>
      <label>
        Beats
        <select value={pattern.beatsPerBar} onChange={(event) => onBeatsPerBarChange(Number(event.target.value))}>
          {pattern.beatOptions.map((beatCount) => (
            <option key={beatCount} value={beatCount}>
              {beatCount}
            </option>
          ))}
        </select>
      </label>
      <label>
        Steps per beat
        <select value={pattern.stepsPerBeat} onChange={(event) => onStepsPerBeatChange(Number(event.target.value))}>
          {pattern.stepsPerBeatOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ActionBar({ onClearGrid, onOpenExport }: ActionBarProps) {
  return (
    <div className="actions">
      <button type="button" onClick={onOpenExport} title="Export diagram">
        <Download size={18} />
        Export…
      </button>
      <button type="button" onClick={onClearGrid} title="Clear grid">
        <RotateCcw size={18} />
        Clear
      </button>
    </div>
  );
}

export function EditorToolbar({
  pattern,
  onBarsChange,
  onBeatsPerBarChange,
  onClearGrid,
  onOpenExport,
  onStepsPerBeatChange
}: EditorToolbarProps) {
  return (
    <section className="editor-toolbar" aria-label="Pattern controls">
      <div className="editor-topbar">
        <Brand />
        <ActionBar onClearGrid={onClearGrid} onOpenExport={onOpenExport} />
      </div>
      <div className="editor-ribbon">
        <RhythmControls
          pattern={pattern}
          onBarsChange={onBarsChange}
          onBeatsPerBarChange={onBeatsPerBarChange}
          onStepsPerBeatChange={onStepsPerBeatChange}
        />
      </div>
    </section>
  );
}
