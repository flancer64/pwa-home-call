# Шаблон TeqFW-модуля (`module-template.md`)

## Назначение

Документ содержит эталонный шаблон ES6-модуля, совместимого с контейнером зависимостей `@teqfw/di`.  
Он используется агентами Codex и разработчиками для генерации новых компонентов в проектах TeqFW.

> **Согласованность с продуктом:** при генерации модулей важно помнить, что `ctx/product/overview.md` и `ctx/product/capabilities/connection.md` задают `ready/waiting/active` как единые состояния одного окна связи и что `ctx/product/capabilities/link-sharing.md` ожидает генерацию ссылки внутри текущего сеанса; текущий вариант всё ещё оперирует экранами `home → invite → call → end`, а план `ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md` описывает будущую переориентацию шаблонов на новые состояния.

## Шаблон

```js
/**
 * @module Namespace_Area_Module
 * @description Template of TeqFW-compatible ES6 module for @teqfw/di container.
 * Methods are defined inside constructor to ensure encapsulation via closure.
 * All comments and log messages must be in English.
 */

export default class Namespace_Area_Module {
  /**
   * @param {Object} deps - Dependencies injected by @teqfw/di container.
   * @param {typeof import('node:http')} deps['node:http'] - Example of Node.js module injection.
   * @param {Namespace_Area_Defaults} deps.Namespace_Area_Defaults$ - Example of singleton injection.
   */
  constructor({ "node:http": http, Namespace_Area_Defaults$: DEF }) {
    // Example of internal variables (not accessible outside this closure)
    /** @type {import('node:http').Server} */
    const server = http.createServer();

    /**
     * Initialize or start this module.
     * @param {Object} [cfg] - Optional configuration.
     * @returns {Promise<void>}
     */
    this.start = async function (cfg) {
      // Example: server = http.createServer();
      // Example: server.listen(cfg?.port ?? DEF.PORT);
    };

    /**
     * Stop or finalize this module.
     * @returns {Promise<void>}
     */
    this.stop = async function () {
      // Example: if (server) server.close();
    };
  }
}
```

## Ссылки

- `./di.md` — универсальные принципы работы контейнера.
- `../../architecture.md` — архитектурный обзор и роль DI-модулей.
- `../logging.md` — правила логирования и формат сообщений.
