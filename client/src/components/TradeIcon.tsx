import {
  Briefcase,
  Building2,
  Car,
  Code2,
  Monitor,
  Network,
  RadioTower,
  Utensils,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  network: Network,
  monitor: Monitor,
  video: Video,
  car: Car,
  zap: Zap,
  building: Building2,
  radio: RadioTower,
  briefcase: Briefcase,
  utensils: Utensils,
};

export default function TradeIcon({
  icon,
  size = 24,
  strokeWidth = 1.6,
  className = '',
}: {
  icon: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Code2;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
