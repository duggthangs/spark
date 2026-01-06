import { test, expect } from "bun:test";
import { compileSummary } from "../engine/compiler";
import type { Experience } from "../engine/schema";

test("integration: compiler produces valid Markdown with demo experience", () => {
  const demoExperience: Experience = {
    id: "demo-exp-1",
    title: "CLI Runtime Demo",
    description: "Testing the runtime mode.",
    sections: [
      {
        id: "sec-1",
        type: "live-component",
        title: "Live Code",
        defaultCode: "<div className='p-4 bg-red-100 text-red-800 rounded'>Warning: CLI Mode Active</div>",
      },
      {
        id: "sec-2",
        type: "image-choice",
        title: "Select Theme",
        images: [
          { id: "theme-dark", src: "https://placehold.co/600x400/1e293b/ffffff?text=Dark+Mode", label: "Dark Mode" },
          { id: "theme-light", src: "https://placehold.co/600x400/ffffff/1e293b?text=Light+Mode", label: "Light Mode" },
        ],
      },
      {
        id: "sec-final",
        type: "decision",
        title: "Completion",
        message: "Thanks for testing the CLI. Press Submit to close the server.",
      },
    ],
  };

  const mockResults = {
    "sec-1": "<div className='p-4 bg-blue-100 text-blue-800 rounded'>Updated: User Mode Active</div>",
    "sec-2": "theme-dark",
    "sec-final": true,
  };

  const markdown = compileSummary(demoExperience, mockResults);

  // Verify structure
  expect(markdown).toContain("# CLI Runtime Demo");
  expect(markdown).toContain("Testing the runtime mode.");
  expect(markdown).toContain("---");

  // Verify sections
  expect(markdown).toContain("### Live Code");
  expect(markdown).toContain("```tsx");
  expect(markdown).toContain("<div className='p-4 bg-blue-100 text-blue-800 rounded'>Updated: User Mode Active</div>");

  expect(markdown).toContain("### Select Theme");
  expect(markdown).toContain("**Selected:** Dark Mode (theme-dark)");

  expect(markdown).toContain("### Completion");
  expect(markdown).toContain("✅ **Status:** Approved");
  expect(markdown).toContain("*Thanks for testing the CLI. Press Submit to close the server.*");

  // Verify Markdown formatting
  expect(markdown).toSatisfy((md: string) => md.includes("```tsx"));
  expect(markdown).toSatisfy((md: string) => md.includes("**Selected:**"));
  expect(markdown).toSatisfy((md: string) => md.includes("✅"));
});
