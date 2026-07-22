# Практика UnoCode

Веб-сервис для приёма студентов на производственную практику: анкеты, тестовые задания, документооборот и недельная доска задач.

## Стек

- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend:** Express, Prisma, PostgreSQL
- **Документы:** docxtemplater (`.docx` из шаблонов в `backend/templates/`)

## Быстрый старт (Docker)

```bash
docker compose up -d --build
```

| Сервис   | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3000    |
| Backend  | http://localhost:3001    |
| Postgres | localhost:5432           |

Проверка backend: `GET http://localhost:3001/health`

Шаблоны документов монтируются из `./backend/templates` — правки `.docx` подхватываются без пересборки образа.

## Локальная разработка

### 1. База данных

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

Backend слушает порт **3001**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Если порт 3000 занят, Next.js поднимется на **3002** — CORS на backend разрешает любой `localhost`.

Переменная окружения frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Переменные окружения (backend)

| Переменная       | Описание                          | По умолчанию              |
|------------------|-----------------------------------|---------------------------|
| `DATABASE_URL`   | PostgreSQL connection string      | см. `.env.example`        |
| `PORT`           | Порт API                          | `3001`                    |
| `CORS_ORIGIN`    | Разрешённые origin (через запятую)| `http://localhost:3000`   |
| `JWT_SECRET`     | Секрет для JWT                    | сменить в production      |
| `JWT_EXPIRES_IN` | Срок жизни токена                 | `7d`                      |
| `SMTP_*`         | Почта при публикации тестового задания (опционально) | без SMTP — лог в консоль |

## Первый администратор

Регистрация создаёт пользователя с ролью `STUDENT`. Чтобы получить доступ к админ-панели:

1. Зарегистрируйтесь через UI (`/register`).
2. В Prisma Studio или SQL смените роль на `ADMIN`:

```bash
cd backend && npm run prisma:studio
```

или

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Демо-сценарий

Чеклист для показа полного цикла:

- [ ] **Health:** на главной или в devtools — `GET /health` возвращает `status: ok`
- [ ] **Когорта:** админ создаёт когорту с датами приёма заявок «сегодня в диапазоне»
- [ ] **Главная:** баннер «Открыт приём заявок» ведёт на `/apply/{id}`
- [ ] **Анкета:** студент регистрируется, заполняет анкету, отправляет заявку
- [ ] **Админ:** одобряет заявку, назначает роль, публикует тестовое задание
- [ ] **Документы:** студент заполняет поля (в т.ч. «Руководитель практики от УрФУ»), формирует индивидуальное задание
- [ ] **Отзыв:** админ заполняет отзыв во вкладке «Документы» когорты
- [ ] **Отчёт:** студент загружает `.pdf`/`.docx`, админ допускает к титульному листу
- [ ] **Задачи:** студент отмечает прогресс в личном кабинете

## Структура репозитория

```
backend/     API, Prisma, шаблоны docx, uploads
frontend/    Next.js UI
docker-compose.yml
```

## Полезные команды

```bash
# Backend
cd backend && npm run prisma:migrate
cd backend && npm run templates:generate   # заглушки, кроме individual-task.docx

# Frontend
cd frontend && npm run build
```
