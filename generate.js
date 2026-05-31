const fs = require("fs");
const path = require("path");

const baseDir = process.argv[2] || "./";
const output = {};
const MEDIA_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm|m4v)$/i;
const SKIP_DIRS = new Set([".git", "node_modules", "js"]);

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(file)) walk(fullPath);
      return;
    }
    if (!MEDIA_EXTENSIONS.test(file)) return;
    const relative = path.relative(baseDir, fullPath);
    const parts = relative.split(path.sep);
    const [sport, team, event, filename] = parts;
    if (!sport || !team || !event || !filename) return;
    if (sport === "Hidden") return;
    output[sport] ??= {};
    output[sport][team] ??= {};
    output[sport][team][event] ??= [];
    output[sport][team][event].push(filename);
  });
}

walk(baseDir);
fs.writeFileSync("data.json", JSON.stringify(output, null, 2));
console.log("✅ data.json generated!");
