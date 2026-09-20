import React, { useState } from 'react';
import OnboardingIntentStep from './steps/OnboardingIntentStep';
import OnboardingOrganizeStep from './steps/OnboardingOrganizeStep';
import OnboardingAnalyzeStep from './steps/OnboardingAnalyzeStep';
import OnboardingPlanStep from './steps/OnboardingPlanStep';
import OnboardingNewCanvasStep from './steps/OnboardingNewCanvasStep';
import OnboardingRoomStep from './steps/OnboardingRoomStep';
import OnboardingBlankWorkspaceStep from './steps/OnboardingBlankWorkspaceStep';
import OnboardingPreparingWorkspaceStep from './steps/OnboardingPreparingWorkspaceStep';

import { composeCombinedIntents } from '../../services/intentInferenceService';

export default function RegaarderIntentOnboarding({ onComplete, onDismiss }) {
  // Navigation steps: 'intent' | 'preparing' | 'organize' | 'research' | 'plan' | 'create' | 'collaborate' | 'blank_workspace'
  const [currentStep, setCurrentStep] = useState('intent');
  const [selectedOutcomeId, setSelectedOutcomeId] = useState('create');
  const [customPrompt, setCustomPrompt] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);

  // Handle outcome selection or direct natural language inference
  const handleSelectIntent = (outcomeIdOrIds, freeText, directInferredAction = null) => {
    setCustomPrompt(freeText || '');

    // If a direct natural language intent was inferred, prepare tailored payload
    if (outcomeIdOrIds === 'inferred' && directInferredAction) {
      setSelectedOutcomeId('inferred');
      setPendingPayload(directInferredAction);
      setCurrentStep('preparing');
      return;
    }

    // Single intent or multi intent
    const single = Array.isArray(outcomeIdOrIds) ? outcomeIdOrIds[0] : (outcomeIdOrIds || 'create');
    setSelectedOutcomeId(single);
    const combinedPayload = composeCombinedIntents([single], freeText || '');
    setPendingPayload({
      ...combinedPayload,
      guidedIntent: single,
      isSingleGuidedIntent: true
    });
    setCurrentStep('preparing');
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/[0.12] dark:bg-black/[0.22] backdrop-blur-[6px] p-4 sm:p-6 lg:p-8 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-[820px] rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-white/10 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18),0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55)] overflow-hidden transition-all flex flex-col">
        {/* Step 1: Outcome-Oriented Question & First-Class Natural Language Input */}
        {currentStep === 'intent' && (
          <OnboardingIntentStep
            onSelectIntent={handleSelectIntent}
            onSkip={handleSkipToBlank}
          />
        )}

        {/* Labor Illusion Step: Contextual Workspace Preparation */}
        {currentStep === 'preparing' && (
          <OnboardingPreparingWorkspaceStep
            intent={selectedOutcomeId}
            customPrompt={customPrompt}
            onComplete={() => handlePathComplete(pendingPayload)}
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
