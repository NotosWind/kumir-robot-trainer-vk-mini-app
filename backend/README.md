# КуМир-Робот — Backend (FastAPI)

REST API для VK Mini App: авторизация по подписи launch-параметров VK и хранение прогресса игрока (звёзды/пройденные уровни) в SQLite.

## Запуск (разработка)

```bash
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt        # macOS/Linux: .venv/bin/pip
# Локальная разработка без VK (auth возвращает VK_DEV_USER_ID):
set VK_SKIP_AUTH=1                                    # macOS/Linux: export VK_SKIP_AUTH=1
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Дев-сервер фронтенда проксирует `/api` → `http://localhost:8000` (см. `frontend/vite.config.ts`),
поэтому фронт и бэкенд работают вместе без настройки CORS.

## Эндпоинты

- `GET /api/health` — проверка живости.
- `GET /api/progress` — прогресс текущего пользователя: `{ "<levelId>": { "stars": n, "solved": bool } }`.
- `PUT /api/progress/{level_id}` (тело `{ "stars": n }`) — сохранить результат (хранится лучший по звёздам).

Авторизация: заголовок `X-VK-Launch-Params` с «сырой» строкой launch-параметров VK
(`window.location.search` без `?`). Подпись `sign` проверяется HMAC-SHA256 по секрету приложения.

## Тесты

```bash
.venv\Scripts\python -m pytest -q
```

## Прод

Задать `VK_APP_SECRET` (из настроек VK-приложения) и реальный `DATABASE_URL`
(например, PostgreSQL), `VK_SKIP_AUTH` не выставлять, запускать `uvicorn app.main:app`.

## Переменные окружения

См. `.env.example`: `VK_APP_SECRET`, `DATABASE_URL`, `VK_SKIP_AUTH`, `VK_DEV_USER_ID`.
