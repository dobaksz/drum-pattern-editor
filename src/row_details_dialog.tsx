import { FormEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { PatternRow } from "./pattern_row";
import { RowDetails } from "./pattern_config";

export type RowDialogRequest =
  | { mode: "create" }
  | { mode: "edit"; row: PatternRow }
  | null;

interface RowDetailsDialogProps {
  request: RowDialogRequest;
  onClose: () => void;
  onSubmit: (details: RowDetails) => void;
}

const DEFAULT_COLOR = "#d9d9d9";
const MAX_LABEL_LENGTH = 20;

export function RowDetailsDialog({ request, onClose, onSubmit }: RowDetailsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (request) {
      setName(request.mode === "edit" ? request.row.name : "");
      setColor(request.mode === "edit" ? request.row.color : DEFAULT_COLOR);
      if (!dialog.open) dialog.showModal();
      labelRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [request]);

  const normalizedName = name.trim();

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!normalizedName) return;
    onSubmit({ name: normalizedName, color });
  }

  return (
    <dialog
      className="modal-dialog row-details-dialog"
      ref={dialogRef}
      onCancel={(event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <form className="modal-panel" onSubmit={submit}>
        <div className="modal-heading">
          <h2>{request?.mode === "edit" ? "Edit row" : "Create custom row"}</h2>
          <p>Choose the label and color shown in the pattern and exports.</p>
        </div>
        <div className="row-details-fields">
          <label>
            Label
            <input
              ref={labelRef}
              maxLength={MAX_LABEL_LENGTH}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Row label"
            />
          </label>
          <label>
            Color
            <span className="row-details-color">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
              <span>{color.toUpperCase()}</span>
            </span>
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit" disabled={!normalizedName}>
            {request?.mode === "edit" ? "Save" : "Add row"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
