/**
 * @module HomeCall_Back_App
 * @description Minimal backend application entry point for HomeCall.
 */

export default class HomeCall_Back_App {
    /**
     * @param {Object} deps - Dependencies injected by @teqfw/di container.
     * @param {HomeCall_Back_Contract_Logger} deps.HomeCall_Back_Contract_Logger$ - Logger implementation.
     */
    constructor({ HomeCall_Back_Contract_Logger$: logger, HomeCall_Back_Service_Signal_Server$: signal } = {}) {
        if (!logger || typeof logger.info !== 'function') {
            throw new TypeError('HomeCall_Back_App requires a logger with an info() method.');
        }
        if (!signal || typeof signal.start !== 'function' || typeof signal.stop !== 'function') {
            throw new TypeError('HomeCall_Back_App requires a signaling server with start() and stop() methods.');
        }

        const namespace = 'HomeCall_Back_App';

        /**
         * Run application startup routine.
         * @returns {Promise<void>}
         */
        this.run = async () => {
            logger.info(namespace, 'HomeCall backend starting.');
            await signal.start();
            logger.info(namespace, 'HomeCall backend started.');
        };

        /**
         * Run application shutdown routine.
         * @returns {Promise<void>}
         */
        this.stop = async () => {
            logger.info(namespace, 'HomeCall backend stopping.');
            await signal.stop();
            logger.info(namespace, 'HomeCall backend stopped.');
        };
    }
}
