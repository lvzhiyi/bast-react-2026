export interface MetricCardProps {
  title: string;
  value: string | number;
  hint?: string;
  accentColor?: string;
}

export function MetricCard({ title, value, hint, accentColor = '#1677ff' }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1.5">{hint}</div>}
    </div>
  );
}
