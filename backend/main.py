import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DB_PATH = Path(__file__).parent / "todo.db"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TodoCreate(BaseModel):
    title: str
    text: str = ""
    priority: Priority = Priority.medium


class TodoUpdate(BaseModel):
    title: str | None = None
    text: str | None = None
    priority: Priority | None = None
    isCompleted: bool | None = None


class Todo(BaseModel):
    id: int
    title: str
    text: str
    isCompleted: bool
    dateCompleted: str | None
    dateAdded: str
    priority: Priority
    sortOrder: int


@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS todos (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                title         TEXT    NOT NULL,
                text          TEXT    NOT NULL DEFAULT '',
                isCompleted   INTEGER NOT NULL DEFAULT 0,
                dateCompleted TEXT,
                dateAdded     TEXT    NOT NULL,
                priority      TEXT    NOT NULL DEFAULT 'medium'
                              CHECK (priority IN ('low', 'medium', 'high')),
                sortOrder     INTEGER NOT NULL
            )
            """
        )


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def to_todo(row: sqlite3.Row) -> Todo:
    return Todo(**{**dict(row), "isCompleted": bool(row["isCompleted"])})


def get_or_404(conn: sqlite3.Connection, todo_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return row


init_db()
app = FastAPI(title="Todo API")


@app.get("/api/todos", response_model=list[Todo])
def list_todos():
    with db() as conn:
        rows = conn.execute("SELECT * FROM todos ORDER BY sortOrder, id").fetchall()
        return [to_todo(r) for r in rows]


@app.post("/api/todos", response_model=Todo, status_code=201)
def create_todo(body: TodoCreate):
    title = body.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title is required")
    with db() as conn:
        next_order = conn.execute(
            "SELECT COALESCE(MAX(sortOrder), 0) + 1 FROM todos"
        ).fetchone()[0]
        cur = conn.execute(
            "INSERT INTO todos (title, text, priority, dateAdded, sortOrder) "
            "VALUES (?, ?, ?, ?, ?)",
            (title, body.text, body.priority.value, now(), next_order),
        )
        return to_todo(get_or_404(conn, cur.lastrowid))


@app.patch("/api/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, body: TodoUpdate):
    with db() as conn:
        row = get_or_404(conn, todo_id)
        changes = body.model_dump(exclude_unset=True, exclude_none=True)

        if "title" in changes:
            changes["title"] = changes["title"].strip()
            if not changes["title"]:
                raise HTTPException(status_code=422, detail="Title is required")
        if "priority" in changes:
            changes["priority"] = changes["priority"].value
        if "isCompleted" in changes and changes["isCompleted"] != bool(row["isCompleted"]):
            changes["dateCompleted"] = now() if changes["isCompleted"] else None
        if "isCompleted" in changes:
            changes["isCompleted"] = int(changes["isCompleted"])

        if changes:
            cols = ", ".join(f"{k} = ?" for k in changes)
            conn.execute(
                f"UPDATE todos SET {cols} WHERE id = ?", (*changes.values(), todo_id)
            )
        return to_todo(get_or_404(conn, todo_id))


@app.delete("/api/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    with db() as conn:
        get_or_404(conn, todo_id)
        conn.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
