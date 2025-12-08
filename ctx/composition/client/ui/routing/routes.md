# Руководство по объявлению маршрутов UI
Path: `./ctx/composition/client/ui/routing/routes.md`

## Назначение

Документ описывает правила формирования конфигурации маршрутов, используемой Router через DI. Он не фиксирует жёсткий набор экранов, а диктует формат записей, обязанностей боковых компонентов и способы подключения новых экранов к навигационному слою.

## Формат маршрута

Каждый маршрут описывается декларативно. Конфигурация должна содержать следующие поля:

- `name: <string>` — уникальное логическое имя маршрута, используемое Router и внешними компонентами для навигации.
- `template: <string>` — идентификатор или путь шаблона, который TemplatesLoader получает по запросу.
- `controllerFactory: <DI-идентификатор>` — фабрика, зарегистрированная в контейнере зависимостей, создающая новый контроллер при каждом переходе.
- `params` — описание ожидаемых параметров; этот блок не задаёт значения напрямую, а фиксирует, какие параметры контроллер ожидает получить (`hash`, `sessionId`, `callbacks`, и т. д.).
- `segmentParams: <string[]>` (опционально) — упорядоченный список имён параметров, значения которых Router извлекает из дополнительных частей hash после имени маршрута.
- `initial: <boolean>` (опционально) — флаг, означающий, что данный маршрут используется, когда hash отсутствует или пуст.
- `fallback: <boolean>` (опционально) — маркер, обозначающий маршрут, используемый Router при отсутствии соответствия; только одна запись должна иметь `true`.

`routeConfig: Record<string, RouteDescriptor>` и `defaultParams: Record<string, Record<string, unknown>>` передаются Router извне. Конфигурационный модуль предоставляет методы `registerRoute` и `setDefaultParams`, поэтому приложение может добавлять маршруты и реальные обработчики постепенно, не меняя Router. Router объединяет параметры из URL, вызовов `navigate` и `defaultParams[name]`, прежде чем передать их контроллеру.

Контроллер получает объект `{ params, container, dependencies }` и работает только с этим вызовом. Router никогда не хранит контроллеры между переходами.

## Fallback и неизвестные hash

Конфигурация должна предусматривать fallback-маршрут: один из `routeConfig` объявляется как цель для неизвестных hash. Router вызывает этот маршрут через описанный `controllerFactory`, а конкретное поведение отката, например `not-found`, всегда перенаправляет на корень `/` независимо от дополнительных параметров. Ответственность за реакцию на некорректные ссылки лежит в конфигурации, Router лишь гарантирует, что fallback сработает.

## Обновление маршрутов

- Добавление нового экрана происходит через изменение конфигурации (`routeConfig`, `defaultParams` и сопутствующие файлы DI). Router и его документация `overview.md`/`router.md` остаются неизменными.
- Конфигурационный модуль может вызывать `registerRoute` при старте или по ходу, а Flow обновляет `defaultParams`, подставляя реальные обработчики в нужный момент.
- Проектные контроллеры должны реализовывать lifecycle (`mount`, `unmount`, `update`/`dispose`), но Router вызывает их только через фабрику, получая свежий экземпляр для каждого перехода.
- Любые зависимости, включая шаблоны и callbacks, описываются в конфигурации и передаются через `params`.

## Пример конфигурации (для ориентира)

Call-экран теперь отвечает и за отображение состояния ожидания и шаринг ссылки через `onShareLink`, поэтому отдельный маршрут `invite` больше не используется.

```yaml
- name: home
  template: ui/screens/home.html
  controllerFactory: HomeCall_Web_Ui_Screen_Home
  params:
    description: "Не ожидает параметров, получает обработчики для запуска звонка и открытия настроек"
  initial: true

- name: call
  template: ui/screens/call.html
  controllerFactory: HomeCall_Web_Ui_Screen_Call
  params:
    description: "Session id from hash, remoteStream, lifecycle callbacks, onShareLink и waiting-флаг для ожидания"
  segmentParams:
    - sessionId

- name: end
  template: ui/screens/end.html
  controllerFactory: HomeCall_Web_Ui_Screen_End
  params:
    description: "Displays completion message, uses onReturn"

- name: not-found
  template: ui/screens/not-found.html
  controllerFactory: HomeCall_Web_Ui_Screen_NotFound
  params:
    description: "Fallback screen for unknown hashes; onReturn always drops the browser on `/` and ignores additional params."
  fallback: true
```

Этот пример иллюстрирует формат, но Router не зависит от конкретных записей: при обновлении списка экранов изменяется только конфигурация, а Router продолжает работать с любыми `routeConfig`.
