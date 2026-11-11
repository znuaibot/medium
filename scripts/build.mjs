// build.mjs — esbuild bundle: src/ui/main.ts -> dist/app.js, copy shell files.
import * as esbuild from "esbuild";
import { mkdirSync, copyFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });
await esbuild.build({
  entryPoints: ["src/ui/main.ts"],
  bundle: true,
  outfile: "dist/app.js",
  format: "iife",
  target: "es2022",
  minify: true,
  legalComments: "none",
  logLevel: "warning",
});
copyFileSync("index.html", "dist/index.html");
copyFileSync("src/ui/style.css", "dist/style.css");
console.log("build: dist/app.js + shell copied");
