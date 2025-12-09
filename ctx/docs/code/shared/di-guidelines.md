# DI-соглашения `@teqfw/di`

Path: `./ctx/docs/code/shared/di-guidelines.md`

`@teqfw/di` — единственный контейнер зависимостей для всех контуров проекта. Он обеспечивает late binding, Inversion of Control и удобную подстановку mock-ов в тестах, поэтому модули не проверяют наличие своих зависимостей вручную и не создают объекты сами.

## Контейнер и namespace

- Контейнер создаётся из `bin/server.js` или из helper-ов (например, `test/unit/helper.mjs`, `test/web/helper.mjs`) и настраивается через `container.getResolver().addNamespaceRoot('HomeCall_Back_', '/abs/path/src/Back');` (аналогично для `HomeCall_Web_`).
- Namespace-мэппинг повторяет структуру файлов: `src/Back/Service/Signal/Server.js` → `HomeCall_Back_Service_Signal_Server`, `web/app/Ui/Flow.mjs` → `HomeCall_Web_Ui_Flow`.
- Контейнер поддерживает pre-processor (`container.getPreProcessor()`) и регистрацию namespace-заменителей (`resolver.addChunk`) для mock-объектов в тестах.

## Пример шаблона модуля

```js
/**
 * @module Namespace_Area_Module
 * @description Standard ES6 module for the DI container.
 */
export default class Namespace_Area_Module {
  constructor({ 'node:http': http, Namespace_Area_Defaults$: DEF }) {
    const server = http.createServer();

    this.start = async function (cfg) {
      // configuration, event registration, logging
      server.listen(cfg?.port ?? DEF.PORT);
    };

    this.stop = async function () {
      if (server) server.close();
    };
  }
}
```

- Все зависимости описываются как свойства объекта `deps`. Конструкторы не должны выполнять дополнительные `if (!deps)` — контейнер гарантирует наличие компонентов.
- Объект `deps` можно `Object.freeze(deps)` в начале конструктора, чтобы подчеркнуть неизменяемость зависимостей.

## Работа с модулями и lifecycle

- Каждый модуль экспортирует функцию или класс по умолчанию; публичные методы `start`/`stop`/`bindHandlers` описываются декларативно.
- Зависимости получают аккуратные имена (`HomeCall_Web_Logger$`, `HomeCall_Back_Service_Signal_SessionManager$`), чтобы при тестировании легко подставлять mock-объекты.
- Контейнер используется в тестах и runtime: `const container = await createTestContainer(); const app = await container.get('HomeCall_Back_App$');`.

## Поддержка тестов

- Тестовые helper-ы регистрируют мок-объекты через `container.register('HomeCall_Back_Service_Signal_Server$', mockSignalServer);`.
- При необходимости подменяются namespace-раннее `resolver.addNamespaceRoot` или `preProcessor.addChunk`, не прибегая к глобальным переменным.
- Модули, участвующие в тестах, принимают только декларативные зависимости; внутренняя логика ограничивается обработкой событий и передачей данных в другие слои.
