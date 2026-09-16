import React, { useState } from 'react';
import OnboardingIntentStep from './steps/OnboardingIntentStep';
import OnboardingPreparationStep from './steps/OnboardingPreparationStep';
import OnboardingWorkspacePayoff from './steps/OnboardingWorkspacePayoff';
import OnboardingContextualHint from './steps/OnboardingContextualHint';
import OnboardingNextValueStep from './steps/OnboardingNextValueStep';
import OnboardingBlankWorkspaceStep from './steps/OnboardingBlankWorkspaceStep';
import { ONBOARDING_INTENT_PRESETS, createCustomIntentPreset } from './onboardingPresets';

export default function RegaarderIntentOnboarding({ onComplete, onDismiss }) {
  const [currentStep, setCurrentStep] = useState('intent');
  const [selectedIntentId, setSelectedIntentId] = useState('new');
  const [activePreset, setActivePreset] = useState(ONBOARDING_INTENT_PRESETS['new']);

  // Handle intent selection (Step 1 -> Step 2)
  const handleSelectIntent = (intentId, freeText) => {
    setSelectedIntentId(intentId);

    let preset;
    if (freeText && freeText.trim().length > 0) {
      preset = createCustomIntentPreset(freeText.trim());
    } else {
      preset = ONBOARDING_INTENT_PRESETS[intentId] || ONBOARDING_INTENT_PRESETS['new'];
    }
    setActivePreset(preset);
    setCurrentStep('preparing');
  };

  // Preparation finished (Step 2 -> Step 3: Populated Workspace Payoff)
  const handlePreparationComplete = () => {
    setCurrentStep('workspace_payoff');
  };

  // Click View Document in Payoff (Step 3 -> Step 4: Contextual Teaching)
  const handleViewDocument = () => {
    setCurrentStep('contextual_hint');
  };

  // Contextual Teaching action (Step 4 -> Step 5: Next Value)
  const handleContextualNext = () => {
    setCurrentStep('next_value');
  };

  // Final completion from Next Value
  const handleFinalComplete = (chosenAction) => {
    try {
      localStorage.setItem('rc.hasSeenIntentOnboarding_v1', 'true');
      localStorage.setItem('rc.hasSeenIntentOnboarding_v2', 'true');
      localStorage.setItem('rc.onboardingSelectedIntent', selectedIntentId || 'new');
    } catch (_e) {}

    if (typeof onComplete === 'function') {
      onComplete({
        ...activePreset,
        suggestedNextAction: chosenAction?.prompt || activePreset?.suggestedNextAction
      });
    }
  };

  // Skip from Step 1 -> Step 6 (Blank Workspace Flow)
  const handleSkipToBlank = () => {
    setCurrentStep('blank_workspace');
  };

  // Blank workspace confirmed from Step 6
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
        {currentStep === 'intent' && (
          <OnboardingIntentStep
            onSelectIntent={handleSelectIntent}
            onSkip={handleSkipToBlank}
          />
        )}

        {currentStep === 'preparing' && (
          <OnboardingPreparationStep
            onComplete={handlePreparationComplete}
          />
        )}

        {currentStep === 'workspace_payoff' && (
          <OnboardingWorkspacePayoff
            preset={activePreset}
            onViewDocument={handleViewDocument}
            onFinish={() => handleFinalComplete(null)}
          />
        )}

        {currentStep === 'contextual_hint' && (
          <OnboardingContextualHint
            preset={activePreset}
            onNextStep={handleContextualNext}
            onDismiss={() => handleFinalComplete(null)}
          />
        )}

        {currentStep === 'next_value' && (
          <OnboardingNextValueStep
            onStartWorking={() => handleFinalComplete(null)}
            onActionSelect={(action) => handleFinalComplete(action)}
          />
        )}

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
