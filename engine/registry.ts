import {
  InfoSectionSchema,
  ChoiceSectionSchema,
  RankSectionSchema,
  TextReviewSectionSchema,
  DecisionSectionSchema,
  KanbanSectionSchema,
  ImageChoiceSectionSchema,
  ApiBuilderSectionSchema,
  DataMapperSectionSchema,
  LiveComponentSectionSchema,
  NumericInputsSectionSchema,
  CardDeckSectionSchema,
  CodeSelectorSectionSchema,
} from "./schema";

/**
 * Section Registry: Maps section type strings to their Zod schemas.
 * This enables runtime type lookups and validation of individual sections.
 */
export const SectionRegistry = {
  info: InfoSectionSchema,
  choice: ChoiceSectionSchema,
  rank: RankSectionSchema,
  "text-review": TextReviewSectionSchema,
  decision: DecisionSectionSchema,
  kanban: KanbanSectionSchema,
  "image-choice": ImageChoiceSectionSchema,
  "api-builder": ApiBuilderSectionSchema,
  "data-mapper": DataMapperSectionSchema,
  "live-component": LiveComponentSectionSchema,
  "numeric-inputs": NumericInputsSectionSchema,
  "card-deck": CardDeckSectionSchema,
  "code-selector": CodeSelectorSectionSchema,
} as const;

/**
 * Type of all registered section type keys.
 */
export type SectionType = keyof typeof SectionRegistry;

/**
 * List of all valid section type strings.
 */
export const VALID_SECTION_TYPES = Object.keys(SectionRegistry) as SectionType[];

/**
 * Checks if a string is a valid section type.
 */
export function isValidSectionType(type: string): type is SectionType {
  return VALID_SECTION_TYPES.includes(type as SectionType);
}
