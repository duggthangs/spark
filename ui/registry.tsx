import React from 'react';
import InfoSection from './sections/InfoSection';
import ChoiceSection from './sections/ChoiceSection';
import RankSection from './sections/RankSection';
import TextReviewSection from './sections/TextReviewSection';
import DecisionSection from './sections/DecisionSection';
import KanbanBoard from './sections/KanbanBoard';
import ImageChoice from './sections/ImageChoice';
import ApiEndpointBuilder from './sections/ApiEndpointBuilder';
import DataMapper from './sections/DataMapper';
import LiveComponent from './sections/LiveComponent';
import NumericInputsSection from './sections/NumericInputsSection';
import CardDeckSection from './sections/CardDeckSection';
import CodeSelectorSection from './sections/CodeSelectorSection';

// Define a common interface for section props
// We are using 'any' for now to match existing code, but this sets the stage for stricter typing
export interface SectionProps {
  data: any;
  value?: any;
  onChange?: (val: any) => void;
  onSubmit?: () => void;
}

export const SectionComponentRegistry: Record<string, React.ComponentType<any>> = {
  info: InfoSection,
  choice: ChoiceSection,
  rank: RankSection,
  "text-review": TextReviewSection,
  decision: DecisionSection,
  kanban: KanbanBoard,
  "image-choice": ImageChoice,
  "api-builder": ApiEndpointBuilder,
  "data-mapper": DataMapper,
  "live-component": LiveComponent,
  "numeric-inputs": NumericInputsSection,
  "card-deck": CardDeckSection,
  "code-selector": CodeSelectorSection,
};

export function getSectionComponent(type: string): React.ComponentType<any> | null {
  return SectionComponentRegistry[type] || null;
}
