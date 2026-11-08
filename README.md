# Todo

A simple todo list: React + Tailwind frontend, FastAPI backend, SQLite storage.

## Run

**Backend** (http://127.0.0.1:8000, API docs at `/docs`):

```sh
cd backend
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The SQLite database `backend/todo.db` is created on first start.

**Frontend** (http://localhost:5173, proxies `/api` to the backend):

```sh
cd frontend
npm install
npm run dev
```

## API

| Method | Path | Body |
|---|---|---|
| GET | `/api/todos` | — |
| POST | `/api/todos` | `{ title, text?, priority? }` |
| PATCH | `/api/todos/{id}` | any of `{ title, text, priority, isCompleted }` |
| DELETE | `/api/todos/{id}` | — |

`dateAdded` and `sortOrder` are set by the server on create (new todos go to the bottom).
`dateCompleted` is set when `isCompleted` becomes true and cleared when it becomes false.
`priority` is `low`, `medium` or `high` (default `medium`).
