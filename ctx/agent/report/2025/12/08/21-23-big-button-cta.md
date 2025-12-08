## Резюме изменений
- Привёл реализацию `big-button` к контракту из `ctx/composition/client/ui/components/big-button.md`, оставив только атрибуты `label`, `icon` и `action` и убрав inline-символы.
- Переписал шаблон и логику компонента, чтобы glyph-slot использовал `<img>` fallback из `/assets/icons/<name>.svg`, а кнопка диспатчит `CustomEvent('action', { bubbles: true })` при клике.
- Спростил CSS до единого CTA-стиля и добавил `circle-check.svg` в `web/assets/icons/`, обновив `web/version.json` в соответствии с требованиями `web/AGENTS.md`.

## Детали работ
- В `web/ui/component/big-button.js` создал дефолтный шаблон с `slot`/`label`, реализовал динамическую подстановку пути и `img`-fallback, а также обработчик клика, передающий имя действия в detail события.
- `web/ui/component/big-button.css` теперь описывает только необходимые размеры, отступы и темы (border-radius ≥ 1rem, min-height ≥ 56px, padding ≥ 1rem и переменные для цвета и теней).
- Копия `circle-check.svg` из `node_modules/lucide-static/icons` помещена в `web/assets/icons/`, чтобы компонент никогда не рисовал inline-иконки, и версия `web/version.json` обновлена до `20251208-212134`.

## Результаты
- `npm run test:unit` (всё успешно)
