# 08-57 Screen card layout

## Цель
- привести экраны PWA и `screen-card` к структуре и ритму, описанным в документах `ctx/rules/web/ui/component/screen-card.md` и `ctx/rules/web/ui/style.md`.

## Действия
- убрал `data-variant`/`data-status`, добавил только `header/main/footer`‑слоты и минимальную геометрию в `web/ui/component/screen-card` и связанные стили;
- перестроил все экранные шаблоны (`home`, `invite`, `end`, `settings`, `call`) под новые зоны, убрал inline `<svg>` в пользу ресурсов, закрепив иконки через `icon-wrapper`;
- перенёс динамические иконки (`copy`, `share`, `phone`) из `web/app/Ui/Screen/Invite.mjs` в файлы `web/assets/icons/*`, тем самым избавился от встроенных SVG-строк;
- обновил `web/version.json` → `20251127-085657`, чтобы соблюсти правило версии веб-слоя.

## Артефакты
- `web/ui/component/screen-card.js`
- `web/ui/component/screen-card.css`
- `web/ui/{home,invite,end,settings,call}.html`
- `web/app/Ui/Screen/Invite.mjs`
- `web/assets/icons/{close,copy,link,phone,return-home,share}.svg`
- `web/version.json`
