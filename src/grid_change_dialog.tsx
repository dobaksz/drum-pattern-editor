import { MouseEvent as ReactMouseEvent, SyntheticEvent, useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { PendingGridChange } from "./editor_reducer";

interface GridChangeDialogProps {
  change: PendingGridChange | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function GridChangeDialog({ change, onCancel, onConfirm }: GridChangeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (change && !dialog.open) dialog.showModal();
    if (!change && dialog.open) dialog.close();
  }, [change]);

  function handleBackdropClick(event: ReactMouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onCancel();
  }

  return (
    <dialog
      className="modal-dialog"
      ref={dialogRef}
      onCancel={(event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={handleBackdropClick}
      onClose={onCancel}
    >
      <div className="modal-panel">
        <div className="warning-heading">
          <span className="warning-icon"><TriangleAlert size={20} /></span>
          <div className="modal-heading">
            <h2>Clear pattern data?</h2>
            <p>Changing the rhythm settings will clear the current pattern.</p>
          </div>
        </div>
        <p className="warning-message">
          This will erase every symbol and divider. Row names, colors, and ordering will be preserved.
        </p>
        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="danger" type="button" onClick={onConfirm}>Change and clear</button>
        </div>
      </div>
    </dialog>
  );
}
