const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
let inlineScript = "";

html = html.replace(
  /<link rel="stylesheet" crossorigin href="\.\/assets\/([^"]+)">/,
  (_, fileName) => {
    const css = fs.readFileSync(path.join(distDir, "assets", fileName), "utf8");
    return `<style>\n${css}\n</style>`;
  }
);

html = html.replace(
  /<script type="module" crossorigin src="\.\/assets\/([^"]+)"><\/script>/,
  (_, fileName) => {
    const js = fs.readFileSync(path.join(distDir, "assets", fileName), "utf8");
    inlineScript = `<script>\n${js}\n</script>`;
    return "";
  }
);

html = html.replace("</body>", () => `    ${inlineScript}\n  </body>`);

fs.writeFileSync(indexPath, html);
