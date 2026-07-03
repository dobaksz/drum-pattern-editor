import { jsPDF } from "jspdf";
import "svg2pdf.js";
import { PatternData } from "./pattern_data";
import { PatternDrawing } from "./pattern_drawing";
import { ExportFormat } from "./types";

const PDF_MARGIN = 15;

interface ExportFile {
  blob: Blob;
  description: string;
  extension: `.${string}`;
  mimeType: string;
  suggestedName: string;
}

interface WritableFile {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface SaveFileHandle {
  createWritable(): Promise<WritableFile>;
}

interface SaveFilePickerWindow extends Window {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<SaveFileHandle>;
}

export abstract class PatternExporter {
  protected readonly drawing: PatternDrawing;

  constructor(pattern: PatternData) {
    this.drawing = new PatternDrawing(pattern);
  }

  static create(format: ExportFormat, pattern: PatternData): PatternExporter {
    switch (format) {
      case ExportFormat.Svg: return new SvgExporter(pattern);
      case ExportFormat.Pdf: return new PdfExporter(pattern);
    }
  }

  async export(): Promise<boolean> {
    return saveFile(await this.createFile());
  }

  protected abstract createFile(): ExportFile | Promise<ExportFile>;
}

class SvgExporter extends PatternExporter {
  protected createFile(): ExportFile {
    return {
      blob: new Blob([this.drawing.document.svg()], { type: "image/svg+xml;charset=utf-8" }),
      description: "SVG image",
      extension: ".svg",
      mimeType: "image/svg+xml",
      suggestedName: "drum-pattern.svg"
    };
  }
}

class PdfExporter extends PatternExporter {
  protected async createFile(): Promise<ExportFile> {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = Math.min(
      (pageWidth - PDF_MARGIN * 2) / this.drawing.width,
      (pageHeight - PDF_MARGIN * 2) / this.drawing.height
    );
    const width = this.drawing.width * scale;
    const height = this.drawing.height * scale;

    await pdf.svg(this.drawing.document.node, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height
    });

    return {
      blob: pdf.output("blob"),
      description: "PDF document",
      extension: ".pdf",
      mimeType: "application/pdf",
      suggestedName: "drum-pattern.pdf"
    };
  }
}

async function saveFile({ blob, description, extension, mimeType, suggestedName }: ExportFile): Promise<boolean> {
  const pickerWindow = window as SaveFilePickerWindow;
  if (pickerWindow.showSaveFilePicker) {
    try {
      const handle = await pickerWindow.showSaveFilePicker({
        suggestedName,
        types: [{ description, accept: { [mimeType]: [extension] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return false;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
}
