import React, { useState } from 'react';
import OnboardingIntentStep from './steps/OnboardingIntentStep';
import OnboardingOrganizeStep from './steps/OnboardingOrganizeStep';
import OnboardingAnalyzeStep from './steps/OnboardingAnalyzeStep';
import OnboardingPlanStep from './steps/OnboardingPlanStep';
import OnboardingNewCanvasStep from './steps/OnboardingNewCanvasStep';
import OnboardingBlankWorkspaceStep from './steps/OnboardingBlankWorkspaceStep';

export default function RegaarderIntentOnboarding({ onComplete, onDismiss }) {
  // Navigation steps: 'intent' | 'organize' | 'analyze' | 'plan' | 'new' | 'blank_workspace'
  const [currentStep, setCurrentStep] = useState('intent');
  const [selectedIntentId, setSelectedIntentId] = useState('new');
  const [customPrompt, setCustomPrompt] = useState('');

  // Handle Step 1 intent selection -> Diverge into specialized Step 2 paths
  const handleSelectIntent = (intentId, freeText) => {
    setSelectedIntentId(intentId);
    setCustomPrompt(freeText || '');

    if (intentId === 'organize') {
      setCurrentStep('organize');
    } else if (intentId === 'analyze') {
      setCurrentStep('analyze');
    } else if (intentId === 'plan') {
      setCurrentStep('plan');
    } else if (intentId === 'new' || intentId === 'custom') {
      setCurrentStep('new');
    } else {
      setCurrentStep('new');
    }
  };

  // Final Action dispatcher to parent App shell
  const handlePathComplete = (resultPayload) => {
    try {
      localStorage.setItem('rc.hasSeenIntentOnboarding_v1', 'true');
      localStorage.setItem('rc.hasSeenIntentOnboarding_v2', 'true');
      localStorage.setItem('rc.onboardingSelectedIntent', selectedIntentId || 'new');
    } catch (_e) {}

    if (typeof onComplete === 'function') {
      onComplete(resultPayload);
    }
  };

  // Skip flow to start with clean workspace
  const handleSkipToBlank = () => {
    setCurrentStep('blank_workspace');
  };

  const handleStartBlank = () => {
    try {
      localStorage.setItem('rc.hasSeenIntentOnboarding_v1', 'true');
      localStorage.setItem('rc.hasSeenIntentOnboarding_v2', 'true');
    } catch (_e) {}

    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/40 dark:bg-black/70 backdrop-blur-md p-4 sm:p-6 select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl min-h-[600px] rounded-3xl bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.24)] overflow-hidden transition-all flex flex-col">
        {/* Step 1: Broad Intent Selector */}
        {currentStep === 'intent' && (
          <OnboardingIntentStep
            onSelectIntent={handleSelectIntent}
            onSkip={handleSkipToBlank}
          />
        )}

        {/* Specialized Path 1: Organize Existing Work (Universal Memory & File Ingestion) */}
        {currentStep === 'organize' && (
          <OnboardingOrganizeStep
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Specialized Path 2: Research or Analyze (Orb Deep Research & Search) */}
        {currentStep === 'analyze' && (
          <OnboardingAnalyzeStep
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Specialized Path 3: Plan and Execute (Real Milestones & Tasks Workspace) */}
        {currentStep === 'plan' && (
          <OnboardingPlanStep
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Specialized Path 4: Start Something New (Canvas Chooser: Doc, Sheet, Deck, Whiteboard) */}
        {currentStep === 'new' && (
          <OnboardingNewCanvasStep
            initialPrompt={customPrompt}
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Clean Fallback */}
        {currentStep === 'blank_workspace' && (
          <OnboardingBlankWorkspaceStep
            onStartBlank={handleStartBlank}
            onGoBack={() => setCurrentStep('intent')}
          />
        )}
      </div>
    </div>
  );
}
