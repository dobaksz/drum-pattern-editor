import { SVG, Svg } from "@svgdotjs/svg.js";
import { getSymbolColor } from "./color";
import { PatternData } from "./pattern_data";
import { PatternRow } from "./pattern_row";
import {
  BETWEEN_CELL_FRACTIONS,
  BETWEEN_CELL_POSITIONS,
  SymbolId,
  SymbolShape
} from "./types";

const SVG_FONT = "Arial, Helvetica, sans-serif";

interface TextOptions {
  fill?: string;
  opacity?: number;
  size?: number;
}

export class PatternDrawing {
  readonly width: number;
  readonly height: number;
  readonly document: Svg;

  constructor(private readonly pattern: PatternData) {
    const { cellSize, gridGap, headerHeight, rowGap, rowHeight, rowLabelWidth } = pattern.layout;
    this.width = rowLabelWidth + rowGap
      + pattern.columnCount * (cellSize + gridGap) - gridGap;
    this.height = headerHeight + pattern.rowCount * (rowHeight + gridGap);
    this.document = this.draw();
  }

  private draw(): Svg {
    const drawing = SVG().size(this.width, this.height).viewbox(0, 0, this.width, this.height);
    drawing.rect(this.width, this.height).fill("#ffffff");
    this.pattern.header.forEach((label, index) => this.drawHeaderCell(drawing, label, index));
    this.pattern.rows.forEach((row, index) => this.drawRow(drawing, row, index));
    return drawing;
  }

  private drawHeaderCell(drawing: Svg, label: string, index: number): void {
    const { cellSize, gridGap, headerHeight, rowGap, rowLabelWidth } = this.pattern.layout;
    const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
    const isBeat = index % this.pattern.stepsPerBeat === 0;

    drawing.rect(cellSize, headerHeight).move(x, 0).fill(isBeat ? "#667085" : "#7c8495");
    this.drawText(drawing, label, x + cellSize / 2, 15.5, { opacity: isBeat ? 1 : 0.45 });
  }

  private drawRow(drawing: Svg, row: PatternRow, rowIndex: number): void {
    const { cellSize, gridGap, headerHeight, rowGap, rowHeight, rowLabelWidth } = this.pattern.layout;
    const y = headerHeight + rowIndex * (rowHeight + gridGap);

    drawing.rect(rowLabelWidth, rowHeight).move(0, y).fill(row.color);
    this.drawText(drawing, row.name, rowLabelWidth / 2, y + 15.5, { fill: "#20273a", size: 15 });

    row.cells.forEach((symbolId, index) => {
      const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
      if (!row.hasMarkAtCell(index)) drawing.rect(cellSize, rowHeight).move(x, y).fill("#eef1f5");
      this.drawMark(drawing, symbolId, row.color, x + cellSize / 2, y + cellSize / 2);
    });

    const stride = cellSize + gridGap;
    row.betweenCells.forEach((marks, index) => {
      BETWEEN_CELL_POSITIONS.forEach((position) => {
        const x = rowLabelWidth + rowGap + cellSize / 2
          + (index + BETWEEN_CELL_FRACTIONS[position]) * stride;
        this.drawMark(drawing, marks[position], row.color, x, y + rowHeight / 2);
      });
    });
  }

  private drawMark(drawing: Svg, symbolId: SymbolId, color: string, cx: number, cy: number): void {
    const symbol = this.pattern.getSymbol(symbolId);
    if (!symbol) return;

    const bounds = this.pattern.layout.cellSize;
    const size = bounds / Math.sqrt(2);
    const radius = bounds / 2;
    const strokeWidth = 4;
    const symbolColor = getSymbolColor(color);

    switch (symbol.mark) {
      case SymbolShape.Dot:
        drawing.circle(radius * 2).center(cx, cy).fill(symbolColor);
        break;
      case SymbolShape.Ring:
        drawing.circle((radius - strokeWidth / 2) * 2).center(cx, cy)
          .fill("none").stroke({ color: symbolColor, width: strokeWidth });
        break;
      case SymbolShape.Diamond:
        drawing.rect(size, size).center(cx, cy).fill(symbolColor).rotate(45, cx, cy);
        break;
      case SymbolShape.HollowDiamond:
        drawing.rect(size - strokeWidth, size - strokeWidth).center(cx, cy)
          .fill("none").stroke({ color: symbolColor, width: strokeWidth }).rotate(45, cx, cy);
        break;
    }
  }

  private drawText(
    drawing: Svg,
    text: string,
    x: number,
    y: number,
    { fill = "#ffffff", opacity = 1, size = 14 }: TextOptions = {}
  ): void {
    drawing.plain(text).attr({
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
