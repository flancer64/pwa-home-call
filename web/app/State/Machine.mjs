/**
 * @module HomeCall_Web_State_Machine
 * @description Tracks the current UI state and keeps body CSS in sync with the call screen.
 */
export default function HomeCall_Web_State_Machine() {
  let currentState = 'ready';

  const transitions = {
    ready: new Set(['waiting', 'active']),
    waiting: new Set(['active', 'ended', 'ready']),
    active: new Set(['ended']),
    ended: new Set(['ready'])
  };

  const getState = () => currentState;

  const canTransition = (nextState) => {
    if (!nextState || !transitions[currentState]) {
      return false;
    }
    return transitions[currentState].has(nextState);
  };

  const transition = (nextState) => {
    if (!nextState || nextState === currentState) {
      return currentState;
    }
    if (!canTransition(nextState)) {
      throw new Error(`Invalid state transition from "${currentState}" to "${nextState}".`);
    }
    currentState = nextState;
    return currentState;
  };

  const reset = () => {
    currentState = 'ready';
    return currentState;
  };

  return {
    getState,
    canTransition,
    transition,
    reset
  };
}
