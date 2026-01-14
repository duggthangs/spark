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
 * Supports both legacy formats (string/string[]) and new format (ChoiceOption[]).
 */
function formatChoiceSection(section: ChoiceSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  // Normalize result to get selected items
  let selectedItems: Array<{ id: string; label: string }> = [];

  if (Array.isArray(result) && result.length > 0) {
    // Check if it's the new format (array of objects with id/label/selected)
    if (typeof result[0] === 'object' && 'id' in result[0]) {
      // New format: filter to only selected options
      selectedItems = (result as Array<{ id: string; label: string; selected?: boolean }>)
        .filter(opt => opt.selected)
        .map(opt => ({ id: opt.id, label: opt.label }));
    } else {
      // Legacy format: string[] of selected IDs
      selectedItems = (result as string[]).map(id => {
        const option = section.options?.find((opt) => opt.id === id);
        return option ? { id: option.id, label: option.label } : { id, label: id };
      });
    }
  } else if (typeof result === 'string' && result) {
    // Legacy single-select format: just the ID
    const option = section.options?.find((opt) => opt.id === result);
    selectedItems = option 
      ? [{ id: option.id, label: option.label }] 
      : [{ id: result, label: result }];
  }

  if (selectedItems.length === 0) {
    lines.push("*No selections*");
  } else {
    const selections = selectedItems.map(item => `- ${item.label} (${item.id})`);
    lines.push(selections.join("\n"));
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format a Rank section (ordered items).
 * Supports both legacy format (string[]) and new format (RankItem[]).
 */
function formatRankSection(section: RankSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  // Normalize result to get ranked items
  let rankedItems: Array<{ id: string; label: string }> = [];

  if (Array.isArray(result) && result.length > 0) {
    // Check if it's the new format (array of objects with id/label)
    if (typeof result[0] === 'object' && 'id' in result[0]) {
      // New format: array already contains full item data in order
      rankedItems = (result as Array<{ id: string; label: string }>).map(item => ({
        id: item.id,
        label: item.label,
      }));
    } else {
      // Legacy format: string[] of IDs in order
      rankedItems = (result as string[]).map(id => {
        const item = section.items?.find((i) => i.id === id);
        return item ? { id: item.id, label: item.label } : { id, label: id };
      });
    }
  }

  if (rankedItems.length === 0) {
    lines.push("*No rankings*");
  } else {
    rankedItems.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.label} (${item.id})`);
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
  
  // Merge section.items (from schema) with result.__items__ (user-created/edited)
  const schemaItems = section.items || [];
  const customItems = (result && result.__items__) || [];
  
  // Create a map: itemId -> item data (custom items override schema items)
  const itemsById = new Map();
  schemaItems.forEach((item: any) => {
    itemsById.set(item.id, { content: item.label, description: undefined });
  });
  customItems.forEach((item: any) => {
    itemsById.set(item.id, { 
      content: item.content || item.label, 
      description: item.description 
    });
  });

  section.columns?.forEach((col) => {
    lines.push(`#### ${col.label}`);

    const itemIds = columnResults[col.id] || [];
    if (itemIds.length === 0) {
      lines.push("*No items*");
    } else {
      itemIds.forEach((itemId: string) => {
        const itemData = itemsById.get(itemId);
        if (itemData) {
          lines.push(`- ${itemData.content}`);
          // Add description as indented blockquote if present
          if (itemData.description && itemData.description.trim()) {
            lines.push(`  > ${itemData.description}`);
          }
        } else {
          // Fallback if item not found
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
    lines.push("");
    return lines.join("\n");
  }

  // Handle new multi-endpoint format
  if (result.endpoints && Array.isArray(result.endpoints)) {
    const endpoints = result.endpoints;
    
    if (endpoints.length === 0) {
      lines.push("*No endpoints defined*");
      lines.push("");
      return lines.join("\n");
    }

    // Format each endpoint
    endpoints.forEach((endpoint: any, index: number) => {
      if (index > 0) {
        lines.push("---");
        lines.push("");
      }

      // Endpoint header (h4)
      const method = endpoint.method || "GET";
      const path = endpoint.path || "/";
      lines.push(`#### ${method} ${path}`);
      lines.push("");

      if (endpoint.description) {
        lines.push(endpoint.description);
        lines.push("");
      }

      // Path Parameters
      if (endpoint.pathParams && Object.keys(endpoint.pathParams).length > 0) {
        lines.push("**Path Parameters:**");
        Object.entries(endpoint.pathParams).forEach(([key, value]) => {
          lines.push(`- \`${key}\` = \`${value}\``);
        });
        lines.push("");
      }

      // Query Parameters
      if (endpoint.queryParams && Array.isArray(endpoint.queryParams) && endpoint.queryParams.length > 0) {
        const nonEmptyParams = endpoint.queryParams.filter((p: any) => p.key && p.key.trim());
        if (nonEmptyParams.length > 0) {
          lines.push("**Query Parameters:**");
          nonEmptyParams.forEach((param: any) => {
            lines.push(`- \`${param.key}\` = \`${param.value || ''}\``);
          });
          lines.push("");
        }
      }

      // Headers
      if (endpoint.headers && Array.isArray(endpoint.headers) && endpoint.headers.length > 0) {
        const nonEmptyHeaders = endpoint.headers.filter((h: any) => h.key && h.key.trim());
        if (nonEmptyHeaders.length > 0) {
          lines.push("**Headers:**");
          nonEmptyHeaders.forEach((header: any) => {
            lines.push(`- \`${header.key}\`: ${header.value}`);
          });
          lines.push("");
        }
      }

      // Request Body
      if (endpoint.body && typeof endpoint.body === "string" && endpoint.body.trim()) {
        lines.push("**Request Body:**");
        lines.push("");
        lines.push("```json");
        try {
          const parsed = JSON.parse(endpoint.body);
          lines.push(JSON.stringify(parsed, null, 2));
        } catch {
          lines.push(endpoint.body);
        }
        lines.push("```");
        lines.push("");
      }

      // Response
      if (endpoint.responseCode || endpoint.responseBody) {
        const responseLabel = endpoint.responseCode 
          ? `**Expected Response:** ${endpoint.responseCode}${
              endpoint.responseCode >= 200 && endpoint.responseCode < 300 ? ' ✓' :
              endpoint.responseCode >= 400 ? ' ⚠️' : ''
            }`
          : "**Response:**";
        lines.push(responseLabel);
        
        if (endpoint.responseBody && typeof endpoint.responseBody === "string" && endpoint.responseBody.trim()) {
          lines.push("");
          lines.push("```json");
          try {
            const parsed = JSON.parse(endpoint.responseBody);
            lines.push(JSON.stringify(parsed, null, 2));
          } catch {
            lines.push(endpoint.responseBody);
          }
          lines.push("```");
        }
        lines.push("");
      }
    });

    return lines.join("\n");
  }

  // Legacy single-endpoint format (for backward compatibility in tests)
  const typedResult = result as any;
  const method = typedResult.method || "GET";
  const path = typedResult.path || "/";

  lines.push("```http");
  lines.push(`${method} ${path}`);
  lines.push("```");

  if (typedResult.description) {
    lines.push("");
    lines.push(typedResult.description);
  }

  // Path Parameters
  if (typedResult.pathParams && Object.keys(typedResult.pathParams).length > 0) {
    lines.push("");
    lines.push("**Path Parameters:**");
    Object.entries(typedResult.pathParams).forEach(([key, value]) => {
      lines.push(`- \`${key}\` = \`${value}\``);
    });
  }

  // Query Parameters
  if (typedResult.queryParams && Array.isArray(typedResult.queryParams) && typedResult.queryParams.length > 0) {
    lines.push("");
    lines.push("**Query Parameters:**");
    typedResult.queryParams.forEach((param: any) => {
      if (param.key) {
        lines.push(`- \`${param.key}\` = \`${param.value || ''}\``);
      }
    });
  }

  // Headers
  if (typedResult.headers && Array.isArray(typedResult.headers) && typedResult.headers.length > 0) {
    const nonEmptyHeaders = typedResult.headers.filter((h: any) => h.key && h.key.trim());
    if (nonEmptyHeaders.length > 0) {
      lines.push("");
      lines.push("**Headers:**");
      nonEmptyHeaders.forEach((header: any) => {
        lines.push(`- \`${header.key}\`: ${header.value}`);
      });
    }
  }

  // Request Body
  if (typedResult.body && typeof typedResult.body === "string" && typedResult.body.trim()) {
    lines.push("");
    lines.push("**Request Body:**");
    lines.push("");
    lines.push("```json");
    try {
      const parsed = JSON.parse(typedResult.body);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(typedResult.body);
    }
    lines.push("```");
  }

  // Response
  if (typedResult.responseCode || typedResult.responseBody) {
    lines.push("");
    const responseLabel = typedResult.responseCode 
      ? `**Expected Response:** ${typedResult.responseCode}${
          typedResult.responseCode >= 200 && typedResult.responseCode < 300 ? ' ✓' :
          typedResult.responseCode >= 400 ? ' ⚠️' : ''
        }`
      : "**Response:**";
    lines.push(responseLabel);
    
    if (typedResult.responseBody && typeof typedResult.responseBody === "string" && typedResult.responseBody.trim()) {
      lines.push("");
      lines.push("```json");
      try {
        const parsed = JSON.parse(typedResult.responseBody);
        lines.push(JSON.stringify(parsed, null, 2));
      } catch {
        lines.push(typedResult.responseBody);
      }
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
 * Supports both legacy format ({ __items__: [...], itemId: number }) and new array format.
 */
function formatNumericInputsSection(section: NumericInputsSection, result: any): string {
  const lines: string[] = [];

  if (section.title) {
    lines.push(`### ${section.title}`);
  }

  lines.push("");

  if (!result) {
    lines.push("*No values provided*");
    lines.push("");
    return lines.join("\n");
  }

  // Normalize to get items with values
  let items: Array<{ id: string; label: string; max?: number; value: number }> = [];

  // Check for new array format (including empty array)
  if (Array.isArray(result)) {
    if (result.length > 0 && typeof result[0] === 'object' && 'id' in result[0]) {
      items = (result as Array<{ id: string; label: string; max?: number; value?: number }>).map(item => ({
        id: item.id,
        label: item.label,
        max: item.max,
        value: item.value ?? 0,
      }));
    }
    // Empty array = user deleted all items
    // items stays empty
  } 
  // Legacy format: { __items__: [...], itemId: number }
  else if (typeof result === 'object') {
    const legacyItems: Array<{ id: string; label: string; max?: number }> = 
      Array.isArray(result.__items__) ? result.__items__ : (section.items || []);
    
    items = legacyItems.map(item => ({
      id: item.id,
      label: item.label,
      max: item.max,
      value: typeof result[item.id] === 'number' ? result[item.id] : 0,
    }));
  }

  if (items.length === 0) {
    lines.push("*No items*");
    lines.push("");
    return lines.join("\n");
  }

  // Calculate total
  let total = 0;

  items.forEach((item) => {
    total += item.value;
    const displayValue = item.value.toLocaleString();
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
 * Format a comment (reviewer feedback) if present.
 */
function formatComment(comment: string | undefined): string {
  if (!comment || typeof comment !== "string" || !comment.trim()) return "";
  
  return `> **Reviewer Comment:**\n> ${comment.split('\n').join('\n> ')}\n\n`;
}

/**
 * Format a single section based on its type.
 */
function formatSection(section: Section, result: any, comment?: string): string {
  let output = "";
  
  if (isInfoSection(section)) output = formatInfoSection(section);
  else if (isChoiceSection(section)) output = formatChoiceSection(section, result);
  else if (isRankSection(section)) output = formatRankSection(section, result);
  else if (isTextReviewSection(section)) output = formatTextReviewSection(section, result);
  else if (isDecisionSection(section)) output = formatDecisionSection(section, result);
  else if (isKanbanSection(section)) output = formatKanbanSection(section, result);
  else if (isImageChoiceSection(section)) output = formatImageChoiceSection(section, result);
  else if (isApiBuilderSection(section)) output = formatApiBuilderSection(section, result);
  else if (isDataMapperSection(section)) output = formatDataMapperSection(section, result);
  else if (isLiveComponentSection(section)) output = formatLiveComponentSection(section, result);
  else if (isNumericInputsSection(section)) output = formatNumericInputsSection(section, result);
  else if (isCardDeckSection(section)) output = formatCardDeckSection(section, result);
  else if (isCodeSelectorSection(section)) output = formatCodeSelectorSection(section, result);
  else {
    const fallback = section as any;
    output = `### ${fallback.title || fallback.id}\n\n*Unknown section type: ${fallback.type}*\n\n`;
  }

  // Append comment if present
  const commentOutput = formatComment(comment);
  if (commentOutput) {
    output += commentOutput;
  }

  return output;
}

/**
 * Compile a Markdown summary from an Experience and captured results.
 *
 * @param experience - The original experience definition
 * @param results - User's captured results keyed by section ID
 * @param comments - Optional reviewer comments keyed by section ID
 * @returns Formatted Markdown string
 */
export function compileSummary(
  experience: Experience, 
  results: Results,
  comments?: Record<string, string>
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${experience.title}`);
  lines.push("");

  if (experience.author) {
    lines.push(`*By ${experience.author}*`);
    lines.push("");
  }

  if (experience.description) {
    lines.push(experience.description);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // Body - iterate through sections
  experience.sections.forEach((section) => {
    const result = results[section.id];
    const comment = comments?.[section.id];
    const formatted = formatSection(section, result, comment);

    if (formatted.trim()) {
      lines.push(formatted);
    }
  });

  return lines.join("\n");
}
