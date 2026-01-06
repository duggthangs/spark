#!/usr/bin/env bun
import { readFile } from "fs/promises";
import { compileSummary } from "./engine/compiler.js";
import { validateExperience } from "./engine/validator.js";

async function demo() {
  // Load demo experience
  const demoPath = process.argv[2] || "./examples/demo.json";
  const demoJson = await readFile(demoPath, "utf-8");
  const demoData = JSON.parse(demoJson);

  // Validate
  const validation = validateExperience(demoData);
  if (!validation.success) {
    console.error("Validation failed:", validation.errors);
    process.exit(1);
  }

  const experience = validation.data;

  // Mock results
  const mockResults: Record<string, any> = {
    "sec-1": "<div className='p-4 bg-blue-100 text-blue-800 rounded'>User updated this</div>",
    "sec-2": "theme-dark",
    "sec-final": true,
  };

  // Compile
  const markdown = compileSummary(experience, mockResults);

  // Output
  console.log("=" .repeat(80));
  console.log("COMPILED MARKDOWN SUMMARY");
  console.log("=".repeat(80));
  console.log();
  console.log(markdown);
  console.log("=".repeat(80));
}

demo().catch(console.error);
