/**
 * @module HomeCall_Web_Ui_Screen_NotFound
 * @description Renders the fallback page for unknown routes.
 */
export default function HomeCall_Web_Ui_Screen_NotFound({}) {
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
      attachClick(containerRef.querySelector('#notfound-home'), params.onReturn);
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
