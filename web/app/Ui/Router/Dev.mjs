/**
 * @module HomeCall_Web_Ui_Router_Dev
 */
export default class HomeCall_Web_Ui_Router_Dev {
    constructor(
        {
            HomeCall_Web_Ui_Flow$: flow,
            HomeCall_Web_Logger$: logger,
            HomeCall_Web_Env_Provider$: env
        } = {}
    ) {
        if (!flow) throw new Error('Flow is required.');
        if (!env) throw new Error('Env is required.');

        const log = logger ?? console;
        const windowRef = env.window ?? null;

        const handleRoute = () => {
            const hash = (windowRef?.location?.hash ?? '').replace(/^#/, '');
            switch (hash) {
                case 'home':
                    flow.showHome?.();
                    break;
                case 'invite':
                    flow.showInvite?.({ sessionId: 'dev', inviteUrl: 'dev-link' });
                    break;
                case 'call':
                    flow.showCall?.({});
                    break;
                case 'end':
                    flow.showEnd?.({ connectionMessage: 'Debug end' });
                    break;
            }
            log.info(`[DevRouter] Force screen: ${hash}`);
        };

        this.init = () => {
            if (!windowRef) return;
            handleRoute();
            windowRef.addEventListener('hashchange', handleRoute);
        };
    }
}
