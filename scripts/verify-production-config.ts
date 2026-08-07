import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type PackageManifest = {
  dependencies?: Record<string, string>;
};

const root = resolve(import.meta.dir, "..");
const failures: string[] = [];

const readManifest = (path: string): PackageManifest =>
  JSON.parse(readFileSync(resolve(root, path), "utf8")) as PackageManifest;

const rootPackage = readManifest("package.json");
const webPackage = readManifest("apps/web/package.json");
const workflow = readFileSync(
  resolve(root, ".github/workflows/build-and-push.yml"),
  "utf8",
);
const compose = readFileSync(resolve(root, "docker-compose.prod.yml"), "utf8");
const webService = compose.match(/\n  web:\n([\s\S]*?)(?=\nvolumes:)/)?.[1] ?? "";

for (const [name, manifest] of [
  ["root", rootPackage],
  ["web", webPackage],
] as const) {
  if (manifest.dependencies?.next !== "16.2.11") {
    failures.push(`${name} Next.js must be pinned to 16.2.11`);
  }
}

if (!workflow.includes("NEXT_PUBLIC_API_URL=https://viral-api.naufaldi.com")) {
  failures.push("workflow must build the web app with viral-api.naufaldi.com");
}

if (workflow.includes("NEXT_PUBLIC_API_URL=https://viral-api.faldi.xyz")) {
  failures.push("workflow still contains the retired viral-api.faldi.xyz build URL");
}

if (
  workflow.includes("https://viral-api.faldi.xyz") ||
  workflow.includes("https://viral.faldi.xyz")
) {
  failures.push("workflow still probes a retired faldi.xyz production route");
}

if (!compose.includes("caddy: viral.naufaldi.com")) {
  failures.push("web Caddy label must use viral.naufaldi.com");
}

if (!compose.includes("caddy: viral-api.naufaldi.com")) {
  failures.push("API Caddy label must use viral-api.naufaldi.com");
}

if (
  !webService.includes("healthcheck:") ||
  !webService.includes("http://localhost:3000/")
) {
  failures.push("web service must have a localhost HTTP healthcheck");
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Production config safety checks passed");
