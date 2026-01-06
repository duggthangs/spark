import { z } from "zod";
import { ExperienceSchema } from "./schema";
import type { Section } from "./schema";

/**
 * Validation result type.
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: z.ZodError };

/**
 * Validates an unknown value against the Experience schema.
 * Returns typed validation result with either valid data or Zod errors.
 *
 * @param input - The unknown input to validate
 * @returns ValidationResult with success flag and either data or errors
 */
export function validateExperience(
  input: unknown
): ValidationResult<z.infer<typeof ExperienceSchema>> {
  const result = ExperienceSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Type guard to check if a section is of a specific type.
 * Useful for discriminated unions in UI rendering.
 */
export function isSectionType<T extends Section>(
  section: Section,
  type: string
): section is T {
  return section.type === type;
}
