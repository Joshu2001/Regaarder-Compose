import React, { useState } from 'react';
import OnboardingIntentStep from './steps/OnboardingIntentStep';
import OnboardingOrganizeStep from './steps/OnboardingOrganizeStep';
import OnboardingAnalyzeStep from './steps/OnboardingAnalyzeStep';
import OnboardingPlanStep from './steps/OnboardingPlanStep';
import OnboardingNewCanvasStep from './steps/OnboardingNewCanvasStep';
import OnboardingRoomStep from './steps/OnboardingRoomStep';
import OnboardingBlankWorkspaceStep from './steps/OnboardingBlankWorkspaceStep';

import { composeCombinedIntents } from '../../services/intentInferenceService';

export default function RegaarderIntentOnboarding({ onComplete, onDismiss }) {
  // Navigation steps: 'intent' | 'organize' | 'research' | 'plan' | 'create' | 'collaborate' | 'blank_workspace'
  const [currentStep, setCurrentStep] = useState('intent');
  const [selectedOutcomeId, setSelectedOutcomeId] = useState('create');
  const [customPrompt, setCustomPrompt] = useState('');

  // Handle outcome selection or direct natural language inference
  const handleSelectIntent = (outcomeIdOrIds, freeText, directInferredAction = null) => {
    setCustomPrompt(freeText || '');

    // If a direct natural language intent was inferred, deliver immediate time-to-first-value!
    if (outcomeIdOrIds === 'inferred' && directInferredAction) {
      setSelectedOutcomeId('inferred');
      handlePathComplete(directInferredAction);
      return;
    }

    // Multi-select handling (Array of intent IDs)
    if (Array.isArray(outcomeIdOrIds)) {
      const selectedList = outcomeIdOrIds;
      if (selectedList.length === 0) return;

      setSelectedOutcomeId(selectedList.join('+'));

      // If single selection in array, route to its dedicated setup step if appropriate
      if (selectedList.length === 1) {
        const single = selectedList[0];
        if (single === 'organize') setCurrentStep('organize');
        else if (single === 'research') setCurrentStep('research');
        else if (single === 'plan') setCurrentStep('plan');
        else if (single === 'collaborate') setCurrentStep('collaborate');
        else setCurrentStep('create');
        return;
      }

      // If multiple intents selected (e.g. 2 or 3), compose combined workspace directly
      const combinedPayload = composeCombinedIntents(selectedList, freeText || '');
      handlePathComplete(combinedPayload);
      return;
    }

    // Legacy single string fallback
    const outcomeId = outcomeIdOrIds;
    setSelectedOutcomeId(outcomeId);

    if (outcomeId === 'organize') {
      setCurrentStep('organize');
    } else if (outcomeId === 'research') {
      setCurrentStep('research');
    } else if (outcomeId === 'plan') {
      setCurrentStep('plan');
    } else if (outcomeId === 'collaborate') {
      setCurrentStep('collaborate');
    } else if (outcomeId === 'create' || outcomeId === 'new') {
      setCurrentStep('create');
    } else {
      setCurrentStep('create');
    }
  };

  // Final Action dispatcher to parent App shell
  const handlePathComplete = (resultPayload) => {
    try {
      localStorage.setItem('rc.hasSeenIntentOnboarding_v1', 'true');
      localStorage.setItem('rc.hasSeenIntentOnboarding_v2', 'true');
      localStorage.setItem('rc.onboardingSelectedIntent', selectedOutcomeId || 'create');
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/45 dark:bg-black/75 backdrop-blur-md p-4 sm:p-6 lg:p-8 select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl min-h-[640px] rounded-3xl bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-white/10 shadow-[0_28px_72px_rgba(0,0,0,0.28)] overflow-hidden transition-all flex flex-col">
        {/* Step 1: Outcome-Oriented Question & First-Class Natural Language Input */}
        {currentStep === 'intent' && (
          <OnboardingIntentStep
            onSelectIntent={handleSelectIntent}
            onSkip={handleSkipToBlank}
          />
        )}

        {/* Outcome Path 1: Make sense of my information (Files & Knowledge) */}
        {currentStep === 'organize' && (
          <OnboardingOrganizeStep
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Outcome Path 2: Research or decide (Orb Web & Memory Investigation) */}
        {currentStep === 'research' && (
          <OnboardingAnalyzeStep
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Outcome Path 3: Plan and execute a project (Milestones, Tasks, Deliverables) */}
        {currentStep === 'plan' && (
          <OnboardingPlanStep
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Outcome Path 4: Create something (Doc, Sheet, Deck, Whiteboard) */}
        {currentStep === 'create' && (
          <OnboardingNewCanvasStep
            initialPrompt={customPrompt}
            onBack={() => setCurrentStep('intent')}
            onComplete={handlePathComplete}
          />
        )}

        {/* Outcome Path 5: Meet or collaborate (Live Video, Shared Stage) */}
        {currentStep === 'collaborate' && (
          <OnboardingRoomStep
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
