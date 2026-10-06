import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PLAN_IDS,
  PLANS,
  CAPABILITIES,
  PLAN_QUOTAS,
  getActivePlan,
  setActivePlan as persistActivePlan,
  hasCapability,
  getPlanCapabilities,
  getPlanQuotas,
  isProPlan,
} from '../services/entitlements';

const EntitlementContext = createContext(null);

export const EntitlementProvider = ({ children }) => {
  const [currentPlan, setCurrentPlanState] = useState(getActivePlan());
  // The paywall should not appear unprompted on landing / during onboarding
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState(null);

  useEffect(() => {
    const handlePlanChange = (e) => {
      if (e.detail?.planId) {
        setCurrentPlanState(e.detail.planId);
      }
    };
    window.addEventListener('regaarder-plan-changed', handlePlanChange);
    return () => window.removeEventListener('regaarder-plan-changed', handlePlanChange);
  }, []);

  const changePlan = useCallback((planId) => {
    const updated = persistActivePlan(planId);
    setCurrentPlanState(updated);
  }, []);

  const openPaywall = useCallback((reason = null) => {
    setPaywallReason(reason);
    setIsPaywallOpen(true);
  }, []);

  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    setPaywallReason(null);
  }, []);

  const checkEntitlement = useCallback((capabilityKey) => {
    return hasCapability(currentPlan, capabilityKey);
  }, [currentPlan]);

  const requireEntitlement = useCallback((capabilityKey, onGranted, customReason = null) => {
    if (hasCapability(currentPlan, capabilityKey)) {
      onGranted?.();
      return true;
    }
    openPaywall(customReason || { capability: capabilityKey });
    return false;
  }, [currentPlan, openPaywall]);

  const capabilities = useMemo(() => getPlanCapabilities(currentPlan), [currentPlan]);
  const quotas = useMemo(() => getPlanQuotas(currentPlan), [currentPlan]);
  const isPro = useMemo(() => isProPlan(currentPlan), [currentPlan]);
  const isTeam = useMemo(() => [PLAN_IDS.TEAM, PLAN_IDS.ENTERPRISE].includes(currentPlan), [currentPlan]);

  const value = useMemo(() => ({
    currentPlan,
    planDetails: PLANS[currentPlan] || PLANS[PLAN_IDS.FREE],
    capabilities,
    quotas,
    isPro,
    isTeam,
    checkEntitlement,
    requireEntitlement,
    changePlan,
    isPaywallOpen,
    paywallReason,
    openPaywall,
    closePaywall,
    PLANS,
    PLAN_IDS,
  }), [
    currentPlan,
    capabilities,
    quotas,
    isPro,
    isTeam,
    checkEntitlement,
    requireEntitlement,
    changePlan,
    isPaywallOpen,
    paywallReason,
    openPaywall,
    closePaywall
  ]);

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
};

export const useEntitlements = () => {
  const context = useContext(EntitlementContext);
  if (!context) {
    throw new Error('useEntitlements must be used within an EntitlementProvider');
  }
  return context;
};
