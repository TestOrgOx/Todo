import type { Priority } from "./api";

export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-700",
};

interface Props {
  value: Priority;
  onChange: (p: Priority) => void;
}

export default function PrioritySelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      className="rounded-md border border-slate-300 px-2 py-2 capitalize focus:border-indigo-500 focus:outline-none"
    >
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {p[0].toUpperCase() + p.slice(1)}
        </option>
      ))}
    </select>
  );
}
