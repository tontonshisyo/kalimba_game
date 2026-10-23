import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");
const files = [
  "index.html", "about.html", "manage-7a3d9c2e.html", "manifest.webmanifest", "service-worker.js",
  "assets/css/style.css", "assets/css/public.css", "assets/css/about.css",
  "assets/js/game.js", "assets/js/sharing.js", "assets/js/result-share.js", "assets/js/song-library.js", "assets/js/free-video.js", "assets/js/feedback.js", "assets/js/admin.js",
  "assets/data/custom-charts.json", "assets/data/community-config.json",
  "assets/icons/kalimba.svg", "assets/icons/wood-music.svg"
];
for (const path of files) {
  const target = join(output, path);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(join(root, path), target);
}
let html = await readFile(join(output, "index.html"), "utf8");
html = html.replace("</head>", '  <link rel="stylesheet" href="public.css">\n</head>');
await writeFile(join(output, "index.html"), html);
await copyFile(join(root, "assets/css/public.css"), join(output, "public.css"));
let worker = await readFile(join(output, "service-worker.js"), "utf8");
worker = worker.replace('"./assets/css/style.css",', '"./assets/css/style.css",\n  "./public.css",');
await writeFile(join(output, "service-worker.js"), worker);
await writeFile(join(output, "_headers"), "/service-worker.js\n  Cache-Control: no-cache\n/\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n");
console.log("Public site prepared in dist/");

