import { z } from "zod";

/**
 * Base schema for all sections.
 * Every section must have an id, type, and optional title.
 */
export const SectionBaseSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Info Section: Displays informational content to the user.
 */
export const InfoSectionSchema = SectionBaseSchema.extend({
  type: z.literal("info"),
  content: z.string(),
});

/**
 * Choice Section: Presents multiple options for the user to choose from.
 * Supports multi-select and custom additions.
 */
export const ChoiceSectionSchema = SectionBaseSchema.extend({
  type: z.literal("choice"),
  multiSelect: z.boolean().optional(),
  allowCustom: z.boolean().optional(),
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
});

/**
 * Rank Section: Presents items for the user to rank in order of preference.
 */
export const RankSectionSchema = SectionBaseSchema.extend({
  type: z.literal("rank"),
  items: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
});

/**
 * Text Review Section: Allows the user to review and provide text feedback.
 */
export const TextReviewSectionSchema = SectionBaseSchema.extend({
  type: z.literal("text-review"),
  content: z.string().optional(),
});

/**
 * Decision Section: Final gate section that marks the end of an experience.
 * This is required exactly once per experience.
 */
export const DecisionSectionSchema = SectionBaseSchema.extend({
  type: z.literal("decision"),
  message: z.string().optional(),
});

/**
 * Kanban Section: Column-based drag-and-drop prioritization interface.
 */
export const KanbanSectionSchema = SectionBaseSchema.extend({
  type: z.literal("kanban"),
  columns: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
  items: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      columnId: z.string(),
    })
  ),
});

/**
 * Image Choice Section: Visual selection from a gallery of images.
 */
export const ImageChoiceSectionSchema = SectionBaseSchema.extend({
  type: z.literal("image-choice"),
  images: z.array(
    z.object({
      id: z.string(),
      src: z.string(),
      label: z.string().optional(),
    })
  ),
});

/**
 * API Builder Section: Define API endpoints interactively.
 */
export const ApiBuilderSectionSchema = SectionBaseSchema.extend({
  type: z.literal("api-builder"),
  basePath: z.string().optional(),
  allowedMethods: z.array(z.string()).optional(),
});

/**
 * Data Mapper Section: Link data sources to UI props with visual connections.
 */
export const DataMapperSectionSchema = SectionBaseSchema.extend({
  type: z.literal("data-mapper"),
  sources: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
  targets: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
});

/**
 * Live Component Section: React component editor with live preview.
 */
export const LiveComponentSectionSchema = SectionBaseSchema.extend({
  type: z.literal("live-component"),
  defaultCode: z.string(),
});

/**
 * Numeric Inputs Section: Budget allocator with numeric input fields.
 */
export const NumericInputsSectionSchema = SectionBaseSchema.extend({
  type: z.literal("numeric-inputs"),
  items: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      max: z.number().optional(),
    })
  ),
});

/**
 * Card Deck Section: Expandable card interface for persona definitions.
 */
export const CardDeckSectionSchema = SectionBaseSchema.extend({
  type: z.literal("card-deck"),
  template: z.record(z.string(), z.any()),
  initialCards: z.array(z.record(z.string(), z.any())).optional(),
});

/**
 * Union of all concrete section types (Layer 2: Interactive Types).
 */
export const SectionSchema = z.discriminatedUnion("type", [
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
]);

/**
 * Experience Schema: The root structure for an interactive experience.
 * Contains metadata and a sequence of sections.
 *
 * Business rule: Must contain exactly one DecisionSection.
 */
export const ExperienceSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    sections: z.array(SectionSchema),
  })
  .refine(
    (data) => {
      const decisionCount = data.sections.filter(
        (section) => section.type === "decision"
      ).length;
      return decisionCount === 1;
    },
    {
      message: "Experience must contain exactly one DecisionSection",
      path: ["sections"],
    }
  );

/**
 * Type exports for TypeScript usage.
 */
export type SectionBase = z.infer<typeof SectionBaseSchema>;
export type InfoSection = z.infer<typeof InfoSectionSchema>;
export type ChoiceSection = z.infer<typeof ChoiceSectionSchema>;
export type RankSection = z.infer<typeof RankSectionSchema>;
export type TextReviewSection = z.infer<typeof TextReviewSectionSchema>;
export type DecisionSection = z.infer<typeof DecisionSectionSchema>;
export type KanbanSection = z.infer<typeof KanbanSectionSchema>;
export type ImageChoiceSection = z.infer<typeof ImageChoiceSectionSchema>;
export type ApiBuilderSection = z.infer<typeof ApiBuilderSectionSchema>;
export type DataMapperSection = z.infer<typeof DataMapperSectionSchema>;
export type LiveComponentSection = z.infer<typeof LiveComponentSectionSchema>;
export type NumericInputsSection = z.infer<typeof NumericInputsSectionSchema>;
export type CardDeckSection = z.infer<typeof CardDeckSectionSchema>;
export type Section =
  | InfoSection
  | ChoiceSection
  | RankSection
  | TextReviewSection
  | DecisionSection
  | KanbanSection
  | ImageChoiceSection
  | ApiBuilderSection
  | DataMapperSection
  | LiveComponentSection
  | NumericInputsSection
  | CardDeckSection;
export type Experience = z.infer<typeof ExperienceSchema>;
