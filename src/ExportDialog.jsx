import React, { useEffect, useRef } from "react";
import { Download, FileCode2, FileText } from "lucide-react";

export function ExportDialog({ error, format, isExporting, isOpen, onClose, onExport, onFormatChange }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isExporting) onClose();
  }

  return (
    <dialog
      className="export-dialog"
      ref={dialogRef}
      onCancel={(event) => {
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
            active={format === "svg"}
            description="Scalable vector graphic"
            format="svg"
            icon={<FileCode2 size={22} />}
            onChange={onFormatChange}
          />
          <FormatOption
            active={format === "pdf"}
            description="Portrait A4 document"
            format="pdf"
            icon={<FileText size={22} />}
            onChange={onFormatChange}
          />
        </fieldset>
        {error && <p className="export-error" role="alert">{error}</p>}
        <div className="export-dialog-actions">
          <CancelButton disabled={isExporting} onClick={onClose} />
          <ExportButton disabled={isExporting} format={format} onClick={onExport} />
        </div>
      </div>
    </dialog>
  );
}

function CancelButton({ disabled, onClick }) {
  return (
    <button className="secondary" type="button" disabled={disabled} onClick={onClick}>
      Cancel
    </button>
  );
}

function ExportButton({ disabled, format, onClick }) {
  return (
    <button className="primary" type="button" disabled={disabled} onClick={() => void onClick()}>
      <Download size={17} />
      {disabled ? "Exporting…" : `Export ${format.toUpperCase()}`}
    </button>
  );
}

function FormatOption({ active, description, format, icon, onChange }) {
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
