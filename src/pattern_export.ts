import { SVG, Svg } from "@svgdotjs/svg.js";
import { jsPDF } from "jspdf";
import "svg2pdf.js";
import { getSymbolColor } from "./color";
import { PatternData, PatternRow } from "./model";
import { ExportFormat, SymbolId, SymbolShape } from "./types";

const SVG_FONT = "Arial, Helvetica, sans-serif";
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

interface TextOptions {
  fill?: string;
  opacity?: number;
  size?: number;
}

class PatternDrawing {
  readonly pattern: PatternData;
  readonly width: number;
  readonly height: number;
  readonly document: Svg;

  constructor(pattern: PatternData) {
    this.pattern = pattern;
    this.width = pattern.layout.rowLabelWidth + pattern.layout.rowGap
      + pattern.columnCount * (pattern.layout.cellSize + pattern.layout.gridGap) - pattern.layout.gridGap;
    this.height = pattern.layout.headerHeight
      + pattern.rowCount * (pattern.layout.rowHeight + pattern.layout.gridGap);
    this.document = this.#draw();
  }

  #draw(): Svg {
    const drawing = SVG().size(this.width, this.height).viewbox(0, 0, this.width, this.height);
    drawing.rect(this.width, this.height).fill("#ffffff");
    this.pattern.header.forEach((label, index) => this.#drawHeaderCell(drawing, label, index));
    this.pattern.rows.forEach((row, index) => this.#drawRow(drawing, row, index));
    return drawing;
  }

  #drawHeaderCell(drawing: Svg, label: string, index: number): void {
    const { cellSize, gridGap, headerHeight, rowGap, rowLabelWidth } = this.pattern.layout;
    const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
    const isBeat = index % this.pattern.stepsPerBeat === 0;

    drawing.rect(cellSize, headerHeight).move(x, 0).fill(isBeat ? "#667085" : "#7c8495");
    this.#drawText(drawing, label, x + cellSize / 2, 15.5, { opacity: isBeat ? 1 : 0.45 });
  }

  #drawRow(drawing: Svg, row: PatternRow, rowIndex: number): void {
    const { cellSize, gridGap, headerHeight, rowGap, rowHeight, rowLabelWidth } = this.pattern.layout;
    const y = headerHeight + rowIndex * (rowHeight + gridGap);

    drawing.rect(rowLabelWidth, rowHeight).move(0, y).fill(row.color);
    this.#drawText(drawing, row.name, rowLabelWidth / 2, y + 15.5, { fill: "#20273a", size: 15 });

    row.cells.forEach((mark, index) => {
      const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
      if (!row.hasMarkAtCell(index)) drawing.rect(cellSize, rowHeight).move(x, y).fill("#eef1f5");
      this.#drawMark(drawing, mark, row.color, x + cellSize / 2, y + cellSize / 2);
    });

    row.dividers.forEach((mark, index) => {
      const x = rowLabelWidth + rowGap + (index + 1) * (cellSize + gridGap) - gridGap / 2;
      this.#drawMark(drawing, mark, row.color, x, y + rowHeight / 2);
    });
  }

  #drawMark(drawing: Svg, shapeId: SymbolId, color: string, cx: number, cy: number): void {
    const shape = this.pattern.getSymbol(shapeId);
    if (!shape) return;

    const bounds = this.pattern.layout.cellSize;
    const size = bounds / Math.sqrt(2);
    const radius = bounds / 2;
    const strokeWidth = 4;
    const symbolColor = getSymbolColor(color);

    switch (shape.mark) {
      case SymbolShape.Dot:
        drawing.circle(radius * 2).center(cx, cy).fill(symbolColor);
        break;
      case SymbolShape.Ring:
        drawing.circle((radius - strokeWidth / 2) * 2).center(cx, cy).fill("none").stroke({ color: symbolColor, width: strokeWidth });
        break;
      case SymbolShape.Diamond:
        drawing.rect(size, size).center(cx, cy).fill(symbolColor).rotate(45, cx, cy);
        break;
      case SymbolShape.HollowDiamond:
        drawing
          .rect(size - strokeWidth, size - strokeWidth)
          .center(cx, cy)
          .fill("none")
          .stroke({ color: symbolColor, width: strokeWidth })
          .rotate(45, cx, cy);
        break;
    }
  }

  #drawText(
    drawing: Svg,
    text: string,
    x: number,
    y: number,
    { fill = "#ffffff", opacity = 1, size = 14 }: TextOptions = {}
  ): void {
    drawing.plain(`${text}`).attr({
      x,
      y,
      "text-anchor": "middle",
      "font-family": SVG_FONT,
      "font-size": size,
      fill,
      opacity
    });
  }
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
      default: throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async export(): Promise<boolean> {
    return this.#save(await this.createFile());
  }

  abstract createFile(): ExportFile | Promise<ExportFile>;

  async #save({ blob, description, extension, mimeType, suggestedName }: ExportFile): Promise<boolean> {
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
}

class SvgExporter extends PatternExporter {
  createFile(): ExportFile {
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
  async createFile(): Promise<ExportFile> {
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
