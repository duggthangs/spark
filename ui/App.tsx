import React, { useState, useEffect } from 'react';
import LiveComponent from './sections/LiveComponent';
import ApiEndpointBuilder from './sections/ApiEndpointBuilder';
import DataMapper from './sections/DataMapper';
import KanbanBoard from './sections/KanbanBoard';
import ImageChoice from './sections/ImageChoice';
import InfoSection from './sections/InfoSection';
import ChoiceSection from './sections/ChoiceSection';
import RankSection from './sections/RankSection';
import TextReviewSection from './sections/TextReviewSection';
import WizardLayout from './WizardLayout';
import PlaygroundLayout from './PlaygroundLayout';
import { MOCK_EXPERIENCE } from './mocks';

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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlayground, setIsPlayground] = useState(false);

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
      answers: transformedAnswers
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

    const value = answers[section.id];
    const onChange = (val: any) => handleAnswer(section.id, val);

    switch (section.type) {
      case 'info':
        return <InfoSection data={section} onChange={onChange} />;
      case 'choice':
        return <ChoiceSection data={section} value={value} onChange={onChange} />;
      case 'rank':
        return <RankSection data={section} value={value} onChange={onChange} />;
      case 'text-review':
        return <TextReviewSection data={section} value={value} onChange={onChange} />;
      case 'live-component':
        return <LiveComponent data={section} value={value} onChange={onChange} />;
      case 'api-builder':
        return <ApiEndpointBuilder data={section} value={value} onChange={onChange} />;
      case 'data-mapper':
        return <DataMapper data={section} value={value} onChange={onChange} />;
      case 'kanban':
        return <KanbanBoard data={section} value={value} onChange={onChange} />;
      case 'image-choice':
        return <ImageChoice data={section} value={value} onChange={onChange} />;
      case 'decision':
        return (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <div className="text-4xl">🎉</div>
            </div>
            <h2 className="text-3xl font-light text-slate-900 mb-6">All Set!</h2>
            <p className="text-lg text-slate-600 mb-8">{section.message || "You've completed the setup. Ready to launch?"}</p>
            <button
              onClick={() => handleSubmit({ experienceId: experience?.id, result: "completed" })}
              className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95"
            >
              Submit Experience
            </button>
          </div>
        );
      default:
        return <div className="p-8 text-slate-500">Unknown section type: {section.type}</div>;
    }
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
  
  return (
    <WizardLayout
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        title={experience?.title}
        subtitle={experience?.subtitle}
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
  );
}

