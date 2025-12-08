/**
 * @module HomeCall_Web_Ui_Screen_End
 * @description Shows the finished call screen.
 */
export default function HomeCall_Web_Ui_Screen_End({}) {
  const create = () => {
    let containerRef = null;
    const cleanups = [];

    const attachClick = (element, handler) => {
      if (!element || typeof handler !== 'function') {
        return;
      }
      const listener = (event) => {
        event?.preventDefault?.();
        handler(event);
      };
      element.addEventListener('click', listener);
      cleanups.push(() => element.removeEventListener('click', listener));
    };

    const mount = ({ container, params = {} } = {}) => {
      containerRef = container ?? null;
      if (!containerRef) {
        return;
      }
      const message = containerRef.querySelector('#end-message');
      if (message && typeof params.connectionMessage === 'string') {
        message.textContent = params.connectionMessage;
      }
      attachClick(containerRef.querySelector('#end-return'), params.onReturn);
    };

    const unmount = () => {
      cleanups.splice(0).forEach((fn) => fn());
      containerRef = null;
    };

    return {
      mount,
      unmount
    };
  };

  return {
    create
  };
}
