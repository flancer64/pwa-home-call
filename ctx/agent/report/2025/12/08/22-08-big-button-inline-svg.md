# big-button inline SVG

## Резюме изменений
- inline-графика `big-button` теперь подгружается из `/assets/icons/` через `fetch()` и вставляется в слот, чтобы компоненты сохранили возможность наследовать цвет темы.
- CSS обновлён так, чтобы `glyph` цеплял `currentColor` и настраивал размеры/обводку SVG, а документация фиксирует требования к inline-иконкам и системе `/web/assets/icons/`.
- `web/version.json` получил новую метку сборки, совпадающую с актуальным состоянием веб-клиента.

## Детали работ
- `web/ui/component/big-button.js`: удалён `<img>` вернём, добавлен асинхронный `updateIcon`, проверка назначенных узлов, `fetch` SVG и перезапись слота.
- `web/ui/component/big-button.css`: `.glyph` теперь наследует `var(--text-on-accent)`; добавлены стили для `svg`, `.glyph img` удалён.
- `ctx/composition/client/ui/components/big-button.md`: добавлены пояснения про inline-SVG, `currentColor`, `fetch()` и связь с `/web/assets/icons/`.
- `web/version.json`: версия `20251208-220626` как требуемый артефакт веб-уровня.

## Результаты
- `npm run test:unit` (pass)
