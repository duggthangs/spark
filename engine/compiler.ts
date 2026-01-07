import type { 
  Experience, 
  Section, 
  InfoSection, 
  ChoiceSection, 
  RankSection, 
  TextReviewSection, 
  DecisionSection, 
  KanbanSection, 
  ImageChoiceSection, 
  ApiBuilderSection, 
  DataMapperSection, 
  LiveComponentSection, 
  NumericInputsSection, 
  CardDeckSection,
  CodeSelectorSection
} from "./schema";

/**
 * Result structure - a map from section ID to the user's captured result for that section.
 */
export type Results = Record<string, any>;

// Type Guards
const isInfoSection = (s: Section): s is InfoSection => s.type === "info";
const isChoiceSection = (s: Section): s is ChoiceSection => s.type === "choice";
const isRankSection = (s: Section): s is RankSection => s.type === "rank";
const isTextReviewSection = (s: Section): s is TextReviewSection => s.type === "text-review";
const isDecisionSection = (s: Section): s is DecisionSection => s.type === "decision";
const isKanbanSection = (s: Section): s is KanbanSection => s.type === "kanban";
const isImageChoiceSection = (s: Section): s is ImageChoiceSection => s.type === "image-choice";
const isApiBuilderSection = (s: Section): s is ApiBuilderSection => s.type === "api-builder";
const isDataMapperSection = (s: Section): s is DataMapperSection => s.type === "data-mapper";
const isLiveComponentSection = (s: Section): s is LiveComponentSection => s.type === "live-component";
const isNumericInputsSection = (s: Section): s is NumericInputsSection => s.type === "numeric-inputs";
const isCardDeckSection = (s: Section): s is CardDeckSection => s.type === "card-deck";
const isCodeSelectorSection = (s: Section): s is CodeSelectorSection => s.type === "code-selector";

/**
 * Format an Info section (read-only context).
 */
function formatInfoSection(section: InfoSection): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");
  lines.push(`> ${section.content}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Format a Choice section (single or multi-select).
 */
function formatChoiceSection(section: ChoiceSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  // Get selected IDs
  const selectedIds = Array.isArray(result) ? result : result ? [result] : [];

  if (selectedIds.length === 0) {
    lines.push("*No selections*");
  } else {
    // Map IDs to labels
    const selections = selectedIds
      .map((id: string) => {
        const option = section.options?.find((opt) => opt.id === id);
        if (option) {
          return `- ${option.label} (${option.id})`;
        }
        // Handle custom additions
        return `- ${id}`;
      })
      .filter(Boolean);

    if (selections.length > 0) {
      lines.push(selections.join("\n"));
    } else {
      lines.push("*No valid selections*");
    }
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Rank section (ordered items).
 */
function formatRankSection(section: RankSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const rankedIds = Array.isArray(result) ? result : [];

  if (rankedIds.length === 0) {
    lines.push("*No rankings*");
  } else {
    rankedIds.forEach((id: string, index: number) => {
      const item = section.items?.find((i) => i.id === id);
      if (item) {
        lines.push(`${index + 1}. ${item.label} (${item.id})`);
      }
    });
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Text Review section.
 */
function formatTextReviewSection(section: TextReviewSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const content = section.content;
  if (content) {
    lines.push(`> ${content}`);
    lines.push("");
  }

  if (result && typeof result === "string" && result.trim()) {
    lines.push("**User Feedback:**");
    lines.push("");
    lines.push(result);
  } else {
    lines.push("*No feedback provided*");
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Decision section.
 */
function formatDecisionSection(section: DecisionSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const approved = result === true || result === "approved" || result === "yes";
  const statusEmoji = approved ? "✅" : "❌";
  const statusText = approved ? "Approved" : "Rejected";

  lines.push(`${statusEmoji} **Status:** ${statusText}`);

  const message = section.message;
  if (message) {
    lines.push("");
    lines.push(`*${message}*`);
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Kanban section (columns and items).
 */
function formatKanbanSection(section: KanbanSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const columnResults = result && typeof result === "object" ? (result as Record<string, string[]>) : {};

  section.columns?.forEach((col) => {
    lines.push(`#### ${col.label}`);

    const itemIds = columnResults[col.id] || [];
    if (itemIds.length === 0) {
      lines.push("*No items*");
    } else {
      itemIds.forEach((itemId: string) => {
        const item = section.items?.find((i) => i.id === itemId);
        if (item) {
          lines.push(`- ${item.label} (${item.id})`);
        } else {
          lines.push(`- ${itemId}`);
        }
      });
    }

    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Format an Image Choice section.
 */
function formatImageChoiceSection(section: ImageChoiceSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const selectedId = result;

  if (!selectedId) {
    lines.push("*No selection*");
  } else {
    const selectedImage = section.images?.find((img) => img.id === selectedId);
    if (selectedImage) {
      const label = selectedImage.label || selectedImage.id;
      lines.push(`**Selected:** ${label} (${selectedImage.id})`);
    } else {
      lines.push(`**Selected:** ${selectedId}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format an API Builder section.
 */
function formatApiBuilderSection(section: ApiBuilderSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  if (!result || typeof result !== "object") {
    lines.push("*No API defined*");
  } else {
    const typedResult = result as any; // Still using as any for the dynamic result object for now
    const method = typedResult.method || "GET";
    const path = typedResult.path || "/";

    lines.push("```http");
    lines.push(`${method} ${path}`);
    lines.push("```");

    if (typedResult.description) {
      lines.push("");
      lines.push(typedResult.description);
    }

    if (typedResult.headers && Object.keys(typedResult.headers).length > 0) {
      lines.push("");
      lines.push("**Headers:**");
      lines.push("");
      Object.entries(typedResult.headers).forEach(([key, value]) => {
        lines.push(`- \`${key}\`: ${value}`);
      });
    }

    if (typedResult.body) {
      lines.push("");
      lines.push("**Request Body:**");
      lines.push("");
      lines.push("```json");
      lines.push(JSON.stringify(typedResult.body, null, 2));
      lines.push("```");
    }
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Data Mapper section.
 */
function formatDataMapperSection(section: DataMapperSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const connections = Array.isArray(result) ? result : [];

  if (connections.length === 0) {
    lines.push("*No mappings*");
  } else {
    lines.push("| Source | Target |");
    lines.push("|--------|--------|");

    connections.forEach((conn: any) => {
      const source = section.sources?.find((s) => s.id === conn.sourceId);
      const target = section.targets?.find((t) => t.id === conn.targetId);

      const sourceLabel = source ? source.label : conn.sourceId;
      const targetLabel = target ? target.label : conn.targetId;

      lines.push(`| ${sourceLabel} | ${targetLabel} |`);
    });
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Live Component section.
 */
function formatLiveComponentSection(section: LiveComponentSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  if (!result || typeof result !== "string") {
    lines.push("*No code generated*");
  } else {
    lines.push("```tsx");
    lines.push(result);
    lines.push("```");
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Numeric Inputs section.
 */
function formatNumericInputsSection(section: NumericInputsSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  if (!result || typeof result !== "object") {
    lines.push("*No values provided*");
    lines.push("");
    return lines.join("\n");
  }

  // Get items from result.__items__ (dynamic) or fall back to section.items (static)
  const items: Array<{ id: string; label: string; max?: number }> = 
    Array.isArray(result.__items__) ? result.__items__ : (section.items || []);

  if (items.length === 0) {
    lines.push("*No items*");
    lines.push("");
    return lines.join("\n");
  }

  // Calculate total
  let total = 0;

  items.forEach((item) => {
    const value = result[item.id];
    const numValue = typeof value === "number" ? value : 0;
    total += numValue;
    const displayValue = typeof value === "number" ? value.toLocaleString() : "-";
    lines.push(`- **${item.label}:** ${displayValue}${item.max ? ` (max: ${item.max.toLocaleString()})` : ""}`);
  });

  lines.push("");
  lines.push(`**Total:** ${total.toLocaleString()}`);

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Card Deck section.
 */
function formatCardDeckSection(section: CardDeckSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  const cards = Array.isArray(result) ? result : [];

  if (cards.length === 0) {
    lines.push("*No cards created*");
  } else {
    cards.forEach((card: any, index: number) => {
      lines.push(`#### Card ${index + 1}`);
      lines.push("");

      Object.entries(card).forEach(([key, value]) => {
        if (key !== "id") {
          const formattedValue = Array.isArray(value) ? value.join(", ") : String(value);
          lines.push(`- **${key}:** ${formattedValue}`);
        }
      });

      lines.push("");
    });
  }

  return lines.join("\n");
}

/**
 * Format a Code Selector section.
 */
function formatCodeSelectorSection(section: CodeSelectorSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  if (!result || typeof result !== "object") {
    lines.push("*No selection*");
    lines.push("");
    return lines.join("\n");
  }

  const { selectedId, code } = result as { selectedId?: string; code?: Record<string, string> };

  if (!selectedId) {
    lines.push("*No selection*");
    lines.push("");
    return lines.join("\n");
  }

  // Find the selected option
  const selectedOption = section.options?.find((opt) => opt.id === selectedId);
  const label = selectedOption?.label || selectedId;

  lines.push(`**Selected:** ${label} (\`${selectedId}\`)`);
  lines.push("");

  // Get the code (edited or original)
  const editedCode = code?.[selectedId] || selectedOption?.code || "";
  const originalCode = selectedOption?.code || "";
  const wasModified = editedCode !== originalCode;

  // Determine language for syntax highlighting
  const language = section.language || "text";

  lines.push(`\`\`\`${language}`);
  lines.push(editedCode);
  lines.push("```");

  if (wasModified) {
    lines.push("");
    lines.push("*Code was modified from original*");
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a single section based on its type.
 */
function formatSection(section: Section, result: any): string {
  if (isInfoSection(section)) return formatInfoSection(section);
  if (isChoiceSection(section)) return formatChoiceSection(section, result);
  if (isRankSection(section)) return formatRankSection(section, result);
  if (isTextReviewSection(section)) return formatTextReviewSection(section, result);
  if (isDecisionSection(section)) return formatDecisionSection(section, result);
  if (isKanbanSection(section)) return formatKanbanSection(section, result);
  if (isImageChoiceSection(section)) return formatImageChoiceSection(section, result);
  if (isApiBuilderSection(section)) return formatApiBuilderSection(section, result);
  if (isDataMapperSection(section)) return formatDataMapperSection(section, result);
  if (isLiveComponentSection(section)) return formatLiveComponentSection(section, result);
  if (isNumericInputsSection(section)) return formatNumericInputsSection(section, result);
  if (isCardDeckSection(section)) return formatCardDeckSection(section, result);
  if (isCodeSelectorSection(section)) return formatCodeSelectorSection(section, result);

  const fallback = section as any;
  return `### ${fallback.title || fallback.id}\n\n*Unknown section type: ${fallback.type}*\n\n`;
}

/**
 * Compile a Markdown summary from an Experience and captured results.
 *
 * @param experience - The original experience definition
 * @param results - User's captured results keyed by section ID
 * @returns Formatted Markdown string
 */
export function compileSummary(experience: Experience, results: Results): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${experience.title}`);
  lines.push("");

  if (experience.description) {
    lines.push(experience.description);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // Body - iterate through sections
  experience.sections.forEach((section) => {
    const result = results[section.id];
    const formatted = formatSection(section, result);

    if (formatted.trim()) {
      lines.push(formatted);
    }
  });

  return lines.join("\n");
}
