export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: number;
  title: string;
  text: string;
  isCompleted: boolean;
  dateCompleted: string | null;
  dateAdded: string;
  priority: Priority;
  sortOrder: number;
}

export type TodoCreate = Pick<Todo, "title" | "text" | "priority">;
export type TodoUpdate = Partial<Pick<Todo, "title" | "text" | "priority" | "isCompleted">>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.detail === "string" ? body.detail : `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  list: () => request<Todo[]>("/todos"),
  create: (todo: TodoCreate) =>
    request<Todo>("/todos", { method: "POST", body: JSON.stringify(todo) }),
  update: (id: number, changes: TodoUpdate) =>
    request<Todo>(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
  remove: (id: number) => request<void>(`/todos/${id}`, { method: "DELETE" }),
};
