# МРЭО — Блатные номера

Telegram Mini App для генерации блатных номеров и казино‑механик.

## Структура
```
mreo-tma/
├── index.html
├── style.css
├── cars.js
├── supabase.js
├── game.js
├── online.js
├── cases.js
├── init.sql
└── functions/
    ├── roll/
    ├── sell-state/
    ├── buy-market/
    ├── open-case/
    ├── daily-bonus/
    ├── create-clan/
    ├── join-clan/
    ├── buy-car/
    ├── set-frame/
    ├── prize-spin/
    ├── market-lots-post/
    └── verify-initdata/
```

## Запуск
1. Создать Supabase проект.
2. Вставить `mreo-tma/init.sql` в SQL Editor.
3. В `index.html` и `supabase.js` поставить свой `URL` и `anonKey`.
4. Создать Edge Functions (по списку выше).
5. Подключить Telegram Mini App через BotFather → @MiniApp.

## Фичи
- Ролл номеров, гараж, рынок, колесо, кейсы, квесты, топ, рефералка.
- Онлайн‑рейтинг через Supabase.
- Комиссия с маркета.
- Монетизация через Telegram Stars (кристаллы 💎).

## Юридический блок
Игровые рубли нельзя купить, вывести или обменять на настоящие деньги.
