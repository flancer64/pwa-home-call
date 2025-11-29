# Правила работы с состояниями (`ctx/rules/arch/state.md`)

## Назначение

Этот документ описывает общий подход к проектированию и использованию **объектов-состояний** в кодовой базе TeqFW.  
Цель — унифицировать логику управления состояниями между приложениями, использующими общий teq-код (в браузере и на сервере),  
и обеспечить единый способ для агентов и разработчиков понимать, изменять и отслеживать состояние.

> **Согласованность с продуктом:** `ctx/product/capabilities/connection.md` определяет `ready`, `waiting`, `active` как рабочие состояния единого окна, и документ должен отмечать, что текущая реализация (с экранной последовательностью `home → invite → call → end`) управляется через эти объекты-состояния. План `ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md` описывает, как эти состояния будут получить новые имена и ссылки внутри единого state machine.

---

## Основная идея

В TeqFW состояние любого процесса представлено **объектом-автоматом** — классом с внутренним свойством `state`  
и методами, определяющими допустимые переходы (`setActive()`, `setPaused()`, `setOff()` и т.п.).  
Каждое изменение состояния сопровождается вызовом заранее зарегистрированных функций-наблюдателей (`onActive()`, `onPaused()`, …).

Набор методов `setX()` определяет возможные **значения состояния**,  
а набор методов `onX()` — возможные **реакции** на эти состояния.

> Каждое состояние принадлежит своему экземпляру объекта и существует только в пределах его жизненного цикла.  
> Контейнер может управлять как единичным состоянием (синглтоном), так и фабрикой состояний, создающей независимые экземпляры для множества объектов.

---

## Ключевые принципы

1. **Локальность.**  
   Состояние принадлежит конкретному экземпляру и не синхронизируется между разными объектами или контейнерами.

2. **Симметрия.**  
   Один и тот же класс состояния может использоваться и в браузере, и на сервере.  
   Поведение идентично, различается только среда исполнения.

3. **Самодокументирование.**  
   Каждый переход и реакция оформлены отдельными методами (`setActive()`, `onActive()`),  
   снабжёнными JSDoc-комментарием, описывающим бизнес-смысл.

4. **Детерминизм.**  
   Все переходы выполняются через модульную приватную функцию `transition(nextState, params)`,  
   скрытую в области модуля.  
   Изменение состояния вне этой функции запрещено.

5. **Расширяемость.**  
   Новые состояния добавляются через расширение класса без нарушения существующего контракта.  
   При необходимости множества состояний рекомендуется использовать фабрику, создающую экземпляры класса `Ns_Shared_State`.

---

## Универсальный шаблон

```js
/**
 * @module Ns_Shared_State
 * @description TeqFW hybrid state object: prototype methods + module-level encapsulation.
 * Uses WeakMap for private storage and module-level transition() for internal logic.
 */

const priv = new WeakMap();

/**
 * @private
 * Performs controlled transition to the next state and notifies listeners.
 * @param {Ns_Shared_State} instance - Target state object.
 * @param {string} next - Next state name.
 * @param {any} [params] - Optional parameters passed to listeners.
 */
function transition(instance, next, params) {
  const data = priv.get(instance);
  if (!data) throw new Error("Invalid state instance");

  if (next === data.state) return;
  const prev = data.state;
  data.state = next;

  for (const fn of data.listeners[next]) {
    try {
      fn(params, prev, next);
    } catch (e) {
      console.error(e);
    }
  }
}

export default class Ns_Shared_State {
  /**
   * Constructor receives only dependencies (as required by TeqFW DI).
   * The local variable `props` is introduced for easier debugging —
   * DevTools can display it in the closure, revealing current state and listeners.
   * @param {object} deps - Dependencies injected by the DI container.
   */
  constructor(deps = {}) {
    const props = {
      state: "uninitialized",
      listeners: {
        active: new Set(),
        paused: new Set(),
        off: new Set(),
      },
    };
    priv.set(this, props);
  }

  /**
   * Initializes state after construction.
   * Must be called before the first transition.
   * @param {string} [initial='off'] - Initial state name.
   */
  initState(initial = "off") {
    const data = priv.get(this);
    data.state = initial;
  }

  /**
   * Returns current state name.
   * @returns {string}
   */
  get() {
    return priv.get(this).state;
  }

  /**
   * Subscribes to entering 'active' state.
   * @param {(params?: any, from: string, to: string) => void} fn - Callback invoked on transition.
   * @returns {() => void} Function to unsubscribe this callback.
   */
  onActive(fn) {
    const l = priv.get(this).listeners.active;
    l.add(fn);
    return () => l.delete(fn);
  }

  /**
   * Subscribes to entering 'paused' state.
   * @param {(params?: any, from: string, to: string) => void} fn - Callback invoked on transition.
   * @returns {() => void} Function to unsubscribe this callback.
   */
  onPaused(fn) {
    const l = priv.get(this).listeners.paused;
    l.add(fn);
    return () => l.delete(fn);
  }

  /**
   * Subscribes to entering 'off' state.
   * @param {(params?: any, from: string, to: string) => void} fn - Callback invoked on transition.
   * @returns {() => void} Function to unsubscribe this callback.
   */
  onOff(fn) {
    const l = priv.get(this).listeners.off;
    l.add(fn);
    return () => l.delete(fn);
  }

  /**
   * Switches to 'active' state.
   * @param {any} [params] - Optional parameters passed to listeners.
   */
  setActive(params) {
    transition(this, "active", params);
  }

  /**
   * Switches to 'paused' state.
   * @param {any} [params] - Optional parameters passed to listeners.
   */
  setPaused(params) {
    transition(this, "paused", params);
  }

  /**
   * Switches to 'off' state.
   * @param {any} [params] - Optional parameters passed to listeners.
   */
  setOff(params) {
    transition(this, "off", params);
  }
}
```

> Переменная `props` создаётся исключительно для удобства отладки.
> Она позволяет видеть текущее состояние и слушателей в инструментах разработчика, но не является частью публичного API.

---

## Применение

Объект состояния используется для реакции на переходы и выполнения действий, связанных с изменением состояния.
Подписка оформляется через методы `on*()`, а изменение состояния — через методы `set*()`.

```js
const unsub = mediaState.onActive((params) => ui.showEnabledIcon(params));

// later
mediaState.setActive({ source: "user" });

// unsubscribe if needed
unsub();
```

Каждый метод `set*()` изменяет состояние и вызывает соответствующие обработчики `on*()`.
Подписки необходимо снимать при уничтожении объекта или завершении контекста.
При необходимости создавать множество независимых состояний используйте фабрику, возвращающую новые экземпляры `Ns_Shared_State`.

---

## Синхронизация между контейнерами

Состояние изолировано внутри экземпляра и не выходит за его пределы.
Контейнер управляет созданием и внедрением объектов, но не объединяет их состояния.
Фабрики могут порождать множество независимых состояний в одном контейнере.
Синхронизация состояний между контейнерами или экземплярами исключена.

---

## Рекомендации для агентов

1. Распознавать классы-состояния по наличию методов `setX()` и `onX()`.
2. Не вызывать внутренних функций перехода напрямую.
3. При добавлении новых состояний документировать каждое в JSDoc.
4. Использовать DI-синглтоны для единичных состояний и фабрики — для множественных.
5. Не связывать состояния между контейнерами; взаимодействие — только через обмен сообщениями.

---

## Резюме

Модель состояний в TeqFW — это **декларативный автомат**,
который может существовать как DI-синглтон или как экземпляр, созданный фабрикой.

Он:

- инкапсулирует текущее состояние;
- предоставляет методы переходов;
- уведомляет слушателей при изменении;
- документирует своё поведение через структуру класса и JSDoc.

Эта модель обязательна для всех модулей, где происходит смена состояний
(медиа, соединения, сессии, авторизация, загрузка данных и т.п.).
