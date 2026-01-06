import { test, expect } from "bun:test";
import { compileSummary } from "../engine/compiler";
import type { Experience } from "../engine/schema";

test("compiler: formats Info section correctly", () => {
  const experience: Experience = {
    id: "test-001",
    title: "Test Experience",
    description: "Testing info formatting",
    sections: [
      {
        id: "sec-info",
        type: "info",
        title: "Welcome",
        content: "This is informational content for the user.",
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-info": undefined,
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("# Test Experience");
  expect(markdown).toContain("Testing info formatting");
  expect(markdown).toContain("### Welcome");
  expect(markdown).toContain("> This is informational content for the user.");
});

test("compiler: formats Choice section (single select)", () => {
  const experience: Experience = {
    id: "test-002",
    title: "Choice Test",
    sections: [
      {
        id: "sec-choice",
        type: "choice",
        title: "Select Framework",
        options: [
          { id: "react", label: "React" },
          { id: "vue", label: "Vue" },
          { id: "svelte", label: "Svelte" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-choice": "react",
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Select Framework");
  expect(markdown).toContain("- React (react)");
  expect(markdown).not.toContain("- Vue");
});

test("compiler: formats Choice section (multi-select)", () => {
  const experience: Experience = {
    id: "test-003",
    title: "Multi-Choice Test",
    sections: [
      {
        id: "sec-choice",
        type: "choice",
        title: "Select Technologies",
        multiSelect: true,
        options: [
          { id: "react", label: "React" },
          { id: "typescript", label: "TypeScript" },
          { id: "tailwind", label: "Tailwind CSS" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-choice": ["react", "typescript"],
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Select Technologies");
  expect(markdown).toContain("- React (react)");
  expect(markdown).toContain("- TypeScript (typescript)");
  expect(markdown).not.toContain("Tailwind");
});

test("compiler: formats Kanban section", () => {
  const experience: Experience = {
    id: "test-004",
    title: "Kanban Test",
    sections: [
      {
        id: "sec-kanban",
        type: "kanban",
        title: "Feature Backlog",
        columns: [
          { id: "must-have", label: "Must Have" },
          { id: "nice-to-have", label: "Nice to Have" },
        ],
        items: [
          { id: "search", label: "Search", columnId: "must-have" },
          { id: "export", label: "Export", columnId: "nice-to-have" },
          { id: "auth", label: "Authentication", columnId: "must-have" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-kanban": {
      "must-have": ["search", "auth"],
      "nice-to-have": ["export"],
    },
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Feature Backlog");
  expect(markdown).toContain("#### Must Have");
  expect(markdown).toContain("- Search (search)");
  expect(markdown).toContain("- Authentication (auth)");
  expect(markdown).toContain("#### Nice to Have");
  expect(markdown).toContain("- Export (export)");
});

test("compiler: formats Image Choice section", () => {
  const experience: Experience = {
    id: "test-005",
    title: "Image Choice Test",
    sections: [
      {
        id: "sec-image",
        type: "image-choice",
        title: "Select Theme",
        images: [
          { id: "dark", src: "/dark.png", label: "Dark Mode" },
          { id: "light", src: "/light.png", label: "Light Mode" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-image": "dark",
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Select Theme");
  expect(markdown).toContain("**Selected:** Dark Mode (dark)");
});

test("compiler: formats API Builder section", () => {
  const experience: Experience = {
    id: "test-006",
    title: "API Builder Test",
    sections: [
      {
        id: "sec-api",
        type: "api-builder",
        title: "Define Endpoint",
        basePath: "/api/v1",
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-api": {
      method: "POST",
      path: "/users",
      description: "Create a new user",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        name: "John Doe",
        email: "john@example.com",
      },
    },
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Define Endpoint");
  expect(markdown).toContain("```http");
  expect(markdown).toContain("POST /users");
  expect(markdown).toContain("Create a new user");
  expect(markdown).toContain("**Headers:**");
  expect(markdown).toContain("**Request Body:**");
  expect(markdown).toContain('"name": "John Doe"');
});

test("compiler: formats Data Mapper section", () => {
  const experience: Experience = {
    id: "test-007",
    title: "Data Mapper Test",
    sections: [
      {
        id: "sec-mapper",
        type: "data-mapper",
        title: "Map Data Sources",
        sources: [
          { id: "user-api", label: "User API" },
          { id: "orders-api", label: "Orders API" },
        ],
        targets: [
          { id: "profile-component", label: "Profile Component" },
          { id: "orders-table", label: "Orders Table" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-mapper": [
      { sourceId: "user-api", targetId: "profile-component" },
      { sourceId: "orders-api", targetId: "orders-table" },
    ],
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Map Data Sources");
  expect(markdown).toContain("| Source | Target |");
  expect(markdown).toContain("| User API | Profile Component |");
  expect(markdown).toContain("| Orders API | Orders Table |");
});

test("compiler: formats Decision section (approved)", () => {
  const experience: Experience = {
    id: "test-008",
    title: "Decision Test",
    sections: [
      {
        id: "sec-decision",
        type: "decision",
        title: "Final Decision",
        message: "Ready to proceed?",
      },
    ],
  };

  const results = {
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Final Decision");
  expect(markdown).toContain("✅ **Status:** Approved");
  expect(markdown).toContain("*Ready to proceed?*");
});

test("compiler: formats Decision section (rejected)", () => {
  const experience: Experience = {
    id: "test-009",
    title: "Decision Test",
    sections: [
      {
        id: "sec-decision",
        type: "decision",
        title: "Final Decision",
      },
    ],
  };

  const results = {
    "sec-decision": false,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Final Decision");
  expect(markdown).toContain("❌ **Status:** Rejected");
});

test("compiler: formats Live Component section", () => {
  const experience: Experience = {
    id: "test-010",
    title: "Live Component Test",
    sections: [
      {
        id: "sec-live",
        type: "live-component",
        title: "Edit Component",
        defaultCode: "<div>Default</div>",
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-live": "<Card className='p-4'>\n  <HeroImage />\n</Card>",
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Edit Component");
  expect(markdown).toContain("```tsx");
  expect(markdown).toContain("<Card className='p-4'>");
  expect(markdown).toContain("<HeroImage />");
  expect(markdown).toContain("</Card>");
});

test("compiler: formats Numeric Inputs section", () => {
  const experience: Experience = {
    id: "test-011",
    title: "Numeric Inputs Test",
    sections: [
      {
        id: "sec-numeric",
        type: "numeric-inputs",
        title: "Budget Allocation",
        items: [
          { id: "feature-a", label: "Feature A", max: 100 },
          { id: "feature-b", label: "Feature B" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-numeric": {
      "feature-a": 75,
      "feature-b": 50,
    },
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Budget Allocation");
  expect(markdown).toContain("**Feature A:** 75 (max: 100)");
  expect(markdown).toContain("**Feature B:** 50");
});

test("compiler: formats Card Deck section", () => {
  const experience: Experience = {
    id: "test-012",
    title: "Card Deck Test",
    sections: [
      {
        id: "sec-deck",
        type: "card-deck",
        title: "Personas",
        template: { name: "", role: "" },
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-deck": [
      { id: "p1", name: "Admin User", role: "Administrator" },
      { id: "p2", name: "End User", role: "Customer" },
    ],
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Personas");
  expect(markdown).toContain("#### Card 1");
  expect(markdown).toContain("**name:** Admin User");
  expect(markdown).toContain("**role:** Administrator");
  expect(markdown).toContain("#### Card 2");
  expect(markdown).toContain("**name:** End User");
  expect(markdown).toContain("**role:** Customer");
});

test("compiler: formats Rank section", () => {
  const experience: Experience = {
    id: "test-013",
    title: "Rank Test",
    sections: [
      {
        id: "sec-rank",
        type: "rank",
        title: "Prioritize Features",
        items: [
          { id: "search", label: "Search" },
          { id: "export", label: "Export" },
          { id: "auth", label: "Authentication" },
        ],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-rank": ["auth", "search", "export"],
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Prioritize Features");
  expect(markdown).toContain("1. Authentication (auth)");
  expect(markdown).toContain("2. Search (search)");
  expect(markdown).toContain("3. Export (export)");
});

test("compiler: formats Text Review section", () => {
  const experience: Experience = {
    id: "test-014",
    title: "Text Review Test",
    sections: [
      {
        id: "sec-review",
        type: "text-review",
        title: "Feedback",
        content: "Please provide your feedback on the selections above.",
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-review": "Great experience overall! The workflow was smooth.",
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Feedback");
  expect(markdown).toContain("> Please provide your feedback on the selections above.");
  expect(markdown).toContain("**User Feedback:**");
  expect(markdown).toContain("Great experience overall! The workflow was smooth.");
});

test("compiler: handles missing/empty results gracefully", () => {
  const experience: Experience = {
    id: "test-015",
    title: "Empty Results Test",
    sections: [
      {
        id: "sec-choice",
        type: "choice",
        title: "Select Option",
        options: [{ id: "opt1", label: "Option 1" }],
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const results = {
    "sec-choice": null,
    "sec-decision": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("### Select Option");
  expect(markdown).toContain("*No selections*");
});

test("compiler: generates complete summary with multiple sections", () => {
  const experience: Experience = {
    id: "test-016",
    title: "Complete Experience",
    description: "A comprehensive test with multiple section types",
    sections: [
      {
        id: "sec-1",
        type: "info",
        title: "Welcome",
        content: "Welcome to this comprehensive experience.",
      },
      {
        id: "sec-2",
        type: "choice",
        title: "Select Technology",
        options: [
          { id: "react", label: "React" },
          { id: "vue", label: "Vue" },
        ],
      },
      {
        id: "sec-3",
        type: "kanban",
        title: "Prioritization",
        columns: [
          { id: "must", label: "Must Have" },
          { id: "nice", label: "Nice to Have" },
        ],
        items: [
          { id: "item1", label: "Feature 1", columnId: "must" },
          { id: "item2", label: "Feature 2", columnId: "nice" },
        ],
      },
      {
        id: "sec-final",
        type: "decision",
        title: "Complete",
      },
    ],
  };

  const results = {
    "sec-1": undefined,
    "sec-2": "react",
    "sec-3": {
      must: ["item1"],
      nice: ["item2"],
    },
    "sec-final": true,
  };

  const markdown = compileSummary(experience, results);

  expect(markdown).toContain("# Complete Experience");
  expect(markdown).toContain("A comprehensive test with multiple section types");
  expect(markdown).toContain("---");
  expect(markdown).toContain("### Welcome");
  expect(markdown).toContain("> Welcome to this comprehensive experience.");
  expect(markdown).toContain("### Select Technology");
  expect(markdown).toContain("- React (react)");
  expect(markdown).toContain("### Prioritization");
  expect(markdown).toContain("#### Must Have");
  expect(markdown).toContain("- Feature 1 (item1)");
  expect(markdown).toContain("#### Nice to Have");
  expect(markdown).toContain("- Feature 2 (item2)");
  expect(markdown).toContain("### Complete");
  expect(markdown).toContain("✅ **Status:** Approved");
});
