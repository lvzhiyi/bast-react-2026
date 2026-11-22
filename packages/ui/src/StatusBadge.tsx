import { Tag } from 'antd';

export interface StatusBadgeProps {
  label: string;
  color: string;
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  return <Tag color={color}>{label}</Tag>;
}
