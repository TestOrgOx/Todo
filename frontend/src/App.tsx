import { useEffect, useState } from "react";
import { api, type Priority, type Todo } from "./api";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .list()
      .then(setTodos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const add = (title: string, text: string, priority: Priority) =>
    run(async () => {
      const created = await api.create({ title, text, priority });
      setTodos((prev) => [...prev, created]);
    });

  const update = (id: number, changes: Parameters<typeof api.update>[1]) =>
    run(async () => {
      const updated = await api.update(id, changes);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    });

  const remove = (id: number) =>
    run(async () => {
      await api.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    });

  const remaining = todos.filter((t) => !t.isCompleted).length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-slate-800">Todo</h1>

      <TodoForm onAdd={add} />

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="mt-6">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : todos.length === 0 ? (
          <p className="text-slate-500">Nothing to do yet.</p>
        ) : (
          <>
            <p className="mb-2 text-sm text-slate-500">
              {remaining} of {todos.length} remaining
            </p>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={update} onDelete={remove} />
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
