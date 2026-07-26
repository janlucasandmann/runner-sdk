import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import DottedMap from "dotted-map";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputPath = path.join(
  packageRoot,
  "img",
  "platform",
  "deployment-world-map.svg",
);

const map = new DottedMap({
  height: 54,
  grid: "diagonal",
  projection: { name: "equirectangular" },
});

function formatCoordinate(value) {
  return Number(value.toFixed(3)).toString();
}

const dotPath = map
  .getPoints()
  .map(({ x, y }) => `M${formatCoordinate(x)} ${formatCoordinate(y)}h.001`)
  .join("");
const svg = [
  `<svg width="${map.image.width}" height="${map.image.height}" viewBox="0 0 ${map.image.width} ${map.image.height}" xmlns="http://www.w3.org/2000/svg">`,
  '<rect width="100%" height="100%" fill="#000"/>',
  `<path d="${dotPath}" fill="none" stroke="#fff" stroke-opacity=".58" stroke-width=".36" stroke-linecap="round"/>`,
  "</svg>",
].join("");

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${svg}\n`, "utf8");

console.log(
  `Generated ${path.relative(packageRoot, outputPath)} (${map.image.width}x${map.image.height}).`,
);
