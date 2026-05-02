# Цель: распарсить HTML-дампы → artifacts/design-audit.json со структурой паттернов.

## Шаги
1. Поставить cheerio: cd app && npm i -D cheerio.
2. Создать app/scripts/extract-patterns.mjs — Node-скрипт:
   - читает все *.html в source/
   - извлекает inline styles, computed styles из связанных css файлов
   - группирует цвета (по частоте), радиусы, отступы, шрифты, тени
   - собирает повторяющиеся блоки (карточки, кнопки, списки) — кандидаты в компоненты
3. Запустить скрипт: node app/scripts/extract-patterns.mjs.
4. Записать в artifacts/design-audit.json структуру:
   {
     "colors": { "freq": [...], "palette": {...} },
     "typography": { "families": [...], "sizes": [...] },
     "spacing": { "values": [...] },
     "radii": { "values": [...] },
     "shadows": { "values": [...] },
     "components": [{ "type": "card", "html": "..." }, ...]
   }

## После
→ build_tokens, который из design-audit.json соберёт tokens.json.
