import { MouseEvent as ReactMouseEvent, ReactNode, SyntheticEvent, useEffect, useRef } from "react";
import { Download, FileCode2, FileText } from "lucide-react";
import { ExportFormat } from "./types";

interface ExportDialogProps {
  error: string;
  format: ExportFormat;
  isExporting: boolean;
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void | Promise<void>;
  onFormatChange: (format: ExportFormat) => void;
}

interface FormatOptionProps {
  active: boolean;
  description: string;
  format: ExportFormat;
  icon: ReactNode;
  onChange: (format: ExportFormat) => void;
}

export function ExportDialog({ error, format, isExporting, isOpen, onClose, onExport, onFormatChange }: ExportDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  function handleBackdropClick(event: ReactMouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && !isExporting) onClose();
  }

  return (
    <dialog
      className="export-dialog"
      ref={dialogRef}
      onCancel={(event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        if (!isExporting) onClose();
      }}
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className="export-dialog-panel">
        <div className="export-dialog-heading">
          <h2>Export diagram</h2>
          <p>Choose a file format for the current pattern.</p>
        </div>
        <fieldset className="export-format-options" disabled={isExporting}>
          <legend>File format</legend>
          <FormatOption
            active={format === ExportFormat.Svg}
            description="Scalable vector graphic"
            format={ExportFormat.Svg}
            icon={<FileCode2 size={22} />}
            onChange={onFormatChange}
          />
          <FormatOption
            active={format === ExportFormat.Pdf}
            description="Portrait A4 document"
            format={ExportFormat.Pdf}
            icon={<FileText size={22} />}
            onChange={onFormatChange}
          />
        </fieldset>
        {error && <p className="export-error" role="alert">{error}</p>}
        <div className="export-dialog-actions">
          <button className="secondary" type="button" disabled={isExporting} onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="button" disabled={isExporting} onClick={() => void onExport()}>
            <Download size={17} />
            {isExporting ? "Exporting…" : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function FormatOption({ active, description, format, icon, onChange }: FormatOptionProps) {
  return (
    <label className={active ? "export-format active" : "export-format"}>
      <input
        type="radio"
        name="export-format"
        value={format}
        checked={active}
        onChange={() => onChange(format)}
      />
      {icon}
      <span>
        <strong>{format.toUpperCase()}</strong>
        <small>{description}</small>
      </span>
    </label>
  );
}
