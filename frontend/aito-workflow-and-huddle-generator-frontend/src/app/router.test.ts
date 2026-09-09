import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/*
 * WI-05: ReferenceDataDiagnosticPage.tsx (marked "just for testing purpose" in its own header
 * comment) and its "reference-data-diagnostics" route were removed -- the page was never meant
 * to ship and had no auth model of its own beyond the generic ProtectedRoute wrapper.
 *
 * These tests guard against either one silently coming back. They work by reading source files
 * as plain text with Node's fs, rather than importing "./router" and rendering it: this project
 * has no jsdom/happy-dom test environment configured, and react-router's createBrowserRouter
 * needs a real `window` (browser history) to construct, so importing the router module directly
 * would fail here for reasons unrelated to what this test is trying to prove.
 */

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const srcDirectory = path.resolve(currentDirectory, "..");
const thisFilePath = fileURLToPath(import.meta.url);

const removedPagePath = path.resolve(
  srcDirectory,
  "features/workflow-builder/pages/ReferenceDataDiagnosticPage.tsx",
);

const FORBIDDEN_STRINGS = [
  "reference-data-diagnostics",
  "ReferenceDataDiagnosticPage",
];

function collectSourceFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

describe("router (WI-05 diagnostic page removal)", () => {
  it("no longer ships ReferenceDataDiagnosticPage.tsx", () => {
    expect(existsSync(removedPagePath)).toBe(false);
  });

  it("no source file registers the reference-data-diagnostics route or imports the removed page", () => {
    const offenders: { file: string; matched: string }[] = [];

    for (const file of collectSourceFiles(srcDirectory)) {
      if (file === thisFilePath) {
        // This file legitimately mentions both forbidden strings above, to describe what it
        // guards against.
        continue;
      }

      const contents = readFileSync(file, "utf8");

      for (const forbidden of FORBIDDEN_STRINGS) {
        if (contents.includes(forbidden)) {
          offenders.push({ file, matched: forbidden });
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
