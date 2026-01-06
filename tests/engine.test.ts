import { test, expect } from "bun:test";
import { validateExperience } from "../engine/validator";
import type { Experience } from "../engine/schema";

test("Layer 1: Simple InfoSection validates successfully", () => {
  const validExperience: Experience = {
    id: "exp-001",
    title: "Test Experience",
    description: "A minimal test experience",
    sections: [
      {
        id: "section-001",
        type: "info",
        title: "Welcome",
        content: "This is informational content.",
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(validExperience);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toEqual(validExperience);
    expect(result.data.sections).toHaveLength(2);
    const firstSection = result.data.sections[0];
    if (firstSection && firstSection.type === "info") {
      expect(firstSection.content).toBe("This is informational content.");
    }
  }
});

test("Layer 1: Missing required content field fails validation", () => {
  const invalidExperience = {
    id: "exp-001",
    title: "Test Experience",
    sections: [
      {
        id: "section-001",
        type: "info",
        title: "Welcome",
        // Missing 'content' field
      },
    ],
  };

  const result = validateExperience(invalidExperience);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errors.issues.length).toBeGreaterThan(0);
  }
});

test("Layer 1: Invalid section type fails validation", () => {
  const invalidExperience = {
    id: "exp-001",
    title: "Test Experience",
    sections: [
      {
        id: "section-001",
        type: "invalid-type", // Not a valid section type
        title: "Unknown",
      },
    ],
  };

  const result = validateExperience(invalidExperience);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errors.issues.length).toBeGreaterThan(0);
  }
});

test("Layer 1: Unknown fields are stripped (forward compatibility)", () => {
  const experienceWithUnknownFields = {
    id: "exp-001",
    title: "Test Experience",
    unknownField: "should be stripped",
    sections: [
      {
        id: "section-001",
        type: "info",
        title: "Welcome",
        content: "This is informational content.",
        unknownSectionField: "should be stripped",
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
        unknownDecisionField: "should be stripped",
      },
    ],
  };

  const result = validateExperience(experienceWithUnknownFields);

  expect(result.success).toBe(true);
  if (result.success) {
    expect((result.data as any).unknownField).toBeUndefined();
    expect((result.data.sections[0] as any).unknownSectionField).toBeUndefined();
    expect((result.data.sections[1] as any).unknownDecisionField).toBeUndefined();
  }
});

test("Layer 2: Kitchen sink experience with all section types validates successfully", () => {
  const kitchenSinkExperience = {
    id: "exp-kitchen-sink",
    title: "All Section Types",
    description: "Testing all interactive section types",
    sections: [
      {
        id: "section-001",
        type: "info",
        title: "Welcome",
        content: "This experience demonstrates all section types.",
      },
      {
        id: "section-002",
        type: "choice",
        title: "Select your preference",
        options: [
          { id: "opt-1", label: "Option 1" },
          { id: "opt-2", label: "Option 2" },
          { id: "opt-3", label: "Option 3" },
        ],
      },
      {
        id: "section-003",
        type: "rank",
        title: "Rank your priorities",
        items: [
          { id: "item-1", label: "Feature A" },
          { id: "item-2", label: "Feature B" },
          { id: "item-3", label: "Feature C" },
        ],
      },
      {
        id: "section-004",
        type: "text-review",
        title: "Review",
        content: "Please review your selections above.",
      },
      {
        id: "section-005",
        type: "decision",
        title: "Final Decision",
        message: "Are you ready to proceed?",
      },
    ],
  };

  const result = validateExperience(kitchenSinkExperience);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.sections).toHaveLength(5);
    const sec0 = result.data.sections[0];
    const sec1 = result.data.sections[1];
    const sec2 = result.data.sections[2];
    const sec3 = result.data.sections[3];
    const sec4 = result.data.sections[4];
    expect(sec0?.type).toBe("info");
    expect(sec1?.type).toBe("choice");
    expect(sec2?.type).toBe("rank");
    expect(sec3?.type).toBe("text-review");
    expect(sec4?.type).toBe("decision");
  }
});

test("Layer 2: Choice section requires options array", () => {
  const invalidChoiceSection = {
    id: "exp-002",
    title: "Invalid Choice",
    sections: [
      {
        id: "section-001",
        type: "choice",
        title: "Choose one",
        // Missing 'options' field
      },
    ],
  };

  const result = validateExperience(invalidChoiceSection);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errors.issues.length).toBeGreaterThan(0);
  }
});

test("Layer 2: Rank section requires items array", () => {
  const invalidRankSection = {
    id: "exp-003",
    title: "Invalid Rank",
    sections: [
      {
        id: "section-001",
        type: "rank",
        title: "Rank these",
        // Missing 'items' field
      },
    ],
  };

  const result = validateExperience(invalidRankSection);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errors.issues.length).toBeGreaterThan(0);
  }
});

test("Layer 3: Experience without a DecisionSection fails validation", () => {
  const experienceWithoutDecision = {
    id: "exp-no-decision",
    title: "Missing Decision",
    sections: [
      {
        id: "section-001",
        type: "info",
        title: "Welcome",
        content: "This experience has no decision section.",
      },
      {
        id: "section-002",
        type: "choice",
        title: "Choose one",
        options: [{ id: "opt-1", label: "Option 1" }],
      },
    ],
  };

  const result = validateExperience(experienceWithoutDecision);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errors.issues.length).toBeGreaterThan(0);
    const hasDecisionError = result.errors.issues.some(
      (issue) => issue.message.includes("DecisionSection")
    );
    expect(hasDecisionError).toBe(true);
  }
});

test("Layer 3: Experience with multiple DecisionSections fails validation", () => {
  const experienceWithMultipleDecisions = {
    id: "exp-multiple-decisions",
    title: "Multiple Decisions",
    sections: [
      {
        id: "section-001",
        type: "info",
        title: "Welcome",
        content: "This has too many decisions.",
      },
      {
        id: "section-002",
        type: "decision",
        title: "First Decision",
        message: "First gate.",
      },
      {
        id: "section-003",
        type: "decision",
        title: "Second Decision",
        message: "Second gate.",
      },
    ],
  };

  const result = validateExperience(experienceWithMultipleDecisions);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errors.issues.length).toBeGreaterThan(0);
    const hasDecisionError = result.errors.issues.some(
      (issue) => issue.message.includes("DecisionSection")
    );
    expect(hasDecisionError).toBe(true);
  }
});

// ===== NEW SECTION TYPES TESTS =====

test("Phase 1.5: Choice section with multiSelect and allowCustom validates successfully", () => {
  const experience = {
    id: "exp-choice-extended",
    title: "Extended Choice",
    sections: [
      {
        id: "section-001",
        type: "choice",
        title: "Select technologies",
        multiSelect: true,
        allowCustom: true,
        options: [
          { id: "react", label: "React" },
          { id: "vue", label: "Vue" },
          { id: "svelte", label: "Svelte" },
        ],
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "choice") {
      expect(section.multiSelect).toBe(true);
      expect(section.allowCustom).toBe(true);
    }
  }
});

test("Phase 1.5: Kanban section validates successfully", () => {
  const experience = {
    id: "exp-kanban",
    title: "Kanban Prioritization",
    sections: [
      {
        id: "section-001",
        type: "kanban",
        title: "Feature Backlog",
        columns: [
          { id: "must-have", label: "Must Have" },
          { id: "nice-to-have", label: "Nice to Have" },
          { id: "deferred", label: "Deferred" },
        ],
        items: [
          { id: "search", label: "Search", columnId: "must-have" },
          { id: "export", label: "Export", columnId: "nice-to-have" },
        ],
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "kanban") {
      expect(section.columns).toHaveLength(3);
      expect(section.items).toHaveLength(2);
      expect(section.columns[0]?.label).toBe("Must Have");
    }
  }
});

test("Phase 1.5: Image Choice section validates successfully", () => {
  const experience = {
    id: "exp-image-choice",
    title: "Design Review",
    sections: [
      {
        id: "section-001",
        type: "image-choice",
        title: "Select variant",
        images: [
          { id: "variant-a", src: "/images/variant-a.png", label: "Variant A" },
          { id: "variant-b", src: "/images/variant-b.png", label: "Variant B" },
          { id: "variant-c", src: "/images/variant-c.png" },
        ],
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "image-choice") {
      expect(section.images).toHaveLength(3);
      expect(section.images[0]?.label).toBe("Variant A");
      expect(section.images[2]?.label).toBeUndefined();
    }
  }
});

test("Phase 1.5: API Builder section validates successfully", () => {
  const experience = {
    id: "exp-api-builder",
    title: "API Contract Builder",
    sections: [
      {
        id: "section-001",
        type: "api-builder",
        title: "Define endpoint",
        basePath: "/api/v1",
        allowedMethods: ["GET", "POST", "PUT", "DELETE"],
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "api-builder") {
      expect(section.basePath).toBe("/api/v1");
      expect(section.allowedMethods?.length).toBe(4);
    }
  }
});

test("Phase 1.5: Data Mapper section validates successfully", () => {
  const experience = {
    id: "exp-data-mapper",
    title: "Data Mapping",
    sections: [
      {
        id: "section-001",
        type: "data-mapper",
        title: "Map data sources",
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
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "data-mapper") {
      expect(section.sources).toHaveLength(2);
      expect(section.targets).toHaveLength(2);
    }
  }
});

test("Phase 1.5: Live Component section validates successfully", () => {
  const experience = {
    id: "exp-live-component",
    title: "Component Editor",
    sections: [
      {
        id: "section-001",
        type: "live-component",
        title: "Edit component",
        defaultCode: "<Card className='p-4'><HeroImage /></Card>",
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "live-component") {
      expect(section.defaultCode).toContain("<Card");
    }
  }
});

test("Phase 1.5: Numeric Inputs section validates successfully", () => {
  const experience = {
    id: "exp-numeric-inputs",
    title: "Budget Allocator",
    sections: [
      {
        id: "section-001",
        type: "numeric-inputs",
        title: "Allocate budget",
        items: [
          { id: "feature-a", label: "Feature A", max: 100 },
          { id: "feature-b", label: "Feature B", max: 100 },
          { id: "feature-c", label: "Feature C" },
        ],
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "numeric-inputs") {
      expect(section.items).toHaveLength(3);
      expect(section.items[0]?.max).toBe(100);
      expect(section.items[2]?.max).toBeUndefined();
    }
  }
});

test("Phase 1.5: Card Deck section validates successfully", () => {
  const experience = {
    id: "exp-card-deck",
    title: "Persona Selector",
    sections: [
      {
        id: "section-001",
        type: "card-deck",
        title: "Define personas",
        template: {
          name: "",
          avatar: "",
          painPoints: "",
          goals: [],
        },
        initialCards: [
          {
            id: "admin",
            name: "Admin",
            avatar: "👮",
            painPoints: "Too many clicks",
            goals: ["Faster workflows"],
          },
        ],
      },
      {
        id: "section-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(experience);

  expect(result.success).toBe(true);
  if (result.success) {
    const section = result.data.sections[0];
    if (section && section.type === "card-deck") {
      expect(section.template).toBeDefined();
      expect(section.initialCards?.length).toBe(1);
      expect(section.initialCards?.[0]?.name).toBe("Admin");
    }
  }
});

test("Phase 1.5: All new section types in a single experience validate successfully", () => {
  const comprehensiveExperience = {
    id: "exp-comprehensive",
    title: "Comprehensive Test",
    sections: [
      {
        id: "sec-choice",
        type: "choice",
        title: "Tech Stack",
        multiSelect: true,
        allowCustom: true,
        options: [{ id: "react", label: "React" }],
      },
      {
        id: "sec-kanban",
        type: "kanban",
        title: "Prioritization",
        columns: [{ id: "col1", label: "Column 1" }],
        items: [{ id: "item1", label: "Item 1", columnId: "col1" }],
      },
      {
        id: "sec-image",
        type: "image-choice",
        title: "Design Review",
        images: [{ id: "img1", src: "/img1.png" }],
      },
      {
        id: "sec-api",
        type: "api-builder",
        title: "API Builder",
        basePath: "/api/v1",
      },
      {
        id: "sec-mapper",
        type: "data-mapper",
        title: "Data Mapper",
        sources: [{ id: "src1", label: "Source 1" }],
        targets: [{ id: "tgt1", label: "Target 1" }],
      },
      {
        id: "sec-live",
        type: "live-component",
        title: "Live Component",
        defaultCode: "<div>Test</div>",
      },
      {
        id: "sec-numeric",
        type: "numeric-inputs",
        title: "Budget",
        items: [{ id: "budget1", label: "Item 1" }],
      },
      {
        id: "sec-card",
        type: "card-deck",
        title: "Card Deck",
        template: { name: "" },
      },
      {
        id: "sec-decision",
        type: "decision",
        title: "Decision",
      },
    ],
  };

  const result = validateExperience(comprehensiveExperience);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.sections).toHaveLength(9);
    // Verify all new types are present
    const types = result.data.sections.map((s) => s.type);
    expect(types).toContain("choice");
    expect(types).toContain("kanban");
    expect(types).toContain("image-choice");
    expect(types).toContain("api-builder");
    expect(types).toContain("data-mapper");
    expect(types).toContain("live-component");
    expect(types).toContain("numeric-inputs");
    expect(types).toContain("card-deck");
    expect(types).toContain("decision");
  }
});
