/**
 * @module HomeCall_Web_State_Machine
 * @description Tracks the current UI state and keeps body CSS in sync with the call screen.
 */
export default class HomeCall_Web_State_Machine {
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
    if (!env) {
      throw new Error('Environment provider is required for the state machine.');
    }
    const documentRef = env.document ?? null;
    let currentState = 'home';

    const updateCallClass = (next) => {
      documentRef?.body?.classList?.toggle('state-call', next === 'call');
    };

    this.getState = () => currentState;

    this.setState = (nextState) => {
      if (!nextState) {
        return;
      }
      if (nextState !== currentState) {
        currentState = nextState;
      }
      updateCallClass(currentState);
    };

    this.goHome = () => this.setState('home');
    this.goInvite = () => this.setState('invite');
    this.goCall = () => this.setState('call');
    this.goEnd = () => this.setState('end');
  }
}
