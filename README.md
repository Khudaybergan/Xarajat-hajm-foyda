# Boshqaruv hisobi — 5-mavzu

«Xarajat–hajm–foyda» (CVP) tahlili va zararsizlik nuqtasi — Boshqaruv hisobi fani bo‘yicha
interaktiv taqdimot (Vite · React · TypeScript).

## Ishga tushirish

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/index.html — yagona fayl, internetsiz ochiladi
```

## Boshqaruv

- `←` `→` yoki probel — slaydlar
- `F` — to‘liq ekran
- `M` — mundarija
- `Esc` — panelni yopish / xaritada yuqori darajaga

## Tuzilishi

- `src/deck/` — taqdimot qobig‘i (sahna, navigatsiya, mundarija)
- `src/slides/` — slaydlar; tartibi `src/slides/index.ts` da
- `src/map/` — interaktiv xarita va ma’lumot paneli
- `src/data/tree.ts` — xarita mazmuni (CVP ko‘rsatkichlari va parametr ta’siri)
# Xarajat-hajm-foyda

## ИИ-помощник (Gemini Live)

Кнопка **Yordamchi** в нижней панели (клавиша `A`) открывает голосового помощника на базе
Gemini Live API (`gemini-3.8-live`). Он отвечает голосом и текстом на узбекском или русском,
а по вопросу сам открывает нужный слайд и выставляет параметры (объём на графике
безубыточности, задачу кейса, узел карты и т. д.).

- Ключ Gemini API вводится в панели (⚙) и хранится только в `localStorage` этого браузера.
  Получить: https://aistudio.google.com → Get API key.
- Нужен интернет и доступ к микрофону. Кнопка «Gapirish» включает микрофон, вопрос можно
  также напечатать.
- Код: `src/ai/` — `live.ts` (сессия), `audio.ts` (PCM 16 kHz / 24 kHz), `tools.ts`
  (функции управления слайдами), `knowledge.ts` (содержание лекции для модели),
  `bridge.ts` (связь со слайдами через `useSlideCommands`).
- Для отладки из консоли: `window.__cvp.run('show_breakeven', { volume: 3000 })`.

### Ключ через `.env`

```bash
cp .env.example .env      # впишите VITE_GEMINI_API_KEY=AIza...
npm run dev               # или npm run build
```

Vite подставляет ключ при сборке, поэтому он попадает внутрь `dist/index.html`.
Такой файл нельзя выкладывать публично. `.env` добавлен в `.gitignore`.
