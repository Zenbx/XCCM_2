import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { OnboardingProvider, useOnboarding, TourConfig } from '@/context/OnboardingContext';

vi.mock('@/services/onboardingService', () => ({
  onboardingService: {
    hasSeenFlow: vi.fn().mockReturnValue(false),
    markFlowSeen: vi.fn(),
    resetFlow: vi.fn(),
  },
}));

import { onboardingService } from '@/services/onboardingService';
const mockHasSeenFlow = onboardingService.hasSeenFlow as ReturnType<typeof vi.fn>;
const mockMarkFlowSeen = onboardingService.markFlowSeen as ReturnType<typeof vi.fn>;

function Wrapper({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

const tourConfig: TourConfig = {
  flowId: 'welcome-tour',
  steps: [
    { target: '#el1', title: 'Étape 1', description: 'Desc 1', placement: 'bottom' },
    { target: '#el2', title: 'Étape 2', description: 'Desc 2', placement: 'right' },
    { target: '#el3', title: 'Étape 3', description: 'Desc 3', placement: 'top' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockHasSeenFlow.mockReturnValue(false);
});

describe('OnboardingContext', () => {
  it('isRunning=false initialement', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.activeTour).toBeNull();
  });

  it('startTour démarre un tour', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.activeTour?.flowId).toBe('welcome-tour');
  });

  it('startTour ne démarre pas si déjà vu (sans force)', () => {
    mockHasSeenFlow.mockReturnValue(true);
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    expect(result.current.isRunning).toBe(false);
  });

  it('startTour avec force=true démarre même si déjà vu', () => {
    mockHasSeenFlow.mockReturnValue(true);
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig, true); });
    expect(result.current.isRunning).toBe(true);
  });

  it('nextStep avance au prochain step', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(1);
  });

  it('nextStep sur le dernier step termine le tour', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour({ ...tourConfig, onComplete }); });
    act(() => { result.current.nextStep(); }); // step 1
    act(() => { result.current.nextStep(); }); // step 2
    act(() => { result.current.nextStep(); }); // end
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalled();
    expect(mockMarkFlowSeen).toHaveBeenCalledWith('welcome-tour');
  });

  it('prevStep revient au step précédent', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(1);
    act(() => { result.current.prevStep(); });
    expect(result.current.currentStep).toBe(0);
  });

  it('prevStep ne fait rien sur le premier step', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    act(() => { result.current.prevStep(); });
    expect(result.current.currentStep).toBe(0);
  });

  it('endTour termine le tour et marque comme vu', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    act(() => { result.current.endTour(); });
    expect(result.current.isRunning).toBe(false);
    expect(mockMarkFlowSeen).toHaveBeenCalledWith('welcome-tour');
  });

  it('replayTour reset le flow et redémarre', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.replayTour(tourConfig); });
    expect(onboardingService.resetFlow).toHaveBeenCalledWith('welcome-tour');
    expect(result.current.isRunning).toBe(true);
  });

  it('Escape ferme le tour (navigation clavier)', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    act(() => { fireEvent.keyDown(window, { key: 'Escape' }); });
    expect(result.current.isRunning).toBe(false);
  });

  it('ArrowRight avance au prochain step (navigation clavier)', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: Wrapper });
    act(() => { result.current.startTour(tourConfig); });
    act(() => { fireEvent.keyDown(window, { key: 'ArrowRight' }); });
    expect(result.current.currentStep).toBe(1);
  });

  it('lève une erreur si useOnboarding est utilisé hors Provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useOnboarding())).toThrow(
      'useOnboarding must be used inside <OnboardingProvider>'
    );
    spy.mockRestore();
  });
});
