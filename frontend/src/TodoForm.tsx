import { useState, type FormEvent } from "react";
import type { Priority } from "./api";
import PrioritySelect from "./PrioritySelect";

interface Props {
  onAdd: (title: string, text: string, priority: Priority) => Promise<void>;
}

export default function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd(title.trim(), text.trim(), priority);
    setSaving(false);
    setTitle("");
    setText("");
    setPriority("medium");
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <PrioritySelect value={priority} onChange={setPriority} />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Add todo
      </button>
    </form>
  );
}
