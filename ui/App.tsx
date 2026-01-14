import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import CommentPanel from './components/CommentPanel';
import WizardLayout from './WizardLayout';
import PlaygroundLayout from './PlaygroundLayout';
import { MOCK_EXPERIENCE } from './mocks';
import { getSectionComponent } from './registry';

declare global {
  interface Window {
    IAEE_MODE?: 'runtime';
  }
}

// FadeIn component
const FadeIn = ({ children, keyName }: { children: React.ReactNode, keyName: string }) => (
  <div key={keyName} className="animate-in fade-in slide-in-from-bottom-2 duration-150 fill-mode-forwards h-full">
    {children}
  </div>
);

export default function App() {
  const [experience, setExperience] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlayground, setIsPlayground] = useState(false);
  const [activeCommentSectionId, setActiveCommentSectionId] = useState<string | null>(null);

  const isRuntimeEnvironment = typeof window !== 'undefined' && window.IAEE_MODE === 'runtime';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPlayground(params.get('mode') === 'playground');

    const loadData = async () => {
      if (window.IAEE_MODE === 'runtime') {
        try {
          const res = await fetch('/api/experience');
          const data = await res.json();
          // Ensure we have a conclusion step if not present
          if (data.sections && !data.sections.find((s: any) => s.type === 'decision')) {
             data.sections.push({ id: 'conclusion', type: 'decision', label: 'Review & Submit' });
          }
          setExperience(data);
        } catch (err) {
          console.error("Failed to load experience", err);
        }
      } else {
        // Dev/Mock mode
        setExperience(MOCK_EXPERIENCE);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAnswer = (sectionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [sectionId]: value }));
  };

  const handleSaveComment = (sectionId: string, comment: string) => {
    setComments(prev => {
      if (!comment || !comment.trim()) {
        // Remove empty comments
        const { [sectionId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sectionId]: comment };
    });
  };

  const getComment = (sectionId: string): string => {
    return comments[sectionId] || '';
  };

  const sections = experience?.sections || [];
  const currentSection = sections[currentStepIndex];
  const totalSteps = sections.length;

  const handleSubmit = async (result: any) => {
    
    const transformedAnswers = { ...answers };

    // Mark the decision section as approved if we're submitting
    const decisionSection = sections.find((s: any) => s.type === 'decision');
    if (decisionSection) {
      transformedAnswers[decisionSection.id] = true;
    }

    const payload = {
      ...result,
      answers: transformedAnswers,
      // Include comments as a separate field - compiler handles them separately
      comments: Object.keys(comments).length > 0 ? comments : undefined
    };

    if (window.IAEE_MODE === 'runtime') {
        await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        console.log("Submit (Mock):", payload);
        alert("Submitted! (Check console)");
    }
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
        // Handle final submit if strictly linear, but usually the last step has a submit button.
        // We'll leave it as is for now, letting the last step handle the final action if it's a "decision" type.
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleEnterPlayground = () => {
    window.location.search = '?mode=playground';
  };

  const handleExitPlayground = () => {
    window.location.search = '';
  };

  const renderSectionContent = (section: any) => {
    if (!section) return null;

    const Component = getSectionComponent(section.type);

    if (!Component) {
        return <div className="p-8 text-slate-500">Unknown section type: {section.type}</div>;
    }

    const value = answers[section.id];
    const onChange = (val: any) => handleAnswer(section.id, val);
    const onSubmit = () => handleSubmit({ experienceId: experience?.id, result: "completed" });

    const content = (
        <Component 
            data={section} 
            value={value} 
            onChange={onChange}
            onSubmit={onSubmit}
        />
    );

    // Decision section doesn't get a comment button and handles its own layout
    if (section.type === 'decision') {
         return content;
    }

    // Wrap with comment button
    const hasComment = !!getComment(section.id);
    
    return (
      <div className="relative h-full">
        {/* Floating comment button */}
        <button
          onClick={() => setActiveCommentSectionId(section.id)}
          className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl transition-all duration-200 ${
            hasComment
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-white/80 backdrop-blur text-slate-400 hover:text-slate-600 hover:bg-white shadow-sm border border-slate-200'
          }`}
          title={hasComment ? 'View comment' : 'Add comment'}
        >
          <MessageSquare className="w-5 h-5" />
          {hasComment && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
          )}
        </button>
        
        {content}
      </div>
    );
  };

  if (isPlayground) {
    return (
      <PlaygroundLayout
        sections={experience?.sections || []}
        renderSection={renderSectionContent}
        onBackToWizard={handleExitPlayground}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-400">
        <div className="animate-pulse">Loading experience...</div>
      </div>
    );
  }

  // Determine navigation state
  const isLastStep = currentStepIndex === totalSteps - 1;
  // If it's the last step (decision), we might want to hide the "Next" button or change it to "Finish" 
  // but typically the Decision component has the CTA. So we can disable Next or hide it.
  // For this "Wizard" feel, the "Next" button usually drives the flow until the end.
  // Let's hide the "Next" button on the final step since the CTA is inside the component.

  // Get active comment section data for panel
  const activeCommentSection = activeCommentSectionId 
    ? sections.find((s: any) => s.id === activeCommentSectionId) 
    : null;
  
  return (
    <>
      <WizardLayout
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          title={experience?.title}
          subtitle={experience?.subtitle}
          author={experience?.author}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentStepIndex > 0}
          canGoNext={currentStepIndex < totalSteps - 1}
          isNextDisabled={false} // Add validation logic here later if needed
          nextLabel={currentStepIndex === totalSteps - 2 ? 'Finish' : 'Next'}
          showDevToolsToggle={!isRuntimeEnvironment}
          onOpenPlayground={handleEnterPlayground}
      >
          <FadeIn keyName={currentSection?.id || 'unknown'}>
              {renderSectionContent(currentSection)}
          </FadeIn>
      </WizardLayout>

      {/* Comment Panel */}
      {activeCommentSection && (
        <CommentPanel
          sectionId={activeCommentSection.id}
          sectionTitle={activeCommentSection.title || activeCommentSection.label || 'Section'}
          comment={getComment(activeCommentSection.id)}
          onClose={() => setActiveCommentSectionId(null)}
          onSave={(comment) => handleSaveComment(activeCommentSection.id, comment)}
        />
      )}
    </>
  );
}
