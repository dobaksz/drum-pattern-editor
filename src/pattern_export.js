import { SVG } from "@svgdotjs/svg.js";
import { jsPDF } from "jspdf";
import "svg2pdf.js";
import { getSymbolColor } from "./color";

const SVG_FONT = "Arial, Helvetica, sans-serif";
const PDF_MARGIN = 15;

class PatternDrawing {
  constructor(pattern) {
    this.pattern = pattern;
    this.width = pattern.layout.rowLabelWidth + pattern.layout.rowGap
      + pattern.columnCount * (pattern.layout.cellSize + pattern.layout.gridGap) - pattern.layout.gridGap;
    this.height = pattern.layout.headerHeight
      + pattern.rowCount * (pattern.layout.rowHeight + pattern.layout.gridGap);
    this.document = this.#draw();
  }

  #draw() {
    const drawing = SVG().size(this.width, this.height).viewbox(0, 0, this.width, this.height);
    drawing.rect(this.width, this.height).fill("#ffffff");
    this.pattern.header.forEach((label, index) => this.#drawHeaderCell(drawing, label, index));
    this.pattern.rows.forEach((row, index) => this.#drawRow(drawing, row, index));
    return drawing;
  }

  #drawHeaderCell(drawing, label, index) {
    const { cellSize, gridGap, headerHeight, rowGap, rowLabelWidth } = this.pattern.layout;
    const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
    const isBeat = index % this.pattern.stepsPerBeat === 0;

    drawing.rect(cellSize, headerHeight).move(x, 0).fill(isBeat ? "#667085" : "#7c8495");
    this.#drawText(drawing, label, x + cellSize / 2, 15.5, { opacity: isBeat ? 1 : 0.45 });
  }

  #drawRow(drawing, row, rowIndex) {
    const { cellSize, gridGap, headerHeight, rowGap, rowHeight, rowLabelWidth } = this.pattern.layout;
    const y = headerHeight + rowIndex * (rowHeight + gridGap);

    drawing.rect(rowLabelWidth, rowHeight).move(0, y).fill(row.color);
    this.#drawText(drawing, row.name, rowLabelWidth / 2, y + 15.5, { fill: "#20273a", size: 15 });

    row.cells.forEach((mark, index) => {
      const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
      if (!this.#cellHasMark(row, index)) drawing.rect(cellSize, rowHeight).move(x, y).fill("#eef1f5");
      this.#drawMark(drawing, mark, row.color, x + cellSize / 2, y + cellSize / 2);
    });

    (row.dividers ?? []).forEach((mark, index) => {
      const x = rowLabelWidth + rowGap + (index + 1) * (cellSize + gridGap) - gridGap / 2;
      this.#drawMark(drawing, mark, row.color, x, y + rowHeight / 2);
    });
  }

  #cellHasMark(row, cellIndex) {
    return row.hasMarkAtCell(cellIndex);
  }

  #drawMark(drawing, shapeId, color, cx, cy) {
    const shape = this.pattern.getSymbol(shapeId);
    if (!shape) return;

    const bounds = this.pattern.layout.cellSize;
    const size = bounds / Math.sqrt(2);
    const radius = bounds / 2;
    const strokeWidth = 4;
    const symbolColor = getSymbolColor(color);

    switch (shape.mark) {
      case "dot":
        drawing.circle(radius * 2).center(cx, cy).fill(symbolColor);
        break;
      case "ring":
        drawing.circle((radius - strokeWidth / 2) * 2).center(cx, cy).fill("none").stroke({ color: symbolColor, width: strokeWidth });
        break;
      case "diamond":
        drawing.rect(size, size).center(cx, cy).fill(symbolColor).rotate(45, cx, cy);
        break;
      case "hollow-diamond":
        drawing
          .rect(size - strokeWidth, size - strokeWidth)
          .center(cx, cy)
          .fill("none")
          .stroke({ color: symbolColor, width: strokeWidth })
          .rotate(45, cx, cy);
        break;
    }
  }

  #drawText(drawing, text, x, y, { fill = "#ffffff", opacity = 1, size = 14 } = {}) {
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

export class PatternExporter {
  constructor(pattern) {
    this.drawing = new PatternDrawing(pattern);
  }

  static create(format, pattern) {
    switch (format) {
      case "svg": return new SvgExporter(pattern);
      case "pdf": return new PdfExporter(pattern);
      default: throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async export() {
    return this.#save(await this.createFile());
  }

  createFile() {
    throw new Error("Exporter subclasses must implement createFile().");
  }

  async #save({ blob, description, extension, mimeType, suggestedName }) {
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{ description, accept: { [mimeType]: [extension] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return false;
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
  createFile() {
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
  async createFile() {
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
