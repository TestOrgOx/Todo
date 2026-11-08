import { useState } from "react";
import type { Priority, Todo, TodoUpdate } from "./api";
import PrioritySelect, { PRIORITY_STYLES } from "./PrioritySelect";

interface Props {
  todo: Todo;
  onUpdate: (id: number, changes: TodoUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export default function TodoItem({ todo, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [text, setText] = useState(todo.text);
  const [priority, setPriority] = useState<Priority>(todo.priority);

  const startEdit = () => {
    setTitle(todo.title);
    setText(todo.text);
    setPriority(todo.priority);
    setEditing(true);
  };

  const save = async () => {
    if (!title.trim()) return;
    await onUpdate(todo.id, { title: title.trim(), text: text.trim(), priority });
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="space-y-2 rounded-lg bg-white p-4 shadow-sm ring-1 ring-indigo-300">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
          />
          <PrioritySelect value={priority} onChange={setPriority} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={!title.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={(e) => onUpdate(todo.id, { isCompleted: e.target.checked })}
        className="mt-1 h-5 w-5 shrink-0 accent-indigo-600"
        aria-label="Mark complete"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium break-words ${todo.isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}
          >
            {todo.title}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[todo.priority]}`}
          >
            {todo.priority}
          </span>
        </div>
        {todo.text && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{todo.text}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Added {formatDate(todo.dateAdded)}
          {todo.dateCompleted && <> · Completed {formatDate(todo.dateCompleted)}</>}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <button
          onClick={startEdit}
          className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
