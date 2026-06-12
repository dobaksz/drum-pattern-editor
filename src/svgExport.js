const SVG_FONT = "Arial, Helvetica, sans-serif";
const FILLED_MARK_MIX = 0.72;
const HOLLOW_MARK_MIX = 0.82;

function escapeXml(value) {
  return `${value}`.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;"
  })[char]);
}

function mixHexColors(hex, otherHex, amount) {
  const normalize = (value) => {
    const hexValue = value.replace("#", "");
    return hexValue.length === 3
      ? hexValue.split("").map((char) => char + char).join("")
      : hexValue.padEnd(6, "0").slice(0, 6);
  };
  const source = normalize(hex);
  const target = normalize(otherHex);
  const channels = [0, 2, 4].map((index) => {
    const a = parseInt(source.slice(index, index + 2), 16);
    const b = parseInt(target.slice(index, index + 2), 16);
    return Math.round(a * amount + b * (1 - amount)).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function createText({ x, y, text, size = 14, fill = "#ffffff", opacity = 1 }) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SVG_FONT}" font-size="${size}" fill="${fill}" opacity="${opacity}">${escapeXml(text)}</text>`;
}

function createHeaderCell({ label, index, layout, stepsPerBeat }) {
  const { cellSize, gridGap, headerHeight, rowGap, rowLabelWidth } = layout;
  const x = rowLabelWidth + rowGap + index * (cellSize + gridGap);
  const isBeat = index % stepsPerBeat === 0;

  return [
    `<rect x="${x}" y="0" width="${cellSize}" height="${headerHeight}" fill="${isBeat ? "#667085" : "#7c8495"}"/>`,
    createText({
      x: x + cellSize / 2,
      y: 15.5,
      text: label,
      opacity: isBeat ? 1 : 0.45
    })
  ].join("");
}

function createMarkSvg({ cell, color, cx, cy, shapeById }) {
  const shape = shapeById[cell];
  if (!shape) return "";

  const symbolSize = 15.5;
  const symbolRadius = 8.5;
  const filledColor = mixHexColors(color, "#000000", FILLED_MARK_MIX);
  const hollowColor = mixHexColors(color, "#000000", HOLLOW_MARK_MIX);

  if (shape.mark === "dot") {
    return `<circle cx="${cx}" cy="${cy}" r="${symbolRadius}" fill="${filledColor}"/>`;
  }
  if (shape.mark === "ring") {
    return `<circle cx="${cx}" cy="${cy}" r="${symbolRadius - 2}" fill="#ffffff" stroke="${hollowColor}" stroke-width="4"/>`;
  }
  if (shape.mark === "diamond") {
    return `<rect x="${cx - symbolSize / 2}" y="${cy - symbolSize / 2}" width="${symbolSize}" height="${symbolSize}" fill="${filledColor}" transform="rotate(45 ${cx} ${cy})"/>`;
  }
  if (shape.mark === "hollow-diamond") {
    return `<rect x="${cx - symbolSize / 2}" y="${cy - symbolSize / 2}" width="${symbolSize}" height="${symbolSize}" fill="#ffffff" stroke="${hollowColor}" stroke-width="4" transform="rotate(45 ${cx} ${cy})"/>`;
  }
  return "";
}

function createGridCell({ cell, cellIndex, row, y, layout, shapeById }) {
  const { cellSize, gridGap, rowGap, rowHeight, rowLabelWidth } = layout;
  const x = rowLabelWidth + rowGap + cellIndex * (cellSize + gridGap);
  const background = `<rect x="${x}" y="${y}" width="${cellSize}" height="${rowHeight}" fill="#eef1f5"/>`;
  const mark = createMarkSvg({
    cell,
    color: row.color,
    cx: x + cellSize / 2,
    cy: y + cellSize / 2,
    shapeById
  });

  return `${background}${mark}`;
}

function createPatternRow({ row, rowIndex, layout, shapeById }) {
  const { gridGap, headerHeight, rowHeight, rowLabelWidth } = layout;
  const y = headerHeight + rowIndex * (rowHeight + gridGap);

  return [
    `<rect x="0" y="${y}" width="${rowLabelWidth}" height="${rowHeight}" fill="${row.color}"/>`,
    createText({
      x: rowLabelWidth / 2,
      y: y + 15.5,
      text: row.name,
      size: 15,
      fill: "#20273a"
    }),
    ...row.cells.map((cell, cellIndex) => createGridCell({ cell, cellIndex, row, y, layout, shapeById }))
  ].join("");
}

export function createPatternSvg({ columnCount, header, layout, rows, shapeById, stepsPerBeat }) {
  const { cellSize, gridGap, headerHeight, rowGap, rowHeight, rowLabelWidth } = layout;
  const gridWidth = columnCount * (cellSize + gridGap) - gridGap;
  const width = rowLabelWidth + rowGap + gridWidth;
  const height = headerHeight + rows.length * (rowHeight + gridGap);
  const body = [
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    ...header.map((label, index) => createHeaderCell({ label, index, layout, stepsPerBeat })),
    ...rows.map((row, rowIndex) => createPatternRow({ row, rowIndex, layout, shapeById }))
  ].join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}
