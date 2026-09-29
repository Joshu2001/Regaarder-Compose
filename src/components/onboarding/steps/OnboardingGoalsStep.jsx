import React, { useState } from 'react';
import { ArrowRight, Plus, Check, ChevronLeft, X, Target, Pencil, Trash2 } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import {
  UNIVERSAL_GOAL_DEFINITIONS,
  saveWorkspaceGoals,
  getWorkspaceGoals,
  saveWorkspaceMilestones,
  getWorkspaceMilestones
} from '../../../services/workspaceGoalsService';

/**
 * OnboardingGoalsStep
 * 
 * Implements the core product hierarchy: Goal -> Milestone -> Task.
 * 
 * Phase 1: Establish Desired Outcomes ("What are you trying to accomplish?")
 * Phase 2: Optional Milestone Tracking ("Want to track milestones?")
 * 
 * Designed with Apple aesthetic: spacious, calm, restrained single-accent purple,
 * sharp rounded corners (no pills), zero Asana/Jira clutter, fully skippable.
 */
export default function OnboardingGoalsStep({ onBack, onProceed, onSkip }) {
  // Phase 'goals' (What are you trying to accomplish?) | 'milestones' (Want to track milestones?)
  const [phase, setPhase] = useState('goals');

  // Selected Goals (Array of string titles)
  const [selectedGoals, setSelectedGoals] = useState(() => {
    const existing = getWorkspaceGoals();
    return existing && existing.length > 0 ? existing : [];
  });

  // Custom Goal Input State
  const [customGoalText, setCustomGoalText] = useState('');

  // Selected Milestones State (Derived from chosen goals or custom input)
  const [selectedMilestones, setSelectedMilestones] = useState(() => {
    const existing = getWorkspaceMilestones();
    return existing && existing.length > 0 ? existing : [];
  });
  const [customMilestoneText, setCustomMilestoneText] = useState('');

  // Inline Milestone Editing State
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null);
  const [editingMilestoneText, setEditingMilestoneText] = useState('');

  // Maximum allowed goals limit
  const MAX_GOALS = 3;

  // Toggle Goal selection (Enforce maximum of 3 selections)
  const toggleGoal = (goalTitle) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalTitle)) {
        return prev.filter((g) => g !== goalTitle);
      }
      if (prev.length >= MAX_GOALS) {
        return prev;
      }
      return [...prev, goalTitle];
    });
  };

  // Add custom goal (first-class citizen, enforces 3-goal maximum)
  const handleAddCustomGoal = (e) => {
    if (e) e.preventDefault();
    const trimmed = customGoalText.trim();
    if (!trimmed) return;
    if (selectedGoals.length >= MAX_GOALS) return;
    if (!selectedGoals.includes(trimmed)) {
      setSelectedGoals((prev) => [...prev, trimmed]);
    }
    setCustomGoalText('');
  };

  // Remove a goal
  const handleRemoveGoal = (goalTitle) => {
    setSelectedGoals((prev) => prev.filter((g) => g !== goalTitle));
  };

  // Milestone list maintained in local state so items can be edited or deleted
  const [milestoneList, setMilestoneList] = useState([]);

  // Compute suggested milestones based on selected goals
  const activeSuggestedMilestones = React.useMemo(() => {
    const suggestions = [];
    selectedGoals.forEach((goalTitle) => {
      const match = UNIVERSAL_GOAL_DEFINITIONS.find((def) => def.title === goalTitle);
      if (match && match.suggestedMilestones) {
        match.suggestedMilestones.forEach((m) => {
          if (!suggestions.includes(m)) suggestions.push(m);
        });
      }
    });
    // Fallback if custom goals only
    if (suggestions.length === 0 && selectedGoals.length > 0) {
      suggestions.push(
        'Establish initial workspace baseline and context',
        'Define key operational checkpoints',
        'Track weekly progress and outcome completion'
      );
    }
    return suggestions;
  }, [selectedGoals]);

  // Sync initial milestoneList when phase changes to milestones or goals change
  React.useEffect(() => {
    if (phase === 'milestones') {
      const initial = activeSuggestedMilestones.length > 0
        ? [...activeSuggestedMilestones]
        : [
            'Establish initial workspace baseline and context',
            'Define key operational checkpoints',
            'Track weekly progress and outcome completion'
          ];
      setMilestoneList(initial);
      if (selectedMilestones.length === 0) {
        setSelectedMilestones(initial.slice(0, 3));
      }
    }
  }, [phase, activeSuggestedMilestones]);

  // Toggle milestone selection
  const toggleMilestone = (milestoneText) => {
    setSelectedMilestones((prev) =>
      prev.includes(milestoneText)
        ? prev.filter((m) => m !== milestoneText)
        : [...prev, milestoneText]
    );
  };

  // Add custom milestone
  const handleAddCustomMilestone = (e) => {
    if (e) e.preventDefault();
    const trimmed = customMilestoneText.trim();
    if (!trimmed) return;
    if (!milestoneList.includes(trimmed)) {
      setMilestoneList((prev) => [...prev, trimmed]);
    }
    if (!selectedMilestones.includes(trimmed)) {
      setSelectedMilestones((prev) => [...prev, trimmed]);
    }
    setCustomMilestoneText('');
  };

  // Delete a milestone item
  const handleDeleteMilestone = (e, index) => {
    e.stopPropagation();
    const itemToDelete = milestoneList[index];
    setMilestoneList((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedMilestones((prev) => prev.filter((m) => m !== itemToDelete));
    if (editingMilestoneIndex === index) {
      setEditingMilestoneIndex(null);
      setEditingMilestoneText('');
    }
  };

  // Start inline editing
  const handleStartEditMilestone = (e, index) => {
    e.stopPropagation();
    setEditingMilestoneIndex(index);
    setEditingMilestoneText(milestoneList[index] || '');
  };

  // Save inline edit
  const handleSaveEditMilestone = (e, index) => {
    if (e) e.stopPropagation();
    const trimmed = editingMilestoneText.trim();
    if (!trimmed) {
      setEditingMilestoneIndex(null);
      return;
    }
    const oldText = milestoneList[index];
    setMilestoneList((prev) => {
      const next = [...prev];
      next[index] = trimmed;
      return next;
    });
    setSelectedMilestones((prev) =>
      prev.map((m) => (m === oldText ? trimmed : m))
    );
    setEditingMilestoneIndex(null);
    setEditingMilestoneText('');
  };

  // Cancel inline edit
  const handleCancelEditMilestone = (e) => {
    if (e) e.stopPropagation();
    setEditingMilestoneIndex(null);
    setEditingMilestoneText('');
  };

  // Proceed from Goals phase -> Milestones phase (or finish if no goals chosen)
  const handleGoalsProceed = () => {
    // If user selected or typed a pending goal
    if (customGoalText.trim() && !selectedGoals.includes(customGoalText.trim())) {
      const updated = [...selectedGoals, customGoalText.trim()];
      setSelectedGoals(updated);
      saveWorkspaceGoals(updated);
      setCustomGoalText('');
      setPhase('milestones');
      return;
    }

    if (selectedGoals.length > 0) {
      saveWorkspaceGoals(selectedGoals);
      setPhase('milestones');
    } else {
      // If no goals selected, treat as skip directly to workspace
      onSkip();
    }
  };

  // Final confirmation: save goals & milestones and notify parent
  const handleFinalFinish = () => {
    if (selectedGoals.length > 0) {
      saveWorkspaceGoals(selectedGoals);
    }
    if (selectedMilestones.length > 0) {
      saveWorkspaceMilestones(selectedMilestones);
    }
    onProceed({
      goals: selectedGoals,
      milestones: selectedMilestones
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-6 sm:p-9 lg:p-11 select-none animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pb-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={phase === 'milestones' ? () => setPhase('goals') : onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={phase === 'milestones' ? 'Back to Goals' : 'Back to Intent Selection'}
          >
            <ChevronLeft size={18} />
          </button>
          <RegaarderBrandIcon size={22} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder Workspace
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-slate-400 dark:text-zinc-500 font-medium">
            {phase === 'goals' ? 'Step 2 of 2' : 'Checkpoints'}
          </span>
          <div className="w-20 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-500 ${
                phase === 'goals' ? 'w-2/3' : 'w-full'
              }`}
            />
          </div>
        </div>
      </div>

      {/* PHASE 1: Establish Desired Outcomes */}
      {phase === 'goals' && (
        <div className="w-full max-w-3xl mx-auto my-auto py-2 animate-in fade-in duration-200">
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[22px] sm:text-[25px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
                What are you trying to accomplish?
              </h1>
              <span className="text-[12px] font-medium text-slate-400 dark:text-zinc-500 shrink-0">
                Choose up to 3
              </span>
            </div>
            <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
              Tell Regaarder what you're working toward. We'll use your goals to organize your workspace and help you make progress.
            </p>
          </div>

          {/* Universal Outcome-Oriented Suggestions Grid (6 Cards, fits comfortably without clipping) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 max-h-[300px] overflow-y-auto thin-scrollbar pr-1">
            {UNIVERSAL_GOAL_DEFINITIONS.map((item) => {
              const isSelected = selectedGoals.includes(item.title);
              const isMaxReached = selectedGoals.length >= MAX_GOALS && !isSelected;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleGoal(item.title)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-violet-600 dark:border-violet-500 bg-violet-50/70 dark:bg-violet-950/30 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : isMaxReached
                      ? 'border-slate-200/50 dark:border-white/5 bg-slate-50/30 dark:bg-zinc-900/30 opacity-60 text-slate-500 dark:text-zinc-500'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/40 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                      {item.title}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 transition-all ml-2 ${
                        isSelected
                          ? 'bg-violet-600 border border-violet-600 text-white shadow-2xs'
                          : 'border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-850'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3.2} />}
                    </div>
                  </div>
                  <span className="text-[11.5px] text-slate-500 dark:text-zinc-400 leading-snug">
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* First-Class Custom Goal Input with comfortable breathing room */}
          <form onSubmit={handleAddCustomGoal} className="relative w-full mt-3">
            <div className={`relative flex items-center rounded-xl bg-slate-50/70 dark:bg-zinc-850/60 border border-slate-200/90 dark:border-zinc-800 transition-all ${
              selectedGoals.length >= MAX_GOALS
                ? 'opacity-60 bg-slate-100/50 dark:bg-zinc-900/40'
                : 'focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20'
            }`}>
              <div className="pl-4 pr-2 text-slate-400 dark:text-zinc-500 flex items-center">
                <Plus size={16} />
              </div>
              <input
                type="text"
                value={customGoalText}
                onChange={(e) => setCustomGoalText(e.target.value)}
                disabled={selectedGoals.length >= MAX_GOALS}
                placeholder={selectedGoals.length >= MAX_GOALS ? "Maximum of 3 goals selected" : "Describe another goal..."}
                className="w-full h-11 text-[13.5px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none pr-16 disabled:cursor-not-allowed"
              />
              {customGoalText.trim() && selectedGoals.length < MAX_GOALS && (
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Add
                </button>
              )}
            </div>
          </form>

          {/* Active Custom Goals Chips */}
          {selectedGoals.filter((g) => !UNIVERSAL_GOAL_DEFINITIONS.some((d) => d.title === g)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {selectedGoals
                .filter((g) => !UNIVERSAL_GOAL_DEFINITIONS.some((d) => d.title === g))
                .map((customG, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-[11.5px] font-medium"
                  >
                    <span>{customG}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(customG)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-100 p-0.5 rounded cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: Optional Milestone Checkpoints */}
      {phase === 'milestones' && (
        <div className="w-full max-w-3xl mx-auto my-auto py-2 animate-in fade-in duration-200">
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[11.5px] font-medium mb-2.5">
              <Target size={13} strokeWidth={2} />
              <span>Progress Checkpoints</span>
            </div>
            <h1 className="text-[23px] sm:text-[26px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
              Want to track milestones?
            </h1>
            <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
              Turn your goals into meaningful checkpoints and keep progress visible across your workspace. You can accept, edit, or skip this anytime.
            </p>
          </div>

          {/* Refined Milestones List with In-Place Edit and Delete Actions */}
          <div className="flex flex-col gap-2 mb-4 max-h-[290px] overflow-y-auto thin-scrollbar pr-1">
            {milestoneList.map((mText, idx) => {
              const isSelected = selectedMilestones.includes(mText);
              const isEditing = editingMilestoneIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => !isEditing && toggleMilestone(mText)}
                  className={`group flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/60 shadow-2xs'
                      : 'border-slate-200/70 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/50 dark:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0 flex-1">
                    {/* Checkbox (purple accent only) */}
                    <div
                      className={`w-4.5 h-4.5 rounded-[5px] flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-violet-600 border border-violet-600 text-white shadow-2xs'
                          : 'border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-850'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3.2} />}
                    </div>

                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveEditMilestone(e, idx)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editingMilestoneText}
                          onChange={(e) => setEditingMilestoneText(e.target.value)}
                          autoFocus
                          className="w-full text-[13px] font-medium text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-850 border border-violet-500 rounded-lg px-2.5 py-1 outline-none"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 text-[11.5px] font-semibold rounded bg-violet-600 text-white hover:bg-violet-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCancelEditMilestone(e)}
                          className="px-2 py-1 text-[11.5px] text-slate-500 hover:text-slate-700 dark:text-zinc-400"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <span className={`text-[13px] font-medium leading-snug truncate ${
                        isSelected ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-600 dark:text-zinc-400'
                      }`}>
                        {mText}
                      </span>
                    )}
                  </div>

                  {/* Right Action Icons (Edit & Delete replaced the static CHECKPOINT label) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleStartEditMilestone(e, idx)}
                        title="Edit milestone checkpoint"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Pencil size={13.5} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMilestone(e, idx)}
                        title="Delete milestone checkpoint"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={13.5} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Milestone Input with Apple-style spacing */}
          <form onSubmit={handleAddCustomMilestone} className="relative w-full">
            <div className="relative flex items-center rounded-xl bg-slate-50/70 dark:bg-zinc-850/60 border border-slate-200/90 dark:border-zinc-800 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <div className="pl-4 pr-2 text-slate-400 dark:text-zinc-500 flex items-center">
                <Plus size={16} />
              </div>
              <input
                type="text"
                value={customMilestoneText}
                onChange={(e) => setCustomMilestoneText(e.target.value)}
                placeholder="Add a custom milestone checkpoint..."
                className="w-full h-11 text-[13px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none pr-16"
              />
              {customMilestoneText.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Add
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={phase === 'goals' ? onSkip : handleFinalFinish}
          className="text-[13px] font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {phase === 'goals' ? 'Skip for now' : 'Skip milestone tracking'}
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
            {phase === 'goals'
              ? selectedGoals.length === 1
                ? '1 goal selected'
                : selectedGoals.length > 1
                ? `${selectedGoals.length} goals selected`
                : 'Select your outcomes'
              : selectedMilestones.length === 1
              ? '1 milestone active'
              : `${selectedMilestones.length} milestones active`}
          </span>

          <button
            type="button"
            onClick={phase === 'goals' ? onSkip : handleFinalFinish}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-slate-200/60 dark:border-zinc-700 transition-all cursor-pointer"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={phase === 'goals' ? handleGoalsProceed : handleFinalFinish}
            className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm min-w-[112px] justify-center cursor-pointer"
          >
            <span>{phase === 'goals' ? 'Continue' : 'Finish Setup'}</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
