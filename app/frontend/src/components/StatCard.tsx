import { Card, CardContent } from './Card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = 'text-[#f724de]' }: StatCardProps) {
  return (
    <Card hover>
      <CardContent className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          {trend && (
            <span className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`} style={{ backgroundColor: '#f4f0e5' }}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}